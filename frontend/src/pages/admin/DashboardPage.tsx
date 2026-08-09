import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HardHat, CheckCircle, Clock, AlertTriangle, Ruler, Package, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { dashboardApi } from '../../services/endpoints';
import type { DashboardData } from '../../types';
import { StatCard } from '../../components/ui/StatCard';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { PageLoader } from '../../components/ui/Loading';
import { OBRA_ESTADO_LABELS, OBRA_TIPO_LABELS, UNIDADE_LABELS } from '../../utils/labels';

const PIE_COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#64748b'];

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.get().then((res) => setData(res.data)).finally(() => setLoading(false));
  }, []);

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
                label={({ name, value }) => `${name}: ${value}`}
              >
                {obrasPorTipo.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {evolucaoMetros.length > 0 && (
        <Card>
          <h3 className="font-semibold text-slate-900 mb-4">Evolução dos metros executados</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={evolucaoMetros}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip formatter={(v: number) => [`${v.toLocaleString()} m`, 'Metros']} />
              <Line type="monotone" dataKey="metros" stroke="#2563eb" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

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
