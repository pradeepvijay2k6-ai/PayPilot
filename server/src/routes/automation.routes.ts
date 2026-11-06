import { Router } from 'express';
import { automationController } from '../controllers/automation.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.post('/detect', (req, res) => automationController.detectWorkflows(req, res));
router.get('/queue', (req, res) => automationController.getApprovalQueue(req, res));
router.post('/stage-payment', (req, res) => automationController.stagePaymentWorkflow(req, res));
router.post('/:id/approve', (req, res) => automationController.approveWorkflow(req, res));
router.post('/:id/reject', (req, res) => automationController.rejectWorkflow(req, res));
router.get('/history', (req, res) => automationController.getHistory(req, res));

export default router;
