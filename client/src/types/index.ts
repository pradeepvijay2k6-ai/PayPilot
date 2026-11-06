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
