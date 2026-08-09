import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { asyncHandler } from '../middleware/errorHandler.js';

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
    // Em produção, enviar email ou guardar na BD
    console.log('📧 Contacto recebido:', { nome, email, telefone, assunto, mensagem });
    res.json({ message: 'Mensagem enviada com sucesso. Entraremos em contacto brevemente.' });
  })
);

export default router;
