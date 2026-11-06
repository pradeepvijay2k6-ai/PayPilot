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
      <div className="glass-card text-white p-8 rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider bg-brand-500/10 text-brand-400 px-2.5 py-0.5 rounded-full border border-brand-500/20">
              PayPilot AI Diagnostic
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Business Financial Health Index</h2>
          <p className="text-xs text-slate-400 max-w-md mt-1 leading-relaxed">
            Our autonomous financial agent continuously monitors your PayPal cash flow velocity, payment punctuality, and overdue exposure.
          </p>
        </div>

        <div className="flex items-center gap-6 bg-dark-950 p-4 rounded-2xl border border-slate-800">
          <div className="text-center">
            <span className="text-4xl font-bold text-brand-400 font-mono">{healthScore}</span>
            <span className="text-slate-500 text-xs block font-mono mt-0.5">/ 100</span>
          </div>
          <div className="text-xs text-slate-300 space-y-1">
            <p className="font-semibold text-white">Status: <span className="text-brand-300">{healthScore > 80 ? 'Excellent' : healthScore > 60 ? 'Healthy' : 'Attention Needed'}</span></p>
            <p className="text-[11px] text-slate-400">Overdue Debt: <span className="font-mono text-slate-200">${(overview?.overdueAmount || 0).toLocaleString()} USD</span></p>
            <p className="text-[11px] text-emerald-400 font-semibold font-mono">Growth: +{overview?.monthlyGrowthRate || 0}% 30-Day</p>
          </div>
        </div>
      </div>

      {/* Intelligent Insights List */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-400" />
            Detected Operational Insights ({insights.length})
          </h3>
          <button
            onClick={onNavigateToAgent}
            className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors"
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
                className={`p-5 rounded-2xl border glass-card shadow-xs space-y-3 ${
                  isCritical ? 'border-rose-500/30' :
                  isWarning ? 'border-amber-500/30' :
                  isPositive ? 'border-emerald-500/30' : 'border-slate-800'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
                      isCritical ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                      isWarning ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      isPositive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-dark-950 border border-slate-800 text-slate-400'
                    }`}>
                      {isCritical || isWarning ? <AlertTriangle className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-white">{ins.title}</h4>
                      <span className={`text-[10px] font-bold uppercase ${
                        isCritical ? 'text-rose-400' : isWarning ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        {ins.priority} Priority
                      </span>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold ${
                    isCritical ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                    isWarning ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                    isPositive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-dark-950 text-slate-300 border border-slate-800'
                  }`}>
                    {ins.metric}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  {ins.description}
                </p>

                <div className="pt-2 border-t border-slate-800/60 flex justify-end">
                  <button
                    onClick={onNavigateToAgent}
                    className="text-[11px] font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors"
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
