import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Bell, AlertTriangle, AlertCircle, Info, Clock, ExternalLink } from 'lucide-react';
import { dashboardApi } from '../../services/endpoints';

interface Alerta {
  id: string;
  tipo: 'OBRA_ATRASADA' | 'OBRA_PRAZO' | 'PAVIMENTO_PENDENTE' | 'STOCK_BAIXO' | 'MENSAGEM_NAO_LIDA';
  nivel: 'CRITICO' | 'AVISO' | 'INFO';
  titulo: string;
  descricao: string;
  link: string;
  data?: string;
}

export function AlertsBellDropdown() {
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [criticosCount, setCriticosCount] = useState(0);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const loadAlertas = () => {
    dashboardApi
      .getAlertas()
      .then((res) => {
        setAlertas(res.data.alertas);
        setTotalCount(res.data.totalCount);
        setCriticosCount(res.data.criticosCount);
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadAlertas();
    const interval = setInterval(loadAlertas, 30000); // recarrega a cada 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIcon = (nivel: Alerta['nivel']) => {
    switch (nivel) {
      case 'CRITICO':
        return <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />;
      case 'AVISO':
        return <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />;
      default:
        return <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none"
        title="Central de Alertas"
      >
        <Bell className="w-5 h-5" />
        {totalCount > 0 && (
          <span className={`absolute top-1 right-1 px-1.5 py-0.5 text-[10px] font-bold leading-none rounded-full text-white ${
            criticosCount > 0 ? 'bg-red-600 animate-pulse' : 'bg-amber-500'
          }`}>
            {totalCount > 99 ? '99+' : totalCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-fade-in">
          <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary-400" />
              <span className="font-semibold text-sm">Central de Alertas</span>
            </div>
            {totalCount > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">
                {totalCount} ativo{totalCount > 1 ? 's' : ''}
              </span>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {alertas.length === 0 ? (
              <div className="p-6 text-center text-slate-500">
                <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-medium">Tudo em dia!</p>
                <p className="text-xs text-slate-400 mt-0.5">Sem alertas ou prazos pendentes de momento.</p>
              </div>
            ) : (
              alertas.map((a) => (
                <Link
                  key={a.id}
                  to={a.link}
                  onClick={() => setOpen(false)}
                  className={`p-3.5 flex gap-3 hover:bg-slate-50 transition-colors block text-left ${
                    a.nivel === 'CRITICO' ? 'bg-red-50/40' : a.nivel === 'AVISO' ? 'bg-amber-50/30' : ''
                  }`}
                >
                  {getIcon(a.nivel)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-semibold text-slate-900 truncate">{a.titulo}</p>
                      <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{a.descricao}</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
