import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import prisma from '../lib/prisma.js';
import { signToken, authenticate, requireRole } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Email ou password incorretos' });
    }

    const token = signToken({ userId: user.id, email: user.email, role: user.role });

    res.json({
      token,
      user: { id: user.id, nome: user.nome, email: user.email, role: user.role },
    });
  })
);

router.get(
  '/me',
  authenticate,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { id: true, nome: true, email: true, role: true },
    });
    if (!user) return res.status(404).json({ error: 'Utilizador não encontrado' });
    res.json(user);
  })
);

router.get(
  '/users',
  authenticate,
  requireRole('ADMIN'),
  asyncHandler(async (_req, res) => {
    const users = await prisma.user.findMany({
      select: { id: true, nome: true, email: true, role: true, createdAt: true },
      orderBy: { nome: 'asc' },
    });
    res.json(users);
  })
);

const userSchema = z.object({
  nome: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['ADMIN', 'GESTOR']),
});

router.post(
  '/users',
  authenticate,
  requireRole('ADMIN'),
  asyncHandler(async (req, res) => {
    const data = userSchema.parse(req.body);
    const hashed = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: { ...data, password: hashed },
      select: { id: true, nome: true, email: true, role: true },
    });

    res.status(201).json(user);
  })
);

router.delete(
  '/users/:id',
  authenticate,
  requireRole('ADMIN'),
  asyncHandler(async (req, res) => {
    if (req.params.id === req.user!.userId) {
      return res.status(400).json({ error: 'Não pode eliminar a sua própria conta' });
    }
    await prisma.user.delete({ where: { id: req.params.id as string } });
    res.json({ message: 'Utilizador eliminado' });
  })
);

export default router;
