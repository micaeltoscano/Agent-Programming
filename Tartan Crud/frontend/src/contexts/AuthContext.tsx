import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, getToken, setToken as setApiToken, Usuario } from '../api';

interface AuthContextType {
  usuario: Usuario | null;
  loading: boolean;
  login: (usuario: Usuario, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const token = getToken();
      if (token) {
        try {
          const user = await api.me();
          setUsuario(user);
        } catch (error) {
          console.error("Token inválido ou expirado", error);
          setApiToken(null);
        }
      }
      setLoading(false);
    }
    loadUser();
  }, []);

  const login = (u: Usuario, t: string) => {
    setApiToken(t);
    setUsuario(u);
  };

  const logout = () => {
    setApiToken(null);
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
