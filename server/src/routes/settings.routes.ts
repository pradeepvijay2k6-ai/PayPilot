import { Router } from 'express';
import { getSettings, updateSettings, testPayPalConnection, resetDemoData } from '../controllers/settings.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();
router.use(authenticateToken);

router.get('/', getSettings);
router.put('/', updateSettings);
router.post('/test-paypal', testPayPalConnection);
router.post('/reset-demo', resetDemoData);

export default router;
