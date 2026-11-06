import React, { useState } from 'react';
import { Plus, Send, Bot, RefreshCw, CheckCircle2 } from 'lucide-react';
import { apiClient } from '../../api/client';

interface HeaderProps {
  title: string;
  subtitle: string;
  onOpenCreateInvoice: () => void;
  onOpenPaymentRequest: () => void;
  onOpenAiChat: () => void;
  onDataRefreshed?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onOpenCreateInvoice,
  onOpenPaymentRequest,
  onOpenAiChat,
  onDataRefreshed
}) => {
  const [resetting, setResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleResetDemoData = async () => {
    try {
      setResetting(true);
      await apiClient.post('/settings/reset-demo');
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 3000);
      if (onDataRefreshed) onDataRefreshed();
    } catch (err: any) {
      alert('Could not reset demo data: ' + err.message);
    } finally {
      setResetting(false);
    }
  };

  return (
    <header className="h-16 px-8 bg-white border-b border-slate-200/80 flex items-center justify-between sticky top-0 z-20 shadow-sm/50">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h1>
        <p className="text-xs text-slate-500 font-medium">{subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        {/* Reset Demo Data for Hackathon Judges */}
        <button
          onClick={handleResetDemoData}
          disabled={resetting}
          title="Reset sample invoices, customers, and PayPal transactions"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all border border-slate-200/80 active:scale-95"
        >
          {resetSuccess ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-700">Database Seeded</span>
            </>
          ) : (
            <>
              <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${resetting ? 'animate-spin' : ''}`} />
              <span>Reset Demo Data</span>
            </>
          )}
        </button>

        {/* Ask AI Agent quick action */}
        <button
          onClick={onOpenAiChat}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-lg border border-brand-200 transition-all shadow-sm active:scale-95"
        >
          <Bot className="w-4 h-4 text-brand-600" />
          <span>Ask PayPilot AI</span>
        </button>

        {/* Request Payment */}
        <button
          onClick={onOpenPaymentRequest}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 rounded-lg border border-slate-300 transition-all shadow-sm active:scale-95"
        >
          <Send className="w-3.5 h-3.5 text-slate-500" />
          <span>Request Payment</span>
        </button>

        {/* Create Invoice button */}
        <button
          onClick={onOpenCreateInvoice}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm shadow-brand-600/30 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Create Invoice</span>
        </button>
      </div>
    </header>
  );
};
