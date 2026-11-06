import { prisma } from '../../prisma';
import { paypalService } from '../paypal.service';
import { config } from '../../config';

export class PaymentProcessingWorkflow {
  /**
   * Stage a payment processing workflow awaiting user authorization
   */
  public async prepare(userId: string, params: {
    customerName: string;
    amount: number;
    description: string;
    invoiceId?: string;
  }) {
    // 1. Locate or create customer
    let customer = await prisma.customer.findFirst({
      where: {
        userId,
        name: { contains: params.customerName }
      }
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          userId,
          name: params.customerName,
          email: `${params.customerName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
          company: `${params.customerName} Enterprise`
        }
      });
    }

    const aiReasoning = `Prepared payment request of $${params.amount.toFixed(2)} for ${customer.name} (${params.description}). In compliance with security guardrails, external PayPal Order creation and link generation will only be executed upon user authorization.`;

    const workflow = await prisma.automationWorkflow.create({
      data: {
        userId,
        type: 'PAYMENT_PROCESSING',
        status: 'PENDING_APPROVAL',
        title: `Authorize Payment Request: ${customer.name}`,
        description: `Request $${params.amount.toFixed(2)} for "${params.description}"`,
        aiReasoning,
        customerId: customer.id,
        invoiceId: params.invoiceId,
        contextJson: JSON.stringify({
          customerId: customer.id,
          customerName: customer.name,
          customerEmail: customer.email,
          amount: params.amount,
          description: params.description,
          invoiceId: params.invoiceId
        })
      }
    });

    await prisma.auditLog.create({
      data: {
        userId,
        workflowId: workflow.id,
        action: 'PAYMENT_REQUEST_STAGED',
        entityType: 'PAYMENT',
        outcome: 'PENDING',
        detailsJson: JSON.stringify({
          customerName: customer.name,
          amount: params.amount,
          description: params.description
        })
      }
    });

    return workflow;
  }

  /**
   * Execute payment request creation after user authorization
   */
  public async execute(workflowId: string, editedContext: any, userId: string) {
    const workflow = await prisma.automationWorkflow.findFirst({
      where: { id: workflowId, userId }
    });

    if (!workflow) throw new Error('Workflow not found');
    if (workflow.status !== 'PENDING_APPROVAL') {
      throw new Error(`Workflow cannot be executed in status ${workflow.status}`);
    }

    const context = editedContext || JSON.parse(workflow.contextJson);

    let paypalOrderId: string | null = null;
    let paypalCheckoutUrl: string | null = null;

    if (paypalService.isConfigured()) {
      try {
        const order = await paypalService.createOrder({
          amount: context.amount,
          description: context.description,
          customerEmail: context.customerEmail
        });
        paypalOrderId = order.id;
        const approveLink = order.links?.find((l: any) => l.rel === 'approve')?.href;
        paypalCheckoutUrl = approveLink || null;
      } catch (err: any) {
        console.warn('PayPal Order creation in automation note:', err.message);
      }
    }

    const pr = await prisma.paymentRequest.create({
      data: {
        userId,
        customerId: context.customerId,
        invoiceId: context.invoiceId,
        amount: context.amount,
        currency: 'USD',
        description: context.description,
        status: 'PENDING',
        paypalOrderId,
        paypalCheckoutUrl
      }
    });

    const publicCheckoutUrl = `${config.clientUrl}/pay/${pr.id}`;

    const updated = await prisma.automationWorkflow.update({
      where: { id: workflowId },
      data: {
        status: 'COMPLETED',
        resultJson: JSON.stringify({
          paymentRequestId: pr.id,
          paypalOrderId,
          checkoutUrl: publicCheckoutUrl,
          authorizedAt: new Date().toISOString()
        })
      }
    });

    await prisma.auditLog.create({
      data: {
        userId,
        workflowId: workflow.id,
        action: 'PAYPAL_ORDER_AUTHORIZED',
        entityType: 'PAYMENT',
        entityId: pr.id,
        outcome: 'SUCCESS',
        detailsJson: JSON.stringify({
          paymentRequestId: pr.id,
          amount: context.amount,
          paypalOrderId
        })
      }
    });

    return {
      workflow: updated,
      paymentRequest: pr,
      checkoutUrl: publicCheckoutUrl
    };
  }
}

export const paymentProcessingWorkflow = new PaymentProcessingWorkflow();
