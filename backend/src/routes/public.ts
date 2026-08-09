import { Router } from 'express';
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

router.post(
  '/contacto',
  asyncHandler(async (req, res) => {
    const { nome, email, telefone, assunto, mensagem } = req.body;
    if (!nome || !email || !mensagem) {
      return res.status(400).json({ error: 'Nome, email e mensagem são obrigatórios' });
    }

    const novaMensagem = await prisma.mensagemContacto.create({
      data: { nome, email, telefone, assunto, mensagem },
    });

    console.log('📧 Contacto recebido e gravado:', novaMensagem);
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

// Marcar mensagem como lida / eliminar
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
