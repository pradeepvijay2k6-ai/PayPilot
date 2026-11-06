import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { config } from './config';
import authRoutes from './routes/auth.routes';
import customersRoutes from './routes/customers.routes';
import invoicesRoutes from './routes/invoices.routes';
import transactionsRoutes from './routes/transactions.routes';
import paymentsRoutes from './routes/payments.routes';
import analyticsRoutes from './routes/analytics.routes';
import aiRoutes from './routes/ai.routes';
import settingsRoutes from './routes/settings.routes';

const app = express();

// Middlewares
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// Request logger for debugging
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    app: 'PayPilot Server',
    version: '1.0.0',
    paypalMode: config.paypal.mode,
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customersRoutes);
app.use('/api/invoices', invoicesRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/settings', settingsRoutes);

// Global error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Server Uncaught Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

const PORT = config.port;
app.listen(PORT, () => {
  console.log(`🚀 PayPilot API server running at http://localhost:${PORT}`);
  console.log(`💳 PayPal Mode: ${config.paypal.mode.toUpperCase()}`);
  console.log(`🤖 AI Engine: ${config.ai.geminiApiKey ? 'Gemini 1.5' : (config.ai.openaiApiKey ? 'OpenAI GPT-4' : 'PayPilot Built-in Financial NLP')}`);
});
