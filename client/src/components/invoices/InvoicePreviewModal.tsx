import React, { useState } from 'react';
import { 
  X, 
  Send, 
  RefreshCw, 
  Printer, 
  ExternalLink, 
  CreditCard, 
  CheckCircle2, 
  Calendar,
  Building,
  Mail,
  Loader2
} from 'lucide-react';
import { Invoice } from '../../types';
import { apiClient } from '../../api/client';

interface InvoicePreviewModalProps {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

export const InvoicePreviewModal: React.FC<InvoicePreviewModalProps> = ({
  invoice,
  isOpen,
  onClose,
  onUpdated
}) => {
  const [sending, setSending] = useState(false);
  const [syncing, setSyncing] = useState(false);

  if (!isOpen || !invoice) return null;

  const handleSendViaPayPal = async () => {
    try {
      setSending(true);
      await apiClient.post(`/invoices/${invoice.id}/send`);
      alert('Invoice successfully dispatched via PayPal Invoicing API!');
      onUpdated();
    } catch (err: any) {
      alert('Error sending invoice: ' + (err.response?.data?.error || err.message));
    } finally {
      setSending(false);
    }
  };

  const handleSyncPayPal = async () => {
    try {
      setSyncing(true);
      const res = await apiClient.post(`/invoices/${invoice.id}/sync`);
      alert(res.data.message);
      onUpdated();
    } catch (err: any) {
      alert('Sync error: ' + (err.response?.data?.error || err.message));
    } finally {
      setSyncing(false);
    }
  };

  const checkoutUrl = `/pay/invoice/${invoice.id}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-dark-900 rounded-2xl max-w-2xl w-full border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Top Action Bar */}
        <div className="px-6 py-3.5 border-b border-slate-800 flex items-center justify-between bg-dark-950">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-white text-sm">{invoice.invoiceNumber}</span>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
              invoice.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
              invoice.status === 'OVERDUE' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
              invoice.status === 'SENT' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            }`}>
              {invoice.status}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              title="Print Invoice"
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg text-xs flex items-center gap-1 font-semibold transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Sheet */}
        <div className="p-8 overflow-y-auto space-y-6 flex-1 bg-dark-900 text-slate-100">
          {/* Header */}
          <div className="flex justify-between items-start border-b border-slate-800 pb-6">
            <div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white font-extrabold text-xl mb-2 shadow-lg shadow-brand-500/20">
                P
              </div>
              <h2 className="text-xl font-bold text-white">Nexus Cloud Solutions</h2>
              <p className="text-xs text-slate-400">500 Howard Street, San Francisco, CA 94105</p>
              <p className="text-xs text-slate-400">billing@nexuscloud.io</p>
            </div>

            <div className="text-right">
              <span className="text-2xl font-black text-white tracking-tight block">INVOICE</span>
              <p className="font-mono text-xs font-semibold text-brand-400 mt-1">{invoice.invoiceNumber}</p>
              <div className="mt-2 text-xs text-slate-400 space-y-0.5">
                <p>Issue Date: <span className="font-medium text-slate-200 font-mono">{new Date(invoice.issueDate).toLocaleDateString()}</span></p>
                <p>Due Date: <span className="font-medium text-slate-200 font-mono">{new Date(invoice.dueDate).toLocaleDateString()}</span></p>
              </div>
            </div>
          </div>

          {/* Billed To */}
          <div className="bg-dark-950/80 p-4 rounded-xl border border-slate-800">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">Billed To</span>
            <h4 className="text-sm font-semibold text-white">{invoice.customer.name}</h4>
            <p className="text-xs text-slate-300">{invoice.customer.company || 'Private Client'}</p>
            <p className="text-xs text-slate-400">{invoice.customer.email}</p>
          </div>

          {/* Line Items Table */}
          <div className="overflow-hidden rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-dark-950 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3">Description</th>
                  <th className="p-3 text-center">Qty</th>
                  <th className="p-3 text-right">Unit Price</th>
                  <th className="p-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-dark-950/40">
                {invoice.items.map((it, idx) => (
                  <tr key={idx}>
                    <td className="p-3 font-medium text-slate-200">{it.description}</td>
                    <td className="p-3 text-center font-mono text-slate-300">{it.quantity}</td>
                    <td className="p-3 text-right font-mono text-slate-300">${it.unitPrice.toFixed(2)}</td>
                    <td className="p-3 text-right font-mono font-bold text-white">${it.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-64 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal:</span>
                <span className="font-mono font-semibold text-slate-200">${invoice.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Tax (0%):</span>
                <span className="font-mono font-semibold text-slate-200">$0.00</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-slate-800">
                <span>Total Due:</span>
                <span className="font-mono text-brand-400 font-extrabold">${invoice.total.toFixed(2)} USD</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="p-3.5 bg-dark-950 rounded-xl border border-slate-800 text-xs text-slate-300">
              <span className="font-semibold text-slate-200 block mb-0.5">Notes & Terms:</span>
              <p className="text-slate-400">{invoice.notes}</p>
            </div>
          )}

          {/* PayPal Invoicing ID reference */}
          {invoice.paypalInvoiceId && (
            <div className="flex items-center justify-between text-[11px] p-2.5 bg-brand-500/10 border border-brand-500/20 rounded-xl text-brand-300">
              <span className="font-mono">PayPal Invoice ID: {invoice.paypalInvoiceId}</span>
              <span className="font-bold text-[10px] bg-brand-500/20 px-2 py-0.5 rounded text-brand-200">Synced</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-dark-950 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {invoice.paypalInvoiceId ? (
              <button
                onClick={handleSyncPayPal}
                disabled={syncing}
                className="px-3.5 py-1.5 bg-dark-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-brand-400 ${syncing ? 'animate-spin' : ''}`} />
                <span>Sync with PayPal</span>
              </button>
            ) : (
              <button
                onClick={handleSendViaPayPal}
                disabled={sending}
                className="px-3.5 py-1.5 bg-brand-500/10 border border-brand-500/20 text-brand-400 hover:bg-brand-500/20 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>Send via PayPal Invoicing API</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            {invoice.status !== 'PAID' && (
              <a
                href={checkoutUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-brand-500/20 transition-all"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Customer Checkout Page</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-dark-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 rounded-xl text-xs font-semibold transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
