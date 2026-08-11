import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get(
  '/stats',
  asyncHandler(async (_req, res) => {
    const configs = await prisma.siteConfig.findMany();
    const stats: Record<string, string> = {};
    for (const c of configs) stats[c.chave] = c.valor;
    res.json(stats);
  })
);

const contactoSchema = z.object({
  nome: z.string().trim().min(2, 'Nome muito curto').max(100, 'Nome muito longo'),
  email: z.string().trim().toLowerCase().email('Email inválido'),
  telefone: z.string().trim().max(30).optional().nullable(),
  assunto: z.string().trim().max(150).optional().nullable(),
  mensagem: z.string().trim().min(5, 'Mensagem muito curta').max(3000, 'Mensagem ultrapassa o limite de 3000 caracteres'),
});

router.post(
  '/contacto',
  asyncHandler(async (req, res) => {
    const data = contactoSchema.parse(req.body);

    const novaMensagem = await prisma.mensagemContacto.create({
      data,
    });

    console.log('📧 Contacto recebido e gravado:', novaMensagem.id);
    res.json({ message: 'Mensagem enviada com sucesso. Entraremos em contacto brevemente.' });
  })
);

// Obter mensagens recebidas (apenas para utilizadores autenticados)
router.get(
  '/mensagens',
  authenticate,
  asyncHandler(async (_req, res) => {
    const mensagens = await prisma.mensagemContacto.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(mensagens);
  })
);

// Marcar mensagem como lida/não lida
router.patch(
  '/mensagens/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    const id = req.params.id as string;
    const msg = await prisma.mensagemContacto.findUnique({ where: { id } });
    if (!msg) return res.status(404).json({ error: 'Mensagem não encontrada' });
    const updated = await prisma.mensagemContacto.update({
      where: { id },
      data: { lida: !msg.lida },
    });
    res.json(updated);
  })
);

// Eliminar mensagem
router.delete(
  '/mensagens/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    const id = req.params.id as string;
    await prisma.mensagemContacto.delete({ where: { id } });
    res.json({ message: 'Mensagem eliminada com sucesso' });
  })
);

export default router;
