import React from 'react';
import { AiChatView } from '../components/ai/AiChatView';
import { Bot, Sparkles, ShieldCheck, Zap } from 'lucide-react';

interface AiAgentPageProps {
  onInvoiceCreated: () => void;
  onNavigateToInvoice: (invoiceId: string) => void;
}

export const AiAgentPage: React.FC<AiAgentPageProps> = ({
  onInvoiceCreated,
  onNavigateToInvoice
}) => {
  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      {/* Hero Intro Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-dark-900 via-dark-850 to-dark-900 border border-slate-800/80 p-6 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-accent-purple flex items-center justify-center text-white shadow-lg shadow-brand-500/25 shrink-0 border border-white/10">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-white tracking-tight">AI Command Center</h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/30">
                  HERO AGENT
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Execute natural language financial workflows, create invoices, draft reminder notices, and query database intelligence.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 text-xs">
            <div className="flex items-center gap-1.5 bg-dark-800/90 px-3 py-1.5 rounded-xl border border-slate-700/60 text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Explicit Approval Guard</span>
            </div>
            <div className="flex items-center gap-1.5 bg-dark-800/90 px-3 py-1.5 rounded-xl border border-slate-700/60 text-slate-300">
              <Zap className="w-4 h-4 text-paypal-gold" />
              <span>PayPal Orders v2</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main AI Chat Workspace */}
      <AiChatView
        fullPage={true}
        onInvoiceCreated={onInvoiceCreated}
        onNavigateToInvoice={onNavigateToInvoice}
      />
    </div>
  );
};
