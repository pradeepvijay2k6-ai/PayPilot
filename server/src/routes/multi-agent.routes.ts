import { Router } from 'express';
import { multiAgentController } from '../controllers/multi-agent.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.post('/chat', (req, res) => multiAgentController.handleChat(req, res));
router.get('/status', (req, res) => multiAgentController.getAgentStatus(req, res));

export default router;
