import { Router } from 'express';
import { getOverview, getRevenueCharts, getCustomerRisk, getInsights } from '../controllers/analytics.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();
router.use(authenticateToken);

router.get('/overview', getOverview);
router.get('/revenue-charts', getRevenueCharts);
router.get('/customer-risk', getCustomerRisk);
router.get('/insights', getInsights);

export default router;
