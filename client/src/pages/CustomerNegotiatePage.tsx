import React, { useState, useEffect } from 'react';
import { 
  Handshake, 
  ShieldCheck, 
  Calendar, 
  DollarSign, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  CreditCard, 
  AlertCircle,
  FileText,
  ChevronRight,
  Info
} from 'lucide-react';
import axios from 'axios';

export const CustomerNegotiatePage: React.FC = () => {
  // Extract invoice ID or agreement ID from path /negotiate/:id or /smartsettle/:id
  const pathname = window.location.pathname;
  const parts = pathname.split('/');
  const recordId = parts[parts.length - 1];

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Negotiation Form State
  const [installmentsCount, setInstallmentsCount] = useState(3);
  const [extensionDays, setExtensionDays] = useState(30);
  const [hardshipNote, setHardshipNote] = useState('Experiencing short-term client payment delays; requesting staggered installment relief.');
  const [generating, setGenerating] = useState(false);
  const [proposedPlan, setProposedPlan] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Installment Payment State
  const [payingInstallmentId, setPayingInstallmentId] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState<string | null>(null);

  const fetchNegotiationData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:5001/api/smartsettle/public/${recordId}`);
      setData(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Could not load negotiation details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (recordId) {
      fetchNegotiationData();
    }
  }, [recordId]);

  const handleGeneratePlan = async () => {
    if (!data?.invoice) return;
    try {
      setGenerating(true);
      const res = await axios.post('http://localhost:5001/api/smartsettle/public/propose', {
        invoiceId: data.invoice.id,
        requestedInstallments: installmentsCount,
        requestedExtensionDays: extensionDays,
        hardshipReason: hardshipNote
      });
      setProposedPlan(res.data.proposal);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to generate plan');
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmitProposal = async () => {
    if (!proposedPlan || !data?.invoice) return;
    try {
      setSubmitting(true);
      await axios.post('http://localhost:5001/api/smartsettle/public/request', {
        invoiceId: data.invoice.id,
        customerNote: hardshipNote,
        plan: proposedPlan,
        createdBy: 'CUSTOMER'
      });
      setSubmittedSuccess(true);
      await fetchNegotiationData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to submit proposal');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePayInstallment = async (installment: any) => {
    try {
      setPayingInstallmentId(installment.id);
      const res = await axios.post('http://localhost:5001/api/smartsettle/public/capture-installment', {
        installmentId: installment.id,
        paypalOrderId: `ORD-SS-${Date.now()}`
      });
      setPaymentSuccess(`Instalment #${installment.installmentNumber} for $${installment.amount.toFixed(2)} settled successfully via PayPal!`);
      await fetchNegotiationData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Payment capture failed');
    } finally {
      setPayingInstallmentId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center text-slate-200 text-xs font-semibold">
        <div className="flex items-center gap-3 px-6 py-4 rounded-2xl glass-card border border-slate-800">
          <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <span>Opening secure SmartSettle negotiation portal...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
        <div className="glass-card rounded-2xl max-w-md w-full p-8 text-center space-y-4 border border-slate-800">
          <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
          <h2 className="text-lg font-bold text-white">Negotiation Portal Unavailable</h2>
          <p className="text-xs text-slate-400">{error || 'Invoice not found or invalid link.'}</p>
        </div>
      </div>
    );
  }

  const { invoice, customer, business, agreement } = data;

  return (
    <div className="min-h-screen bg-dark-950 text-slate-100 py-10 px-4 font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Brand & Security Header */}
        <div className="flex items-center justify-between glass-card p-5 rounded-2xl border border-slate-800/80 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-violet-600 text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-brand-500/20">
              <Handshake className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-white text-base">{business.name}</h1>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20">
                  SmartSettle Portal
                </span>
              </div>
              <p className="text-xs text-slate-400">Authorized Flexible Payment Negotiation Gateway</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-dark-950 px-3.5 py-1.5 rounded-xl border border-slate-800 text-xs text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-medium">PayPal Sandbox Secured</span>
          </div>
        </div>

        {/* Payment Success Toast */}
        {paymentSuccess && (
          <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 flex items-center justify-between text-xs backdrop-blur-md">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span className="font-semibold">{paymentSuccess}</span>
            </div>
            <button onClick={() => setPaymentSuccess(null)} className="font-bold text-slate-400 hover:text-white ml-4">×</button>
          </div>
        )}

        {/* Invoice Summary Card */}
        <div className="glass-card rounded-2xl border border-slate-800/80 p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/60 pb-4">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Outstanding Account</span>
              <h2 className="text-lg font-bold font-mono text-white">Invoice {invoice.invoiceNumber}</h2>
              <span className="text-xs text-slate-400">Billed to: <strong className="text-slate-200">{customer.name}</strong> ({customer.company || customer.email})</span>
            </div>

            <div className="text-left md:text-right">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Total Balance Due</span>
              <div className="text-2xl font-extrabold font-mono text-white">${invoice.total.toLocaleString()}</div>
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full inline-block mt-1 ${
                invoice.status === 'PAID'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : invoice.daysOverdue > 0
                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }`}>
                {invoice.status === 'PAID' ? 'PAID IN FULL' : invoice.daysOverdue > 0 ? `${invoice.daysOverdue} Days Overdue` : `Due on ${invoice.dueDate}`}
              </span>
            </div>
          </div>

          {/* Line items mini preview */}
          {invoice.items && invoice.items.length > 0 && (
            <div className="mt-4 pt-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">Itemized Services</span>
              <div className="divide-y divide-slate-800/60 text-xs">
                {invoice.items.map((it: any) => (
                  <div key={it.id || it.description} className="py-2 flex justify-between text-slate-300">
                    <span>{it.description} (x{it.quantity})</span>
                    <span className="font-mono font-medium text-white">${it.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* STATE A: ACTIVE AGREEMENT IN EFFECT */}
        {agreement && agreement.status === 'ACTIVE' && (
          <div className="glass-card rounded-2xl border border-emerald-500/30 p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-emerald-500/20 pb-4">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="font-semibold text-white text-base">Active Payment Arrangement</h3>
                  <p className="text-xs text-slate-400">Agreed {agreement.installmentsCount}-part installment schedule approved by {business.name}</p>
                </div>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                ACTIVE PLAN
              </span>
            </div>

            {/* Progress Bar */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="text-slate-400">Progress: <span className="text-white font-mono">${agreement.paidAmount.toLocaleString()}</span> paid of <span className="text-slate-300 font-mono">${agreement.settledAmount.toLocaleString()}</span></span>
                <span className="text-emerald-400 font-mono">{Math.round((agreement.paidAmount / agreement.settledAmount) * 100)}% Settled</span>
              </div>
              <div className="w-full bg-dark-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                <div 
                  className="bg-emerald-500 h-full transition-all duration-500 rounded-full shadow-sm shadow-emerald-500/50"
                  style={{ width: `${Math.min(100, (agreement.paidAmount / agreement.settledAmount) * 100)}%` }}
                />
              </div>
            </div>

            {/* Installments Table */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Scheduled Milestones</h4>
              <div className="divide-y divide-slate-800/60 border border-slate-800/80 rounded-xl overflow-hidden">
                {agreement.installments.map((inst: any) => {
                  const isPaid = inst.status === 'COMPLETED';
                  const isProcessing = payingInstallmentId === inst.id;

                  return (
                    <div key={inst.id} className={`p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs ${
                      isPaid ? 'bg-emerald-950/20' : 'bg-dark-900/60'
                    }`}>
                      <div className="flex items-center gap-3">
                        <span className={`w-7 h-7 rounded-full font-bold flex items-center justify-center text-xs font-mono ${
                          isPaid ? 'bg-emerald-500 text-white' : 'bg-dark-950 border border-slate-800 text-slate-300'
                        }`}>
                          {isPaid ? '✓' : `#${inst.installmentNumber}`}
                        </span>
                        <div>
                          <span className="font-semibold text-white block">Instalment #{inst.installmentNumber}</span>
                          <span className="text-slate-400 text-[11px] flex items-center gap-1 font-mono">
                            <Calendar className="w-3 h-3 text-slate-500" />
                            Due: {inst.dueDate}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between md:justify-end gap-4">
                        <span className="font-bold font-mono text-white text-base">
                          ${inst.amount.toFixed(2)}
                        </span>

                        {isPaid ? (
                          <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full flex items-center gap-1 font-mono">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Settled on {new Date(inst.paidAt || Date.now()).toLocaleDateString()}
                          </span>
                        ) : (
                          <button
                            onClick={() => handlePayInstallment(inst)}
                            disabled={isProcessing}
                            className="bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-md shadow-brand-500/20 transition-all"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>{isProcessing ? 'Processing via PayPal...' : 'Pay with PayPal Sandbox'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* STATE B: PROPOSAL PENDING BUSINESS APPROVAL */}
        {agreement && agreement.status === 'PENDING_APPROVAL' && (
          <div className="glass-card border border-amber-500/30 rounded-2xl p-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-white">Payment Plan Proposal Pending Review</h3>
            <p className="text-xs text-slate-400 max-w-lg mx-auto">
              Your requested {agreement.installmentsCount}-part installment plan of <span className="font-mono text-slate-200">${agreement.settledAmount.toLocaleString()}</span> has been submitted to {business.name}. You will be notified once the business owner approves the terms.
            </p>
            <div className="bg-dark-950 p-4 rounded-xl border border-slate-800 text-xs text-left max-w-md mx-auto space-y-1.5">
              <span className="font-semibold text-slate-300 block">Proposed Schedule:</span>
              {agreement.installments.map((inst: any) => (
                <div key={inst.id} className="flex justify-between text-slate-400">
                  <span>Instalment #{inst.installmentNumber} ({inst.dueDate})</span>
                  <span className="font-mono font-bold text-slate-200">${inst.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STATE C: NO ACTIVE AGREEMENT YET → INTERACTIVE AI NEGOTIATOR */}
        {(!agreement || agreement.status === 'REJECTED') && invoice.status !== 'PAID' && (
          <div className="glass-card rounded-2xl border border-slate-800/80 p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-800/60 pb-4">
              <div className="w-9 h-9 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-base">SmartSettle AI Payment Negotiator</h3>
                <p className="text-xs text-slate-400">Configure a realistic payment schedule that fits your cash flow.</p>
              </div>
            </div>

            {/* Inputs: Installments Count & Extension Days */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-dark-950/60 p-4 rounded-xl border border-slate-800/80 space-y-2">
                <label className="font-semibold text-slate-300 block">Number of Instalments</label>
                <div className="flex items-center gap-2">
                  {[2, 3, 4].map((count) => (
                    <button
                      key={count}
                      onClick={() => setInstallmentsCount(count)}
                      className={`flex-1 py-2 rounded-xl font-semibold border transition-all ${
                        installmentsCount === count
                          ? 'bg-brand-600 text-white border-brand-500 shadow-md shadow-brand-500/20'
                          : 'bg-dark-900 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                      }`}
                    >
                      {count} Parts
                    </button>
                  ))}
                </div>
                <span className="text-[11px] text-slate-400 block">Split total of <strong className="font-mono text-slate-200">${invoice.total.toLocaleString()}</strong> into equal milestone payments.</span>
              </div>

              <div className="bg-dark-950/60 p-4 rounded-xl border border-slate-800/80 space-y-2">
                <label className="font-semibold text-slate-300 block">Target Extension Horizon</label>
                <div className="flex items-center gap-2">
                  {[15, 30, 45, 60].map((days) => (
                    <button
                      key={days}
                      onClick={() => setExtensionDays(days)}
                      className={`flex-1 py-2 rounded-xl font-semibold border transition-all ${
                        extensionDays === days
                          ? 'bg-brand-600 text-white border-brand-500 shadow-md shadow-brand-500/20'
                          : 'bg-dark-900 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                      }`}
                    >
                      {days}d
                    </button>
                  ))}
                </div>
                <span className="text-[11px] text-slate-400 block">Maximum time needed to complete final installment.</span>
              </div>
            </div>

            {/* Hardship Note */}
            <div className="text-xs space-y-1.5">
              <label className="font-semibold text-slate-300 block">Note for Business Owner (Reason for Relief)</label>
              <textarea
                rows={3}
                value={hardshipNote}
                onChange={(e) => setHardshipNote(e.target.value)}
                placeholder="Explain reason for payment delay..."
                className="w-full bg-dark-950 border border-slate-800 focus:border-brand-500 rounded-xl p-3 outline-none text-slate-200 text-xs transition-colors"
              />
            </div>

            {/* Calculate Button */}
            <button
              onClick={handleGeneratePlan}
              disabled={generating}
              className="w-full bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white py-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 shadow-md shadow-brand-500/20 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>{generating ? 'AI Analyzing Terms...' : 'Calculate AI Payment Proposal'}</span>
            </button>

            {/* Generated Proposal Display */}
            {proposedPlan && (
              <div className="bg-dark-950 border border-brand-500/30 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h4 className="font-semibold text-white text-xs uppercase tracking-wider">AI Recommended Plan</h4>
                    <span className="text-xs text-slate-400">Suitability Score: <strong className="font-mono text-brand-300">{proposedPlan.suitabilityScore}/100</strong></span>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20">
                    {proposedPlan.riskAssessment}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed italic bg-dark-900 p-3 rounded-xl border border-slate-800">
                  "{proposedPlan.aiExplanation}"
                </p>

                {/* Proposed Schedule List */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-slate-300 block">Proposed Milestone Schedule:</span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                    {proposedPlan.installments.map((inst: any) => (
                      <div key={inst.installmentNumber} className="bg-dark-900 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
                        <span className="text-[10px] font-semibold text-brand-400 block">Instalment #{inst.installmentNumber}</span>
                        <div className="text-base font-bold font-mono text-white">${inst.amount.toFixed(2)}</div>
                        <span className="text-[11px] text-slate-400 block font-mono">Due: {inst.dueDate}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Submit Proposal CTA */}
                <div className="pt-2">
                  <button
                    onClick={handleSubmitProposal}
                    disabled={submitting}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white py-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{submitting ? 'Submitting Proposal...' : 'Submit Proposed Plan for Business Approval'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
