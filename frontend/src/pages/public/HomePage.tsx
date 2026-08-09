import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Droplets, Flame, Wrench, Building2, Construction, ShieldCheck, ChevronRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { publicApi, obrasApi } from '../../services/endpoints';
import type { SiteStats, Obra } from '../../types';
import { OBRA_TIPO_LABELS, OBRA_ESTADO_LABELS, ESTADO_COLORS } from '../../utils/labels';
import { Badge } from '../../components/ui/Badge';
import { SkeletonCard } from '../../components/ui/Loading';

const services = [
  { icon: Droplets, title: 'Água', desc: 'Execução, instalação e manutenção de redes de abastecimento de água.', color: 'text-blue-600 bg-blue-50' },
  { icon: Building2, title: 'Saneamento', desc: 'Construção e manutenção de redes de saneamento.', color: 'text-emerald-600 bg-emerald-50' },
  { icon: Flame, title: 'Gás', desc: 'Instalação e execução de redes de gás.', color: 'text-amber-600 bg-amber-50' },
  { icon: Wrench, title: 'Infraestruturas', desc: 'Execução de infraestruturas subterrâneas e redes técnicas.', color: 'text-slate-600 bg-slate-100' },
  { icon: Construction, title: 'Pavimentação', desc: 'Reposição e requalificação de pavimentos após execução das redes.', color: 'text-orange-600 bg-orange-50' },
  { icon: ShieldCheck, title: 'Manutenção', desc: 'Manutenção e intervenção em redes e infraestruturas existentes.', color: 'text-indigo-600 bg-indigo-50' },
];

export default function HomePage() {
  const [stats, setStats] = useState<SiteStats>({});
  const [obras, setObras] = useState<Obra[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([publicApi.getStats(), obrasApi.getPublic()])
      .then(([statsRes, obrasRes]) => {
        setStats(statsRes.data);
        setObras(obrasRes.data.slice(0, 3));
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[85vh] flex items-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1920&q=80)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-900/40" />
        <div className="container-custom relative z-10 py-32">
          <div className="max-w-2xl animate-slide-up">
            <p className="text-primary-400 font-medium mb-4 tracking-wide uppercase text-sm">Infraestruturas · Água · Saneamento · Gás</p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Infraestruturas que ligam pessoas e comunidades.
            </h1>
            <p className="mt-6 text-lg text-slate-300 leading-relaxed">
              Especialistas em redes de água, saneamento e gás, com soluções eficientes, seguras e de qualidade.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/servicos">
                <Button size="lg" className="gap-2">
                  Conheça os nossos serviços <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/contactos">
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                  Fale connosco
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white -mt-16 relative z-20">
        <div className="container-custom">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {[
              { value: stats.obras_realizadas || '100+', label: 'Obras realizadas' },
              { value: stats.km_redes || '500+', label: 'Km de redes instaladas' },
              { value: stats.anos_experiencia || '20+', label: 'Anos de experiência' },
              { value: stats.clientes || '50+', label: 'Clientes' },
            ].map((stat) => (
              <Card key={stat.label} className="text-center !p-6">
                <p className="text-3xl lg:text-4xl font-bold text-primary-600">{stat.value}</p>
                <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About preview */}
      <section className="py-20 bg-slate-50">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-display text-3xl lg:text-4xl font-bold text-slate-900">Quem Somos</h2>
              <p className="mt-4 text-slate-600 leading-relaxed">
                A AquaRedes Infraestruturas é uma empresa especializada na execução e manutenção de infraestruturas subterrâneas,
                com foco em redes de abastecimento de água, saneamento e gás. Com mais de duas décadas de experiência,
                garantimos soluções técnicas de excelência para municípios, utilities e empresas.
              </p>
              <Link to="/empresa" className="inline-flex items-center gap-1 mt-6 text-primary-600 font-medium hover:text-primary-700">
                Saber mais <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80"
                alt="Equipa em obra"
                className="rounded-2xl shadow-xl w-full h-[350px] object-cover"
              />
              <div className="absolute -bottom-4 -left-4 bg-primary-600 text-white p-6 rounded-xl shadow-lg">
                <p className="text-2xl font-bold">+20</p>
                <p className="text-sm text-primary-100">Anos de experiência</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-display text-3xl lg:text-4xl font-bold text-slate-900">Os Nossos Serviços</h2>
            <p className="mt-4 text-slate-600">Soluções completas para infraestruturas de água, saneamento e gás.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s) => (
              <Card key={s.title} hover className="group">
                <div className={`inline-flex p-3 rounded-xl ${s.color} mb-4 group-hover:scale-110 transition-transform`}>
                  <s.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">{s.title}</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{s.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Recent projects */}
      <section className="py-20 bg-slate-50">
        <div className="container-custom">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="font-display text-3xl font-bold text-slate-900">Obras em Destaque</h2>
              <p className="mt-2 text-slate-600">Alguns dos nossos projetos recentes.</p>
            </div>
            <Link to="/obras" className="hidden sm:inline-flex items-center gap-1 text-primary-600 font-medium hover:text-primary-700">
              Ver todas <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading
              ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
              : obras.map((obra) => (
                  <Card key={obra.id} hover padding={false} className="overflow-hidden">
                    <img
                      src={obra.imagemUrl || 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=600'}
                      alt={obra.nome}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-primary-50 text-primary-700">{OBRA_TIPO_LABELS[obra.tipo]}</Badge>
                        <Badge className={ESTADO_COLORS[obra.estado]}>{OBRA_ESTADO_LABELS[obra.estado]}</Badge>
                      </div>
                      <h3 className="font-semibold text-slate-900">{obra.nome}</h3>
                      <p className="text-sm text-slate-500 mt-1">{obra.morada}</p>
                    </div>
                  </Card>
                ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary-600">
        <div className="container-custom text-center">
          <h2 className="font-display text-3xl font-bold text-white">Precisa de uma solução para a sua infraestrutura?</h2>
          <p className="mt-4 text-primary-100 max-w-xl mx-auto">Entre em contacto connosco para um orçamento personalizado.</p>
          <Link to="/contactos" className="inline-block mt-8">
            <Button variant="accent" size="lg">Contacte-nos</Button>
          </Link>
        </div>
      </section>
    </>
  );
}
