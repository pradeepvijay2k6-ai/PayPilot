# PayPilot – AI-Powered Financial Operations Agent using PayPal

<div align="center">
  <h3>Your Business. Your Money. Your AI Agent.</h3>
  <p>
    <strong>Hackathon Entry:</strong> Build What's Next with PayPal and AI Global Hackathon
  </p>
  <p>
    <a href="http://localhost:5173">Live Demo</a> •
    <a href="#quick-start">Quick Start</a> •
    <a href="#paypal-setup">PayPal Setup</a> •
    <a href="#ai-setup">AI Setup</a> •
    <a href="#architecture">Architecture</a>
  </p>
</div>

---

## 🧠 Problem Statement

Small businesses, freelancers, and entrepreneurs waste enormous time on repetitive financial operations — creating invoices, chasing overdue payments, understanding their revenue, and managing customer accounts. These tasks require navigating multiple tools, logging into PayPal manually, and generating reports by hand.

## 💡 The Solution: PayPilot

PayPilot is an **autonomous AI financial operations agent** that lets business owners manage their entire PayPal financial workflow through natural language. Instead of clicking through menus, users simply talk to their AI:

- *"Create an invoice for Sarah for $750 for graphic design services, due in 7 days."*
- *"Request $300 from Michael for consulting."*
- *"Which customers have overdue payments?"*
- *"Generate my monthly financial report."*

The AI understands these instructions, extracts the relevant data, **executes real PayPal Sandbox API operations**, and returns structured, visually rich results.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🤖 **AI Financial Agent** | Natural language interface that dispatches 10 controlled financial operation tools |
| 💳 **PayPal Invoicing API v2** | Autonomous draft & send real invoices via PayPal Developer Sandbox |
| 🔐 **PayPal Orders API v2** | Create orders, serve PayPal Smart Buttons, and capture payments server-side |
| 🔒 **Explicit Approval Guard** | Mutating financial operations always require user confirmation |
| 📊 **Real-time Analytics** | Revenue velocity charts, overdue debt analysis, customer reliability scoring |
| 🎯 **4 Hackathon Scenarios** | All fully verified with automated test suite — zero mocked data |
| 👤 **1-Click Demo Login** | Instant judge-friendly access to pre-seeded data (Alex Morgan demo account) |
| 📱 **Customer Checkout Portal** | Public `/pay/:id` route with PayPal Smart Buttons for customer payment |
| 🧩 **Multi-Provider AI** | Gemini 1.5 Flash, OpenAI GPT-4, and a built-in Smart NLP financial engine |
| 🗄️ **Zero-Config Database** | SQLite (default) with Prisma ORM — no external DB setup needed |

---

## 🏗️ System Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│                        PAYPILOT SYSTEM                             │
│                                                                    │
│  ┌─────────────────────────┐    ┌──────────────────────────────┐  │
│  │   REACT CLIENT (5173)   │    │   CUSTOMER CHECKOUT (/pay/)  │  │
│  │  TypeScript + Tailwind  │    │   PayPal Smart Buttons SDK   │  │
│  │  Recharts + Framer      │    │   Real PayPal Sandbox Flow   │  │
│  └───────────┬─────────────┘    └──────────────┬───────────────┘  │
│              │ REST API calls                   │                  │
│  ┌───────────▼──────────────────────────────────▼───────────────┐  │
│  │                EXPRESS SERVER (5001)                          │  │
│  │  ┌──────────┐  ┌──────────────┐  ┌──────────────────────┐  │  │
│  │  │  Auth    │  │  REST API    │  │  AI Agent Gateway    │  │  │
│  │  │  JWT     │  │  Customers   │  │  10 Financial Tools  │  │  │
│  │  │  Guards  │  │  Invoices    │  │  Approval Guard      │  │  │
│  │  └──────────┘  │  Transactions│  └──────────┬───────────┘  │  │
│  │               │  Analytics   │             │               │  │
│  │               └──────────────┘             │               │  │
│  │  ┌────────────────────┐  ┌─────────────────▼──────────┐   │  │
│  │  │   PRISMA + SQLITE  │  │   PAYPAL SERVICE           │   │  │
│  │  │  Users, Customers  │  │   OAuth 2.0 Token Cache    │   │  │
│  │  │  Invoices, Items   │  │   Orders API v2 (create +  │   │  │
│  │  │  Transactions      │  │   capture + verify)        │   │  │
│  │  │  AI Conversations  │  │   Invoicing API v2 (draft  │   │  │
│  │  │  Activity Logs     │  │   + send + sync)           │   │  │
│  │  └────────────────────┘  └────────────────────────────┘   │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                │                                   │
│                    ┌───────────▼──────────┐                       │
│                    │  PAYPAL SANDBOX      │                       │
│                    │  api-m.sandbox.paypal│                       │
│                    │  .com                │                       │
│                    └──────────────────────┘                       │
└────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

