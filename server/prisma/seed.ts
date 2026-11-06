import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting PayPilot demo database seeding...');

  // Clean existing data for clean demo resets
  await prisma.activityLog.deleteMany();
  await prisma.aiMessage.deleteMany();
  await prisma.aiConversation.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.paymentRequest.deleteMany();
  await prisma.invoiceItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.businessProfile.deleteMany();
  await prisma.user.deleteMany();

  // 1. Create Demo User
  const passwordHash = await bcrypt.hash('demopassword123', 10);
  const demoUser = await prisma.user.create({
    data: {
      email: 'demo@paypilot.finance',
      passwordHash,
      name: 'Alex Morgan',
      role: 'ADMIN',
      businessProfile: {
        create: {
          businessName: 'Nexus Cloud & Creative Solutions',
          email: 'billing@nexuscloud.io',
          phone: '+1 (415) 890-1200',
          address: '500 Howard Street, Suite 400, San Francisco, CA 94105',
          currency: 'USD',
          taxId: 'US-94-3829104',
          aiProvider: 'auto'
        }
      }
    }
  });

  console.log(`👤 Created Demo User: ${demoUser.email} (password: demopassword123)`);

  // 2. Create 5 Realistic Customers
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        userId: demoUser.id,
        name: 'Sarah Jenkins',
        email: 'sarah.j@acmedesign.co',
        company: 'Acme Design Studio',
        phone: '+1 (555) 234-5678',
        address: '102 Market St, New York, NY 10001',
        notes: 'Reliable client, usually pays within 3 days of invoice issue.'
      }
    }),
    prisma.customer.create({
      data: {
        userId: demoUser.id,
        name: 'Michael Chen',
        email: 'mchen@apexconsulting.com',
        company: 'Apex Strategic Consulting',
        phone: '+1 (555) 876-5432',
        address: '450 North Michigan Ave, Chicago, IL 60611',
        notes: 'Enterprise contract client. Requires PO numbers on invoices.'
      }
    }),
    prisma.customer.create({
      data: {
        userId: demoUser.id,
        name: 'Johnathan Vance',
        email: 'jvance@novamedia.org',
        company: 'Nova Digital Media',
        phone: '+1 (555) 345-6789',
        address: '780 Broadway, Seattle, WA 98102',
        notes: 'Frequent payment delays (average 14 days overdue). Needs follow-up reminders.'
      }
    }),
    prisma.customer.create({
      data: {
        userId: demoUser.id,
        name: 'Elena Rostova',
        email: 'elena@brighttech.io',
        company: 'Bright Horizon Tech',
        phone: '+1 (555) 987-6543',
        address: '1200 Austin Blvd, Austin, TX 78701',
        notes: 'Top tier recurring client with fast turnaround.'
      }
    }),
    prisma.customer.create({
      data: {
        userId: demoUser.id,
        name: 'David Miller',
        email: 'david@vortexlogistics.net',
        company: 'Vortex Global Logistics',
        phone: '+1 (555) 456-7890',
        address: '3300 Industrial Pkwy, Denver, CO 80216',
        notes: 'Chronic delayed payer. Has multiple outstanding invoices.'
      }
    })
  ]);

  const [sarah, michael, johnathan, elena, david] = customers;
  console.log(`🏢 Created ${customers.length} realistic customers.`);

  // Helpers for realistic dates
  const now = new Date();
  const daysAgo = (d: number) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000);
  const daysAhead = (d: number) => new Date(now.getTime() + d * 24 * 60 * 60 * 1000);

  // 3. Create Sample Invoices & Items
  // Invoice 1: Sarah - PAID ($1,250)
  const inv1 = await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2026-001',
      userId: demoUser.id,
      customerId: sarah.id,
      status: 'PAID',
      issueDate: daysAgo(28),
      dueDate: daysAgo(14),
      currency: 'USD',
      subtotal: 1250,
      tax: 0,
      total: 1250,
      notes: 'Thank you for your business!',
      paypalInvoiceId: 'INV2-DEMO-001-SARAH',
      items: {
        create: [
          { description: 'Design System & UI Component Library', quantity: 1, unitPrice: 1000, amount: 1000 },
          { description: 'Interactive Prototype & User Flow', quantity: 1, unitPrice: 250, amount: 250 }
        ]
      }
    }
  });

  // Invoice 2: Michael - PAID ($3,400)
  const inv2 = await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2026-002',
      userId: demoUser.id,
      customerId: michael.id,
      status: 'PAID',
      issueDate: daysAgo(25),
      dueDate: daysAgo(10),
      currency: 'USD',
      subtotal: 3400,
      tax: 0,
      total: 3400,
      notes: 'Quarterly Strategic Advisory Phase 1',
      paypalInvoiceId: 'INV2-DEMO-002-MICHAEL',
      items: {
        create: [
          { description: 'Financial Operations Architecture Assessment', quantity: 1, unitPrice: 2000, amount: 2000 },
          { description: 'Executive Strategy Sprint (20 hrs)', quantity: 20, unitPrice: 70, amount: 1400 }
        ]
      }
    }
  });

  // Invoice 3: Johnathan - OVERDUE ($850)
  const inv3 = await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2026-003',
      userId: demoUser.id,
      customerId: johnathan.id,
      status: 'OVERDUE',
      issueDate: daysAgo(25),
      dueDate: daysAgo(11), // 11 days overdue
      currency: 'USD',
      subtotal: 850,
      tax: 0,
      total: 850,
      notes: 'Payment overdue. Please remit via PayPal immediately.',
      paypalInvoiceId: 'INV2-DEMO-003-JOHN',
      items: {
        create: [
          { description: 'SEO & Content Growth Campaign (Q1)', quantity: 1, unitPrice: 850, amount: 850 }
        ]
      }
    }
  });

  // Invoice 4: Elena - PAID ($4,200)
  const inv4 = await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2026-004',
      userId: demoUser.id,
      customerId: elena.id,
      status: 'PAID',
      issueDate: daysAgo(18),
      dueDate: daysAgo(4),
      currency: 'USD',
      subtotal: 4200,
      tax: 0,
      total: 4200,
      notes: 'Cloud Infrastructure Milestone 2',
      paypalInvoiceId: 'INV2-DEMO-004-ELENA',
      items: {
        create: [
          { description: 'Kubernetes Multi-Region Cluster Architecture', quantity: 1, unitPrice: 3000, amount: 3000 },
          { description: 'Automated Disaster Recovery Testing', quantity: 1, unitPrice: 1200, amount: 1200 }
        ]
      }
    }
  });

  // Invoice 5: David - OVERDUE ($600)
  const inv5 = await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2026-005',
      userId: demoUser.id,
      customerId: david.id,
      status: 'OVERDUE',
      issueDate: daysAgo(22),
      dueDate: daysAgo(8), // 8 days overdue
      currency: 'USD',
      subtotal: 600,
      tax: 0,
      total: 600,
      notes: 'Second reminder sent.',
      paypalInvoiceId: 'INV2-DEMO-005-DAVID',
      items: {
        create: [
          { description: 'REST API & Webhooks Integration', quantity: 1, unitPrice: 600, amount: 600 }
        ]
      }
    }
  });

  // Invoice 6: Sarah - SENT ($750)
  const inv6 = await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2026-006',
      userId: demoUser.id,
      customerId: sarah.id,
      status: 'SENT',
      issueDate: daysAgo(3),
      dueDate: daysAhead(4),
      currency: 'USD',
      subtotal: 750,
      tax: 0,
      total: 750,
      notes: 'Mobile iOS design specs deliverables.',
      paypalInvoiceId: 'INV2-DEMO-006-SARAH',
      items: {
        create: [
          { description: 'Mobile App Wireframes & Figma Prototype', quantity: 1, unitPrice: 750, amount: 750 }
        ]
      }
    }
  });

  // Invoice 7: Michael - UNPAID ($1,800)
  const inv7 = await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2026-007',
      userId: demoUser.id,
      customerId: michael.id,
      status: 'UNPAID',
      issueDate: daysAgo(2),
      dueDate: daysAhead(12),
      currency: 'USD',
      subtotal: 1800,
      tax: 0,
      total: 1800,
      notes: 'Process automation workflow.',
      paypalInvoiceId: 'INV2-DEMO-007-MICHAEL',
      items: {
        create: [
          { description: 'Business Operations Automation Pipeline', quantity: 1, unitPrice: 1800, amount: 1800 }
        ]
      }
    }
  });

  // Invoice 8: Johnathan - DRAFT ($500)
  const inv8 = await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2026-008',
      userId: demoUser.id,
      customerId: johnathan.id,
      status: 'DRAFT',
      issueDate: daysAgo(1),
      dueDate: daysAhead(7),
      currency: 'USD',
      subtotal: 500,
      tax: 0,
      total: 500,
      notes: 'Draft awaiting final review before dispatch.',
      items: {
        create: [
          { description: 'Social Media Campaign Assets & Motion Graphic', quantity: 1, unitPrice: 500, amount: 500 }
        ]
      }
    }
  });

  // Invoice 9: Elena - PAID ($2,100)
  const inv9 = await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2026-009',
      userId: demoUser.id,
      customerId: elena.id,
      status: 'PAID',
      issueDate: daysAgo(12),
      dueDate: daysAgo(2),
      currency: 'USD',
      subtotal: 2100,
      tax: 0,
      total: 2100,
      notes: 'CI/CD Pipeline Complete',
      paypalInvoiceId: 'INV2-DEMO-009-ELENA',
      items: {
        create: [
          { description: 'GitHub Actions & Security Scanning Pipeline', quantity: 1, unitPrice: 2100, amount: 2100 }
        ]
      }
    }
  });

  // Invoice 10: David - OVERDUE ($950)
  const inv10 = await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2026-010',
      userId: demoUser.id,
      customerId: david.id,
      status: 'OVERDUE',
      issueDate: daysAgo(35),
      dueDate: daysAgo(21), // 21 days overdue
      currency: 'USD',
      subtotal: 950,
      tax: 0,
      total: 950,
      notes: 'Final demand notice.',
      paypalInvoiceId: 'INV2-DEMO-010-DAVID',
      items: {
        create: [
          { description: 'Logistics Fleet Tracking Module', quantity: 1, unitPrice: 950, amount: 950 }
        ]
      }
    }
  });

  console.log('📄 Created 10 sample invoices across Draft, Sent, Paid, and Overdue statuses.');

  // 4. Create Transactions for Paid Invoices
  await prisma.transaction.create({
    data: {
      userId: demoUser.id,
      customerId: sarah.id,
      invoiceId: inv1.id,
      paypalOrderId: '5O190127TN364715T',
      paypalCaptureId: '6W839210KJ482910V',
      amount: 1250,
      currency: 'USD',
      status: 'COMPLETED',
      paymentMethod: 'PAYPAL',
      payerEmail: 'sarah.j@acmedesign.co',
      payerName: 'Sarah Jenkins',
      transactionDate: daysAgo(14),
      rawResponseJson: JSON.stringify({ status: 'COMPLETED', seller_receivable_breakdown: { gross_amount: { value: '1250.00' }, paypal_fee: { value: '43.75' }, net_amount: { value: '1206.25' } } })
    }
  });

  await prisma.transaction.create({
    data: {
      userId: demoUser.id,
      customerId: michael.id,
      invoiceId: inv2.id,
      paypalOrderId: '2F781940KL827103M',
      paypalCaptureId: '9A482910KP827104Q',
      amount: 3400,
      currency: 'USD',
      status: 'COMPLETED',
      paymentMethod: 'PAYPAL',
      payerEmail: 'mchen@apexconsulting.com',
      payerName: 'Michael Chen',
      transactionDate: daysAgo(10),
      rawResponseJson: JSON.stringify({ status: 'COMPLETED', seller_receivable_breakdown: { gross_amount: { value: '3400.00' }, paypal_fee: { value: '119.00' }, net_amount: { value: '3281.00' } } })
    }
  });

  await prisma.transaction.create({
    data: {
      userId: demoUser.id,
      customerId: elena.id,
      invoiceId: inv4.id,
      paypalOrderId: '8M491027VB938471K',
      paypalCaptureId: '4L918273TY564738B',
      amount: 4200,
      currency: 'USD',
      status: 'COMPLETED',
      paymentMethod: 'PAYPAL',
      payerEmail: 'elena@brighttech.io',
      payerName: 'Elena Rostova',
      transactionDate: daysAgo(4),
      rawResponseJson: JSON.stringify({ status: 'COMPLETED', seller_receivable_breakdown: { gross_amount: { value: '4200.00' }, paypal_fee: { value: '147.00' }, net_amount: { value: '4053.00' } } })
    }
  });

  await prisma.transaction.create({
    data: {
      userId: demoUser.id,
      customerId: elena.id,
      invoiceId: inv9.id,
      paypalOrderId: '3K928174PL102938H',
      paypalCaptureId: '7R291837BN482910J',
      amount: 2100,
      currency: 'USD',
      status: 'COMPLETED',
      paymentMethod: 'PAYPAL',
      payerEmail: 'elena@brighttech.io',
      payerName: 'Elena Rostova',
      transactionDate: daysAgo(2),
      rawResponseJson: JSON.stringify({ status: 'COMPLETED', seller_receivable_breakdown: { gross_amount: { value: '2100.00' }, paypal_fee: { value: '73.50' }, net_amount: { value: '2026.50' } } })
    }
  });

  console.log('💳 Created 4 verified completed PayPal transactions ($10,950 total revenue).');

  // 5. Create Payment Requests (Scenario 2 ready)
  const pr1 = await prisma.paymentRequest.create({
    data: {
      userId: demoUser.id,
      customerId: michael.id,
      amount: 300,
      currency: 'USD',
      description: 'Consulting retainer sprint session (1 hr)',
      status: 'PENDING',
      paypalOrderId: 'DEMO-ORDER-MICHAEL-300'
    }
  });

  const pr2 = await prisma.paymentRequest.create({
    data: {
      userId: demoUser.id,
      customerId: sarah.id,
      amount: 250,
      currency: 'USD',
      description: 'Expedited design revision fee',
      status: 'PENDING',
      paypalOrderId: 'DEMO-ORDER-SARAH-250'
    }
  });

  console.log(`🔗 Created sample payment requests (${pr1.id}, ${pr2.id}) for instant test checkout.`);

  // 6. Create Initial AI Conversation with Welcome Message
  const conversation = await prisma.aiConversation.create({
    data: {
      userId: demoUser.id,
      title: 'Financial Operations Assistant',
      messages: {
        create: [
          {
            role: 'assistant',
            content: `Hello Alex! I am **PayPilot**, your AI Financial Operations Agent powered by PayPal. 

I'm ready to manage your business operations directly through natural conversation. Here are a few things you can ask me:

- **Create Invoices**: *"Create an invoice for Sarah for $750 for graphic design services, due in 7 days."*
- **Request Payments**: *"Request $300 from Michael for consulting."*
- **Track Overdue Bills**: *"Which customers have overdue payments?"*
- **Financial Analytics**: *"Generate my monthly financial report."* or *"Show me my revenue for the last 30 days."*
- **Debtor Analysis**: *"Which customers frequently delay payments?"*

How can I help power your business today?`
          }
        ]
      }
    }
  });

  // 7. Activity Log
  await prisma.activityLog.create({
    data: {
      userId: demoUser.id,
      action: 'DATABASE_SEEDED',
      entityType: 'SYSTEM',
      detailsJson: JSON.stringify({ message: 'PayPilot demo environment successfully populated.' })
    }
  });

  console.log('✨ Demo database seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
