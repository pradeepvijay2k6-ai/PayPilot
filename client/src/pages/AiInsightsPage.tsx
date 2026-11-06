import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight,
  Bot,
  Zap,
  Info
} from 'lucide-react';
import { apiClient } from '../api/client';
import { AiInsight, FinancialOverview } from '../types';

interface AiInsightsPageProps {
  onNavigateToAgent: () => void;
}

export const AiInsightsPage: React.FC<AiInsightsPageProps> = ({ onNavigateToAgent }) => {
  const [insights, setInsights] = useState<AiInsight[]>([]);
  const [overview, setOverview] = useState<FinancialOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [inRes, ovRes] = await Promise.all([
          apiClient.get('/analytics/insights'),
          apiClient.get('/analytics/overview')
        ]);
        setInsights(inRes.data);
        setOverview(ovRes.data);
      } catch (err: any) {
        console.error('Error fetching insights:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Compute composite financial health score (0-100) based on overdue debt ratio and growth
  const totalBilled = (overview?.totalRevenue || 0) + (overview?.pendingAmount || 0) + (overview?.overdueAmount || 0);
  const overdueRatio = totalBilled > 0 ? (overview?.overdueAmount || 0) / totalBilled : 0;
  const healthScore = Math.max(30, Math.min(98, Math.round(100 - (overdueRatio * 60) + ((overview?.monthlyGrowthRate || 0) > 0 ? 10 : -10))));

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Financial Health Score Gauge */}
      <div className="bg-gradient-to-r from-navy-900 to-slate-900 text-white p-8 rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-brand-500/20 text-brand-300 px-2.5 py-0.5 rounded-full border border-brand-500/30">
              PayPilot AI Diagnostic
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tight">Business Financial Health Index</h2>
          <p className="text-xs text-slate-300 max-w-md mt-1 leading-relaxed">
            Our autonomous financial agent continuously monitors your PayPal cash flow velocity, payment punctuality, and overdue exposure.
          </p>
        </div>

        <div className="flex items-center gap-6 bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
          <div className="text-center">
            <span className="text-4xl font-black text-brand-400 font-mono">{healthScore}</span>
            <span className="text-slate-400 text-xs block font-bold mt-0.5">/ 100</span>
          </div>
          <div className="text-xs text-slate-300 space-y-1">
            <p className="font-bold text-white">Status: {healthScore > 80 ? 'Excellent' : healthScore > 60 ? 'Healthy' : 'Attention Needed'}</p>
            <p className="text-[11px] text-slate-400">Overdue Debt: ${(overview?.overdueAmount || 0).toLocaleString()} USD</p>
            <p className="text-[11px] text-emerald-400 font-semibold">Growth: +{overview?.monthlyGrowthRate || 0}% 30-Day</p>
          </div>
        </div>
      </div>

      {/* Intelligent Insights List */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-600" />
            Detected Operational Insights ({insights.length})
          </h3>
          <button
            onClick={onNavigateToAgent}
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            <span>Ask Agent to Act</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.map((ins) => {
            const isCritical = ins.type === 'CRITICAL';
            const isWarning = ins.type === 'WARNING';
            const isPositive = ins.type === 'POSITIVE';

            return (
              <div
                key={ins.id}
                className={`p-5 rounded-2xl border bg-white shadow-xs space-y-3 ${
                  isCritical ? 'border-rose-200' :
                  isWarning ? 'border-amber-200' :
                  isPositive ? 'border-emerald-200' : 'border-slate-200'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
                      isCritical ? 'bg-rose-50 text-rose-600' :
                      isWarning ? 'bg-amber-50 text-amber-600' :
                      isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {isCritical || isWarning ? <AlertTriangle className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{ins.title}</h4>
                      <span className={`text-[10px] font-bold uppercase ${
                        isCritical ? 'text-rose-600' : isWarning ? 'text-amber-600' : 'text-emerald-600'
                      }`}>
                        {ins.priority} Priority
                      </span>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold ${
                    isCritical ? 'bg-rose-50 text-rose-700' :
                    isWarning ? 'bg-amber-50 text-amber-700' :
                    isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {ins.metric}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {ins.description}
                </p>

                <div className="pt-2 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={onNavigateToAgent}
                    className="text-[11px] font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                  >
                    <span>Execute with AI</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
