import { Settings, Info, Database, Shield, Globe } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';

export default function DefinicoesPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Settings className="w-6 h-6 text-primary-600" /> Definições
        </h1>
        <p className="text-sm text-slate-500">Informações do sistema e configurações</p>
      </div>

      {/* Perfil */}
      <Card>
        <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary-600" /> Perfil do utilizador
        </h2>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xl font-bold">
            {user?.nome?.charAt(0)}
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-900">{user?.nome}</p>
            <p className="text-sm text-slate-500">{user?.email}</p>
            <Badge className={user?.role === 'ADMIN' ? 'bg-primary-100 text-primary-700 mt-1' : 'bg-slate-100 text-slate-600 mt-1'}>
              {user?.role === 'ADMIN' ? 'Administrador' : 'Gestor'}
            </Badge>
          </div>
        </div>
      </Card>

      {/* Informação do sistema */}
      <Card>
        <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Info className="w-5 h-5 text-primary-600" /> Sobre o sistema
        </h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-slate-100">
            <span className="text-slate-500">Aplicação</span>
            <span className="font-medium text-slate-900">Tarefas Obedientes - Sistema de Gestão</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-100">
            <span className="text-slate-500">Versão</span>
            <span className="font-medium text-slate-900">1.0.0</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-100">
            <span className="text-slate-500">Frontend</span>
            <span className="font-medium text-slate-900">React + Vite + TypeScript</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-100">
            <span className="text-slate-500">Backend</span>
            <span className="font-medium text-slate-900">Node.js + Express + Prisma</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-100">
            <span className="text-slate-500">Base de dados</span>
            <span className="font-medium text-slate-900">PostgreSQL</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-slate-500">Mapas</span>
            <span className="font-medium text-slate-900">Leaflet + OpenStreetMap</span>
          </div>
        </div>
      </Card>

      {/* Empresa */}
      <Card>
        <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5 text-primary-600" /> Dados da empresa
        </h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-slate-100">
            <span className="text-slate-500">Empresa</span>
            <span className="font-medium text-slate-900">Tarefas Obedientes, Lda.</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-100">
            <span className="text-slate-500">Morada</span>
            <span className="font-medium text-slate-900">Rua do Monte, nº 71, 4750-704 Tamel Santa Leocádia</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-100">
            <span className="text-slate-500">Telefone</span>
            <span className="font-medium text-slate-900">+351 239 123 456</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-100">
            <span className="text-slate-500">Email</span>
            <span className="font-medium text-slate-900">geral@tarefasobedientes.pt</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-slate-500">Website</span>
            <span className="font-medium text-primary-600">www.tarefasobedientes.pt</span>
          </div>
        </div>
      </Card>

      {/* Card removido */}
    </div>
  );
}
