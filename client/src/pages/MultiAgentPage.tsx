import React, { useState, useEffect, useRef } from 'react';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  ShieldCheck, 
  Send, 
  Sparkles, 
  Clock, 
  ArrowRight, 
  DollarSign, 
  UserCheck, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp,
  Mail,
  Zap,
  Info
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
    { name: 'Finance Agent', role: 'Revenue Velocity & Cash Forecasting', status: 'READY', dataPoints: 'Auditing ledger...' },
    { name: 'Collections Agent', role: 'Overdue Recovery & Debtor Sequencing', status: 'READY', dataPoints: 'Monitoring aging...' },
    { name: 'Risk Agent', role: 'Transaction Anomaly & Integrity Guard', status: 'READY', dataPoints: 'Scanning logs...' },
  ]);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeAgentTab, setActiveAgentTab] = useState<'all' | 'finance' | 'collections' | 'risk'>('all');
  const [timelineExpanded, setTimelineExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch status of all 3 agents on mount
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

    // Default welcome prompt
    setMessages([
      {
        id: 'welcome-1',
        sender: 'orchestrator',
        text: 'Welcome to the **Multi-Agent Financial Intelligence System**. I coordinate three specialized AI agents that run parallel audits on your live PayPal records: **Finance Agent**, **Collections Agent**, and **Risk Agent**. Ask a strategic question below to initiate cross-agent orchestration.',
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
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white shadow-md shadow-brand-500/20">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Multi-Agent Financial Intelligence</h1>
              <p className="text-xs text-slate-500">Autonomous 3-agent orchestration council analyzing live PayPal business data</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-lg text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Orchestrator Online • 3 Agents Synchronized</span>
        </div>
      </div>

      {/* Agent Council Status Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Finance Agent Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Finance Agent</h3>
                <span className="text-[10px] text-blue-600 font-medium">Revenue & Liquidity</span>
              </div>
            </div>
            <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">ACTIVE</span>
          </div>
          <p className="text-xs text-slate-600 mb-2">Analyzes revenue trends, linear 7/30d forecasting, and cash-flow deficit warning triggers.</p>
          <div className="text-[11px] text-slate-500 bg-slate-50 px-2.5 py-1 rounded border border-slate-100 flex items-center gap-1.5">
            <DollarSign className="w-3 h-3 text-blue-500" />
            <span>{agents.find(a => a.name.includes('Finance'))?.dataPoints || '4 settled transactions analyzed'}</span>
          </div>
        </div>

        {/* Collections Agent Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Collections Agent</h3>
                <span className="text-[10px] text-amber-600 font-medium">Overdue Recovery</span>
              </div>
            </div>
            <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">ACTIVE</span>
          </div>
          <p className="text-xs text-slate-600 mb-2">Identifies delinquent invoices, computes delay days, sequences debtors, and drafts notices.</p>
          <div className="text-[11px] text-slate-500 bg-slate-50 px-2.5 py-1 rounded border border-slate-100 flex items-center gap-1.5">
            <UserCheck className="w-3 h-3 text-amber-500" />
            <span>{agents.find(a => a.name.includes('Collections'))?.dataPoints || '3 overdue records monitored'}</span>
          </div>
        </div>

        {/* Risk Agent Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Risk Agent</h3>
                <span className="text-[10px] text-purple-600 font-medium">Integrity & Audit</span>
              </div>
            </div>
            <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">ACTIVE</span>
          </div>
          <p className="text-xs text-slate-600 mb-2">Audits duplicates, flags high-variance outlier amounts, and isolates unlinked settlements.</p>
          <div className="text-[11px] text-slate-500 bg-slate-50 px-2.5 py-1 rounded border border-slate-100 flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3 text-purple-500" />
            <span>{agents.find(a => a.name.includes('Risk'))?.dataPoints || '4 transaction logs audited'}</span>
          </div>
        </div>
      </div>

      {/* Suggested Prompt Chips */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-brand-500" />
          Strategic Queries:
        </span>
        {sampleQueries.map((sq, i) => (
          <button
            key={i}
            onClick={() => handleSend(sq.query)}
            disabled={loading}
            className="text-xs bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-brand-300 px-3 py-1 rounded-full transition-all shadow-sm disabled:opacity-50"
          >
            {sq.label}
          </button>
        ))}
      </div>

      {/* Chat & Orchestration Thread */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
        {/* Messages Container */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
              <div className="flex items-center gap-2 mb-1 px-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {msg.sender === 'user' ? 'You' : 'AI Orchestrator'}
                </span>
                <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
              </div>

              {msg.sender === 'user' ? (
                <div className="bg-brand-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 text-sm max-w-xl shadow-sm">
                  {msg.text}
                </div>
              ) : (
                <div className="w-full max-w-4xl bg-slate-50 rounded-2xl rounded-tl-sm border border-slate-200 p-5 space-y-4">
                  {/* Simple text message */}
                  {msg.text && (
                    <div className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                      {msg.text}
                    </div>
                  )}

                  {/* Multi-Agent Orchestration Response */}
                  {msg.data && (
                    <div className="space-y-4">
                      {/* Header: Agents Involved + Execution Timeline Toggle */}
                      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white rounded-xl border border-slate-200">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-700">Agents Involved:</span>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {msg.data.agentsInvolved.map((agentName, idx) => (
                              <span
                                key={idx}
                                className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                                  agentName === 'Finance Agent'
                                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                    : agentName === 'Collections Agent'
                                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                    : 'bg-purple-50 text-purple-700 border border-purple-200'
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

                        {/* Timeline Toggle */}
                        {msg.data.executionTimeline && (
                          <button
                            onClick={() => setTimelineExpanded(!timelineExpanded)}
                            className="text-[11px] font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1 bg-slate-50 px-2 py-1 rounded border border-slate-200"
                          >
                            <Clock className="w-3 h-3 text-brand-500" />
                            <span>Timeline ({msg.data.executionTimeline.length} steps)</span>
                            {timelineExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>
                        )}
                      </div>

                      {/* Execution Timeline (Collapsible) */}
                      {timelineExpanded && msg.data.executionTimeline && (
                        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2 text-xs">
                          <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                            Multi-Agent Parallel Execution Trace
                          </h4>
                          <div className="divide-y divide-slate-100">
                            {msg.data.executionTimeline.map((step, i) => (
                              <div key={i} className="py-2 flex items-center justify-between text-slate-600">
                                <div className="flex items-center gap-2">
                                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                  <span className="font-semibold text-slate-800">{step.agent}</span>
                                  <span className="text-slate-500 text-[11px] truncate max-w-md">{step.summary}</span>
                                </div>
                                <span className="font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                                  {step.durationMs}ms
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Combined Executive Analysis */}
                      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
                        <div className="flex items-center gap-2 text-brand-600">
                          <Brain className="w-4 h-4" />
                          <h3 className="font-bold text-slate-900 text-sm">Orchestrated Cross-Agent Synthesis</h3>
                        </div>
                        <div className="text-xs text-slate-700 whitespace-pre-line leading-relaxed border-l-2 border-brand-500 pl-3">
                          {msg.data.combinedAnalysis}
                        </div>
                      </div>

                      {/* Deep Agent Findings Tabs */}
                      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                            Specialized Agent Reports
                          </h4>
                          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs">
                            <button
                              onClick={() => setActiveAgentTab('all')}
                              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                                activeAgentTab === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                              }`}
                            >
                              All
                            </button>
                            {msg.data.agentFindings.finance && (
                              <button
                                onClick={() => setActiveAgentTab('finance')}
                                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                                  activeAgentTab === 'finance' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500'
                                }`}
                              >
                                Finance
                              </button>
                            )}
                            {msg.data.agentFindings.collections && (
                              <button
                                onClick={() => setActiveAgentTab('collections')}
                                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                                  activeAgentTab === 'collections' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-500'
                                }`}
                              >
                                Collections
                              </button>
                            )}
                            {msg.data.agentFindings.risk && (
                              <button
                                onClick={() => setActiveAgentTab('risk')}
                                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                                  activeAgentTab === 'risk' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-500'
                                }`}
                              >
                                Risk
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Finance Findings */}
                        {(activeAgentTab === 'all' || activeAgentTab === 'finance') && msg.data.agentFindings.finance && (
                          <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                                <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                                Finance Agent Findings
                              </span>
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                                Status: {msg.data.agentFindings.finance.status}
                              </span>
                            </div>

                            {/* 4 Mini KPI Cards */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center">
                              <div className="bg-white p-2 rounded-lg border border-blue-100">
                                <span className="text-[10px] text-slate-500 block">Settled Revenue</span>
                                <span className="text-sm font-bold text-slate-900">${msg.data.agentFindings.finance.metrics.totalRevenue.toLocaleString()}</span>
                              </div>
                              <div className="bg-white p-2 rounded-lg border border-blue-100">
                                <span className="text-[10px] text-slate-500 block">7-Day Forecast</span>
                                <span className="text-sm font-bold text-blue-600">${msg.data.agentFindings.finance.metrics.forecastNext7Days.toLocaleString()}</span>
                              </div>
                              <div className="bg-white p-2 rounded-lg border border-blue-100">
                                <span className="text-[10px] text-slate-500 block">30-Day Forecast</span>
                                <span className="text-sm font-bold text-indigo-600">${msg.data.agentFindings.finance.metrics.forecastNext30Days.toLocaleString()}</span>
                              </div>
                              <div className="bg-white p-2 rounded-lg border border-blue-100">
                                <span className="text-[10px] text-slate-500 block">Cash Flow Posture</span>
                                <span className={`text-xs font-bold ${
                                  msg.data.agentFindings.finance.metrics.cashFlowHealth === 'DEFICIT_RISK' ? 'text-rose-600' : 'text-emerald-600'
                                }`}>
                                  {msg.data.agentFindings.finance.metrics.cashFlowHealth}
                                </span>
                              </div>
                            </div>

                            {/* Trends */}
                            <div className="text-xs text-slate-700 space-y-1">
                              <span className="font-semibold text-slate-800 block text-[11px]">Observed Revenue Trends:</span>
                              {msg.data.agentFindings.finance.trends.map((t, idx) => (
                                <p key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-600">
                                  <span className="text-blue-500 font-bold">•</span>
                                  <span>{t}</span>
                                </p>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Collections Findings */}
                        {(activeAgentTab === 'all' || activeAgentTab === 'collections') && msg.data.agentFindings.collections && (
                          <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-100 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                                Collections Agent Findings
                              </span>
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                                Overdue: ${msg.data.agentFindings.collections.metrics.totalOverdueAmount.toLocaleString()}
                              </span>
                            </div>

                            {/* Prioritized Debtor Table */}
                            {msg.data.agentFindings.collections.prioritizedCustomers.length > 0 ? (
                              <div className="space-y-2">
                                <span className="font-semibold text-slate-800 block text-[11px]">
                                  Recommended Contact Sequence (Ranked by Debt & Delay):
                                </span>
                                <div className="space-y-2">
                                  {msg.data.agentFindings.collections.prioritizedCustomers.map((cust) => (
                                    <div key={cust.customerId} className="bg-white p-3 rounded-lg border border-amber-200/80 space-y-2">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">
                                            #{cust.recommendedContactSequence}
                                          </span>
                                          <div>
                                            <span className="font-bold text-xs text-slate-900">{cust.customerName}</span>
                                            <span className="text-[10px] text-slate-400 block">{cust.company}</span>
                                          </div>
                                        </div>
                                        <div className="text-right">
                                          <span className="text-xs font-bold text-rose-600 block">${cust.totalOverdueAmount.toLocaleString()} overdue</span>
                                          <span className="text-[10px] text-slate-500 font-medium">{cust.avgDelayDays} days late • Reliability: {cust.reliabilityScore}/100</span>
                                        </div>
                                      </div>

                                      {/* Draft reminder preview */}
                                      <div className="bg-slate-50 p-2.5 rounded border border-slate-200 text-[11px] text-slate-600 space-y-1">
                                        <div className="flex items-center justify-between text-slate-500 font-medium text-[10px]">
                                          <span className="flex items-center gap-1">
                                            <Mail className="w-3 h-3 text-brand-500" />
                                            Prepared Reminder Draft
                                          </span>
                                          <span className="text-emerald-600 font-semibold">Queue in Automation Center</span>
                                        </div>
                                        <p className="font-semibold text-slate-700">{cust.draftReminder.subject}</p>
                                        <p className="italic text-slate-500 truncate">{cust.draftReminder.body.slice(0, 110)}...</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <p className="text-xs text-slate-600">Zero active overdue invoices detected.</p>
                            )}
                          </div>
                        )}

                        {/* Risk Findings */}
                        {(activeAgentTab === 'all' || activeAgentTab === 'risk') && msg.data.agentFindings.risk && (
                          <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-100 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                                <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                                Risk Agent Findings
                              </span>
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                                Posture: {msg.data.agentFindings.risk.metrics.riskPosture}
                              </span>
                            </div>

                            {/* Observations */}
                            <div className="text-xs text-slate-700 space-y-1">
                              {msg.data.agentFindings.risk.riskObservations.map((obs, idx) => (
                                <p key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-600">
                                  <span className="text-purple-500 font-bold">•</span>
                                  <span>{obs}</span>
                                </p>
                              ))}
                            </div>

                            {/* Flagged items if any */}
                            {msg.data.agentFindings.risk.flaggedTransactions.length > 0 && (
                              <div className="space-y-2 mt-2">
                                <span className="font-semibold text-slate-800 block text-[11px]">Flagged Anomalies for Verification:</span>
                                {msg.data.agentFindings.risk.flaggedTransactions.map((flag, idx) => (
                                  <div key={idx} className="bg-white p-3 rounded-lg border border-purple-200 text-xs space-y-1">
                                    <div className="flex items-center justify-between">
                                      <span className="font-bold text-slate-800">{flag.customerName} — ${flag.amount.toLocaleString()}</span>
                                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-700">
                                        {flag.riskLevel}
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-slate-600">{flag.suspicionReason}</p>
                                    <p className="text-[10px] font-medium text-purple-700 flex items-center gap-1">
                                      <Info className="w-3 h-3" />
                                      {flag.recommendedAction}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Recommended Actions */}
                      {msg.data.recommendedActions.length > 0 && (
                        <div className="bg-gradient-to-r from-brand-50 to-indigo-50 rounded-xl border border-brand-200 p-4 space-y-2">
                          <h4 className="text-xs font-bold text-brand-900 uppercase tracking-wider flex items-center gap-1.5">
                            <Zap className="w-3.5 h-3.5 text-brand-600" />
                            Orchestrator Recommended Action Plan
                          </h4>
                          <div className="space-y-1.5">
                            {msg.data.recommendedActions.map((action, idx) => (
                              <div key={idx} className="flex items-start gap-2 text-xs text-slate-800 bg-white/70 p-2 rounded-lg border border-brand-100">
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
              <div className="p-2 rounded-xl bg-slate-900 text-white animate-spin">
                <Brain className="w-4 h-4" />
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-sm p-4 text-xs text-slate-600 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-brand-600 animate-ping"></div>
                  <span className="font-semibold text-slate-800">Orchestrator dispatching agents...</span>
                </div>
                <div className="text-[11px] text-slate-500 pl-4 space-y-1 border-l border-slate-200">
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
        <div className="p-4 border-t border-slate-200 bg-slate-50/50">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask the Multi-Agent council (e.g. 'My revenue is declining, find out why and what to do')..."
              disabled={loading}
              className="flex-1 bg-white border border-slate-300 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 outline-none transition-all shadow-sm"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-sm shrink-0"
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
