import { Droplets, Target, Users, Award } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { publicApi } from '../../services/endpoints';
import { useEffect, useState } from 'react';
import type { SiteStats } from '../../types';

export default function EmpresaPage() {
  const [stats, setStats] = useState<SiteStats>({});

  useEffect(() => {
    publicApi.getStats().then((res) => setStats(res.data));
  }, []);

  return (
    <>
      <section className="py-20 bg-slate-900 text-white">
        <div className="container-custom">
          <h1 className="font-display text-4xl lg:text-5xl font-bold">A Nossa Empresa</h1>
          <p className="mt-4 text-lg text-slate-300 max-w-2xl">
            Mais de duas décadas a construir infraestruturas que servem comunidades em todo o país.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h2 className="font-display text-2xl font-bold text-slate-900 mb-6">Quem Somos</h2>
              <div className="space-y-4 text-slate-600 leading-relaxed">
                <p>
                  A <strong>AquaRedes Infraestruturas</strong> é uma empresa portuguesa especializada na execução,
                  instalação e manutenção de infraestruturas subterrâneas, nomeadamente redes de abastecimento de água,
                  redes de saneamento e redes de gás.
                </p>
                <p>
                  Trabalhamos com municípios, empresas de utilities, condomínios e entidades privadas,
                  oferecendo soluções completas desde a planificação até à reposição definitiva de pavimentos.
                </p>
                <p>
                  A nossa equipa de técnicos qualificados e operadores experientes garante a execução de obras
                  com os mais elevados padrões de qualidade, segurança e sustentabilidade ambiental.
                </p>
              </div>
            </div>
            <img
              src="https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&q=80"
              alt="Infraestruturas"
              className="rounded-2xl shadow-lg w-full h-[400px] object-cover"
            />
          </div>
        </div>
      </section>

      <section className="py-16 bg-slate-50">
        <div className="container-custom">
          <h2 className="font-display text-2xl font-bold text-slate-900 text-center mb-10">Os Nossos Números</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Target, value: stats.obras_realizadas || '100+', label: 'Obras realizadas' },
              { icon: Droplets, value: stats.km_redes || '500+', label: 'Km de redes' },
              { icon: Award, value: stats.anos_experiencia || '20+', label: 'Anos de experiência' },
              { icon: Users, value: stats.clientes || '50+', label: 'Clientes satisfeitos' },
            ].map((s) => (
              <Card key={s.label} className="text-center">
                <s.icon className="w-8 h-8 text-primary-600 mx-auto mb-3" />
                <p className="text-3xl font-bold text-slate-900">{s.value}</p>
                <p className="text-sm text-slate-500 mt-1">{s.label}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container-custom">
          <h2 className="font-display text-2xl font-bold text-slate-900 mb-8">Missão, Visão e Valores</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <h3 className="font-semibold text-primary-600 mb-2">Missão</h3>
              <p className="text-sm text-slate-600">Executar infraestruturas de excelência que garantam o acesso a água, saneamento e gás de forma segura e sustentável.</p>
            </Card>
            <Card>
              <h3 className="font-semibold text-primary-600 mb-2">Visão</h3>
              <p className="text-sm text-slate-600">Ser referência nacional na execução de infraestruturas subterrâneas, reconhecida pela qualidade e inovação.</p>
            </Card>
            <Card>
              <h3 className="font-semibold text-primary-600 mb-2">Valores</h3>
              <p className="text-sm text-slate-600">Segurança, qualidade, rigor técnico, sustentabilidade ambiental e compromisso com os nossos clientes e comunidades.</p>
            </Card>
          </div>
        </div>
      </section>
    </>
  );
}
