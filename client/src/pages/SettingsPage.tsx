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
        <h2 className="text-xl font-bold text-white tracking-tight">System & Account Settings</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure PayPal Developer Sandbox credentials, AI engine parameters, and business identity.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: PayPal Developer Sandbox Configuration */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800/80 shadow-xs space-y-4">
          <div className="flex justify-between items-start border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-500/10 text-brand-400 border border-brand-500/20 flex items-center justify-center font-bold">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">PayPal Developer Sandbox Connection</h3>
                <p className="text-[11px] text-slate-400">Live OAuth 2.0 verification for Orders & Invoicing API v2</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {paypalStatus?.isConfigured ? (
                <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Configured</span>
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                  <Info className="w-3.5 h-3.5" />
                  <span>Sandbox Mode (Demo Credentials)</span>
                </span>
              )}
            </div>
          </div>

          {/* Sandbox Credentials Guide */}
          <div className="p-3.5 bg-blue-950/30 border border-blue-500/30 rounded-xl text-xs text-blue-200 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-blue-100">How to get your PayPal Sandbox Credentials:</p>
              <p className="text-blue-300 text-[11px] leading-relaxed">
                Log into the <a href="https://developer.paypal.com/dashboard/applications/sandbox" target="_blank" rel="noreferrer" className="underline font-bold text-brand-400 hover:text-brand-300">PayPal Developer Dashboard</a>, create or select a Sandbox App, and copy the <strong>Client ID</strong> and <strong>Secret</strong> below.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Sandbox Client ID {paypalStatus?.maskedClientId && <span className="text-slate-500 font-normal">({paypalStatus.maskedClientId})</span>}
              </label>
              <input
                type="text"
                placeholder="Enter PayPal Sandbox Client ID..."
                value={paypalClientId}
                onChange={(e) => setPaypalClientId(e.target.value)}
                className="w-full px-3 py-2 bg-dark-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 placeholder-slate-600 focus:border-brand-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Sandbox Secret Key {paypalStatus?.hasClientSecret && <span className="text-emerald-400 font-normal">(Stored securely)</span>}
              </label>
              <input
                type="password"
                placeholder="Enter PayPal Sandbox Client Secret..."
                value={paypalClientSecret}
                onChange={(e) => setPaypalClientSecret(e.target.value)}
                className="w-full px-3 py-2 bg-dark-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 placeholder-slate-600 focus:border-brand-500 outline-none"
              />
            </div>
          </div>

          {/* Test Connection Button */}
          <div className="pt-2 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleTestPayPal}
                disabled={testingPayPal}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-dark-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
              >
                {testingPayPal ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-400" />
                    <span>Testing live connection...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 text-brand-400" />
                    <span>Test Sandbox Connection</span>
                  </>
                )}
              </button>

              {testResult && (
                <span className={`text-xs font-medium flex items-center gap-1.5 ${
                  testResult.connected ? 'text-emerald-400' : 'text-amber-400'
                }`}>
                  {testResult.connected ? <CheckCircle2 className="w-4 h-4" /> : <Info className="w-4 h-4" />}
                  <span>{testResult.message}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: AI Provider Engine */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-bold">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">AI Intelligence Architecture</h3>
              <p className="text-[11px] text-slate-400">Autonomous function dispatcher & reasoning engine</p>
            </div>
          </div>

          <div className="p-3 bg-dark-950/80 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
            <div>
              <span className="font-semibold text-slate-200 block">Active Engine:</span>
              <span className="text-slate-400 text-[11px]">{aiStatus?.activeEngine || 'PayPilot Smart Financial NLP'}</span>
            </div>
            <span className="font-mono text-[10px] bg-dark-900 border border-slate-800 px-2 py-0.5 rounded font-bold text-brand-400">
              10 Controlled Tools Loaded
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Provider Preference</label>
            <select
              value={aiProvider}
              onChange={(e) => setAiProvider(e.target.value)}
              className="w-full bg-dark-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-200 outline-none focus:border-brand-500"
            >
              <option value="auto">Auto-detect (Gemini / OpenAI / Smart Fallback Engine)</option>
              <option value="gemini">Google Gemini 1.5 Flash</option>
              <option value="openai">OpenAI GPT-4o</option>
            </select>
          </div>
        </div>

        {/* Section 3: Business Identity */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
            <div className="w-8 h-8 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center font-bold">
              <Building className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Business Profile & Invoicing Entity</h3>
              <p className="text-[11px] text-slate-400">Displayed on invoices and customer checkout links</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Company / Business Name</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full px-3 py-2 bg-dark-950 border border-slate-800 rounded-xl text-slate-200 outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Billing Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-dark-950 border border-slate-800 rounded-xl text-slate-200 outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Tax ID / VAT</label>
              <input
                type="text"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                className="w-full px-3 py-2 bg-dark-950 border border-slate-800 rounded-xl text-slate-200 outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Operating Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 bg-dark-950 border border-slate-800 rounded-xl font-medium text-slate-200 outline-none focus:border-brand-500"
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
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>Settings Saved!</span>
            </span>
          )}
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-1.5 px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/20 transition-all active:scale-95 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
