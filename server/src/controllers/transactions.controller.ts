import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { prisma } from '../prisma';

export const getTransactions = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { status, search } = req.query;

    const where: any = { userId };
    if (status && typeof status === 'string' && status !== 'ALL') {
      where.status = status;
    }
    if (search && typeof search === 'string') {
      where.OR = [
        { paypalOrderId: { contains: search } },
        { paypalCaptureId: { contains: search } },
        { payerEmail: { contains: search } },
        { payerName: { contains: search } },
        { customer: { name: { contains: search } } }
      ];
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        customer: true,
        invoice: true
      },
      orderBy: { transactionDate: 'desc' }
    });

    res.json(transactions);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getTransactionById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const transaction = await prisma.transaction.findFirst({
      where: { id, userId },
      include: {
        customer: true,
        invoice: {
          include: { items: true }
        },
        paymentRequest: true
      }
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json(transaction);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
