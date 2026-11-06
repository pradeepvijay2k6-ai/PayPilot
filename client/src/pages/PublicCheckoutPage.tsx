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
  FileText
} from 'lucide-react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { apiClient } from '../api/client';

export const PublicCheckoutPage: React.FC = () => {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [completedTx, setCompletedTx] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

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
        <div className="bg-white p-8 rounded-2xl max-w-md w-full text-center space-y-3 shadow-md">
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
            className="inline-block w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs shadow-sm"
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
        <div className="bg-navy-900 p-6 text-white flex justify-between items-center">
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

          {/* PayPal Smart Buttons / Sandbox Checkout */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
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

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Protected by PayPal Developer Sandbox encryption</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
