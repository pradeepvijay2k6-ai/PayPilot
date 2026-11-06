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
    <a href="#quick-start">Quick Start</a> •
    <a href="#paypal-setup">PayPal Setup</a> •
    <a href="#architecture">Architecture</a>
  </p>
</div>

---

## 🧠 Problem Statement

Small businesses, freelancers, and entrepreneurs waste enormous time on repetitive financial operations — creating invoices, chasing overdue payments, understanding their revenue, and managing customer accounts. These tasks require navigating multiple tools, logging into PayPal manually, and generating reports by hand.

## 💡 The Solution: PayPilot

PayPilot is an **autonomous AI financial operations agent** that lets business owners manage their entire PayPal financial workflow through natural language and autonomous event-driven workflows.

Instead of clicking through menus or guessing what needs attention:
- **Multiple specialized AI agents** collaborate to audit business health, forecast cash flow, sequence delinquent accounts, and monitor transaction integrity.
- An **autonomous AI Automation Center** continuously detects financial events (overdue invoices, unlinked settlements, pending payments), stages intelligent workflows, and executes real PayPal operations only upon explicit human authorization.

---

## 🌟 TWO STANDOUT INNOVATIONS

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

## ✨ Full Feature Matrix

| Category | Capability | Details |
|---|---|---|
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
│  │   REACT CLIENT (5173)   │    │   CUSTOMER CHECKOUT (/pay/)  │  │
│  │  Multi-Agent Workspace  │    │   PayPal Smart Buttons SDK   │  │
│  │  AI Automation Center   │    │   Real PayPal Sandbox Flow   │  │
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
│  │  └────────┬─────────┘  └────────┬─────────┘  └──────┬─────┘  │  │
│  │           │                     │                   │        │  │
│  │  ┌────────▼─────────────────────▼───────────────────▼─────┐  │  │
│  │  │                  PRISMA ORM (SQLITE)                   │  │  │
│  │  │  Users • Customers • Invoices • Transactions           │  │  │
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

## 🎯 6 Hackathon Demonstration Scenarios

Run the automated test suite anytime to verify all 6 scenarios end-to-end:
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

### Scenario 5: Multi-Agent Financial Intelligence Council (NEW)
- Navigate to **Multi-Agent Intelligence**
- Prompt: *"My business revenue is declining. Find out why and tell me what I should do."*
- **Finance Agent** analyzes revenue velocity & forecasts 7d/30d cash inflows.
- **Collections Agent** calculates $2,400 overdue across delinquent accounts and sequences debtors.
- **Risk Agent** audits transaction logs and checks for anomalies.
- **Orchestrator** synthesizes findings into an executive diagnosis and prioritized action steps with parallel execution timeline.

### Scenario 6: AI Automation Center & Approval Queue (NEW)
- Navigate to **AI Automation Center**
- Click **"Scan Financial Events"** → AI detects 3 overdue invoices and queues them in `PENDING_APPROVAL`.
- Review AI Diagnosis and prepared reminder draft.
- Click **"Edit Content"** → adjust reminder text → click **"Save Changes & Authorize Dispatch"**.
- Click **"Stage Payment Request"** → enter $500 for Sarah Jenkins → approve in queue → creates PayPal Order and checkout link.
- Open **"Immutable Audit Log"** tab to inspect the timestamped audit records.

---

## 💳 PayPal Sandbox Integration

| PayPal Component | Implementation |
|---|---|
| **OAuth 2.0** | Server-side bearer token with automatic in-memory caching |
| **Orders API v2** | `POST /v2/checkout/orders` with server-side capture verification |
| **Invoicing API v2** | `POST /v2/invoicing/invoices` for drafts and direct dispatch |
| **Smart Buttons** | `@paypal/react-paypal-js` on `/pay/:id` customer checkout page |
| **Idempotency** | Prevents duplicate captures by checking existing transaction records |

To use live PayPal Sandbox credentials:
1. Log into [developer.paypal.com](https://developer.paypal.com/dashboard/applications/sandbox).
2. Copy your **Sandbox Client ID** and **Secret**.
3. Add to `server/.env`:
   ```env
   PAYPAL_CLIENT_ID=your_sandbox_client_id
   PAYPAL_CLIENT_SECRET=your_sandbox_secret
   ```
4. Restart server and test connection in the **Settings** page.

---

## 📡 REST API Endpoints

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

### Core Financial APIs
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/demo-login` | 1-Click demo authentication |
| `GET` | `/api/analytics/overview` | KPI dashboard data |
| `POST` | `/api/ai/chat` | Single-agent chat & tool execution |
| `POST` | `/api/payments/create-paypal-order` | Create PayPal order |
| `POST` | `/api/payments/capture-paypal-order` | Capture & reconcile PayPal order |

---

## 🗄️ Database Schema

The SQLite schema uses 12 relational models managed via Prisma:
- `User` & `BusinessProfile`
- `Customer`
- `Invoice` & `InvoiceItem`
- `PaymentRequest`
- `Transaction`
- `AutomationWorkflow` *(NEW)*: Tracks type, approval status, payload, AI reasoning, and execution results
- `AuditLog` *(NEW)*: Permanent ledger of all automated detections, authorizations, and outcomes
- `AiConversation` & `AiMessage`
- `ActivityLog`

---

## 📝 License

MIT License — see [LICENSE](LICENSE) for details. Built for the **Build What's Next with PayPal and AI Global Hackathon 2026**.
