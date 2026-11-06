import { Router } from 'express';
import { smartSettleController } from '../controllers/smartsettle.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

// Public Customer-Facing Negotiation Routes (No login required)
router.get('/public/:id', (req, res) => smartSettleController.getPublicNegotiationData(req, res));
router.post('/public/propose', (req, res) => smartSettleController.generatePlanProposal(req, res));
router.post('/public/request', (req, res) => smartSettleController.submitAgreement(req, res));
router.post('/public/capture-installment', (req, res) => smartSettleController.captureInstallment(req, res));

// Protected Business Owner Routes
router.get('/invoices', authenticateToken, (req, res) => smartSettleController.getEligibleInvoices(req, res));
router.get('/dashboard', authenticateToken, (req, res) => smartSettleController.getDashboardMetrics(req, res));
router.post('/generate-plan', authenticateToken, (req, res) => smartSettleController.generatePlanProposal(req, res));
router.post('/submit-agreement', authenticateToken, (req, res) => smartSettleController.submitAgreement(req, res));
router.post('/:id/approve', authenticateToken, (req, res) => smartSettleController.approveAgreement(req, res));
router.post('/:id/reject', authenticateToken, (req, res) => smartSettleController.rejectAgreement(req, res));
router.post('/capture-installment', authenticateToken, (req, res) => smartSettleController.captureInstallment(req, res));

export default router;
