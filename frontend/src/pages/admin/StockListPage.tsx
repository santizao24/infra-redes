import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Pencil, Trash2, Package, AlertCircle, ArrowRightLeft } from 'lucide-react';
import { stockApi } from '../../services/endpoints';
import type { Material } from '../../types';
import { CATEGORIA_LABELS, UNIDADE_LABELS } from '../../utils/labels';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { PageLoader } from '../../components/ui/Loading';
import { EmptyState } from '../../components/ui/EmptyState';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const emptyMaterial = {
  codigo: '', nome: '', categoria: 'TUBAGENS', descricao: '', unidade: 'METRO',
  quantidadeStock: 0, stockMinimo: 0, localizacao: '', fornecedor: '', precoUnitario: 0,
};

export default function StockListPage() {
  const { isAdmin } = useAuth();
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoria, setCategoria] = useState('');
  const [stockBaixo, setStockBaixo] = useState(false);
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [form, setForm] = useState(emptyMaterial);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadMateriais = () => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (categoria) params.categoria = categoria;
    if (stockBaixo) params.stockBaixo = 'true';
    stockApi.getAll(params).then((res) => setMateriais(res.data)).finally(() => setLoading(false));
  };

  useEffect(() => { loadMateriais(); }, [search, categoria, stockBaixo]);

  const openCreate = () => {
    setForm(emptyMaterial);
    setEditId(null);
    setModal('create');
  };

  const openEdit = (m: Material) => {
    setForm({
      codigo: m.codigo, nome: m.nome, categoria: m.categoria, descricao: m.descricao || '',
      unidade: m.unidade, quantidadeStock: m.quantidadeStock, stockMinimo: m.stockMinimo,
      localizacao: m.localizacao || '', fornecedor: m.fornecedor || '', precoUnitario: m.precoUnitario,
    });
    setEditId(m.id);
    setModal('edit');
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (modal === 'edit' && editId) {
        await stockApi.update(editId, form);
        toast.success('Material atualizado');
      } else {
        await stockApi.create(form);
        toast.success('Material adicionado');
      }
      setModal(null);
      loadMateriais();
    } catch {
      toast.error('Erro ao guardar material');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await stockApi.delete(deleteId);
      toast.success('Material eliminado');
      setDeleteId(null);
      loadMateriais();
    } catch {
      toast.error('Erro ao eliminar material');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Stock</h1>
          <p className="text-sm text-slate-500">Gestão de materiais em armazém</p>
        </div>
        <div className="flex gap-2">
          <Link to="/stock/movimentos">
            <Button variant="secondary" className="gap-2"><ArrowRightLeft className="w-4 h-4" /> Movimentos</Button>
          </Link>
          {isAdmin && (
            <Button className="gap-2" onClick={openCreate}><Plus className="w-4 h-4" /> Novo material</Button>
          )}
        </div>
      </div>

      <Card className="!p-4">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative sm:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Pesquisar materiais..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <Select
            options={[
              { value: '', label: 'Todas as categorias' },
              ...Object.entries(CATEGORIA_LABELS).map(([k, v]) => ({ value: k, label: v })),
            ]}
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
          />
          <button
            onClick={() => setStockBaixo(!stockBaixo)}
            className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
              stockBaixo ? 'bg-red-50 border-red-300 text-red-700' : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <AlertCircle className="w-4 h-4" /> Stock baixo
          </button>
        </div>
      </Card>

      {loading ? (
        <PageLoader />
      ) : materiais.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Nenhum material encontrado"
          description="Adicione materiais ou ajuste os filtros."
          action={isAdmin ? <Button onClick={openCreate}>Novo material</Button> : undefined}
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-white rounded-xl border border-slate-200 text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500">
                <th className="p-4 font-medium">Código</th>
                <th className="p-4 font-medium">Material</th>
                <th className="p-4 font-medium hidden md:table-cell">Categoria</th>
                <th className="p-4 font-medium">Stock</th>
                <th className="p-4 font-medium hidden lg:table-cell">Fornecedor</th>
                <th className="p-4 font-medium hidden lg:table-cell">Preço</th>
                <th className="p-4 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {materiais.map((m) => (
                <tr key={m.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-4 font-mono text-xs text-slate-500">{m.codigo}</td>
                  <td className="p-4">
                    <p className="font-medium text-slate-900">{m.nome}</p>
                    <p className="text-xs text-slate-500 md:hidden">{CATEGORIA_LABELS[m.categoria]}</p>
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <Badge className="bg-slate-100 text-slate-600">{CATEGORIA_LABELS[m.categoria]}</Badge>
                  </td>
                  <td className="p-4">
                    <span className={`font-semibold ${m.stockBaixo ? 'text-red-600' : 'text-slate-900'}`}>
                      {m.quantidadeStock} {UNIDADE_LABELS[m.unidade]}
                    </span>
                    {m.stockBaixo && (
                      <Badge className="bg-red-100 text-red-700 ml-2">Baixo</Badge>
                    )}
                    <p className="text-xs text-slate-400">Mín: {m.stockMinimo}</p>
                  </td>
                  <td className="p-4 hidden lg:table-cell text-slate-600">{m.fornecedor || '—'}</td>
                  <td className="p-4 hidden lg:table-cell text-slate-600">{m.precoUnitario.toFixed(2)} €</td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-1">
                      {isAdmin && (
                        <>
                          <button onClick={() => openEdit(m)} className="p-2 rounded-lg hover:bg-slate-100" title="Editar">
                            <Pencil className="w-4 h-4 text-slate-500" />
                          </button>
                          <button onClick={() => setDeleteId(m.id)} className="p-2 rounded-lg hover:bg-red-50" title="Eliminar">
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        open={modal !== null}
        onClose={() => setModal(null)}
        title={modal === 'edit' ? 'Editar Material' : 'Novo Material'}
        size="lg"
      >
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Código *" required value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} />
          <Input label="Nome *" required value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
          <Select
            label="Categoria"
            options={Object.entries(CATEGORIA_LABELS).map(([k, v]) => ({ value: k, label: v }))}
            value={form.categoria}
            onChange={(e) => setForm({ ...form, categoria: e.target.value })}
          />
          <Select
            label="Unidade"
            options={Object.entries(UNIDADE_LABELS).map(([k, v]) => ({ value: k, label: v }))}
            value={form.unidade}
            onChange={(e) => setForm({ ...form, unidade: e.target.value })}
          />
          <Input label="Quantidade em stock" type="number" min={0} value={form.quantidadeStock} onChange={(e) => setForm({ ...form, quantidadeStock: parseFloat(e.target.value) || 0 })} />
          <Input label="Stock mínimo" type="number" min={0} value={form.stockMinimo} onChange={(e) => setForm({ ...form, stockMinimo: parseFloat(e.target.value) || 0 })} />
          <Input label="Localização" value={form.localizacao} onChange={(e) => setForm({ ...form, localizacao: e.target.value })} />
          <Input label="Fornecedor" value={form.fornecedor} onChange={(e) => setForm({ ...form, fornecedor: e.target.value })} />
          <Input label="Preço unitário (€)" type="number" min={0} step={0.01} value={form.precoUnitario} onChange={(e) => setForm({ ...form, precoUnitario: parseFloat(e.target.value) || 0 })} />
          <div className="sm:col-span-2">
            <Textarea label="Descrição" value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
          </div>
        </div>
        <div className="flex gap-3 justify-end mt-6">
          <Button variant="ghost" onClick={() => setModal(null)}>Cancelar</Button>
          <Button loading={saving} onClick={handleSave}>{modal === 'edit' ? 'Guardar' : 'Criar material'}</Button>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Confirmar eliminação" size="sm">
        <p className="text-slate-600 mb-6">Tem a certeza que pretende eliminar este material? Esta ação é irreversível.</p>
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={() => setDeleteId(null)}>Cancelar</Button>
          <Button variant="danger" loading={deleting} onClick={handleDelete}>Eliminar</Button>
        </div>
      </Modal>
    </div>
  );
}
