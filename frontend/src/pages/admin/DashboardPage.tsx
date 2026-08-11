import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HardHat, CheckCircle, Clock, AlertTriangle, Ruler, Package, AlertCircle, Mail, Trash2, Eye, EyeOff } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { dashboardApi, publicApi } from '../../services/endpoints';
import type { DashboardData } from '../../types';
import { StatCard } from '../../components/ui/StatCard';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { PageLoader } from '../../components/ui/Loading';
import { OBRA_ESTADO_LABELS, OBRA_TIPO_LABELS, UNIDADE_LABELS } from '../../utils/labels';
import toast from 'react-hot-toast';

interface MensagemContacto {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  assunto?: string;
  mensagem: string;
  lida: boolean;
  createdAt: string;
}

const PIE_COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#64748b'];

interface Alerta {
  id: string;
  tipo: 'OBRA_ATRASADA' | 'OBRA_PRAZO' | 'PAVIMENTO_PENDENTE' | 'STOCK_BAIXO' | 'MENSAGEM_NAO_LIDA';
  nivel: 'CRITICO' | 'AVISO' | 'INFO';
  titulo: string;
  descricao: string;
  link: string;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [mensagens, setMensagens] = useState<MensagemContacto[]>([]);
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      dashboardApi.get().then((res) => setData(res.data)),
      publicApi.getMensagens().then((res) => setMensagens(res.data)).catch(() => []),
      dashboardApi.getAlertas().then((res) => setAlertas(res.data.alertas)).catch(() => []),
    ]).finally(() => setLoading(false));
  }, []);

  const handleToggleLida = async (id: string) => {
    try {
      const res = await publicApi.toggleLida(id);
      setMensagens((prev) => prev.map((m) => m.id === id ? { ...m, lida: res.data.lida } : m));
    } catch {
      toast.error('Erro ao atualizar mensagem');
    }
  };

  const handleDeleteMensagem = async (id: string) => {
    try {
      await publicApi.deleteMensagem(id);
      setMensagens((prev) => prev.filter((m) => m.id !== id));
      toast.success('Mensagem eliminada com sucesso');
    } catch {
      toast.error('Erro ao eliminar mensagem');
    }
  };

  const naoLidas = mensagens.filter((m) => !m.lida).length;

  if (loading) return <PageLoader />;
  if (!data) return null;

  const { resumo, obrasPorEstado, obrasPorTipo, evolucaoMetros, stockBaixo } = data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500">Visão geral da atividade da empresa</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard title="Obras em curso" value={resumo.obrasEmCurso} icon={HardHat} color="bg-amber-100 text-amber-600" />
        <StatCard title="Obras concluídas" value={resumo.obrasConcluidas} icon={CheckCircle} color="bg-green-100 text-green-600" />
        <StatCard title="Obras pendentes" value={resumo.obrasPendentes} icon={Clock} color="bg-blue-100 text-blue-600" />
        <StatCard title="Obras suspensas" value={resumo.obrasSuspensas} icon={AlertTriangle} color="bg-red-100 text-red-600" />
        <StatCard title="Metros executados" value={`${resumo.totalMetrosExecutados.toLocaleString()} m`} icon={Ruler} color="bg-primary-100 text-primary-600" />
        <StatCard title="Stock baixo" value={resumo.materiaisStockBaixo} icon={AlertCircle} color="bg-red-100 text-red-600" subtitle={`de ${resumo.totalMateriais} materiais`} />
      </div>

      {/* Central de Alertas Prioritários */}
      {alertas.length > 0 && (
        <Card className="border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Alertas Prioritários e Prazos ({alertas.length})
            </h3>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {alertas.slice(0, 6).map((a) => (
              <Link
                key={a.id}
                to={a.link}
                className={`p-3 rounded-xl border transition-all hover:shadow-md flex flex-col justify-between ${
                  a.nivel === 'CRITICO'
                    ? 'border-red-200 bg-red-50/50 hover:border-red-300'
                    : a.nivel === 'AVISO'
                    ? 'border-amber-200 bg-amber-50/50 hover:border-amber-300'
                    : 'border-blue-200 bg-blue-50/50 hover:border-blue-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Badge className={
                      a.nivel === 'CRITICO'
                        ? 'bg-red-100 text-red-700'
                        : a.nivel === 'AVISO'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-blue-100 text-blue-700'
                    }>
                      {a.nivel === 'CRITICO' ? 'Crítico' : a.nivel === 'AVISO' ? 'Aviso' : 'Info'}
                    </Badge>
                  </div>
                  <h4 className="font-semibold text-slate-900 text-sm">{a.titulo}</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{a.descricao}</p>
                </div>
                <span className="text-xs font-medium text-primary-600 mt-3 hover:underline">Resolver / Ver detalhes →</span>
              </Link>
            ))}
          </div>
        </Card>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-semibold text-slate-900 mb-4">Obras por estado</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={obrasPorEstado.map((e) => ({ name: OBRA_ESTADO_LABELS[e.estado], count: e.count }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 className="font-semibold text-slate-900 mb-4">Obras por tipo</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={obrasPorTipo.map((t) => ({ name: OBRA_TIPO_LABELS[t.tipo], value: t.count }))}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, value }) => `${name} (${value})`}
              >
                {obrasPorTipo.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {evolucaoMetros.length > 0 && (
        <Card>
          <h3 className="font-semibold text-slate-900 mb-4">Evolução de metros executados</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={evolucaoMetros}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="metros" stroke="#2563eb" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Caixa de Entrada: Mensagens dos Clientes */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary-600" />
            Mensagens de Clientes
            {naoLidas > 0 && <Badge className="bg-red-100 text-red-700">{naoLidas} nova{naoLidas > 1 ? 's' : ''}</Badge>}
            <span className="text-xs text-slate-400 font-normal">({mensagens.length} total)</span>
          </h3>
        </div>
        {mensagens.length === 0 ? (
          <p className="text-sm text-slate-500 py-4">Nenhuma mensagem recebida até ao momento.</p>
        ) : (
          <div className="space-y-4">
            {mensagens.map((msg) => (
              <div key={msg.id} className={`p-4 rounded-xl border relative group transition-colors ${
                msg.lida ? 'border-slate-200 bg-slate-50' : 'border-primary-200 bg-primary-50/30'
              }`}>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-start gap-2">
                    {!msg.lida && <span className="mt-1.5 w-2 h-2 rounded-full bg-primary-600 shrink-0" title="Não lida" />}
                    <div>
                      <span className={`${msg.lida ? 'font-medium' : 'font-bold'} text-slate-900`}>{msg.nome}</span>
                      <span className="text-xs text-slate-500 ml-2">({msg.email}{msg.telefone ? ` • Tel: ${msg.telefone}` : ''})</span>
                      {msg.assunto && <p className="text-xs font-medium text-primary-600 mt-0.5">Assunto: {msg.assunto}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">
                      {new Date(msg.createdAt).toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <button
                      onClick={() => handleToggleLida(msg.id)}
                      className="text-slate-400 hover:text-primary-600 transition-colors p-1"
                      title={msg.lida ? 'Marcar como não lida' : 'Marcar como lida'}
                    >
                      {msg.lida ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleDeleteMensagem(msg.id)}
                      className="text-slate-400 hover:text-red-600 transition-colors p-1"
                      title="Eliminar mensagem"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed mt-2 bg-white p-3 rounded-lg border border-slate-100">
                  {msg.mensagem}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>

      {stockBaixo.length > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-red-500" />
              Materiais com stock baixo
            </h3>
            <Link to="/stock" className="text-sm text-primary-600 hover:text-primary-700">Ver stock →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-500">
                  <th className="pb-3 font-medium">Material</th>
                  <th className="pb-3 font-medium">Stock atual</th>
                  <th className="pb-3 font-medium">Stock mínimo</th>
                  <th className="pb-3 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody>
                {stockBaixo.map((m) => (
                  <tr key={m.id} className="border-b border-slate-100">
                    <td className="py-3 font-medium text-slate-900">{m.nome}</td>
                    <td className="py-3">{m.quantidadeStock} {UNIDADE_LABELS[m.unidade]}</td>
                    <td className="py-3">{m.stockMinimo} {UNIDADE_LABELS[m.unidade]}</td>
                    <td className="py-3"><Badge className="bg-red-100 text-red-700">Stock baixo</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
