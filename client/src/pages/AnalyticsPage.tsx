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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">Financial Performance & Analytics</h2>
          <p className="text-xs text-slate-500">Real-time revenue metrics, payment cycles, and debtor behavior</p>
        </div>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Summary</span>
        </button>
      </div>

      {/* Revenue Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Revenue Area Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1">30-Day Daily Captured Volume</h3>
          <p className="text-xs text-slate-500 mb-6">Aggregated from verified PayPal settlements</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics?.dailyRevenue || []}>
                <defs>
                  <linearGradient id="anGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip 
                  formatter={(value: any) => [`$${Number(value).toFixed(2)} USD`, 'Volume']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} fill="url(#anGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Invoice Status Distribution Pie */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Invoice Portfolio Breakdown</h3>
          <p className="text-xs text-slate-500 mb-6">Proportion of invoice lifecycle states</p>
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
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Customer Payment Delay Analysis */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Customer Payment Delay & Debt Analysis</h3>
          <p className="text-xs text-slate-500">
            Calculated from real invoice due dates, elapsed delay days, and settlement track records
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 uppercase font-semibold text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Customer Account</th>
                <th className="py-3 px-4">Company</th>
                <th className="py-3 px-4">Overdue Invoices</th>
                <th className="py-3 px-4">Outstanding Overdue Debt</th>
                <th className="py-3 px-4">Average Delay</th>
                <th className="py-3 px-4">Reliability Index</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customerRisks.map((c) => (
                <tr key={c.customerId} className="hover:bg-slate-50">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{c.name}</td>
                  <td className="py-3.5 px-4 text-slate-500">{c.company}</td>
                  <td className="py-3.5 px-4">
                    {c.overdueCount > 0 ? (
                      <span className="text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded">
                        {c.overdueCount} bills
                      </span>
                    ) : (
                      <span className="text-slate-400">0</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-extrabold text-slate-900">
                    <span className={c.totalOverdueAmount > 0 ? 'text-rose-600' : 'text-slate-800'}>
                      ${c.totalOverdueAmount.toLocaleString()} USD
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-medium">
                    {c.avgDelayDays > 0 ? `${c.avgDelayDays} days late` : 'Prompt payment'}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full ${
                            c.reliabilityScore > 75 ? 'bg-emerald-500' : c.reliabilityScore > 45 ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${c.reliabilityScore}%` }}
                        />
                      </div>
                      <span className="font-mono text-[11px] font-bold text-slate-700">{c.reliabilityScore}%</span>
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
