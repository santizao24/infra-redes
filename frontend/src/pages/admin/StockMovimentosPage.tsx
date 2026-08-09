import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ArrowDownCircle, ArrowUpCircle, Package, ArrowLeft } from 'lucide-react';
import { stockApi, obrasApi } from '../../services/endpoints';
import type { Material, MovimentoStock, Obra } from '../../types';
import { UNIDADE_LABELS, formatDate } from '../../utils/labels';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { PageLoader } from '../../components/ui/Loading';
import { EmptyState } from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';

const defaultForm = {
  materialId: '', tipo: 'ENTRADA' as 'ENTRADA' | 'SAIDA', quantidade: 1,
  data: new Date().toISOString().split('T')[0], obraId: '', fornecedor: '',
  responsavel: '', observacoes: '',
};

export default function StockMovimentosPage() {
  const [movimentos, setMovimentos] = useState<MovimentoStock[]>([]);
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [obras, setObras] = useState<Obra[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTipo, setFilterTipo] = useState('');
  const [filterMaterial] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);

  const loadMovimentos = () => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (filterTipo) params.tipo = filterTipo;
    if (filterMaterial) params.materialId = filterMaterial;
    stockApi.getMovimentos(params).then((res) => setMovimentos(res.data)).finally(() => setLoading(false));
  };

  useEffect(() => { loadMovimentos(); }, [filterTipo, filterMaterial]);

  const openModal = () => {
    Promise.all([stockApi.getAll(), obrasApi.getAll()]).then(([matRes, obrasRes]) => {
      setMateriais(matRes.data);
      setObras(obrasRes.data);
    });
    setForm(defaultForm);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.materialId) {
      toast.error('Selecione um material');
      return;
    }
    setSaving(true);
    try {
      await stockApi.createMovimento({
        ...form,
        obraId: form.obraId || null,
        fornecedor: form.fornecedor || null,
        responsavel: form.responsavel || null,
        observacoes: form.observacoes || null,
      });
      toast.success(form.tipo === 'ENTRADA' ? 'Entrada registada' : 'Saída registada');
      setModalOpen(false);
      loadMovimentos();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Erro ao registar movimento';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const selectedMaterial = materiais.find((m) => m.id === form.materialId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/stock" className="p-2 rounded-lg hover:bg-slate-100">
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Movimentos de Stock</h1>
            <p className="text-sm text-slate-500">Entradas e saídas de materiais</p>
          </div>
        </div>
        <Button className="gap-2" onClick={openModal}><Plus className="w-4 h-4" /> Novo movimento</Button>
      </div>

      <Card className="!p-4">
        <div className="flex flex-wrap gap-3">
          <Select
            options={[
              { value: '', label: 'Todos os tipos' },
              { value: 'ENTRADA', label: '↓ Entradas' },
              { value: 'SAIDA', label: '↑ Saídas' },
            ]}
            value={filterTipo}
            onChange={(e) => setFilterTipo(e.target.value)}
          />
        </div>
      </Card>

      {loading ? (
        <PageLoader />
      ) : movimentos.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Sem movimentos"
          description="Registe entradas e saídas de materiais."
          action={<Button onClick={openModal}>Novo movimento</Button>}
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-white rounded-xl border border-slate-200 text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500">
                <th className="p-4 font-medium">Tipo</th>
                <th className="p-4 font-medium">Material</th>
                <th className="p-4 font-medium">Quantidade</th>
                <th className="p-4 font-medium hidden md:table-cell">Obra</th>
                <th className="p-4 font-medium hidden lg:table-cell">Utilizador</th>
                <th className="p-4 font-medium">Data</th>
                <th className="p-4 font-medium hidden lg:table-cell">Observações</th>
              </tr>
            </thead>
            <tbody>
              {movimentos.map((m) => (
                <tr key={m.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-4">
                    {m.tipo === 'ENTRADA' ? (
                      <Badge className="bg-green-100 text-green-700"><ArrowDownCircle className="w-3.5 h-3.5 mr-1 inline" /> Entrada</Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-700"><ArrowUpCircle className="w-3.5 h-3.5 mr-1 inline" /> Saída</Badge>
                    )}
                  </td>
                  <td className="p-4">
                    <p className="font-medium text-slate-900">{m.material?.nome}</p>
                    <p className="text-xs text-slate-500">{m.material?.codigo}</p>
                  </td>
                  <td className="p-4 font-semibold text-slate-900">
                    {m.tipo === 'ENTRADA' ? '+' : '-'}{m.quantidade} {m.material?.unidade ? UNIDADE_LABELS[m.material.unidade] : ''}
                  </td>
                  <td className="p-4 hidden md:table-cell text-slate-600">{m.obra?.nome || '—'}</td>
                  <td className="p-4 hidden lg:table-cell text-slate-600">{m.utilizador?.nome || '—'}</td>
                  <td className="p-4 text-slate-600">{formatDate(m.data)}</td>
                  <td className="p-4 hidden lg:table-cell text-slate-500 text-xs max-w-[200px] truncate">{m.observacoes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Registar Movimento de Stock" size="lg">
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Tipo de movimento</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, tipo: 'ENTRADA' })}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium border-2 transition-colors ${
                    form.tipo === 'ENTRADA' ? 'border-green-500 bg-green-50 text-green-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <ArrowDownCircle className="w-5 h-5" /> Entrada
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, tipo: 'SAIDA' })}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium border-2 transition-colors ${
                    form.tipo === 'SAIDA' ? 'border-red-500 bg-red-50 text-red-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <ArrowUpCircle className="w-5 h-5" /> Saída
                </button>
              </div>
            </div>
            <Select
              label="Material *"
              options={[
                { value: '', label: '— Selecionar material —' },
                ...materiais.map((m) => ({ value: m.id, label: `${m.nome} (${m.quantidadeStock} ${UNIDADE_LABELS[m.unidade]})` })),
              ]}
              value={form.materialId}
              onChange={(e) => setForm({ ...form, materialId: e.target.value })}
            />
            <Input
              label={`Quantidade${selectedMaterial ? ` (${UNIDADE_LABELS[selectedMaterial.unidade]})` : ''}`}
              type="number" min={1} value={form.quantidade}
              onChange={(e) => setForm({ ...form, quantidade: parseFloat(e.target.value) || 0 })}
            />
            <Input label="Data" type="date" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} />
            {form.tipo === 'ENTRADA' ? (
              <Input label="Fornecedor" value={form.fornecedor} onChange={(e) => setForm({ ...form, fornecedor: e.target.value })} />
            ) : (
              <>
                <Select
                  label="Obra associada"
                  options={[
                    { value: '', label: '— Nenhuma —' },
                    ...obras.map((o) => ({ value: o.id, label: o.nome })),
                  ]}
                  value={form.obraId}
                  onChange={(e) => setForm({ ...form, obraId: e.target.value })}
                />
                <Input label="Responsável" value={form.responsavel} onChange={(e) => setForm({ ...form, responsavel: e.target.value })} />
              </>
            )}
          </div>
          <Textarea label="Observações" value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} />
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button loading={saving} onClick={handleSave}>Registar movimento</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
