import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { analyticsService } from '../services/analytics.service';

export const getOverview = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const overview = await analyticsService.getFinancialOverview(userId);
    res.json(overview);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getRevenueCharts = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const charts = await analyticsService.getRevenueAnalytics(userId);
    res.json(charts);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getCustomerRisk = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const risks = await analyticsService.getCustomerDelayAnalysis(userId);
    res.json(risks);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getInsights = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const insights = await analyticsService.generateInsights(userId);
    res.json(insights);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
