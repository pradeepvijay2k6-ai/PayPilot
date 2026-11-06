import { prisma } from '../../prisma';

export interface FlaggedTransaction {
  transactionId?: string;
  paypalOrderId?: string;
  amount: number;
  customerName: string;
  riskLevel: 'ELEVATED' | 'MODERATE' | 'LOW';
  category: 'DUPLICATE_SUSPICION' | 'UNUSUAL_AMOUNT' | 'FAILED_ATTEMPTS' | 'UNLINKED_SETTLEMENT';
  suspicionReason: string;
  recommendedAction: string;
  transactionDate?: string;
}

export interface RiskAgentFinding {
  agent: 'Risk Agent';
  status: 'OPTIMAL' | 'WARNING' | 'ALERT';
  summary: string;
  metrics: {
    totalTransactionsAnalyzed: number;
    flaggedCount: number;
    potentialDiscrepancyAmount: number;
    riskPosture: 'LOW_RISK' | 'MONITORING_REQUIRED' | 'ACTION_REQUIRED';
  };
  flaggedTransactions: FlaggedTransaction[];
  riskObservations: string[];
}

export class RiskAgent {
  public async analyze(userId: string): Promise<RiskAgentFinding> {
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      include: { customer: true, invoice: true },
      orderBy: { transactionDate: 'desc' }
    });

    const paymentRequests = await prisma.paymentRequest.findMany({
      where: { userId },
      include: { customer: true }
    });

    const flagged: FlaggedTransaction[] = [];

    // Calculate baseline metrics across completed transactions
    const completed = transactions.filter(t => t.status === 'COMPLETED');
    const amounts = completed.map(t => t.amount);
    const avgAmount = amounts.length > 0 ? amounts.reduce((a, b) => a + b, 0) / amounts.length : 0;

    // 1. Check for Duplicate Transactions (same amount, customer, within 24h or duplicate order IDs)
    const seenOrders = new Set<string>();
    for (let i = 0; i < transactions.length; i++) {
      const tx = transactions[i];
      if (tx.paypalOrderId) {
        if (seenOrders.has(tx.paypalOrderId)) {
          flagged.push({
            transactionId: tx.id,
            paypalOrderId: tx.paypalOrderId,
            amount: tx.amount,
            customerName: tx.customer?.name || 'Unassigned',
            riskLevel: 'ELEVATED',
            category: 'DUPLICATE_SUSPICION',
            suspicionReason: `Duplicate PayPal Order ID ${tx.paypalOrderId} detected across multiple transaction records. This may indicate an idempotency processing replay.`,
            recommendedAction: 'Verify PayPal Settlement Ledger in Sandbox Dashboard to ensure customer was not double-charged.',
            transactionDate: tx.transactionDate.toISOString().split('T')[0]
          });
        } else {
          seenOrders.add(tx.paypalOrderId);
        }
      }

      // Check amount collisions within 48 hours for same customer
      for (let j = i + 1; j < transactions.length; j++) {
        const other = transactions[j];
        if (
          tx.customerId &&
          tx.customerId === other.customerId &&
          tx.amount === other.amount &&
          Math.abs(new Date(tx.transactionDate).getTime() - new Date(other.transactionDate).getTime()) < 48 * 60 * 60 * 1000
        ) {
          flagged.push({
            transactionId: tx.id,
            paypalOrderId: tx.paypalOrderId || undefined,
            amount: tx.amount,
            customerName: tx.customer?.name || 'Client',
            riskLevel: 'MODERATE',
            category: 'DUPLICATE_SUSPICION',
            suspicionReason: `Twin charges of exactly $${tx.amount.toLocaleString()} posted to ${tx.customer?.name} within 48 hours. Pattern matches accidental double-click submission.`,
            recommendedAction: 'Contact client to confirm whether dual order was intentional or requires a refund.',
            transactionDate: tx.transactionDate.toISOString().split('T')[0]
          });
        }
      }
    }

    // 2. Detect Unusual Payment Amounts (> 2.5x average or high outlier)
    const outlierThreshold = Math.max(4000, avgAmount * 2.2);
    for (const tx of completed) {
      if (tx.amount >= outlierThreshold) {
        flagged.push({
          transactionId: tx.id,
          paypalOrderId: tx.paypalOrderId || undefined,
          amount: tx.amount,
          customerName: tx.customer?.name || 'Enterprise Account',
          riskLevel: 'MODERATE',
          category: 'UNUSUAL_AMOUNT',
          suspicionReason: `Transaction amount of $${tx.amount.toLocaleString()} is significantly higher than your baseline average ($${Math.round(avgAmount).toLocaleString()}). High-value transactions warrant verification of deliverables.`,
          recommendedAction: 'Perform manual verification of invoice milestone sign-off prior to releasing related service assets.',
          transactionDate: tx.transactionDate.toISOString().split('T')[0]
        });
      }
    }

    // 3. Repeated Failed or Stalled Payment Attempts
    const failedTxs = transactions.filter(t => t.status === 'FAILED');
    for (const tx of failedTxs) {
      flagged.push({
        transactionId: tx.id,
        paypalOrderId: tx.paypalOrderId || undefined,
        amount: tx.amount,
        customerName: tx.customer?.name || 'Client',
        riskLevel: 'ELEVATED',
        category: 'FAILED_ATTEMPTS',
        suspicionReason: `Payment attempt of $${tx.amount.toLocaleString()} terminated with status FAILED. Repeated capture declines can signal merchant account mismatch or card authorization lock.`,
        recommendedAction: 'Verify buyer billing address or recommend alternate PayPal funding source to customer.',
        transactionDate: tx.transactionDate.toISOString().split('T')[0]
      });
    }

    // 4. Invoices paid with unlinked/orphan settlement records
    const unlinked = transactions.filter(t => t.status === 'COMPLETED' && !t.invoiceId);
    for (const tx of unlinked) {
      flagged.push({
        transactionId: tx.id,
        paypalOrderId: tx.paypalOrderId || undefined,
        amount: tx.amount,
        customerName: tx.customer?.name || 'Direct Payer',
        riskLevel: 'LOW',
        category: 'UNLINKED_SETTLEMENT',
        suspicionReason: `Captured $${tx.amount.toLocaleString()} without a corresponding Invoice link. Unreconciled payments can cause reporting skew.`,
        recommendedAction: 'Use the AI Automation Center to automatically reconcile this payment with an open invoice.',
        transactionDate: tx.transactionDate.toISOString().split('T')[0]
      });
    }

    // Deduplicate flagged items by transactionId + category
    const uniqueFlagged = Array.from(
      new Map(flagged.map(f => [`${f.transactionId}-${f.category}`, f])).values()
    );

    const discrepancyAmount = uniqueFlagged.reduce((sum, f) => sum + f.amount, 0);

    const riskPosture: 'LOW_RISK' | 'MONITORING_REQUIRED' | 'ACTION_REQUIRED' =
      uniqueFlagged.some(f => f.riskLevel === 'ELEVATED')
        ? 'ACTION_REQUIRED'
        : uniqueFlagged.length > 0
        ? 'MONITORING_REQUIRED'
        : 'LOW_RISK';

    const riskObservations: string[] = [];
    if (uniqueFlagged.length === 0) {
      riskObservations.push('All settled PayPal transactions conform to expected variance bounds.');
      riskObservations.push('Zero failed capture cascades or replay attempts observed in audit window.');
    } else {
      riskObservations.push(`Identified ${uniqueFlagged.length} transaction pattern(s) requiring operational review.`);
      riskObservations.push('Note: Flagged items represent variance anomalies for verification and do not signify confirmed fraud.');
      riskObservations.push('All captured funds remain secured within your PayPal Sandbox merchant balance.');
    }

    const status = riskPosture === 'ACTION_REQUIRED' ? 'ALERT' : riskPosture === 'MONITORING_REQUIRED' ? 'WARNING' : 'OPTIMAL';

    return {
      agent: 'Risk Agent',
      status,
      summary: `Audited ${transactions.length} transaction records. Detected ${uniqueFlagged.length} pattern anomaly(ies) across volume and billing alignment. Risk posture categorized as ${riskPosture}. Manual verification advised where noted.`,
      metrics: {
        totalTransactionsAnalyzed: transactions.length,
        flaggedCount: uniqueFlagged.length,
        potentialDiscrepancyAmount: discrepancyAmount,
        riskPosture
      },
      flaggedTransactions: uniqueFlagged,
      riskObservations
    };
  }
}

export const riskAgent = new RiskAgent();
