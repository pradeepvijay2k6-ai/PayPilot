import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Calendar, 
  ArrowUpRight, 
  AlertTriangle,
  Download,
  CheckCircle2
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { apiClient } from '../api/client';
import { RevenueAnalytics, CustomerRiskItem } from '../types';

export const AnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<RevenueAnalytics | null>(null);
  const [customerRisks, setCustomerRisks] = useState<CustomerRiskItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const [anRes, crRes] = await Promise.all([
          apiClient.get('/analytics/revenue-charts'),
          apiClient.get('/analytics/customer-risk')
        ]);
        setAnalytics(anRes.data);
        setCustomerRisks(crRes.data);
      } catch (err: any) {
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#94a3b8'];
  const pieData = analytics?.statusCounts ? [
    { name: 'Paid', value: analytics.statusCounts.PAID },
    { name: 'Sent', value: analytics.statusCounts.SENT },
    { name: 'Unpaid', value: analytics.statusCounts.UNPAID },
    { name: 'Overdue', value: analytics.statusCounts.OVERDUE },
    { name: 'Draft', value: analytics.statusCounts.DRAFT }
  ].filter(d => d.value > 0) : [];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 glass-card p-6 rounded-2xl border border-slate-800/80 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-white">Financial Performance & Analytics</h2>
          <p className="text-xs text-slate-400 mt-0.5">Real-time revenue metrics, payment cycles, and debtor behavior</p>
        </div>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-4 py-2 bg-dark-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold rounded-xl transition-all"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Summary</span>
        </button>
      </div>

      {/* Revenue Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Revenue Area Chart */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800/80 shadow-xs">
          <h3 className="text-sm font-semibold text-white mb-1">30-Day Daily Captured Volume</h3>
          <p className="text-xs text-slate-400 mb-6">Aggregated from verified PayPal settlements</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics?.dailyRevenue || []}>
                <defs>
                  <linearGradient id="anGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip 
                  formatter={(value: any) => [`$${Number(value).toFixed(2)} USD`, 'Volume']}
                  contentStyle={{ backgroundColor: '#0b101e', borderRadius: '12px', border: '1px solid #1e293b', color: '#fff', fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} fill="url(#anGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Invoice Status Distribution Pie */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800/80 shadow-xs">
          <h3 className="text-sm font-semibold text-white mb-1">Invoice Portfolio Breakdown</h3>
          <p className="text-xs text-slate-400 mb-6">Proportion of invoice lifecycle states</p>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                  label={(entry) => `${entry.name} (${entry.value})`}
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0b101e', borderRadius: '12px', border: '1px solid #1e293b', color: '#fff', fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Customer Payment Delay Analysis */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800/80 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-white">Customer Payment Delay & Debt Analysis</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Calculated from real invoice due dates, elapsed delay days, and settlement track records
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-dark-950/80 border-b border-slate-800 text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Customer Account</th>
                <th className="py-3 px-4">Company</th>
                <th className="py-3 px-4">Overdue Invoices</th>
                <th className="py-3 px-4">Outstanding Overdue Debt</th>
                <th className="py-3 px-4">Average Delay</th>
                <th className="py-3 px-4">Reliability Index</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {customerRisks.map((c) => (
                <tr key={c.customerId} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-white">{c.name}</td>
                  <td className="py-3.5 px-4 text-slate-400">{c.company}</td>
                  <td className="py-3.5 px-4">
                    {c.overdueCount > 0 ? (
                      <span className="text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                        {c.overdueCount} bills
                      </span>
                    ) : (
                      <span className="text-slate-500">0</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-white">
                    <span className={c.totalOverdueAmount > 0 ? 'text-rose-400' : 'text-slate-200'}>
                      ${c.totalOverdueAmount.toLocaleString()} USD
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-300 font-medium font-mono">
                    {c.avgDelayDays > 0 ? `${c.avgDelayDays} days late` : 'Prompt payment'}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-dark-950 rounded-full h-2 overflow-hidden border border-slate-800">
                        <div
                          className={`h-2 rounded-full ${
                            c.reliabilityScore > 75 ? 'bg-emerald-500' : c.reliabilityScore > 45 ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${c.reliabilityScore}%` }}
                        />
                      </div>
                      <span className="font-mono text-[11px] font-bold text-slate-300">{c.reliabilityScore}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
