import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  QrCode, 
  Download, 
  Copy, 
  Check, 
  Printer, 
  ExternalLink, 
  CreditCard, 
  Sparkles, 
  Calculator, 
  ArrowRight,
  ShieldCheck,
  Building,
  Smartphone
} from 'lucide-react';
import QRCode from 'qrcode';
import { Invoice } from '../../types';
import { apiClient } from '../../api/client';

interface PaymentQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialInvoice?: Invoice | null;
  initialAmount?: number;
  initialDescription?: string;
}

export const PaymentQrModal: React.FC<PaymentQrModalProps> = ({
  isOpen,
  onClose,
  initialInvoice = null,
  initialAmount,
  initialDescription
}) => {
  const [mode, setMode] = useState<'invoice' | 'quick' | 'fee-calc'>(initialInvoice ? 'invoice' : 'quick');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(initialInvoice);
  const [quickAmount, setQuickAmount] = useState<number>(initialAmount || 50);
  const [quickDescription, setQuickDescription] = useState<string>(initialDescription || 'Payment via PayPilot');
  const [customerName, setCustomerName] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Fee calculation state
  const [feeRate, setFeeRate] = useState<number>(2.99); // standard PayPal commercial rate %
  const [fixedFee, setFixedFee] = useState<number>(0.49); // standard fixed fee $

  useEffect(() => {
    if (initialInvoice) {
      setSelectedInvoice(initialInvoice);
      setMode('invoice');
    }
  }, [initialInvoice]);

  useEffect(() => {
    if (isOpen && mode === 'invoice' && invoices.length === 0) {
      apiClient.get('/invoices')
        .then(res => {
          setInvoices(res.data);
          if (!selectedInvoice && res.data.length > 0) {
            setSelectedInvoice(res.data[0]);
          }
        })
        .catch(err => console.error('Error fetching invoices for QR:', err));
    }
  }, [isOpen, mode]);

  // Compute the target payment URL
  const getPaymentUrl = (): string => {
    const origin = window.location.origin;
    if (mode === 'invoice' && selectedInvoice) {
      return `${origin}/pay/invoice/${selectedInvoice.id}`;
    }
    // For quick payment, encode amount and desc
    const params = new URLSearchParams();
    params.set('amount', quickAmount.toString());
    if (quickDescription) params.set('desc', quickDescription);
    if (customerName) params.set('customer', customerName);
    return `${origin}/pay/instant?${params.toString()}`;
  };

  const currentUrl = getPaymentUrl();

  // Generate QR code whenever URL changes
  useEffect(() => {
    if (!isOpen) return;

    QRCode.toDataURL(currentUrl, {
      width: 320,
      margin: 2,
      color: {
        dark: '#002C6C', // PayPal Deep Navy for branding
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'H'
    })
      .then(url => {
        setQrDataUrl(url);
      })
      .catch(err => console.error('QR code generation failed:', err));
  }, [isOpen, currentUrl, mode, selectedInvoice, quickAmount, quickDescription]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    const identifier = mode === 'invoice' && selectedInvoice ? selectedInvoice.invoiceNumber : `QuickPay-$${quickAmount}`;
    a.download = `PayPilot-QR-${identifier}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handlePrint = () => {
    window.print();
  };

  const activeAmount = mode === 'invoice' && selectedInvoice ? selectedInvoice.total : quickAmount;
  const calculatedFee = (activeAmount * (feeRate / 100)) + fixedFee;
  const netReceivable = Math.max(0, activeAmount - calculatedFee);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-dark-900 border border-slate-800 rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800/80 bg-dark-950 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base tracking-tight flex items-center gap-2">
                <span>Instant QR Payment</span>
                <span className="text-[10px] bg-brand-500/20 text-brand-300 border border-brand-500/30 font-mono px-2 py-0.5 rounded-full">
                  PayPal Ready
                </span>
              </h3>
              <p className="text-xs text-slate-400">Scan to checkout with PayPal, Cards, or Venmo</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex border-b border-slate-800/80 bg-dark-950/60 px-6 pt-3 gap-2">
          <button
            onClick={() => setMode('invoice')}
            className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              mode === 'invoice'
                ? 'border-brand-500 text-brand-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Invoice QR</span>
          </button>

          <button
            onClick={() => setMode('quick')}
            className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              mode === 'quick'
                ? 'border-brand-500 text-brand-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Countertop / Quick Pay</span>
          </button>

          <button
            onClick={() => setMode('fee-calc')}
            className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              mode === 'fee-calc'
                ? 'border-brand-500 text-brand-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Fee Estimator</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {mode === 'invoice' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Select Target Invoice
                </label>
                <select
                  value={selectedInvoice?.id || ''}
                  onChange={(e) => {
                    const inv = invoices.find(i => i.id === e.target.value);
                    if (inv) setSelectedInvoice(inv);
                  }}
                  className="w-full bg-dark-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-hidden focus:border-brand-500"
                >
                  {invoices.map(inv => (
                    <option key={inv.id} value={inv.id}>
                      {inv.invoiceNumber} – {inv.customer?.name} (${inv.total.toFixed(2)} USD) [{inv.status}]
                    </option>
                  ))}
                </select>
              </div>

              {selectedInvoice && (
                <div className="bg-dark-950/70 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Customer</span>
                    <p className="font-semibold text-white">{selectedInvoice.customer?.name}</p>
                    <p className="text-[11px] text-slate-400 font-mono">{selectedInvoice.customer?.email}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Amount Due</span>
                    <p className="font-bold text-brand-400 font-mono text-base">${selectedInvoice.total.toFixed(2)} USD</p>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold">
                      {selectedInvoice.status}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {mode === 'quick' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Quick Amount (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold">$</span>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={quickAmount}
                    onChange={(e) => setQuickAmount(parseFloat(e.target.value) || 0)}
                    className="w-full pl-8 pr-4 py-2 bg-dark-950 border border-slate-800 rounded-xl text-xs font-mono font-bold text-white focus:outline-hidden focus:border-brand-500"
                  />
                </div>
                {/* Fast Preset Chips */}
                <div className="flex gap-2 mt-2">
                  {[10, 25, 50, 100, 250, 500].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setQuickAmount(val)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold transition-all ${
                        quickAmount === val
                          ? 'bg-brand-600 text-white shadow-sm'
                          : 'bg-dark-950 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      ${val}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Payment Description / Purpose
                </label>
                <input
                  type="text"
                  value={quickDescription}
                  onChange={(e) => setQuickDescription(e.target.value)}
                  placeholder="e.g. Consulting, Freelance Retainer, Store Purchase"
                  className="w-full px-3 py-2 bg-dark-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-brand-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Customer / Debtor Reference (Optional)
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. John Doe / Client LLC"
                  className="w-full px-3 py-2 bg-dark-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-brand-500"
                />
              </div>
            </div>
          )}

          {mode === 'fee-calc' && (
            <div className="space-y-4">
              <div className="p-4 bg-dark-950 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Gross Charge Amount:</span>
                  <span className="font-bold text-white font-mono text-sm">${activeAmount.toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">PayPal Processing Fee ({feeRate}% + ${fixedFee.toFixed(2)}):</span>
                  <span className="font-semibold text-rose-400 font-mono">-${calculatedFee.toFixed(2)} USD</span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-sm">
                  <span className="font-bold text-slate-200">Estimated Net Payout:</span>
                  <span className="font-extrabold text-emerald-400 font-mono text-base">${netReceivable.toFixed(2)} USD</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Rate %</label>
                  <input
                    type="number"
                    step="0.01"
                    value={feeRate}
                    onChange={(e) => setFeeRate(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 bg-dark-950 border border-slate-800 rounded-xl text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Fixed Fee ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={fixedFee}
                    onChange={(e) => setFixedFee(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 bg-dark-950 border border-slate-800 rounded-xl text-slate-200 font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* QR Code Presentation Box */}
          <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-xl border border-slate-200">
            <div className="p-3 bg-white rounded-xl shadow-xs border border-slate-100 flex items-center justify-center">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Payment QR Code"
                  className="w-56 h-56 object-contain"
                />
              ) : (
                <div className="w-56 h-56 flex items-center justify-center text-slate-400 text-xs">
                  Generating QR...
                </div>
              )}
            </div>

            {/* Badges */}
            <div className="mt-3 text-center space-y-1">
              <div className="flex items-center justify-center gap-1.5 text-slate-800 font-extrabold text-sm tracking-tight">
                <span>Pay</span>
                <span className="font-mono text-brand-600 font-black">${activeAmount.toFixed(2)} USD</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 inline" />
                <span>Encrypted & Verified with PayPal Sandbox</span>
              </p>
            </div>
          </div>

          {/* Link Copy Box */}
          <div className="flex items-center gap-2 p-2 bg-dark-950 rounded-xl border border-slate-800">
            <input
              type="text"
              readOnly
              value={currentUrl}
              className="bg-transparent text-slate-400 font-mono text-[11px] flex-1 px-2 focus:outline-hidden truncate"
            />
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shrink-0 transition-all active:scale-95"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800/80 bg-dark-950 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 bg-dark-850 hover:bg-dark-800 border border-slate-800 rounded-xl text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-all"
            >
              <Download className="w-3.5 h-3.5 text-brand-400" />
              <span>Download PNG</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-dark-850 hover:bg-dark-800 border border-slate-800 rounded-xl text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-all"
            >
              <Printer className="w-3.5 h-3.5 text-slate-400" />
              <span>Print Stand</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={currentUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-brand-500/20 transition-all"
            >
              <span>Open Checkout</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
