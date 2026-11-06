# PayPilot – AI-Powered Financial Operations Agent using PayPal

<div align="center">
  <h3>Your Business. Your Money. Your AI Agent.</h3>
  <p>
    <strong>Hackathon Entry:</strong> Build What's Next with PayPal and AI Global Hackathon
  </p>
  <p>
    <a href="http://localhost:5173">Live Demo</a> •
    <a href="#feature-1-multi-agent-financial-intelligence">Multi-Agent Intelligence</a> •
    <a href="#feature-2-autonomous-financial-workflow-automation">AI Automation Center</a> •
    <a href="#feature-3-smartsettle-ai-payment-negotiator">SmartSettle Negotiator</a> •
    <a href="#quick-start">Quick Start</a> •
    <a href="#architecture">Architecture</a>
  </p>
</div>

---

## 🧠 Problem Statement

Small businesses, freelancers, and entrepreneurs waste enormous time on repetitive financial operations — creating invoices, chasing overdue payments, understanding their revenue, and managing customer accounts. When customers face temporary cash-flow shortages, businesses often lack the tools to structure mutually agreeable installment arrangements, resulting in delayed receivables or unpaid debt.

## 💡 The Solution: PayPilot

PayPilot is an **autonomous AI financial operations agent** that lets business owners manage their entire PayPal financial workflow through natural language, autonomous event-driven workflows, and automated installment negotiations.

- **Multiple specialized AI agents** collaborate to audit business health, forecast cash flow, sequence delinquent accounts, and monitor transaction integrity.
- An **autonomous AI Automation Center** continuously detects financial events (overdue invoices, unlinked settlements, pending payments), stages intelligent workflows, and executes real PayPal operations only upon explicit human authorization.
- **SmartSettle AI Payment Negotiator** bridges businesses and customers by structuring flexible, transparent installment agreements when customers cannot pay in full, with seamless PayPal milestone checkout.

---

## 🌟 THREE STANDOUT INNOVATIONS

### FEATURE 1: MULTI-AGENT FINANCIAL INTELLIGENCE
A central AI Orchestrator receives complex financial inquiries and convenes a council of three specialized agents that execute in parallel across live database records:

```
                          User Question:
          "My business revenue is declining. Find out why and what to do."
                                │
                                ▼
                     ┌─────────────────────┐
                     │ Central Orchestrator│
                     └──────────┬──────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       ▼
 ┌───────────────┐       ┌───────────────┐       ┌───────────────┐
 │ Finance Agent │       │Collections Agt│       │  Risk Agent   │
 ├───────────────┤       ├───────────────┤       ├───────────────┤
 │• Real revenue │       │• Overdue debt │       │• Duplicate tx │
 │• Trend audit  │       │• Delay days   │       │• Anomaly check│
 │• 7d/30d inflow│       │• Debtor rank  │       │• Spike alerts │
 │• Cash deficit │       │• Reminder text│       │• Verify advice│
 └───────┬───────┘       └───────┬───────┘       └───────┬───────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                                 ▼
                     ┌─────────────────────┐
                     │ Combined Synthesis  │
                     │• Agents Involved    │
                     │• Execution Timeline │
                     │• Executive Diagnosis│
                     │• Actionable Steps   │
                     └─────────────────────┘
```

1. **Finance Agent**:
   - Analyzes real settled business revenue ($10,950 baseline).
   - Identifies trend velocity (+100% MoM).
   - Generates linear 7-day and 30-day incoming payment projections based on contract maturities.
   - Detects cash-flow deficit risks (e.g. $0 incoming in 7 days when $2,400 is trapped in overdue accounts).
   - Compares consecutive monitoring periods.

