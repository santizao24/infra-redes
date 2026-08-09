export const OBRA_ESTADO_LABELS: Record<string, string> = {
  PLANEADA: 'Planeada',
  EM_PREPARACAO: 'Em preparação',
  EM_EXECUCAO: 'Em execução',
  SUSPENSA: 'Suspensa',
  CONCLUIDA: 'Concluída',
};

export const OBRA_TIPO_LABELS: Record<string, string> = {
  AGUA: 'Água',
  SANEAMENTO: 'Saneamento',
  GAS: 'Gás',
  AGUA_SANEAMENTO: 'Água + Saneamento',
  OUTRA: 'Outra',
};

export const PAVIMENTO_TIPO_LABELS: Record<string, string> = {
  ASFALTO: 'Asfalto',
  BETAO: 'Betão',
  CALCADA: 'Calçada',
  TERRA: 'Terra',
  PARALELOS: 'Paralelos',
  OUTRO: 'Outro',
};

export const PAVIMENTO_ESTADO_LABELS: Record<string, string> = {
  PROVISORIO: 'Provisório',
  DEFINITIVO: 'Definitivo/Completo',
};

export const CATEGORIA_LABELS: Record<string, string> = {
  TUBAGENS: 'Tubagens',
  ACESSORIOS: 'Acessórios',
  VALVULAS: 'Válvulas',
  MATERIAL_AGUA: 'Material de água',
  MATERIAL_SANEAMENTO: 'Material de saneamento',
  MATERIAL_GAS: 'Material de gás',
  PAVIMENTACAO: 'Pavimentação',
  OUTROS: 'Outros',
};

export const UNIDADE_LABELS: Record<string, string> = {
  UNIDADE: 'Unidade',
  METRO: 'Metro',
  KG: 'Kg',
  LITRO: 'Litro',
  CAIXA: 'Caixa',
};

export const ESTADO_COLORS: Record<string, string> = {
  PLANEADA: 'bg-slate-100 text-slate-700',
  EM_PREPARACAO: 'bg-blue-100 text-blue-700',
  EM_EXECUCAO: 'bg-amber-100 text-amber-800',
  SUSPENSA: 'bg-red-100 text-red-700',
  CONCLUIDA: 'bg-green-100 text-green-700',
};

export const ESTADO_MARKER_COLORS: Record<string, string> = {
  PLANEADA: '#64748b',
  EM_PREPARACAO: '#3b82f6',
  EM_EXECUCAO: '#f59e0b',
  SUSPENSA: '#ef4444',
  CONCLUIDA: '#22c55e',
};

export function formatDate(date?: string | null): string {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('pt-PT');
}

export function calcProgresso(previstos: number, executados: number): number {
  if (previstos <= 0) return 0;
  return Math.min(100, Math.round((executados / previstos) * 1000) / 10);
}

export function metrosEmFalta(previstos: number, executados: number): number {
  return Math.max(0, previstos - executados);
}
