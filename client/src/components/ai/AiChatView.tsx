import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Bot, 
  User as UserIcon, 
  Sparkles, 
  Loader2, 
  Trash2, 
  ExternalLink, 
  AlertCircle,
  FileText,
  DollarSign,
  TrendingUp,
  CreditCard,
  Copy,
  Check,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  Mail,
  Zap,
  Command,
  ArrowRight
} from 'lucide-react';
import { apiClient } from '../../api/client';
import { AiMessageItem } from '../../types';
import { ActionConfirmationCard } from './ActionConfirmationCard';

interface AiChatViewProps {
  onInvoiceCreated?: () => void;
  onNavigateToInvoice?: (invoiceId: string) => void;
  fullPage?: boolean;
}

export const AiChatView: React.FC<AiChatViewProps> = ({
  onInvoiceCreated,
  onNavigateToInvoice,
  fullPage = false
}) => {
  const [messages, setMessages] = useState<AiMessageItem[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const heroSuggestedPrompts = [
    "Analyze my financial performance",
    "Find overdue invoices",
    "Forecast my cash flow",
    "Detect unusual transactions",
    "Prepare payment reminders"
  ];

  const fetchHistory = async () => {
    try {
      const res = await apiClient.get('/ai/history');
      if (res.data.messages && res.data.messages.length > 0) {
        setMessages(res.data.messages);
      } else {
        // Default warm welcome
        setMessages([
          {
            id: 'welcome-init',
            role: 'assistant',
            content: "Welcome to the **PayPilot AI Command Center**. I am your autonomous financial operations agent connected directly to your live SQLite ledger and PayPal Sandbox environment. You can instruct me to create invoices, stage payment requests, audit overdue debtors, or forecast upcoming cash flow.",
            createdAt: new Date().toISOString()
          }
        ]);
      }
    } catch (err: any) {
      console.warn('Could not load AI chat history:', err.message);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    const userMessage: AiMessageItem = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: text,
      createdAt: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await apiClient.post('/ai/chat', { message: text });
      const resp = res.data.response;

      const assistantMessage: AiMessageItem = {
        id: res.data.messageId || `asst-${Date.now()}`,
        role: 'assistant',
        content: resp.message,
        toolExecuted: resp.toolExecuted,
        toolResult: resp.toolResult,
        pendingAction: resp.pendingAction,
        createdAt: new Date().toISOString()
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: `Apologies, I encountered an issue executing that command: ${err.response?.data?.error || err.message}`,
          createdAt: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = async () => {
    if (!window.confirm('Clear AI Command Center session?')) return;
    try {
      await apiClient.delete('/ai/conversations');
      setMessages([
        {
          id: 'cleared-init',
          role: 'assistant',
          content: "AI session memory cleared. What financial operations would you like to perform?",
          createdAt: new Date().toISOString()
        }
      ]);
    } catch (err: any) {
      alert('Could not clear history: ' + err.message);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Structured Tool Result Renderer
  const renderToolResult = (toolExecuted?: string, toolResult?: any) => {
    if (!toolResult) return null;

    // Tool 1: Unpaid Invoices
    if (toolExecuted === 'get_unpaid_invoices' && toolResult.invoices) {
      return (
        <div className="mt-3 p-3.5 bg-dark-900/90 rounded-xl border border-slate-800 space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-300 font-bold border-b border-slate-800 pb-2">
            <span className="flex items-center gap-1.5 text-blue-400">
              <FileText className="w-4 h-4" />
              Unsettled Invoices ({toolResult.invoices.length})
            </span>
            <span className="text-white font-mono font-extrabold">${toolResult.totalUnpaidAmount?.toLocaleString()}</span>
          </div>
          <div className="divide-y divide-slate-800/60 max-h-48 overflow-y-auto">
            {toolResult.invoices.map((inv: any) => (
              <div key={inv.id} className="py-2 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white block">{inv.invoiceNumber} • {inv.customerName}</span>
                  <span className="text-[10px] text-slate-400 font-medium">{inv.isOverdue ? `${inv.daysOverdue}d overdue` : `Due ${inv.dueDate}`}</span>
                </div>
                <div className="text-right flex items-center gap-2">
                  <span className={`font-mono font-bold ${inv.isOverdue ? 'text-rose-400' : 'text-slate-200'}`}>
                    ${inv.amount.toLocaleString()}
                  </span>
                  {onNavigateToInvoice && (
                    <button
                      onClick={() => onNavigateToInvoice(inv.id)}
                      className="p-1 rounded text-slate-400 hover:text-brand-400 hover:bg-dark-800 transition-colors"
                      title="Inspect Invoice"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Tool 2: Overdue Customers Analysis
    if (toolExecuted === 'identify_overdue_customers' && toolResult.overdueCustomers) {
      return (
        <div className="mt-3 p-3.5 bg-dark-900/90 rounded-xl border border-rose-500/30 space-y-2 text-xs">
          <div className="flex items-center justify-between text-rose-400 font-bold border-b border-slate-800 pb-2">
            <span className="flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              Delinquent Accounts ({toolResult.overdueCustomers.length})
            </span>
            <span className="font-mono text-white font-extrabold">${toolResult.totalOverdueDebt?.toLocaleString()}</span>
          </div>
          <div className="space-y-2 pt-1">
            {toolResult.overdueCustomers.map((c: any) => (
              <div key={c.customerId} className="p-2.5 rounded-lg bg-dark-850/80 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white block">{c.name}</span>
                  <span className="text-[10px] text-slate-400">{c.company} • Delay: {c.avgDelayDays} days</span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-rose-400 block">${c.totalOverdueAmount?.toLocaleString()}</span>
                  <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                    Reliability {c.reliabilityScore}/100
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Tool 3: Monthly Financial Report
    if (toolExecuted === 'generate_financial_report' && toolResult.overview) {
      return (
        <div className="mt-3 p-4 bg-dark-900/90 rounded-xl border border-brand-500/30 space-y-3 text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-bold text-white flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-brand-400" />
              Executive Financial Summary
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              +{toolResult.overview.growthRate}% MoM
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="bg-dark-850 p-2.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Total Revenue</span>
              <span className="text-sm font-extrabold text-white">${toolResult.overview.totalRevenue?.toLocaleString()}</span>
            </div>
            <div className="bg-dark-850 p-2.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Overdue Capital</span>
              <span className="text-sm font-extrabold text-rose-400">${toolResult.overview.overdueAmount?.toLocaleString()}</span>
            </div>
          </div>
        </div>
      );
    }

    // Tool 4: Payment Request Created
    if (toolExecuted === 'create_payment_request' && toolResult.checkoutUrl) {
      return (
        <div className="mt-3 p-4 bg-gradient-to-r from-brand-950/40 via-dark-850 to-dark-900 rounded-xl border border-brand-500/40 space-y-3 text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-bold text-white flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-brand-400" />
              Payment Request Ready (${toolResult.amount?.toFixed(2)})
            </span>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              PayPal Order Prepared
            </span>
          </div>

          <div className="bg-dark-900 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between gap-2">
            <span className="font-mono text-[11px] text-slate-300 truncate">{toolResult.checkoutUrl}</span>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => copyToClipboard(toolResult.checkoutUrl, toolResult.paymentRequestId)}
                className="p-1.5 rounded-md bg-dark-800 hover:bg-dark-750 text-slate-300 text-xs flex items-center gap-1 border border-slate-700"
              >
                {copiedId === toolResult.paymentRequestId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedId === toolResult.paymentRequestId ? 'Copied' : 'Copy'}</span>
              </button>
              <a
                href={toolResult.checkoutUrl}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 rounded-md bg-brand-600 hover:bg-brand-500 text-white text-xs flex items-center gap-1 font-semibold"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Checkout</span>
              </a>
            </div>
          </div>
        </div>
      );
    }

    // Tool 5: Draft Payment Reminder
    if (toolExecuted === 'draft_payment_reminder' && toolResult.reminderDraft) {
      return (
        <div className="mt-3 p-4 bg-dark-900/90 rounded-xl border border-slate-800 space-y-2 text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-accent-cyan" />
              Prepared Reminder Notice
            </span>
            <button
              onClick={() => copyToClipboard(toolResult.reminderDraft.body, 'draft-body')}
              className="text-[11px] font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1"
            >
              {copiedId === 'draft-body' ? 'Copied Body!' : 'Copy Notice'}
            </button>
          </div>
          <div className="bg-dark-850 p-3 rounded-lg border border-slate-800/80 font-mono text-[11px] text-slate-300 whitespace-pre-line leading-relaxed">
            {toolResult.reminderDraft.body}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className={`flex flex-col ${fullPage ? 'h-[720px]' : 'h-[580px]'} glass-card rounded-2xl border border-slate-800/80 shadow-2xl overflow-hidden relative`}>
      {/* Header Bar */}
      <div className="h-14 px-5 bg-dark-900/95 border-b border-slate-800/80 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-purple flex items-center justify-center text-white shadow-md shadow-brand-500/20">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-bold text-white">AI Command Center</h2>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <p className="text-[10px] text-slate-400">Natural language PayPal operations & ledger reasoning</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleClearChat}
            title="Reset conversation"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-dark-800 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Suggested Hero Prompts Row */}
      <div className="px-5 py-2.5 bg-dark-950/50 border-b border-slate-800/60 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
        <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 shrink-0 mr-1">
          <Sparkles className="w-3.5 h-3.5 text-brand-400" />
          Command Prompts:
        </span>
        {heroSuggestedPrompts.map((promptText, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(promptText)}
            disabled={loading}
            className="text-xs font-medium text-slate-300 bg-dark-850 hover:bg-dark-800 hover:text-white px-3 py-1 rounded-full border border-slate-700/60 whitespace-nowrap transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            {promptText}
          </button>
        ))}
      </div>

      {/* Messages Thread Container */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-center gap-2 mb-1 px-1">
              <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500">
                {msg.role === 'user' ? 'You' : 'PayPilot AI'}
              </span>
              <span className="text-[9px] font-mono text-slate-500">
                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            {msg.role === 'user' ? (
              <div className="bg-gradient-to-r from-brand-600 to-indigo-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 text-xs md:text-sm max-w-lg shadow-md border border-white/10 font-medium leading-relaxed">
                {msg.content}
              </div>
            ) : (
              <div className="w-full max-w-3xl bg-dark-850/95 text-slate-100 rounded-2xl rounded-tl-sm border border-slate-700/70 p-4 shadow-xl space-y-3">
                {/* Text Content */}
                <div className="text-xs md:text-sm text-slate-200 whitespace-pre-line leading-relaxed font-sans">
                  {msg.content}
                </div>

                {/* Structured Tool Output if any */}
                {renderToolResult(msg.toolExecuted, msg.toolResult)}

                {/* Explicit Action Confirmation Card if required */}
                {msg.pendingAction && (
                  <ActionConfirmationCard
                    action={msg.pendingAction}
                    onActionCompleted={(successMsg) => {
                      if (onInvoiceCreated) onInvoiceCreated();
                      handleSendMessage("Invoice confirmed and registered.");
                    }}
                    onCancel={() => {
                      handleSendMessage("Action cancelled.");
                    }}
                  />
                )}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-dark-800 border border-slate-700 flex items-center justify-center text-brand-400 animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-dark-850 border border-slate-700/70 rounded-2xl rounded-tl-sm p-4 text-xs text-slate-400 space-y-2">
              <div className="flex items-center gap-2 text-white font-semibold">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-400" />
                <span>PayPilot AI analyzing financial records...</span>
              </div>
              <p className="text-[11px] text-slate-500">Querying live database & computing PayPal sandbox tool operations.</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Hero Command Input Bar */}
      <div className="p-4 bg-dark-900/95 border-t border-slate-800/80 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2 bg-dark-950 p-1.5 rounded-2xl border border-slate-700/80 focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500 transition-all shadow-inner"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask PayPilot anything about your business finances..."
            disabled={loading}
            className="flex-1 bg-transparent px-4 py-2 text-xs md:text-sm text-white placeholder-slate-500 outline-none"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-brand-600 hover:bg-brand-500 disabled:opacity-40 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-brand-600/30 transition-all active:scale-95 shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Execute</span>
          </button>
        </form>
      </div>
    </div>
  );
};
