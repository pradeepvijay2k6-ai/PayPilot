import { prisma } from '../../prisma';

export class ReconciliationWorkflow {
  /**
   * Scan for completed transactions that lack an invoice link, or unmatched PayPal payments
   */
  public async detectAndQueue(userId: string) {
    const unlinkedTransactions = await prisma.transaction.findMany({
      where: {
        userId,
        status: 'COMPLETED',
        invoiceId: null
      },
      include: { customer: true }
    });

    const openInvoices = await prisma.invoice.findMany({
      where: {
        userId,
        status: { in: ['SENT', 'UNPAID', 'OVERDUE'] }
      },
      include: { customer: true }
    });

    const queuedItems = [];

    for (const tx of unlinkedTransactions) {
      // Check if workflow already queued for this transaction
      const existing = await prisma.automationWorkflow.findFirst({
        where: {
          userId,
          type: 'RECONCILIATION',
          contextJson: { contains: tx.id },
          status: 'PENDING_APPROVAL'
        }
      });

      if (existing) continue;

      // Match strategy:
      // 1. Exact amount match for same customer
      let matchedInvoice = openInvoices.find(
        inv => tx.customerId && inv.customerId === tx.customerId && Math.abs(inv.total - tx.amount) < 0.01
      );

      // 2. Or exact amount match across any open invoice if customer is unlinked
      if (!matchedInvoice) {
        matchedInvoice = openInvoices.find(inv => Math.abs(inv.total - tx.amount) < 0.01);
      }

      if (matchedInvoice) {
        const aiReasoning = `High-confidence match: Settled payment of $${tx.amount.toFixed(2)} aligns with open Invoice ${matchedInvoice.invoiceNumber} (Amount: $${matchedInvoice.total.toFixed(2)}, Customer: ${matchedInvoice.customer.name}). Reconciling will mark the invoice as PAID and update ledger records.`;

        const workflow = await prisma.automationWorkflow.create({
          data: {
            userId,
            type: 'RECONCILIATION',
            status: 'PENDING_APPROVAL',
            title: `Reconcile Payment: $${tx.amount.toFixed(2)} → ${matchedInvoice.invoiceNumber}`,
            description: `Match PayPal Transaction (${tx.paypalOrderId || tx.id.slice(0, 8)}) with Invoice ${matchedInvoice.invoiceNumber}`,
            aiReasoning,
            invoiceId: matchedInvoice.id,
            customerId: matchedInvoice.customerId,
            contextJson: JSON.stringify({
              transactionId: tx.id,
              amount: tx.amount,
              paypalOrderId: tx.paypalOrderId,
              invoiceId: matchedInvoice.id,
              invoiceNumber: matchedInvoice.invoiceNumber,
              customerName: matchedInvoice.customer.name,
              matchConfidence: 'HIGH'
            })
          }
        });

        await prisma.auditLog.create({
          data: {
            userId,
            workflowId: workflow.id,
            action: 'MATCHED_FOR_RECONCILIATION',
            entityType: 'TRANSACTION',
            entityId: tx.id,
            outcome: 'PENDING',
            detailsJson: JSON.stringify({
              transactionId: tx.id,
              invoiceId: matchedInvoice.id,
              confidence: 'HIGH'
            })
          }
        });

        queuedItems.push(workflow);
      } else {
        // Flag for manual review
        const aiReasoning = `Manual Review Required: Received settled PayPal payment of $${tx.amount.toFixed(2)} (${tx.paypalOrderId || tx.id.slice(0, 8)}), but no open invoice matches this exact amount. Manual allocation required before ledger assignment.`;

        const workflow = await prisma.automationWorkflow.create({
          data: {
            userId,
            type: 'RECONCILIATION',
            status: 'PENDING_APPROVAL',
            title: `Manual Review: Unmatched Payment ($${tx.amount.toFixed(2)})`,
            description: `Payment from ${tx.payerName || tx.customer?.name || 'Customer'} has no matching invoice`,
            aiReasoning,
            customerId: tx.customerId || undefined,
            contextJson: JSON.stringify({
              transactionId: tx.id,
              amount: tx.amount,
              paypalOrderId: tx.paypalOrderId,
              payerName: tx.payerName || tx.customer?.name || 'Unknown',
              matchConfidence: 'UNMATCHED_REQUIRES_MANUAL_REVIEW'
            })
          }
        });

        await prisma.auditLog.create({
          data: {
            userId,
            workflowId: workflow.id,
            action: 'UNMATCHED_PAYMENT_FLAGGED',
            entityType: 'TRANSACTION',
            entityId: tx.id,
            outcome: 'PENDING',
            detailsJson: JSON.stringify({
              transactionId: tx.id,
              amount: tx.amount,
              reason: 'No open invoice with matching amount'
            })
          }
        });

        queuedItems.push(workflow);
      }
    }

    return queuedItems;
  }

  /**
   * Execute reconciliation after user approval
   */
  public async execute(workflowId: string, editedContext: any, userId: string) {
    const workflow = await prisma.automationWorkflow.findFirst({
      where: { id: workflowId, userId }
    });

    if (!workflow) throw new Error('Workflow not found');
    if (workflow.status !== 'PENDING_APPROVAL') {
      throw new Error(`Workflow cannot be executed in status ${workflow.status}`);
    }

    const context = editedContext || JSON.parse(workflow.contextJson);

    // If an invoice is targeted, mark it PAID and link transaction
    if (context.invoiceId) {
      await prisma.invoice.update({
        where: { id: context.invoiceId },
        data: { status: 'PAID' }
      });

      if (context.transactionId) {
        await prisma.transaction.update({
          where: { id: context.transactionId },
          data: { invoiceId: context.invoiceId }
        });
      }
    }

    const updated = await prisma.automationWorkflow.update({
      where: { id: workflowId },
      data: {
        status: 'COMPLETED',
        resultJson: JSON.stringify({
          reconciledAt: new Date().toISOString(),
          invoiceId: context.invoiceId,
          invoiceNumber: context.invoiceNumber,
          transactionId: context.transactionId,
          amount: context.amount,
          status: 'RECONCILED'
        })
      }
    });

    await prisma.auditLog.create({
      data: {
        userId,
        workflowId: workflow.id,
        action: 'PAYMENT_RECONCILED',
        entityType: 'INVOICE',
        entityId: context.invoiceId || context.transactionId,
        outcome: 'SUCCESS',
        detailsJson: JSON.stringify({
          invoiceNumber: context.invoiceNumber,
          amount: context.amount
        })
      }
    });

    return updated;
  }
}

export const reconciliationWorkflow = new ReconciliationWorkflow();
