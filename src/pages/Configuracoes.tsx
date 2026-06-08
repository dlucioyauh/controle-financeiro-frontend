import { useEffect, useState } from 'react';
import { Save, Key, User, MapPin, Building, Crown } from 'lucide-react';
import api from '../api';

export default function Configuracoes() {
  const [perfil, setPerfil] = useState<any>({});
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [uploading, setUploading] = useState(false);
  const [assinarLoading, setAssinarLoading] = useState<string | null>(null);

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
        plano: perfil.plano,       // ← ainda enviamos, mas o backend ignora se não for dlucio
      };

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

      if (payload.logo) {
        localStorage.setItem('logo', payload.logo);
      } else {
        localStorage.removeItem('logo');
      }

      window.location.reload();
    } catch (err) {
      console.error('Erro ao salvar perfil:', err);
      setMensagem('Erro ao salvar perfil.');
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 200 * 1024) {
      setMensagem('A imagem deve ter no máximo 200 KB.');
      return;
    }

    setUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      setPerfil({ ...perfil, logo: event.target?.result as string });
      setUploading(false);
    };
    reader.onerror = () => {
      setMensagem('Erro ao ler a imagem.');
      setUploading(false);
    };
    reader.readAsDataURL(file);
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

  // Stripe: assinar plano
  const assinarPlano = async (priceId: string) => {
    setAssinarLoading(priceId);
    try {
      const res = await api.post('/stripe/create-checkout-session', { priceId });
      window.location.href = res.data.url;
    } catch (err) {
      console.error('Erro ao iniciar checkout:', err);
      setMensagem('Erro ao iniciar pagamento. Tente novamente.');
      setAssinarLoading(null);
    }
  };

  // Stripe: portal do cliente
  const abrirPortal = async () => {
    try {
      const res = await api.get('/stripe/portal');
      window.location.href = res.data.url;
    } catch (err) {
      console.error('Erro ao abrir portal:', err);
      setMensagem('Erro ao abrir portal de gerenciamento.');
    }
  };

  // Price IDs de TESTE do Stripe
  const priceBasic = import.meta.env.VITE_STRIPE_PRICE_BASIC || 'price_1TgB1WRxnn8X2fAM5pL8MCG8';
  const pricePro = import.meta.env.VITE_STRIPE_PRICE_PRO || 'price_1TgB2sRxnn8X2fAMGozAIlMr';
  const pricePremium = import.meta.env.VITE_STRIPE_PRICE_PREMIUM || 'price_1TgB3yRxnn8X2fAMtVdqzTJ4';

  const isAdmin = perfil.username === 'dlucio';

  return (
    <div className="space-y-6 text-slate-200 max-w-2xl mx-auto">
      <div className="bg-[#0f172a] p-4 rounded-lg border border-slate-800">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <User size={20} className="text-cyan-400" /> Configurações
        </h1>
        <p className="text-xs text-slate-400">Gerencie seu perfil, endereço de origem e preferências.</p>
      </div>

      {mensagem && (
        <div className={`text-xs p-3 rounded-lg ${
          mensagem.includes('Erro')
            ? 'bg-red-500/10 border border-red-500/30 text-red-400'
            : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
        }`}>
          {mensagem}
        </div>
      )}

      {/* ... (restante do JSX permanece igual até a seção de Plano e Preferências) ... */}

      {/* Plano e Preferências */}
      <div className="bg-[#0f172a] p-4 rounded-lg border border-slate-800 space-y-3">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Crown size={16} className="text-yellow-400" /> Plano e Preferências
        </h2>

        {perfil.plano === 'free' && perfil.trialEndsAt && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-xs text-yellow-400">
            ⏳ Seu período de teste termina em{' '}
            {new Date(perfil.trialEndsAt).toLocaleDateString('pt-BR')}.
            Após isso, escolha um plano para continuar usando o sistema.
          </div>
        )}

        {perfil.stripeSubscriptionStatus === 'active' && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 text-xs text-emerald-400 flex items-center justify-between">
            <span>✅ Assinatura ativa ({perfil.plano})</span>
            <button onClick={abrirPortal} className="underline text-cyan-400 hover:text-cyan-300">
              Gerenciar assinatura
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Plano atual</label>
            <select
              name="plano"
              value={perfil.plano || 'free'}
              onChange={handleChange}
              disabled={!isAdmin}   // ← APENAS ADMIN PODE ALTERAR MANUALMENTE
              className={`bg-[#1e293b] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 w-full ${
                !isAdmin ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              <option value="free">Free (7 dias)</option>
              <option value="basic">Basic</option>
              <option value="pro">Pro</option>
              <option value="premium">Premium</option>
            </select>
            {!isAdmin && (
              <p className="text-[10px] text-slate-500 mt-1">
                O plano é alterado automaticamente após a confirmação do pagamento. Use os botões abaixo para fazer upgrade.
              </p>
            )}
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

        {/* Cards dos planos com botão de assinatura */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {/* ... (mantenha os cards exatamente como estavam) ... */}
        </div>
        <p className="text-[10px] text-slate-500">
          Após o teste de 7 dias, escolha um plano para continuar.
        </p>
      </div>

      {/* ... (restante do JSX permanece igual) ... */}
    </div>
  );
}