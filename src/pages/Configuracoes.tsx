import { useEffect, useState } from 'react';
import { Settings, User, Lock, Save } from 'lucide-react';
import api from '../api';

export default function Configuracoes() {
  const [nomeNegocio, setNomeNegocio] = useState('');
  const [username, setUsername] = useState('');
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [msgPerfil, setMsgPerfil] = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null);
  const [msgSenha, setMsgSenha] = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null);
  const [salvandoPerfil, setSalvandoPerfil] = useState(false);
  const [salvandoSenha, setSalvandoSenha] = useState(false);

  useEffect(() => {
    api.get('/users/perfil').then((res) => {
      setNomeNegocio(res.data.nomeNegocio || '');
      setUsername(res.data.username || '');
    });
  }, []);

  async function salvarPerfil() {
    setSalvandoPerfil(true);
    setMsgPerfil(null);
    try {
      await api.patch('/users/perfil', { nomeNegocio });
      setMsgPerfil({ tipo: 'ok', texto: 'Perfil atualizado com sucesso!' });
    } catch {
      setMsgPerfil({ tipo: 'erro', texto: 'Erro ao salvar perfil.' });
    } finally {
      setSalvandoPerfil(false);
    }
  }

  async function alterarSenha() {
    setMsgSenha(null);
    if (novaSenha !== confirmarSenha) {
      setMsgSenha({ tipo: 'erro', texto: 'As senhas não coincidem.' });
      return;
    }
    if (novaSenha.length < 6) {
      setMsgSenha({ tipo: 'erro', texto: 'A nova senha deve ter pelo menos 6 caracteres.' });
      return;
    }
    setSalvandoSenha(true);
    try {
      await api.patch('/users/alterar-senha', { senhaAtual, novaSenha });
      setMsgSenha({ tipo: 'ok', texto: 'Senha alterada com sucesso!' });
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmarSenha('');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Erro ao alterar senha.';
      setMsgSenha({ tipo: 'erro', texto: msg });
    } finally {
      setSalvandoSenha(false);
    }
  }

  return (
    <div className="space-y-6 text-slate-200">
      <div className="bg-[#0f172a] p-4 rounded-lg border border-slate-800">
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <Settings size={20} className="text-cyan-400" /> Configurações
        </h1>
        <p className="text-xs text-slate-400">Gerencie seu perfil e segurança da conta.</p>
      </div>

      {/* PERFIL */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-lg p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <User size={16} className="text-cyan-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Perfil</h2>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] uppercase tracking-wide text-slate-400 font-medium">Usuário</label>
          <input
            value={username}
            disabled
            className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-500 cursor-not-allowed"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] uppercase tracking-wide text-slate-400 font-medium">Nome do Negócio</label>
          <input
            value={nomeNegocio}
            onChange={(e) => setNomeNegocio(e.target.value)}
            placeholder="Ex: Confeitaria da Ana"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {msgPerfil && (
          <p className={`text-xs ${msgPerfil.tipo === 'ok' ? 'text-emerald-400' : 'text-red-400'}`}>
            {msgPerfil.texto}
          </p>
        )}

        <button
          onClick={salvarPerfil}
          disabled={salvandoPerfil}
          className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-bold px-4 py-2 rounded-lg text-xs transition-colors"
        >
          <Save size={14} />
          {salvandoPerfil ? 'Salvando...' : 'Salvar Perfil'}
        </button>
      </div>

      {/* ALTERAR SENHA */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-lg p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Lock size={16} className="text-cyan-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Alterar Senha</h2>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] uppercase tracking-wide text-slate-400 font-medium">Senha Atual</label>
          <input
            type="password"
            value={senhaAtual}
            onChange={(e) => setSenhaAtual(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] uppercase tracking-wide text-slate-400 font-medium">Nova Senha</label>
          <input
            type="password"
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] uppercase tracking-wide text-slate-400 font-medium">Confirmar Nova Senha</label>
          <input
            type="password"
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {msgSenha && (
          <p className={`text-xs ${msgSenha.tipo === 'ok' ? 'text-emerald-400' : 'text-red-400'}`}>
            {msgSenha.texto}
          </p>
        )}

        <button
          onClick={alterarSenha}
          disabled={salvandoSenha}
          className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-bold px-4 py-2 rounded-lg text-xs transition-colors"
        >
          <Lock size={14} />
          {salvandoSenha ? 'Alterando...' : 'Alterar Senha'}
        </button>
      </div>
    </div>
  );
}