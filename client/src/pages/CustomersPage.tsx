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
  FileText
} from 'lucide-react';
import { apiClient } from '../api/client';
import { Customer } from '../types';
import { AddCustomerModal } from '../components/customers/AddCustomerModal';

export const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);

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

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <form onSubmit={handleSearch} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by customer, company, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-brand-500/20"
          />
        </form>

        <button
          onClick={() => setAddModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-sm shadow-brand-600/30 transition-all active:scale-95"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Customer</span>
        </button>
      </div>

      {/* Customers Table / Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <p className="col-span-full text-center py-12 text-slate-400 text-xs">Loading customer directory...</p>
        ) : customers.length === 0 ? (
          <p className="col-span-full text-center py-12 text-slate-400 text-xs">No customer accounts found.</p>
        ) : (
          customers.map((c) => (
            <div
              key={c.id}
              onClick={() => handleSelectCustomer(c.id)}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-brand-500/40 hover:shadow-md transition-all cursor-pointer space-y-4 group"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-brand-50 group-hover:text-brand-600 text-slate-700 flex items-center justify-center font-bold text-sm transition-colors">
                    {c.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-brand-600 transition-colors">{c.name}</h4>
                    <p className="text-xs text-slate-500">{c.company || 'Independent Client'}</p>
                  </div>
                </div>

                {c.overdueCount && c.overdueCount > 0 ? (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                    <AlertTriangle className="w-3 h-3" />
                    <span>{c.overdueCount} Overdue</span>
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Good Standing
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-medium">Captured Revenue</span>
                  <span className="font-extrabold text-slate-900">${(c.totalPaid || 0).toLocaleString()}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-medium">Outstanding</span>
                  <span className={`font-extrabold ${(c.outstandingBalance || 0) > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
                    ${(c.outstandingBalance || 0).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="space-y-1 text-slate-500 text-[11px] pt-1">
                <p className="flex items-center gap-1.5 truncate">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{c.email}</span>
                </p>
                {c.phone && (
                  <p className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md h-full shadow-2xl p-6 overflow-y-auto space-y-6 animate-in slide-in-from-right duration-200 flex flex-col justify-between">
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{selectedCustomer.name}</h3>
                  <p className="text-xs text-slate-500">{selectedCustomer.company}</p>
                </div>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Contact Info */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/60 space-y-2 text-xs">
                <p><strong className="text-slate-700">Email:</strong> {selectedCustomer.email}</p>
                {selectedCustomer.phone && <p><strong className="text-slate-700">Phone:</strong> {selectedCustomer.phone}</p>}
                {selectedCustomer.address && <p><strong className="text-slate-700">Address:</strong> {selectedCustomer.address}</p>}
                {selectedCustomer.notes && (
                  <p className="pt-1 text-slate-600 italic border-t border-slate-200/60">
                    "{selectedCustomer.notes}"
                  </p>
                )}
              </div>

              {/* Invoice History */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-brand-600" />
                  Invoice History ({selectedCustomer.invoices?.length || 0})
                </h4>
                <div className="space-y-2">
                  {selectedCustomer.invoices?.map((inv: any) => (
                    <div key={inv.id} className="p-3 bg-white border border-slate-200 rounded-xl flex justify-between items-center text-xs">
                      <div>
                        <span className="font-mono font-bold text-slate-800">{inv.invoiceNumber}</span>
                        <p className="text-[10px] text-slate-400">Due {new Date(inv.dueDate).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-slate-900">${inv.total.toFixed(2)}</span>
                        <span className={`block text-[10px] font-bold ${
                          inv.status === 'PAID' ? 'text-emerald-600' :
                          inv.status === 'OVERDUE' ? 'text-rose-600' : 'text-amber-600'
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
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
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
    </div>
  );
};
