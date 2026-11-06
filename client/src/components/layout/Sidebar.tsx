import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Bot, 
  Users, 
  FileText, 
  Receipt, 
  BarChart3, 
  Settings, 
  CreditCard, 
  LogOut, 
  Brain, 
  Zap, 
  Handshake,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Command,
  QrCode
} from 'lucide-react';
import { User } from '../../types';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  user: User | null;
  onLogout: () => void;
  onOpenQrPay?: () => void;
  paypalConnected?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  user,
  onLogout,
  onOpenQrPay,
  paypalConnected = true
}) => {
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'ai-agent', label: 'AI Command Center', icon: Bot, badge: 'HERO', isHero: true },
    { id: 'multi-agent', label: 'Multi-Agent Intelligence', icon: Brain, badge: 'AI' },
    { id: 'automation', label: 'AI Automation Center', icon: Zap, badge: 'AUTO' },
    { id: 'smartsettle', label: 'SmartSettle', icon: Handshake, badge: 'SMART' },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'invoices', label: 'Invoices', icon: FileText },
    { id: 'transactions', label: 'Transactions', icon: Receipt },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside 
      className={`${
        collapsed ? 'w-20' : 'w-64'
      } bg-dark-900 border-r border-slate-800/80 text-slate-300 flex flex-col justify-between shrink-0 select-none transition-all duration-300 relative z-30`}
    >
      <div>
        {/* Brand / Logo */}
        <div className="h-16 px-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-accent-purple flex items-center justify-center text-white keep-white shadow-lg shadow-brand-500/25 shrink-0 relative">
              <span className="font-extrabold text-lg tracking-tighter text-white keep-white">P</span>
              <div className="absolute inset-0 rounded-xl border border-white/20"></div>
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-white text-base tracking-tight font-sans">PayPilot</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-brand-500/10 text-brand-400 border border-brand-500/20">
                    AI
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono tracking-wider">FINANCIAL OS</span>
              </div>
            )}
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-800/80 transition-colors"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* PayPal Sandbox Environment Status */}
        <div className="px-3 pt-3">
          <div className={`p-2.5 bg-dark-850/80 rounded-xl border border-slate-800/80 flex items-center ${collapsed ? 'justify-center' : 'justify-between'} shadow-inner`}>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              {!collapsed && (
                <div className="flex flex-col">
                  <span className="text-[11px] font-semibold text-slate-200">PayPal Sandbox</span>
                  <span className="text-[9px] text-slate-500 font-mono">Live API Connected</span>
                </div>
              )}
            </div>
            {!collapsed && <CreditCard className="w-3.5 h-3.5 text-paypal-lightBlue shrink-0" />}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="px-2 py-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                title={collapsed ? item.label : undefined}
                className={`w-full flex items-center ${collapsed ? 'justify-center px-0 py-2.5' : 'justify-between px-3 py-2.5'} rounded-xl text-xs font-semibold transition-all group relative ${
                  isActive
                    ? item.isHero
                      ? 'bg-gradient-to-r from-brand-600/90 via-indigo-600/90 to-accent-purple/90 text-white shadow-lg shadow-brand-500/20 border border-white/10'
                      : 'bg-dark-800 text-white border border-slate-700/60 shadow-sm'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-dark-850'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`transition-colors ${isActive ? (item.isHero ? 'text-white' : 'text-brand-400') : 'text-slate-400 group-hover:text-slate-200'}`}>
                    <Icon className="w-4 h-4 shrink-0" />
                  </div>
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </div>

                {!collapsed && item.badge && (
                  <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded tracking-wider uppercase ${
                    isActive
                      ? 'bg-white/20 text-white keep-white'
                      : item.badge === 'HERO'
                      ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
                      : 'bg-slate-800 text-slate-400 border border-slate-700/60'
                  }`}>
                    {item.badge}
                  </span>
                )}

                {/* Subtle active vertical indicator */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-brand-400 rounded-r-full"></span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User profile / Logout */}
      <div className="p-3 border-t border-slate-800/80 bg-dark-950/40">
        <div className={`flex items-center ${collapsed ? 'justify-center p-1' : 'justify-between p-2'} rounded-xl bg-dark-850/60 border border-slate-800/60`}>
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center font-bold text-white keep-white text-xs shrink-0 border border-slate-600/40">
              {user?.name ? user.name[0] : 'A'}
            </div>
            {!collapsed && (
              <div className="truncate text-left">
                <p className="text-xs font-bold text-slate-200 truncate">{user?.name || 'Alex Morgan'}</p>
                <p className="text-[10px] text-slate-400 truncate">{user?.businessProfile?.businessName || 'Nexus Cloud Solutions'}</p>
              </div>
            )}
          </div>
          {!collapsed && (
            <button
              onClick={onLogout}
              title="Sign out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
