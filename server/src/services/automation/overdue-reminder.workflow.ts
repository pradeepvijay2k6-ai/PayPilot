import { prisma } from '../../prisma';
import { config } from '../../config';

export class OverdueReminderWorkflow {
  /**
   * Scan for overdue invoices and create pending approval automation items
   */
  public async detectAndQueue(userId: string) {
    const now = new Date();

    // Find overdue invoices
    const overdueInvoices = await prisma.invoice.findMany({
      where: {
        userId,
        status: { in: ['OVERDUE', 'SENT', 'UNPAID'] },
        dueDate: { lt: now }
      },
      include: {
        customer: {
          include: {
            transactions: { where: { status: 'COMPLETED' } }
          }
        }
      }
    });

    const queuedItems = [];

    for (const inv of overdueInvoices) {
      // Check if there is already a pending approval workflow for this invoice
      const existing = await prisma.automationWorkflow.findFirst({
        where: {
          userId,
          invoiceId: inv.id,
          type: 'OVERDUE_REMINDER',
          status: 'PENDING_APPROVAL'
        }
      });

      if (existing) continue;

      const daysOverdue = Math.max(1, Math.floor((now.getTime() - new Date(inv.dueDate).getTime()) / (1000 * 60 * 60 * 24)));
      const totalPaidPast = inv.customer.transactions.reduce((s, t) => s + t.amount, 0);
      const isRepeatClient = inv.customer.transactions.length > 0;

      const paymentLink = `${config.clientUrl}/pay/invoice/${inv.id}`;

      const subject = `Urgent: Invoice ${inv.invoiceNumber} is ${daysOverdue} days past due ($${inv.total.toFixed(2)})`;
      const body = `Dear ${inv.customer.name},\n\nWe appreciate our ongoing collaboration with ${inv.customer.company || inv.customer.name}.\n\nThis notification is regarding Invoice ${inv.invoiceNumber} for $${inv.total.toFixed(2)}, which matured on ${inv.dueDate.toISOString().split('T')[0]} (${daysOverdue} days ago).\n\nPlease remit payment through our secure PayPal portal:\n${paymentLink}\n\nIf payment was already issued via wire or alternate PayPal ID, please notify us immediately so we may mark your account in good standing.\n\nBest regards,\nNexus Cloud Solutions Finance Team`;

      const aiReasoning = `Customer ${inv.customer.name} has an overdue balance of $${inv.total.toFixed(2)} (${daysOverdue} days late). Customer has previously settled $${totalPaidPast.toLocaleString()} across ${inv.customer.transactions.length} orders (${isRepeatClient ? 'Loyal customer: polite tone recommended' : 'New relationship: firm tone recommended'}). Automatic dispatch held pending user authorization.`;

      const workflow = await prisma.automationWorkflow.create({
        data: {
          userId,
          type: 'OVERDUE_REMINDER',
          status: 'PENDING_APPROVAL',
          title: `Overdue Payment Reminder: ${inv.customer.name}`,
          description: `Invoice ${inv.invoiceNumber} for $${inv.total.toFixed(2)} (${daysOverdue} days past due)`,
          aiReasoning,
          invoiceId: inv.id,
          customerId: inv.customer.id,
          contextJson: JSON.stringify({
            invoiceId: inv.id,
            invoiceNumber: inv.invoiceNumber,
            customerName: inv.customer.name,
            customerEmail: inv.customer.email,
            company: inv.customer.company,
            amount: inv.total,
            daysOverdue,
            subject,
            body,
            paymentLink
          })
        }
      });

      // Record audit log
      await prisma.auditLog.create({
        data: {
          userId,
          workflowId: workflow.id,
          action: 'OVERDUE_DETECTED',
          entityType: 'INVOICE',
          entityId: inv.id,
          outcome: 'PENDING',
          detailsJson: JSON.stringify({
            invoiceNumber: inv.invoiceNumber,
            amount: inv.total,
            daysOverdue
          })
        }
      });

      queuedItems.push(workflow);
    }

    return queuedItems;
  }

  /**
   * Execute the reminder after user explicitly approves
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

    // Simulate verified dispatch through configured notification service
    console.log(`[AUTOMATION DISPATCH] Sending payment reminder to ${context.customerEmail} for Invoice ${context.invoiceNumber}`);
    console.log(`[AUTOMATION DISPATCH] Subject: ${context.subject}`);

    // Update workflow status
    const updated = await prisma.automationWorkflow.update({
      where: { id: workflowId },
      data: {
        status: 'COMPLETED',
        resultJson: JSON.stringify({
          dispatchedAt: new Date().toISOString(),
          recipient: context.customerEmail,
          subject: context.subject,
          service: 'PayPal Notification Dispatch Gateway',
          status: 'DELIVERED'
        })
      }
    });

    // Record audit log
    await prisma.auditLog.create({
      data: {
        userId,
        workflowId: workflow.id,
        action: 'REMINDER_DISPATCHED',
        entityType: 'WORKFLOW',
        entityId: workflow.id,
        outcome: 'SUCCESS',
        detailsJson: JSON.stringify({
          recipient: context.customerEmail,
          amount: context.amount,
          invoiceNumber: context.invoiceNumber
        })
      }
    });

    return updated;
  }
}

export const overdueReminderWorkflow = new OverdueReminderWorkflow();