2. **Collections Agent**:
   - Identifies delinquent invoices and aggregates debt across customer accounts.
   - Computes exact payment delay days (average: 13 days past contractual due date).
   - Ranks customers by debt magnitude, delay severity, and reliability score (0-100).
   - Generates personalized, professional reminder drafts containing direct PayPal checkout links.
   - Prescribes contact sequencing (#1 David Miller, #2 Johnathan Vance).

3. **Risk Agent**:
   - Scans the ledger for duplicate PayPal Order IDs and twin charge collisions within 48 hours.
   - Detects high-value transaction outliers (>2.2× account baseline) warranting milestone sign-off.
   - Identifies repeated failed authorization cascades.
   - Flags unlinked checkout settlements.
   - Explains the specific suspicion rationale and recommends manual verification without falsely asserting confirmed fraud.

---

### FEATURE 2: AUTONOMOUS FINANCIAL WORKFLOW AUTOMATION
An **AI Automation Center** with a strict **Human-in-the-Loop Approval Center**:

```
 Financial Events (Overdue Invoices, Payment Requests, PayPal Settlements)
                                │
                                ▼
                 Autonomous Detection Engine
                                │
                                ▼
                   Staged in Approval Queue
                   (Status: PENDING_APPROVAL)
                                │
         ┌──────────────────────┼──────────────────────┐
         ▼                      ▼                      ▼
    [ Approve ]             [ Edit ]              [ Reject ]
         │                      │                      │
 Execute Action          Inline Editor          Mark Rejected
 (Send Reminder,         Update Subject,               │
  Create PayPal Order,   Body or Terms                 │
  Reconcile Invoice)            │                      │
         │                Save & Authorize             │
         │                      │                      │
         └──────────────────────┴──────────────────────┘
                                │
                                ▼
                   Immutable Audit Log Entry
             (Cryptographically recorded outcome)
```

1. **Workflow 1: Overdue Invoice Management**
   - Automatically detects invoices crossing maturity dates.
   - Retrieves debtor payment history and computes risk profile.
   - Drafts personalized notification with embedded PayPal payment link.
   - Holds in Approval Center.
   - Dispatches via notification gateway upon business owner authorization.

2. **Workflow 2: Authorized Payment Processing**
   - User or AI stages a payment request for a client.
   - Displays customer details, amount, and deliverable description.
   - Awaits explicit user authorization.
   - Upon approval, executes `paypalService.createOrder()` via Orders API v2, creating a verified PayPal Order and customer checkout link.
   - Logs every step in the audit trail.

3. **Workflow 3: Automatic Payment Reconciliation**
   - Automatically scans settled PayPal captures.
   - Matches incoming transactions against open invoices using customer identity and exact amount.
   - Automatically marks invoice as `PAID` upon match.
   - Unmatched transactions are flagged for manual review with detailed AI explanation.

---

### FEATURE 3: SMARTSETTLE – AI PAYMENT NEGOTIATOR
An AI-powered payment negotiation system connecting business owners and customers to agree on flexible milestone plans when full payment is impossible:

```
Customer Facing Portal (/negotiate/:id)       Business Owner Dashboard (/smartsettle)
            │                                                 │
            ├─► Views outstanding invoice                     ├─► Audits eligible invoices
            ├─► Configures terms (parts & horizon)            ├─► Views payment reliability
            ├─► AI analyzes invoice & customer history        ├─► Generates AI plans
            ├─► Submits proposed milestone plan               │
            │                  │                              │
            │                  ▼                              ▼
            │     ┌──────────────────────────────────────────────┐
            │     │          Approval Workflow & Review          │
            │     │    Business Owner: [Approve] [Edit] [Reject] │
            │     └──────────────────────┬───────────────────────┘
            │                            │
            ▼                            ▼
   Active Plan Activated        Agreements Ledger Updated
            │                            │
            ▼                            ▼
   PayPal Sandbox Checkout      Real-Time Balance Decrement
   (Smart Buttons per part) ──► (Fully Paid → Invoice Marked PAID)
```

1. **Business Owner SmartSettle Dashboard**:
   - Audits all invoices eligible for negotiation with customer credit history.
   - Reviews pending negotiation proposals submitted by customers.
   - Generates AI-recommended plans with suitability scores and risk analysis.
   - Approves, edits, or declines proposed arrangements.
   - Tracks active agreements, milestone schedules, remaining balances, and recovered capital.

2. **Customer Negotiation Portal** (`/negotiate/:id`):
   - Secure customer-facing portal requiring no business login.
   - Customer configures desired installments (2, 3, or 4 parts) and extension horizon (15 to 60 days).
   - SmartSettle AI structures an initial deposit (35%) to demonstrate good faith and distributes remaining balances across bi-weekly milestones.
   - Once approved by the business, customer can remit each installment directly via PayPal Sandbox Smart Buttons.
   - Ledger updates balances automatically; when all installments are settled, the invoice is marked `PAID`.

---

## ✨ Full Feature Matrix

| Category | Capability | Details |
|---|---|---|
| 🤝 **SmartSettle** | AI Payment Negotiator | Installment plan generator, customer portal (`/negotiate/:id`), PayPal milestone checkout |
| 🧠 **Multi-Agent** | 3 Specialized Agents + Orchestrator | Parallel execution, real database queries, unified synthesis |
| ⚡ **Automation** | AI Automation Center | Overdue detection, payment staging, and automatic reconciliation |
| 🛡️ **Security** | Approval Center | Mandatory human-in-the-loop authorization for sensitive operations |
| 📜 **Compliance** | Immutable Audit Log | Timestamped audit records for every detection, approval, and dispatch |
| 🤖 **AI Assistant** | Natural Language Agent | 10 financial tools with confirmation guards |
| 💳 **PayPal Invoicing** | Invoicing API v2 | Create, draft, send, and synchronize invoices |
| 🔐 **PayPal Orders** | Orders API v2 | Create orders, serve Smart Buttons, and server-side capture verification |
| 📊 **Analytics** | Real-time Financial KPIs | Revenue velocity, aging distribution, and debtor reliability index |
| 👤 **Demo Ready** | 1-Click Sandbox Login | Instant pre-seeded business account (Alex Morgan) |
| 🗄️ **Zero-Config DB** | SQLite + Prisma ORM | Instant local setup, migration-free |

---

## 🏗️ System Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│                        PAYPILOT SYSTEM                             │
│                                                                    │
│  ┌─────────────────────────┐    ┌──────────────────────────────┐  │
│  │   REACT CLIENT (5173)   │    │   CUSTOMER CHECKOUT & PORTAL │  │
│  │  Multi-Agent Workspace  │    │   /pay/:id (Checkout)        │  │
│  │  AI Automation Center   │    │   /negotiate/:id (SmartSettle│  │
│  │  SmartSettle Dashboard  │    │   PayPal Smart Buttons SDK   │  │
│  │  Approval Center UI     │    └──────────────┬───────────────┘  │
│  └───────────┬─────────────┘                   │                  │
│              │ REST API calls                   │                  │
│  ┌───────────▼──────────────────────────────────▼───────────────┐  │
│  │                EXPRESS SERVER (5001)                          │  │
│  │  ┌──────────────────┐  ┌──────────────────┐  ┌────────────┐  │  │
│  │  │ Multi-Agent      │  │ Automation Center│  │ PayPal SDK │  │  │
│  │  │ • Orchestrator   │  │ • Overdue Workflow│ │ • Orders v2│  │  │
│  │  │ • Finance Agent  │  │ • Payment Flow   │  │ • Invoicev2│  │  │
│  │  │ • Collections Agt│  │ • Reconciliation │  │ • OAuth2   │  │  │
│  │  │ • Risk Agent     │  │ • Approval Queue │  │   Token    │  │  │
│  │  ├──────────────────┤  ├──────────────────┤  └──────┬─────┘  │  │
│  │  │ SmartSettle      │  │ Audit Logger     │         │        │  │
│  │  │ • AI Negotiator  │  │ • Immutable Logs │         │        │  │
│  │  │ • Milestone Flow │  │ • Fraud Guards   │         │        │  │
│  │  └────────┬─────────┘  └────────┬─────────┘         │        │  │
│  │           │                     │                   │        │  │
│  │  ┌────────▼─────────────────────▼───────────────────▼─────┐  │  │
│  │  │                  PRISMA ORM (SQLITE)                   │  │  │
│  │  │  Users • Customers • Invoices • Transactions           │  │  │
│  │  │  SmartSettleAgreements • SmartSettleInstallments       │  │  │
│  │  │  AutomationWorkflows • AuditLogs • AiConversations      │  │  │
│  │  └────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────┬──────────────────────────────┘  │
│                                  │                                 │
│                     ┌────────────▼───────────┐                     │
│                     │ PAYPAL DEVELOPER       │                     │
│                     │ SANDBOX API            │                     │
│                     │ api-m.sandbox.paypal.com                     │
│                     └────────────────────────┘                     │
└────────────────────────────────────────────────────────────────────┘
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js 18+ (tested on Node v24)
- npm 9+

### 1. Clone & Install
```bash
git clone https://github.com/pradeepvijay2k6-ai/PayPilot.git
cd PayPilot
npm install
npm --prefix server install
npm --prefix client install
```

### 2. Configure Environment
```bash
cp server/.env.example server/.env
```

Defaults work immediately for demo mode:
```env
PORT=5001
CLIENT_URL=http://localhost:5173
JWT_SECRET=paypilot_super_secret_jwt_key_2026_hackathon
DATABASE_URL="file:./dev.db"

# Optional: Add your PayPal Sandbox credentials (see below)
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=

# Optional: Add for Gemini AI multi-agent synthesis
GEMINI_API_KEY=
```

### 3. Initialize Database & Seed
```bash
cd server
npx prisma db push
npx tsx prisma/seed.ts
cd ..
```

### 4. Start Development Servers
```bash
# Terminal 1: Backend (Port 5001)
npm run dev:server

# Terminal 2: Frontend (Port 5173)
npm run dev:client
```

**Open [http://localhost:5173](http://localhost:5173)** → Click **"1-Click Hackathon Demo Login"**.

---

## 🎯 7 Hackathon Demonstration Scenarios

Run the automated test suite anytime to verify all 7 scenarios end-to-end:
```bash
./test_scenarios.sh
```

### Scenario 1: AI Natural Language Invoice Creation
- Navigate to **AI Financial Agent**
- Prompt: *"Create an invoice for Sarah for $750 for graphic design services, due in 7 days."*
- AI extracts customer, amount, service, due date → returns Confirmation Card → user clicks Confirm → created in DB & synced with PayPal Invoicing API.

### Scenario 2: Payment Request → PayPal Checkout
- Prompt: *"Request $300 from Michael for consulting."*
- Generates `/pay/:id` link → opens customer-facing portal with PayPal Smart Buttons.

### Scenario 3: Monthly Financial Report
- Prompt: *"Generate my monthly financial report."*
- Queries real DB: $10,950 total revenue, +100% growth, $2,400 overdue, top accounts.

### Scenario 4: Overdue Customer Analysis
- Prompt: *"Which customers have overdue payments?"*
- Returns David Miller (2 invoices, $1,550 overdue) & Johnathan Vance (1 invoice, $850).

### Scenario 5: Multi-Agent Financial Intelligence Council
- Navigate to **Multi-Agent Intelligence**
- Prompt: *"My business revenue is declining. Find out why and tell me what I should do."*
- **Finance Agent** analyzes revenue velocity & forecasts 7d/30d cash inflows.
- **Collections Agent** calculates $2,400 overdue across delinquent accounts and sequences debtors.
- **Risk Agent** audits transaction logs and checks for anomalies.
- **Orchestrator** synthesizes findings into an executive diagnosis and prioritized action steps with parallel execution timeline.

### Scenario 6: AI Automation Center & Approval Queue
- Navigate to **AI Automation Center**
- Click **"Scan Financial Events"** → AI detects overdue invoices and queues them in `PENDING_APPROVAL`.
- Review AI Diagnosis and prepared reminder draft.
- Click **"Edit Content"** → adjust reminder text → click **"Save Changes & Authorize Dispatch"**.
- Click **"Stage Payment Request"** → enter $500 for Sarah Jenkins → approve in queue → creates PayPal Order and checkout link.
- Open **"Immutable Audit Log"** tab to inspect the timestamped audit records.

### Scenario 7: SmartSettle AI Payment Negotiator (NEW)
1. Navigate to **SmartSettle** in the sidebar.
2. Select an eligible invoice (e.g. David Miller $950 overdue).
3. Click **"Copy Portal Link"** or click **"Generate AI Plan"**.
4. Configure 3 milestones across 30 days → click **"Calculate AI Plan Proposal"**.
5. SmartSettle AI structures a 35% deposit ($332.50) followed by two bi-weekly installments of $308.75.
6. Stage the plan and click **"Approve & Activate Plan"**.
7. Open `/negotiate/:invoiceId` in your browser as a customer.
8. Customer views approved plan and clicks **"Pay with PayPal Sandbox"** on Milestone #1.
9. Backend captures and verifies payment via PayPal API → updates agreement balance from $950 to $617.50 in real-time!

---

## 📡 REST API Endpoints

### SmartSettle AI Payment Negotiator
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/smartsettle/public/:id` | Public customer negotiation portal data |
| `POST` | `/api/smartsettle/public/propose` | AI plan generator for customer or business |
| `POST` | `/api/smartsettle/public/request` | Submits proposed payment plan for approval |
| `POST` | `/api/smartsettle/public/capture-installment` | PayPal checkout & capture for milestone installment |
| `GET` | `/api/smartsettle/invoices` | Eligible invoices for negotiation (auth required) |
| `GET` | `/api/smartsettle/dashboard` | Active agreements & recovered amounts (auth required) |
| `POST` | `/api/smartsettle/:id/approve` | Business owner authorizes & activates agreement |
| `POST` | `/api/smartsettle/:id/reject` | Business owner declines agreement |

### Multi-Agent Intelligence
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/multi-agent/chat` | Central orchestrator parallel multi-agent audit |
| `GET` | `/api/multi-agent/status` | Real-time status of Finance, Collections, and Risk agents |

### AI Automation Center
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/automation/detect` | Scans DB for overdue invoices & unlinked payments |
| `GET` | `/api/automation/queue` | Fetches approval queue items (`PENDING_APPROVAL`) |
| `POST` | `/api/automation/stage-payment` | Stages payment request awaiting authorization |
| `POST` | `/api/automation/:id/approve` | Authorizes & executes workflow |
| `POST` | `/api/automation/:id/reject` | Declines workflow and logs to audit trail |
| `GET` | `/api/automation/history` | Fetches workflow execution history & audit logs |

---

## 📝 License

MIT License — see [LICENSE](LICENSE) for details. Built for the **Build What's Next with PayPal and AI Global Hackathon 2026**.
