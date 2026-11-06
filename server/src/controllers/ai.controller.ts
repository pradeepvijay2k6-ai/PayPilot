import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { prisma } from '../prisma';
import { aiService } from '../services/ai.service';

export const handleChatMessage = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { message, conversationId } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message content is required' });
    }

    // Get or create conversation
    let conversation = conversationId 
      ? await prisma.aiConversation.findFirst({ where: { id: conversationId, userId } })
      : await prisma.aiConversation.findFirst({ where: { userId }, orderBy: { updatedAt: 'desc' } });

    if (!conversation) {
      conversation = await prisma.aiConversation.create({
        data: {
          userId,
          title: 'Financial Operations Assistant'
        }
      });
    }

    // Persist user message
    await prisma.aiMessage.create({
      data: {
        conversationId: conversation.id,
        role: 'user',
        content: message
      }
    });

    // Execute AI Agent logic
    const agentResponse = await aiService.processUserMessage(userId, message);

    // Persist assistant message
    const assistantMessage = await prisma.aiMessage.create({
      data: {
        conversationId: conversation.id,
        role: 'assistant',
        content: agentResponse.message,
        toolCallsJson: agentResponse.toolExecuted ? JSON.stringify({ tool: agentResponse.toolExecuted }) : null,
        toolResultsJson: agentResponse.toolResult ? JSON.stringify(agentResponse.toolResult) : null,
        pendingActionJson: agentResponse.pendingAction ? JSON.stringify(agentResponse.pendingAction) : null
      }
    });

    // Touch conversation updated timestamp
    await prisma.aiConversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() }
    });

    res.json({
      conversationId: conversation.id,
      response: agentResponse,
      messageId: assistantMessage.id
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const handleConfirmAction = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { actionType, actionData } = req.body;

    if (!actionType || !actionData) {
      return res.status(400).json({ error: 'Action type and data are required' });
    }

    if (actionType === 'CONFIRM_INVOICE_CREATION') {
      const invoice = await aiService.commitInvoice(userId, actionData);

      // Record activity log
      await prisma.activityLog.create({
        data: {
          userId,
          action: 'INVOICE_CREATED_VIA_AI',
          entityType: 'INVOICE',
          entityId: invoice.id,
          detailsJson: JSON.stringify({ invoiceNumber: invoice.invoiceNumber, amount: invoice.total, paypalInvoiceId: invoice.paypalInvoiceId })
        }
      });

      return res.json({
        success: true,
        message: `Invoice **${invoice.invoiceNumber}** for **${actionData.customerName}** ($${invoice.total.toLocaleString()}) was successfully created and registered with PayPal Invoicing!`,
        invoice
      });
    }

    res.status(400).json({ error: 'Unknown action type' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getConversationHistory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    let conversation = await prisma.aiConversation.findFirst({
      where: { userId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    if (!conversation) {
      conversation = await prisma.aiConversation.create({
        data: {
          userId,
          title: 'Financial Operations Assistant',
          messages: {
            create: [
              {
                role: 'assistant',
                content: `Hello! I am **PayPilot**, your AI Financial Operations Agent powered by PayPal.\n\nI can create invoices, generate payment links, monitor unpaid debts, and analyze cash flow in real-time. What would you like to do?`
              }
            ]
          }
        },
        include: {
          messages: true
        }
      });
    }

    const formattedMessages = conversation.messages.map(m => ({
      id: m.id,
      role: m.role,
      content: m.content,
      toolExecuted: m.toolCallsJson ? JSON.parse(m.toolCallsJson).tool : undefined,
      toolResult: m.toolResultsJson ? JSON.parse(m.toolResultsJson) : undefined,
      pendingAction: m.pendingActionJson ? JSON.parse(m.pendingActionJson) : undefined,
      createdAt: m.createdAt
    }));

    res.json({
      conversationId: conversation.id,
      messages: formattedMessages
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const clearConversation = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const conversation = await prisma.aiConversation.findFirst({
      where: { userId },
      orderBy: { updatedAt: 'desc' }
    });

    if (conversation) {
      await prisma.aiMessage.deleteMany({
        where: { conversationId: conversation.id }
      });

      await prisma.aiMessage.create({
        data: {
          conversationId: conversation.id,
          role: 'assistant',
          content: `Conversation reset. How can I assist with your PayPal finances today?`
        }
      });
    }

    res.json({ message: 'Conversation cleared' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
