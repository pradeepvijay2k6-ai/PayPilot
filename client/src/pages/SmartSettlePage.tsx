import React, { useState, useEffect } from 'react';
import { 
  Handshake, 
  Sparkles, 
  CheckCircle, 
  XCircle, 
  Clock, 
  DollarSign, 
  Calendar, 
  User, 
  ExternalLink, 
  Copy, 
  ShieldCheck, 
  AlertTriangle, 
  FileText, 
  ChevronRight,
  TrendingUp,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { apiClient } from '../api/client';
import { 
  SmartSettleDashboardData, 
  SmartSettleEligibleInvoice, 
  SmartSettleAgreementItem 
} from '../types';

export const SmartSettlePage: React.FC = () => {
  const [dashboard, setDashboard] = useState<SmartSettleDashboardData | null>(null);
  const [eligibleInvoices, setEligibleInvoices] = useState<SmartSettleEligibleInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'agreements' | 'eligible'>('agreements');
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // AI Plan Generator Modal State
  const [selectedInvoice, setSelectedInvoice] = useState<SmartSettleEligibleInvoice | null>(null);
  const [installmentsCount, setInstallmentsCount] = useState(3);
  const [extensionDays, setExtensionDays] = useState(30);
  const [hardshipReason, setHardshipReason] = useState('Business owner structuring proactive payment relief');
  const [generating, setGenerating] = useState(false);
  const [proposal, setProposal] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [dashRes, invRes] = await Promise.all([
        apiClient.get('/smartsettle/dashboard'),
        apiClient.get('/smartsettle/invoices')
      ]);
      setDashboard(dashRes.data);
      setEligibleInvoices(invRes.data.invoices || []);
    } catch (err: any) {
      console.warn('SmartSettle fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenGenerator = (inv: SmartSettleEligibleInvoice) => {
    setSelectedInvoice(inv);
    setProposal(null);
  };

  const handleGenerateProposal = async () => {
    if (!selectedInvoice) return;
    try {
      setGenerating(true);
      const res = await apiClient.post('/smartsettle/generate-plan', {
        invoiceId: selectedInvoice.id,
        requestedInstallments: installmentsCount,
        requestedExtensionDays: extensionDays,
        hardshipReason
      });
      setProposal(res.data.proposal);
    } catch (err: any) {
      setNotification({ type: 'error', message: err.response?.data?.error || 'Plan generation failed' });
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmitAgreement = async () => {
    if (!selectedInvoice || !proposal) return;
    try {
      setSubmitting(true);
      await apiClient.post('/smartsettle/submit-agreement', {
        invoiceId: selectedInvoice.id,
        customerNote: hardshipReason,
        plan: proposal,
        createdBy: 'BUSINESS'
      });
      setNotification({ type: 'success', message: 'Payment plan prepared and staged. You can now approve it to activate.' });
      setSelectedInvoice(null);
      await fetchData();
    } catch (err: any) {
      setNotification({ type: 'error', message: err.response?.data?.error || 'Staging agreement failed' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (agreementId: string) => {
    try {
      await apiClient.post(`/smartsettle/${agreementId}/approve`, {
        businessNote: 'Payment schedule verified and approved by business owner'
      });
      setNotification({ type: 'success', message: 'Payment agreement activated! Customer can now remit installments.' });
      await fetchData();
    } catch (err: any) {
      setNotification({ type: 'error', message: err.response?.data?.error || 'Approval failed' });
    }
  };

  const handleReject = async (agreementId: string) => {
    try {
      await apiClient.post(`/smartsettle/${agreementId}/reject`, {
        reason: 'Payment arrangement terms not acceptable.'
      });
      setNotification({ type: 'success', message: 'Agreement declined. Original terms restored.' });
      await fetchData();
    } catch (err: any) {
      setNotification({ type: 'error', message: err.response?.data?.error || 'Rejection failed' });
    }
  };

  const copyNegotiationLink = (invoiceId: string) => {
    const url = `${window.location.origin}/negotiate/${invoiceId}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(invoiceId);
    setTimeout(() => setCopiedLink(null), 3000);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-lg shadow-brand-500/20">
            <Handshake className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-white tracking-tight">SmartSettle – AI Payment Negotiator</h1>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20">
                Installment Engine
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Autonomous installment negotiation & flexible PayPal settlement management</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="bg-dark-900 hover:bg-dark-850 text-slate-200 border border-slate-800 hover:border-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-brand-400 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Dashboard</span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className={`p-3.5 rounded-xl border flex items-center justify-between text-xs backdrop-blur-md ${
          notification.type === 'success' 
            ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300' 
            : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
        }`}>
          <div className="flex items-center gap-2.5">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-white font-bold ml-4">×</button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl border border-slate-800/80 p-4 shadow-sm">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Active Agreements</span>
          <div className="flex items-baseline gap-2 mt-1.5">
            <span className="text-2xl font-bold font-mono text-emerald-400">{dashboard?.summary.activeAgreementsCount || 0}</span>
            <span className="text-[11px] text-slate-400 font-medium">
              ${(dashboard?.summary.totalRemaining || 0).toLocaleString()} remaining
            </span>
          </div>
        </div>

        <div className="glass-card rounded-2xl border border-slate-800/80 p-4 shadow-sm">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Pending Proposals</span>
          <div className="flex items-baseline gap-2 mt-1.5">
            <span className="text-2xl font-bold font-mono text-amber-400">{dashboard?.summary.pendingApprovalCount || 0}</span>
            <span className="text-[11px] text-slate-400">awaiting authorization</span>
          </div>
        </div>

        <div className="glass-card rounded-2xl border border-slate-800/80 p-4 shadow-sm">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Recovered Capital</span>
          <div className="flex items-baseline gap-2 mt-1.5">
            <span className="text-2xl font-bold font-mono text-brand-400">${(dashboard?.summary.totalRecovered || 0).toLocaleString()}</span>
            <span className="text-[11px] text-slate-400">via installments</span>
          </div>
        </div>

        <div className="glass-card rounded-2xl border border-slate-800/80 p-4 shadow-sm">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Milestone Health</span>
          <div className="flex items-center gap-3 mt-2 text-xs font-mono font-semibold">
            <span className="text-emerald-400">{dashboard?.summary.completedInstallmentsCount || 0} Paid</span>
            <span className="text-slate-600">•</span>
            <span className="text-blue-400">{dashboard?.summary.upcomingInstallmentsCount || 0} Due</span>
            <span className="text-slate-600">•</span>
            <span className="text-rose-400">{dashboard?.summary.overdueInstallmentsCount || 0} Overdue</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800/80 pb-px">
        <button
          onClick={() => setActiveTab('agreements')}
          className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'agreements'
              ? 'border-brand-500 text-brand-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Handshake className="w-3.5 h-3.5" />
          <span>Payment Agreements ({dashboard?.agreements.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('eligible')}
          className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'eligible'
              ? 'border-brand-500 text-brand-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Eligible Unpaid Invoices ({eligibleInvoices.length})</span>
        </button>
      </div>

      {/* Tab 1: Agreements */}
      {activeTab === 'agreements' && (
        <div className="space-y-4">
          {(!dashboard?.agreements || dashboard.agreements.length === 0) ? (
            <div className="glass-card rounded-2xl border border-slate-800/80 p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-400 border border-brand-500/20 flex items-center justify-center mx-auto">
                <Handshake className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-white">No Payment Agreements Yet</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Select an overdue or unpaid invoice from the "Eligible Unpaid Invoices" tab to generate an AI-recommended payment plan or share the customer negotiation link.
              </p>
              <button
                onClick={() => setActiveTab('eligible')}
                className="bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 shadow-md shadow-brand-500/20 transition-all"
              >
                <span>View Eligible Invoices</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {dashboard.agreements.map((agr) => (
                <div key={agr.id} className="glass-card rounded-2xl border border-slate-800/80 p-5 shadow-sm space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800/60 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20 flex items-center justify-center font-bold text-xs font-mono">
                        {agr.customerName[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-white text-sm">{agr.customerName}</h3>
                          <span className="text-[10px] text-slate-400 font-medium">({agr.company || 'Enterprise'})</span>
                        </div>
                        <span className="text-xs text-slate-400">
                          Invoice: <strong className="text-slate-200 font-mono">{agr.invoiceNumber}</strong> • Original: <span className="font-mono">${agr.originalAmount.toLocaleString()}</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                        agr.status === 'ACTIVE'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : agr.status === 'COMPLETED'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : agr.status === 'REJECTED'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {agr.status.replace('_', ' ')}
                      </span>

                      {/* Customer portal link */}
                      <button
                        onClick={() => copyNegotiationLink(agr.invoiceId)}
                        className="text-xs text-brand-400 hover:text-brand-300 bg-brand-500/10 hover:bg-brand-500/20 px-3 py-1.5 rounded-xl border border-brand-500/20 flex items-center gap-1.5 font-semibold transition-all"
                      >
                        <Copy className="w-3 h-3" />
                        <span>{copiedLink === agr.invoiceId ? 'Copied Link!' : 'Customer Portal Link'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Agreement Progress Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-dark-950/60 p-3.5 rounded-xl border border-slate-800/80 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-medium">Total Negotiated</span>
                      <span className="font-bold font-mono text-white text-sm">${agr.settledAmount.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-medium">Paid So Far</span>
                      <span className="font-bold font-mono text-emerald-400 text-sm">${agr.paidAmount.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-medium">Remaining Balance</span>
                      <span className="font-bold font-mono text-rose-400 text-sm">${agr.remainingBalance.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-medium">Milestones</span>
                      <span className="font-semibold text-slate-200 text-sm">{agr.installmentsCount} Parts Scheduled</span>
                    </div>
                  </div>

                  {/* AI Rationale */}
                  {agr.aiAnalysis && (
                    <div className="bg-indigo-950/30 border border-indigo-500/30 p-3.5 rounded-xl text-xs text-indigo-200 flex items-start gap-2.5">
                      <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                      <div className="leading-relaxed">
                        <span className="font-semibold text-indigo-300">AI Rationale: </span>
                        {agr.aiAnalysis}
                      </div>
                    </div>
                  )}

                  {/* Installments Table */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Installment Milestone Ledger</span>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                      {agr.installments.map((inst) => (
                        <div key={inst.id} className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                          inst.status === 'COMPLETED'
                            ? 'bg-emerald-950/20 border-emerald-500/30'
                            : 'bg-dark-950/60 border-slate-800/80'
                        }`}>
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-200">Part #{inst.installmentNumber}</span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              inst.status === 'COMPLETED' 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                : 'bg-slate-800 text-slate-300'
                            }`}>
                              {inst.status}
                            </span>
                          </div>
                          <div className="text-base font-bold font-mono text-white">${inst.amount.toFixed(2)}</div>
                          <span className="text-[11px] text-slate-400 block font-mono">Due: {inst.dueDate}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pending Approval Action Bar */}
                  {agr.status === 'PENDING_APPROVAL' && (
                    <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800/60">
                      <button
                        onClick={() => handleReject(agr.id)}
                        className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-rose-400 hover:bg-rose-500/10 border border-slate-800 hover:border-rose-500/30 flex items-center gap-1.5 transition-all"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Decline Arrangement</span>
                      </button>
                      <button
                        onClick={() => handleApprove(agr.id)}
                        className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Approve & Activate Plan</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Eligible Invoices */}
      {activeTab === 'eligible' && (
        <div className="glass-card rounded-2xl border border-slate-800/80 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Invoices Eligible for SmartSettle Negotiation</h3>
              <p className="text-xs text-slate-400 mt-0.5">Unpaid or past-due receivables ready to be converted into flexible PayPal milestone plans</p>
            </div>
            <span className="text-xs font-mono bg-dark-950 px-2.5 py-1 rounded-lg border border-slate-800 text-slate-300">
              {eligibleInvoices.length} accounts
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-dark-950/80 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Invoice</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Total Amount</th>
                  <th className="px-4 py-3">Due Status</th>
                  <th className="px-4 py-3">Customer History</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {eligibleInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 font-mono font-semibold text-white">{inv.invoiceNumber}</td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-slate-200 block">{inv.customer.name}</span>
                      <span className="text-[11px] text-slate-400">{inv.customer.company}</span>
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-white">${inv.total.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        inv.daysOverdue > 0 
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {inv.daysOverdue > 0 ? `${inv.daysOverdue}d overdue` : `Due ${inv.dueDate}`}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-[11px]">
                      {inv.customer.totalSettledPast > 0 ? (
                        <span className="text-emerald-400 font-medium">Settled ${inv.customer.totalSettledPast.toLocaleString()} across {inv.customer.ordersCount} orders</span>
                      ) : (
                        <span className="text-slate-500">First-time client</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        onClick={() => copyNegotiationLink(inv.id)}
                        title="Copy Customer Negotiation URL"
                        className="px-2.5 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-dark-950 text-slate-300 hover:text-white transition-all inline-flex items-center gap-1.5 text-[11px] font-semibold"
                      >
                        <Copy className="w-3 h-3 text-brand-400" />
                        <span>{copiedLink === inv.id ? 'Copied!' : 'Portal Link'}</span>
                      </button>
                      <button
                        onClick={() => handleOpenGenerator(inv)}
                        className="bg-brand-600 hover:bg-brand-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 shadow-md shadow-brand-500/20 transition-all"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Generate AI Plan</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* AI Plan Generator Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-dark-900 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl border border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-brand-500/10 text-brand-400 border border-brand-500/20 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm">SmartSettle AI Plan Generator</h3>
                  <span className="text-xs text-slate-400">Invoice {selectedInvoice.invoiceNumber} for {selectedInvoice.customer.name} (${selectedInvoice.total.toLocaleString()})</span>
                </div>
              </div>
              <button onClick={() => setSelectedInvoice(null)} className="text-slate-400 hover:text-white text-lg font-bold">×</button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Number of Milestones</label>
                  <select
                    value={installmentsCount}
                    onChange={(e) => setInstallmentsCount(parseInt(e.target.value, 10))}
                    className="w-full bg-dark-950 border border-slate-800 rounded-xl p-2.5 outline-none font-medium text-slate-200 focus:border-brand-500"
                  >
                    <option value={2}>2 Installments</option>
                    <option value={3}>3 Installments</option>
                    <option value={4}>4 Installments</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Total Extension Horizon</label>
                  <select
                    value={extensionDays}
                    onChange={(e) => setExtensionDays(parseInt(e.target.value, 10))}
                    className="w-full bg-dark-950 border border-slate-800 rounded-xl p-2.5 outline-none font-medium text-slate-200 focus:border-brand-500"
                  >
                    <option value={15}>15 Days</option>
                    <option value={30}>30 Days</option>
                    <option value={45}>45 Days</option>
                    <option value={60}>60 Days</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Customer / Hardship Context</label>
                <input
                  type="text"
                  value={hardshipReason}
                  onChange={(e) => setHardshipReason(e.target.value)}
                  className="w-full bg-dark-950 border border-slate-800 rounded-xl p-2.5 outline-none text-slate-200 focus:border-brand-500"
                />
              </div>

              <button
                onClick={handleGenerateProposal}
                disabled={generating}
                className="w-full bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-md shadow-brand-500/20 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>{generating ? 'AI Analyzing Terms...' : 'Calculate AI Plan Proposal'}</span>
              </button>

              {/* Proposal Preview */}
              {proposal && (
                <div className="bg-dark-950 border border-brand-500/30 p-4 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">Recommended Plan ({proposal.installmentsCount} Parts)</span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30">
                      Score: {proposal.suitabilityScore}/100
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300 italic bg-dark-900 p-2.5 rounded-lg border border-slate-800">
                    "{proposal.aiExplanation}"
                  </p>

                  <div className="grid grid-cols-3 gap-2">
                    {proposal.installments.map((inst: any) => (
                      <div key={inst.installmentNumber} className="bg-dark-900 p-2.5 rounded-lg border border-slate-800 text-center">
                        <span className="text-[10px] text-slate-400 block font-semibold">Part #{inst.installmentNumber}</span>
                        <span className="text-sm font-bold font-mono text-white">${inst.amount.toFixed(2)}</span>
                        <span className="text-[10px] text-slate-400 block font-mono">{inst.dueDate}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleSubmitAgreement}
                    disabled={submitting}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white py-2.5 rounded-xl font-semibold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Stage Plan in SmartSettle Dashboard</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
