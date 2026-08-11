import { useEffect, useState } from 'react';
import { Users, Plus, Trash2, Shield, UserCheck } from 'lucide-react';
import { authApi } from '../../services/endpoints';
import type { User } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { PageLoader } from '../../components/ui/Loading';
import { EmptyState } from '../../components/ui/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/labels';
import toast from 'react-hot-toast';

const defaultForm = { nome: '', email: '', password: '', role: 'ADMIN' };

export default function UtilizadoresPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<(User & { createdAt?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadUsers = () => {
    setLoading(true);
    authApi.getUsers().then((res) => setUsers(res.data)).finally(() => setLoading(false));
  };

  useEffect(() => { loadUsers(); }, []);

  const handleCreate = async () => {
    if (!form.nome || !form.email || !form.password) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    setSaving(true);
    try {
      await authApi.createUser(form);
      toast.success('Utilizador criado com sucesso');
      setModalOpen(false);
      setForm(defaultForm);
      loadUsers();
    } catch {
      toast.error('Erro ao criar utilizador. Verifique se o email já existe.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await authApi.deleteUser(deleteId);
      toast.success('Utilizador eliminado');
      setDeleteId(null);
      loadUsers();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Erro ao eliminar utilizador';
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-primary-600" /> Utilizadores
          </h1>
          <p className="text-sm text-slate-500">Gestão de acessos ao sistema</p>
        </div>
        <Button className="gap-2" onClick={() => setModalOpen(true)}>
          <Plus className="w-4 h-4" /> Novo utilizador
        </Button>
      </div>

      {users.length === 0 ? (
        <EmptyState icon={Users} title="Nenhum utilizador encontrado" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {users.map((u) => (
            <Card key={u.id} className="relative">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                  u.role === 'ADMIN' ? 'bg-primary-600' : 'bg-slate-500'
                }`}>
                  {u.nome.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 truncate">{u.nome}</p>
                  <p className="text-sm text-slate-500 truncate">{u.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={u.role === 'ADMIN' ? 'bg-primary-100 text-primary-700' : 'bg-slate-100 text-slate-600'}>
                      {u.role === 'ADMIN' ? (
                        <><Shield className="w-3 h-3 mr-1 inline" /> Administrador</>
                      ) : (
                        <><UserCheck className="w-3 h-3 mr-1 inline" /> Gestor</>
                      )}
                    </Badge>
                  </div>
                  {u.createdAt && (
                    <p className="text-xs text-slate-400 mt-2">Criado em {formatDate(u.createdAt)}</p>
                  )}
                </div>
                {u.id !== currentUser?.id && (
                  <button
                    onClick={() => setDeleteId(u.id)}
                    className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                    title="Eliminar utilizador"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Novo Utilizador" size="sm">
        <div className="space-y-4">
          <Input label="Nome *" required value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
          <Input label="Email *" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input label="Password *" type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Mínimo 6 caracteres" />
          <Select
            label="Nível de acesso"
            options={[
              { value: 'ADMIN', label: 'Administrador' },
            ]}
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          />
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button loading={saving} onClick={handleCreate}>Criar utilizador</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Confirmar eliminação" size="sm">
        <p className="text-slate-600 mb-6">Tem a certeza que pretende eliminar este utilizador? Esta ação é irreversível.</p>
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={() => setDeleteId(null)}>Cancelar</Button>
          <Button variant="danger" loading={deleting} onClick={handleDelete}>Eliminar</Button>
        </div>
      </Modal>
    </div>
  );
}
