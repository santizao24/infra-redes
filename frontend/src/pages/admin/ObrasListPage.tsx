import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Eye, Pencil, Trash2, HardHat } from 'lucide-react';
import { obrasApi } from '../../services/endpoints';
import type { Obra } from '../../types';
import { OBRA_ESTADO_LABELS, OBRA_TIPO_LABELS, ESTADO_COLORS, calcProgresso } from '../../utils/labels';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { PageLoader } from '../../components/ui/Loading';
import { EmptyState } from '../../components/ui/EmptyState';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function ObrasListPage() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [obras, setObras] = useState<Obra[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [estado, setEstado] = useState('');
  const [tipo, setTipo] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadObras = () => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (estado) params.estado = estado;
    if (tipo) params.tipo = tipo;
    obrasApi.getAll(params).then((res) => setObras(res.data)).finally(() => setLoading(false));
  };

  useEffect(() => { loadObras(); }, [search, estado, tipo]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await obrasApi.delete(deleteId);
      toast.success('Obra eliminada com sucesso');
      setDeleteId(null);
      loadObras();
    } catch {
      toast.error('Erro ao eliminar obra');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Obras</h1>
          <p className="text-sm text-slate-500">Gestão de obras da empresa</p>
        </div>
        <Link to="/gestao/obras/nova">
          <Button className="gap-2"><Plus className="w-4 h-4" /> Nova obra</Button>
        </Link>
      </div>

      <Card className="!p-4">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative sm:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Pesquisar obras..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <Select
            options={[
              { value: '', label: 'Todos os estados' },
              ...Object.entries(OBRA_ESTADO_LABELS).map(([k, v]) => ({ value: k, label: v })),
            ]}
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
          />
          <Select
            options={[
              { value: '', label: 'Todos os tipos' },
              ...Object.entries(OBRA_TIPO_LABELS).map(([k, v]) => ({ value: k, label: v })),
            ]}
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
          />
        </div>
      </Card>

      {loading ? (
        <PageLoader />
      ) : obras.length === 0 ? (
        <EmptyState
          icon={HardHat}
          title="Nenhuma obra encontrada"
          description="Crie uma nova obra ou ajuste os filtros de pesquisa."
          action={<Link to="/gestao/obras/nova"><Button>Nova obra</Button></Link>}
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-white rounded-xl border border-slate-200 text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500">
                <th className="p-4 font-medium">Obra</th>
                <th className="p-4 font-medium hidden md:table-cell">Cliente</th>
                <th className="p-4 font-medium">Tipo</th>
                <th className="p-4 font-medium">Estado</th>
                <th className="p-4 font-medium hidden lg:table-cell">Progresso</th>
                <th className="p-4 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {obras.map((obra) => (
                <tr key={obra.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-4">
                    <p className="font-medium text-slate-900">{obra.nome}</p>
                    <p className="text-xs text-slate-500">{obra.referencia}</p>
                  </td>
                  <td className="p-4 hidden md:table-cell text-slate-600">{obra.cliente}</td>
                  <td className="p-4"><Badge className="bg-primary-50 text-primary-700">{OBRA_TIPO_LABELS[obra.tipo]}</Badge></td>
                  <td className="p-4"><Badge className={ESTADO_COLORS[obra.estado]}>{OBRA_ESTADO_LABELS[obra.estado]}</Badge></td>
                  <td className="p-4 hidden lg:table-cell w-40">
                    <ProgressBar value={calcProgresso(obra.metrosPrevistos, obra.metrosExecutados)} size="sm" />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => navigate(`/gestao/obras/${obra.id}`)} className="p-2 rounded-lg hover:bg-slate-100" title="Ver">
                        <Eye className="w-4 h-4 text-slate-500" />
                      </button>
                      <button onClick={() => navigate(`/gestao/obras/${obra.id}/editar`)} className="p-2 rounded-lg hover:bg-slate-100" title="Editar">
                        <Pencil className="w-4 h-4 text-slate-500" />
                      </button>
                      {isAdmin && (
                        <button onClick={() => setDeleteId(obra.id)} className="p-2 rounded-lg hover:bg-red-50" title="Eliminar">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Confirmar eliminação" size="sm">
        <p className="text-slate-600 mb-6">Tem a certeza que pretende eliminar esta obra? Esta ação é irreversível.</p>
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={() => setDeleteId(null)}>Cancelar</Button>
          <Button variant="danger" loading={deleting} onClick={handleDelete}>Eliminar</Button>
        </div>
      </Modal>
    </div>
  );
}
