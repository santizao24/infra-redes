import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { dashboardApi } from '../../services/endpoints';
import type { Obra, Material, MovimentoStock } from '../../types';
import { OBRA_ESTADO_LABELS, OBRA_TIPO_LABELS, formatDate } from '../../utils/labels';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { PageLoader } from '../../components/ui/Loading';
import { BarChart3, HardHat, Package, ArrowDownCircle, ArrowUpCircle, Download, Printer } from 'lucide-react';
import { Button } from '../../components/ui/Button';

const CHART_COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'];

interface RelatorioData {
  obras: Obra[];
  materiais: Material[];
  movimentosRecentes: (MovimentoStock & { material?: { nome: string; codigo: string }; obra?: { nome: string } })[];
}

export default function RelatoriosPage() {
  const [data, setData] = useState<RelatorioData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.getRelatorios().then((res) => setData(res.data)).finally(() => setLoading(false));
  }, []);

  const exportCSV = () => {
    if (!data) return;
    const headers = ['Obra', 'Referência', 'Cliente', 'Tipo', 'Estado', 'Metros Previstos', 'Metros Executados'];
    const rows = data.obras.map((o) => [
      `"${o.nome.replace(/"/g, '""')}"`,
      `"${o.referencia}"`,
      `"${o.cliente.replace(/"/g, '""')}"`,
      `"${OBRA_TIPO_LABELS[o.tipo] || o.tipo}"`,
      `"${OBRA_ESTADO_LABELS[o.estado] || o.estado}"`,
      o.metrosPrevistos,
      o.metrosExecutados,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `relatorio_obras_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <PageLoader />;
  if (!data) return null;

  const { obras, materiais, movimentosRecentes } = data;

  // Resumos calculados
  const obrasPorEstado = Object.entries(OBRA_ESTADO_LABELS).map(([key, label]) => ({
    name: label,
    count: obras.filter((o) => o.estado === key).length,
  })).filter((e) => e.count > 0);

  const obrasPorTipo = Object.entries(OBRA_TIPO_LABELS).map(([key, label]) => ({
    name: label,
    count: obras.filter((o) => o.tipo === key).length,
  })).filter((e) => e.count > 0);

  const totalMetros = obras.reduce((sum, o) => sum + o.metrosExecutados, 0);

  const valorStock = materiais.reduce((sum, m) => sum + m.quantidadeStock * m.precoUnitario, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary-600" /> Relatórios
          </h1>
          <p className="text-sm text-slate-500">Visão geral de obras, stock e movimentos</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={exportCSV} className="gap-2">
            <Download className="w-4 h-4" /> Exportar CSV
          </Button>
          <Button variant="ghost" size="sm" onClick={handlePrint} className="gap-2">
            <Printer className="w-4 h-4" /> Imprimir / PDF
          </Button>
        </div>
      </div>

      {/* Resumo geral */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="!p-4 text-center">
          <p className="text-2xl font-bold text-slate-900">{obras.length}</p>
          <p className="text-xs text-slate-500">Total de obras</p>
        </Card>
        <Card className="!p-4 text-center">
          <p className="text-2xl font-bold text-primary-600">{totalMetros.toLocaleString()} m</p>
          <p className="text-xs text-slate-500">Metros executados</p>
        </Card>
        <Card className="!p-4 text-center">
          <p className="text-2xl font-bold text-slate-900">{materiais.length}</p>
          <p className="text-xs text-slate-500">Materiais em stock</p>
        </Card>
        <Card className="!p-4 text-center">
          <p className="text-2xl font-bold text-emerald-600">{valorStock.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}</p>
          <p className="text-xs text-slate-500">Valor total do stock</p>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <HardHat className="w-5 h-5 text-primary-600" /> Obras por estado
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={obrasPorEstado}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-primary-600" /> Obras por tipo
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={obrasPorTipo}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="count"
                label={({ name, count }) => `${name}: ${count}`}
              >
                {obrasPorTipo.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Tabela de obras */}
      <Card>
        <h3 className="font-semibold text-slate-900 mb-4">Resumo de todas as obras</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500">
                <th className="pb-3 font-medium">Obra</th>
                <th className="pb-3 font-medium">Tipo</th>
                <th className="pb-3 font-medium">Estado</th>
                <th className="pb-3 font-medium text-right">Previstos</th>
                <th className="pb-3 font-medium text-right">Executados</th>
                <th className="pb-3 font-medium text-right">Progresso</th>
              </tr>
            </thead>
            <tbody>
              {obras.map((o) => {
                const pct = o.metrosPrevistos > 0 ? Math.round((o.metrosExecutados / o.metrosPrevistos) * 100) : 0;
                return (
                  <tr key={o.id} className="border-b border-slate-100">
                    <td className="py-2.5 font-medium text-slate-900">{o.nome}</td>
                    <td className="py-2.5"><Badge className="bg-primary-50 text-primary-700">{OBRA_TIPO_LABELS[o.tipo]}</Badge></td>
                    <td className="py-2.5">{OBRA_ESTADO_LABELS[o.estado]}</td>
                    <td className="py-2.5 text-right">{o.metrosPrevistos.toLocaleString()} m</td>
                    <td className="py-2.5 text-right">{o.metrosExecutados.toLocaleString()} m</td>
                    <td className="py-2.5 text-right font-semibold">{pct}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Movimentos recentes */}
      <Card>
        <h3 className="font-semibold text-slate-900 mb-4">Movimentos recentes de stock</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500">
                <th className="pb-3 font-medium">Tipo</th>
                <th className="pb-3 font-medium">Material</th>
                <th className="pb-3 font-medium">Quantidade</th>
                <th className="pb-3 font-medium hidden md:table-cell">Obra</th>
                <th className="pb-3 font-medium">Data</th>
              </tr>
            </thead>
            <tbody>
              {movimentosRecentes.slice(0, 20).map((m) => (
                <tr key={m.id} className="border-b border-slate-100">
                  <td className="py-2.5">
                    {m.tipo === 'ENTRADA' ? (
                      <Badge className="bg-green-100 text-green-700"><ArrowDownCircle className="w-3 h-3 mr-1 inline" />Entrada</Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-700"><ArrowUpCircle className="w-3 h-3 mr-1 inline" />Saída</Badge>
                    )}
                  </td>
                  <td className="py-2.5 font-medium text-slate-900">{m.material?.nome}</td>
                  <td className="py-2.5">{m.quantidade}</td>
                  <td className="py-2.5 hidden md:table-cell text-slate-600">{m.obra?.nome || '—'}</td>
                  <td className="py-2.5 text-slate-600">{formatDate(m.data)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
