import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import { config } from '../../config';
import { financeAgent, FinanceAgentFinding } from './finance.agent';
import { collectionsAgent, CollectionsAgentFinding } from './collections.agent';
import { riskAgent, RiskAgentFinding } from './risk.agent';

export type AgentName = 'Finance Agent' | 'Collections Agent' | 'Risk Agent';

export interface TimelineEvent {
  agent: AgentName;
  durationMs: number;
  status: 'OPTIMAL' | 'WARNING' | 'ALERT';
  summary: string;
}

export interface MultiAgentResponse {
  prompt: string;
  agentsInvolved: AgentName[];
  agentFindings: {
    finance?: FinanceAgentFinding;
    collections?: CollectionsAgentFinding;
    risk?: RiskAgentFinding;
  };
  combinedAnalysis: string;
  recommendedActions: string[];
  executionTimeline: TimelineEvent[];
}

export class OrchestratorAgent {
  /**
   * Decide which specialized agents are required to answer the query
   */
  public decideAgents(prompt: string): AgentName[] {
    const p = prompt.toLowerCase();

    // Specific risk/fraud/suspicious check
    const isRiskSpecific = p.includes('risk') || p.includes('suspicious') || p.includes('fraud') || 
                           p.includes('duplicate') || p.includes('anomaly') || p.includes('anomalies') || p.includes('security');

    // Specific collections/debt check
    const isCollectionsSpecific = p.includes('overdue') || p.includes('who owes') || p.includes('collect') || 
                                  p.includes('debt') || p.includes('late pay') || p.includes('unpaid') || p.includes('remind');

    // Specific finance/revenue forecast check
    const isFinanceSpecific = p.includes('forecast') || p.includes('cash flow') || p.includes('projection') || 
                              p.includes('revenue') && !p.includes('why') && !p.includes('declining');

    // Holistic business diagnostic queries (e.g., "declining", "why", "what should I do", "full analysis", "comprehensive")
    const isHolistic = p.includes('declining') || p.includes('why') || p.includes('what should i do') || 
                       p.includes('problem') || p.includes('help') || p.includes('audit') || 
                       p.includes('health') || p.includes('performance') || p.includes('overview') ||
                       (isRiskSpecific && isCollectionsSpecific);

    if (isHolistic) {
      return ['Finance Agent', 'Collections Agent', 'Risk Agent'];
    }

    if (isRiskSpecific) {
      return ['Risk Agent', 'Finance Agent'];
    }

    if (isCollectionsSpecific) {
      return ['Collections Agent', 'Finance Agent'];
    }

    if (isFinanceSpecific) {
      return ['Finance Agent', 'Collections Agent'];
    }

    // Default to full 3-agent intelligence council for maximum depth
    return ['Finance Agent', 'Collections Agent', 'Risk Agent'];
  }

  /**
   * Execute multi-agent orchestration
   */
  public async orchestrate(userId: string, prompt: string): Promise<MultiAgentResponse> {
    const agentsInvolved = this.decideAgents(prompt);
    const findings: {
      finance?: FinanceAgentFinding;
      collections?: CollectionsAgentFinding;
      risk?: RiskAgentFinding;
    } = {};

    const timeline: TimelineEvent[] = [];

    // Run agents in parallel
    const agentTasks: Promise<void>[] = [];

    if (agentsInvolved.includes('Finance Agent')) {
      const start = Date.now();
      agentTasks.push(
        financeAgent.analyze(userId).then(res => {
          findings.finance = res;
          timeline.push({
            agent: 'Finance Agent',
            durationMs: Date.now() - start,
            status: res.status,
            summary: res.summary
          });
        })
      );
    }

    if (agentsInvolved.includes('Collections Agent')) {
      const start = Date.now();
      agentTasks.push(
        collectionsAgent.analyze(userId).then(res => {
          findings.collections = res;
          timeline.push({
            agent: 'Collections Agent',
            durationMs: Date.now() - start,
            status: res.status,
            summary: res.summary
          });
        })
      );
    }

    if (agentsInvolved.includes('Risk Agent')) {
      const start = Date.now();
      agentTasks.push(
        riskAgent.analyze(userId).then(res => {
          findings.risk = res;
          timeline.push({
            agent: 'Risk Agent',
            durationMs: Date.now() - start,
            status: res.status,
            summary: res.summary
          });
        })
      );
    }

    await Promise.all(agentTasks);

    // Synthesize findings
    const { combinedAnalysis, recommendedActions } = await this.synthesize(prompt, findings);

    return {
      prompt,
      agentsInvolved,
      agentFindings: findings,
      combinedAnalysis,
      recommendedActions,
      executionTimeline: timeline
    };
  }

