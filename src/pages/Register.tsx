import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChefHat, Loader2 } from 'lucide-react';
import api from '../api';

interface RegisterProps {
  onRegister?: () => void;
}

export default function Register({ onRegister }: RegisterProps) {
  const [form, setForm] = useState({
    nome: '',
    email: '',
    nomeNegocio: '',
    telefone: '',
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro('');

    if (!form.username.trim() || !form.password.trim()) {
      setErro('Usuário e senha são obrigatórios.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setErro('As senhas não coincidem.');
      return;
    }

    setCarregando(true);
    try {
      const payload = {
        username: form.username.trim(),
        password: form.password,
        nome: form.nome.trim(),
        email: form.email.trim(),
        nomeNegocio: form.nomeNegocio.trim(),
        telefone: form.telefone.trim(),
      };
      const response = await api.post('/auth/register', payload);
      localStorage.setItem('token', response.data.access_token);
      if (onRegister) onRegister();
      navigate('/');
    } catch (err: any) {
      if (err.response?.status === 409) {
        setErro('Usuário já existe. Escolha outro nome de usuário.');
      } else {
        setErro('Erro ao criar conta. Tente novamente.');
      }
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4">
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-8 w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-6">
          <ChefHat size={24} className="text-cyan-400" />
          <span className="text-xl font-bold text-white">IonFinance</span>
        </div>
        <h1 className="text-2xl font-bold text-white text-center mb-2">Criar conta grátis</h1>
        <p className="text-sm text-slate-400 text-center mb-6">Teste por 7 dias, sem compromisso.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Nome completo</label>
            <input
              type="text"
              name="nome"
              value={form.nome}
              onChange={handleChange}
              className="w-full bg-[#020617] border border-slate-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">E-mail</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full bg-[#020617] border border-slate-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Nome do negócio</label>
            <input
              type="text"
              name="nomeNegocio"
              value={form.nomeNegocio}
              onChange={handleChange}
              className="w-full bg-[#020617] border border-slate-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Telefone</label>
            <input
              type="tel"
              name="telefone"
              value={form.telefone}
              onChange={handleChange}
              className="w-full bg-[#020617] border border-slate-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div className="border-t border-slate-800 pt-4 mt-4">
            <label className="block text-xs text-slate-400 mb-1">Usuário *</label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              required
              className="w-full bg-[#020617] border border-slate-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Senha *</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full bg-[#020617] border border-slate-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Confirmar senha *</label>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              className="w-full bg-[#020617] border border-slate-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-cyan-500"
            />
          </div>

          {erro && <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg py-2 px-3">{erro}</p>}

          <button
            type="submit"
            disabled={carregando}
            className="w-full bg-cyan-500 hover:bg-cyan-400 text-white font-bold py-2.5 rounded-lg text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {carregando ? <Loader2 size={14} className="animate-spin" /> : 'Criar conta'}
          </button>
        </form>

        <p className="text-xs text-slate-500 text-center mt-4">
          Já tem conta?{' '}
          <Link to="/login" className="text-cyan-400 hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}