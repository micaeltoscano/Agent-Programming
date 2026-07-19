import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { Chat } from './Chat';
import { Dashboard } from './Dashboard';
import { Login } from './Login';
import { Catalogo } from './Catalogo';
import { HistoricoPedidos } from './HistoricoPedidos';
import { Cozinha } from './Cozinha';
import { Motoboy } from './Motoboy';
import { AdminCrud } from './AdminCrud';

export function App() {
  const { usuario, loading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Carregando sessão...</div>;
  }

  if (!usuario) {
    return (
      <>
        <Login />
        <Chat />
      </>
    );
  }

  const role = usuario.role;
  const isAdminOrFunc = role === 'ADMIN' || role === 'FUNCIONARIO';
  const isCozinha = role === 'COZINHA';
  const isMotoboy = role === 'MOTOBOY';
  
  // Decide the default dashboard path
  let defaultPath = '/catalogo';
  if (isAdminOrFunc) defaultPath = '/dashboard';
  else if (isCozinha) defaultPath = '/cozinha';
  else if (isMotoboy) defaultPath = '/motoboy';

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand" style={{ letterSpacing: '2px', fontWeight: 800 }}>
          TARTAN
        </div>
        <ul className="sidebar-menu">
          {isAdminOrFunc && (
            <>
              <li className={location.pathname === '/dashboard' ? 'active' : ''} onClick={() => navigate('/dashboard')}>
                Dashboard
              </li>
              <li className={location.pathname === '/admin' ? 'active' : ''} onClick={() => navigate('/admin')}>
                Cadastros (Admin)
              </li>
            </>
          )}
          
          {(isAdminOrFunc || isCozinha) && (
            <li className={location.pathname === '/cozinha' ? 'active' : ''} onClick={() => navigate('/cozinha')}>
              Cozinha
            </li>
          )}

          {(isAdminOrFunc || isMotoboy) && (
            <li className={location.pathname === '/motoboy' ? 'active' : ''} onClick={() => navigate('/motoboy')}>
              Entregas
            </li>
          )}

          <li className={location.pathname === '/historico' ? 'active' : ''} onClick={() => navigate('/historico')}>
            Meus Pedidos
          </li>

          <li className={location.pathname === '/catalogo' ? 'active' : ''} onClick={() => navigate('/catalogo')}>
            Catálogo
          </li>
        </ul>
      </aside>

      <main className="main-content">
        <header className="main-header">
          <div className="user" style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 600 }}>
            <div className="user-avatar">{usuario.nome.charAt(0).toUpperCase()}</div>
            <span>{usuario.nome} ({role})</span>
            <button className="btn secondary" onClick={() => { logout(); navigate('/'); }} style={{ padding: '6px 12px', marginLeft: '12px' }}>
              Sair
            </button>
          </div>
        </header>

        <div className="container" style={{ paddingTop: '24px' }}>
          <Routes>
            <Route path="/" element={<Navigate to={defaultPath} replace />} />
            
            {isAdminOrFunc && <Route path="/dashboard" element={<Dashboard />} />}
            {isAdminOrFunc && <Route path="/admin" element={<AdminCrud />} />}
            
            {(isAdminOrFunc || isCozinha) && <Route path="/cozinha" element={<Cozinha />} />}
            {(isAdminOrFunc || isMotoboy) && <Route path="/motoboy" element={<Motoboy />} />}
            
            <Route path="/catalogo" element={<Catalogo />} />
            <Route path="/historico" element={<HistoricoPedidos />} />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>

      <Chat />
    </div>
  );
}
