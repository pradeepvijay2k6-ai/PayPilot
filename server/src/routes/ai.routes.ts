import { Router } from 'express';
import { handleChatMessage, handleConfirmAction, getConversationHistory, clearConversation } from '../controllers/ai.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();
router.use(authenticateToken);

router.post('/chat', handleChatMessage);
router.post('/confirm-action', handleConfirmAction);
router.get('/history', getConversationHistory);
router.delete('/history', clearConversation);

export default router;
