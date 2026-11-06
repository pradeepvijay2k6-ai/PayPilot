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
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      {/* Intro Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-navy-900 to-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-md">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-paypal-lightBlue flex items-center justify-center text-white shadow-lg shadow-brand-500/30">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Autonomous Financial Operations Agent</h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Powered by real-time database calculations & PayPal Sandbox REST APIs.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-300">
          <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Explicit Approval Guard</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
            <Zap className="w-4 h-4 text-paypal-gold" />
            <span>PayPal Sandbox Active</span>
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
