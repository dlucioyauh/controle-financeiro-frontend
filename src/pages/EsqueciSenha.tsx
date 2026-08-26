import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import api from '../api';

export default function EsqueciSenha() {
  const [email, setEmail] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      await api.post('/auth/forgot-password', { email });
      setEnviado(true);
    } catch (err: any) {
      setErro(err.response?.data?.message || 'Erro ao processar solicitação.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#0f172a] border border-slate-800 rounded-xl shadow-2xl p-8">
        
        {enviado ? (
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">E-mail enviado!</h2>
            <p className="text-slate-400 text-sm">
              Se o e-mail <strong className="text-cyan-400">{email}</strong> estiver cadastrado, você receberá um link de recuperação em instantes. O link é válido por 15 minutos.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="mt-6 w-full bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-2.5 rounded-lg transition-colors"
            >
              Voltar para o Login
            </button>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-white mb-2">Esqueceu sua senha?</h1>
              <p className="text-slate-400 text-sm">
                Digite seu e-mail abaixo e enviaremos um link seguro para você redefinir sua senha.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-[#020617] border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors"
                    placeholder="seu@email.com"
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
                {carregando ? 'Enviando...' : 'Enviar link de recuperação'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link to="/login" className="inline-flex items-center text-sm text-slate-400 hover:text-cyan-400 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Voltar para o login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}