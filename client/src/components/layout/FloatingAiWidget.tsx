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
        <div className="w-[450px] shadow-2xl rounded-2xl overflow-hidden border border-slate-300 bg-white animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className="bg-navy-900 px-4 py-3 flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-brand-600 flex items-center justify-center text-white">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold">PayPilot Floating Assistant</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
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
          className="group flex items-center gap-2.5 px-4 py-3 bg-gradient-to-tr from-brand-600 to-paypal-lightBlue hover:from-brand-700 hover:to-paypal-blue text-white rounded-full shadow-lg shadow-brand-600/30 hover:shadow-brand-600/50 transition-all duration-200 active:scale-95"
        >
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <span className="text-xs font-bold tracking-tight">Ask PayPilot</span>
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
          </span>
        </button>
      )}
    </div>
  );
};
