import axios from 'axios';
import { config } from '../config';

interface PayPalCredentials {
  clientId: string;
  clientSecret: string;
}

export class PayPalService {
  private cachedToken: { token: string; expiresAt: number } | null = null;

  private getCredentials(customCreds?: Partial<PayPalCredentials>): PayPalCredentials {
    const clientId = customCreds?.clientId || config.paypal.clientId;
    const clientSecret = customCreds?.clientSecret || config.paypal.clientSecret;
    return { clientId, clientSecret };
  }

  public isConfigured(customCreds?: Partial<PayPalCredentials>): boolean {
    const creds = this.getCredentials(customCreds);
    return Boolean(creds.clientId && creds.clientSecret && !creds.clientId.includes('your_paypal'));
  }

  public async getAccessToken(customCreds?: Partial<PayPalCredentials>): Promise<string> {
    const creds = this.getCredentials(customCreds);
    if (!this.isConfigured(customCreds)) {
      throw new Error(
        'PayPal Sandbox credentials are not configured. Please enter your PayPal Sandbox Client ID and Client Secret in Settings or in your .env file.'
      );
    }

    const now = Date.now();
    if (this.cachedToken && this.cachedToken.expiresAt > now + 60000) {
      return this.cachedToken.token;
    }

    const auth = Buffer.from(`${creds.clientId}:${creds.clientSecret}`).toString('base64');
    try {
      const response = await axios.post(
        `${config.paypal.baseUrl}/v1/oauth2/token`,
        'grant_type=client_credentials',
        {
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          timeout: 10000
        }
      );

      const { access_token, expires_in } = response.data;
      this.cachedToken = {
        token: access_token,
        expiresAt: now + (expires_in * 1000)
      };

      return access_token;
    } catch (err: any) {
      const message = err.response?.data?.error_description || err.message;
      throw new Error(`Failed to authenticate with PayPal Sandbox: ${message}`);
    }
  }

  public async testConnection(customCreds?: Partial<PayPalCredentials>): Promise<{ connected: boolean; message: string; scope?: string }> {
    try {
      const token = await this.getAccessToken(customCreds);
      return {
        connected: true,
        message: 'Successfully connected to PayPal Developer Sandbox!'
      };
    } catch (err: any) {
      return {
        connected: false,
        message: err.message
      };
    }
  }

