import { prisma } from '../../prisma';
import { analyticsService } from '../analytics.service';
import { config } from '../../config';

export interface OverdueCustomerAction {
  customerId: string;
  customerName: string;
  company: string;
  overdueInvoicesCount: number;
  totalOverdueAmount: number;
  avgDelayDays: number;
  reliabilityScore: number;
  urgency: 'HIGH' | 'MEDIUM' | 'LOW';
  recommendedContactSequence: number;
  draftReminder: {
    subject: string;
    body: string;
    targetInvoiceNumber: string;
    targetAmount: number;
  };
}

export interface CollectionsAgentFinding {
  agent: 'Collections Agent';
  status: 'OPTIMAL' | 'WARNING' | 'ALERT';
  summary: string;
  metrics: {
    totalOverdueAmount: number;
    overdueInvoicesCount: number;
    delinquentCustomersCount: number;
    averageRecoveryDays: number;
  };
  prioritizedCustomers: OverdueCustomerAction[];
  recoveryStrategy: string[];
}

export class CollectionsAgent {
  public async analyze(userId: string): Promise<CollectionsAgentFinding> {
    const delayAnalysis = await analyticsService.getCustomerDelayAnalysis(userId);
    const overdueCustomers = delayAnalysis.filter(c => c.overdueCount > 0);

    const now = new Date();
    const invoices = await prisma.invoice.findMany({
      where: {
        userId,
        status: { in: ['OVERDUE', 'SENT', 'UNPAID'] }
      },
      include: { customer: true },
      orderBy: { dueDate: 'asc' }
    });

    const overdueInvoices = invoices.filter(inv => {
      return inv.status === 'OVERDUE' || (new Date(inv.dueDate) < now);
    });

    const totalOverdueAmount = overdueInvoices.reduce((sum, inv) => sum + inv.total, 0);

    // Calculate urgency and priority sequence
    // Sort logic: High overdue amount + high delay days + low reliability score
    const prioritizedCustomers: OverdueCustomerAction[] = overdueCustomers.map((cust, idx) => {
      let urgency: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
      if (cust.totalOverdueAmount > 1000 || cust.avgDelayDays > 14 || cust.reliabilityScore < 60) {
        urgency = 'HIGH';
      } else if (cust.totalOverdueAmount > 400 || cust.avgDelayDays > 7) {
        urgency = 'MEDIUM';
      }

      // Pick worst overdue invoice for this customer
      const targetInvoice = cust.overdueInvoices[0] || {
        invoiceNumber: 'INV-PENDING',
        amount: cust.totalOverdueAmount
      };

      const paymentLink = `${config.clientUrl}/pay/invoice/${targetInvoice.id || ''}`;

      const draftReminder = {
        subject: `Payment Reminder: Urgent review required for Invoice ${targetInvoice.invoiceNumber}`,
        body: `Dear ${cust.name},\n\nWe appreciate your continued partnership with Nexus Cloud Solutions.\n\nOur accounts ledger indicates that Invoice ${targetInvoice.invoiceNumber} in the amount of $${targetInvoice.amount.toFixed(2)} is now past due by ${cust.avgDelayDays} day(s).\n\nPlease settle this invoice via our secure PayPal portal:\n${paymentLink}\n\nIf you have already processed this transaction, please reply with the PayPal confirmation number so we may reconcile our records.\n\nWarm regards,\nAlex Morgan — Financial Operations`,
        targetInvoiceNumber: targetInvoice.invoiceNumber,
        targetAmount: targetInvoice.amount
      };

      return {
        customerId: cust.customerId,
        customerName: cust.name,
        company: cust.company,
        overdueInvoicesCount: cust.overdueCount,
        totalOverdueAmount: cust.totalOverdueAmount,
        avgDelayDays: cust.avgDelayDays,
        reliabilityScore: cust.reliabilityScore,
        urgency,
        recommendedContactSequence: idx + 1,
        draftReminder
      };
    }).sort((a, b) => {
      // Prioritize HIGH urgency first, then total overdue amount descending
      const urgencyScore = { HIGH: 3, MEDIUM: 2, LOW: 1 };
      if (urgencyScore[b.urgency] !== urgencyScore[a.urgency]) {
        return urgencyScore[b.urgency] - urgencyScore[a.urgency];
      }
      return b.totalOverdueAmount - a.totalOverdueAmount;
    }).map((c, i) => ({ ...c, recommendedContactSequence: i + 1 }));

    const avgRecoveryDays = overdueCustomers.length > 0
      ? Math.round(overdueCustomers.reduce((acc, c) => acc + c.avgDelayDays, 0) / overdueCustomers.length)
      : 0;

    const recoveryStrategy: string[] = [];
    if (prioritizedCustomers.length > 0) {
      const topPriority = prioritizedCustomers[0];
      recoveryStrategy.push(`Contact Sequence #1: Initiate immediate follow-up with ${topPriority.customerName} ($${topPriority.totalOverdueAmount.toLocaleString()} overdue, ${topPriority.avgDelayDays} days past due).`);
      recoveryStrategy.push(`Automate Net-7 payment escalation notices with direct PayPal checkout links.`);
      recoveryStrategy.push(`Enforce credit hold or paused milestone delivery for accounts with reliability scores below 60/100.`);
    } else {
      recoveryStrategy.push('No active payment delinquencies detected. Portfolio collections health is optimal.');
    }

    const status = totalOverdueAmount > 2000 ? 'ALERT' : totalOverdueAmount > 0 ? 'WARNING' : 'OPTIMAL';

    return {
      agent: 'Collections Agent',
      status,
      summary: `Identified ${overdueInvoices.length} delinquent invoice(s) totaling $${totalOverdueAmount.toLocaleString()} across ${overdueCustomers.length} client account(s). Average payment delay is ${avgRecoveryDays} days past contractual due date.`,
      metrics: {
        totalOverdueAmount,
        overdueInvoicesCount: overdueInvoices.length,
        delinquentCustomersCount: overdueCustomers.length,
        averageRecoveryDays: avgRecoveryDays
      },
      prioritizedCustomers,
      recoveryStrategy
    };
  }
}

export const collectionsAgent = new CollectionsAgent();
