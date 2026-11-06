import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, XCircle, ArrowRight, Loader2, FileText, Calendar, DollarSign } from 'lucide-react';
import { apiClient } from '../../api/client';

interface ActionConfirmationCardProps {
  action: {
    type: string;
    title: string;
    description: string;
    data: any;
  };
  onActionCompleted: (resultMessage: string) => void;
  onCancel: () => void;
}

export const ActionConfirmationCard: React.FC<ActionConfirmationCardProps> = ({
  action,
  onActionCompleted,
  onCancel
}) => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'PENDING' | 'SUCCESS' | 'CANCELLED'>('PENDING');

  const handleConfirm = async () => {
    try {
      setLoading(true);
      const res = await apiClient.post('/ai/confirm-action', {
        actionType: action.type,
        actionData: action.data
      });
      setStatus('SUCCESS');
      onActionCompleted(res.data.message);
    } catch (err: any) {
      alert('Error executing action: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleCancelClick = () => {
    setStatus('CANCELLED');
    onCancel();
  };

  if (status === 'SUCCESS') {
    return (
      <div className="my-3 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-3">
        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
        <div>
          <p className="text-xs font-bold text-emerald-300">Action Confirmed & Executed</p>
          <p className="text-xs text-emerald-400/80">Invoice registered with PayPal Sandbox.</p>
        </div>
      </div>
    );
  }

  if (status === 'CANCELLED') {
    return (
      <div className="my-3 p-3 bg-dark-800/80 border border-slate-700/60 rounded-xl flex items-center gap-2 text-slate-400 text-xs">
        <XCircle className="w-4 h-4 text-slate-500" />
        <span>Action cancelled by user.</span>
      </div>
    );
  }

  return (
    <div className="my-3 p-4 bg-dark-850/90 border border-brand-500/30 rounded-xl shadow-xl space-y-3 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full blur-2xl pointer-events-none"></div>

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">{action.title}</h4>
            <p className="text-[10px] text-slate-400 font-medium">Explicit authorization guard before financial dispatch</p>
          </div>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full">
          Requires Approval
        </span>
      </div>

      {/* Details Box */}
      <div className="bg-dark-900/90 p-3 rounded-lg border border-slate-800 space-y-2 text-xs">
        <div className="flex justify-between items-center">
          <span className="text-slate-400 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            Customer
          </span>
          <span className="font-semibold text-slate-200">{action.data.customerName} ({action.data.customerEmail})</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-400 flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-slate-500" />
            Total Amount
          </span>
          <span className="font-extrabold text-white text-sm">${action.data.amount?.toFixed(2)} USD</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            Payment Terms
          </span>
          <span className="font-medium text-slate-300">Due in {action.data.dueDays || 7} days</span>
        </div>
        <div className="pt-1 border-t border-slate-800 flex justify-between items-center">
          <span className="text-slate-400">Service Description:</span>
          <span className="font-medium text-brand-300 italic">{action.data.description}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-2 pt-1">
        <button
          onClick={handleCancelClick}
          disabled={loading}
          className="px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white hover:bg-dark-800 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          disabled={loading}
          className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-lg shadow-lg shadow-brand-600/30 transition-all active:scale-95 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Registering with PayPal...</span>
            </>
          ) : (
            <>
              <span>Authorize & Create Invoice</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
