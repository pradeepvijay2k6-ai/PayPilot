import React, { useState, useEffect, useRef } from 'react';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  ShieldCheck, 
  Send, 
  Sparkles, 
  Clock, 
  DollarSign, 
  UserCheck, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp,
  Mail,
  Zap,
  Info,
  Activity,
  Layers,
  ArrowRight
} from 'lucide-react';
import { apiClient } from '../api/client';
import { MultiAgentResponse, AgentStatusInfo } from '../types';

interface Message {
  id: string;
  sender: 'user' | 'orchestrator';
  text?: string;
  data?: MultiAgentResponse;
  timestamp: string;
}

export const MultiAgentPage: React.FC = () => {
  const [agents, setAgents] = useState<AgentStatusInfo[]>([
    { name: 'Finance Agent', role: 'Revenue Velocity & Cash Forecasting', status: 'READY', dataPoints: '4 settled transactions analyzed' },
    { name: 'Collections Agent', role: 'Overdue Recovery & Debtor Sequencing', status: 'READY', dataPoints: '3 overdue records monitored' },
    { name: 'Risk Agent', role: 'Transaction Anomaly & Integrity Guard', status: 'READY', dataPoints: '4 transaction logs audited' },
  ]);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeAgentTab, setActiveAgentTab] = useState<'all' | 'finance' | 'collections' | 'risk'>('all');
  const [timelineExpanded, setTimelineExpanded] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await apiClient.get('/multi-agent/status');
        if (res.data?.agents) {
          setAgents(res.data.agents);
        }
      } catch (err) {
        console.warn('Agent status note:', err);
      }
    };
    fetchStatus();

    setMessages([
      {
        id: 'welcome-multi-agent',
        sender: 'orchestrator',
        text: 'Welcome to the **Multi-Agent Financial Intelligence System**. I coordinate three specialized AI agents executing in parallel across your live database records: **Finance Agent** (revenue velocity & 7/30d liquidity forecasting), **Collections Agent** (delinquent debtor sequencing & reminder preparation), and **Risk Agent** (outlier detection & transaction audit). Enter a question or select a strategic query below to dispatch the council.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (queryText?: string) => {
    const query = queryText || input;
    if (!query.trim() || loading) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await apiClient.post('/multi-agent/chat', { message: query });
      const orchMsg: Message = {
        id: `orch-${Date.now()}`,
        sender: 'orchestrator',
        data: res.data,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, orchMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        sender: 'orchestrator',
        text: `Error orchestrating agents: ${err.response?.data?.error || err.message}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const sampleQueries = [
    { label: 'Revenue Decline Audit', query: 'My business revenue is declining. Find out why and tell me what I should do.' },
    { label: 'Delinquent Debtors', query: 'Which customers owe me money, how late are they, and who should I contact first?' },
    { label: 'Risk & Anomalies', query: 'Run a transaction security and anomaly audit on my PayPal ledger.' },
    { label: 'Cash Flow Forecast', query: 'Forecast my incoming payments for the next 7 and 30 days and check cash flow.' },
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-dark-900 via-dark-850 to-dark-900 border border-slate-800/80 p-6 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-accent-purple flex items-center justify-center text-white shadow-lg shadow-brand-500/25 shrink-0 border border-white/10">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-white tracking-tight">Multi-Agent Financial Intelligence</h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/30">
                  COUNCIL OF 3
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Central AI Orchestrator with parallelized Finance, Collections, and Risk agents operating on real database facts.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3.5 py-1.5 rounded-xl text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Orchestrator Online • 3 Agents Synchronized</span>
          </div>
        </div>
      </div>

      {/* 3 Specialized Agent Telemetry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Finance Agent */}
        <div className="glass-card rounded-2xl p-5 border border-blue-500/20 hover:border-blue-500/40 transition-all space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white">Finance Agent</h3>
                <span className="text-[10px] text-blue-400 font-medium">Revenue & Liquidity</span>
              </div>
            </div>
            <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
              ONLINE
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Computes revenue velocity, runs linear 7/30d incoming forecasts, and raises liquidity deficit warnings.
          </p>
          <div className="text-[11px] text-slate-300 bg-dark-900/90 px-3 py-1.5 rounded-lg border border-slate-800 flex items-center gap-2">
            <DollarSign className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-mono text-[10px]">{agents.find(a => a.name.includes('Finance'))?.dataPoints || '4 transactions analyzed'}</span>
          </div>
        </div>

        {/* Collections Agent */}
        <div className="glass-card rounded-2xl p-5 border border-amber-500/20 hover:border-amber-500/40 transition-all space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white">Collections Agent</h3>
                <span className="text-[10px] text-amber-400 font-medium">Debt Recovery</span>
              </div>
            </div>
            <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
              ONLINE
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Identifies delinquent invoices, computes delay days, sequences debtors by reliability score, and drafts notices.
          </p>
          <div className="text-[11px] text-slate-300 bg-dark-900/90 px-3 py-1.5 rounded-lg border border-slate-800 flex items-center gap-2">
            <UserCheck className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-mono text-[10px]">{agents.find(a => a.name.includes('Collections'))?.dataPoints || '3 overdue records monitored'}</span>
          </div>
        </div>

        {/* Risk Agent */}
        <div className="glass-card rounded-2xl p-5 border border-purple-500/20 hover:border-purple-500/40 transition-all space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-accent-purple/10 text-accent-purple flex items-center justify-center border border-accent-purple/20">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white">Risk Agent</h3>
                <span className="text-[10px] text-purple-400 font-medium">Integrity & Audit</span>
              </div>
            </div>
            <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
              ONLINE
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Audits duplicate orders, flags high-variance outlier amounts, and isolates unlinked settlements without false claims.
          </p>
          <div className="text-[11px] text-slate-300 bg-dark-900/90 px-3 py-1.5 rounded-lg border border-slate-800 flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-accent-purple" />
            <span className="font-mono text-[10px]">{agents.find(a => a.name.includes('Risk'))?.dataPoints || '4 transaction logs audited'}</span>
          </div>
        </div>
      </div>

      {/* Suggested Strategic Queries */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-brand-400" />
          Cross-Agent Strategic Inquiries:
        </span>
        {sampleQueries.map((sq, i) => (
          <button
            key={i}
            onClick={() => handleSend(sq.query)}
            disabled={loading}
            className="text-xs bg-dark-850 hover:bg-dark-800 text-slate-300 hover:text-white border border-slate-700/60 px-3.5 py-1.5 rounded-xl transition-all shadow-sm disabled:opacity-50 active:scale-95"
          >
            {sq.label} →
          </button>
        ))}
      </div>

      {/* Main Orchestration & Conversation Workspace */}
      <div className="glass-card rounded-2xl border border-slate-800/80 shadow-2xl overflow-hidden flex flex-col h-[650px]">
        {/* Messages Thread Container */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
              <div className="flex items-center gap-2 mb-1 px-1">
                <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500">
                  {msg.sender === 'user' ? 'You' : 'Central AI Orchestrator'}
                </span>
                <span className="text-[9px] font-mono text-slate-500">{msg.timestamp}</span>
              </div>

              {msg.sender === 'user' ? (
                <div className="bg-gradient-to-r from-brand-600 to-indigo-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 text-xs md:text-sm max-w-xl shadow-md border border-white/10 font-medium leading-relaxed">
                  {msg.text}
                </div>
              ) : (
                <div className="w-full max-w-4xl bg-dark-850/95 text-slate-100 rounded-2xl rounded-tl-sm border border-slate-700/70 p-5 space-y-4 shadow-xl">
                  {msg.text && (
                    <div className="text-xs md:text-sm text-slate-200 whitespace-pre-line leading-relaxed">
                      {msg.text}
                    </div>
                  )}

                  {msg.data && (
                    <div className="space-y-4">
                      {/* Active Council Header & Execution Timeline Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-dark-900 rounded-xl border border-slate-800">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-300">Agents Involved:</span>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {msg.data.agentsInvolved.map((agentName, idx) => (
                              <span
                                key={idx}
                                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                                  agentName === 'Finance Agent'
                                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                                    : agentName === 'Collections Agent'
                                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                                    : 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                                }`}
                              >
                                {agentName === 'Finance Agent' && <TrendingUp className="w-3 h-3" />}
                                {agentName === 'Collections Agent' && <AlertTriangle className="w-3 h-3" />}
                                {agentName === 'Risk Agent' && <ShieldCheck className="w-3 h-3" />}
                                {agentName}
                              </span>
                            ))}
                          </div>
                        </div>

                        {msg.data.executionTimeline && (
                          <button
                            onClick={() => setTimelineExpanded(!timelineExpanded)}
                            className="text-[10px] font-mono text-slate-400 hover:text-white flex items-center gap-1.5 bg-dark-800 px-2.5 py-1 rounded-lg border border-slate-700/60"
                          >
                            <Clock className="w-3 h-3 text-brand-400" />
                            <span>Execution Latency ({msg.data.executionTimeline.length} agents)</span>
                            {timelineExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>
                        )}
                      </div>

                      {/* Execution Timeline (Collapsible) */}
                      {timelineExpanded && msg.data.executionTimeline && (
                        <div className="bg-dark-900/90 rounded-xl border border-slate-800 p-4 space-y-2 text-xs">
                          <h4 className="font-bold text-slate-300 text-[10px] uppercase tracking-wider flex items-center gap-1.5">
                            <Activity className="w-3.5 h-3.5 text-brand-400" />
                            Parallel Agent Execution Trace
                          </h4>
                          <div className="divide-y divide-slate-800">
                            {msg.data.executionTimeline.map((step, i) => (
                              <div key={i} className="py-2 flex items-center justify-between text-slate-300">
                                <div className="flex items-center gap-2">
                                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                                  <span className="font-bold text-white">{step.agent}</span>
                                  <span className="text-slate-400 text-[11px] truncate max-w-md">{step.summary}</span>
                                </div>
                                <span className="font-mono text-[10px] bg-dark-800 px-2 py-0.5 rounded text-brand-300 border border-slate-700/60">
                                  {step.durationMs}ms
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Combined Executive Synthesis */}
                      <div className="bg-dark-900/95 rounded-xl border border-slate-800 p-5 space-y-3">
                        <div className="flex items-center gap-2 text-brand-400">
                          <Brain className="w-4 h-4" />
                          <h3 className="font-bold text-white text-sm">Orchestrated Cross-Agent Synthesis</h3>
                        </div>
                        <div className="text-xs text-slate-300 whitespace-pre-line leading-relaxed border-l-2 border-brand-500 pl-3.5">
                          {msg.data.combinedAnalysis}
                        </div>
                      </div>

                      {/* Agent Findings Tabs */}
                      <div className="bg-dark-900/95 rounded-xl border border-slate-800 p-4 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5 text-slate-400" />
                            Specialized Agent Reports
                          </h4>
                          <div className="flex items-center gap-1 bg-dark-800 p-0.5 rounded-lg text-xs">
                            <button
                              onClick={() => setActiveAgentTab('all')}
                              className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${
                                activeAgentTab === 'all' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              All
                            </button>
                            {msg.data.agentFindings.finance && (
                              <button
                                onClick={() => setActiveAgentTab('finance')}
                                className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${
                                  activeAgentTab === 'finance' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                                }`}
                              >
                                Finance
                              </button>
                            )}
                            {msg.data.agentFindings.collections && (
                              <button
                                onClick={() => setActiveAgentTab('collections')}
                                className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${
                                  activeAgentTab === 'collections' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
                                }`}
                              >
                                Collections
                              </button>
                            )}
                            {msg.data.agentFindings.risk && (
                              <button
                                onClick={() => setActiveAgentTab('risk')}
                                className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${
                                  activeAgentTab === 'risk' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                                }`}
                              >
                                Risk
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Finance Findings */}
                        {(activeAgentTab === 'all' || activeAgentTab === 'finance') && msg.data.agentFindings.finance && (
                          <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-blue-300 flex items-center gap-1.5">
                                <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
                                Finance Agent Findings
                              </span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/30">
                                Posture: {msg.data.agentFindings.finance.status}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center">
                              <div className="bg-dark-900 p-2.5 rounded-lg border border-slate-800">
                                <span className="text-[10px] text-slate-400 block font-medium">Settled Revenue</span>
                                <span className="text-sm font-extrabold text-white">${msg.data.agentFindings.finance.metrics.totalRevenue.toLocaleString()}</span>
                              </div>
                              <div className="bg-dark-900 p-2.5 rounded-lg border border-slate-800">
                                <span className="text-[10px] text-slate-400 block font-medium">7-Day Forecast</span>
                                <span className="text-sm font-extrabold text-blue-400">${msg.data.agentFindings.finance.metrics.forecastNext7Days.toLocaleString()}</span>
                              </div>
                              <div className="bg-dark-900 p-2.5 rounded-lg border border-slate-800">
                                <span className="text-[10px] text-slate-400 block font-medium">30-Day Forecast</span>
                                <span className="text-sm font-extrabold text-indigo-400">${msg.data.agentFindings.finance.metrics.forecastNext30Days.toLocaleString()}</span>
                              </div>
                              <div className="bg-dark-900 p-2.5 rounded-lg border border-slate-800">
                                <span className="text-[10px] text-slate-400 block font-medium">Cash Flow Risk</span>
                                <span className={`text-xs font-bold ${
                                  msg.data.agentFindings.finance.metrics.cashFlowHealth === 'DEFICIT_RISK' ? 'text-rose-400' : 'text-emerald-400'
                                }`}>
                                  {msg.data.agentFindings.finance.metrics.cashFlowHealth}
                                </span>
                              </div>
                            </div>

                            <div className="text-xs text-slate-300 space-y-1">
                              <span className="font-bold text-white block text-[11px]">Observed Revenue Trends:</span>
                              {msg.data.agentFindings.finance.trends.map((t, idx) => (
                                <p key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-400">
                                  <span className="text-blue-400 font-bold">•</span>
                                  <span>{t}</span>
                                </p>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Collections Findings */}
                        {(activeAgentTab === 'all' || activeAgentTab === 'collections') && msg.data.agentFindings.collections && (
                          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                                Collections Agent Findings
                              </span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                                Overdue: ${msg.data.agentFindings.collections.metrics.totalOverdueAmount.toLocaleString()}
                              </span>
                            </div>

                            {msg.data.agentFindings.collections.prioritizedCustomers.length > 0 && (
                              <div className="space-y-2">
                                <span className="font-bold text-white block text-[11px]">
                                  Recommended Contact Sequence (Ranked by Debt & Delay):
                                </span>
                                <div className="space-y-2">
                                  {msg.data.agentFindings.collections.prioritizedCustomers.map((cust) => (
                                    <div key={cust.customerId} className="bg-dark-900 p-3 rounded-lg border border-slate-800 space-y-2">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-900 text-[10px] font-extrabold flex items-center justify-center">
                                            #{cust.recommendedContactSequence}
                                          </span>
                                          <div>
                                            <span className="font-bold text-xs text-white">{cust.customerName}</span>
                                            <span className="text-[10px] text-slate-400 block">{cust.company}</span>
                                          </div>
                                        </div>
                                        <div className="text-right">
                                          <span className="text-xs font-extrabold text-rose-400 block">${cust.totalOverdueAmount.toLocaleString()} overdue</span>
                                          <span className="text-[10px] text-slate-400 font-medium">{cust.avgDelayDays} days late • Reliability {cust.reliabilityScore}/100</span>
                                        </div>
                                      </div>

                                      <div className="bg-dark-950 p-2.5 rounded border border-slate-800 text-[11px] text-slate-400 space-y-1">
                                        <div className="flex items-center justify-between text-slate-400 font-semibold text-[10px]">
                                          <span className="flex items-center gap-1">
                                            <Mail className="w-3 h-3 text-brand-400" />
                                            Prepared Reminder Draft
                                          </span>
                                          <span className="text-emerald-400 font-bold">Staged in Automation Center</span>
                                        </div>
                                        <p className="font-semibold text-slate-200">{cust.draftReminder.subject}</p>
                                        <p className="italic text-slate-400 truncate">{cust.draftReminder.body.slice(0, 110)}...</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Risk Findings */}
                        {(activeAgentTab === 'all' || activeAgentTab === 'risk') && msg.data.agentFindings.risk && (
                          <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                                Risk Agent Findings
                              </span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/30">
                                Posture: {msg.data.agentFindings.risk.metrics.riskPosture}
                              </span>
                            </div>

                            <div className="text-xs text-slate-300 space-y-1">
                              {msg.data.agentFindings.risk.riskObservations.map((obs, idx) => (
                                <p key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-400">
                                  <span className="text-purple-400 font-bold">•</span>
                                  <span>{obs}</span>
                                </p>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Recommended Actions */}
                      {msg.data.recommendedActions.length > 0 && (
                        <div className="bg-gradient-to-r from-brand-950/40 via-dark-850 to-dark-900 rounded-xl border border-brand-500/30 p-4 space-y-2">
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                            <Zap className="w-3.5 h-3.5 text-brand-400" />
                            Orchestrator Recommended Action Plan
                          </h4>
                          <div className="space-y-1.5">
                            {msg.data.recommendedActions.map((action, idx) => (
                              <div key={idx} className="flex items-start gap-2 text-xs text-slate-200 bg-dark-900/80 p-2.5 rounded-lg border border-slate-800">
                                <span className="w-4 h-4 rounded-full bg-brand-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                                  {idx + 1}
                                </span>
                                <span className="leading-tight">{action}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-dark-800 border border-slate-700 flex items-center justify-center text-brand-400 animate-spin">
                <Brain className="w-4 h-4" />
              </div>
              <div className="bg-dark-850 border border-slate-700 rounded-2xl rounded-tl-sm p-4 text-xs text-slate-400 space-y-2">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <div className="w-2 h-2 rounded-full bg-brand-400 animate-ping"></div>
                  <span>Dispatching multi-agent council in parallel...</span>
                </div>
                <div className="text-[11px] text-slate-500 pl-4 space-y-1 border-l border-slate-700">
                  <p>• Finance Agent: calculating 7d/30d cash-flow trajectory...</p>
                  <p>• Collections Agent: auditing delinquent accounts and aging...</p>
                  <p>• Risk Agent: scanning duplicate orders and transaction variances...</p>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-dark-900/95 border-t border-slate-800/80 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2 bg-dark-950 p-1.5 rounded-2xl border border-slate-700/80 focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500 transition-all shadow-inner"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask the Multi-Agent council (e.g. 'My revenue is declining, find out why and what to do')..."
              disabled={loading}
              className="flex-1 bg-transparent px-4 py-2 text-xs md:text-sm text-white placeholder-slate-500 outline-none"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-brand-600 hover:bg-brand-500 disabled:opacity-40 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-brand-600/30 transition-all active:scale-95 shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Orchestrate</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
