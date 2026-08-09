import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter } from 'lucide-react';
import { obrasApi } from '../../services/endpoints';
import type { Obra } from '../../types';
import { OBRA_ESTADO_LABELS, OBRA_TIPO_LABELS, PAVIMENTO_ESTADO_LABELS } from '../../utils/labels';
import { Card } from '../../components/ui/Card';
import { Select } from '../../components/ui/Select';
import { PageLoader } from '../../components/ui/Loading';
import { ObrasMap } from '../../components/map/MapComponents';

export default function ObrasMapPage() {
  const navigate = useNavigate();
  const [obras, setObras] = useState<Obra[]>([]);
  const [loading, setLoading] = useState(true);
  const [estado, setEstado] = useState('');
  const [tipo, setTipo] = useState('');
  const [pavimento, setPavimento] = useState('');

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (estado) params.estado = estado;
    if (tipo) params.tipo = tipo;
    if (pavimento) params.pavimento = pavimento;

    obrasApi.getMapa(params).then((res) => setObras(res.data)).finally(() => setLoading(false));
  }, [estado, tipo, pavimento]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Mapa de Obras</h1>
        <p className="text-sm text-slate-500">Visualize todas as obras no mapa</p>
      </div>

      <Card className="!p-4">
        <div className="flex flex-wrap items-center gap-3">
          <Filter className="w-4 h-4 text-slate-400" />
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
          <Select
            options={[
              { value: '', label: 'Pavimento (todos)' },
              ...Object.entries(PAVIMENTO_ESTADO_LABELS).map(([k, v]) => ({ value: k, label: v })),
            ]}
            value={pavimento}
            onChange={(e) => setPavimento(e.target.value)}
          />
          <span className="text-sm text-slate-500 ml-auto">{obras.length} obra(s) no mapa</span>
        </div>
      </Card>

      {/* Legenda */}
      <div className="flex flex-wrap gap-4 text-xs">
        {[
          { color: '#64748b', label: 'Planeada' },
          { color: '#3b82f6', label: 'Em preparação' },
          { color: '#f59e0b', label: 'Em execução' },
          { color: '#ef4444', label: 'Suspensa' },
          { color: '#22c55e', label: 'Concluída' },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full border-2 border-white shadow" style={{ background: l.color }} />
            <span className="text-slate-600">{l.label}</span>
          </div>
        ))}
      </div>

      {loading ? (
        <PageLoader />
      ) : (
        <ObrasMap
          obras={obras}
          height="calc(100vh - 320px)"
          onMarkerClick={(obra) => navigate(`/gestao/obras/${obra.id}`)}
        />
      )}
    </div>
  );
}
