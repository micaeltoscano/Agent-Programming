import { useState } from 'react';
import { api } from './api';
import { useAuth } from './contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@tartan.com');
  const [senha, setSenha] = useState('senha123');
  const [nome, setNome] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setErro('');
    setCarregando(true);
    try {
      if (isRegister) {
        await api.register(nome, email, senha);
      }
      const { accessToken, usuario } = await api.login(email, senha);
      login(usuario, accessToken);
      navigate(usuario.role === 'ADMIN' || usuario.role === 'FUNCIONARIO' ? '/dashboard' : '/catalogo');
    } catch (err: any) {
      setErro(err.message || (isRegister ? 'Falha no cadastro' : 'Falha no login'));
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="login-wrap">
      <form className="login-box" onSubmit={entrar}>
        <div className="brand-icon">🍣</div>
        <h1>TARTAN</h1>
        
        {isRegister && (
          <div className="field">
            <label>Nome</label>
            <input 
              value={nome} 
              onChange={(e) => setNome(e.target.value)} 
              type="text" 
              placeholder="Seu Nome"
              required
            />
          </div>
        )}

        <div className="field">
          <label>E-mail</label>
          <input 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            type="email" 
            placeholder="E-mail"
            required
          />
        </div>
        <div className="field">
          <label>Senha</label>
          <input 
            value={senha} 
            onChange={(e) => setSenha(e.target.value)} 
            type="password" 
            placeholder="Senha"
            required
          />
        </div>
        
        <button className="btn" disabled={carregando}>
          {carregando ? 'Aguarde…' : (isRegister ? 'Criar Conta' : 'Entrar')}
        </button>

        <div className="login-footer">
          {!isRegister && <span style={{ cursor: 'pointer' }}>Esqueceu a senha?</span>}
          <span style={{ cursor: 'pointer' }} onClick={() => setIsRegister(!isRegister)}>
            {isRegister ? 'Já tenho conta (Entrar)' : 'Criar Conta'}
          </span>
        </div>

        {erro && <div className="error">{erro}</div>}
        
        <div className="hint">
          {isRegister ? 'O seu acesso será restrito a cliente.' : 'O seu acesso determina as permissões de administração.\n(Teste: admin@tartan.com / senha123)'}
        </div>
      </form>
    </div>
  );
}
