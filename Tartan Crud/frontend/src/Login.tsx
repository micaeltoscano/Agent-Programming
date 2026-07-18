import { useState } from 'react';
import { api, setToken, Usuario } from './api';

export function Login({ onLogin }: { onLogin: (u: Usuario) => void }) {
  const [email, setEmail] = useState('admin@tartan.com');
  const [senha, setSenha] = useState('senha123');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setErro('');
    setCarregando(true);
    try {
      const { accessToken, usuario } = await api.login(email, senha);
      setToken(accessToken);
      onLogin(usuario);
    } catch (err: any) {
      setErro(err.message || 'Falha no login');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="login-wrap">
      <form className="login-box" onSubmit={entrar}>
        <h1>
          Tartan <span style={{ color: 'var(--accent)' }}>🍱</span>
        </h1>
        <p>Painel de gestão do restaurante</p>
        <div className="field">
          <label>E-mail</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
        </div>
        <div className="field">
          <label>Senha</label>
          <input value={senha} onChange={(e) => setSenha(e.target.value)} type="password" />
        </div>
        <button className="btn" disabled={carregando}>
          {carregando ? 'Entrando…' : 'Entrar'}
        </button>
        {erro && <div className="error">{erro}</div>}
        <div className="hint">
          Dados de teste (seed): admin@tartan.com / senha123
        </div>
      </form>
    </div>
  );
}
