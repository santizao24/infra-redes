import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

const materialSchema = z.object({
  codigo: z.string().min(1),
  nome: z.string().min(1),
  categoria: z.enum(['TUBAGENS', 'ACESSORIOS', 'VALVULAS', 'MATERIAL_AGUA', 'MATERIAL_SANEAMENTO', 'MATERIAL_GAS', 'PAVIMENTACAO', 'OUTROS']),
  descricao: z.string().nullable().optional(),
  unidade: z.enum(['UNIDADE', 'METRO', 'KG', 'LITRO', 'CAIXA']),
  quantidadeStock: z.number().min(0).optional(),
  stockMinimo: z.number().min(0).optional(),
  localizacao: z.string().nullable().optional(),
  fornecedor: z.string().nullable().optional(),
  precoUnitario: z.number().min(0).optional(),
});

router.get(
  '/',
  authenticate,
  asyncHandler(async (req, res) => {
    const { search, categoria, stockBaixo } = req.query;
    const where: Record<string, unknown> = {};

    if (search && typeof search === 'string') {
      where.OR = [
        { nome: { contains: search, mode: 'insensitive' } },
        { codigo: { contains: search, mode: 'insensitive' } },
        { fornecedor: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (categoria && typeof categoria === 'string') where.categoria = categoria;

    let materiais = await prisma.material.findMany({
      where,
      orderBy: { nome: 'asc' },
    });

    if (stockBaixo === 'true') {
      materiais = materiais.filter((m) => m.quantidadeStock <= m.stockMinimo);
    }

    const result = materiais.map((m) => ({
      ...m,
      stockBaixo: m.quantidadeStock <= m.stockMinimo,
    }));

    res.json(result);
  })
);

router.get(
  '/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    const material = await prisma.material.findUnique({
      where: { id: req.params.id as string },
      include: {
        movimentos: {
          include: {
            obra: { select: { id: true, nome: true } },
            utilizador: { select: { nome: true } },
          },
          orderBy: { data: 'desc' },
          take: 20,
        },
      },
    });
    if (!material) return res.status(404).json({ error: 'Material não encontrado' });
    res.json({ ...material, stockBaixo: material.quantidadeStock <= material.stockMinimo });
  })
);

router.post(
  '/',
  authenticate,
  requireRole('ADMIN'),
  asyncHandler(async (req, res) => {
    const data = materialSchema.parse(req.body);
    const material = await prisma.material.create({ data });
    res.status(201).json(material);
  })
);

router.put(
  '/:id',
  authenticate,
  requireRole('ADMIN'),
  asyncHandler(async (req, res) => {
    const data = materialSchema.partial().parse(req.body);
    const material = await prisma.material.update({
      where: { id: req.params.id as string },
      data,
    });
    res.json(material);
  })
);

router.delete(
  '/:id',
  authenticate,
  requireRole('ADMIN'),
  asyncHandler(async (req, res) => {
    await prisma.material.delete({ where: { id: req.params.id as string } });
    res.json({ message: 'Material eliminado' });
  })
);

// Movimentos de stock
const movimentoSchema = z.object({
  materialId: z.string(),
  tipo: z.enum(['ENTRADA', 'SAIDA']),
  quantidade: z.number().positive(),
  data: z.string().optional(),
  obraId: z.string().nullable().optional(),
  fornecedor: z.string().nullable().optional(),
  responsavel: z.string().nullable().optional(),
  observacoes: z.string().nullable().optional(),
});

router.get(
  '/movimentos/list',
  authenticate,
  asyncHandler(async (req, res) => {
    const { materialId, tipo } = req.query;
    const where: Record<string, unknown> = {};
    if (materialId && typeof materialId === 'string') where.materialId = materialId;
    if (tipo && typeof tipo === 'string') where.tipo = tipo;

    const movimentos = await prisma.movimentoStock.findMany({
      where,
      include: {
        material: { select: { id: true, nome: true, codigo: true, unidade: true } },
        obra: { select: { id: true, nome: true } },
        utilizador: { select: { nome: true } },
      },
      orderBy: { data: 'desc' },
    });
    res.json(movimentos);
  })
);

router.post(
  '/movimentos',
  authenticate,
  requireRole('ADMIN', 'GESTOR'),
  asyncHandler(async (req, res) => {
    const data = movimentoSchema.parse(req.body);

    const material = await prisma.material.findUnique({ where: { id: data.materialId } });
    if (!material) return res.status(404).json({ error: 'Material não encontrado' });

    if (data.tipo === 'SAIDA' && material.quantidadeStock < data.quantidade) {
      return res.status(400).json({ error: 'Stock insuficiente para esta saída' });
    }

    const delta = data.tipo === 'ENTRADA' ? data.quantidade : -data.quantidade;

    const [movimento] = await prisma.$transaction([
      prisma.movimentoStock.create({
        data: {
          materialId: data.materialId,
          tipo: data.tipo,
          quantidade: data.quantidade,
          data: data.data ? new Date(data.data) : new Date(),
          obraId: data.obraId || null,
          fornecedor: data.fornecedor || null,
          responsavel: data.responsavel || null,
          observacoes: data.observacoes || null,
          utilizadorId: req.user!.userId,
        },
        include: {
          material: true,
          obra: { select: { id: true, nome: true } },
        },
      }),
      prisma.material.update({
        where: { id: data.materialId },
        data: { quantidadeStock: { increment: delta } },
      }),
    ]);

    if (data.tipo === 'SAIDA' && data.obraId) {
      await prisma.materialObra.upsert({
        where: { obraId_materialId: { obraId: data.obraId, materialId: data.materialId } },
        update: { quantidade: { increment: data.quantidade } },
        create: { obraId: data.obraId, materialId: data.materialId, quantidade: data.quantidade },
      });
    }

    res.status(201).json(movimento);
  })
);

export default router;
