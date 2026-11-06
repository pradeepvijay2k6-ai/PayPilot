import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, DollarSign, Calendar, FileText, CheckCircle2, Loader2 } from 'lucide-react';
import { apiClient } from '../../api/client';
import { Customer } from '../../types';

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvoiceCreated: () => void;
}

export const CreateInvoiceModal: React.FC<CreateInvoiceModalProps> = ({
  isOpen,
  onClose,
  onInvoiceCreated,
}) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    return d.toISOString().split('T')[0];
  });
  const [notes, setNotes] = useState('Payment is due within 7 days. Thank you for your business!');
  const [syncPayPal, setSyncPayPal] = useState(true);
  const [items, setItems] = useState([
    { description: 'Consulting Services', quantity: 1, unitPrice: 500 }
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      apiClient.get('/customers').then((res) => {
        setCustomers(res.data);
        if (res.data.length > 0 && !selectedCustomerId) {
          setSelectedCustomerId(res.data[0].id);
        }
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddItem = () => {
    setItems([...items, { description: '', quantity: 1, unitPrice: 100 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
    setItems(newItems);
  };

  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const total = subtotal;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || items.length === 0) return;

    try {
      setLoading(true);
      await apiClient.post('/invoices', {
        customerId: selectedCustomerId,
        dueDate,
        items,
        notes,
        syncPayPal
      });
      onInvoiceCreated();
      onClose();
    } catch (err: any) {
      alert('Error creating invoice: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Create New Invoice</h3>
              <p className="text-[11px] text-slate-500">Configure invoice line items and sync with PayPal Sandbox</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Customer Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Select Customer</label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-brand-500/20"
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-brand-500/20"
                required
              />
            </div>
          </div>

          {/* Line items table */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-slate-700">Line Items</label>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-[11px] font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Item
              </button>
            </div>

            <div className="space-y-2">
              {items.map((item, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Item description"
                    value={item.description}
                    onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs"
                    required
                  />
                  <input
                    type="number"
                    min="1"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(idx, 'quantity', parseFloat(e.target.value) || 1)}
                    className="w-16 bg-slate-50 border border-slate-200 rounded-lg px-2 py-2 text-xs text-center"
                    required
                  />
                  <div className="relative w-28">
                    <span className="absolute left-2.5 top-2 text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Unit Price"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                      className="w-full pl-6 pr-2 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-medium"
                      required
                    />
                  </div>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Notes / Terms</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800"
            />
          </div>

          {/* PayPal Sync Checkbox */}
          <div className="p-3 bg-brand-50/50 border border-brand-200/80 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="syncPayPal"
                checked={syncPayPal}
                onChange={(e) => setSyncPayPal(e.target.checked)}
                className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
              />
              <label htmlFor="syncPayPal" className="text-xs font-semibold text-slate-800">
                Register as Draft in PayPal Sandbox Invoicing API
              </label>
            </div>
            <span className="text-[10px] font-bold text-paypal-blue bg-white px-2 py-0.5 rounded border border-brand-200">
              PayPal v2
            </span>
          </div>

          {/* Subtotal & Total Preview */}
          <div className="p-3 bg-slate-50 rounded-xl flex justify-between items-center text-xs border border-slate-200/60 font-semibold">
            <span className="text-slate-500">Total Billed:</span>
            <span className="text-base font-extrabold text-slate-900">${total.toFixed(2)} USD</span>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm shadow-brand-600/30 flex items-center gap-1.5 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Creating Invoice...</span>
                </>
              ) : (
                <span>Save & Issue Invoice</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
