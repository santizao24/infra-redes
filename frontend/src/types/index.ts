export type UserRole = 'ADMIN' | 'GESTOR';

export interface User {
  id: string;
  nome: string;
  email: string;
  role: UserRole;
}

export type ObraEstado = 'PLANEADA' | 'EM_PREPARACAO' | 'EM_EXECUCAO' | 'SUSPENSA' | 'CONCLUIDA';
export type ObraTipo = 'AGUA' | 'SANEAMENTO' | 'GAS' | 'AGUA_SANEAMENTO' | 'OUTRA';
export type TipoPavimento = 'ASFALTO' | 'BETAO' | 'CALCADA' | 'TERRA' | 'PARALELOS' | 'OUTRO';
export type EstadoPavimento = 'PROVISORIO' | 'DEFINITIVO';
export type MaterialCategoria = 'TUBAGENS' | 'ACESSORIOS' | 'VALVULAS' | 'MATERIAL_AGUA' | 'MATERIAL_SANEAMENTO' | 'MATERIAL_GAS' | 'PAVIMENTACAO' | 'OUTROS';
export type UnidadeMedida = 'UNIDADE' | 'METRO' | 'KG' | 'LITRO' | 'CAIXA';
export type MovimentoTipo = 'ENTRADA' | 'SAIDA';

export interface Obra {
  id: string;
  nome: string;
  referencia: string;
  cliente: string;
  tipo: ObraTipo;
  estado: ObraEstado;
  responsavel: string;
  dataInicio?: string | null;
  dataPrevistaFim?: string | null;
  dataFim?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  morada?: string | null;
  metrosPrevistos: number;
  metrosExecutados: number;
  tipoPavimento?: TipoPavimento | null;
  estadoPavimento?: EstadoPavimento | null;
  areaPavimento?: number | null;
  dataReposicaoProvisoria?: string | null;
  dataReposicaoDefinitiva?: string | null;
  observacoesPavimento?: string | null;
  descricao?: string | null;
  imagemUrl?: string | null;
  publica: boolean;
  createdAt: string;
  updatedAt: string;
  materiaisUsados?: MaterialObra[];
  historico?: HistoricoObra[];
}

export interface MaterialObra {
  id: string;
  obraId: string;
  materialId: string;
  quantidade: number;
  material: Material;
}

export interface HistoricoObra {
  id: string;
  obraId: string;
  descricao: string;
  data: string;
  utilizador?: { nome: string };
}

export interface Material {
  id: string;
  codigo: string;
  nome: string;
  categoria: MaterialCategoria;
  descricao?: string | null;
  unidade: UnidadeMedida;
  quantidadeStock: number;
  stockMinimo: number;
  localizacao?: string | null;
  fornecedor?: string | null;
  precoUnitario: number;
  stockBaixo?: boolean;
}

export interface MovimentoStock {
  id: string;
  materialId: string;
  obraId?: string | null;
  tipo: MovimentoTipo;
  quantidade: number;
  data: string;
  fornecedor?: string | null;
  responsavel?: string | null;
  observacoes?: string | null;
  material?: { id: string; nome: string; codigo: string; unidade: UnidadeMedida };
  obra?: { id: string; nome: string };
  utilizador?: { nome: string };
}

export interface DashboardData {
  resumo: {
    obrasEmCurso: number;
    obrasConcluidas: number;
    obrasPendentes: number;
    obrasSuspensas: number;
    totalMetrosExecutados: number;
    totalMateriais: number;
    materiaisStockBaixo: number;
  };
  obrasPorEstado: { estado: ObraEstado; count: number }[];
  obrasPorTipo: { tipo: ObraTipo; count: number }[];
  evolucaoMetros: { mes: string; metros: number }[];
  stockBaixo: {
    id: string;
    nome: string;
    codigo: string;
    quantidadeStock: number;
    stockMinimo: number;
    unidade: UnidadeMedida;
  }[];
}

export interface SiteStats {
  obras_realizadas?: string;
  km_redes?: string;
  anos_experiencia?: string;
  clientes?: string;
}
