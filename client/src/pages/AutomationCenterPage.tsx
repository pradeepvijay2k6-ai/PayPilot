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
  ExternalLink,
  History,
  CheckCircle2,
  AlertCircle
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
      const res = await apiClient.post(`/automation/${id}/approve`, { editedContext });
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
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white shadow-md shadow-orange-500/20">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">AI Automation Center</h1>
            <p className="text-xs text-slate-500">Autonomous workflow preparation with mandatory user authorization & audit logging</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setStageModalOpen(true)}
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5 text-brand-600" />
            <span>Stage Payment Request</span>
          </button>
          <button
            onClick={triggerScan}
            disabled={scanning}
            className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm shadow-brand-500/20 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${scanning ? 'animate-spin' : ''}`} />
            <span>{scanning ? 'Auditing Events...' : 'Scan Financial Events'}</span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
          notification.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-slate-600 text-sm font-bold">×</button>
        </div>
      )}

      {/* Security Guardrail Banner */}
      <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-3.5 flex items-start gap-3">
        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 leading-relaxed">
          <span className="font-bold">Human-in-the-Loop Security Guardrail: </span>
          PayPilot AI prepares financial notices, PayPal orders, and ledger reconciliations autonomously, but <span className="font-semibold underline">never dispatches payments or notices without your explicit authorization</span>. Every action generates an immutable audit record.
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Pending Approval</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-amber-600">{queue.length}</span>
            <span className="text-[11px] text-slate-400">items awaiting action</span>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Approved & Executed</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-emerald-600">{history.filter(h => h.status === 'COMPLETED').length}</span>
            <span className="text-[11px] text-slate-400">workflows completed</span>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Rejected / Skipped</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-slate-600">{history.filter(h => h.status === 'REJECTED').length}</span>
            <span className="text-[11px] text-slate-400">items declined</span>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Audit Trail Entries</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-brand-600">{auditLogs.length}</span>
            <span className="text-[11px] text-slate-400">logged financial events</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('queue')}
          className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'queue'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Approval Center</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
            queue.length > 0 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-500'
          }`}>
            {queue.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'history'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Workflow History ({history.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'audit'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
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
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto font-bold">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">Approval Queue is Clear</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No financial operations are currently pending your approval. Click "Scan Financial Events" to detect new overdue invoices, unreconciled PayPal payments, or stage a payment request.
              </p>
              <button
                onClick={triggerScan}
                disabled={scanning}
                className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-2 mt-2"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${scanning ? 'animate-spin' : ''}`} />
                <span>Run Detection Scan Now</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {queue.map((item) => (
                <div key={item.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4 hover:border-slate-300 transition-all">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        item.type === 'OVERDUE_REMINDER'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : item.type === 'PAYMENT_PROCESSING'
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}>
                        {item.type.replace('_', ' ')}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{new Date(item.createdAt).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Context Details Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Customer Affected</span>
                      <span className="font-bold text-slate-800">{item.customerName || 'Client'}</span>
                      <span className="text-[10px] text-slate-500 block truncate">{item.company}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Invoice Reference</span>
                      <span className="font-bold text-slate-800">{item.invoiceNumber || item.context?.invoiceNumber || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Amount Involved</span>
                      <span className="font-bold text-emerald-600 text-sm">
                        ${(item.amount || item.context?.amount || 0).toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Workflow Trigger</span>
                      <span className="font-semibold text-slate-700">
                        {item.context?.daysOverdue ? `${item.context.daysOverdue} days past due` : 'Manual user staging'}
                      </span>
                    </div>
                  </div>

                  {/* AI Reasoning */}
                  {item.aiReasoning && (
                    <div className="bg-brand-50/60 border border-brand-100 p-3 rounded-xl text-xs text-brand-900 flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                      <div className="leading-relaxed">
                        <span className="font-bold">AI Diagnosis: </span>
                        {item.aiReasoning}
                      </div>
                    </div>
                  )}

                  {/* Preview Context (e.g. Email body or PayPal details) */}
                  {item.context?.body && (
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          Subject: {item.context.subject}
                        </span>
                        <span className="text-slate-400 text-[10px]">Recipient: {item.context.customerEmail}</span>
                      </div>
                      <p className="whitespace-pre-line text-slate-600 text-[11px] bg-white p-2.5 rounded border border-slate-200/80 font-mono">
                        {item.context.body}
                      </p>
                    </div>
                  )}

                  {/* Action Bar (Approve, Edit, Reject) */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => handleReject(item.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 flex items-center gap-1.5 transition-all"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>

                    {item.type === 'OVERDUE_REMINDER' && (
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200 flex items-center gap-1.5 transition-all"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-brand-600" />
                        <span>Edit Content</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleApprove(item.id)}
                      className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 flex items-center gap-1.5 shadow-sm shadow-emerald-600/20 transition-all"
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
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Workflow Execution History</h3>
            <span className="text-xs text-slate-500">{history.length} operations recorded</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Workflow</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Updated At</th>
                  <th className="px-4 py-3">Execution Outcome</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((wf) => (
                  <tr key={wf.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-semibold text-slate-900">{wf.title}</td>
                    <td className="px-4 py-3 font-mono text-[10px] text-slate-600">{wf.type}</td>
                    <td className="px-4 py-3 text-slate-700">{wf.customerName || 'N/A'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        wf.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : wf.status === 'REJECTED'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {wf.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-[11px]">{new Date(wf.updatedAt || wf.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-3 font-mono text-[10px] text-slate-600 max-w-xs truncate">
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
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Cryptographically Recorded Audit Log</h3>
              <p className="text-xs text-slate-500">Every detection, user authorization, and PayPal dispatch is permanently logged</p>
            </div>
            <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-600">
              {auditLogs.length} events
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Action Event</th>
                  <th className="px-4 py-3">Entity Type</th>
                  <th className="px-4 py-3">Outcome</th>
                  <th className="px-4 py-3">Audit Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-2.5 text-slate-500">{new Date(log.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-2.5 font-bold text-slate-800">{log.action}</td>
                    <td className="px-4 py-2.5 text-slate-600">{log.entityType}</td>
                    <td className="px-4 py-2.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        log.outcome === 'SUCCESS'
                          ? 'bg-emerald-100 text-emerald-800'
                          : log.outcome === 'SKIPPED'
                          ? 'bg-slate-100 text-slate-700'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {log.outcome}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-slate-600 max-w-md truncate">
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
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-brand-600" />
                <h3 className="font-bold text-slate-900 text-sm">Edit Payment Reminder Content</h3>
              </div>
              <button onClick={() => setEditingItem(null)} className="text-slate-400 hover:text-slate-600 font-bold">×</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Email Subject Line</label>
                <input
                  type="text"
                  value={editSubject}
                  onChange={(e) => setEditSubject(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Personalized Reminder Body</label>
                <textarea
                  rows={8}
                  value={editBody}
                  onChange={(e) => setEditBody(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 outline-none focus:border-brand-500 font-mono text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setEditingItem(null)}
                className="px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEditAndApprove}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 flex items-center gap-1.5 shadow-sm"
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
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-brand-600" />
                <h3 className="font-bold text-slate-900 text-sm">Stage Payment Request Workflow</h3>
              </div>
              <button onClick={() => setStageModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">×</button>
            </div>

            <form onSubmit={handleStagePayment} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Customer / Client</label>
                <input
                  type="text"
                  value={stageCustomer}
                  onChange={(e) => setStageCustomer(e.target.value)}
                  placeholder="Client name"
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Amount ($ USD)</label>
                <input
                  type="number"
                  value={stageAmount}
                  onChange={(e) => setStageAmount(e.target.value)}
                  placeholder="500"
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Description / Deliverable</label>
                <input
                  type="text"
                  value={stageDescription}
                  onChange={(e) => setStageDescription(e.target.value)}
                  placeholder="Consulting or design services"
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 outline-none focus:border-brand-500"
                />
              </div>

              <p className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded border border-slate-200">
                This will prepare the workflow item and hold it in the Approval Center for your review before creating any external PayPal Order.
              </p>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStageModalOpen(false)}
                  className="px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-sm"
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
