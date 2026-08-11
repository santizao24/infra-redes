import { Routes, Route, Outlet } from 'react-router-dom';
import { PublicHeader, PublicFooter } from './components/layout/PublicLayout';
import { AdminLayout } from './components/layout/AdminLayout';
import { ProtectedRoute } from './components/ProtectedRoute';

// Public pages
import HomePage from './pages/public/HomePage';
import EmpresaPage from './pages/public/EmpresaPage';
import ServicosPage from './pages/public/ServicosPage';
import ObrasPublicPage from './pages/public/ObrasPublicPage';
import ContactosPage from './pages/public/ContactosPage';

// Admin pages
import LoginPage from './pages/admin/LoginPage';
import DashboardPage from './pages/admin/DashboardPage';
import ObrasListPage from './pages/admin/ObrasListPage';
import ObraFormPage from './pages/admin/ObraFormPage';
import ObraDetailPage from './pages/admin/ObraDetailPage';
import ObrasMapPage from './pages/admin/ObrasMapPage';
import StockListPage from './pages/admin/StockListPage';
import StockMovimentosPage from './pages/admin/StockMovimentosPage';
import RelatoriosPage from './pages/admin/RelatoriosPage';
import UtilizadoresPage from './pages/admin/UtilizadoresPage';
import DefinicoesPage from './pages/admin/DefinicoesPage';
import NotFoundPage from './pages/NotFoundPage';

function PublicLayout() {
  return (
    <>
      <PublicHeader />
      <main className="pt-16 lg:pt-20">
        <Outlet />
      </main>
      <PublicFooter />
    </>
  );
}


export default function App() {
  return (
    <Routes>
      {/* Login */}
      <Route path="/login" element={<LoginPage />} />

      {/* Admin area — under /gestao prefix to avoid path conflicts */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/gestao/obras" element={<ObrasListPage />} />
          <Route path="/gestao/obras/nova" element={<ObraFormPage />} />
          <Route path="/gestao/obras/mapa" element={<ObrasMapPage />} />
          <Route path="/gestao/obras/:id/editar" element={<ObraFormPage />} />
          <Route path="/gestao/obras/:id" element={<ObraDetailPage />} />
          <Route path="/stock" element={<StockListPage />} />
          <Route path="/stock/movimentos" element={<StockMovimentosPage />} />
          <Route path="/relatorios" element={<RelatoriosPage />} />
          <Route path="/definicoes" element={<DefinicoesPage />} />
          <Route element={<ProtectedRoute adminOnly />}>
            <Route path="/utilizadores" element={<UtilizadoresPage />} />
          </Route>
        </Route>
      </Route>

      {/* Public website */}
      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="/empresa" element={<EmpresaPage />} />
        <Route path="/servicos" element={<ServicosPage />} />
        <Route path="/obras" element={<ObrasPublicPage />} />
        <Route path="/contactos" element={<ContactosPage />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
