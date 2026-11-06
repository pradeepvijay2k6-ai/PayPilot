import React from 'react';
import { 
  LayoutDashboard, 
  Bot, 
  Users, 
  FileText, 
  Receipt, 
  BarChart3, 
  Sparkles, 
  Settings,
  ShieldCheck,
  CreditCard,
  LogOut,
  Brain,
  Zap
} from 'lucide-react';
import { User } from '../../types';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  user: User | null;
  onLogout: () => void;
  paypalConnected?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  user,
  onLogout,
  paypalConnected = true
}) => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'multi-agent', label: 'Multi-Agent Intelligence', icon: Brain, badge: 'NEW' },
    { id: 'automation', label: 'AI Automation Center', icon: Zap, badge: 'AUTO' },
    { id: 'ai-agent', label: 'AI Financial Agent', icon: Bot, badge: 'AI' },
    { id: 'invoices', label: 'Invoices', icon: FileText },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'transactions', label: 'Transactions', icon: Receipt },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'ai-insights', label: 'AI Insights', icon: Sparkles },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-navy-900 border-r border-slate-800 text-slate-300 flex flex-col justify-between shrink-0 select-none">
      <div>
        {/* Brand / Logo */}
        <div className="px-6 py-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-paypal-lightBlue flex items-center justify-center text-white shadow-md shadow-brand-500/20 font-extrabold text-xl">
              P
            </div>
            <div>
              <span className="font-bold text-white text-lg tracking-tight">PayPilot</span>
              <span className="text-[10px] block text-brand-500 font-mono font-medium -mt-1 tracking-wider uppercase">
                AI • PayPal
              </span>
            </div>
          </div>
          <span className="text-[10px] font-semibold bg-brand-500/20 text-brand-400 px-2 py-0.5 rounded-full border border-brand-500/30">
            DEMO
          </span>
        </div>

        {/* PayPal Sandbox Environment Status */}
        <div className="mx-4 my-3 px-3 py-2 bg-slate-800/50 rounded-lg border border-slate-700/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-medium text-slate-300">PayPal Sandbox</span>
          </div>
          <CreditCard className="w-3.5 h-3.5 text-paypal-lightBlue" />
        </div>

        {/* Navigation items */}
        <nav className="px-3 py-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/30 font-semibold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    isActive ? 'bg-white/20 text-white' : 'bg-brand-500/20 text-brand-400'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User profile / Logout */}
      <div className="p-4 border-t border-slate-800/80">
        <div className="flex items-center justify-between bg-slate-800/40 p-2.5 rounded-xl border border-slate-700/40">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-white text-xs shrink-0">
              {user?.name ? user.name[0] : 'A'}
            </div>
            <div className="truncate text-left">
              <p className="text-xs font-semibold text-white truncate">{user?.name || 'Alex Morgan'}</p>
              <p className="text-[11px] text-slate-400 truncate">{user?.businessProfile?.businessName || 'Nexus Cloud Solutions'}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            title="Sign out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
