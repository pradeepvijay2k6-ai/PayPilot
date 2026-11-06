import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Bot, 
  Brain, 
  Zap, 
  Handshake, 
  Users, 
  FileText, 
  Receipt, 
  BarChart3, 
  Settings, 
  Plus, 
  Send, 
  QrCode, 
  Sun, 
  Moon, 
  RefreshCw,
  ArrowRight,
  Sparkles,
  Command as CommandIcon,
  X
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
  onOpenCreateInvoice: () => void;
  onOpenPaymentRequest: () => void;
  onOpenQrPay: () => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onOpenCreateInvoice,
  onOpenPaymentRequest,
  onOpenQrPay
}) => {
  const [query, setQuery] = useState('');
  const { resolvedTheme, toggleTheme } = useTheme();

  // Listen for keyboard shortcut Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const actions = [
    {
      id: 'qr-pay',
      title: 'Instant QR Payment Generator',
      subtitle: 'Create contactless PayPal QR code or countertop stand',
      icon: QrCode,
      category: 'Actions',
      badge: 'QR',
      run: () => {
        onClose();
        onOpenQrPay();
      }
    },
    {
      id: 'new-invoice',
      title: 'Create New Invoice',
      subtitle: 'Draft customer invoice with PayPal auto-sync',
      icon: Plus,
      category: 'Actions',
      badge: 'Action',
      run: () => {
        onClose();
        onOpenCreateInvoice();
      }
    },
    {
      id: 'req-payment',
      title: 'Request Payment',
      subtitle: 'Dispatch a branded PayPal checkout link to client',
      icon: Send,
      category: 'Actions',
      badge: 'Action',
      run: () => {
        onClose();
        onOpenPaymentRequest();
      }
    },
    {
      id: 'toggle-theme',
      title: `Switch to ${resolvedTheme === 'dark' ? 'Light Mode' : 'Dark Mode'}`,
      subtitle: 'Toggle interface theme contrast',
      icon: resolvedTheme === 'dark' ? Sun : Moon,
      category: 'Preferences',
      badge: 'Theme',
      run: () => {
        toggleTheme();
        onClose();
      }
    },
    {
      id: 'nav-overview',
      title: 'Overview Dashboard',
      subtitle: 'Cash-flow metrics, PayPal balances, debtor overview',
      icon: FileText,
      category: 'Navigation',
      run: () => {
        onNavigate('overview');
        onClose();
      }
    },
    {
      id: 'nav-ai-agent',
      title: 'AI Command Center',
      subtitle: 'Natural language operations and PayPal dispatch',
      icon: Bot,
      category: 'Navigation',
      badge: 'HERO',
      run: () => {
        onNavigate('ai-agent');
        onClose();
      }
    },
    {
      id: 'nav-multi-agent',
      title: 'Multi-Agent Intelligence',
      subtitle: 'Finance, Collections, and Risk agents orchestrated in parallel',
      icon: Brain,
      category: 'Navigation',
      badge: 'AI',
      run: () => {
        onNavigate('multi-agent');
        onClose();
      }
    },
    {
      id: 'nav-automation',
      title: 'AI Automation Center',
      subtitle: 'Human-in-the-loop workflows & autonomous event engine',
      icon: Zap,
      category: 'Navigation',
      badge: 'AUTO',
      run: () => {
        onNavigate('automation');
        onClose();
      }
    },
    {
      id: 'nav-smartsettle',
      title: 'SmartSettle Negotiator',
      subtitle: 'Installment scheduling & PayPal milestone checkout',
      icon: Handshake,
      category: 'Navigation',
      badge: 'SMART',
      run: () => {
        onNavigate('smartsettle');
        onClose();
      }
    },
    {
      id: 'nav-invoices',
      title: 'Invoices Portfolio',
      subtitle: 'Browse, manage, filter and dispatch invoices',
      icon: FileText,
      category: 'Navigation',
      run: () => {
        onNavigate('invoices');
        onClose();
      }
    },
    {
      id: 'nav-customers',
      title: 'Customers Directory',
      subtitle: 'Manage client accounts and overdue balances',
      icon: Users,
      category: 'Navigation',
      run: () => {
        onNavigate('customers');
        onClose();
      }
    },
    {
      id: 'nav-transactions',
      title: 'PayPal Transactions Ledger',
      subtitle: 'Settled captures, order IDs, and risk verifications',
      icon: Receipt,
      category: 'Navigation',
      run: () => {
        onNavigate('transactions');
        onClose();
      }
    },
    {
      id: 'nav-analytics',
      title: 'Revenue & Debt Analytics',
      subtitle: 'Cash-flow forecasts, delay days, and charts',
      icon: BarChart3,
      category: 'Navigation',
      run: () => {
        onNavigate('analytics');
        onClose();
      }
    },
    {
      id: 'nav-settings',
      title: 'System Settings',
      subtitle: 'PayPal credentials, theme preferences, and business info',
      icon: Settings,
      category: 'Navigation',
      run: () => {
        onNavigate('settings');
        onClose();
      }
    }
  ];

  const filteredActions = actions.filter(a => 
    a.title.toLowerCase().includes(query.toLowerCase()) || 
    a.subtitle.toLowerCase().includes(query.toLowerCase()) ||
    a.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/75 backdrop-blur-xs">
      <div className="bg-dark-900 border border-slate-800 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[75vh]">
        {/* Search Input Bar */}
        <div className="p-3.5 border-b border-slate-800/80 bg-dark-950 flex items-center gap-3">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search (e.g. 'QR', 'invoice', 'theme', 'settle')..."
            className="bg-transparent border-none text-xs text-white placeholder-slate-500 focus:outline-hidden w-full font-medium"
          />
          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-dark-850 text-slate-400 border border-slate-700/60">
            ESC
          </span>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="p-2 overflow-y-auto space-y-1 divide-y divide-slate-800/40">
          {filteredActions.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No matching commands found.
            </div>
          ) : (
            filteredActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={action.run}
                  className="w-full text-left p-2.5 rounded-xl flex items-center justify-between hover:bg-slate-800/40 group transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-dark-950 border border-slate-800 flex items-center justify-center text-slate-300 group-hover:text-brand-400 group-hover:border-brand-500/30 transition-colors shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-white group-hover:text-brand-300 transition-colors">
                          {action.title}
                        </span>
                        {action.badge && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-brand-500/10 text-brand-400 border border-brand-500/20">
                            {action.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">{action.subtitle}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-300 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div className="px-4 py-2 bg-dark-950/80 border-t border-slate-800/80 text-[10px] text-slate-500 flex items-center justify-between">
          <div className="flex items-center gap-2 font-mono">
            <span>Navigation: Click or Enter</span>
            <span>•</span>
            <span>Close: ESC</span>
          </div>
          <span className="font-semibold text-brand-400 font-sans">PayPilot Quick OS</span>
        </div>
      </div>
    </div>
  );
};
