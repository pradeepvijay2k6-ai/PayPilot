import React, { useState } from 'react';
import { Bot, X, Sparkles, ChevronUp } from 'lucide-react';
import { AiChatView } from '../ai/AiChatView';

interface FloatingAiWidgetProps {
  onInvoiceCreated?: () => void;
}

export const FloatingAiWidget: React.FC<FloatingAiWidgetProps> = ({ onInvoiceCreated }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="w-[450px] shadow-2xl rounded-2xl overflow-hidden border border-slate-800 bg-dark-900 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className="bg-dark-950 px-4 py-3 flex items-center justify-between text-white border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-brand-500/10 text-brand-400 border border-brand-500/20 flex items-center justify-center">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-semibold text-white">PayPilot Floating Assistant</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="h-[520px]">
            <AiChatView onInvoiceCreated={onInvoiceCreated} fullPage={false} />
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2.5 px-4 py-3 bg-dark-900/90 hover:bg-dark-850 text-white border border-slate-800 hover:border-brand-500/50 rounded-full shadow-lg shadow-black/40 hover:shadow-brand-500/10 transition-all duration-200 active:scale-95 backdrop-blur-md"
        >
          <div className="w-6 h-6 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center">
            <Bot className="w-4 h-4 text-brand-400" />
          </div>
          <span className="text-xs font-semibold tracking-tight text-slate-200 group-hover:text-white">Ask PayPilot</span>
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
          </span>
        </button>
      )}
    </div>
  );
};
