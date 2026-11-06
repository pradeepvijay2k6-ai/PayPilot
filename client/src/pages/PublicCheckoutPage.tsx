import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  ShieldCheck, 
  CheckCircle2, 
  Lock, 
  Building, 
  Calendar, 
  ArrowRight,
  Loader2,
  FileText,
  QrCode,
  Smartphone
} from 'lucide-react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import QRCode from 'qrcode';
import { apiClient } from '../api/client';

export const PublicCheckoutPage: React.FC = () => {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [completedTx, setCompletedTx] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [payMethodTab, setPayMethodTab] = useState<'button' | 'qr'>('button');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  // Parse path: /pay/:id or /pay/invoice/:id
  const path = window.location.pathname;
  let type = 'request';
  let id = '';

  if (path.includes('/pay/invoice/')) {
    type = 'invoice';
    id = path.split('/pay/invoice/')[1];
  } else if (path.includes('/pay/')) {
    type = 'request';
    id = path.split('/pay/')[1];
  }

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get(`/payments/public/${type}/${id}`);
        setData(res.data);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Could not load payment information.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDetails();
    }
  }, [type, id]);

  useEffect(() => {
    if (data) {
      QRCode.toDataURL(window.location.href, {
        width: 220,
        margin: 1,
        color: { dark: '#002C6C', light: '#FFFFFF' }
      })
        .then(url => setQrCodeUrl(url))
        .catch(err => console.error('Failed to generate checkout QR:', err));
    }
  }, [data]);

  const handleCaptureSuccess = async (orderId: string) => {
    try {
      setPaying(true);
      const res = await apiClient.post('/payments/capture-paypal-order', {
        orderId,
        entityType: type,
        entityId: id
      });
      setCompletedTx(res.data.transaction);
    } catch (err: any) {
      alert('Payment capture error: ' + (err.response?.data?.error || err.message));
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Loader2 className="w-4 h-4 animate-spin text-brand-600" />
          <span>Loading secure checkout...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl max-w-md w-full text-center space-y-3 shadow-md border border-slate-200">
          <h3 className="font-bold text-slate-900">Payment Not Found</h3>
          <p className="text-xs text-slate-500">{error || 'This payment link has expired or is invalid.'}</p>
          <a href="/" className="inline-block text-xs font-bold text-brand-600 underline">Return to Dashboard</a>
        </div>
      </div>
    );
  }

  if (completedTx || data.status === 'PAID' || data.status === 'COMPLETED') {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl max-w-md w-full text-center space-y-6 shadow-xl border border-slate-200 animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Payment Completed!</h2>
            <p className="text-xs text-slate-500 mt-1">
              Your payment has been successfully captured and verified via PayPal.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl text-xs space-y-2 border border-slate-100 font-medium">
            <div className="flex justify-between">
              <span className="text-slate-500">Amount Paid:</span>
              <span className="font-bold text-slate-900 text-sm">${data.amount?.toFixed(2)} USD</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Merchant:</span>
              <span className="text-slate-800 font-semibold">{data.business?.name}</span>
            </div>
            {completedTx?.paypalOrderId && (
              <div className="flex justify-between">
                <span className="text-slate-500">PayPal Order ID:</span>
                <span className="font-mono text-slate-800">{completedTx.paypalOrderId}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-500">Status:</span>
              <span className="text-emerald-600 font-bold">VERIFIED SETTLED</span>
            </div>
          </div>

          <a
            href="/"
            className="inline-block w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs shadow-sm transition-all"
          >
            Go to PayPilot Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 py-12 px-4 flex items-center justify-center">
      <div className="max-w-lg w-full bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden space-y-6">
        {/* Top Header */}
        <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-paypal-lightBlue block">Secure Customer Checkout</span>
            <h2 className="text-lg font-bold mt-0.5">{data.business?.name || 'PayPilot Merchant'}</h2>
          </div>
          <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-paypal-gold">
            <Lock className="w-4 h-4" />
          </div>
        </div>

        {/* Bill Summary */}
        <div className="p-6 space-y-4">
          <div className="flex justify-between items-baseline pb-4 border-b border-slate-100">
            <div>
              <p className="text-xs text-slate-500">Total Billed</p>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-0.5">
                ${data.amount?.toFixed(2)} <span className="text-xs font-bold text-slate-400">USD</span>
              </h1>
            </div>
            <span className="text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1 rounded-full">
              Payment Due
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Customer:</span>
              <span className="font-semibold text-slate-900">{data.customer?.name} ({data.customer?.email})</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Description:</span>
              <span className="font-medium text-slate-800">{data.description}</span>
            </div>
          </div>

          {/* Checkout Method Tabs: On Device vs Scan to Pay */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold gap-1 mt-4">
            <button
              type="button"
              onClick={() => setPayMethodTab('button')}
              className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                payMethodTab === 'button'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5 text-paypal-blue" />
              <span>Pay on This Device</span>
            </button>
            <button
              type="button"
              onClick={() => setPayMethodTab('qr')}
              className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                payMethodTab === 'qr'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 text-brand-600" />
              <span>Scan QR on Mobile</span>
            </button>
          </div>

          {/* Pay on Device Tab */}
          {payMethodTab === 'button' && (
            <div className="pt-2 space-y-3">
              <p className="text-center text-xs font-bold text-slate-700">Pay securely with PayPal</p>

              {data.paypalClientId && !data.paypalClientId.includes('your_paypal') ? (
                <PayPalScriptProvider options={{ clientId: data.paypalClientId, currency: 'USD' }}>
                  <PayPalButtons
                    style={{ layout: 'vertical', shape: 'rect', color: 'gold' }}
                    createOrder={async () => {
                      const res = await apiClient.post('/payments/create-paypal-order', {
                        amount: data.amount,
                        description: data.description,
                        entityType: type,
                        entityId: id
                      });
                      return res.data.id;
                    }}
                    onApprove={async (actionsData) => {
                      await handleCaptureSuccess(actionsData.orderID);
                    }}
                  />
                </PayPalScriptProvider>
              ) : (
                // Instant Sandbox Simulator Button when live sandbox keys are not yet pasted
                <button
                  onClick={() => handleCaptureSuccess(`SANDBOX-ORDER-${Date.now()}`)}
                  disabled={paying}
                  className="w-full py-3 bg-paypal-gold hover:bg-yellow-400 text-slate-900 font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-98"
                >
                  {paying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing PayPal Sandbox Capture...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 text-paypal-blue" />
                      <span>Pay ${data.amount?.toFixed(2)} with PayPal Sandbox</span>
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {/* Scan QR Tab */}
          {payMethodTab === 'qr' && (
            <div className="pt-2 flex flex-col items-center justify-center space-y-3 text-center">
              <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm">
                {qrCodeUrl ? (
                  <img src={qrCodeUrl} alt="Scan to pay" className="w-48 h-48 object-contain" />
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center text-xs text-slate-400">
                    Loading QR...
                  </div>
                )}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Scan with your phone's camera</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Complete PayPal payment directly on your mobile device
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-2 border-t border-slate-100">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Protected by PayPal Developer Sandbox encryption</span>
          </div>
        </div>
      </div>
    </div>
  );
};
