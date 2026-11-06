import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { prisma } from '../prisma';

export const getCustomers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { search } = req.query;

    const where: any = { userId };
    if (search && typeof search === 'string') {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { company: { contains: search } }
      ];
    }

    const customers = await prisma.customer.findMany({
      where,
      include: {
        invoices: {
          select: {
            id: true,
            total: true,
            status: true,
            dueDate: true
          }
        },
        transactions: {
          select: {
            id: true,
            amount: true,
            status: true,
            transactionDate: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const now = new Date();
    const enriched = customers.map(c => {
      const totalInvoiced = c.invoices.reduce((s, i) => s + i.total, 0);
      const totalPaid = c.transactions.filter(t => t.status === 'COMPLETED').reduce((s, t) => s + t.amount, 0);
      const overdueInvoices = c.invoices.filter(i => 
        i.status === 'OVERDUE' || 
        ((i.status === 'SENT' || i.status === 'UNPAID') && new Date(i.dueDate) < now)
      );
      const outstandingBalance = c.invoices
        .filter(i => i.status !== 'PAID' && i.status !== 'CANCELLED')
        .reduce((s, i) => s + i.total, 0);

      return {
        id: c.id,
        name: c.name,
        email: c.email,
        company: c.company,
        phone: c.phone,
        address: c.address,
        notes: c.notes,
        totalInvoiced,
        totalPaid,
        outstandingBalance,
        overdueCount: overdueInvoices.length,
        createdAt: c.createdAt
      };
    });

    res.json(enriched);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getCustomerById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const customer = await prisma.customer.findFirst({
      where: { id, userId },
      include: {
        invoices: {
          include: { items: true },
          orderBy: { createdAt: 'desc' }
        },
        transactions: {
          orderBy: { transactionDate: 'desc' }
        },
        paymentRequests: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json(customer);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const createCustomer = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { name, email, company, phone, address, notes } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const customer = await prisma.customer.create({
      data: {
        userId,
        name,
        email,
        company,
        phone,
        address,
        notes
      }
    });

    res.status(201).json(customer);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateCustomer = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { name, email, company, phone, address, notes } = req.body;

    const customer = await prisma.customer.updateMany({
      where: { id, userId },
      data: { name, email, company, phone, address, notes }
    });

    if (customer.count === 0) {
      return res.status(404).json({ error: 'Customer not found or access denied' });
    }

    const updated = await prisma.customer.findUnique({ where: { id } });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteCustomer = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const deleted = await prisma.customer.deleteMany({
      where: { id, userId }
    });

    if (deleted.count === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json({ message: 'Customer successfully deleted' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
