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

router.get(
  '/alertas',
  authenticate,
  asyncHandler(async (_req, res) => {
    const hoje = new Date();
    const daquiA5Dias = new Date();
    daquiA5Dias.setDate(hoje.getDate() + 5);

    const [obrasNaoConcluidas, obrasPavimentoProvisorio, materiaisStockBaixo, mensagensNaoLidas] = await Promise.all([
      prisma.obra.findMany({
        where: {
          estado: { not: 'CONCLUIDA' },
          dataPrevistaFim: { not: null },
        },
        select: { id: true, nome: true, referencia: true, dataPrevistaFim: true, estado: true },
      }),
      prisma.obra.findMany({
        where: {
          estadoPavimento: 'PROVISORIO',
        },
        select: { id: true, nome: true, referencia: true, dataReposicaoDefinitiva: true },
      }),
      prisma.material.findMany({
        select: { id: true, nome: true, codigo: true, quantidadeStock: true, stockMinimo: true, unidade: true },
      }),
      prisma.mensagemContacto.findMany({
        where: { lida: false },
        select: { id: true, nome: true, assunto: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const alertas: Array<{
      id: string;
      tipo: 'OBRA_ATRASADA' | 'OBRA_PRAZO' | 'PAVIMENTO_PENDENTE' | 'STOCK_BAIXO' | 'MENSAGEM_NAO_LIDA';
      nivel: 'CRITICO' | 'AVISO' | 'INFO';
      titulo: string;
      descricao: string;
      link: string;
      data?: string;
    }> = [];

    // Obras Atrasadas ou com prazo em 5 dias
    for (const o of obrasNaoConcluidas) {
      if (!o.dataPrevistaFim) continue;
      const dataFim = new Date(o.dataPrevistaFim);
      if (dataFim < hoje) {
        alertas.push({
          id: `obra-atraso-${o.id}`,
          tipo: 'OBRA_ATRASADA',
          nivel: 'CRITICO',
          titulo: `Obra em Atraso: ${o.nome}`,
          descricao: `A data prevista de fim (${dataFim.toLocaleDateString('pt-PT')}) já foi ultrapassada.`,
          link: `/gestao/obras/${o.id}`,
          data: o.dataPrevistaFim.toISOString(),
        });
      } else if (dataFim <= daquiA5Dias) {
        alertas.push({
          id: `obra-prazo-${o.id}`,
          tipo: 'OBRA_PRAZO',
          nivel: 'AVISO',
          titulo: `Prazo Próximo: ${o.nome}`,
          descricao: `Falta(m) ${Math.ceil((dataFim.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))} dia(s) para o fim previsto.`,
          link: `/gestao/obras/${o.id}`,
          data: o.dataPrevistaFim.toISOString(),
        });
      }
    }

    // Pavimentos Provisórios Pendentes
    for (const p of obrasPavimentoProvisorio) {
      const dataDef = p.dataReposicaoDefinitiva ? new Date(p.dataReposicaoDefinitiva) : null;
      if (!dataDef || dataDef < hoje) {
        alertas.push({
          id: `pav-pendente-${p.id}`,
          tipo: 'PAVIMENTO_PENDENTE',
          nivel: 'AVISO',
          titulo: `Pavimento Provisório Pendente: ${p.nome}`,
          descricao: dataDef
            ? `Data prevista de reposição definitiva (${dataDef.toLocaleDateString('pt-PT')}) ultrapassada.`
            : `Necessita de reposição definitiva de pavimento.`,
          link: `/gestao/obras/${p.id}`,
        });
      }
    }

    // Stock Baixo
    for (const m of materiaisStockBaixo) {
      if (m.quantidadeStock <= m.stockMinimo) {
        alertas.push({
          id: `stock-baixo-${m.id}`,
          tipo: 'STOCK_BAIXO',
          nivel: m.quantidadeStock === 0 ? 'CRITICO' : 'AVISO',
          titulo: `Stock ${m.quantidadeStock === 0 ? 'Esgotado' : 'Baixo'}: ${m.nome}`,
          descricao: `Stock atual: ${m.quantidadeStock} ${m.unidade} (Mínimo: ${m.stockMinimo}).`,
          link: '/stock',
        });
      }
    }

    // Mensagens não lidas de clientes
    for (const msg of mensagensNaoLidas) {
      alertas.push({
        id: `msg-${msg.id}`,
        tipo: 'MENSAGEM_NAO_LIDA',
        nivel: 'INFO',
        titulo: `Nova Mensagem: ${msg.nome}`,
        descricao: msg.assunto ? `Assunto: ${msg.assunto}` : 'Contacto recebido através do site.',
        link: '/dashboard',
        data: msg.createdAt.toISOString(),
      });
    }

    res.json({
      totalCount: alertas.length,
      criticosCount: alertas.filter((a) => a.nivel === 'CRITICO').length,
      alertas,
    });
  })
);

export default router;
