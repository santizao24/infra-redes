import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

const obraSchema = z.object({
  nome: z.string().min(1),
  referencia: z.string().min(1),
  cliente: z.string().min(1),
  tipo: z.enum(['AGUA', 'SANEAMENTO', 'GAS', 'AGUA_SANEAMENTO', 'OUTRA']),
  estado: z.enum(['PLANEADA', 'EM_PREPARACAO', 'EM_EXECUCAO', 'SUSPENSA', 'CONCLUIDA']).optional(),
  responsavel: z.string().min(1),
  dataInicio: z.string().nullable().optional(),
  dataPrevistaFim: z.string().nullable().optional(),
  dataFim: z.string().nullable().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  morada: z.string().nullable().optional(),
  metrosPrevistos: z.number().min(0).optional(),
  metrosExecutados: z.number().min(0).optional(),
  tipoPavimento: z.enum(['ASFALTO', 'BETAO', 'CALCADA', 'TERRA', 'PARALELOS', 'OUTRO']).nullable().optional(),
  estadoPavimento: z.enum(['PROVISORIO', 'DEFINITIVO']).nullable().optional(),
  areaPavimento: z.number().nullable().optional(),
  dataReposicaoProvisoria: z.string().nullable().optional(),
  dataReposicaoDefinitiva: z.string().nullable().optional(),
  observacoesPavimento: z.string().nullable().optional(),
  descricao: z.string().nullable().optional(),
  imagemUrl: z.string().nullable().optional(),
  publica: z.boolean().optional(),
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseDates<T extends Record<string, any>>(data: T) {
  return {
    ...data,
    dataInicio: data.dataInicio ? new Date(data.dataInicio) : null,
    dataPrevistaFim: data.dataPrevistaFim ? new Date(data.dataPrevistaFim) : null,
    dataFim: data.dataFim ? new Date(data.dataFim) : null,
    dataReposicaoProvisoria: data.dataReposicaoProvisoria ? new Date(data.dataReposicaoProvisoria) : null,
    dataReposicaoDefinitiva: data.dataReposicaoDefinitiva ? new Date(data.dataReposicaoDefinitiva) : null,
  };
}

const obraInclude = {
  materiaisUsados: { include: { material: true } },
  historico: { include: { utilizador: { select: { nome: true } } }, orderBy: { data: 'desc' as const } },
};

// Public routes
router.get(
  '/public',
  asyncHandler(async (req, res) => {
    const { tipo } = req.query;
    const where: Record<string, unknown> = { publica: true };
    if (tipo && typeof tipo === 'string') where.tipo = tipo;

    const obras = await prisma.obra.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    res.json(obras);
  })
);

// Protected routes
router.get(
  '/',
  authenticate,
  asyncHandler(async (req, res) => {
    const { search, estado, tipo, pavimento } = req.query;
    const where: Record<string, unknown> = {};

    if (search && typeof search === 'string') {
      where.OR = [
        { nome: { contains: search, mode: 'insensitive' } },
        { referencia: { contains: search, mode: 'insensitive' } },
        { cliente: { contains: search, mode: 'insensitive' } },
        { morada: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (estado && typeof estado === 'string') where.estado = estado;
    if (tipo && typeof tipo === 'string') where.tipo = tipo;
    if (pavimento && typeof pavimento === 'string') where.estadoPavimento = pavimento;

    const obras = await prisma.obra.findMany({
      where,
      include: { materiaisUsados: { include: { material: true } } },
      orderBy: { updatedAt: 'desc' },
    });
    res.json(obras);
  })
);

router.get(
  '/mapa',
  authenticate,
  asyncHandler(async (req, res) => {
    const { estado, tipo, pavimento } = req.query;
    const where: Record<string, unknown> = {
      latitude: { not: null },
      longitude: { not: null },
    };

    if (estado && typeof estado === 'string') where.estado = estado;
    if (tipo && typeof tipo === 'string') where.tipo = tipo;
    if (pavimento && typeof pavimento === 'string') where.estadoPavimento = pavimento;

    const obras = await prisma.obra.findMany({ where, orderBy: { nome: 'asc' } });
    res.json(obras);
  })
);

router.get(
  '/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    const obra = await prisma.obra.findUnique({
      where: { id: req.params.id as string },
      include: obraInclude,
    });
    if (!obra) return res.status(404).json({ error: 'Obra não encontrada' });
    res.json(obra);
  })
);

router.post(
  '/',
  authenticate,
  requireRole('ADMIN', 'GESTOR'),
  asyncHandler(async (req, res) => {
    const data = parseDates(obraSchema.parse(req.body));

    const obra = await prisma.obra.create({
      data: { ...data, estado: data.estado || 'PLANEADA' },
      include: obraInclude,
    });

    await prisma.historicoObra.create({
      data: {
        obraId: obra.id,
        utilizadorId: req.user!.userId,
        descricao: 'Obra criada',
      },
    });

    res.status(201).json(obra);
  })
);

router.put(
  '/:id',
  authenticate,
  requireRole('ADMIN', 'GESTOR'),
  asyncHandler(async (req, res) => {
    const data = parseDates(obraSchema.partial().parse(req.body)) as Record<string, unknown>;
    const existing = await prisma.obra.findUnique({ where: { id: req.params.id as string } });
    if (!existing) return res.status(404).json({ error: 'Obra não encontrada' });

    const obra = await prisma.obra.update({
      where: { id: req.params.id as string },
      data,
      include: obraInclude,
    });

    const changes: string[] = [];
    if (data.estado && data.estado !== existing.estado) changes.push(`Estado alterado para ${data.estado}`);
    if (data.estadoPavimento && data.estadoPavimento !== existing.estadoPavimento) {
      changes.push(`Pavimento alterado para ${data.estadoPavimento}`);
    }
    if (data.metrosExecutados !== undefined && data.metrosExecutados !== existing.metrosExecutados) {
      changes.push(`${data.metrosExecutados} m executados`);
    }

    if (changes.length > 0) {
      await prisma.historicoObra.create({
        data: {
          obraId: obra.id,
          utilizadorId: req.user!.userId,
          descricao: changes.join(' — '),
        },
      });
    }

    res.json(obra);
  })
);

router.delete(
  '/:id',
  authenticate,
  requireRole('ADMIN'),
  asyncHandler(async (req, res) => {
    const obraId = req.params.id as string;

    // Repor stock dos movimentos de SAIDA associados a esta obra
    const movimentosSaida = await prisma.movimentoStock.findMany({
      where: { obraId, tipo: 'SAIDA' },
    });

    if (movimentosSaida.length > 0) {
      await prisma.$transaction(async (tx) => {
        for (const mov of movimentosSaida) {
          await tx.material.update({
            where: { id: mov.materialId },
            data: { quantidadeStock: { increment: mov.quantidade } },
          });
        }
        // Limpar movimentos, materiais associados, histórico, e a obra
        await tx.movimentoStock.deleteMany({ where: { obraId } });
        await tx.materialObra.deleteMany({ where: { obraId } });
        await tx.historicoObra.deleteMany({ where: { obraId } });
        await tx.obra.delete({ where: { id: obraId } });
      });
    } else {
      await prisma.materialObra.deleteMany({ where: { obraId } });
      await prisma.historicoObra.deleteMany({ where: { obraId } });
      await prisma.obra.delete({ where: { id: obraId } });
    }

    res.json({ message: 'Obra eliminada e stock reposto' });
  })
);

// Materiais utilizados na obra
router.post(
  '/:id/materiais',
  authenticate,
  requireRole('ADMIN', 'GESTOR'),
  asyncHandler(async (req, res) => {
    const schema = z.object({
      materialId: z.string(),
      quantidade: z.number().positive(),
    });
    const { materialId, quantidade } = schema.parse(req.body);
    const obraId = req.params.id as string;

    const materialObra = await prisma.materialObra.upsert({
      where: { obraId_materialId: { obraId, materialId } },
      update: { quantidade: { increment: quantidade } },
      create: { obraId, materialId, quantidade },
      include: { material: true },
    });

    const mat = materialObra as typeof materialObra & { material: { nome: string; unidade: string } };

    await prisma.historicoObra.create({
      data: {
        obraId,
        utilizadorId: req.user!.userId,
        descricao: `Material registado: ${quantidade} ${mat.material.unidade} de ${mat.material.nome}`,
      },
    });

    res.status(201).json(materialObra);
  })
);

export default router;
