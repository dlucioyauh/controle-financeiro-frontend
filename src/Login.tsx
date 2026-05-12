import { useState } from 'react';
import api from './api';

interface Props {
  onLogin: () => void;
}

function Login({ onLogin }: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [erro, setErro] = useState('');

  async function handleLogin() {
    try {
      const response = await api.post('/auth/login', { username, password });
      localStorage.setItem('token', response.data.access_token);
      onLogin();
    } catch {
      setErro('Usuário ou senha incorretos');
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
        <h1 className="text-3xl font-bold mb-6 text-center">Login</h1>

        {erro && (
          <p className="text-red-500 text-sm mb-4 text-center">{erro}</p>
        )}

        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Usuário"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="border p-3 rounded-lg"
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-3 rounded-lg"
          />
          <button
            onClick={handleLogin}
            disabled={!username || !password}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-3 rounded-xl font-bold"
          >
            Entrar
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;