  /**
   * Synthesize multi-agent outputs into a coherent narrative
   */
  private async synthesize(
    prompt: string,
    findings: {
      finance?: FinanceAgentFinding;
      collections?: CollectionsAgentFinding;
      risk?: RiskAgentFinding;
    }
  ): Promise<{ combinedAnalysis: string; recommendedActions: string[] }> {
    // If Gemini is available, leverage it for high-fidelity reasoning
    if (config.ai.geminiApiKey) {
      try {
        const genAI = new GoogleGenerativeAI(config.ai.geminiApiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const synthesisPrompt = `You are the Lead Financial AI Orchestrator for PayPilot.
User Question: "${prompt}"

Specialized Agent Findings from real database:
Finance Agent: ${JSON.stringify(findings.finance)}
Collections Agent: ${JSON.stringify(findings.collections)}
Risk Agent: ${JSON.stringify(findings.risk)}

Provide a concise, executive-level combined analysis in markdown explaining the root causes and cross-agent correlations.
Then provide 3-4 bulleted, prioritized recommended actions.
Format:
## Combined Financial Analysis
[Concise paragraphs with actual numbers]
## Key Findings by Agent
[Bullet points]
## Prioritized Recommendations
[1. ... 2. ... 3. ...]`;

        const result = await model.generateContent(synthesisPrompt);
        const text = result.response.text();

        // Extract actions
        const actions: string[] = [];
        const lines = text.split('\n');
        for (const line of lines) {
          if (line.match(/^(\d+\.|-)\s+/)) {
            actions.push(line.replace(/^(\d+\.|-)\s+/, '').trim());
          }
        }

        return {
          combinedAnalysis: text,
          recommendedActions: actions.slice(-4)
        };
      } catch (err: any) {
        console.warn('Orchestrator Gemini synthesis note:', err.message);
      }
    }

    // High-performance built-in synthesis engine using validated facts
    const f = findings.finance;
    const c = findings.collections;
    const r = findings.risk;

    const sections: string[] = [];
    const actions: string[] = [];

    // Synthesize root cause analysis
    sections.push(`### Executive Financial Diagnosis`);

    if (f && c) {
      if (c.metrics.totalOverdueAmount > 0) {
        sections.push(
          `Our cross-agent audit reveals that your cash-flow tension is primarily driven by **$${c.metrics.totalOverdueAmount.toLocaleString()} trapped in overdue accounts** rather than an absence of business activity. While your historical revenue stands at **$${f.metrics.totalRevenue.toLocaleString()}**, **${c.metrics.overdueInvoicesCount} invoices** across **${c.metrics.delinquentCustomersCount} client(s)** are significantly past due (average delay: ${c.metrics.averageRecoveryDays} days).`
        );
      } else {
        sections.push(
          `Your accounts receivable portfolio is clean with zero delinquent invoices. Current 30-day velocity has brought in **$${f.metrics.revenueLast30Days.toLocaleString()}**.`
        );
      }

      if (f.metrics.forecastNext7Days === 0 && c.metrics.totalOverdueAmount > 0) {
        sections.push(
          `**Immediate Liquidity Window:** Because incoming contractual receivables for the next 7 days stand at **$0**, the business is operating on a cash deficit risk unless overdue balances are recovered immediately.`
        );
      } else if (f.metrics.forecastNext7Days > 0) {
        sections.push(
          `Short-term pipeline shows **$${f.metrics.forecastNext7Days.toLocaleString()}** maturing in the next 7 days, providing baseline operational coverage.`
        );
      }
    }

    if (r && r.flaggedTransactions.length > 0) {
      sections.push(
        `**Operational Integrity Audit:** The Risk Agent flagged **${r.flaggedTransactions.length} transaction anomaly(ies)** totaling **$${r.metrics.potentialDiscrepancyAmount.toLocaleString()}** for review. These include high-value milestone payments and unlinked checkout settlements. *None are confirmed fraud*, but they require manual confirmation to maintain clean books.`
      );
    }

    // Build consolidated action plan
    if (c && c.prioritizedCustomers.length > 0) {
      const topDebtor = c.prioritizedCustomers[0];
      actions.push(
        `Dispatch automated Net-7 PayPal reminder notice to **${topDebtor.customerName}** ($${topDebtor.totalOverdueAmount.toLocaleString()} overdue, ${topDebtor.avgDelayDays} days late).`
      );
    }

    if (f && f.metrics.forecastNext30Days > 0) {
      actions.push(
        `Accelerate the 30-day pipeline ($${f.metrics.forecastNext30Days.toLocaleString()}) by issuing early payment discounts (2/10 Net 30).`
      );
    }

    if (r && r.flaggedTransactions.length > 0) {
      actions.push(
        `Review the **${r.flaggedTransactions.length} flagged transaction(s)** in the Transactions ledger to confirm deliverable completion.`
      );
    }

    actions.push(
      `Open the **AI Automation Center** to queue and review all pending payment reminders before dispatch.`
    );

    return {
      combinedAnalysis: sections.join('\n\n'),
      recommendedActions: actions
    };
  }
}

export const orchestratorAgent = new OrchestratorAgent();
