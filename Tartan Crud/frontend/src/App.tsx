import { useState } from 'react';
import { setToken, Usuario } from './api';
import { Chat } from './Chat';
import { Dashboard } from './Dashboard';
import { Login } from './Login';

export function App() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  function sair() {
    setToken(null);
    setUsuario(null);
  }

  // O chat de atendimento (ex-WhatsApp) fica disponível sempre, inclusive
  // antes do login — como seria o WhatsApp público do restaurante.
  if (!usuario) {
    return (
      <>
        <Login onLogin={setUsuario} />
        <Chat />
      </>
    );
  }

  const podeVerDashboard = usuario.role === 'ADMIN' || usuario.role === 'FUNCIONARIO';

  return (
    <>
      <header className="topbar">
        <h1 className="brand">
          Tartan <span>·</span> Gestão
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span className="user">
            {usuario.nome} ({usuario.role})
          </span>
          <button className="btn secondary" onClick={sair}>
            Sair
          </button>
        </div>
      </header>

      {podeVerDashboard ? (
        <Dashboard />
      ) : (
        <div className="container">
          <div className="panel">
            <h2>Bem-vindo, {usuario.nome}</h2>
            <p style={{ color: 'var(--muted)' }}>
              Seu perfil ({usuario.role}) não tem acesso ao dashboard gerencial.
              Use o chat de atendimento no canto inferior direito.
            </p>
          </div>
        </div>
      )}

      <Chat />
    </>
  );
}
