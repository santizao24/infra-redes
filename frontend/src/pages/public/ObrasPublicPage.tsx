import { useEffect, useState } from 'react';
import { obrasApi } from '../../services/endpoints';
import type { Obra } from '../../types';
import { OBRA_TIPO_LABELS, OBRA_ESTADO_LABELS, ESTADO_COLORS, calcProgresso } from '../../utils/labels';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { SkeletonCard } from '../../components/ui/Loading';
import { EmptyState } from '../../components/ui/EmptyState';
import { HardHat } from 'lucide-react';

const filtros = [
  { value: '', label: 'Todas' },
  { value: 'AGUA', label: 'Água' },
  { value: 'SANEAMENTO', label: 'Saneamento' },
  { value: 'GAS', label: 'Gás' },
  { value: 'AGUA_SANEAMENTO', label: 'Água + Saneamento' },
];

export default function ObrasPublicPage() {
  const [obras, setObras] = useState<Obra[]>([]);
  const [filtro, setFiltro] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    obrasApi
      .getPublic(filtro || undefined)
      .then((res) => setObras(res.data))
      .finally(() => setLoading(false));
  }, [filtro]);

  return (
    <>
      <section className="py-20 bg-slate-900 text-white">
        <div className="container-custom">
          <h1 className="font-display text-4xl lg:text-5xl font-bold">Obras</h1>
          <p className="mt-4 text-lg text-slate-300">Conheça alguns dos nossos projetos realizados.</p>
        </div>
      </section>

      <section className="py-12">
        <div className="container-custom">
          <div className="flex flex-wrap gap-2 mb-8">
            {filtros.map((f) => (
              <button
                key={f.value}
                onClick={() => setFiltro(f.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filtro === f.value
                    ? 'bg-primary-600 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : obras.length === 0 ? (
            <EmptyState icon={HardHat} title="Sem obras encontradas" description="Não existem obras para o filtro selecionado." />
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {obras.map((obra) => (
                <Card key={obra.id} hover padding={false} className="overflow-hidden">
                  <img
                    src={obra.imagemUrl || 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=600'}
                    alt={obra.nome}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-5">
                    <div className="flex flex-wrap gap-2 mb-2">
                      <Badge className="bg-primary-50 text-primary-700">{OBRA_TIPO_LABELS[obra.tipo]}</Badge>
                      <Badge className={ESTADO_COLORS[obra.estado]}>{OBRA_ESTADO_LABELS[obra.estado]}</Badge>
                    </div>
                    <h3 className="font-semibold text-slate-900">{obra.nome}</h3>
                    <p className="text-sm text-slate-500 mt-1">{obra.morada}</p>
                    {obra.descricao && <p className="text-sm text-slate-600 mt-2 line-clamp-2">{obra.descricao}</p>}
                    {obra.metrosPrevistos > 0 && (
                      <div className="mt-4">
                        <ProgressBar value={calcProgresso(obra.metrosPrevistos, obra.metrosExecutados)} size="sm" />
                        <p className="text-xs text-slate-500 mt-1">{obra.metrosExecutados} / {obra.metrosPrevistos} m</p>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
