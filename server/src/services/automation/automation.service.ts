import { prisma } from '../../prisma';
import { overdueReminderWorkflow } from './overdue-reminder.workflow';
import { paymentProcessingWorkflow } from './payment-processing.workflow';
import { reconciliationWorkflow } from './reconciliation.workflow';

export class AutomationService {
  /**
   * Run automated detection across all workflows and queue items needing approval
   */
  public async detectAndQueueAll(userId: string) {
    const [overdueResults, reconciliationResults] = await Promise.all([
      overdueReminderWorkflow.detectAndQueue(userId),
      reconciliationWorkflow.detectAndQueue(userId)
    ]);

    return {
      overdueQueued: overdueResults.length,
      reconciliationQueued: reconciliationResults.length,
      totalQueued: overdueResults.length + reconciliationResults.length
    };
  }

  /**
   * Fetch current Approval Queue
   */
  public async getApprovalQueue(userId: string) {
    const items = await prisma.automationWorkflow.findMany({
      where: {
        userId,
        status: 'PENDING_APPROVAL'
      },
      include: {
        customer: true,
        invoice: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return items.map(item => ({
      id: item.id,
      type: item.type,
      status: item.status,
      title: item.title,
      description: item.description,
      aiReasoning: item.aiReasoning,
      createdAt: item.createdAt,
      customerName: item.customer?.name || 'Client',
      company: item.customer?.company || 'Business',
      invoiceNumber: item.invoice?.invoiceNumber,
      amount: item.invoice?.total,
      context: JSON.parse(item.contextJson)
    }));
  }

  /**
   * Explicit user approval of a workflow item
   */
  public async approve(workflowId: string, userId: string, editedContext?: any) {
    const workflow = await prisma.automationWorkflow.findFirst({
      where: { id: workflowId, userId }
    });

    if (!workflow) {
      throw new Error('Workflow not found');
    }

    if (workflow.status !== 'PENDING_APPROVAL') {
      throw new Error(`Cannot approve workflow with status ${workflow.status}`);
    }

    let result;
    if (workflow.type === 'OVERDUE_REMINDER') {
      result = await overdueReminderWorkflow.execute(workflowId, editedContext, userId);
    } else if (workflow.type === 'PAYMENT_PROCESSING') {
      result = await paymentProcessingWorkflow.execute(workflowId, editedContext, userId);
    } else if (workflow.type === 'RECONCILIATION') {
      result = await reconciliationWorkflow.execute(workflowId, editedContext, userId);
    } else {
      throw new Error(`Unsupported workflow type ${workflow.type}`);
    }

    return result;
  }

  /**
   * User rejection of a workflow item
   */
  public async reject(workflowId: string, userId: string, reason?: string) {
    const workflow = await prisma.automationWorkflow.findFirst({
      where: { id: workflowId, userId }
    });

    if (!workflow) throw new Error('Workflow not found');

    const updated = await prisma.automationWorkflow.update({
      where: { id: workflowId },
      data: {
        status: 'REJECTED',
        resultJson: JSON.stringify({
          rejectedAt: new Date().toISOString(),
          reason: reason || 'Rejected by business owner in Approval Center'
        })
      }
    });

    await prisma.auditLog.create({
      data: {
        userId,
        workflowId: workflow.id,
        action: 'WORKFLOW_REJECTED',
        entityType: 'WORKFLOW',
        entityId: workflow.id,
        outcome: 'SKIPPED',
        detailsJson: JSON.stringify({
          reason: reason || 'User rejection',
          type: workflow.type
        })
      }
    });

    return updated;
  }

  /**
   * Fetch complete audit log and workflow history
   */
  public async getWorkflowHistory(userId: string) {
    const workflows = await prisma.automationWorkflow.findMany({
      where: { userId },
      include: { customer: true, invoice: true },
      orderBy: { updatedAt: 'desc' },
      take: 50
    });

    const auditLogs = await prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    return {
      workflows: workflows.map(w => ({
        id: w.id,
        type: w.type,
        status: w.status,
        title: w.title,
        description: w.description,
        aiReasoning: w.aiReasoning,
        customerName: w.customer?.name,
        invoiceNumber: w.invoice?.invoiceNumber,
        result: w.resultJson ? JSON.parse(w.resultJson) : null,
        createdAt: w.createdAt,
        updatedAt: w.updatedAt
      })),
      auditLogs: auditLogs.map(a => ({
        id: a.id,
        action: a.action,
        entityType: a.entityType,
        entityId: a.entityId,
        outcome: a.outcome,
        details: a.detailsJson ? JSON.parse(a.detailsJson) : null,
        createdAt: a.createdAt
      }))
    };
  }
}

export const automationService = new AutomationService();
