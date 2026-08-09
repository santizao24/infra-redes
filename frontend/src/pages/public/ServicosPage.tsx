import { useState } from 'react';
import { Droplets, Building2, Flame, Wrench, Construction, ShieldCheck } from 'lucide-react';

const services = [
  {
    icon: Droplets,
    title: 'Água',
    desc: 'Execução, instalação e manutenção de redes de abastecimento de água. Desde ramais domiciliários até coletores principais, garantimos a distribuição eficiente e segura de água potável.',
    color: 'text-blue-600 bg-blue-50',
    gradient: 'from-blue-600 to-cyan-500',
    image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=800&q=80',
  },
  {
    icon: Building2,
    title: 'Saneamento',
    desc: 'Construção e manutenção de redes de saneamento, incluindo coletores, poços de visita e ligações domiciliárias. Soluções para a gestão eficiente de águas residuais.',
    color: 'text-emerald-600 bg-emerald-50',
    gradient: 'from-emerald-600 to-teal-500',
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
  },
  {
    icon: Flame,
    title: 'Gás',
    desc: 'Instalação e execução de redes de gás natural e propano. Cumprimento rigoroso das normas de segurança e certificação para redes de distribuição de gás.',
    color: 'text-amber-600 bg-amber-50',
    gradient: 'from-amber-600 to-orange-500',
    image: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80',
  },
  {
    icon: Wrench,
    title: 'Infraestruturas',
    desc: 'Execução de infraestruturas subterrâneas e redes técnicas. Galerias técnicas, passagens de cabos e infraestruturas multi-serviços.',
    color: 'text-slate-600 bg-slate-100',
    gradient: 'from-slate-700 to-slate-500',
    image: 'https://images.unsplash.com/photo-1541976590-713941681597?auto=format&fit=crop&w=800&q=80',
  },
  {
    icon: Construction,
    title: 'Pavimentação',
    desc: 'Reposição e requalificação de pavimentos após execução das redes. Trabalhos provisórios e definitivos em asfalto, betão, calçada e paralelos.',
    color: 'text-orange-600 bg-orange-50',
    gradient: 'from-orange-600 to-amber-500',
    image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80',
  },
  {
    icon: ShieldCheck,
    title: 'Manutenção',
    desc: 'Manutenção preventiva e corretiva em redes e infraestruturas existentes. Inspeções, reparações e intervenções de emergência.',
    color: 'text-indigo-600 bg-indigo-50',
    gradient: 'from-indigo-600 to-blue-500',
    image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80',
  },
];

function ServiceImage({ service, isReversed }: { service: typeof services[0]; isReversed: boolean }) {
  const [error, setError] = useState(false);
  const Icon = service.icon;

  if (error) {
    return (
      <div className={`rounded-2xl shadow-lg w-full h-[280px] bg-gradient-to-br ${service.gradient} flex flex-col items-center justify-center text-white p-8 text-center ${isReversed ? 'lg:order-1' : ''}`}>
        <div className="p-4 bg-white/20 backdrop-blur-md rounded-2xl mb-4">
          <Icon className="w-12 h-12 text-white" />
        </div>
        <h3 className="font-display text-2xl font-bold">{service.title}</h3>
        <p className="text-white/80 text-sm mt-2 max-w-xs">Especialistas em Redes & Infraestruturas</p>
      </div>
    );
  }

  return (
    <img
      src={service.image}
      alt={service.title}
      onError={() => setError(true)}
      className={`rounded-2xl shadow-lg w-full h-[280px] object-cover ${isReversed ? 'lg:order-1' : ''}`}
    />
  );
}

export default function ServicosPage() {
  return (
    <>
      <section className="py-20 bg-slate-900 text-white">
        <div className="container-custom">
          <h1 className="font-display text-4xl lg:text-5xl font-bold">Serviços</h1>
          <p className="mt-4 text-lg text-slate-300 max-w-2xl">
            Soluções integradas para infraestruturas de água, saneamento, gás e pavimentação.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container-custom space-y-12">
          {services.map((s, i) => (
            <div key={s.title} className={`grid lg:grid-cols-2 gap-8 items-center ${i % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
              <div className={i % 2 === 1 ? 'lg:order-2' : ''}>
                <div className={`inline-flex p-3 rounded-xl ${s.color} mb-4`}>
                  <s.icon className="w-7 h-7" />
                </div>
                <h2 className="font-display text-2xl font-bold text-slate-900">{s.title}</h2>
                <p className="mt-4 text-slate-600 leading-relaxed">{s.desc}</p>
              </div>
              <ServiceImage service={s} isReversed={i % 2 === 1} />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
