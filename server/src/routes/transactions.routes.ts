import { Router } from 'express';
import { getTransactions, getTransactionById } from '../controllers/transactions.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();
router.use(authenticateToken);

router.get('/', getTransactions);
router.get('/:id', getTransactionById);

export default router;
