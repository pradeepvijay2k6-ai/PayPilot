import { prisma } from '../../prisma';
import { analyticsService } from '../analytics.service';

export interface FinanceAgentFinding {
  agent: 'Finance Agent';
  status: 'OPTIMAL' | 'WARNING' | 'ALERT';
  summary: string;
  metrics: {
    totalRevenue: number;
    revenueLast30Days: number;
    monthlyGrowthRate: number;
    forecastNext7Days: number;
    forecastNext30Days: number;
    cashFlowHealth: 'SURPLUS' | 'BALANCED' | 'DEFICIT_RISK';
    burnOrOverdueRatio: number;
  };
  trends: string[];
  recommendations: string[];
  monthComparison: {
    currentPeriodRevenue: number;
    priorPeriodRevenue: number;
    percentageChange: number;
  };
}

export class FinanceAgent {
  public async analyze(userId: string): Promise<FinanceAgentFinding> {
    const overview = await analyticsService.getFinancialOverview(userId);

    const now = new Date();
    const sevenDaysFuture = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysFuture = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const pendingInvoices = await prisma.invoice.findMany({
      where: {
        userId,
        status: { in: ['SENT', 'UNPAID', 'DRAFT'] }
      }
    });

    const forecast7Days = pendingInvoices
      .filter(inv => {
        const d = new Date(inv.dueDate);
        return d >= now && d <= sevenDaysFuture;
      })
      .reduce((sum, inv) => sum + inv.total, 0);

    const forecast30Days = pendingInvoices
      .filter(inv => {
        const d = new Date(inv.dueDate);
        return d <= thirtyDaysFuture;
      })
      .reduce((sum, inv) => sum + inv.total, 0);

    const overdueRatio = overview.totalRevenue > 0
      ? (overview.overdueAmount / (overview.totalRevenue + overview.pendingAmount)) * 100
      : 0;

    let cashFlowHealth: 'SURPLUS' | 'BALANCED' | 'DEFICIT_RISK' = 'BALANCED';
    if (overview.overdueAmount > overview.revenueLast30Days * 0.3 || (overview.overdueAmount > 2000 && forecast7Days === 0)) {
      cashFlowHealth = 'DEFICIT_RISK';
    } else if (overview.monthlyGrowthRate > 20 && overview.overdueAmount < 1000) {
      cashFlowHealth = 'SURPLUS';
    }

    const trends: string[] = [];
    if (overview.monthlyGrowthRate > 0) {
      trends.push(`Revenue velocity is accelerating at +${overview.monthlyGrowthRate}% month-over-month.`);
    } else if (overview.monthlyGrowthRate < 0) {
      trends.push(`Revenue contraction detected at ${overview.monthlyGrowthRate}% relative to the previous 30-day window.`);
    } else {
      trends.push('Revenue volume is steady across consecutive 30-day monitoring periods.');
    }

    if (forecast7Days > 0) {
      trends.push(`Short-term receivables: $${forecast7Days.toLocaleString()} maturing within the next 7 business days.`);
    } else {
      trends.push(`Zero invoices scheduled to mature in the next 7 days; immediate liquidity depends on collections.`);
    }

    if (overview.overdueAmount > 0) {
      trends.push(`Capital drag: $${overview.overdueAmount.toLocaleString()} tied up in delinquent receivables (${Math.round(overdueRatio)}% of working capital).`);
    }

    const recommendations: string[] = [];
    if (cashFlowHealth === 'DEFICIT_RISK') {
      recommendations.push('Immediate liquidity priority: Dispatch automated payment reminder notices to unlock overdue capital.');
      recommendations.push('Introduce upfront deposit terms (30-50%) for upcoming client contracts to bridge the 7-day cash flow gap.');
    } else {
      recommendations.push('Maintain billing cadence with Net-15 invoice payment terms to accelerate cash conversion cycle.');
    }

    if (forecast30Days > 0) {
      recommendations.push(`Anticipate $${forecast30Days.toLocaleString()} in 30-day inflows — plan operational expenditures accordingly.`);
    }

    const status = cashFlowHealth === 'DEFICIT_RISK' ? 'ALERT' : overview.overdueAmount > 0 ? 'WARNING' : 'OPTIMAL';

    return {
      agent: 'Finance Agent',
      status,
      summary: `Analyzed $${overview.totalRevenue.toLocaleString()} in historical settled revenue with $${overview.revenueLast30Days.toLocaleString()} captured in the last 30 days. Projected 7-day inflows stand at $${forecast7Days.toLocaleString()} and 30-day inflows at $${forecast30Days.toLocaleString()}. Cash-flow posture evaluated as ${cashFlowHealth}.`,
      metrics: {
        totalRevenue: overview.totalRevenue,
        revenueLast30Days: overview.revenueLast30Days,
        monthlyGrowthRate: overview.monthlyGrowthRate,
        forecastNext7Days: forecast7Days,
        forecastNext30Days: forecast30Days,
        cashFlowHealth,
        burnOrOverdueRatio: Math.round(overdueRatio * 10) / 10
      },
      trends,
      recommendations,
      monthComparison: {
        currentPeriodRevenue: overview.revenueLast30Days,
        priorPeriodRevenue: Math.max(0, overview.totalRevenue - overview.revenueLast30Days),
        percentageChange: overview.monthlyGrowthRate
      }
    };
  }
}

export const financeAgent = new FinanceAgent();
