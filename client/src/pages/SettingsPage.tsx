import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  CreditCard, 
  Bot, 
  RefreshCw, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  ExternalLink,
  Save,
  Building,
  Key,
  Info,
  Loader2
} from 'lucide-react';
import { apiClient } from '../api/client';

export const SettingsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingPayPal, setTestingPayPal] = useState(false);
  const [testResult, setTestResult] = useState<{ connected: boolean; message: string } | null>(null);

  // Form states
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [taxId, setTaxId] = useState('');
  const [paypalClientId, setPaypalClientId] = useState('');
  const [paypalClientSecret, setPaypalClientSecret] = useState('');
  const [aiProvider, setAiProvider] = useState('auto');
  const [paypalStatus, setPaypalStatus] = useState<any>(null);
  const [aiStatus, setAiStatus] = useState<any>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/settings');
      const b = res.data.business;
      setBusinessName(b.businessName || '');
      setEmail(b.email || '');
      setPhone(b.phone || '');
      setAddress(b.address || '');
      setCurrency(b.currency || 'USD');
      setTaxId(b.taxId || '');
      setAiProvider(b.aiProvider || 'auto');
      setPaypalStatus(res.data.paypal);
      setAiStatus(res.data.ai);
    } catch (err: any) {
      console.error('Error loading settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await apiClient.put('/settings', {
        businessName,
        email,
        phone,
        address,
        currency,
        taxId,
        aiProvider,
        paypalClientId: paypalClientId || undefined,
        paypalClientSecret: paypalClientSecret || undefined
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      fetchSettings();
    } catch (err: any) {
      alert('Error updating settings: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleTestPayPal = async () => {
    try {
      setTestingPayPal(true);
      setTestResult(null);
      const res = await apiClient.post('/settings/test-paypal');
      setTestResult(res.data);
    } catch (err: any) {
      setTestResult({ connected: false, message: err.message });
    } finally {
      setTestingPayPal(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">System & Account Settings</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure PayPal Developer Sandbox credentials, AI engine parameters, and business identity.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: PayPal Developer Sandbox Configuration */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex justify-between items-start border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-paypal-blue/10 text-paypal-blue flex items-center justify-center font-bold">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">PayPal Developer Sandbox Connection</h3>
                <p className="text-[11px] text-slate-500">Live OAuth 2.0 verification for Orders & Invoicing API v2</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {paypalStatus?.isConfigured ? (
                <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Configured</span>
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                  <Info className="w-3.5 h-3.5" />
                  <span>Sandbox Mode (Demo Credentials)</span>
                </span>
              )}
            </div>
          </div>

          {/* Sandbox Credentials Guide */}
          <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl text-xs text-blue-900 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-paypal-lightBlue shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">How to get your PayPal Sandbox Credentials:</p>
              <p className="text-blue-800 text-[11px] leading-relaxed">
                Log into the <a href="https://developer.paypal.com/dashboard/applications/sandbox" target="_blank" rel="noreferrer" className="underline font-bold text-paypal-blue">PayPal Developer Dashboard</a>, create or select a Sandbox App, and copy the <strong>Client ID</strong> and <strong>Secret</strong> below.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Sandbox Client ID {paypalStatus?.maskedClientId && <span className="text-slate-400 font-normal">({paypalStatus.maskedClientId})</span>}
              </label>
              <input
                type="text"
                placeholder="Enter PayPal Sandbox Client ID..."
                value={paypalClientId}
                onChange={(e) => setPaypalClientId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Sandbox Secret Key {paypalStatus?.hasClientSecret && <span className="text-emerald-600 font-normal">(Stored securely)</span>}
              </label>
              <input
                type="password"
                placeholder="Enter PayPal Sandbox Client Secret..."
                value={paypalClientSecret}
                onChange={(e) => setPaypalClientSecret(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
              />
            </div>
          </div>

          {/* Test Connection Button */}
          <div className="pt-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleTestPayPal}
                disabled={testingPayPal}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
              >
                {testingPayPal ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-600" />
                    <span>Testing live connection...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Test Sandbox Connection</span>
                  </>
                )}
              </button>

              {testResult && (
                <span className={`text-xs font-medium flex items-center gap-1 ${
                  testResult.connected ? 'text-emerald-600' : 'text-amber-600'
                }`}>
                  {testResult.connected ? <CheckCircle2 className="w-4 h-4" /> : <Info className="w-4 h-4" />}
                  <span>{testResult.message}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: AI Provider Engine */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">AI Intelligence Architecture</h3>
              <p className="text-[11px] text-slate-500">Autonomous function dispatcher & reasoning engine</p>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center justify-between text-xs">
            <div>
              <span className="font-semibold text-slate-800 block">Active Engine:</span>
              <span className="text-slate-500 text-[11px]">{aiStatus?.activeEngine || 'PayPilot Smart Financial NLP'}</span>
            </div>
            <span className="font-mono text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded font-bold text-brand-600">
              10 Controlled Tools Loaded
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Provider Preference</label>
            <select
              value={aiProvider}
              onChange={(e) => setAiProvider(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-800"
            >
              <option value="auto">Auto-detect (Gemini / OpenAI / Smart Fallback Engine)</option>
              <option value="gemini">Google Gemini 1.5 Flash</option>
              <option value="openai">OpenAI GPT-4o</option>
            </select>
          </div>
        </div>

        {/* Section 3: Business Identity */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
              <Building className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Business Profile & Invoicing Entity</h3>
              <p className="text-[11px] text-slate-500">Displayed on invoices and customer checkout links</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Company / Business Name</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Billing Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tax ID / VAT</label>
              <input
                type="text"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Operating Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium"
              >
                <option value="USD">USD ($) - US Dollar</option>
                <option value="EUR">EUR (€) - Euro</option>
                <option value="GBP">GBP (£) - British Pound</option>
                <option value="CAD">CAD ($) - Canadian Dollar</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {saveSuccess && (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>Settings Saved!</span>
            </span>
          )}
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-1.5 px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-brand-600/30 transition-all active:scale-95 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
