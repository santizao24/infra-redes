import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { obrasApi } from '../../services/endpoints';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Card } from '../../components/ui/Card';
import { MapPicker, LocationSearch } from '../../components/map/MapComponents';
import { PageLoader } from '../../components/ui/Loading';
import { metrosEmFalta } from '../../utils/labels';
import toast from 'react-hot-toast';

const defaultForm = {
  nome: '', referencia: '', cliente: '', tipo: 'AGUA', estado: 'PLANEADA', responsavel: '',
  dataInicio: '', dataPrevistaFim: '', dataFim: '', latitude: null as number | null,
  longitude: null as number | null, morada: '', metrosPrevistos: 0, metrosExecutados: 0,
  tipoPavimento: '', estadoPavimento: '', areaPavimento: '', dataReposicaoProvisoria: '',
  dataReposicaoDefinitiva: '', observacoesPavimento: '', descricao: '', publica: true,
};

export default function ObraFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEdit && id) {
      obrasApi.getById(id).then((res) => {
        const o = res.data;
        setForm({
          nome: o.nome, referencia: o.referencia, cliente: o.cliente, tipo: o.tipo,
          estado: o.estado, responsavel: o.responsavel,
          dataInicio: o.dataInicio?.split('T')[0] || '', dataPrevistaFim: o.dataPrevistaFim?.split('T')[0] || '',
          dataFim: o.dataFim?.split('T')[0] || '', latitude: o.latitude ?? null, longitude: o.longitude ?? null,
          morada: o.morada || '', metrosPrevistos: o.metrosPrevistos, metrosExecutados: o.metrosExecutados,
          tipoPavimento: o.tipoPavimento || '', estadoPavimento: o.estadoPavimento || '',
          areaPavimento: o.areaPavimento?.toString() || '',
          dataReposicaoProvisoria: o.dataReposicaoProvisoria?.split('T')[0] || '',
          dataReposicaoDefinitiva: o.dataReposicaoDefinitiva?.split('T')[0] || '',
          observacoesPavimento: o.observacoesPavimento || '', descricao: o.descricao || '', publica: o.publica,
        });
      }).finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        tipoPavimento: form.tipoPavimento || null,
        estadoPavimento: form.estadoPavimento || null,
        areaPavimento: form.areaPavimento ? parseFloat(form.areaPavimento) : null,
        dataInicio: form.dataInicio || null,
        dataPrevistaFim: form.dataPrevistaFim || null,
        dataFim: form.dataFim || null,
        dataReposicaoProvisoria: form.dataReposicaoProvisoria || null,
        dataReposicaoDefinitiva: form.dataReposicaoDefinitiva || null,
      };

      if (isEdit && id) {
        await obrasApi.update(id, payload as Record<string, unknown>);
        toast.success('Obra atualizada com sucesso');
        navigate(`/gestao/obras/${id}`);
      } else {
        const res = await obrasApi.create(payload as Record<string, unknown>);
        toast.success('Obra criada com sucesso');
        navigate(`/gestao/obras/${res.data.id}`);
      }
    } catch (err: any) {
      console.error('Error saving/creating obra:', err);
      const msg = err.response?.data?.error || err.message || 'Erro ao guardar obra';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageLoader />;

  const faltam = metrosEmFalta(form.metrosPrevistos, form.metrosExecutados);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{isEdit ? 'Editar Obra' : 'Nova Obra'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <h2 className="font-semibold text-slate-900 mb-4">Informação geral</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Nome da obra *" required value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
            <Input label="Referência *" required value={form.referencia} onChange={(e) => setForm({ ...form, referencia: e.target.value })} />
            <Input label="Cliente *" required value={form.cliente} onChange={(e) => setForm({ ...form, cliente: e.target.value })} />
            <Input label="Responsável *" required value={form.responsavel} onChange={(e) => setForm({ ...form, responsavel: e.target.value })} />
            <Select label="Tipo" options={[
              { value: 'AGUA', label: 'Água' }, { value: 'SANEAMENTO', label: 'Saneamento' },
              { value: 'GAS', label: 'Gás' }, { value: 'AGUA_SANEAMENTO', label: 'Água + Saneamento' },
              { value: 'OUTRA', label: 'Outra' },
            ]} value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} />
            <Select label="Estado" options={[
              { value: 'PLANEADA', label: 'Planeada' }, { value: 'EM_PREPARACAO', label: 'Em preparação' },
              { value: 'EM_EXECUCAO', label: 'Em execução' }, { value: 'SUSPENSA', label: 'Suspensa' },
              { value: 'CONCLUIDA', label: 'Concluída' },
            ]} value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })} />
            <Input label="Data de início" type="date" value={form.dataInicio} onChange={(e) => setForm({ ...form, dataInicio: e.target.value })} />
            <Input label="Previsão conclusão" type="date" value={form.dataPrevistaFim} onChange={(e) => setForm({ ...form, dataPrevistaFim: e.target.value })} />
            <Input label="Data conclusão" type="date" value={form.dataFim} onChange={(e) => setForm({ ...form, dataFim: e.target.value })} />
          </div>
          <div className="mt-4">
            <Textarea label="Descrição" value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
          </div>
        </Card>

        <Card>
          <h2 className="font-semibold text-slate-900 mb-4">Localização</h2>
          <div className="space-y-4">
            <LocationSearch onSelect={(lat, lng, address) => setForm({ ...form, latitude: lat, longitude: lng, morada: address })} />
            <Input label="Morada" value={form.morada} onChange={(e) => setForm({ ...form, morada: e.target.value })} />
            <MapPicker
              latitude={form.latitude}
              longitude={form.longitude}
              onLocationChange={(lat, lng) => setForm({ ...form, latitude: lat, longitude: lng })}
            />
            {form.latitude && form.longitude && (
              <p className="text-xs text-slate-500">Coordenadas: {form.latitude.toFixed(6)}, {form.longitude.toFixed(6)}</p>
            )}
          </div>
        </Card>

        <Card>
          <h2 className="font-semibold text-slate-900 mb-4">Metros executados</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <Input label="Metros previstos" type="number" min={0} value={form.metrosPrevistos} onChange={(e) => setForm({ ...form, metrosPrevistos: parseFloat(e.target.value) || 0 })} />
            <Input label="Metros executados" type="number" min={0} value={form.metrosExecutados} onChange={(e) => setForm({ ...form, metrosExecutados: parseFloat(e.target.value) || 0 })} />
            <Input label="Metros em falta" value={faltam} disabled />
          </div>
        </Card>

        <Card>
          <h2 className="font-semibold text-slate-900 mb-4">Pavimento</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Select label="Tipo de pavimento" options={[
              { value: '', label: '— Selecionar —' },
              { value: 'ASFALTO', label: 'Asfalto' }, { value: 'BETAO', label: 'Betão' },
              { value: 'CALCADA', label: 'Calçada' }, { value: 'TERRA', label: 'Terra' },
              { value: 'PARALELOS', label: 'Paralelos' }, { value: 'OUTRO', label: 'Outro' },
            ]} value={form.tipoPavimento} onChange={(e) => setForm({ ...form, tipoPavimento: e.target.value })} />
            <Select label="Estado do pavimento" options={[
              { value: '', label: '— Selecionar —' },
              { value: 'PROVISORIO', label: 'Provisório' }, { value: 'DEFINITIVO', label: 'Definitivo/Completo' },
            ]} value={form.estadoPavimento} onChange={(e) => setForm({ ...form, estadoPavimento: e.target.value })} />
            <Input label="Área intervencionada (m²)" type="number" value={form.areaPavimento} onChange={(e) => setForm({ ...form, areaPavimento: e.target.value })} />
            <Input label="Reposição provisória" type="date" value={form.dataReposicaoProvisoria} onChange={(e) => setForm({ ...form, dataReposicaoProvisoria: e.target.value })} />
            <Input label="Reposição definitiva" type="date" value={form.dataReposicaoDefinitiva} onChange={(e) => setForm({ ...form, dataReposicaoDefinitiva: e.target.value })} />
          </div>
          <div className="mt-4">
            <Textarea label="Observações" value={form.observacoesPavimento} onChange={(e) => setForm({ ...form, observacoesPavimento: e.target.value })} />
          </div>
        </Card>

        <div className="flex gap-3 justify-end">
          <Button variant="ghost" type="button" onClick={() => navigate(-1)}>Cancelar</Button>
          <Button type="submit" loading={saving}>{isEdit ? 'Guardar alterações' : 'Criar obra'}</Button>
        </div>
      </form>
    </div>
  );
}
