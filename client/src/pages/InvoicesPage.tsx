import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  ExternalLink, 
  Send, 
  RefreshCw, 
  Trash2, 
  Eye, 
  Calendar,
  DollarSign,
  CreditCard
} from 'lucide-react';
import { apiClient } from '../api/client';
import { Invoice } from '../types';
import { InvoicePreviewModal } from '../components/invoices/InvoicePreviewModal';

interface InvoicesPageProps {
  onOpenCreateInvoice: () => void;
}

export const InvoicesPage: React.FC<InvoicesPageProps> = ({ onOpenCreateInvoice }) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (search) params.search = search;

      const res = await apiClient.get('/invoices', { params });
      setInvoices(res.data);
    } catch (err: any) {
      console.error('Error fetching invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchInvoices();
  };

  const handleOpenPreview = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setPreviewOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this invoice?')) return;
    try {
      await apiClient.delete(`/invoices/${id}`);
      fetchInvoices();
    } catch (err: any) {
      alert('Error deleting invoice: ' + err.message);
    }
  };

  const statuses = ['ALL', 'PAID', 'OVERDUE', 'SENT', 'UNPAID', 'DRAFT'];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search invoice number or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-brand-500/20"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {statuses.map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === st
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
          <button
            onClick={onOpenCreateInvoice}
            className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-sm shadow-brand-600/30 ml-2 shrink-0 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>New Invoice</span>
          </button>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 border-b border-slate-200/80 text-slate-500 uppercase font-semibold text-[11px] tracking-wider">
              <tr>
                <th className="py-3.5 px-6">Invoice #</th>
                <th className="py-3.5 px-6">Customer</th>
                <th className="py-3.5 px-6">Issue / Due Date</th>
                <th className="py-3.5 px-6">Total Amount</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6">PayPal Ref</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">Loading invoices...</td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">No invoices match your criteria.</td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-slate-900">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-semibold text-slate-800">{inv.customer.name}</p>
                      <p className="text-[11px] text-slate-400">{inv.customer.company || inv.customer.email}</p>
                    </td>
                    <td className="py-4 px-6 text-slate-600">
                      <p>{new Date(inv.issueDate).toLocaleDateString()}</p>
                      <p className="text-[11px] text-slate-400">Due {new Date(inv.dueDate).toLocaleDateString()}</p>
                    </td>
                    <td className="py-4 px-6 font-mono font-extrabold text-slate-900">
                      ${inv.total.toFixed(2)} USD
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        inv.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' :
                        inv.status === 'OVERDUE' ? 'bg-rose-100 text-rose-800' :
                        inv.status === 'SENT' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {inv.paypalInvoiceId ? (
                        <span className="font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-700 border border-slate-200">
                          {inv.paypalInvoiceId.substring(0, 12)}...
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">—</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenPreview(inv)}
                          title="Preview & Details"
                          className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {inv.status !== 'PAID' && (
                          <a
                            href={`/pay/invoice/${inv.id}`}
                            target="_blank"
                            rel="noreferrer"
                            title="Open Customer Checkout Page"
                            className="p-1.5 text-slate-500 hover:text-paypal-blue hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <CreditCard className="w-4 h-4" />
                          </a>
                        )}
                        <button
                          onClick={() => handleDelete(inv.id)}
                          title="Delete"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Preview Modal */}
      <InvoicePreviewModal
        invoice={selectedInvoice}
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        onUpdated={() => {
          fetchInvoices();
          setPreviewOpen(false);
        }}
      />
    </div>
  );
};