### Frontend
- **React 18** + **TypeScript** + **Vite 6**
- **Tailwind CSS** — Fintech SaaS design system (Navy/White/Brand Blue)
- **Recharts** — Revenue charts, invoice distribution, customer analytics
- **Lucide React** — Icon system
- **@paypal/react-paypal-js** — PayPal Smart Buttons SDK integration

### Backend
- **Node.js 24** + **Express 4** + **TypeScript**
- **Prisma ORM** — Type-safe database layer
- **SQLite** (zero-config default) → PostgreSQL (production via `DATABASE_URL`)
- **bcryptjs** — Password hashing
- **jsonwebtoken** — JWT authentication

### AI
- **Google Gemini 1.5 Flash** — `@google/generative-ai`
- **OpenAI GPT-4** — `openai` SDK (optional fallback)
- **Built-in Smart Financial NLP Engine** — Pattern-based intent routing (zero API key dependency for demos)

### PayPal
- **PayPal Orders API v2** — Order creation, approval, and backend capture
- **PayPal Invoicing API v2** — Draft, send, and sync invoices
- **PayPal OAuth 2.0** — Server-side token management (never exposed to frontend)
- **PayPal JavaScript SDK** — Customer-facing Smart Checkout Buttons

---

## ⚡ Quick Start

### Prerequisites
- Node.js 18+ (tested on v24)
- npm 9+

### 1. Clone & Install
```bash
git clone https://github.com/yourusername/paypilot.git
cd paypilot
npm install                    # Install root dependencies
npm --prefix server install    # Install server dependencies
npm --prefix client install    # Install client dependencies
```

### 2. Configure Environment
```bash
cp server/.env.example server/.env
```

Edit `server/.env` — the defaults work immediately for demo mode:
```env
PORT=5001
CLIENT_URL=http://localhost:5173
JWT_SECRET=your_jwt_secret_here
DATABASE_URL="file:./dev.db"

# Add your PayPal Sandbox credentials (see PayPal Setup below)
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=

# Optional: Add for Gemini AI enhanced reasoning
GEMINI_API_KEY=
```

### 3. Initialize Database & Seed Demo Data
```bash
cd server
npx prisma db push          # Create SQLite schema
npx tsx prisma/seed.ts      # Seed 5 customers, 10 invoices, 4 transactions
cd ..
```

### 4. Start Development Servers
```bash
# Terminal 1: Start Backend (port 5001)
npm run dev:server

# Terminal 2: Start Frontend (port 5173)
npm run dev:client
```

