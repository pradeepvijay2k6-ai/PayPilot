import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { prisma } from '../prisma';
import { paypalService } from '../services/paypal.service';
import { config } from '../config';
import { exec } from 'child_process';
import path from 'path';

export const getSettings = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { businessProfile: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const bp = user.businessProfile;
    const activeClientId = bp?.paypalClientId || config.paypal.clientId;
    const isConfigured = paypalService.isConfigured({
      clientId: activeClientId,
      clientSecret: bp?.paypalClientSecret || config.paypal.clientSecret
    });

    // Mask Client ID for safe UI display (never expose secret)
    const maskedClientId = activeClientId && activeClientId.length > 8
      ? `${activeClientId.substring(0, 6)}...${activeClientId.substring(activeClientId.length - 4)}`
      : (activeClientId || '');

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      business: {
        businessName: bp?.businessName || '',
        email: bp?.email || '',
        phone: bp?.phone || '',
        address: bp?.address || '',
        currency: bp?.currency || 'USD',
        taxId: bp?.taxId || '',
        aiProvider: bp?.aiProvider || 'auto'
      },
      paypal: {
        mode: config.paypal.mode,
        isConfigured,
        maskedClientId,
        hasClientSecret: Boolean(bp?.paypalClientSecret || config.paypal.clientSecret)
      },
      ai: {
        hasGeminiKey: Boolean(config.ai.geminiApiKey),
        hasOpenAiKey: Boolean(config.ai.openaiApiKey),
        activeEngine: config.ai.geminiApiKey ? 'Gemini 1.5' : (config.ai.openaiApiKey ? 'OpenAI GPT-4' : 'PayPilot Smart Financial NLP (Built-in)')
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateSettings = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { businessName, email, phone, address, currency, taxId, paypalClientId, paypalClientSecret, aiProvider } = req.body;

    const dataToUpdate: any = {};
    if (businessName !== undefined) dataToUpdate.businessName = businessName;
    if (email !== undefined) dataToUpdate.email = email;
    if (phone !== undefined) dataToUpdate.phone = phone;
    if (address !== undefined) dataToUpdate.address = address;
    if (currency !== undefined) dataToUpdate.currency = currency;
    if (taxId !== undefined) dataToUpdate.taxId = taxId;
    if (aiProvider !== undefined) dataToUpdate.aiProvider = aiProvider;
    if (paypalClientId !== undefined) dataToUpdate.paypalClientId = paypalClientId;
    if (paypalClientSecret) dataToUpdate.paypalClientSecret = paypalClientSecret;

    const updated = await prisma.businessProfile.upsert({
      where: { userId },
      update: dataToUpdate,
      create: {
        userId,
        businessName: businessName || 'My Business',
        email: email || req.user!.email,
        ...dataToUpdate
      }
    });

    res.json({ message: 'Settings successfully updated', businessProfile: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const testPayPalConnection = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { businessProfile: true }
    });

    const customCreds = {
      clientId: user?.businessProfile?.paypalClientId || undefined,
      clientSecret: user?.businessProfile?.paypalClientSecret || undefined
    };

    const result = await paypalService.testConnection(customCreds);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ connected: false, message: err.message });
  }
};

export const resetDemoData = async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const seedPath = path.resolve(__dirname, '../../prisma/seed.ts');
    exec(`npx tsx "${seedPath}"`, (error, stdout, stderr) => {
      if (error) {
        console.error('Reset seed error:', error, stderr);
        return res.status(500).json({ error: 'Failed to reset demo data' });
      }
      res.json({ message: 'Demo database successfully refreshed with sample records!' });
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
