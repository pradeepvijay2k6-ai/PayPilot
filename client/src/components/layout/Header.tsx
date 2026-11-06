import React, { useState } from 'react';
import { Plus, Send, Bot, RefreshCw, CheckCircle2, Sparkles, Command, QrCode } from 'lucide-react';
import { apiClient } from '../../api/client';
import { ThemeToggle } from '../common/ThemeToggle';

interface HeaderProps {
  title: string;
  subtitle: string;
  onOpenCreateInvoice: () => void;
  onOpenPaymentRequest: () => void;
  onOpenAiChat: () => void;
  onOpenQrPay: () => void;
  onOpenCommandPalette: () => void;
  onDataRefreshed?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onOpenCreateInvoice,
  onOpenPaymentRequest,
  onOpenAiChat,
  onOpenQrPay,
  onOpenCommandPalette,
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
    <header className="h-16 px-4 md:px-6 bg-dark-900/90 backdrop-blur-md border-b border-slate-800/80 flex items-center justify-between sticky top-0 z-20 transition-colors">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-sm md:text-base font-bold text-white tracking-tight flex items-center gap-2">
            <span>{title}</span>
          </h1>
          <p className="text-[11px] text-slate-400 font-medium hidden sm:block">{subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-2.5">
        {/* Quick Command Palette Shortcut Button */}
        <button
          onClick={onOpenCommandPalette}
          title="Quick Command Palette (Ctrl+K)"
          className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-400 bg-dark-850 hover:bg-dark-800 hover:text-white rounded-xl border border-slate-700/60 transition-all active:scale-95"
        >
          <Command className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[10px] font-mono">⌘K</span>
        </button>

        {/* Light & Dark Mode Toggle Switch */}
        <ThemeToggle />

        {/* Instant QR Pay Generator */}
        <button
          onClick={onOpenQrPay}
          title="Instant QR Code Payment Generator"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-dark-850 hover:bg-dark-800 rounded-xl border border-slate-700/60 transition-all active:scale-95 shadow-sm"
        >
          <QrCode className="w-3.5 h-3.5 text-brand-400" />
          <span className="hidden sm:inline">QR Pay</span>
        </button>

        {/* Reset Demo Data button for Hackathon judges */}
        <button
          onClick={handleResetDemoData}
          disabled={resetting}
          title="Reset sample invoices, customers, and PayPal transactions"
          className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 bg-dark-850 hover:bg-dark-800 rounded-xl transition-all border border-slate-700/60 active:scale-95"
        >
          {resetSuccess ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 text-[11px]">Database Reset</span>
            </>
          ) : (
            <>
              <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${resetting ? 'animate-spin' : ''}`} />
              <span className="text-[11px] text-slate-300">Reset Demo Data</span>
            </>
          )}
        </button>

        {/* Hero AI Command Center Trigger */}
        <button
          onClick={onOpenAiChat}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-brand-600 via-indigo-600 to-accent-purple hover:brightness-110 rounded-xl border border-white/10 shadow-lg shadow-brand-500/20 transition-all active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5 text-brand-200" />
          <span>AI Agent</span>
        </button>

        {/* Request Payment */}
        <button
          onClick={onOpenPaymentRequest}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 bg-dark-850 hover:bg-dark-800 rounded-xl border border-slate-700/60 transition-all active:scale-95"
        >
          <Send className="w-3.5 h-3.5 text-slate-400" />
          <span>Request</span>
        </button>

        {/* Create Invoice button */}
        <button
          onClick={onOpenCreateInvoice}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-lg shadow-brand-600/25 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden xs:inline">New Invoice</span>
        </button>
      </div>
    </header>
  );
};
