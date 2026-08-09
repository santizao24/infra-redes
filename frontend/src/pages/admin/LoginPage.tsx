import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Droplets, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      await login(cleanEmail, password.trim());
      toast.success('Login efetuado com sucesso');
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Erro ao efetuar login';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative items-center justify-center p-12">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1200)' }}
        />
        <div className="relative z-10 max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <Droplets className="w-10 h-10 text-primary-400" />
            <span className="font-display text-2xl font-bold text-white">Tarefas Obedientes</span>
          </div>
          <h2 className="text-3xl font-bold text-white">Área de Gestão</h2>
          <p className="mt-4 text-slate-400 leading-relaxed">
            Plataforma interna para gestão de obras, stock e relatórios.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <Droplets className="w-8 h-8 text-primary-600" />
            <span className="font-display text-xl font-bold">Tarefas Obedientes</span>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
            <h1 className="text-2xl font-bold text-slate-900">Iniciar sessão</h1>
            <p className="text-sm text-slate-500 mt-1">Introduza as suas credenciais de acesso</p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <Input
                label="Email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@tarefasobedientes.pt"
              />
              <div className="relative">
                <Input
                  label="Password"
                  type={showPass ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-[34px] text-slate-400 hover:text-slate-600"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <Button type="submit" loading={loading} className="w-full" size="lg">
                Entrar
              </Button>
            </form>

            <div className="mt-6 p-4 bg-slate-50 rounded-lg text-xs text-slate-500">
              <p className="font-medium text-slate-700 mb-1">Credenciais de demonstração:</p>
              <p>Admin: admin@tarefasobedientes.pt / admin123</p>
              <p>Gestor: gestor@tarefasobedientes.pt / gestor123</p>
            </div>
          </div>

          <p className="text-center mt-6 text-sm text-slate-500">
            <Link to="/" className="text-primary-600 hover:text-primary-700">← Voltar ao website</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
