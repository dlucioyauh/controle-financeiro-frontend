import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff } from 'lucide-react';
import api from '../api';

export default function RedefinirSenha() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [carregando, setCarregando] = useState(false);

  // Se o token não estiver na URL, avisa o usuário
  if (!token) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#0f172a] border border-red-500/30 rounded-xl p-8 text-center">
          <h2 className="text-xl font-bold text-white mb-2">Link inválido</h2>
          <p className="text-slate-400 text-sm mb-6">
            O link de recuperação não é válido ou expirou. Por favor, solicite um novo link.
          </p>
          <Link to="/esqueci-senha" className="text-cyan-400 hover:text-cyan-300 text-sm font-medium">
            Solicitar novo link
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setSucesso('');

    if (novaSenha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (novaSenha !== confirmarSenha) {
      setErro('As senhas não coincidem.');
      return;
    }

    setCarregando(true);
    try {
      const res = await api.post('/auth/reset-password', { token, newPassword: novaSenha });
      setSucesso(res.data.message || 'Senha redefinida com sucesso!');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      setErro(err.response?.data?.message || 'Erro ao redefinir senha. O link pode ter expirado.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#0f172a] border border-slate-800 rounded-xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Redefinir Senha</h1>
          <p className="text-slate-400 text-sm">
            Crie uma nova senha segura para sua conta IonFinance.
          </p>
        </div>

        {sucesso ? (
          <div className="text-center space-y-4">
            <p className="text-emerald-400 font-medium">{sucesso}</p>
            <p className="text-slate-400 text-xs">Redirecionando para o login...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Nova Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type={mostrarSenha ? 'text' : 'password'}
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  required
                  className="w-full bg-[#020617] border border-slate-700 rounded-lg py-2.5 pl-10 pr-10 text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="Mínimo 6 caracteres"
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {mostrarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Confirmar Nova Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type={mostrarSenha ? 'text' : 'password'}
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  required
                  className="w-full bg-[#020617] border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="Repita a senha"
                />
              </div>
            </div>

            {erro && (
              <p className="text-red-400 text-xs bg-red-500/10 p-2 rounded">{erro}</p>
            )}

            <button
              type="submit"
              disabled={carregando}
              className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 disabled:text-slate-400 text-white font-semibold py-2.5 rounded-lg transition-colors"
            >
              {carregando ? 'Redefinindo...' : 'Redefinir Senha'}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link to="/login" className="text-sm text-slate-400 hover:text-cyan-400 transition-colors">
            Voltar para o login
          </Link>
        </div>
      </div>
    </div>
  );
}