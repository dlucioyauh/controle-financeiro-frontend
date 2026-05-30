import { useEffect, useState } from 'react';
import { Save, Key, User, MapPin, Building, Crown, Palette } from 'lucide-react';
import api from '../api';

export default function Configuracoes() {
  const [perfil, setPerfil] = useState<any>({});
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [mensagem, setMensagem] = useState('');

  const carregarPerfil = async () => {
    try {
      const res = await api.get('/users/perfil');
      setPerfil(res.data);
    } catch (err) {
      console.error('Erro ao carregar perfil:', err);
    }
  };

  useEffect(() => {
    carregarPerfil();
  }, []);

  const salvarPerfil = async () => {
    try {
      const payload: any = {
        nome: perfil.nome,
        email: perfil.email,
        nomeNegocio: perfil.nomeNegocio,
        telefone: perfil.telefone,
        enderecoOrigem: perfil.enderecoOrigem,
        bairroOrigem: perfil.bairroOrigem,
        cidadeOrigem: perfil.cidadeOrigem,
        estadoOrigem: perfil.estadoOrigem,
        cepOrigem: perfil.cepOrigem,
        taxaFreteKm: parseFloat(perfil.taxaFreteKm) || 0.8,
        cnpj: perfil.cnpj,
        logo: perfil.logo,
        plano: perfil.plano,
        tema: perfil.tema,
      };

      // Geocodificação do endereço de origem
      if (perfil.enderecoOrigem && perfil.cidadeOrigem) {
        try {
          const enderecoCompleto = `${perfil.enderecoOrigem}, ${perfil.bairroOrigem}, ${perfil.cidadeOrigem}, ${perfil.estadoOrigem}, Brasil`;
          const resp = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(enderecoCompleto)}`
          );
          const dados = await resp.json();
          if (dados.length > 0) {
            payload.latitudeOrigem = parseFloat(dados[0].lat);
            payload.longitudeOrigem = parseFloat(dados[0].lon);
          }
        } catch (err) {
          console.error('Erro na geocodificação do endereço de origem:', err);
        }
      }

      await api.patch('/users/perfil', payload);
      setMensagem('Perfil atualizado com sucesso!');
      setTimeout(() => setMensagem(''), 3000);
    } catch (err) {
      console.error('Erro ao salvar perfil:', err);
      setMensagem('Erro ao salvar perfil.');
    }
  };

  const alterarSenha = async () => {
    if (novaSenha !== confirmarSenha) {
      setMensagem('As senhas não coincidem.');
      return;
    }
    try {
      await api.patch('/users/alterar-senha', {
        senhaAtual,
        novaSenha,
      });
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmarSenha('');
      setMensagem('Senha alterada com sucesso!');
      setTimeout(() => setMensagem(''), 3000);
    } catch (err) {
      console.error('Erro ao alterar senha:', err);
      setMensagem('Senha atual incorreta.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setPerfil({ ...perfil, [e.target.name]: e.target.value });
  };

  return (
    <div className="space-y-6 text-slate-200 max-w-2xl mx-auto">
      <div className="bg-[#0f172a] p-4 rounded-lg border border-slate-800">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <User size={20} className="text-cyan-400" /> Configurações
        </h1>
        <p className="text-xs text-slate-400">Gerencie seu perfil, endereço de origem e preferências.</p>
      </div>

      {mensagem && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs p-3 rounded-lg">
          {mensagem}
        </div>
      )}

      {/* Dados do Perfil */}
      <div className="bg-[#0f172a] p-4 rounded-lg border border-slate-800 space-y-3">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <User size={16} className="text-cyan-400" /> Dados do Perfil
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input name="nome" placeholder="Nome completo" value={perfil.nome || ''} onChange={handleChange}
            className="bg-[#1e293b] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500" />
          <input name="email" placeholder="E-mail" value={perfil.email || ''} onChange={handleChange}
            className="bg-[#1e293b] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500" />
          <input name="nomeNegocio" placeholder="Nome do negócio" value={perfil.nomeNegocio || ''} onChange={handleChange}
            className="bg-[#1e293b] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500" />
          <input name="telefone" placeholder="Telefone" value={perfil.telefone || ''} onChange={handleChange}
            className="bg-[#1e293b] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500" />
        </div>
      </div>

      {/* Dados da Empresa (CNPJ + Logo) */}
      <div className="bg-[#0f172a] p-4 rounded-lg border border-slate-800 space-y-3">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Building size={16} className="text-cyan-400" /> Dados da Empresa
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input name="cnpj" placeholder="CNPJ (ex: 00.000.000/0001-00)" value={perfil.cnpj || ''} onChange={handleChange}
            className="bg-[#1e293b] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500" />
          <input name="logo" placeholder="URL da logo" value={perfil.logo || ''} onChange={handleChange}
            className="bg-[#1e293b] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500" />
        </div>
        <p className="text-[10px] text-slate-500">
          Insira a URL da sua logo (recomendado hospedar em um serviço de imagens). O CNPJ é opcional.
        </p>
      </div>

      {/* Endereço de Origem */}
      <div className="bg-[#0f172a] p-4 rounded-lg border border-slate-800 space-y-3">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <MapPin size={16} className="text-cyan-400" /> Endereço de Origem (Entregas)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input name="enderecoOrigem" placeholder="Rua, número" value={perfil.enderecoOrigem || ''} onChange={handleChange}
            className="bg-[#1e293b] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500" />
          <input name="bairroOrigem" placeholder="Bairro" value={perfil.bairroOrigem || ''} onChange={handleChange}
            className="bg-[#1e293b] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500" />
          <input name="cidadeOrigem" placeholder="Cidade" value={perfil.cidadeOrigem || ''} onChange={handleChange}
            className="bg-[#1e293b] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500" />
          <input name="estadoOrigem" placeholder="Estado (ex: SC)" value={perfil.estadoOrigem || ''} onChange={handleChange}
            className="bg-[#1e293b] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500" />
          <input name="cepOrigem" placeholder="CEP" value={perfil.cepOrigem || ''} onChange={handleChange}
            className="bg-[#1e293b] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500" />
          <div className="relative">
            <input name="taxaFreteKm" type="number" step="0.01" placeholder="Taxa por km (ex: 0.80)" value={perfil.taxaFreteKm || ''} onChange={handleChange}
              className="bg-[#1e293b] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 w-full" />
            <span className="absolute right-3 top-2.5 text-slate-400 text-sm">R$/km</span>
          </div>
        </div>
        <button onClick={salvarPerfil}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-1">
          <Save size={14} /> Salvar Perfil
        </button>
      </div>

      {/* Plano e Preferências */}
      <div className="bg-[#0f172a] p-4 rounded-lg border border-slate-800 space-y-3">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Crown size={16} className="text-yellow-400" /> Plano e Preferências
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Plano atual</label>
            <select name="plano" value={perfil.plano || 'free'} onChange={handleChange}
              className="bg-[#1e293b] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 w-full">
              <option value="free">Free</option>
              <option value="pro">Pro</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Tema</label>
            <select name="tema" value={perfil.tema || 'dark'} onChange={handleChange}
              className="bg-[#1e293b] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 w-full">
              <option value="dark">Escuro</option>
              <option value="light">Claro</option>
            </select>
          </div>
        </div>
        <p className="text-[10px] text-slate-500">
          O tema será aplicado em uma atualização futura. O plano Pro desbloqueará funcionalidades premium em breve.
        </p>
      </div>

      {/* Alterar Senha */}
      <div className="bg-[#0f172a] p-4 rounded-lg border border-slate-800 space-y-3">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Key size={16} className="text-yellow-400" /> Alterar Senha
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input type="password" placeholder="Senha atual" value={senhaAtual}
            onChange={(e) => setSenhaAtual(e.target.value)}
            className="bg-[#1e293b] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500" />
          <input type="password" placeholder="Nova senha" value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
            className="bg-[#1e293b] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500" />
          <input type="password" placeholder="Confirmar nova senha" value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
            className="bg-[#1e293b] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500" />
        </div>
        <button onClick={alterarSenha}
          className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-1">
          <Key size={14} /> Alterar Senha
        </button>
      </div>
    </div>
  );
}