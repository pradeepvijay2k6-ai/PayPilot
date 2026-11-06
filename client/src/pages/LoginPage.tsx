import React, { useState } from 'react';
import { Bot, ArrowRight, Lock, Mail, User as UserIcon, Building, Sparkles, Loader2 } from 'lucide-react';
import { apiClient } from '../api/client';
import { User } from '../types';

interface LoginPageProps {
  onLoginSuccess: (user: User, token: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const endpoint = isRegister ? '/auth/register' : '/auth/login';
      const payload = isRegister ? { email, password, name, businessName } : { email, password };
      const res = await apiClient.post(endpoint, payload);
      const { user, token } = res.data;
      localStorage.setItem('paypilot_token', token);
      onLoginSuccess(user, token);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await apiClient.post('/auth/demo-login');
      const { user, token } = res.data;
      localStorage.setItem('paypilot_token', token);
      onLoginSuccess(user, token);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 selection:bg-brand-500 selection:text-white">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-800 animate-in fade-in duration-200">
        {/* Brand Banner */}
        <div className="bg-gradient-to-r from-navy-900 via-slate-900 to-navy-900 p-8 text-white text-center border-b border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-paypal-lightBlue flex items-center justify-center mx-auto mb-3 shadow-lg shadow-brand-500/30 text-xl font-black">
            P
          </div>
          <h1 className="text-xl font-bold tracking-tight">PayPilot</h1>
          <p className="text-xs text-brand-300 mt-1 font-medium">
            AI-Powered Financial Operations Agent using PayPal
          </p>
        </div>

        {/* 1-Click Demo Login for Judges */}
        <div className="p-6 pb-0">
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-brand-600 to-paypal-blue hover:from-brand-700 hover:to-paypal-blue text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-brand-600/20 transition-all active:scale-98"
          >
            <Sparkles className="w-4 h-4 text-paypal-gold" />
            <span>1-Click Hackathon Demo Login (Alex Morgan)</span>
          </button>
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold text-slate-400">
              <span className="bg-white px-2">Or enter credentials</span>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
              {error}
            </div>
          )}

          {isRegister && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Morgan"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Business Name</label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Nexus Cloud Solutions"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@business.com"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all active:scale-98 flex items-center justify-center gap-1.5"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>{isRegister ? 'Create Account' : 'Sign In'}</span>}
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              className="text-xs text-brand-600 hover:underline font-semibold"
            >
              {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Create One"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
