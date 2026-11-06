import { Request, Response } from 'express';
import { orchestratorAgent } from '../services/multi-agent/orchestrator.agent';
import { prisma } from '../prisma';

export class MultiAgentController {
  public async handleChat(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { message, conversationId } = req.body;

      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'Message is required' });
      }

      // Execute multi-agent orchestration
      const result = await orchestratorAgent.orchestrate(userId, message);

      // Record in DB if conversation exists or create one
      let convId = conversationId;
      if (!convId) {
        const conv = await prisma.aiConversation.create({
          data: {
            userId,
            title: `Multi-Agent: ${message.slice(0, 30)}...`
          }
        });
        convId = conv.id;
      }

      // Save user message
      await prisma.aiMessage.create({
        data: {
          conversationId: convId,
          role: 'user',
          content: message
        }
      });

      // Save assistant message with tool details
      await prisma.aiMessage.create({
        data: {
          conversationId: convId,
          role: 'assistant',
          content: result.combinedAnalysis,
          toolCallsJson: JSON.stringify(result.agentsInvolved),
          toolResultsJson: JSON.stringify({
            agentFindings: result.agentFindings,
            recommendedActions: result.recommendedActions,
            executionTimeline: result.executionTimeline
          })
        }
      });

      return res.json({
        conversationId: convId,
        ...result
      });
    } catch (err: any) {
      console.error('MultiAgentController error:', err);
      return res.status(500).json({ error: err.message || 'Internal multi-agent error' });
    }
  }

  public async getAgentStatus(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      // Get quick live status of all 3 agents
      const [financeStatus, collectionsStatus, riskStatus] = await Promise.all([
        prisma.transaction.count({ where: { userId, status: 'COMPLETED' } }),
        prisma.invoice.count({ where: { userId, status: 'OVERDUE' } }),
        prisma.transaction.count({ where: { userId } })
      ]);

      return res.json({
        agents: [
          {
            name: 'Finance Agent',
            role: 'Revenue Analysis & Cash Flow Forecasting',
            status: 'READY',
            dataPoints: `${financeStatus} settled transactions analyzed`
          },
          {
            name: 'Collections Agent',
            role: 'Overdue Invoices & Debtor Sequencing',
            status: 'READY',
            dataPoints: `${collectionsStatus} overdue records monitored`
          },
          {
            name: 'Risk Agent',
            role: 'Anomaly Detection & Transaction Integrity',
            status: 'READY',
            dataPoints: `${riskStatus} transaction logs audited`
          }
        ]
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
}

export const multiAgentController = new MultiAgentController();
