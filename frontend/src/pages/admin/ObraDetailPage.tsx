import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Pencil, ArrowLeft, MapPin, Calendar, User, HardHat, Ruler, Layers,
  Clock, Plus, Package,
} from 'lucide-react';
import { obrasApi, stockApi } from '../../services/endpoints';
import type { Obra, Material } from '../../types';
import {
  OBRA_ESTADO_LABELS, OBRA_TIPO_LABELS, ESTADO_COLORS, PAVIMENTO_TIPO_LABELS,
  PAVIMENTO_ESTADO_LABELS, formatDate, calcProgresso, metrosEmFalta, UNIDADE_LABELS,
} from '../../utils/labels';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Modal } from '../../components/ui/Modal';
import { Select } from '../../components/ui/Select';
import { Input } from '../../components/ui/Input';
import { PageLoader } from '../../components/ui/Loading';
import { MapPicker } from '../../components/map/MapComponents';
import toast from 'react-hot-toast';

export default function ObraDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [obra, setObra] = useState<Obra | null>(null);
  const [loading, setLoading] = useState(true);
  const [materialModal, setMaterialModal] = useState(false);
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [materialQty, setMaterialQty] = useState(1);
  const [addingMaterial, setAddingMaterial] = useState(false);

  const loadObra = () => {
    if (!id) return;
    obrasApi.getById(id).then((res) => setObra(res.data)).finally(() => setLoading(false));
  };

  useEffect(() => {
    loadObra();
  }, [id]);

  const openMaterialModal = () => {
    stockApi.getAll().then((res) => setMateriais(res.data));
    setMaterialModal(true);
  };

  const handleAddMaterial = async () => {
    if (!id || !selectedMaterial) return;
    setAddingMaterial(true);
    try {
      await obrasApi.addMaterial(id, selectedMaterial, materialQty);
      toast.success('Material registado na obra');
      setMaterialModal(false);
      setSelectedMaterial('');
      setMaterialQty(1);
      loadObra();
    } catch {
      toast.error('Erro ao registar material');
    } finally {
      setAddingMaterial(false);
    }
  };

  if (loading) return <PageLoader />;
  if (!obra) return <div className="text-center py-20 text-slate-500">Obra não encontrada.</div>;

  const progresso = calcProgresso(obra.metrosPrevistos, obra.metrosExecutados);
  const faltam = metrosEmFalta(obra.metrosPrevistos, obra.metrosExecutados);
  const pavimentoPendente = obra.tipoPavimento && obra.estadoPavimento === 'PROVISORIO';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/gestao/obras')} className="p-2 rounded-lg hover:bg-slate-100">
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{obra.nome}</h1>
            <p className="text-sm text-slate-500">{obra.referencia}</p>
          </div>
        </div>
        <Link to={`/gestao/obras/${id}/editar`}>
          <Button className="gap-2"><Pencil className="w-4 h-4" /> Editar obra</Button>
        </Link>
      </div>

      {/* Info cards row */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="!p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 rounded-xl"><HardHat className="w-5 h-5 text-blue-600" /></div>
            <div>
              <p className="text-xs text-slate-500">Estado</p>
              <Badge className={ESTADO_COLORS[obra.estado]}>{OBRA_ESTADO_LABELS[obra.estado]}</Badge>
            </div>
          </div>
        </Card>
        <Card className="!p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary-50 rounded-xl"><Layers className="w-5 h-5 text-primary-600" /></div>
            <div>
              <p className="text-xs text-slate-500">Tipo</p>
              <p className="font-semibold text-slate-900 text-sm">{OBRA_TIPO_LABELS[obra.tipo]}</p>
            </div>
          </div>
        </Card>
        <Card className="!p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 rounded-xl"><User className="w-5 h-5 text-emerald-600" /></div>
            <div>
              <p className="text-xs text-slate-500">Cliente</p>
              <p className="font-semibold text-slate-900 text-sm truncate">{obra.cliente}</p>
            </div>
          </div>
        </Card>
        <Card className="!p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 rounded-xl"><Calendar className="w-5 h-5 text-amber-600" /></div>
            <div>
              <p className="text-xs text-slate-500">Início</p>
              <p className="font-semibold text-slate-900 text-sm">{formatDate(obra.dataInicio)}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informação geral */}
          <Card>
            <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <HardHat className="w-5 h-5 text-primary-600" /> Informação da Obra
            </h2>
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
              <div><span className="text-slate-500">Nome:</span> <span className="font-medium text-slate-900 ml-1">{obra.nome}</span></div>
              <div><span className="text-slate-500">Referência:</span> <span className="font-medium text-slate-900 ml-1">{obra.referencia}</span></div>
              <div><span className="text-slate-500">Cliente:</span> <span className="font-medium text-slate-900 ml-1">{obra.cliente}</span></div>
              <div><span className="text-slate-500">Responsável:</span> <span className="font-medium text-slate-900 ml-1">{obra.responsavel}</span></div>
              <div><span className="text-slate-500">Data início:</span> <span className="font-medium text-slate-900 ml-1">{formatDate(obra.dataInicio)}</span></div>
              <div><span className="text-slate-500">Previsão conclusão:</span> <span className="font-medium text-slate-900 ml-1">{formatDate(obra.dataPrevistaFim)}</span></div>
              {obra.dataFim && <div><span className="text-slate-500">Data conclusão:</span> <span className="font-medium text-slate-900 ml-1">{formatDate(obra.dataFim)}</span></div>}
              {obra.morada && <div className="sm:col-span-2"><span className="text-slate-500">Morada:</span> <span className="font-medium text-slate-900 ml-1">{obra.morada}</span></div>}
              {obra.descricao && <div className="sm:col-span-2"><span className="text-slate-500">Descrição:</span> <span className="font-medium text-slate-900 ml-1">{obra.descricao}</span></div>}
            </div>
          </Card>

          {/* Progresso */}
          <Card>
            <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Ruler className="w-5 h-5 text-primary-600" /> Progresso
            </h2>
            <ProgressBar value={progresso} label="Metros executados" />
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <p className="text-lg font-bold text-slate-900">{obra.metrosPrevistos.toLocaleString()} m</p>
                <p className="text-xs text-slate-500">Previstos</p>
              </div>
              <div className="text-center p-3 bg-primary-50 rounded-lg">
                <p className="text-lg font-bold text-primary-700">{obra.metrosExecutados.toLocaleString()} m</p>
                <p className="text-xs text-slate-500">Executados</p>
              </div>
              <div className="text-center p-3 bg-amber-50 rounded-lg">
                <p className="text-lg font-bold text-amber-700">{faltam.toLocaleString()} m</p>
                <p className="text-xs text-slate-500">Em falta</p>
              </div>
            </div>
          </Card>

          {/* Pavimento */}
          {obra.tipoPavimento && (
            <Card>
              <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Layers className="w-5 h-5 text-primary-600" /> Pavimento
              </h2>
              {pavimentoPendente && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <p className="text-sm text-amber-800">Reposição definitiva pendente</p>
                </div>
              )}
              <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
                <div><span className="text-slate-500">Tipo:</span> <span className="font-medium text-slate-900 ml-1">{PAVIMENTO_TIPO_LABELS[obra.tipoPavimento]}</span></div>
                <div>
                  <span className="text-slate-500">Estado:</span>{' '}
                  <Badge className={obra.estadoPavimento === 'DEFINITIVO' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}>
                    {obra.estadoPavimento ? PAVIMENTO_ESTADO_LABELS[obra.estadoPavimento] : '—'}
                  </Badge>
                </div>
                {obra.areaPavimento && <div><span className="text-slate-500">Área:</span> <span className="font-medium text-slate-900 ml-1">{obra.areaPavimento} m²</span></div>}
                {obra.dataReposicaoProvisoria && <div><span className="text-slate-500">Repos. provisória:</span> <span className="font-medium text-slate-900 ml-1">{formatDate(obra.dataReposicaoProvisoria)}</span></div>}
                {obra.dataReposicaoDefinitiva && <div><span className="text-slate-500">Repos. definitiva:</span> <span className="font-medium text-slate-900 ml-1">{formatDate(obra.dataReposicaoDefinitiva)}</span></div>}
                {obra.observacoesPavimento && <div className="sm:col-span-2"><span className="text-slate-500">Observações:</span> <span className="font-medium text-slate-900 ml-1">{obra.observacoesPavimento}</span></div>}
              </div>
            </Card>
          )}

          {/* Materiais utilizados */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-primary-600" /> Materiais utilizados
              </h2>
              <Button size="sm" className="gap-1" onClick={openMaterialModal}>
                <Plus className="w-3.5 h-3.5" /> Adicionar
              </Button>
            </div>
            {obra.materiaisUsados && obra.materiaisUsados.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-slate-500">
                      <th className="pb-3 font-medium">Material</th>
                      <th className="pb-3 font-medium">Quantidade</th>
                      <th className="pb-3 font-medium">Unidade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {obra.materiaisUsados.map((mu) => (
                      <tr key={mu.id} className="border-b border-slate-100">
                        <td className="py-3 font-medium text-slate-900">{mu.material.nome}</td>
                        <td className="py-3">{mu.quantidade}</td>
                        <td className="py-3">{UNIDADE_LABELS[mu.material.unidade]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-slate-500 text-center py-6">Nenhum material registado nesta obra.</p>
            )}
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Mapa */}
          {obra.latitude && obra.longitude && (
            <Card className="!p-0 overflow-hidden">
              <div className="p-4 border-b border-slate-200">
                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary-600" /> Localização
                </h3>
              </div>
              <MapPicker latitude={obra.latitude} longitude={obra.longitude} onLocationChange={() => {}} height="280px" />
              {obra.morada && <p className="px-4 py-3 text-xs text-slate-500">{obra.morada}</p>}
            </Card>
          )}

          {/* Histórico */}
          <Card>
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary-600" /> Histórico
            </h3>
            {obra.historico && obra.historico.length > 0 ? (
              <div className="relative">
                <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-slate-200" />
                <div className="space-y-4">
                  {obra.historico.map((h) => (
                    <div key={h.id} className="flex gap-3 relative">
                      <div className="w-4 h-4 rounded-full bg-primary-100 border-2 border-primary-500 mt-0.5 flex-shrink-0 z-10" />
                      <div>
                        <p className="text-sm text-slate-900">{h.descricao}</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {formatDate(h.data)}
                          {h.utilizador && ` — ${h.utilizador.nome}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500 text-center py-4">Sem histórico.</p>
            )}
          </Card>
        </div>
      </div>

      {/* Modal adicionar material */}
      <Modal open={materialModal} onClose={() => setMaterialModal(false)} title="Adicionar material à obra" size="sm">
        <div className="space-y-4">
          <Select
            label="Material"
            options={[
              { value: '', label: '— Selecionar material —' },
              ...materiais.map((m) => ({ value: m.id, label: `${m.nome} (${m.quantidadeStock} ${UNIDADE_LABELS[m.unidade]} em stock)` })),
            ]}
            value={selectedMaterial}
            onChange={(e) => setSelectedMaterial(e.target.value)}
          />
          <Input
            label="Quantidade"
            type="number"
            min={1}
            value={materialQty}
            onChange={(e) => setMaterialQty(parseFloat(e.target.value) || 0)}
          />
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setMaterialModal(false)}>Cancelar</Button>
            <Button loading={addingMaterial} onClick={handleAddMaterial} disabled={!selectedMaterial || materialQty <= 0}>
              Adicionar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
