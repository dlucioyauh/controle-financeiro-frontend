import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from './api';

interface Props {
  onLogin?: () => void;
}

function Login({ onLogin }: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [erro, setErro] = useState('');

  async function handleLogin() {
    try {
      const response = await api.post('/auth/login', { username, password });
      localStorage.setItem('token', response.data.access_token);
      if (onLogin) onLogin();
    } catch {
      setErro('Usuário ou senha incorretos');
    }
  }

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4">
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-white text-center mb-6">Entrar</h1>

        {erro && (
          <p className="text-red-400 text-xs mb-4 text-center bg-red-500/10 border border-red-500/20 rounded-lg py-2">
            {erro}
          </p>
        )}

        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Usuário</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-[#020617] border border-slate-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-cyan-500"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#020617] border border-slate-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-cyan-500"
            />
          </div>
          <button
            onClick={handleLogin}
            disabled={!username || !password}
            className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-white font-bold py-2.5 rounded-lg text-sm transition-colors"
          >
            Entrar
          </button>
        </div>

        <p className="text-xs text-slate-500 text-center mt-4">
          Não tem conta?{' '}
          <Link to="/register" className="text-cyan-400 hover:underline">
            Criar conta grátis
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;