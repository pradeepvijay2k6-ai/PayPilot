import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma';
import { config } from '../config';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name, businessName } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        businessProfile: {
          create: {
            businessName: businessName || `${name}'s Business`,
            email
          }
        }
      },
      include: { businessProfile: true }
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        businessProfile: user.businessProfile
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { businessProfile: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        businessProfile: user.businessProfile
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const demoLogin = async (_req: Request, res: Response) => {
  try {
    let demoUser = await prisma.user.findFirst({
      where: { email: 'demo@paypilot.finance' },
      include: { businessProfile: true }
    });

    if (!demoUser) {
      return res.status(404).json({ error: 'Demo user not seeded. Please run database seed.' });
    }

    const token = jwt.sign(
      { id: demoUser.id, email: demoUser.email, role: demoUser.role },
      config.jwtSecret,
      { expiresIn: '30d' }
    );

    res.json({
      token,
      user: {
        id: demoUser.id,
        email: demoUser.email,
        name: demoUser.name,
        role: demoUser.role,
        businessProfile: demoUser.businessProfile
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { businessProfile: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        businessProfile: user.businessProfile
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
