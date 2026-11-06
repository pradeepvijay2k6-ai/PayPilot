import { Request, Response } from 'express';
import { automationService } from '../services/automation/automation.service';
import { paymentProcessingWorkflow } from '../services/automation/payment-processing.workflow';

export class AutomationController {
  public async detectWorkflows(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const result = await automationService.detectAndQueueAll(userId);
      return res.json({
        message: `Detection cycle completed: ${result.totalQueued} items identified for approval.`,
        ...result
      });
    } catch (err: any) {
      console.error('detectWorkflows error:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  public async getApprovalQueue(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const queue = await automationService.getApprovalQueue(userId);
      return res.json({ queue });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  public async approveWorkflow(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;
      const { editedContext } = req.body;
      const result = await automationService.approve(id, userId, editedContext);
      return res.json({ success: true, result });
    } catch (err: any) {
      console.error('approveWorkflow error:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  public async rejectWorkflow(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;
      const { reason } = req.body;
      const result = await automationService.reject(id, userId, reason);
      return res.json({ success: true, result });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  public async stagePaymentWorkflow(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { customerName, amount, description, invoiceId } = req.body;
      if (!customerName || !amount) {
        return res.status(400).json({ error: 'Customer name and amount are required' });
      }
      const workflow = await paymentProcessingWorkflow.prepare(userId, {
        customerName,
        amount: parseFloat(amount),
        description: description || 'Payment request',
        invoiceId
      });
      return res.status(201).json({ success: true, workflow });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  public async getHistory(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const history = await automationService.getWorkflowHistory(userId);
      return res.json(history);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
}

export const automationController = new AutomationController();
