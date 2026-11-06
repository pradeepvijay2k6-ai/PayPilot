export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  businessProfile?: BusinessProfile;
}

export interface BusinessProfile {
  id?: string;
  businessName: string;
  email: string;
  phone?: string;
  address?: string;
  currency: string;
  taxId?: string;
  aiProvider?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  address?: string;
  notes?: string;
  totalInvoiced?: number;
  totalPaid?: number;
  outstandingBalance?: number;
  overdueCount?: number;
  createdAt: string;
}

export interface InvoiceItem {
  id?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customer: Customer;
  status: 'DRAFT' | 'SENT' | 'UNPAID' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  issueDate: string;
  dueDate: string;
  currency: string;
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
  terms?: string;
  paypalInvoiceId?: string;
  paypalInvoiceUrl?: string;
  items: InvoiceItem[];
  createdAt: string;
}

export interface Transaction {
  id: string;
  paypalOrderId?: string;
  paypalCaptureId?: string;
  amount: number;
  currency: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED' | 'REFUNDED';
  paymentMethod: string;
  payerEmail?: string;
  payerName?: string;
  transactionDate: string;
  customer?: Customer;
  invoice?: Invoice;
  rawResponseJson?: string;
}

export interface PaymentRequest {
  id: string;
  customerId: string;
  customer: Customer;
  invoiceId?: string;
  amount: number;
  currency: string;
  description: string;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';
  paypalOrderId?: string;
  paypalCheckoutUrl?: string;
  createdAt: string;
}

export interface FinancialOverview {
  totalRevenue: number;
  totalPaymentsReceived: number;
  pendingPaymentsCount: number;
  pendingAmount: number;
  overdueInvoicesCount: number;
  overdueAmount: number;
  totalCustomers: number;
  monthlyGrowthRate: number;
  revenueLast30Days: number;
}

export interface RevenueAnalytics {
  dailyRevenue: Array<{ date: string; revenue: number }>;
  monthlyRevenue: Array<{ month: string; revenue: number }>;
  statusCounts: {
    PAID: number;
    OVERDUE: number;
    SENT: number;
    UNPAID: number;
    DRAFT: number;
  };
}

export interface CustomerRiskItem {
  customerId: string;
  name: string;
  email: string;
  company: string;
  overdueCount: number;
  totalOverdueAmount: number;
  totalPaidAmount: number;
  avgDelayDays: number;
  reliabilityScore: number;
  overdueInvoices: Array<{
    id: string;
    invoiceNumber: string;
    amount: number;
    dueDate: string;
  }>;
}

