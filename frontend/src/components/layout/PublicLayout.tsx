import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X, Droplets } from 'lucide-react';
import { Button } from '../ui/Button';

const navLinks = [
  { to: '/', label: 'Início' },
  { to: '/empresa', label: 'Empresa' },
  { to: '/servicos', label: 'Serviços' },
  { to: '/obras', label: 'Obras' },
  { to: '/contactos', label: 'Contactos' },
];

export function PublicHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="p-2 bg-primary-600 rounded-lg group-hover:bg-primary-700 transition-colors">
              <Droplets className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-display font-bold text-lg text-slate-900">Tarefas Obedientes</span>
              <span className="hidden sm:block text-xs text-slate-500 -mt-0.5">Infraestruturas</span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? 'text-primary-600 bg-primary-50' : 'text-slate-600 hover:text-primary-600 hover:bg-slate-50'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden lg:block">
            <Link to="/login">
              <Button variant="secondary" size="sm">Área de Gestão</Button>
            </Link>
          </div>

          <button
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white animate-fade-in">
          <nav className="container-custom py-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `px-4 py-3 rounded-lg text-sm font-medium ${
                    isActive ? 'text-primary-600 bg-primary-50' : 'text-slate-600'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <Link to="/login" onClick={() => setMobileOpen(false)} className="mt-2">
              <Button variant="secondary" className="w-full">Área de Gestão</Button>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="bg-slate-850 text-slate-300">
      <div className="container-custom py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Droplets className="w-6 h-6 text-primary-400" />
              <span className="font-display font-bold text-white text-lg">Tarefas Obedientes</span>
            </div>
            <p className="text-sm leading-relaxed">
              Especialistas em redes de água, saneamento e gás. Soluções eficientes, seguras e de qualidade para infraestruturas subterrâneas.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Navegação</h4>
            <ul className="space-y-2 text-sm">
              {navLinks.map((l) => (
                <li key={l.to}><Link to={l.to} className="hover:text-primary-400 transition-colors">{l.label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Serviços</h4>
            <ul className="space-y-2 text-sm">
              <li>Redes de Água</li>
              <li>Saneamento</li>
              <li>Redes de Gás</li>
              <li>Infraestruturas</li>
              <li>Pavimentação</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Contactos</h4>
            <ul className="space-y-2 text-sm">
              <li>Rua do Monte, nº 71</li>
              <li>Tamel Santa Leocádia</li>
              <li>4750-704 Barcelos</li>
              <li>+351 239 123 456</li>
              <li>geral@tarefasobedientes.pt</li>
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-8 border-t border-slate-700 text-sm text-center text-slate-500">
          &copy; {new Date().getFullYear()} Tarefas Obedientes. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}
