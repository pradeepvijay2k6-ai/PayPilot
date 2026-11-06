import { Request, Response } from 'express';
import { smartSettleService } from '../services/smartsettle.service';

export class SmartSettleController {
  public async getEligibleInvoices(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const invoices = await smartSettleService.getEligibleInvoices(userId);
      return res.json({ invoices });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  public async generatePlanProposal(req: Request, res: Response) {
    try {
      const { invoiceId, requestedExtensionDays, requestedInstallments, hardshipReason, proposedDownpayment } = req.body;
      if (!invoiceId) {
        return res.status(400).json({ error: 'invoiceId is required' });
      }

      const proposal = await smartSettleService.generatePlanProposal({
        invoiceId,
        requestedExtensionDays: requestedExtensionDays ? parseInt(requestedExtensionDays, 10) : undefined,
        requestedInstallments: requestedInstallments ? parseInt(requestedInstallments, 10) : undefined,
        hardshipReason,
        proposedDownpayment: proposedDownpayment ? parseFloat(proposedDownpayment) : undefined
      });

      return res.json({ proposal });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  public async submitAgreement(req: Request, res: Response) {
    try {
      const { invoiceId, customerNote, plan, createdBy } = req.body;
      if (!invoiceId || !plan) {
        return res.status(400).json({ error: 'invoiceId and plan are required' });
      }

      const agreement = await smartSettleService.submitAgreement({
        invoiceId,
        customerNote,
        plan,
        createdBy: createdBy || 'BUSINESS'
      });

      return res.status(201).json({ success: true, agreement });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  public async approveAgreement(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;
      const { businessNote } = req.body;

      const agreement = await smartSettleService.approveAgreement(id, userId, businessNote);
      return res.json({ success: true, agreement });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  public async rejectAgreement(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;
      const { reason } = req.body;

      const agreement = await smartSettleService.rejectAgreement(id, userId, reason);
      return res.json({ success: true, agreement });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  public async captureInstallment(req: Request, res: Response) {
    try {
      const { installmentId, paypalOrderId, payerDetails } = req.body;
      if (!installmentId) {
        return res.status(400).json({ error: 'installmentId is required' });
      }

      const result = await smartSettleService.captureInstallment(installmentId, paypalOrderId, payerDetails);
      return res.json(result);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  public async getPublicNegotiationData(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await smartSettleService.getPublicNegotiationData(id);
      return res.json(data);
    } catch (err: any) {
      return res.status(404).json({ error: err.message || 'Invoice negotiation record not found' });
    }
  }

  public async getDashboardMetrics(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const data = await smartSettleService.getDashboardMetrics(userId);
      return res.json(data);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
}

export const smartSettleController = new SmartSettleController();
