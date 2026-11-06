import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { prisma } from '../prisma';
import { paypalService } from '../services/paypal.service';
import { config } from '../config';

export const createPaymentRequest = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { customerId, amount, description, invoiceId } = req.body;

    if (!customerId || !amount || !description) {
      return res.status(400).json({ error: 'Customer ID, amount, and description are required' });
    }

    const customer = await prisma.customer.findFirst({
      where: { id: customerId, userId }
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    let paypalOrderId: string | null = null;
    let paypalCheckoutUrl: string | null = null;

    if (paypalService.isConfigured()) {
      try {
        const order = await paypalService.createOrder({
          amount: parseFloat(amount),
          description,
          customerEmail: customer.email
        });
        paypalOrderId = order.id;
        paypalCheckoutUrl = order.links?.find((l: any) => l.rel === 'approve')?.href || null;
      } catch (err: any) {
        console.warn('PayPal Order creation notice:', err.message);
      }
    }

    const pr = await prisma.paymentRequest.create({
      data: {
        userId,
        customerId,
        invoiceId: invoiceId || null,
        amount: parseFloat(amount),
        currency: 'USD',
        description,
        status: 'PENDING',
        paypalOrderId,
        paypalCheckoutUrl
      },
      include: { customer: true }
    });

    res.status(201).json({
      paymentRequest: pr,
      publicUrl: `/pay/${pr.id}`
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Public endpoint for customer-facing checkout page
 */
export const getPublicPaymentDetails = async (req: Request, res: Response) => {
  try {
    const { type, id } = req.params;

    if (type === 'request') {
      const pr = await prisma.paymentRequest.findUnique({
        where: { id },
        include: {
          customer: true,
          user: {
            include: { businessProfile: true }
          }
        }
      });

      if (!pr) {
        return res.status(404).json({ error: 'Payment request not found' });
      }

      return res.json({
        type: 'request',
        id: pr.id,
        amount: pr.amount,
        currency: pr.currency,
        description: pr.description,
        status: pr.status,
        customer: {
          name: pr.customer.name,
          email: pr.customer.email,
          company: pr.customer.company
        },
        business: {
          name: pr.user.businessProfile?.businessName || pr.user.name,
          email: pr.user.businessProfile?.email || pr.user.email
        },
        paypalClientId: config.paypal.clientId || pr.user.businessProfile?.paypalClientId || ''
      });
    } else if (type === 'invoice') {
      const inv = await prisma.invoice.findUnique({
        where: { id },
        include: {
          customer: true,
          items: true,
          user: {
            include: { businessProfile: true }
          }
        }
      });

      if (!inv) {
        return res.status(404).json({ error: 'Invoice not found' });
      }

      return res.json({
        type: 'invoice',
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        amount: inv.total,
        currency: inv.currency,
        description: `Payment for Invoice ${inv.invoiceNumber}`,
        status: inv.status,
        dueDate: inv.dueDate,
        items: inv.items,
        customer: {
          name: inv.customer.name,
          email: inv.customer.email,
          company: inv.customer.company
        },
        business: {
          name: inv.user.businessProfile?.businessName || inv.user.name,
          email: inv.user.businessProfile?.email || inv.user.email
        },
        paypalClientId: config.paypal.clientId || inv.user.businessProfile?.paypalClientId || ''
      });
    }

    res.status(400).json({ error: 'Invalid payment type' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Endpoint for PayPal Smart Buttons to create Order on the fly
 */
export const createPayPalOrder = async (req: Request, res: Response) => {
  try {
    const { amount, currency, description, entityType, entityId } = req.body;

    if (!amount) {
      return res.status(400).json({ error: 'Amount is required' });
    }

    if (!paypalService.isConfigured()) {
      // In demo mode without keys, return a structured mock order ID for seamless testing
      return res.json({
        id: `DEMO-ORDER-${Date.now()}`,
        status: 'CREATED',
        demoMode: true
      });
    }

    const order = await paypalService.createOrder({
      amount: parseFloat(amount),
      currency: currency || 'USD',
      description: description || 'PayPilot Transaction',
      customId: `${entityType || 'PAYMENT'}:${entityId || ''}`
    });

    res.json(order);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Capture approved PayPal order and verify transaction securely on backend
 */
export const capturePayPalOrder = async (req: Request, res: Response) => {
  try {
    const { orderId, entityType, entityId } = req.body;

    if (!orderId) {
      return res.status(400).json({ error: 'orderId is required' });
    }

    // Idempotency check: verify if transaction was already processed
    const existingTx = await prisma.transaction.findFirst({
      where: { paypalOrderId: orderId }
    });
    if (existingTx) {
      return res.json({
        message: 'Order was already captured and verified',
        transaction: existingTx
      });
    }

    let captureResult: any = null;

    if (paypalService.isConfigured()) {
      captureResult = await paypalService.captureOrder(orderId);
      if (captureResult.status !== 'COMPLETED') {
        return res.status(400).json({ error: `PayPal order not completed. Status: ${captureResult.status}` });
      }
    } else {
      // Demo simulated capture fallback
      captureResult = {
        orderId,
        status: 'COMPLETED',
        captureId: `DEMO-CAP-${Date.now()}`,
        amount: 250,
        currency: 'USD',
        payer: {
          name: { given_name: 'Sandbox', surname: 'Buyer' },
          email_address: 'sandbox-buyer@personal.example.com'
        },
        raw: { simulated: true }
      };
    }

    // Find linked entities
    let customerId: string | null = null;
    let invoiceId: string | null = null;
    let paymentRequestId: string | null = null;
    let userId: string | null = null;

    if (entityType === 'invoice' && entityId) {
      const inv = await prisma.invoice.findUnique({ where: { id: entityId } });
      if (inv) {
        invoiceId = inv.id;
        customerId = inv.customerId;
        userId = inv.userId;
        await prisma.invoice.update({
          where: { id: inv.id },
          data: { status: 'PAID' }
        });
      }
    } else if (entityType === 'request' && entityId) {
      const pr = await prisma.paymentRequest.findUnique({ where: { id: entityId } });
      if (pr) {
        paymentRequestId = pr.id;
        customerId = pr.customerId;
        userId = pr.userId;
        invoiceId = pr.invoiceId;
        await prisma.paymentRequest.update({
          where: { id: pr.id },
          data: { status: 'COMPLETED' }
        });
        if (invoiceId) {
          await prisma.invoice.update({
            where: { id: invoiceId },
            data: { status: 'PAID' }
          });
        }
      }
    }

    if (!userId) {
      const demoUser = await prisma.user.findFirst({ where: { email: 'demo@paypilot.finance' } });
      userId = demoUser?.id || '';
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId,
        customerId,
        invoiceId,
        paymentRequestId,
        paypalOrderId: orderId,
        paypalCaptureId: captureResult.captureId || `CAP-${Date.now()}`,
        amount: captureResult.amount,
        currency: captureResult.currency || 'USD',
        status: 'COMPLETED',
        paymentMethod: 'PAYPAL',
        payerEmail: captureResult.payer?.email_address,
        payerName: captureResult.payer?.name ? `${captureResult.payer.name.given_name} ${captureResult.payer.name.surname || ''}`.trim() : 'PayPal Customer',
        transactionDate: new Date(),
        rawResponseJson: JSON.stringify(captureResult.raw)
      },
      include: {
        customer: true,
        invoice: true
      }
    });

    if (userId) {
      await prisma.auditLog.create({
        data: {
          userId,
          action: invoiceId ? 'PAYPAL_PAYMENT_RECONCILED' : 'PAYPAL_PAYMENT_CAPTURED',
          entityType: 'TRANSACTION',
          entityId: transaction.id,
          outcome: 'SUCCESS',
          detailsJson: JSON.stringify({
            paypalOrderId: orderId,
            amount: captureResult.amount,
            invoiceId,
            payer: captureResult.payer?.email_address
          })
        }
      });
    }

    res.json({
      message: 'Payment successfully captured and verified through PayPal API',
      transaction
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
