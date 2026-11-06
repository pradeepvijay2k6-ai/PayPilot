import React, { useState, useEffect } from 'react';
import { X, Send, DollarSign, Copy, Check, ExternalLink, Loader2 } from 'lucide-react';
import { apiClient } from '../../api/client';
import { Customer } from '../../types';

interface CreatePaymentRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRequestCreated: () => void;
}

export const CreatePaymentRequestModal: React.FC<CreatePaymentRequestModalProps> = ({
  isOpen,
  onClose,
  onRequestCreated,
}) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [amount, setAmount] = useState('250.00');
  const [description, setDescription] = useState('Consulting Services Retainer');
  const [loading, setLoading] = useState(false);
  const [createdUrl, setCreatedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCreatedUrl(null);
      apiClient.get('/customers').then((res) => {
        setCustomers(res.data);
        if (res.data.length > 0 && !selectedCustomerId) {
          setSelectedCustomerId(res.data[0].id);
        }
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || !amount || !description) return;

    try {
      setLoading(true);
      const res = await apiClient.post('/payments/request', {
        customerId: selectedCustomerId,
        amount: parseFloat(amount),
        description
      });
      setCreatedUrl(window.location.origin + res.data.publicUrl);
      onRequestCreated();
    } catch (err: any) {
      alert('Error creating payment request: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!createdUrl) return;
    navigator.clipboard.writeText(createdUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-dark-900 rounded-2xl max-w-md w-full border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-dark-950">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-500/10 text-brand-400 border border-brand-500/20 flex items-center justify-center font-bold">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm">Create Payment Request</h3>
              <p className="text-[11px] text-slate-400">Generate a direct PayPal checkout link</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {createdUrl ? (
          <div className="p-6 space-y-4 text-center">
            <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-base">Payment Request Ready!</h4>
              <p className="text-xs text-slate-400 mt-1">
                Share this direct payment link with your customer to pay via PayPal Sandbox:
              </p>
            </div>

            <div className="flex items-center gap-2 bg-dark-950 border border-slate-800 rounded-xl p-2 text-xs font-mono text-slate-300 truncate">
              <span className="truncate flex-1 text-left">{createdUrl}</span>
              <button
                onClick={handleCopy}
                className="px-2.5 py-1 bg-dark-900 border border-slate-700 text-slate-200 hover:text-white hover:bg-slate-800 rounded-lg text-xs font-sans font-semibold flex items-center gap-1 shrink-0 transition-all"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="pt-2 flex justify-center gap-2.5">
              <a
                href={createdUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-brand-500/20 transition-all"
              >
                <span>Open Checkout Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-dark-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 rounded-xl text-xs font-semibold transition-all"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Customer</label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full bg-dark-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-200 outline-none focus:border-brand-500"
                required
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.company || c.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Amount (USD)</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-500 text-xs font-bold">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 bg-dark-950 border border-slate-800 rounded-xl text-xs font-mono font-bold text-white outline-none focus:border-brand-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 bg-dark-950 border border-slate-800 rounded-xl text-xs text-slate-200 outline-none focus:border-brand-500"
                required
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-md shadow-brand-500/20 flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>Generate Payment Link</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
