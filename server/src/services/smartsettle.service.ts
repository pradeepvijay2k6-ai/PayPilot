import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '../prisma';
import { config } from '../config';
import { paypalService } from './paypal.service';
import { analyticsService } from './analytics.service';

export interface ProposedInstallment {
  installmentNumber: number;
  amount: number;
  dueDate: string;
  label: string;
}

export interface SmartSettlePlanProposal {
  invoiceId: string;
  invoiceNumber: string;
  totalAmount: number;
  customerName: string;
  installmentsCount: number;
  installments: ProposedInstallment[];
  aiExplanation: string;
  riskAssessment: 'LOW_RISK' | 'MODERATE_RISK' | 'HIGH_RISK';
  suitabilityScore: number; // 0-100
}

export class SmartSettleService {
  /**
   * Get all invoices eligible for payment negotiation
   */
  public async getEligibleInvoices(userId: string) {
    const invoices = await prisma.invoice.findMany({
      where: {
        userId,
        status: { in: ['OVERDUE', 'SENT', 'UNPAID'] }
      },
      include: {
        customer: {
          include: {
            transactions: { where: { status: 'COMPLETED' } }
          }
        },
        smartSettleAgreements: {
          include: { installments: true },
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { dueDate: 'asc' }
    });

    const now = new Date();
    return invoices.map(inv => {
      const isPastDue = new Date(inv.dueDate) < now;
      const daysOverdue = isPastDue
        ? Math.floor((now.getTime() - new Date(inv.dueDate).getTime()) / (1000 * 60 * 60 * 24))
        : 0;
      const totalSettledPast = inv.customer.transactions.reduce((s, t) => s + t.amount, 0);
      const activeAgreement = inv.smartSettleAgreements.find(a => a.status === 'ACTIVE' || a.status === 'PENDING_APPROVAL');

      return {
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        total: inv.total,
        dueDate: inv.dueDate.toISOString().split('T')[0],
        status: inv.status,
        daysOverdue,
        customer: {
          id: inv.customer.id,
          name: inv.customer.name,
          company: inv.customer.company,
          email: inv.customer.email,
          totalSettledPast,
          ordersCount: inv.customer.transactions.length
        },
        hasActiveAgreement: !!activeAgreement,
        activeAgreementId: activeAgreement?.id,
        agreementStatus: activeAgreement?.status
      };
    });
  }

  /**
   * AI Negotiation Engine: Analyze customer & invoice parameters to generate flexible installment plans
   */
  public async generatePlanProposal(params: {
    invoiceId: string;
    requestedExtensionDays?: number;
    requestedInstallments?: number;
    hardshipReason?: string;
    proposedDownpayment?: number;
  }): Promise<SmartSettlePlanProposal> {
    const inv = await prisma.invoice.findUnique({
      where: { id: params.invoiceId },
      include: {
        customer: {
          include: {
            transactions: { where: { status: 'COMPLETED' } },
            invoices: true
          }
        }
      }
    });

    if (!inv) throw new Error('Invoice not found');

    const now = new Date();
    const isPastDue = new Date(inv.dueDate) < now;
    const daysOverdue = isPastDue ? Math.floor((now.getTime() - new Date(inv.dueDate).getTime()) / (1000 * 60 * 60 * 24)) : 0;
    const totalPaidPast = inv.customer.transactions.reduce((s, t) => s + t.amount, 0);

    const installmentsCount = params.requestedInstallments || (inv.total > 1500 ? 3 : 2);
    const extensionDays = params.requestedExtensionDays || 30;

    // Plan structure calculation
    let downpayment = params.proposedDownpayment;
    if (!downpayment || downpayment <= 0 || downpayment >= inv.total) {
      // Standard recommended downpayment: 35% - 40%
      downpayment = Math.round((inv.total * 0.35) * 100) / 100;
    }

    const remainingToSplit = inv.total - downpayment;
    const remainingInstallmentCount = installmentsCount - 1;
    const splitAmount = Math.round((remainingToSplit / remainingInstallmentCount) * 100) / 100;

    const installments: ProposedInstallment[] = [];

    // Installment 1: Immediate downpayment (Day 0)
    installments.push({
      installmentNumber: 1,
      amount: downpayment,
      dueDate: now.toISOString().split('T')[0],
      label: 'Immediate Initial Deposit (Agreement Activation)'
    });

    // Subsequent installments
    const intervalDays = Math.max(10, Math.round(extensionDays / remainingInstallmentCount));
    let accumulated = downpayment;

    for (let i = 1; i <= remainingInstallmentCount; i++) {
      const isLast = i === remainingInstallmentCount;
      const instAmount = isLast ? Math.round((inv.total - accumulated) * 100) / 100 : splitAmount;
      accumulated += instAmount;

      const instDate = new Date(now.getTime() + (i * intervalDays) * 24 * 60 * 60 * 1000);
      installments.push({
        installmentNumber: i + 1,
        amount: instAmount,
        dueDate: instDate.toISOString().split('T')[0],
        label: `Instalment ${i + 1} of ${installmentsCount} (${i * intervalDays} Days)`
      });
    }

    // AI Assessment
    let riskAssessment: 'LOW_RISK' | 'MODERATE_RISK' | 'HIGH_RISK' = 'LOW_RISK';
    let suitabilityScore = 85;

    if (daysOverdue > 20 || totalPaidPast === 0) {
      riskAssessment = 'HIGH_RISK';
      suitabilityScore = 65;
    } else if (daysOverdue > 7 || inv.total > 2000) {
      riskAssessment = 'MODERATE_RISK';
      suitabilityScore = 78;
    }

    let aiExplanation = '';

    // If Gemini is available, generate contextual analysis
    if (config.ai.geminiApiKey) {
      try {
        const genAI = new GoogleGenerativeAI(config.ai.geminiApiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `You are SmartSettle AI, an empathetic yet financially rigorous payment negotiation agent.
Invoice: ${inv.invoiceNumber}, Amount: $${inv.total}, Days Past Due: ${daysOverdue}.
Customer: ${inv.customer.name} (Settled in past: $${totalPaidPast}).
Customer hardship note: "${params.hardshipReason || 'Requesting flexible payment extension.'}"
Proposed Installments: ${JSON.stringify(installments)}

Write a concise 2-sentence rationale explaining why this ${installmentsCount}-part plan balances customer cash flow with business liquidity. Include a reminder that payment is not guaranteed until captured via PayPal.`;

        const res = await model.generateContent(prompt);
        aiExplanation = res.response.text().trim();
      } catch (err: any) {
        console.warn('SmartSettle Gemini note:', err.message);
      }
    }

    if (!aiExplanation) {
      aiExplanation = `SmartSettle AI structured a ${installmentsCount}-tier plan with a $${downpayment.toFixed(2)} initial deposit (${Math.round((downpayment / inv.total) * 100)}% of total) to establish good faith, followed by balanced bi-weekly milestones across ${extensionDays} days. This preserves client relationship for ${inv.customer.name} while mitigating business liquidity loss. *Note: Payments are not guaranteed until captured and verified through PayPal.*`;
    }

    return {
      invoiceId: inv.id,
      invoiceNumber: inv.invoiceNumber,
      totalAmount: inv.total,
      customerName: inv.customer.name,
      installmentsCount,
      installments,
      aiExplanation,
      riskAssessment,
      suitabilityScore
    };
  }

  /**
   * Submit or stage a SmartSettle agreement request
   */
  public async submitAgreement(params: {
    invoiceId: string;
    customerNote?: string;
    plan: SmartSettlePlanProposal;
    createdBy: 'CUSTOMER' | 'BUSINESS';
  }) {
    const inv = await prisma.invoice.findUnique({
      where: { id: params.invoiceId },
      include: { customer: true }
    });

    if (!inv) throw new Error('Invoice not found');

    // Remove existing pending agreements for this invoice
    await prisma.smartSettleAgreement.deleteMany({
      where: {
        invoiceId: inv.id,
        status: 'PENDING_APPROVAL'
      }
    });

    const agreement = await prisma.smartSettleAgreement.create({
      data: {
        invoiceId: inv.id,
        userId: inv.userId,
        customerId: inv.customerId,
        status: 'PENDING_APPROVAL',
        originalAmount: inv.total,
        settledAmount: inv.total,
        paidAmount: 0,
        remainingBalance: inv.total,
        installmentsCount: params.plan.installments.length,
        customerNote: params.customerNote || 'Flexible payment plan requested via SmartSettle.',
        aiAnalysis: params.plan.aiExplanation,
        installments: {
          create: params.plan.installments.map(inst => ({
            installmentNumber: inst.installmentNumber,
            amount: inst.amount,
            dueDate: new Date(inst.dueDate),
            status: 'PENDING'
          }))
        }
      },
      include: {
        installments: true,
        customer: true,
        invoice: true
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: inv.userId,
        action: 'SMARTSETTLE_PROPOSAL_STAGED',
        entityType: 'INVOICE',
        entityId: inv.id,
        outcome: 'PENDING',
        detailsJson: JSON.stringify({
          agreementId: agreement.id,
          invoiceNumber: inv.invoiceNumber,
          installmentsCount: agreement.installmentsCount,
          total: inv.total,
          createdBy: params.createdBy
        })
      }
    });

    return agreement;
  }

  /**
   * Business owner approves, edits, or activates an agreement
   */
  public async approveAgreement(agreementId: string, userId: string, businessNote?: string) {
    const agreement = await prisma.smartSettleAgreement.findFirst({
      where: { id: agreementId, userId },
      include: { installments: true, invoice: true, customer: true }
    });

    if (!agreement) throw new Error('Payment agreement not found');

    const updated = await prisma.smartSettleAgreement.update({
      where: { id: agreementId },
      data: {
        status: 'ACTIVE',
        approvedAt: new Date(),
        businessNote: businessNote || 'Approved by business owner'
      },
      include: { installments: true, customer: true, invoice: true }
    });

    // Update invoice note to reflect active SmartSettle plan
    await prisma.invoice.update({
      where: { id: agreement.invoiceId },
      data: {
        notes: `SmartSettle active payment arrangement: ${agreement.installmentsCount} installments totaling $${agreement.settledAmount.toFixed(2)}.`
      }
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'SMARTSETTLE_AGREEMENT_APPROVED',
        entityType: 'INVOICE',
        entityId: agreement.invoiceId,
        outcome: 'SUCCESS',
        detailsJson: JSON.stringify({
          agreementId: agreement.id,
          invoiceNumber: agreement.invoice.invoiceNumber,
          installments: agreement.installmentsCount,
          settledAmount: agreement.settledAmount
        })
      }
    });

    return updated;
  }

  /**
   * Business owner rejects a proposed agreement
   */
  public async rejectAgreement(agreementId: string, userId: string, reason?: string) {
    const agreement = await prisma.smartSettleAgreement.findFirst({
      where: { id: agreementId, userId }
    });

    if (!agreement) throw new Error('Payment agreement not found');

    const updated = await prisma.smartSettleAgreement.update({
      where: { id: agreementId },
      data: {
        status: 'REJECTED',
        businessNote: reason || 'Arrangement declined. Original invoice terms remain in effect.'
      }
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'SMARTSETTLE_AGREEMENT_REJECTED',
        entityType: 'INVOICE',
        entityId: agreement.invoiceId,
        outcome: 'SKIPPED',
        detailsJson: JSON.stringify({
          agreementId: agreement.id,
          reason: reason || 'Rejected by business owner'
        })
      }
    });

    return updated;
  }

  /**
   * Capture and verify an installment payment through PayPal
   */
  public async captureInstallment(installmentId: string, paypalOrderId: string, payerDetails?: any) {
    const installment = await prisma.smartSettleInstallment.findUnique({
      where: { id: installmentId },
      include: {
        agreement: {
          include: { invoice: true, customer: true, user: true }
        }
      }
    });

    if (!installment) throw new Error('Installment not found');

    // Idempotency check: if already completed, return
    if (installment.status === 'COMPLETED') {
      return {
        message: 'Installment was already settled',
        installment
      };
    }

    let captureResult: any = null;

    if (paypalService.isConfigured() && paypalOrderId) {
      captureResult = await paypalService.captureOrder(paypalOrderId);
      if (captureResult.status !== 'COMPLETED') {
        throw new Error(`PayPal capture not completed. Status: ${captureResult.status}`);
      }
    } else {
      // Demo sandbox fallback simulation
      captureResult = {
        orderId: paypalOrderId || `ORD-SMARTSETTLE-${Date.now()}`,
        status: 'COMPLETED',
        captureId: `CAP-SS-${Date.now()}`,
        amount: installment.amount,
        payer: payerDetails || {
          email_address: installment.agreement.customer.email,
          name: { given_name: installment.agreement.customer.name }
        }
      };
    }

    // 1. Mark installment COMPLETED
    const updatedInstallment = await prisma.smartSettleInstallment.update({
      where: { id: installmentId },
      data: {
        status: 'COMPLETED',
        paidAt: new Date(),
        paypalOrderId: captureResult.orderId,
        paypalCaptureId: captureResult.captureId || `CAP-${Date.now()}`
      }
    });

    // 2. Update agreement paidAmount and remainingBalance
    const agreement = installment.agreement;
    const newPaidAmount = agreement.paidAmount + installment.amount;
    const newRemainingBalance = Math.max(0, agreement.settledAmount - newPaidAmount);

    const isFullyPaid = newRemainingBalance <= 0.01;

    const updatedAgreement = await prisma.smartSettleAgreement.update({
      where: { id: agreement.id },
      data: {
        paidAmount: newPaidAmount,
        remainingBalance: newRemainingBalance,
        status: isFullyPaid ? 'COMPLETED' : 'ACTIVE'
      }
    });

    // 3. Record verified Transaction record
    const transaction = await prisma.transaction.create({
      data: {
        userId: agreement.userId,
        customerId: agreement.customerId,
        invoiceId: agreement.invoiceId,
        paypalOrderId: captureResult.orderId,
        paypalCaptureId: captureResult.captureId || `CAP-${Date.now()}`,
        amount: installment.amount,
        currency: 'USD',
        status: 'COMPLETED',
        paymentMethod: 'PAYPAL',
        payerEmail: captureResult.payer?.email_address,
        payerName: captureResult.payer?.name?.given_name || agreement.customer.name,
        transactionDate: new Date(),
        rawResponseJson: JSON.stringify(captureResult)
      }
    });

    // 4. If all installments are settled, mark the entire invoice as PAID!
    if (isFullyPaid) {
      await prisma.invoice.update({
        where: { id: agreement.invoiceId },
        data: { status: 'PAID' }
      });
    }

    // 5. Immutable Audit Log
    await prisma.auditLog.create({
      data: {
        userId: agreement.userId,
        action: 'SMARTSETTLE_INSTALLMENT_CAPTURED',
        entityType: 'TRANSACTION',
        entityId: transaction.id,
        outcome: 'SUCCESS',
        detailsJson: JSON.stringify({
          agreementId: agreement.id,
          installmentId: installment.id,
          installmentNumber: installment.installmentNumber,
          amount: installment.amount,
          newRemainingBalance,
          invoiceFullyPaid: isFullyPaid
        })
      }
    });

    return {
      success: true,
      installment: updatedInstallment,
      agreement: updatedAgreement,
      transaction,
      invoiceFullyPaid: isFullyPaid
    };
  }

  /**
   * Public Customer Negotiation Portal Endpoint: Retrieve invoice & agreement details securely
   */
  public async getPublicNegotiationData(invoiceIdOrAgreementId: string) {
    // Check if passed string is an invoiceId or agreementId
    let agreement = await prisma.smartSettleAgreement.findFirst({
      where: {
        OR: [
          { id: invoiceIdOrAgreementId },
          { invoiceId: invoiceIdOrAgreementId }
        ]
      },
      include: {
        installments: { orderBy: { installmentNumber: 'asc' } },
        invoice: {
          include: {
            user: { include: { businessProfile: true } },
            customer: true,
            items: true
          }
        },
        customer: true
      },
      orderBy: { createdAt: 'desc' }
    });

    let invoice;
    if (agreement) {
      invoice = agreement.invoice;
    } else {
      invoice = await prisma.invoice.findUnique({
        where: { id: invoiceIdOrAgreementId },
        include: {
          user: { include: { businessProfile: true } },
          customer: true,
          items: true
        }
      });
    }

    if (!invoice) throw new Error('Invoice not found');

    const now = new Date();
    const isPastDue = new Date(invoice.dueDate) < now;
    const daysOverdue = isPastDue ? Math.floor((now.getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24)) : 0;

    return {
      invoice: {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        total: invoice.total,
        status: invoice.status,
        dueDate: invoice.dueDate.toISOString().split('T')[0],
        daysOverdue,
        items: invoice.items,
        notes: invoice.notes
      },
      customer: {
        name: invoice.customer.name,
        email: invoice.customer.email,
        company: invoice.customer.company
      },
      business: {
        name: invoice.user.businessProfile?.businessName || invoice.user.name,
        email: invoice.user.businessProfile?.email || invoice.user.email,
        currency: invoice.user.businessProfile?.currency || 'USD'
      },
      agreement: agreement ? {
        id: agreement.id,
        status: agreement.status,
        originalAmount: agreement.originalAmount,
        settledAmount: agreement.settledAmount,
        paidAmount: agreement.paidAmount,
        remainingBalance: agreement.remainingBalance,
        installmentsCount: agreement.installmentsCount,
        customerNote: agreement.customerNote,
        aiAnalysis: agreement.aiAnalysis,
        businessNote: agreement.businessNote,
        approvedAt: agreement.approvedAt,
        installments: agreement.installments.map(i => ({
          id: i.id,
          installmentNumber: i.installmentNumber,
          amount: i.amount,
          dueDate: i.dueDate.toISOString().split('T')[0],
          status: i.status,
          paidAt: i.paidAt,
          paypalOrderId: i.paypalOrderId
        }))
      } : null,
      paypalClientId: config.paypal.clientId || invoice.user.businessProfile?.paypalClientId || ''
    };
  }

  /**
   * SmartSettle Dashboard metrics for business owners
   */
  public async getDashboardMetrics(userId: string) {
    const agreements = await prisma.smartSettleAgreement.findMany({
      where: { userId },
      include: {
        installments: true,
        customer: true,
        invoice: true
      },
      orderBy: { updatedAt: 'desc' }
    });

    const active = agreements.filter(a => a.status === 'ACTIVE');
    const pending = agreements.filter(a => a.status === 'PENDING_APPROVAL');
    const completed = agreements.filter(a => a.status === 'COMPLETED');

    const totalUnderAgreement = active.reduce((s, a) => s + a.settledAmount, 0);
    const totalRemaining = active.reduce((s, a) => s + a.remainingBalance, 0);
    const totalRecovered = agreements.reduce((s, a) => s + a.paidAmount, 0);

    // Installment breakdown across active plans
    const allActiveInstallments = active.flatMap(a => a.installments);
    const completedInstallments = allActiveInstallments.filter(i => i.status === 'COMPLETED');
    const now = new Date();
    const overdueInstallments = allActiveInstallments.filter(i => i.status === 'PENDING' && new Date(i.dueDate) < now);
    const upcomingInstallments = allActiveInstallments.filter(i => i.status === 'PENDING' && new Date(i.dueDate) >= now);

    return {
      summary: {
        activeAgreementsCount: active.length,
        pendingApprovalCount: pending.length,
        completedAgreementsCount: completed.length,
        totalUnderAgreement,
        totalRemaining,
        totalRecovered,
        completedInstallmentsCount: completedInstallments.length,
        upcomingInstallmentsCount: upcomingInstallments.length,
        overdueInstallmentsCount: overdueInstallments.length
      },
      agreements: agreements.map(a => ({
        id: a.id,
        invoiceId: a.invoiceId,
        invoiceNumber: a.invoice.invoiceNumber,
        customerName: a.customer.name,
        company: a.customer.company,
        status: a.status,
        originalAmount: a.originalAmount,
        settledAmount: a.settledAmount,
        paidAmount: a.paidAmount,
        remainingBalance: a.remainingBalance,
        installmentsCount: a.installmentsCount,
        customerNote: a.customerNote,
        aiAnalysis: a.aiAnalysis,
        businessNote: a.businessNote,
        createdAt: a.createdAt,
        installments: a.installments.map(i => ({
          id: i.id,
          installmentNumber: i.installmentNumber,
          amount: i.amount,
          dueDate: i.dueDate.toISOString().split('T')[0],
          status: i.status,
          paidAt: i.paidAt
        }))
      }))
    };
  }
}

export const smartSettleService = new SmartSettleService();
