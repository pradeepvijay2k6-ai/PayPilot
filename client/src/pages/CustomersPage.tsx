import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Mail, 
  Phone, 
  Building, 
  DollarSign, 
  AlertTriangle, 
  Calendar,
  X,
  CreditCard,
  FileText,
  Download,
  QrCode,
  Send,
  CheckCircle2
} from 'lucide-react';
import { apiClient } from '../api/client';
import { Customer } from '../types';
import { AddCustomerModal } from '../components/customers/AddCustomerModal';
import { PaymentQrModal } from '../components/common/PaymentQrModal';

export const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'OVERDUE' | 'CURRENT'>('ALL');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrAmount, setQrAmount] = useState<number>(100);
  const [qrDesc, setQrDesc] = useState<string>('');

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/customers', {
        params: { search: search || undefined }
      });
      setCustomers(res.data);
    } catch (err: any) {
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCustomers();
  };

  const handleSelectCustomer = async (id: string) => {
    try {
      const res = await apiClient.get(`/customers/${id}`);
      setSelectedCustomer(res.data);
    } catch (err: any) {
      alert('Error fetching customer details: ' + err.message);
    }
  };

  const handleOpenCustomerQr = (c: Customer, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const amount = c.outstandingBalance && c.outstandingBalance > 0 ? c.outstandingBalance : 150;
    setQrAmount(amount);
    setQrDesc(`Payment for ${c.name} (${c.company || 'Account Settlement'})`);
    setQrModalOpen(true);
  };

  const handleExportCsv = () => {
    if (customers.length === 0) return;
    const headers = ['Name', 'Company', 'Email', 'Phone', 'Total Invoiced', 'Total Paid', 'Outstanding Balance', 'Overdue Invoices'];
    const rows = customers.map(c => [
      `"${c.name.replace(/"/g, '""')}"`,
      `"${(c.company || '').replace(/"/g, '""')}"`,
      `"${c.email.replace(/"/g, '""')}"`,
      `"${(c.phone || '').replace(/"/g, '""')}"`,
      (c.totalInvoiced || 0).toFixed(2),
      (c.totalPaid || 0).toFixed(2),
      (c.outstandingBalance || 0).toFixed(2),
      c.overdueCount || 0
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PayPilot_Customers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredCustomers = customers.filter(c => {
    if (filter === 'OVERDUE') return (c.overdueCount || 0) > 0 || (c.outstandingBalance || 0) > 0;
    if (filter === 'CURRENT') return (c.overdueCount || 0) === 0;
    return true;
  });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 glass-card p-4 rounded-2xl border border-slate-800/80 shadow-xs">
        <form onSubmit={handleSearch} className="relative w-full lg:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by customer, company, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-dark-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-brand-500 transition-colors"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-between lg:justify-end">
          <div className="flex items-center gap-1.5">
            {[
              { id: 'ALL', label: 'All Clients' },
              { id: 'OVERDUE', label: 'Overdue Accounts' },
              { id: 'CURRENT', label: 'In Good Standing' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  filter === f.id
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                    : 'bg-dark-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              title="Export customer directory to CSV"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-dark-950 hover:bg-dark-850 text-slate-300 hover:text-white text-xs font-semibold rounded-xl border border-slate-800 transition-all"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>

            <button
              onClick={() => setAddModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl shadow-md shadow-brand-500/20 transition-all active:scale-95 shrink-0"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Customer</span>
            </button>
          </div>
        </div>
      </div>

      {/* Customers Table / Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <p className="col-span-full text-center py-12 text-slate-500 text-xs font-medium">Loading customer directory...</p>
        ) : filteredCustomers.length === 0 ? (
          <p className="col-span-full text-center py-12 text-slate-500 text-xs font-medium">No customer accounts found matching criteria.</p>
        ) : (
          filteredCustomers.map((c) => (
            <div
              key={c.id}
              onClick={() => handleSelectCustomer(c.id)}
              className="glass-card p-5 rounded-2xl border border-slate-800/80 hover:border-brand-500/40 hover:shadow-lg hover:shadow-brand-500/5 transition-all cursor-pointer space-y-4 group"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-dark-950 border border-slate-800 group-hover:border-brand-500/40 group-hover:text-brand-400 text-slate-300 flex items-center justify-center font-bold font-mono text-sm transition-colors">
                    {c.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm group-hover:text-brand-300 transition-colors">{c.name}</h3>
                    <p className="text-xs text-slate-400">{c.company || 'Individual Client'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => handleOpenCustomerQr(c, e)}
                    title="Generate QR Payment for this client"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-brand-400 hover:bg-brand-500/10 transition-colors"
                  >
                    <QrCode className="w-4 h-4" />
                  </button>
                  {c.overdueCount && c.overdueCount > 0 ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                      <AlertTriangle className="w-3 h-3" />
                      <span>{c.overdueCount} Overdue</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Good Standing</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Financial Metrics */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/60 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Settled Paid</span>
                  <p className="font-mono font-bold text-emerald-400 mt-0.5">
                    ${(c.totalPaid || 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Outstanding</span>
                  <p className={`font-mono font-bold mt-0.5 ${
                    (c.outstandingBalance || 0) > 0 ? 'text-amber-400' : 'text-slate-400'
                  }`}>
                    ${(c.outstandingBalance || 0).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="space-y-1 text-slate-400 text-[11px] pt-1">
                <p className="flex items-center gap-1.5 truncate">
                  <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">{c.email}</span>
                </p>
                {c.phone && (
                  <p className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>{c.phone}</span>
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Customer Details Drawer Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/75 backdrop-blur-sm">
          <div className="bg-dark-900 border-l border-slate-800 w-full max-w-md h-full shadow-2xl p-6 overflow-y-auto space-y-6 animate-in slide-in-from-right duration-200 flex flex-col justify-between">
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex justify-between items-start border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white">{selectedCustomer.name}</h3>
                  <p className="text-xs text-slate-400">{selectedCustomer.company}</p>
                </div>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Quick Actions Bar */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleOpenCustomerQr(selectedCustomer)}
                  className="flex-1 py-2 px-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Instant QR Pay</span>
                </button>
              </div>

              {/* Contact Info */}
              <div className="bg-dark-950/80 p-3.5 rounded-2xl border border-slate-800 space-y-2 text-xs">
                <p><strong className="text-slate-300">Email:</strong> <span className="text-slate-400">{selectedCustomer.email}</span></p>
                {selectedCustomer.phone && <p><strong className="text-slate-300">Phone:</strong> <span className="text-slate-400">{selectedCustomer.phone}</span></p>}
                {selectedCustomer.address && <p><strong className="text-slate-300">Address:</strong> <span className="text-slate-400">{selectedCustomer.address}</span></p>}
                {selectedCustomer.notes && (
                  <p className="pt-1.5 text-slate-300 italic border-t border-slate-800">
                    "{selectedCustomer.notes}"
                  </p>
                )}
              </div>

              {/* Invoice History */}
              <div>
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-brand-400" />
                  Invoice History ({selectedCustomer.invoices?.length || 0})
                </h4>
                <div className="space-y-2">
                  {selectedCustomer.invoices?.map((inv: any) => (
                    <div key={inv.id} className="p-3 bg-dark-950 border border-slate-800 rounded-xl flex justify-between items-center text-xs">
                      <div>
                        <span className="font-mono font-bold text-white">{inv.invoiceNumber}</span>
                        <p className="text-[10px] text-slate-500 font-mono">Due {new Date(inv.dueDate).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold font-mono text-white">${inv.total.toFixed(2)}</span>
                        <span className={`block text-[10px] font-bold ${
                          inv.status === 'PAID' ? 'text-emerald-400' :
                          inv.status === 'OVERDUE' ? 'text-rose-400' : 'text-amber-400'
                        }`}>
                          {inv.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedCustomer(null)}
              className="w-full py-2.5 bg-dark-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 rounded-xl text-xs font-semibold transition-all"
            >
              Close Drawer
            </button>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      <AddCustomerModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onCustomerAdded={() => fetchCustomers()}
      />

      {/* Dedicated Customer QR Modal */}
      <PaymentQrModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        initialAmount={qrAmount}
        initialDescription={qrDesc}
      />
    </div>
  );
};
