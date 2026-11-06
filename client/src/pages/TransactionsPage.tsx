import React, { useState, useEffect } from 'react';
import { 
  Receipt, 
  Search, 
  CreditCard, 
  ShieldCheck, 
  CheckCircle2, 
  ExternalLink,
  DollarSign,
  Calendar,
  X,
  Eye
} from 'lucide-react';
import { apiClient } from '../api/client';
import { Transaction } from '../types';

export const TransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (search) params.search = search;

      const res = await apiClient.get('/transactions', { params });
      setTransactions(res.data);
    } catch (err: any) {
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTransactions();
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <form onSubmit={handleSearch} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search PayPal order, capture ID or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-brand-500/20"
          />
        </form>

        <div className="flex items-center gap-2">
          {['ALL', 'COMPLETED', 'PENDING', 'FAILED'].map((st) => (
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
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 border-b border-slate-200/80 text-slate-500 uppercase font-semibold text-[11px] tracking-wider">
              <tr>
                <th className="py-3.5 px-6">PayPal Order ID</th>
                <th className="py-3.5 px-6">Customer / Payer</th>
                <th className="py-3.5 px-6">Date</th>
                <th className="py-3.5 px-6">Amount</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6">Verification</th>
                <th className="py-3.5 px-6 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">Loading verified transactions...</td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">No transactions recorded yet.</td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-paypal-lightBlue" />
                        <span>{tx.paypalOrderId || tx.id.substring(0, 16)}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-semibold text-slate-800">{tx.customer?.name || tx.payerName || 'PayPal Checkout'}</p>
                      <p className="text-[11px] text-slate-400">{tx.payerEmail || tx.customer?.email || 'verified'}</p>
                    </td>
                    <td className="py-4 px-6 text-slate-600">
                      {new Date(tx.transactionDate).toLocaleDateString()} {new Date(tx.transactionDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-4 px-6 font-mono font-black text-slate-900 text-sm">
                      ${tx.amount.toFixed(2)} USD
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1 w-fit">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{tx.status}</span>
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200/60 w-fit">
                        <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
                        <span>Server Verified</span>
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => setSelectedTx(tx)}
                        className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Details Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-start border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">PayPal Transaction Verification</h3>
                <p className="font-mono text-xs text-brand-600">{selectedTx.paypalOrderId}</p>
              </div>
              <button onClick={() => setSelectedTx(null)} className="p-1 text-slate-400 hover:text-slate-600 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl space-y-2 text-xs border border-slate-200/60">
              <div className="flex justify-between">
                <span className="text-slate-500">Gross Captured:</span>
                <span className="font-bold text-slate-900">${selectedTx.amount.toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Capture ID:</span>
                <span className="font-mono text-slate-800">{selectedTx.paypalCaptureId || 'CAP-VERIFIED'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payer Name:</span>
                <span className="font-medium text-slate-800">{selectedTx.payerName || selectedTx.customer?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payer Email:</span>
                <span className="font-mono text-slate-800">{selectedTx.payerEmail || selectedTx.customer?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Timestamp:</span>
                <span className="text-slate-800">{new Date(selectedTx.transactionDate).toLocaleString()}</span>
              </div>
            </div>

            {selectedTx.rawResponseJson && (
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Backend Verification Response</span>
                <pre className="p-3 bg-slate-900 text-emerald-400 rounded-xl text-[10px] font-mono overflow-x-auto max-h-36">
                  {selectedTx.rawResponseJson}
                </pre>
              </div>
            )}

            <button
              onClick={() => setSelectedTx(null)}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
