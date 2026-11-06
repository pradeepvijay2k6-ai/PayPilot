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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Top Action Bar */}
        <div className="px-6 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-slate-800 text-sm">{invoice.invoiceNumber}</span>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
              invoice.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' :
              invoice.status === 'OVERDUE' ? 'bg-rose-100 text-rose-800' :
              invoice.status === 'SENT' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {invoice.status}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              title="Print Invoice"
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-lg text-xs flex items-center gap-1 font-semibold"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Sheet */}
        <div className="p-8 overflow-y-auto space-y-6 flex-1 bg-white">
          {/* Header */}
          <div className="flex justify-between items-start border-b border-slate-200 pb-6">
            <div>
              <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white font-extrabold text-xl mb-2">
                P
              </div>
              <h2 className="text-xl font-bold text-slate-900">Nexus Cloud Solutions</h2>
              <p className="text-xs text-slate-500">500 Howard Street, San Francisco, CA 94105</p>
              <p className="text-xs text-slate-500">billing@nexuscloud.io</p>
            </div>

            <div className="text-right">
              <span className="text-2xl font-black text-slate-900 tracking-tight block">INVOICE</span>
              <p className="font-mono text-xs font-semibold text-brand-600 mt-1">{invoice.invoiceNumber}</p>
              <div className="mt-2 text-xs text-slate-500 space-y-0.5">
                <p>Issue Date: <span className="font-medium text-slate-700">{new Date(invoice.issueDate).toLocaleDateString()}</span></p>
                <p>Due Date: <span className="font-medium text-slate-700">{new Date(invoice.dueDate).toLocaleDateString()}</span></p>
              </div>
            </div>
          </div>

          {/* Billed To */}
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/60">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Billed To</span>
            <h4 className="text-sm font-bold text-slate-900">{invoice.customer.name}</h4>
            <p className="text-xs text-slate-600">{invoice.customer.company || 'Private Client'}</p>
            <p className="text-xs text-slate-500">{invoice.customer.email}</p>
          </div>

          {/* Line Items Table */}
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="p-3">Description</th>
                  <th className="p-3 text-center">Qty</th>
                  <th className="p-3 text-right">Unit Price</th>
                  <th className="p-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {invoice.items.map((it, idx) => (
                  <tr key={idx}>
                    <td className="p-3 font-medium text-slate-800">{it.description}</td>
                    <td className="p-3 text-center font-mono">{it.quantity}</td>
                    <td className="p-3 text-right font-mono">${it.unitPrice.toFixed(2)}</td>
                    <td className="p-3 text-right font-mono font-bold">${it.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-64 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-mono font-semibold">${invoice.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Tax (0%):</span>
                <span className="font-mono font-semibold">$0.00</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                <span>Total Due:</span>
                <span className="font-mono text-brand-600 font-extrabold">${invoice.total.toFixed(2)} USD</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs text-slate-600">
              <span className="font-bold text-slate-700 block mb-0.5">Notes & Terms:</span>
              <p>{invoice.notes}</p>
            </div>
          )}

          {/* PayPal Invoicing ID reference */}
          {invoice.paypalInvoiceId && (
            <div className="flex items-center justify-between text-[11px] p-2 bg-blue-50/60 border border-blue-200 rounded-lg text-blue-900">
              <span className="font-mono">PayPal Invoice ID: {invoice.paypalInvoiceId}</span>
              <span className="font-bold text-[10px] bg-blue-200/60 px-2 py-0.5 rounded">Synced</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {invoice.paypalInvoiceId ? (
              <button
                onClick={handleSyncPayPal}
                disabled={syncing}
                className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-semibold flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                <span>Sync with PayPal</span>
              </button>
            ) : (
              <button
                onClick={handleSendViaPayPal}
                disabled={sending}
                className="px-3 py-1.5 bg-brand-50 border border-brand-200 text-brand-700 hover:bg-brand-100 rounded-lg text-xs font-semibold flex items-center gap-1.5"
              >
                {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>Send via PayPal Invoicing API</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {invoice.status !== 'PAID' && (
              <a
                href={checkoutUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-paypal-blue hover:bg-paypal-lightBlue text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-paypal-blue/30 transition-colors"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Customer Checkout Page</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
