import { useState } from 'react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';
import { MapPicker } from '../../components/map/MapComponents';
import { publicApi } from '../../services/endpoints';
import toast from 'react-hot-toast';

export default function ContactosPage() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ nome: '', email: '', telefone: '', assunto: '', mensagem: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await publicApi.sendContact(form);
      toast.success('Mensagem enviada com sucesso!');
      setForm({ nome: '', email: '', telefone: '', assunto: '', mensagem: '' });
    } catch {
      toast.error('Erro ao enviar mensagem. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section className="py-20 bg-slate-900 text-white">
        <div className="container-custom">
          <h1 className="font-display text-4xl lg:text-5xl font-bold">Contactos</h1>
          <p className="mt-4 text-lg text-slate-300">Estamos disponíveis para esclarecer as suas dúvidas.</p>
        </div>
      </section>

      <section className="py-16">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h2 className="font-display text-2xl font-bold text-slate-900 mb-6">Fale Connosco</h2>
              <div className="space-y-5">
                {[
                  { icon: MapPin, label: 'Morada', value: 'Rua do Monte, nº 71\nTamel Santa Leocádia\n4750-704 Barcelos' },
                  { icon: Phone, label: 'Telefone', value: '+351 239 123 456' },
                  { icon: Mail, label: 'Email', value: 'geral@tarefasobedientes.pt' },
                  { icon: Clock, label: 'Horário', value: 'Segunda a Sexta: 08:00 - 18:00\nSábado: 09:00 - 13:00' },
                ].map((c) => (
                  <div key={c.label} className="flex gap-4">
                    <div className="p-3 bg-primary-50 rounded-xl h-fit">
                      <c.icon className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{c.label}</p>
                      <p className="text-sm text-slate-600 whitespace-pre-line">{c.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <MapPicker latitude={41.4905} longitude={-8.6137} onLocationChange={() => {}} height="250px" />
              </div>
            </div>

            <Card>
              <h2 className="font-display text-xl font-bold text-slate-900 mb-6">Envie-nos uma mensagem</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="Nome" required value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
                <Input label="Email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                <Input label="Telefone" value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} />
                <Input label="Assunto" value={form.assunto} onChange={(e) => setForm({ ...form, assunto: e.target.value })} />
                <Textarea label="Mensagem" required rows={5} value={form.mensagem} onChange={(e) => setForm({ ...form, mensagem: e.target.value })} />
                <Button type="submit" loading={loading} className="w-full">Enviar mensagem</Button>
              </form>
            </Card>
          </div>
        </div>
      </section>
    </>
  );
}
