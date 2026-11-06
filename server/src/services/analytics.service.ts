import { prisma } from '../prisma';

export class AnalyticsService {
  /**
   * Get high-level KPI overview derived strictly from real DB records
   */
  public async getFinancialOverview(userId: string) {
    const invoices = await prisma.invoice.findMany({
      where: { userId },
      include: { customer: true }
    });

    const transactions = await prisma.transaction.findMany({
      where: { userId, status: 'COMPLETED' }
    });

    const customersCount = await prisma.customer.count({
      where: { userId }
    });

    // Total revenue from completed transactions
    const totalRevenue = transactions.reduce((sum, tx) => sum + tx.amount, 0);

    // Pending payments (SENT or UNPAID invoices)
    const pendingInvoices = invoices.filter(inv => inv.status === 'SENT' || inv.status === 'UNPAID');
    const pendingAmount = pendingInvoices.reduce((sum, inv) => sum + inv.total, 0);

    // Overdue invoices
    const now = new Date();
    const overdueInvoices = invoices.filter(inv => 
      inv.status === 'OVERDUE' || 
      ((inv.status === 'SENT' || inv.status === 'UNPAID') && new Date(inv.dueDate) < now)
    );
    const overdueAmount = overdueInvoices.reduce((sum, inv) => sum + inv.total, 0);

    // Monthly growth calculation (last 30 days vs previous 30 days)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const revenueLast30 = transactions
      .filter(tx => new Date(tx.transactionDate) >= thirtyDaysAgo)
      .reduce((sum, tx) => sum + tx.amount, 0);

    const revenuePrior30 = transactions
      .filter(tx => new Date(tx.transactionDate) >= sixtyDaysAgo && new Date(tx.transactionDate) < thirtyDaysAgo)
      .reduce((sum, tx) => sum + tx.amount, 0);

    const growthRate = revenuePrior30 > 0 
      ? Math.round(((revenueLast30 - revenuePrior30) / revenuePrior30) * 100) 
      : (revenueLast30 > 0 ? 100 : 0);

    return {
      totalRevenue,
      totalPaymentsReceived: transactions.length,
      pendingPaymentsCount: pendingInvoices.length,
      pendingAmount,
      overdueInvoicesCount: overdueInvoices.length,
      overdueAmount,
      totalCustomers: customersCount,
      monthlyGrowthRate: growthRate,
      revenueLast30Days: revenueLast30
    };
  }

  /**
   * Get dynamic time-series revenue and invoice distribution for Recharts
   */
  public async getRevenueAnalytics(userId: string) {
    const transactions = await prisma.transaction.findMany({
      where: { userId, status: 'COMPLETED' },
      orderBy: { transactionDate: 'asc' }
    });

    const invoices = await prisma.invoice.findMany({
      where: { userId }
    });

    // Daily breakdown for last 30 days
    const dailyMap: { [key: string]: number } = {};
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateKey = d.toISOString().split('T')[0];
      dailyMap[dateKey] = 0;
    }

    transactions.forEach(tx => {
      const dateKey = new Date(tx.transactionDate).toISOString().split('T')[0];
      if (dailyMap[dateKey] !== undefined) {
        dailyMap[dateKey] += tx.amount;
      }
    });

