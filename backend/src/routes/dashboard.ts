import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

router.get(
  '/',
  authenticate,
  asyncHandler(async (_req, res) => {
    const [
      obrasEmCurso,
      obrasConcluidas,
      obrasPendentes,
      obrasSuspensas,
      totalMetros,
      materiais,
      obrasPorEstado,
      obrasPorTipo,
      obras,
    ] = await Promise.all([
      prisma.obra.count({ where: { estado: 'EM_EXECUCAO' } }),
      prisma.obra.count({ where: { estado: 'CONCLUIDA' } }),
      prisma.obra.count({ where: { estado: { in: ['PLANEADA', 'EM_PREPARACAO'] } } }),
      prisma.obra.count({ where: { estado: 'SUSPENSA' } }),
      prisma.obra.aggregate({ _sum: { metrosExecutados: true } }),
      prisma.material.findMany(),
      prisma.obra.groupBy({ by: ['estado'], _count: true }),
      prisma.obra.groupBy({ by: ['tipo'], _count: true }),
      prisma.obra.findMany({
        where: { metrosExecutados: { gt: 0 } },
        select: { dataInicio: true, metrosExecutados: true, createdAt: true },
        orderBy: { dataInicio: 'asc' },
      }),
    ]);

    const stockBaixo = materiais.filter((m) => m.quantidadeStock <= m.stockMinimo);

    // Evolução mensal de metros executados
    const evolucaoMetros: { mes: string; metros: number }[] = [];
    const mesesMap = new Map<string, number>();

    for (const obra of obras) {
      const date = obra.dataInicio || obra.createdAt;
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      mesesMap.set(key, (mesesMap.get(key) || 0) + obra.metrosExecutados);
    }

    const sortedMeses = [...mesesMap.entries()].sort(([a], [b]) => a.localeCompare(b));
    let acumulado = 0;
    for (const [mes, metros] of sortedMeses) {
      acumulado += metros;
      evolucaoMetros.push({ mes, metros: acumulado });
    }

    res.json({
      resumo: {
        obrasEmCurso,
        obrasConcluidas,
        obrasPendentes,
        obrasSuspensas,
        totalMetrosExecutados: totalMetros._sum.metrosExecutados || 0,
        totalMateriais: materiais.length,
        materiaisStockBaixo: stockBaixo.length,
      },
      obrasPorEstado: obrasPorEstado.map((e) => ({ estado: e.estado, count: e._count })),
      obrasPorTipo: obrasPorTipo.map((t) => ({ tipo: t.tipo, count: t._count })),
      evolucaoMetros,
      stockBaixo: stockBaixo.map((m) => ({
        id: m.id,
        nome: m.nome,
        codigo: m.codigo,
        quantidadeStock: m.quantidadeStock,
        stockMinimo: m.stockMinimo,
        unidade: m.unidade,
      })),
    });
  })
);

router.get(
  '/relatorios',
  authenticate,
  asyncHandler(async (_req, res) => {
    const [obras, materiais, movimentos] = await Promise.all([
      prisma.obra.findMany({ orderBy: { nome: 'asc' } }),
      prisma.material.findMany({ orderBy: { nome: 'asc' } }),
      prisma.movimentoStock.findMany({
        include: {
          material: { select: { nome: true, codigo: true } },
          obra: { select: { nome: true } },
        },
        orderBy: { data: 'desc' },
        take: 50,
      }),
    ]);

    res.json({ obras, materiais, movimentosRecentes: movimentos });
  })
);

export default router;
