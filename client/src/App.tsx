import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { FloatingAiWidget } from './components/layout/FloatingAiWidget';
import { Overview } from './pages/Overview';
import { MultiAgentPage } from './pages/MultiAgentPage';
import { AutomationCenterPage } from './pages/AutomationCenterPage';
import { AiAgentPage } from './pages/AiAgentPage';
import { InvoicesPage } from './pages/InvoicesPage';
import { CustomersPage } from './pages/CustomersPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AiInsightsPage } from './pages/AiInsightsPage';
import { SettingsPage } from './pages/SettingsPage';
import { LoginPage } from './pages/LoginPage';
import { PublicCheckoutPage } from './pages/PublicCheckoutPage';
import { SmartSettlePage } from './pages/SmartSettlePage';
import { CustomerNegotiatePage } from './pages/CustomerNegotiatePage';
import { CreateInvoiceModal } from './components/invoices/CreateInvoiceModal';
import { CreatePaymentRequestModal } from './components/payments/CreatePaymentRequestModal';
import { PaymentQrModal } from './components/common/PaymentQrModal';
import { CommandPaletteModal } from './components/common/CommandPaletteModal';
import { ThemeProvider } from './context/ThemeContext';
import { apiClient } from './api/client';
import { User } from './types';

function AppContent() {
  const [currentTab, setCurrentTab] = useState('overview');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [createInvoiceOpen, setCreateInvoiceOpen] = useState(false);
  const [paymentRequestOpen, setPaymentRequestOpen] = useState(false);
  const [qrPayOpen, setQrPayOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Global keyboard shortcut for Command Palette (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // If customer is viewing a checkout link (/pay/:id), render public checkout page
  if (window.location.pathname.startsWith('/pay/')) {
    return <PublicCheckoutPage />;
  }

  // If customer is viewing a negotiation link (/negotiate/:id or /smartsettle/:id), render customer negotiation portal
  if (window.location.pathname.startsWith('/negotiate/') || window.location.pathname.startsWith('/smartsettle/')) {
    return <CustomerNegotiatePage />;
  }

  // Load user session or auto-authenticate demo user
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('paypilot_token');
        if (token) {
          const res = await apiClient.get('/auth/me');
          setUser(res.data.user);
        } else {
          // Seamless demo login for instant evaluation
          const demoRes = await apiClient.post('/auth/demo-login');
          localStorage.setItem('paypilot_token', demoRes.data.token);
          setUser(demoRes.data.user);
        }
      } catch (err) {
        console.warn('Session check note:', err);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('paypilot_token');
    setUser(null);
  };

  const getPageTitle = () => {
    switch (currentTab) {
      case 'overview':
        return { title: 'Financial Operations Overview', subtitle: 'Live cash-flow, settled PayPal transactions, and debtor metrics' };
      case 'multi-agent':
        return { title: 'Multi-Agent Financial Intelligence', subtitle: 'Finance, Collections, and Risk agents orchestrated in parallel' };
      case 'automation':
        return { title: 'AI Automation Center', subtitle: 'Autonomous event detection, human-in-the-loop approval, and audit trails' };
      case 'smartsettle':
        return { title: 'SmartSettle – AI Payment Negotiator', subtitle: 'Negotiate flexible installment schedules & capture PayPal milestone payments' };
      case 'ai-agent':
        return { title: 'PayPilot AI Financial Agent', subtitle: 'Autonomous natural language operations & PayPal dispatch' };
      case 'invoices':
        return { title: 'Invoice Portfolio Management', subtitle: 'Issue, track, and synchronize invoices with PayPal Sandbox' };
      case 'customers':
        return { title: 'Client & Debtor Directory', subtitle: 'Track customer balances, payment punctuality, and contracts' };
      case 'transactions':
        return { title: 'Settled PayPal Transactions', subtitle: 'Backend verified PayPal Order & Capture ledger' };
      case 'analytics':
        return { title: 'Revenue & Debt Analytics', subtitle: 'Multi-dimensional financial velocity and delay forecasting' };
      case 'ai-insights':
        return { title: 'Autonomous AI Insights', subtitle: 'Actionable financial diagnostic derived from real database facts' };
      case 'settings':
        return { title: 'System & PayPal Settings', subtitle: 'Sandbox credentials, AI engine parameters, and business profile' };
      default:
        return { title: 'PayPilot', subtitle: 'AI Financial Operations' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center text-slate-200 text-xs font-semibold">
        <div className="flex items-center gap-3 px-6 py-4 rounded-2xl glass-card border border-slate-800">
          <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <span>Starting PayPilot financial workspace...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLoginSuccess={(u) => setUser(u)} />;
  }

  const { title, subtitle } = getPageTitle();

  return (
    <div className="flex h-screen bg-dark-950 text-slate-100 overflow-hidden font-['Plus_Jakarta_Sans',sans-serif] transition-colors">
      {/* Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        user={user}
        onLogout={handleLogout}
        onOpenQrPay={() => setQrPayOpen(true)}
        paypalConnected={true}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <Header
          title={title}
          subtitle={subtitle}
          onOpenCreateInvoice={() => setCreateInvoiceOpen(true)}
          onOpenPaymentRequest={() => setPaymentRequestOpen(true)}
          onOpenAiChat={() => setCurrentTab('ai-agent')}
          onOpenQrPay={() => setQrPayOpen(true)}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          onDataRefreshed={() => setRefreshKey(prev => prev + 1)}
        />

        {/* Dynamic Page Content */}
        <main key={refreshKey} className="flex-1 overflow-y-auto">
          {currentTab === 'overview' && (
            <Overview
              onNavigate={(tab) => setCurrentTab(tab)}
              onOpenCreateInvoice={() => setCreateInvoiceOpen(true)}
              onOpenPaymentRequest={() => setPaymentRequestOpen(true)}
            />
          )}
          {currentTab === 'multi-agent' && <MultiAgentPage />}
          {currentTab === 'automation' && <AutomationCenterPage />}
          {currentTab === 'smartsettle' && <SmartSettlePage />}
          {currentTab === 'ai-agent' && (
            <AiAgentPage
              onInvoiceCreated={() => setRefreshKey(prev => prev + 1)}
              onNavigateToInvoice={() => setCurrentTab('invoices')}
            />
          )}
          {currentTab === 'invoices' && (
            <InvoicesPage onOpenCreateInvoice={() => setCreateInvoiceOpen(true)} />
          )}
          {currentTab === 'customers' && <CustomersPage />}
          {currentTab === 'transactions' && <TransactionsPage />}
          {currentTab === 'analytics' && <AnalyticsPage />}
          {currentTab === 'ai-insights' && (
            <AiInsightsPage onNavigateToAgent={() => setCurrentTab('ai-agent')} />
          )}
          {currentTab === 'settings' && <SettingsPage />}
        </main>
      </div>

      {/* Floating AI Agent Assistant available on all pages */}
      <FloatingAiWidget onInvoiceCreated={() => setRefreshKey(prev => prev + 1)} />

      {/* Modals */}
      <CreateInvoiceModal
        isOpen={createInvoiceOpen}
        onClose={() => setCreateInvoiceOpen(false)}
        onInvoiceCreated={() => {
          setRefreshKey(prev => prev + 1);
          setCurrentTab('invoices');
        }}
      />

      <CreatePaymentRequestModal
        isOpen={paymentRequestOpen}
        onClose={() => setPaymentRequestOpen(false)}
        onRequestCreated={() => setRefreshKey(prev => prev + 1)}
      />

      <PaymentQrModal
        isOpen={qrPayOpen}
        onClose={() => setQrPayOpen(false)}
      />

      <CommandPaletteModal
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onNavigate={(tab) => setCurrentTab(tab)}
        onOpenCreateInvoice={() => setCreateInvoiceOpen(true)}
        onOpenPaymentRequest={() => setPaymentRequestOpen(true)}
        onOpenQrPay={() => setQrPayOpen(true)}
      />
    </div>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