    const dailyRevenue = Object.entries(dailyMap).map(([date, amount]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      revenue: amount
    }));

    // Monthly breakdown
    const monthlyMap: { [key: string]: number } = {};
    transactions.forEach(tx => {
      const d = new Date(tx.transactionDate);
      const monthKey = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      monthlyMap[monthKey] = (monthlyMap[monthKey] || 0) + tx.amount;
    });

    const monthlyRevenue = Object.entries(monthlyMap).map(([month, revenue]) => ({
      month,
      revenue
    }));

    // Invoices status breakdown
    const statusCounts = {
      PAID: invoices.filter(i => i.status === 'PAID').length,
      OVERDUE: invoices.filter(i => i.status === 'OVERDUE').length,
      SENT: invoices.filter(i => i.status === 'SENT').length,
      UNPAID: invoices.filter(i => i.status === 'UNPAID').length,
      DRAFT: invoices.filter(i => i.status === 'DRAFT').length
    };

    return {
      dailyRevenue,
      monthlyRevenue,
      statusCounts
    };
  }

  /**
   * Analyze customers with late payments and debt
   */
  public async getCustomerDelayAnalysis(userId: string) {
    const customers = await prisma.customer.findMany({
      where: { userId },
      include: {
        invoices: true,
        transactions: true
      }
    });

    const now = new Date();
    const analysis = customers.map(cust => {
      const overdueInvoices = cust.invoices.filter(inv => 
        inv.status === 'OVERDUE' || 
        ((inv.status === 'SENT' || inv.status === 'UNPAID') && new Date(inv.dueDate) < now)
      );

      const totalOverdueAmount = overdueInvoices.reduce((sum, inv) => sum + inv.total, 0);
      const paidInvoices = cust.invoices.filter(inv => inv.status === 'PAID');
      const totalPaidAmount = paidInvoices.reduce((sum, inv) => sum + inv.total, 0);

      // Calculate average delay days across overdue invoices
      let avgDelayDays = 0;
      if (overdueInvoices.length > 0) {
        const totalDelay = overdueInvoices.reduce((acc, inv) => {
          const diffDays = Math.max(0, Math.floor((now.getTime() - new Date(inv.dueDate).getTime()) / (1000 * 60 * 60 * 24)));
          return acc + diffDays;
        }, 0);
        avgDelayDays = Math.round(totalDelay / overdueInvoices.length);
      }

      // Reliability Score: 100 base minus deductions for overdue & delay
      let reliabilityScore = 100;
      if (overdueInvoices.length > 0) {
        reliabilityScore = Math.max(20, 100 - (overdueInvoices.length * 20) - (avgDelayDays * 2));
      }

      return {
        customerId: cust.id,
        name: cust.name,
        email: cust.email,
        company: cust.company || 'Independent',
        overdueCount: overdueInvoices.length,
        totalOverdueAmount,
        totalPaidAmount,
        avgDelayDays,
        reliabilityScore,
        overdueInvoices: overdueInvoices.map(i => ({
          id: i.id,
          invoiceNumber: i.invoiceNumber,
          amount: i.total,
          dueDate: i.dueDate
        }))
      };
    });

    // Sort by highest overdue amount first
    return analysis.sort((a, b) => b.totalOverdueAmount - a.totalOverdueAmount);
  }

  /**
   * Generate AI Insights derived from real mathematical facts in DB
   */
  public async generateInsights(userId: string) {
    const overview = await this.getFinancialOverview(userId);
    const customerAnalysis = await this.getCustomerDelayAnalysis(userId);
    const customers = await prisma.customer.findMany({
      where: { userId },
      include: { transactions: true }
    });

    const insights = [];

    // Insight 1: Growth trend
    if (overview.monthlyGrowthRate > 0) {
      insights.push({
        id: 'growth-1',
        type: 'POSITIVE',
        title: 'Strong Revenue Velocity',
        description: `Revenue has expanded by +${overview.monthlyGrowthRate}% over the prior period, totaling $${overview.revenueLast30Days.toLocaleString()} in the past 30 days.`,
        metric: `+${overview.monthlyGrowthRate}%`,
        priority: 'MEDIUM'
      });
    } else {
      insights.push({
        id: 'growth-1',
        type: 'NEUTRAL',
        title: 'Steady Financial Baseline',
        description: `Total revenue generated stands at $${overview.totalRevenue.toLocaleString()} across ${overview.totalPaymentsReceived} settled PayPal transactions.`,
        metric: `$${overview.totalRevenue.toLocaleString()}`,
        priority: 'LOW'
      });
    }

    // Insight 2: Overdue cash flow alert
    if (overview.overdueAmount > 0) {
      insights.push({
        id: 'overdue-1',
        type: 'CRITICAL',
        title: 'Overdue Capital Trapped',
        description: `You have ${overview.overdueInvoicesCount} overdue invoice(s) totaling $${overview.overdueAmount.toLocaleString()}. We recommend dispatching automated PayPal payment reminders.`,
        metric: `$${overview.overdueAmount.toLocaleString()}`,
        priority: 'HIGH'
      });
    }

    // Insight 3: Frequent delayed payer identification
    const highRiskPayer = customerAnalysis.find(c => c.overdueCount > 0);
    if (highRiskPayer) {
      insights.push({
        id: 'risk-payer',
        type: 'WARNING',
        title: `Payment Delay Pattern: ${highRiskPayer.name}`,
        description: `${highRiskPayer.name} (${highRiskPayer.company}) has ${highRiskPayer.overdueCount} overdue invoice(s) averaging ${highRiskPayer.avgDelayDays} days past due date ($${highRiskPayer.totalOverdueAmount.toLocaleString()} outstanding).`,
        metric: `${highRiskPayer.avgDelayDays} Days Late`,
        priority: 'HIGH'
      });
    }

    // Insight 4: Highest revenue customer
    const customersWithRevenue = customers.map(c => ({
      name: c.name,
      company: c.company,
      total: c.transactions.filter(t => t.status === 'COMPLETED').reduce((s, t) => s + t.amount, 0)
    })).sort((a, b) => b.total - a.total);

    if (customersWithRevenue.length > 0 && customersWithRevenue[0].total > 0) {
      const top = customersWithRevenue[0];
      insights.push({
        id: 'top-customer',
        type: 'POSITIVE',
        title: `Key Account: ${top.name}`,
        description: `${top.name} (${top.company || 'Enterprise'}) is your highest-grossing account, contributing $${top.total.toLocaleString()} in captured revenue.`,
        metric: `$${top.total.toLocaleString()}`,
        priority: 'MEDIUM'
      });
    }

    return insights;
  }
}

export const analyticsService = new AnalyticsService();
