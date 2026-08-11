import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="text-8xl font-bold text-primary-600 mb-4">404</div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Página não encontrada</h1>
        <p className="text-slate-500 mb-8">
          A página que procura não existe ou foi movida.
        </p>
        <div className="flex gap-3 justify-center">
          <Link to="/">
            <Button className="gap-2">
              <Home className="w-4 h-4" /> Página inicial
            </Button>
          </Link>
          <Button variant="ghost" className="gap-2" onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Button>
        </div>
      </div>
    </div>
  );
}
