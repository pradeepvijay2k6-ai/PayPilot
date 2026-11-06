import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  CheckCircle, 
  XCircle, 
  Edit3, 
  RefreshCw, 
  ShieldAlert, 
  Clock, 
  FileText, 
  DollarSign, 
  User, 
  Mail, 
  Sparkles, 
  PlusCircle,
  History,
  CheckCircle2,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { apiClient } from '../api/client';
import { AutomationWorkflowItem, AuditLogItem } from '../types';

export const AutomationCenterPage: React.FC = () => {
  const [queue, setQueue] = useState<AutomationWorkflowItem[]>([]);
  const [history, setHistory] = useState<AutomationWorkflowItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [activeTab, setActiveTab] = useState<'queue' | 'history' | 'audit'>('queue');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Edit Modal State
  const [editingItem, setEditingItem] = useState<AutomationWorkflowItem | null>(null);
  const [editSubject, setEditSubject] = useState('');
  const [editBody, setEditBody] = useState('');

  // Manual Stage Payment State
  const [stageModalOpen, setStageModalOpen] = useState(false);
  const [stageCustomer, setStageCustomer] = useState('Sarah Jenkins');
  const [stageAmount, setStageAmount] = useState('500');
  const [stageDescription, setStageDescription] = useState('Milestone 2 deliverable');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [queueRes, historyRes] = await Promise.all([
        apiClient.get('/automation/queue'),
        apiClient.get('/automation/history')
      ]);
      setQueue(queueRes.data.queue || []);
      setHistory(historyRes.data.workflows || []);
      setAuditLogs(historyRes.data.auditLogs || []);
    } catch (err: any) {
      console.warn('Fetch automation error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const triggerScan = async () => {
    try {
      setScanning(true);
      const res = await apiClient.post('/automation/detect');
      setNotification({
        type: 'success',
        message: res.data.message || 'Detection scan complete!'
      });
      await fetchData();
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.response?.data?.error || 'Detection failed'
      });
    } finally {
      setScanning(false);
    }
  };

  const handleApprove = async (id: string, editedContext?: any) => {
    try {
      await apiClient.post(`/automation/${id}/approve`, { editedContext });
      setNotification({
        type: 'success',
        message: 'Action approved and executed successfully through PayPal gateway!'
      });
      setEditingItem(null);
      await fetchData();
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.response?.data?.error || 'Approval execution failed'
      });
    }
  };

  const handleReject = async (id: string) => {
    try {
      await apiClient.post(`/automation/${id}/reject`, { reason: 'Dismissed by business owner' });
      setNotification({
        type: 'success',
        message: 'Workflow item rejected and moved to audit history.'
      });
      await fetchData();
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.response?.data?.error || 'Rejection failed'
      });
    }
  };

  const handleOpenEdit = (item: AutomationWorkflowItem) => {
    setEditingItem(item);
    setEditSubject(item.context?.subject || '');
    setEditBody(item.context?.body || '');
  };

  const handleSaveEditAndApprove = () => {
    if (!editingItem) return;
    const updatedContext = {
      ...editingItem.context,
      subject: editSubject,
      body: editBody
    };
    handleApprove(editingItem.id, updatedContext);
  };

  const handleStagePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/automation/stage-payment', {
        customerName: stageCustomer,
        amount: parseFloat(stageAmount),
        description: stageDescription
      });
      setStageModalOpen(false);
      setNotification({
        type: 'success',
        message: `Payment request staged for ${stageCustomer}. Review and authorize in the Approval Center below.`
      });
      await fetchData();
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.response?.data?.error || 'Failed to stage payment'
      });
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-dark-900 via-dark-850 to-dark-900 border border-slate-800/80 p-6 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/25 shrink-0 border border-white/10">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-white tracking-tight">AI Automation Center</h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  HUMAN IN THE LOOP
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Autonomous workflow preparation with mandatory user authorization & permanent audit trail.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setStageModalOpen(true)}
              className="bg-dark-800 hover:bg-dark-750 text-slate-200 border border-slate-700/80 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
            >
              <PlusCircle className="w-3.5 h-3.5 text-brand-400" />
              <span>Stage Payment Request</span>
            </button>
            <button
              onClick={triggerScan}
              disabled={scanning}
              className="bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-brand-500/25 transition-all active:scale-95"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${scanning ? 'animate-spin' : ''}`} />
              <span>{scanning ? 'Auditing Events...' : 'Scan Financial Events'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className={`p-3.5 rounded-xl border flex items-center justify-between text-xs ${
          notification.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
            : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
        }`}>
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
            <span className="font-semibold">{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-white font-bold">×</button>
        </div>
      )}

      {/* Security Guardrail Banner */}
      <div className="bg-dark-900/90 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3 shadow-lg">
        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 leading-relaxed">
          <span className="font-bold text-amber-300">Human-in-the-Loop Security Guardrail: </span>
          PayPilot AI prepares financial notices, PayPal orders, and ledger reconciliations autonomously, but <span className="font-semibold text-white underline decoration-amber-400">never dispatches payments or notices without your explicit authorization</span>. Every action generates an immutable audit record.
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-5 space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pending Approval</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-amber-400">{queue.length}</span>
            <span className="text-xs text-slate-400">items awaiting action</span>
          </div>
        </div>
        <div className="glass-card rounded-2xl p-5 space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Approved & Executed</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-emerald-400">{history.filter(h => h.status === 'COMPLETED').length}</span>
            <span className="text-xs text-slate-400">workflows completed</span>
          </div>
        </div>
        <div className="glass-card rounded-2xl p-5 space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Rejected / Skipped</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-400">{history.filter(h => h.status === 'REJECTED').length}</span>
            <span className="text-xs text-slate-400">items declined</span>
          </div>
        </div>
        <div className="glass-card rounded-2xl p-5 space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Audit Trail Entries</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-brand-400">{auditLogs.length}</span>
            <span className="text-xs text-slate-400">logged financial events</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800">
        <button
          onClick={() => setActiveTab('queue')}
          className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'queue'
              ? 'border-brand-500 text-brand-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>Approval Center</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
            queue.length > 0 ? 'bg-amber-500/20 text-amber-300' : 'bg-dark-800 text-slate-500'
          }`}>
            {queue.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'history'
              ? 'border-brand-500 text-brand-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Workflow History ({history.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'audit'
              ? 'border-brand-500 text-brand-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Immutable Audit Log ({auditLogs.length})</span>
        </button>
      </div>

      {/* Tab 1: Approval Queue */}
      {activeTab === 'queue' && (
        <div className="space-y-4">
          {queue.length === 0 ? (
            <div className="glass-card rounded-2xl p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-white">Approval Queue is Clear</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                No financial operations are currently pending your approval. Click "Scan Financial Events" to detect new overdue invoices, unreconciled PayPal payments, or stage a payment request.
              </p>
              <button
                onClick={triggerScan}
                disabled={scanning}
                className="bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-2 mt-2 shadow-lg shadow-brand-500/20"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${scanning ? 'animate-spin' : ''}`} />
                <span>Run Detection Scan Now</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {queue.map((item) => (
                <div key={item.id} className="glass-card rounded-2xl p-5 space-y-4 border border-slate-800 hover:border-slate-700 transition-all">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        item.type === 'OVERDUE_REMINDER'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          : item.type === 'PAYMENT_PROCESSING'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {item.type.replace('_', ' ')}
                      </span>
                      <h3 className="text-sm font-bold text-white">{item.title}</h3>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{new Date(item.createdAt).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-dark-900/90 p-3.5 rounded-xl border border-slate-800 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 block font-medium">Customer Affected</span>
                      <span className="font-bold text-white">{item.customerName || 'Client'}</span>
                      <span className="text-[10px] text-slate-400 block truncate">{item.company}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block font-medium">Invoice Reference</span>
                      <span className="font-bold text-white">{item.invoiceNumber || item.context?.invoiceNumber || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block font-medium">Amount Involved</span>
                      <span className="font-extrabold text-emerald-400 text-sm">
                        ${(item.amount || item.context?.amount || 0).toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block font-medium">Workflow Trigger</span>
                      <span className="font-semibold text-slate-300">
                        {item.context?.daysOverdue ? `${item.context.daysOverdue} days past due` : 'Manual user staging'}
                      </span>
                    </div>
                  </div>

                  {item.aiReasoning && (
                    <div className="bg-brand-500/10 border border-brand-500/20 p-3.5 rounded-xl text-xs text-brand-200 flex items-start gap-2.5">
                      <Sparkles className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                      <div className="leading-relaxed">
                        <span className="font-bold text-white">AI Diagnosis: </span>
                        {item.aiReasoning}
                      </div>
                    </div>
                  )}

                  {item.context?.body && (
                    <div className="bg-dark-900/90 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
                        <span className="flex items-center gap-1 text-slate-300">
                          <Mail className="w-3.5 h-3.5 text-slate-500" />
                          Subject: {item.context.subject}
                        </span>
                        <span className="text-slate-500 text-[10px] font-mono">To: {item.context.customerEmail}</span>
                      </div>
                      <p className="whitespace-pre-line text-slate-300 text-[11px] bg-dark-950 p-3 rounded-lg border border-slate-800 font-mono">
                        {item.context.body}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                    <button
                      onClick={() => handleReject(item.id)}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-slate-700/80 flex items-center gap-1.5 transition-all"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>

                    {item.type === 'OVERDUE_REMINDER' && (
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-dark-800 border border-slate-700/80 flex items-center gap-1.5 transition-all"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-brand-400" />
                        <span>Edit Content</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleApprove(item.id)}
                      className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 flex items-center gap-1.5 shadow-lg shadow-emerald-600/25 transition-all"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Authorize & Execute</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Workflow History */}
      {activeTab === 'history' && (
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Workflow Execution History</h3>
            <span className="text-xs text-slate-400 font-mono">{history.length} operations recorded</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-dark-900 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Workflow</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Updated At</th>
                  <th className="px-4 py-3">Execution Outcome</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {history.map((wf) => (
                  <tr key={wf.id} className="hover:bg-dark-800/40 transition-colors">
                    <td className="px-4 py-3 font-semibold text-white">{wf.title}</td>
                    <td className="px-4 py-3 font-mono text-[10px] text-slate-400">{wf.type}</td>
                    <td className="px-4 py-3 text-slate-300">{wf.customerName || 'N/A'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        wf.status === 'COMPLETED'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : wf.status === 'REJECTED'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {wf.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-[11px] font-mono">{new Date(wf.updatedAt || wf.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-3 font-mono text-[10px] text-slate-400 max-w-xs truncate">
                      {wf.result ? JSON.stringify(wf.result) : 'Awaiting action'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Immutable Audit Log */}
      {activeTab === 'audit' && (
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Cryptographically Recorded Audit Log</h3>
              <p className="text-xs text-slate-400">Every detection, user authorization, and PayPal dispatch is permanently logged</p>
            </div>
            <span className="text-xs font-mono bg-dark-850 px-2.5 py-1 rounded-lg text-slate-400 border border-slate-800">
              {auditLogs.length} events
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-dark-900 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Action Event</th>
                  <th className="px-4 py-3">Entity Type</th>
                  <th className="px-4 py-3">Outcome</th>
                  <th className="px-4 py-3">Audit Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-dark-800/40 transition-colors">
                    <td className="px-4 py-2.5 text-slate-400">{new Date(log.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-2.5 font-bold text-white">{log.action}</td>
                    <td className="px-4 py-2.5 text-slate-400">{log.entityType}</td>
                    <td className="px-4 py-2.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        log.outcome === 'SUCCESS'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : log.outcome === 'SKIPPED'
                          ? 'bg-slate-800 text-slate-400 border border-slate-700'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {log.outcome}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-slate-400 max-w-md truncate">
                      {log.details ? JSON.stringify(log.details) : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Reminder Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-dark-850 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl border border-slate-700/80">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-brand-400" />
                <h3 className="font-bold text-white text-sm">Edit Payment Reminder Content</h3>
              </div>
              <button onClick={() => setEditingItem(null)} className="text-slate-400 hover:text-white font-bold">×</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-300 block mb-1">Email Subject Line</label>
                <input
                  type="text"
                  value={editSubject}
                  onChange={(e) => setEditSubject(e.target.value)}
                  className="w-full bg-dark-900 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Personalized Reminder Body</label>
                <textarea
                  rows={8}
                  value={editBody}
                  onChange={(e) => setEditBody(e.target.value)}
                  className="w-full bg-dark-900 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-brand-500 font-mono text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setEditingItem(null)}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-dark-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEditAndApprove}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 flex items-center gap-1.5 shadow-lg shadow-emerald-600/25"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Save Changes & Authorize Dispatch</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stage Payment Request Modal */}
      {stageModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-dark-850 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-700/80">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-brand-400" />
                <h3 className="font-bold text-white text-sm">Stage Payment Request Workflow</h3>
              </div>
              <button onClick={() => setStageModalOpen(false)} className="text-slate-400 hover:text-white font-bold">×</button>
            </div>

            <form onSubmit={handleStagePayment} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-300 block mb-1">Customer / Client Name</label>
                <input
                  type="text"
                  value={stageCustomer}
                  onChange={(e) => setStageCustomer(e.target.value)}
                  placeholder="Client name"
                  required
                  className="w-full bg-dark-900 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Amount ($ USD)</label>
                <input
                  type="number"
                  value={stageAmount}
                  onChange={(e) => setStageAmount(e.target.value)}
                  placeholder="500"
                  required
                  className="w-full bg-dark-900 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-brand-500 font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Description / Deliverable</label>
                <input
                  type="text"
                  value={stageDescription}
                  onChange={(e) => setStageDescription(e.target.value)}
                  placeholder="Consulting or design services"
                  required
                  className="w-full bg-dark-900 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-brand-500"
                />
              </div>

              <p className="text-[11px] text-slate-400 bg-dark-900 p-3 rounded-xl border border-slate-800">
                This prepares the workflow item and holds it in the Approval Center for your review before creating any external PayPal Order.
              </p>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setStageModalOpen(false)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-dark-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 shadow-lg shadow-brand-600/30"
                >
                  Stage into Approval Center
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
