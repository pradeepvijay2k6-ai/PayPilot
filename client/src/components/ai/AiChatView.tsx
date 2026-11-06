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
  Check
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

  const suggestedPrompts = [
    "Create an invoice for Sarah for $750 for graphic design services, due in 7 days.",
    "Request $300 from Michael for consulting.",
    "Show me all unpaid invoices.",
    "Which customers have overdue payments?",
    "Generate my monthly financial report.",
    "Which customers frequently pay late?"
  ];

  const fetchHistory = async () => {
    try {
      const res = await apiClient.get('/ai/history');
      setMessages(res.data.messages || []);
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
          content: 'Sorry, I encountered an error processing your request: ' + (err.response?.data?.error || err.message),
          createdAt: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!confirm('Clear AI conversation history?')) return;
    try {
      await apiClient.delete('/ai/history');
      await fetchHistory();
    } catch (err: any) {
      alert('Error clearing history: ' + err.message);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Helper to render markdown bold and linebreaks cleanly
  const renderFormattedText = (content: string) => {
    return content.split('\n').map((line, idx) => {
      // Split bold formatting
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <p key={idx} className={line.startsWith('- ') ? 'ml-3 list-disc' : 'my-1'}>
          {parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={pIdx} className="font-bold text-slate-900">{part.slice(2, -2)}</strong>;
            }
            return part;
          })}
        </p>
      );
    });
  };

  return (
    <div className={`flex flex-col bg-white ${fullPage ? 'h-[calc(100vh-4rem)]' : 'h-[600px]'} rounded-xl border border-slate-200/80 shadow-sm overflow-hidden`}>
      {/* Top Header */}
      <div className="px-5 py-3.5 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-paypal-lightBlue flex items-center justify-center text-white shadow-sm shadow-brand-500/20">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">PayPilot Financial Operations Agent</h3>
            <p className="text-[11px] text-slate-500">Autonomous invoice creation, debt tracking & PayPal operations</p>
          </div>
        </div>
        <button
          onClick={handleClearHistory}
          title="Clear Conversation"
          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Suggested Prompts Banner */}
      <div className="px-5 py-2.5 bg-slate-50/70 border-b border-slate-200/60 overflow-x-auto whitespace-nowrap flex gap-2">
        <span className="text-[11px] font-semibold text-slate-400 self-center uppercase tracking-wider flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-brand-600" /> Prompts:
        </span>
        {suggestedPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            className="text-xs bg-white hover:bg-brand-50 hover:text-brand-700 text-slate-600 px-3 py-1 rounded-full border border-slate-200/90 shadow-2xs transition-all active:scale-95 text-left"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/30">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-7 h-7 rounded-lg bg-brand-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`max-w-[85%] ${isUser ? 'bg-brand-600 text-white rounded-2xl rounded-tr-xs px-4 py-2.5 text-sm shadow-sm' : 'bg-white border border-slate-200/80 rounded-2xl rounded-tl-xs p-4 text-xs shadow-xs text-slate-700'}`}>
                {/* Formatted Text Message */}
                <div className={isUser ? 'text-white' : 'text-slate-700 leading-relaxed'}>
                  {renderFormattedText(msg.content)}
                </div>

                {/* Render Action Confirmation Card if requiring approval */}
                {msg.pendingAction && (
                  <ActionConfirmationCard
                    action={msg.pendingAction}
                    onActionCompleted={(successMsg) => {
                      if (onInvoiceCreated) onInvoiceCreated();
                      setMessages((prev) => [
                        ...prev,
                        {
                          id: `conf-${Date.now()}`,
                          role: 'assistant',
                          content: successMsg,
                          createdAt: new Date().toISOString()
                        }
                      ]);
                    }}
                    onCancel={() => {}}
                  />
                )}

                {/* Render Tool Result 1: Payment Request */}
                {msg.toolExecuted === 'create_payment_request' && msg.toolResult && (
                  <div className="mt-3 p-3 bg-brand-50/60 border border-brand-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm">Payment Link Ready</span>
                      <span className="text-xs font-bold text-brand-700">${msg.toolResult.amount?.toFixed(2)} USD</span>
                    </div>
                    <p className="text-slate-600 text-[11px]">{msg.toolResult.description} for {msg.toolResult.customerName}</p>
                    <div className="flex items-center gap-2 pt-1">
                      <a
                        href={msg.toolResult.checkoutUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 bg-paypal-blue hover:bg-paypal-lightBlue text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Open Customer PayPal Checkout</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                )}

                {/* Render Tool Result 2: Invoices list */}
                {(msg.toolExecuted === 'get_unpaid_invoices' || msg.toolExecuted === 'identify_overdue_customers') && msg.toolResult?.invoices && (
                  <div className="mt-3 overflow-hidden rounded-lg border border-slate-200">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-slate-100/80 text-slate-600 uppercase font-semibold">
                        <tr>
                          <th className="p-2">Invoice #</th>
                          <th className="p-2">Customer</th>
                          <th className="p-2">Amount</th>
                          <th className="p-2">Due Date</th>
                          <th className="p-2">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {msg.toolResult.invoices.map((inv: any) => (
                          <tr key={inv.id} className="hover:bg-slate-50">
                            <td className="p-2 font-mono font-semibold text-brand-700">{inv.invoiceNumber}</td>
                            <td className="p-2 font-medium">{inv.customerName}</td>
                            <td className="p-2 font-bold">${inv.amount?.toFixed(2)}</td>
                            <td className="p-2 text-slate-500">{inv.dueDate}</td>
                            <td className="p-2">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                inv.status === 'OVERDUE' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                              }`}>
                                {inv.status === 'OVERDUE' ? `${inv.daysOverdue}d overdue` : inv.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Render Tool Result 3: Customer Payment Delay Analysis */}
                {msg.toolExecuted === 'analyze_customer_payments' && Array.isArray(msg.toolResult) && (
                  <div className="mt-3 overflow-hidden rounded-lg border border-slate-200">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-slate-100/80 text-slate-600 uppercase font-semibold">
                        <tr>
                          <th className="p-2">Customer</th>
                          <th className="p-2">Company</th>
                          <th className="p-2">Overdue Debt</th>
                          <th className="p-2">Avg Delay</th>
                          <th className="p-2">Reliability</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {msg.toolResult.map((c: any) => (
                          <tr key={c.customerId} className="hover:bg-slate-50">
                            <td className="p-2 font-semibold text-slate-800">{c.name}</td>
                            <td className="p-2 text-slate-500">{c.company}</td>
                            <td className="p-2 font-bold text-rose-600">${c.totalOverdueAmount?.toLocaleString()}</td>
                            <td className="p-2 font-medium">{c.avgDelayDays} days</td>
                            <td className="p-2">
                              <div className="flex items-center gap-1.5">
                                <div className="w-12 bg-slate-200 rounded-full h-1.5">
                                  <div
                                    className={`h-1.5 rounded-full ${
                                      c.reliabilityScore > 70 ? 'bg-emerald-500' : c.reliabilityScore > 40 ? 'bg-amber-500' : 'bg-rose-500'
                                    }`}
                                    style={{ width: `${c.reliabilityScore}%` }}
                                  />
                                </div>
                                <span className="font-mono text-[10px]">{c.reliabilityScore}%</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Render Tool Result 4: Financial Report Card */}
                {msg.toolExecuted === 'generate_financial_report' && msg.toolResult && (
                  <div className="mt-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                    <div className="flex justify-between items-center border-b border-slate-200/80 pb-2">
                      <span className="font-bold text-slate-900 text-sm">Monthly Report Summary</span>
                      <span className="text-[11px] font-bold text-brand-600">{msg.toolResult.month}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-white p-2 rounded-lg border border-slate-200/60">
                        <span className="text-[10px] text-slate-500 block">Total Revenue</span>
                        <span className="font-extrabold text-slate-900 text-sm">${msg.toolResult.totalRevenue?.toLocaleString()}</span>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-200/60">
                        <span className="text-[10px] text-slate-500 block">Growth (30d)</span>
                        <span className="font-extrabold text-emerald-600 text-sm">+{msg.toolResult.growthRate}%</span>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-200/60">
                        <span className="text-[10px] text-slate-500 block">Overdue Debt</span>
                        <span className="font-extrabold text-rose-600 text-sm">${msg.toolResult.overdueAmount?.toLocaleString()}</span>
                      </div>
                    </div>

                    {msg.toolResult.topPayingCustomers?.length > 0 && (
                      <div>
                        <span className="text-[11px] font-semibold text-slate-700 block mb-1">Top Revenue Contributors:</span>
                        <div className="space-y-1">
                          {msg.toolResult.topPayingCustomers.map((top: any, tIdx: number) => (
                            <div key={tIdx} className="flex justify-between text-[11px] bg-white px-2 py-1 rounded border border-slate-100">
                              <span className="font-medium text-slate-800">{top.name} ({top.company})</span>
                              <span className="font-bold text-slate-900">${top.totalPaid?.toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Render Tool Result 5: Payment Reminder Draft */}
                {msg.toolExecuted === 'draft_payment_reminder' && msg.toolResult?.body && (
                  <div className="mt-3 p-3 bg-amber-50/60 border border-amber-200 rounded-xl space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-amber-900 text-xs">Email Reminder Draft</span>
                      <button
                        onClick={() => copyToClipboard(msg.toolResult.body, msg.id)}
                        className="flex items-center gap-1 text-[11px] font-semibold text-amber-800 hover:text-amber-950 bg-amber-100 px-2 py-0.5 rounded transition-colors"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy Message</span>
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="text-[11px] text-slate-700 font-sans whitespace-pre-wrap bg-white p-2.5 rounded-lg border border-amber-200/60">
                      {msg.toolResult.body}
                    </pre>
                  </div>
                )}
              </div>

              {isUser && (
                <div className="w-7 h-7 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <UserIcon className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 items-center text-slate-400 text-xs py-2">
            <div className="w-7 h-7 rounded-lg bg-brand-600 text-white flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-slate-200/80 shadow-2xs">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-600" />
              <span>PayPilot Agent is analyzing finances & executing tools...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-3.5 border-t border-slate-200/80 bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask PayPilot e.g. 'Create an invoice for Sarah for $750 for graphic design services'..."
            className="flex-1 bg-slate-50 border border-slate-200/90 rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1.5"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
