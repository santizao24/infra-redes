import api from './api';
import type { User, Obra, Material, MovimentoStock, DashboardData, SiteStats } from '../types';

export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ token: string; user: User }>('/auth/login', { email, password }),
  me: () => api.get<User>('/auth/me'),
  getUsers: () => api.get<User[]>('/auth/users'),
  createUser: (data: { nome: string; email: string; password: string; role: string }) =>
    api.post<User>('/auth/users', data),
  deleteUser: (id: string) => api.delete(`/auth/users/${id}`),
};

export const obrasApi = {
  getPublic: (tipo?: string) => api.get<Obra[]>('/obras/public', { params: { tipo } }),
  getAll: (params?: Record<string, string>) => api.get<Obra[]>('/obras', { params }),
  getMapa: (params?: Record<string, string>) => api.get<Obra[]>('/obras/mapa', { params }),
  getById: (id: string) => api.get<Obra>(`/obras/${id}`),
  create: (data: Record<string, unknown>) => api.post<Obra>('/obras', data),
  update: (id: string, data: Record<string, unknown>) => api.put<Obra>(`/obras/${id}`, data),
  delete: (id: string) => api.delete(`/obras/${id}`),
  addMaterial: (obraId: string, materialId: string, quantidade: number) =>
    api.post(`/obras/${obraId}/materiais`, { materialId, quantidade }),
};

export const stockApi = {
  getAll: (params?: Record<string, string>) => api.get<Material[]>('/stock', { params }),
  getById: (id: string) => api.get<Material>(`/stock/${id}`),
  create: (data: Record<string, unknown>) => api.post<Material>('/stock', data),
  update: (id: string, data: Record<string, unknown>) => api.put<Material>(`/stock/${id}`, data),
  delete: (id: string) => api.delete(`/stock/${id}`),
  getMovimentos: (params?: Record<string, string>) =>
    api.get<MovimentoStock[]>('/stock/movimentos/list', { params }),
  createMovimento: (data: Record<string, unknown>) =>
    api.post<MovimentoStock>('/stock/movimentos', data),
};

export const dashboardApi = {
  get: () => api.get<DashboardData>('/dashboard'),
  getRelatorios: () => api.get('/dashboard/relatorios'),
};

export const publicApi = {
  getStats: () => api.get<SiteStats>('/public/stats'),
  sendContact: (data: Record<string, string>) => api.post('/public/contacto', data),
  getMensagens: () => api.get('/public/mensagens'),
  deleteMensagem: (id: string) => api.delete(`/public/mensagens/${id}`),
};