export interface AiInsight {
  id: string;
  type: 'POSITIVE' | 'WARNING' | 'CRITICAL' | 'NEUTRAL';
  title: string;
  description: string;
  metric: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface AiMessageItem {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  toolExecuted?: string;
  toolResult?: any;
  pendingAction?: {
    type: string;
    title: string;
    description: string;
    data: any;
    confirmActionEndpoint?: string;
  };
  createdAt: string;
}

export interface FinanceAgentFinding {
  agent: 'Finance Agent';
  status: 'OPTIMAL' | 'WARNING' | 'ALERT';
  summary: string;
  metrics: {
    totalRevenue: number;
    revenueLast30Days: number;
    monthlyGrowthRate: number;
    forecastNext7Days: number;
    forecastNext30Days: number;
    cashFlowHealth: 'SURPLUS' | 'BALANCED' | 'DEFICIT_RISK';
    burnOrOverdueRatio: number;
  };
  trends: string[];
  recommendations: string[];
  monthComparison: {
    currentPeriodRevenue: number;
    priorPeriodRevenue: number;
    percentageChange: number;
  };
}

export interface CollectionsAgentFinding {
  agent: 'Collections Agent';
  status: 'OPTIMAL' | 'WARNING' | 'ALERT';
  summary: string;
  metrics: {
    totalOverdueAmount: number;
    overdueInvoicesCount: number;
    delinquentCustomersCount: number;
    averageRecoveryDays: number;
  };
  prioritizedCustomers: Array<{
    customerId: string;
    customerName: string;
    company: string;
    overdueInvoicesCount: number;
    totalOverdueAmount: number;
    avgDelayDays: number;
    reliabilityScore: number;
    urgency: 'HIGH' | 'MEDIUM' | 'LOW';
    recommendedContactSequence: number;
    draftReminder: {
      subject: string;
      body: string;
      targetInvoiceNumber: string;
      targetAmount: number;
    };
  }>;
  recoveryStrategy: string[];
}

export interface RiskAgentFinding {
  agent: 'Risk Agent';
  status: 'OPTIMAL' | 'WARNING' | 'ALERT';
  summary: string;
  metrics: {
    totalTransactionsAnalyzed: number;
    flaggedCount: number;
    potentialDiscrepancyAmount: number;
    riskPosture: 'LOW_RISK' | 'MONITORING_REQUIRED' | 'ACTION_REQUIRED';
  };
  flaggedTransactions: Array<{
    transactionId?: string;
    paypalOrderId?: string;
    amount: number;
    customerName: string;
    riskLevel: 'ELEVATED' | 'MODERATE' | 'LOW';
    category: string;
    suspicionReason: string;
    recommendedAction: string;
    transactionDate?: string;
  }>;
  riskObservations: string[];
}

export interface MultiAgentResponse {
  conversationId?: string;
  prompt: string;
  agentsInvolved: Array<'Finance Agent' | 'Collections Agent' | 'Risk Agent'>;
  agentFindings: {
    finance?: FinanceAgentFinding;
    collections?: CollectionsAgentFinding;
    risk?: RiskAgentFinding;
  };
  combinedAnalysis: string;
  recommendedActions: string[];
  executionTimeline: Array<{
    agent: string;
    durationMs: number;
    status: 'OPTIMAL' | 'WARNING' | 'ALERT';
    summary: string;
  }>;
}

export interface AgentStatusInfo {
  name: string;
  role: string;
  status: string;
  dataPoints: string;
}

export interface AutomationWorkflowItem {
  id: string;
  type: 'OVERDUE_REMINDER' | 'PAYMENT_PROCESSING' | 'RECONCILIATION';
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'FAILED';
  title: string;
  description: string;
  aiReasoning?: string;
  customerName?: string;
  company?: string;
  invoiceNumber?: string;
  amount?: number;
  createdAt: string;
  updatedAt?: string;
  context: any;
  result?: any;
}

export interface AuditLogItem {
  id: string;
  action: string;
  entityType: string;
  entityId?: string;
  outcome: 'SUCCESS' | 'FAILURE' | 'SKIPPED' | 'PENDING';
  details?: any;
  createdAt: string;
}

export interface SmartSettleInstallmentItem {
  id: string;
  installmentNumber: number;
  amount: number;
  dueDate: string;
  status: 'PENDING' | 'COMPLETED' | 'OVERDUE' | 'CANCELLED';
  paidAt?: string;
  paypalOrderId?: string;
}

export interface SmartSettleAgreementItem {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  customerName: string;
  company?: string;
  status: 'PENDING_APPROVAL' | 'ACTIVE' | 'COMPLETED' | 'REJECTED' | 'CANCELLED';
  originalAmount: number;
  settledAmount: number;
  paidAmount: number;
  remainingBalance: number;
  installmentsCount: number;
  customerNote?: string;
  aiAnalysis?: string;
  businessNote?: string;
  approvedAt?: string;
  createdAt: string;
  installments: SmartSettleInstallmentItem[];
}

export interface SmartSettleEligibleInvoice {
  id: string;
  invoiceNumber: string;
  total: number;
  dueDate: string;
  status: string;
  daysOverdue: number;
  customer: {
    id: string;
    name: string;
    company?: string;
    email: string;
    totalSettledPast: number;
    ordersCount: number;
  };
  hasActiveAgreement: boolean;
  activeAgreementId?: string;
  agreementStatus?: string;
}

export interface SmartSettleDashboardData {
  summary: {
    activeAgreementsCount: number;
    pendingApprovalCount: number;
    completedAgreementsCount: number;
    totalUnderAgreement: number;
    totalRemaining: number;
    totalRecovered: number;
    completedInstallmentsCount: number;
    upcomingInstallmentsCount: number;
    overdueInstallmentsCount: number;
  };
  agreements: SmartSettleAgreementItem[];
}