  /**
   * Create an Order for PayPal Smart Buttons / Checkout
   */
  public async createOrder(params: {
    amount: number;
    currency?: string;
    description: string;
    customId?: string;
    customerEmail?: string;
    customCreds?: Partial<PayPalCredentials>;
  }) {
    const currency = params.currency || 'USD';
    const token = await this.getAccessToken(params.customCreds);

    const payload = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: params.customId || 'PAYPILOT-REF',
          description: params.description.substring(0, 127),
          custom_id: params.customId,
          amount: {
            currency_code: currency,
            value: params.amount.toFixed(2),
          },
        },
      ],
      application_context: {
        brand_name: 'PayPilot Business',
        landing_page: 'NO_PREFERENCE',
        user_action: 'PAY_NOW',
        return_url: `${config.clientUrl}/payment-success`,
        cancel_url: `${config.clientUrl}/payment-cancelled`,
      },
    };

    const response = await axios.post(
      `${config.paypal.baseUrl}/v2/checkout/orders`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
      }
    );

    return response.data;
  }

  /**
   * Capture an approved PayPal order and verify transaction securely on backend
   */
  public async captureOrder(orderId: string, customCreds?: Partial<PayPalCredentials>) {
    const token = await this.getAccessToken(customCreds);

    const response = await axios.post(
      `${config.paypal.baseUrl}/v2/checkout/orders/${orderId}/capture`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
      }
    );

    const orderData = response.data;
    const capture = orderData.purchase_units?.[0]?.payments?.captures?.[0];
    
    return {
      orderId: orderData.id,
      status: orderData.status, // COMPLETED
      captureId: capture?.id,
      amount: parseFloat(capture?.amount?.value || '0'),
      currency: capture?.amount?.currency_code || 'USD',
      payer: orderData.payer,
      sellerReceivableBreakdown: capture?.seller_receivable_breakdown,
      raw: orderData
    };
  }

  /**
   * Retrieve order details from PayPal Orders API v2
   */
  public async getOrderDetails(orderId: string, customCreds?: Partial<PayPalCredentials>) {
    const token = await this.getAccessToken(customCreds);
    const response = await axios.get(
      `${config.paypal.baseUrl}/v2/checkout/orders/${orderId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  }

  /**
   * PayPal Invoicing API v2: Generate next sequence number
   */
  public async generateInvoiceNumber(customCreds?: Partial<PayPalCredentials>): Promise<string> {
    try {
      const token = await this.getAccessToken(customCreds);
      const response = await axios.post(
        `${config.paypal.baseUrl}/v2/invoicing/generate-next-invoice-number`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data.invoice_number;
    } catch {
      // Fallback format if sequence service is unavailable
      const rand = Math.floor(1000 + Math.random() * 9000);
      return `INV-PP-${rand}`;
    }
  }

  /**
   * PayPal Invoicing API v2: Create Draft Invoice
   */
  public async createInvoice(params: {
    invoiceNumber: string;
    customerName: string;
    customerEmail: string;
    currency?: string;
    dueDate: string; // YYYY-MM-DD
    items: Array<{ description: string; quantity: number; unitPrice: number }>;
    notes?: string;
    customCreds?: Partial<PayPalCredentials>;
  }) {
    const token = await this.getAccessToken(params.customCreds);
    const currency = params.currency || 'USD';

    const payload = {
      detail: {
        invoice_number: params.invoiceNumber,
        reference: `PAYPILOT-${Date.now()}`,
        invoice_date: new Date().toISOString().split('T')[0],
        currency_code: currency,
        note: params.notes || 'Thank you for your business. Generated by PayPilot AI.',
        payment_term: {
          term_type: 'DUE_ON_DATE_SPECIFIED',
          due_date: params.dueDate,
        },
      },
      invoicer: {
        name: {
          given_name: 'PayPilot Business',
        },
      },
      primary_recipients: [
        {
          billing_info: {
            name: {
              given_name: params.customerName,
            },
            email_address: params.customerEmail,
          },
        },
      ],
      items: params.items.map((item) => ({
        name: item.description.substring(0, 50),
        description: item.description,
        quantity: item.quantity.toString(),
        unit_amount: {
          currency_code: currency,
          value: item.unitPrice.toFixed(2),
        },
        unit_of_measure: 'QUANTITY',
      })),
    };

    const response = await axios.post(
      `${config.paypal.baseUrl}/v2/invoicing/invoices`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
      }
    );

    const invoice = response.data;
    // Extract self or payer-view link
    const viewLink = invoice.links?.find((l: any) => l.rel === 'payer-view')?.href || invoice.href;

    return {
      paypalInvoiceId: invoice.id,
      status: invoice.status, // DRAFT
      invoiceNumber: invoice.detail?.invoice_number || params.invoiceNumber,
      viewUrl: viewLink,
      raw: invoice,
    };
  }

  /**
   * PayPal Invoicing API v2: Send Invoice
   */
  public async sendInvoice(paypalInvoiceId: string, customCreds?: Partial<PayPalCredentials>) {
    const token = await this.getAccessToken(customCreds);
    const response = await axios.post(
      `${config.paypal.baseUrl}/v2/invoicing/invoices/${paypalInvoiceId}/send`,
      {
        send_to_recipient: true,
        send_to_invoicer: true,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  }

  /**
   * PayPal Invoicing API v2: Get Invoice Details
   */
  public async getInvoiceDetails(paypalInvoiceId: string, customCreds?: Partial<PayPalCredentials>) {
    const token = await this.getAccessToken(customCreds);
    const response = await axios.get(
      `${config.paypal.baseUrl}/v2/invoicing/invoices/${paypalInvoiceId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  }
}

export const paypalService = new PayPalService();
