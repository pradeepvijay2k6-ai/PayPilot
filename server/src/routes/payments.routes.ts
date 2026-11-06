import { Router } from 'express';
import { 
  createPaymentRequest, 
  getPublicPaymentDetails, 
  createPayPalOrder, 
  capturePayPalOrder 
} from '../controllers/payments.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

// Public routes for checkout page
router.get('/public/:type/:id', getPublicPaymentDetails);
router.post('/create-paypal-order', createPayPalOrder);
router.post('/capture-paypal-order', capturePayPalOrder);

// Authenticated routes
router.post('/request', authenticateToken, createPaymentRequest);

export default router;