**→ Open [http://localhost:5173](http://localhost:5173)**

Click **"1-Click Hackathon Demo Login"** to instantly explore with Alex Morgan's pre-seeded business account.

---

## 💳 PayPal Sandbox Setup

1. Log into [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/applications/sandbox)
2. Click **"Create App"** under Sandbox
3. Name it `PayPilot-Hackathon`
4. Copy your **Client ID** and **Secret**
5. Add them to `server/.env`:
   ```env
   PAYPAL_CLIENT_ID=AaXxxxxYourSandboxClientIDHere
   PAYPAL_CLIENT_SECRET=ExxxxYourSandboxSecretHere
   ```
6. In the app Settings page → Click **"Test Sandbox Connection"** to verify

### Create Sandbox Personal Account (for buyer checkout testing)
1. In PayPal Developer Dashboard → Sandbox → Accounts
2. Create a **Personal** account (this is the "customer" who will pay)
3. Use those credentials to log in at the PayPal checkout when testing `/pay/:id`

---

## 🤖 AI Setup

The app works **without any AI API keys** using the built-in Smart Financial NLP Engine. All 4 hackathon scenarios are fully functional.

**To enable advanced Gemini reasoning:**
```env
GEMINI_API_KEY=AIzaSy_your_gemini_key_here
```

**To enable OpenAI GPT-4:**
```env
OPENAI_API_KEY=sk-your_openai_key_here
```

---

## 🎯 The 4 Core Hackathon Scenarios (All Verified ✅)

### Scenario 1: AI Invoice Creation
```
User: "Create an invoice for Sarah for $750 for graphic design services, due in 7 days."
↓ AI extracts: customer=Sarah, amount=$750, service=graphic design, due=7 days
↓ AI returns: Confirmation Card with invoice preview
↓ User clicks: "Confirm & Generate Invoice"
↓ System: Creates invoice in DB + calls PayPal Invoicing API v2
↓ Result: Invoice ID, PayPal reference, status shown
```

### Scenario 2: Payment Request → Customer Checkout
```
User: "Request $300 from Michael for consulting."
↓ AI creates: Payment request + PayPal Order via Orders API v2
↓ System: Returns public checkout URL /pay/:id
↓ Customer: Opens checkout page with PayPal Smart Buttons
↓ Customer: Pays via PayPal Sandbox account
↓ Backend: Captures order, verifies server-side, marks COMPLETED
↓ Dashboard: Transaction appears in Transactions page
```

### Scenario 3: Monthly Financial Report
```
User: "Generate my monthly financial report."
↓ AI queries: analyticsService.generateFinancialReport()
↓ Computed: Total revenue $10,950 | Growth +100% | Overdue $2,400
↓ Top payers: Elena Rostova ($6,300), Michael Chen ($3,400), Sarah Jenkins ($1,250)
↓ Result: Structured report card with observations in AI chat
```

### Scenario 4: Overdue Customer Analysis
```
User: "Which customers have overdue payments?"
↓ AI runs: toolIdentifyOverdueCustomers()
↓ Finds: David Miller (2 invoices, $1,550, avg 15 days late)
↓ Finds: Johnathan Vance (1 invoice, $850, 11 days late)
↓ Result: Structured table with days overdue, amounts, reliability score
```

---

## 🗂️ Project Structure

```
paypilot/
├── package.json              # Root monorepo scripts
├── .env.example              # Environment template
├── README.md                 # This file
├── test_scenarios.sh         # Automated verification script
│
├── server/                   # Node.js + Express + TypeScript + Prisma
│   ├── prisma/
│   │   ├── schema.prisma     # 10-table relational schema
│   │   └── seed.ts           # Demo data seeder (5 customers, 10 invoices)
│   └── src/
│       ├── index.ts          # Express server entry
│       ├── config/           # Environment & PayPal config
│       ├── controllers/      # Auth, Customers, Invoices, Transactions, AI, Payments, Analytics, Settings
│       ├── routes/           # REST API route definitions
│       ├── services/
│       │   ├── paypal.service.ts    # OAuth + Orders API v2 + Invoicing API v2
│       │   ├── ai.service.ts        # AI Agent with 10 financial tools
│       │   └── analytics.service.ts # DB-computed financial metrics
│       └── middlewares/      # Auth guards
│
└── client/                   # React + Vite + TypeScript + Tailwind
    └── src/
        ├── pages/            # 8 dashboard pages + login + public checkout
        ├── components/
        │   ├── layout/       # Sidebar, Header, FloatingAiWidget
        │   ├── ai/           # AiChatView, ActionConfirmationCard
        │   ├── invoices/     # CreateInvoiceModal, InvoicePreviewModal
        │   ├── customers/    # AddCustomerModal
        │   └── payments/     # CreatePaymentRequestModal
        ├── api/              # Axios client with JWT interceptor
        └── types/            # Shared TypeScript interfaces
```

---

## 🔐 Security Architecture

- ✅ PayPal `Client Secret` stored only in `server/.env` — never sent to client
- ✅ PayPal OAuth tokens cached server-side with expiry management
- ✅ Payment capture always verified server-side before marking COMPLETED
- ✅ Idempotency guard: duplicate capture attempts are safely rejected
- ✅ AI tools execute only through validated, typed backend handler functions
- ✅ AI cannot execute arbitrary SQL, code, or access credentials
- ✅ All destructive financial operations (invoice send, payment capture) require explicit user approval
- ✅ Row-level data isolation: every query filters by authenticated `userId`
- ✅ JWT authentication on all protected routes

---

## 🌐 PayPal Integration Summary

| PayPal API | Implementation |
|---|---|
| **OAuth 2.0** | `POST /v1/oauth2/token` — Server-side token with auto-refresh |
| **Orders API v2** | Create, retrieve, and **capture** orders with backend verification |
| **Invoicing API v2** | Draft, send, retrieve, and sync invoice status |
| **JavaScript SDK** | `@paypal/react-paypal-js` Smart Buttons on customer checkout |
| **Webhook-ready** | Capture endpoint architecture ready for PayPal webhook payloads |

---

## 📡 REST API Endpoints

| Route | Description |
|---|---|
| `POST /api/auth/demo-login` | 1-Click demo login |
| `POST /api/auth/login` | JWT authentication |
| `GET /api/analytics/overview` | Financial KPI dashboard data |
| `GET /api/analytics/insights` | AI-generated business insights |
| `POST /api/ai/chat` | AI agent message dispatch |
| `POST /api/ai/confirm-action` | Confirm pending financial action |
| `GET /api/invoices` | Invoice list with filters |
| `POST /api/invoices/:id/send` | Send via PayPal Invoicing API |
| `GET /api/payments/public/:type/:id` | Public checkout data |
| `POST /api/payments/create-paypal-order` | Create PayPal Order |
| `POST /api/payments/capture-paypal-order` | Capture & verify payment |
| `POST /api/settings/test-paypal` | Live PayPal connection test |
| `POST /api/settings/reset-demo` | Reset demo dataset |

---

## 🗄️ Database Schema

The application uses a fully normalized relational schema with 10 tables:

`User` → `BusinessProfile`  
`User` → `Customer[]` → `Invoice[]` → `InvoiceItem[]`  
`User` → `Transaction[]`  
`User` → `PaymentRequest[]`  
`User` → `AiConversation[]` → `AiMessage[]`  
`User` → `ActivityLog[]`

All tables enforce foreign key constraints with `onDelete: Cascade` for referential integrity.

---

## 🚀 Deployment

### Backend (Render / Railway)
```bash
# Build server
npm --prefix server run build

# Start command
node server/dist/index.js

# Environment variables to set:
PORT=5001
DATABASE_URL=postgresql://...  # Switch to PostgreSQL for production
JWT_SECRET=<strong-random-secret>
PAYPAL_CLIENT_ID=<sandbox-or-live>
PAYPAL_CLIENT_SECRET=<sandbox-or-live>
GEMINI_API_KEY=<optional>
```

### Frontend (Vercel / Netlify)
```bash
# Build client
npm --prefix client run build

# Publish directory: client/dist
# Environment variables:
VITE_API_URL=https://your-backend.render.com/api
```

---

## 🌱 Demo Data

The seeder creates a realistic business dataset:

| Item | Count |
|---|---|
| Customers | 5 (Sarah Jenkins, Michael Chen, Johnathan Vance, Elena Rostova, David Miller) |
| Invoices | 10 (PAID: 4, OVERDUE: 3, SENT: 1, UNPAID: 1, DRAFT: 1) |
| Transactions | 4 verified (Sarah $1,250, Michael $3,400, Elena $4,200 + $2,100 = $10,950 total) |
| Payment Requests | 2 pending |
| AI Conversation | Pre-seeded with welcome message |

**Reset demo data at any time:**
```bash
npm run seed
```
Or click **"Reset Demo Data"** in the dashboard header.

---

## 🔮 Future Improvements

- [ ] Real PayPal Webhooks for automatic payment status updates
- [ ] Recurring invoice scheduling
- [ ] Multi-currency support with live FX rates
- [ ] Email dispatch via SendGrid with PayPal payment links embedded
- [ ] Advanced AI memory and multi-turn context for financial conversations
- [ ] Mobile app (React Native + same backend APIs)
- [ ] Tax calculation integration (TaxJar / Avalara)
- [ ] QuickBooks / Xero accounting synchronization

---

## 📝 License

MIT License — See [LICENSE](LICENSE) for details.

---

## 👨‍💻 Authors

Built for the **Build What's Next with PayPal and AI Global Hackathon 2026**.

---

> *PayPilot demonstrates how AI agents can meaningfully interact with PayPal's Developer Platform to automate real-world financial workflows — from natural language invoice creation to server-verified payment capture.*
