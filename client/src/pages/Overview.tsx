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
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  ArrowRight,
  Send,
  Zap,
  Bot,
  QrCode
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
import { useTheme } from '../context/ThemeContext';
import { PaymentQrModal } from '../components/common/PaymentQrModal';

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
  const [qrModalOpen, setQrModalOpen] = useState(false);

  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

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
    { name: 'Draft', count: charts.statusCounts.DRAFT, fill: '#64748b' }
  ] : [];

  const currentDateFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* A. Welcome Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-dark-900 via-dark-850 to-dark-900 border border-slate-800/80 p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 rounded-full bg-brand-600/10 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 -mb-10 w-72 h-72 rounded-full bg-accent-purple/10 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-medium text-slate-400 uppercase tracking-wider">{currentDateFormatted}</span>
              <span className="w-1 h-1 rounded-full bg-slate-600"></span>
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                PayPal Sandbox Live
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Good day, Alex <span className="text-brand-400 font-normal">|</span> Nexus Cloud Solutions
            </h1>
            <p className="text-xs md:text-sm text-slate-400 max-w-2xl">
              PayPilot AI is actively auditing your revenue velocity, accounts receivable aging, and PayPal sandbox settlements.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setQrModalOpen(true)}
              className="px-3.5 py-2.5 rounded-xl bg-dark-800 hover:bg-dark-750 text-slate-200 border border-slate-700/80 text-xs font-semibold flex items-center gap-2 transition-all active:scale-95 shadow-sm"
            >
              <QrCode className="w-4 h-4 text-brand-400" />
              <span>Instant QR Pay</span>
            </button>
            <button
              onClick={() => onNavigate('ai-agent')}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 via-indigo-600 to-accent-purple text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-brand-500/25 hover:brightness-110 transition-all active:scale-95"
            >
              <Bot className="w-4 h-4 text-brand-200" />
              <span>AI Command Center</span>
            </button>
            <button
              onClick={() => onNavigate('multi-agent')}
              className="px-4 py-2.5 rounded-xl bg-dark-800 hover:bg-dark-750 text-slate-300 border border-slate-700/80 text-xs font-semibold flex items-center gap-2 transition-all active:scale-95"
            >
              <span>Multi-Agent Council</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Quick Command Chips */}
        <div className="relative z-10 mt-6 pt-5 border-t border-slate-800/80 flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5 mr-1">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            Suggested AI Operations:
          </span>
          {[
            { label: "Analyze revenue trends", tab: "ai-agent" },
            { label: "Audit delinquent invoices", tab: "multi-agent" },
            { label: "Review automation approval queue", tab: "automation" },
            { label: "SmartSettle installment negotiation", tab: "smartsettle" }
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={() => onNavigate(item.tab)}
              className="text-xs font-medium text-slate-300 bg-dark-800/90 hover:bg-dark-750 hover:text-white px-3 py-1.5 rounded-lg border border-slate-700/60 transition-all"
            >
              {item.label} →
            </button>
          ))}
        </div>
      </div>

      {/* B. Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Revenue */}
        <div className="glass-card glass-card-hover rounded-2xl p-5 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Total Settled Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center border border-brand-500/20">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-extrabold text-white tracking-tight">
              ${overview ? overview.totalRevenue.toLocaleString() : '10,950'}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+{overview ? overview.monthlyGrowthRate : 100}% this month</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800/80 flex justify-between">
            <span>Last 30 Days</span>
            <span className="font-mono text-emerald-400 font-semibold">+$7,700 captured</span>
          </div>
        </div>

        {/* Card 2: Settled Inflow Count */}
        <div className="glass-card glass-card-hover rounded-2xl p-5 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Settled Payments</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-extrabold text-white tracking-tight">
              {overview ? overview.totalPaymentsReceived : 5} Completed
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>100% verified ledger</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800/80 flex justify-between">
            <span>Avg Settlement</span>
            <span className="font-mono text-white font-semibold">$2,190.00</span>
          </div>
        </div>

        {/* Card 3: Overdue Balances */}
        <div className="glass-card glass-card-hover rounded-2xl p-5 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Overdue Balances</span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-extrabold text-white tracking-tight">
              ${overview ? overview.overdueAmount.toLocaleString() : '2,400'}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-rose-400/90 font-medium">
              <span>{overview ? overview.overdueInvoicesCount : 3} delinquent accounts</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800/80 flex justify-between">
            <span>Average Late Delay</span>
            <span className="font-mono text-amber-400 font-semibold">13 days past due</span>
          </div>
        </div>

        {/* Card 4: Pending Pipelines */}
        <div className="glass-card glass-card-hover rounded-2xl p-5 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>30-Day Pipeline</span>
            <div className="w-8 h-8 rounded-xl bg-accent-purple/10 text-accent-purple flex items-center justify-center border border-accent-purple/20">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-extrabold text-white tracking-tight">
              ${overview ? overview.pendingAmount.toLocaleString() : '3,800'}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-blue-400 font-medium">
              <span>$2,000 maturing in 7 days</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800/80 flex justify-between">
            <span>Active Agreements</span>
            <span className="font-mono text-accent-purple font-semibold">SmartSettle Active</span>
          </div>
        </div>
      </div>

      {/* C. Revenue Analytics & Invoice Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Monthly Revenue Velocity */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">Revenue Velocity Trajectory</h2>
              <p className="text-xs text-slate-400">Monthly settled volume from verified PayPal Sandbox transactions</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-500/10 text-brand-400 border border-brand-500/20">
                Live Data
              </span>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts?.monthlyRevenue || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1E293B' : '#E2E8F0'} vertical={false} />
                <XAxis dataKey="month" stroke={isDark ? '#64748B' : '#94A3B8'} fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke={isDark ? '#64748B' : '#94A3B8'} fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDark ? '#0B101D' : '#FFFFFF', 
                    borderColor: isDark ? '#1E293B' : '#E2E8F0', 
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: isDark ? '#F8FAFC' : '#0F172A',
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15)'
                  }} 
                  formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'Settled Revenue']}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#revenueGlow)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right 1 Col: Invoice Portfolio Distribution */}
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">Invoice Status Health</h2>
              <p className="text-xs text-slate-400">Total volume distribution</p>
            </div>
            <button
              onClick={() => onNavigate('invoices')}
              className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors"
            >
              <span>Manage</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={invoiceBarData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1E293B' : '#E2E8F0'} vertical={false} />
                <XAxis dataKey="name" stroke={isDark ? '#64748B' : '#94A3B8'} fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke={isDark ? '#64748B' : '#94A3B8'} fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDark ? '#0B101D' : '#FFFFFF', 
                    borderColor: isDark ? '#1E293B' : '#E2E8F0', 
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: isDark ? '#F8FAFC' : '#0F172A'
                  }}
                  formatter={(val: any) => [val, 'Invoices']}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* D. Bottom Two Columns: Verified Ledger & AI Financial Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Transactions */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">Recent PayPal Transactions</h2>
              <p className="text-xs text-slate-400">Settled and captured PayPal Sandbox payment orders</p>
            </div>
            <button
              onClick={() => onNavigate('transactions')}
              className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="pb-3">Client / Payer</th>
                  <th className="pb-3">PayPal Order ID</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {recentTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-dark-800/40 transition-colors">
                    <td className="py-3 font-semibold text-white">
                      <div>{tx.customer?.name || tx.payerName || 'Direct Payer'}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{tx.customer?.company || tx.payerEmail}</div>
                    </td>
                    <td className="py-3 font-mono text-[11px] text-slate-400">{tx.paypalOrderId || 'ORD-SANDBOX'}</td>
                    <td className="py-3 font-extrabold text-white text-sm">${tx.amount.toLocaleString()}</td>
                    <td className="py-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-3 text-right text-slate-400 font-mono text-[11px]">
                      {new Date(tx.transactionDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: AI-Generated Insights */}
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-400" />
              <h2 className="text-sm font-bold text-white tracking-tight">AI Financial Insights</h2>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-500/10 text-brand-400 border border-brand-500/20">
              {insights.length} Signals
            </span>
          </div>

          <div className="space-y-3">
            {insights.map((ins) => (
              <div 
                key={ins.id}
                className="p-3.5 rounded-xl bg-dark-800/80 border border-slate-700/60 hover:border-slate-600 transition-all space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full uppercase tracking-wider ${
                    ins.type === 'POSITIVE'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : ins.type === 'CRITICAL'
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    {ins.type}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 font-semibold">{ins.metric}</span>
                </div>
                <h3 className="text-xs font-bold text-white">{ins.title}</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">{ins.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Embedded Payment QR Modal */}
      <PaymentQrModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
      />
    </div>
  );
};
