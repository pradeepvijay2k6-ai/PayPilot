import { Router } from 'express';
import { 
  getInvoices, 
  getInvoiceById, 
  createInvoice, 
  updateInvoice, 
  deleteInvoice,
  sendInvoiceToPayPal,
  syncInvoiceWithPayPal
} from '../controllers/invoices.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();
router.use(authenticateToken);

router.get('/', getInvoices);
router.get('/:id', getInvoiceById);
router.post('/', createInvoice);
router.put('/:id', updateInvoice);
router.delete('/:id', deleteInvoice);
router.post('/:id/send', sendInvoiceToPayPal);
router.post('/:id/sync', syncInvoiceWithPayPal);

export default router;
