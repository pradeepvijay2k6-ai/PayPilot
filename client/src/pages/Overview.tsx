import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  ArrowUpRight, 
  Clock, 
  AlertTriangle, 
  Users, 
  CreditCard, 
  FileText, 
  Sparkles, 
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { apiClient } from '../api/client';
import { FinancialOverview, RevenueAnalytics, AiInsight, Transaction, Invoice } from '../types';

interface OverviewProps {
  onNavigate: (tab: string) => void;
  onOpenCreateInvoice: () => void;
  onOpenPaymentRequest: () => void;
}

export const Overview: React.FC<OverviewProps> = ({
  onNavigate,
  onOpenCreateInvoice,
  onOpenPaymentRequest
}) => {
  const [overview, setOverview] = useState<FinancialOverview | null>(null);
  const [charts, setCharts] = useState<RevenueAnalytics | null>(null);
  const [insights, setInsights] = useState<AiInsight[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ovRes, chRes, inRes, txRes, invRes] = await Promise.all([
        apiClient.get('/analytics/overview'),
        apiClient.get('/analytics/revenue-charts'),
        apiClient.get('/analytics/insights'),
        apiClient.get('/transactions'),
        apiClient.get('/invoices')
      ]);

      setOverview(ovRes.data);
      setCharts(chRes.data);
      setInsights(inRes.data);
      setRecentTransactions(txRes.data.slice(0, 5));
      setRecentInvoices(invRes.data.slice(0, 5));
    } catch (err: any) {
      console.error('Error fetching dashboard overview:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const invoiceBarData = charts?.statusCounts ? [
    { name: 'Paid', count: charts.statusCounts.PAID, fill: '#10b981' },
    { name: 'Sent', count: charts.statusCounts.SENT, fill: '#3b82f6' },
    { name: 'Unpaid', count: charts.statusCounts.UNPAID, fill: '#f59e0b' },
    { name: 'Overdue', count: charts.statusCounts.OVERDUE, fill: '#ef4444' },
    { name: 'Draft', count: charts.statusCounts.DRAFT, fill: '#94a3b8' }
  ] : [];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* AI Insights Ticker Banner */}
      {insights.length > 0 && (
        <div className="bg-gradient-to-r from-slate-900 via-navy-900 to-slate-900 text-white p-4 rounded-2xl shadow-lg border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center shrink-0 border border-brand-500/30">
              <Sparkles className="w-4 h-4 text-brand-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-brand-500/30 text-brand-300 px-2 py-0.5 rounded-full">
                  AI Insight
                </span>
                <span className="text-xs font-bold text-white">{insights[0].title}</span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 font-medium">{insights[0].description}</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('ai-insights')}
            className="flex items-center gap-1 text-xs font-semibold text-brand-300 hover:text-white transition-colors shrink-0 px-3 py-1.5 rounded-lg hover:bg-white/10"
          >
            <span>View All Insights</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 4 Core Financial KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-500">Total Revenue (PayPal)</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              ${overview?.totalRevenue?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
            </span>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="inline-flex items-center text-[11px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                <ArrowUpRight className="w-3 h-3 mr-0.5" />
                +{overview?.monthlyGrowthRate || 0}%
              </span>
              <span className="text-[11px] text-slate-400">vs prior 30 days</span>
            </div>
          </div>
        </div>

        {/* Pending Payments */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-500">Pending Invoices</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              ${overview?.pendingAmount?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}
            </span>
            <div className="mt-2 text-[11px] text-slate-400">
              <span className="font-semibold text-slate-700">{overview?.pendingPaymentsCount || 0}</span> bills awaiting customer settlement
            </div>
          </div>
        </div>

        {/* Overdue Debt */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-500">Overdue Capital</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-rose-600 tracking-tight">
              ${overview?.overdueAmount?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}
            </span>
            <div className="mt-2 text-[11px] text-slate-400">
              <span className="font-semibold text-rose-700">{overview?.overdueInvoicesCount || 0}</span> invoices delayed past due date
            </div>
          </div>
        </div>

        {/* Total Customers */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-500">Active Accounts</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-brand-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              {overview?.totalCustomers || 0}
            </span>
            <div className="mt-2 text-[11px] text-slate-400">
              <span className="font-semibold text-slate-700">{overview?.totalPaymentsReceived || 0}</span> successful PayPal captures
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Revenue Velocity (2 Cols) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Revenue Velocity (30 Days)</h3>
              <p className="text-xs text-slate-500">Daily captured revenue from PayPal Sandbox transactions</p>
            </div>
            <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-lg border border-brand-200/60">
              30 Days
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts?.dailyRevenue || []}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip 
                  formatter={(value: any) => [`$${Number(value).toFixed(2)} USD`, 'Revenue']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#revenueGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Invoice Status Distribution (1 Col) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Invoice Distribution</h3>
            <p className="text-xs text-slate-500 mb-4">Volume breakdown across invoice lifecycles</p>
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={invoiceBarData} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#475569' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '11px' }} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
            <span className="text-slate-500 font-medium">Quick Action:</span>
            <button
              onClick={onOpenCreateInvoice}
              className="font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              <span>+ Issue Invoice</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activity: Transactions & Invoices Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent PayPal Transactions */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recent PayPal Settlements</h3>
              <p className="text-xs text-slate-500">Verified captures through PayPal sandbox</p>
            </div>
            <button
              onClick={() => onNavigate('transactions')}
              className="text-xs font-semibold text-brand-600 hover:text-brand-700"
            >
              View all
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {recentTransactions.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No transactions recorded yet.</p>
            ) : (
              recentTransactions.map((tx) => (
                <div key={tx.id} className="py-3 flex justify-between items-center text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{tx.customer?.name || tx.payerName || 'Direct Checkout'}</p>
                      <p className="font-mono text-[10px] text-slate-400">{tx.paypalOrderId || tx.id}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">+${tx.amount.toFixed(2)} USD</p>
                    <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded">
                      COMPLETED
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Invoices */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Active Invoices</h3>
              <p className="text-xs text-slate-500">Latest invoices and due status</p>
            </div>
            <button
              onClick={() => onNavigate('invoices')}
              className="text-xs font-semibold text-brand-600 hover:text-brand-700"
            >
              View all
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {recentInvoices.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No invoices issued yet.</p>
            ) : (
              recentInvoices.map((inv) => (
                <div key={inv.id} className="py-3 flex justify-between items-center text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center font-mono font-bold text-[10px]">
                      {inv.invoiceNumber.split('-')[2] || 'INV'}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{inv.customer?.name}</p>
                      <p className="text-[11px] text-slate-400">Due {new Date(inv.dueDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">${inv.total.toFixed(2)}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      inv.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' :
                      inv.status === 'OVERDUE' ? 'bg-rose-100 text-rose-800' :
                      inv.status === 'SENT' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {inv.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
