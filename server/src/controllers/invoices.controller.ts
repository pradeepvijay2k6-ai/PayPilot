import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { prisma } from '../prisma';
import { paypalService } from '../services/paypal.service';

export const getInvoices = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { status, search, customerId } = req.query;

    const where: any = { userId };
    if (status && typeof status === 'string' && status !== 'ALL') {
      where.status = status;
    }
    if (customerId && typeof customerId === 'string') {
      where.customerId = customerId;
    }
    if (search && typeof search === 'string') {
      where.OR = [
        { invoiceNumber: { contains: search } },
        { customer: { name: { contains: search } } },
        { customer: { company: { contains: search } } }
      ];
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        customer: true,
        items: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(invoices);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getInvoiceById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const invoice = await prisma.invoice.findFirst({
      where: { id, userId },
      include: {
        customer: true,
        items: true,
        transactions: true,
        user: {
          include: { businessProfile: true }
        }
      }
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    res.json(invoice);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const createInvoice = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { customerId, dueDate, items, notes, terms, syncPayPal } = req.body;

    if (!customerId || !dueDate || !items || !items.length) {
      return res.status(400).json({ error: 'Customer, due date, and at least one item are required' });
    }

    const customer = await prisma.customer.findFirst({
      where: { id: customerId, userId }
    });
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const count = await prisma.invoice.count({ where: { userId } });
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;

    let subtotal = 0;
    const parsedItems = items.map((it: any) => {
      const qty = parseFloat(it.quantity || 1);
      const unit = parseFloat(it.unitPrice || 0);
      const amt = qty * unit;
      subtotal += amt;
      return {
        description: it.description || 'Service',
        quantity: qty,
        unitPrice: unit,
        amount: amt
      };
    });

    const tax = 0;
    const total = subtotal + tax;

    let paypalInvoiceId: string | null = null;
    let paypalInvoiceUrl: string | null = null;

    if (syncPayPal && paypalService.isConfigured()) {
      try {
        const pp = await paypalService.createInvoice({
          invoiceNumber,
          customerName: customer.name,
          customerEmail: customer.email,
          dueDate: new Date(dueDate).toISOString().split('T')[0],
          items: parsedItems,
          notes
        });
        paypalInvoiceId = pp.paypalInvoiceId;
        paypalInvoiceUrl = pp.viewUrl;
      } catch (err: any) {
        console.warn('PayPal Invoicing API notice:', err.message);
      }
    }

    const invoice = await prisma.invoice.create({
      data: {
        userId,
        customerId,
        invoiceNumber,
        status: paypalInvoiceId ? 'SENT' : 'UNPAID',
        issueDate: new Date(),
        dueDate: new Date(dueDate),
        currency: 'USD',
        subtotal,
        tax,
        total,
        notes,
        terms,
        paypalInvoiceId,
        paypalInvoiceUrl,
        items: {
          create: parsedItems
        }
      },
      include: {
        customer: true,
        items: true
      }
    });

    res.status(201).json(invoice);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const sendInvoiceToPayPal = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const invoice = await prisma.invoice.findFirst({
      where: { id, userId },
      include: { customer: true, items: true }
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    if (!paypalService.isConfigured()) {
      return res.status(400).json({
        error: 'PayPal Sandbox credentials not configured. Please add them in Settings to send invoices via PayPal.'
      });
    }

    let ppId = invoice.paypalInvoiceId;
    if (!ppId) {
      const created = await paypalService.createInvoice({
        invoiceNumber: invoice.invoiceNumber,
        customerName: invoice.customer.name,
        customerEmail: invoice.customer.email,
        dueDate: invoice.dueDate.toISOString().split('T')[0],
        items: invoice.items.map(it => ({
          description: it.description,
          quantity: it.quantity,
          unitPrice: it.unitPrice
        })),
        notes: invoice.notes || undefined
      });
      ppId = created.paypalInvoiceId;
    }

    if (!ppId) {
      return res.status(500).json({ error: 'Failed to obtain PayPal invoice ID' });
    }

    await paypalService.sendInvoice(ppId);

    const updated = await prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        status: 'SENT',
        paypalInvoiceId: ppId
      },
      include: { customer: true, items: true }
    });

    res.json({
      message: 'Invoice successfully dispatched via PayPal Invoicing API',
      invoice: updated
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const syncInvoiceWithPayPal = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const invoice = await prisma.invoice.findFirst({
      where: { id, userId }
    });

    if (!invoice || !invoice.paypalInvoiceId) {
      return res.status(400).json({ error: 'Invoice has no associated PayPal invoice ID to synchronize' });
    }

    if (!paypalService.isConfigured()) {
      return res.status(400).json({ error: 'PayPal credentials required' });
    }

    const details = await paypalService.getInvoiceDetails(invoice.paypalInvoiceId);
    let newStatus = invoice.status;
    if (details.status === 'PAID') newStatus = 'PAID';
    if (details.status === 'SENT') newStatus = 'SENT';
    if (details.status === 'CANCELLED') newStatus = 'CANCELLED';

    const updated = await prisma.invoice.update({
      where: { id: invoice.id },
      data: { status: newStatus },
      include: { customer: true, items: true }
    });

    res.json({
      message: `Synchronized status from PayPal: ${details.status}`,
      invoice: updated,
      paypalDetails: details
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateInvoice = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { status, notes, dueDate } = req.body;

    const data: any = {};
    if (status) data.status = status;
    if (notes !== undefined) data.notes = notes;
    if (dueDate) data.dueDate = new Date(dueDate);

    const updated = await prisma.invoice.updateMany({
      where: { id, userId },
      data
    });

    if (updated.count === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const record = await prisma.invoice.findUnique({
      where: { id },
      include: { customer: true, items: true }
    });
    res.json(record);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteInvoice = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const deleted = await prisma.invoice.deleteMany({
      where: { id, userId }
    });

    if (deleted.count === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    res.json({ message: 'Invoice successfully deleted' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
