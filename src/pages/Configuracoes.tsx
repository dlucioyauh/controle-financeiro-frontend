import { useEffect, useState } from 'react';
import { Save, Key, User, MapPin, Building, Crown, Check } from 'lucide-react';
import api from '../api';

interface PlanoCard {
  nome: string;
  preco: string;
  periodo: string;
  descricao: string;
  limites: { label: string; value: string }[];
  recursos: string[];
  destaque?: boolean;
}

export default function Configuracoes() {
  const [perfil, setPerfil] = useState<any>({});
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [uploading, setUploading] = useState(false);
  const [assinarLoading, setAssinarLoading] = useState<string | null>(null);

  const planos: PlanoCard[] = [
    {
      nome: 'Free',
      preco: 'R$ 0',
      periodo: 'sempre grátis',
      descricao: 'Para experimentar o sistema',
      limites: [
        { label: 'Vendas/mês', value: '10' },
        { label: 'Clientes', value: '5' },
        { label: 'Receitas', value: '5' },
      ],
      recursos: ['Cadastro de clientes', 'Registro de vendas', 'Despesas básicas', 'Relatórios simples (PDF/Excel)'],
    },
    {
      nome: 'Basic',
      preco: 'R$ 29,90',
      periodo: '/mês',
      descricao: 'Para pequenos negócios',
      limites: [
        { label: 'Vendas/mês', value: '100' },
        { label: 'Clientes', value: '50' },
        { label: 'Receitas', value: '30' },
      ],
      recursos: ['Tudo do Free', 'Limites maiores', 'Suporte por e-mail', 'Exportação avançada'],
    },
    {
      nome: 'Pro',
      preco: 'R$ 79,90',
      periodo: '/mês',
      descricao: 'Para negócios em crescimento',
      limites: [
        { label: 'Vendas/mês', value: 'Ilimitado' },
        { label: 'Clientes', value: 'Ilimitado' },
        { label: 'Receitas', value: 'Ilimitado' },
      ],
      recursos: ['Tudo do Basic', 'Relatórios avançados', 'Mapa de clientes', 'Cálculo de frete', 'Suporte prioritário'],
      destaque: true,
    },
    {
      nome: 'Premium',
      preco: 'R$ 199,90',
      periodo: '/mês',
      descricao: 'Para empresas consolidadas',
      limites: [
        { label: 'Vendas/mês', value: 'Ilimitado' },
        { label: 'Clientes', value: 'Ilimitado' },
        { label: 'Receitas', value: 'Ilimitado' },
      ],
      recursos: ['Tudo do Pro', 'Consultoria personalizada', 'API de integração', 'Múltiplos usuários', 'Suporte 24/7'],
    },
  ];

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
      };

      if (perfil.enderecoOrigem && perfil.cidadeOrigem) {
        try {
          const enderecoCompleto = `${perfil.enderecoOrigem}, ${perfil.bairroOrigem}, ${perfil.cidadeOrigem}, ${perfil.estadoOrigem}, Brasil`;
          const resp = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(enderecoCompleto)}`);
          const dados = await resp.json();
          if (dados.length > 0) {
            payload.latitudeOrigem = parseFloat(dados[0].lat);
            payload.longitudeOrigem = parseFloat(dados[0].lon);
          }
        } catch (err) {}
      }
      await api.patch('/users/perfil', payload);
      if (payload.logo) localStorage.setItem('logo', payload.logo);
      else localStorage.removeItem('logo');
      window.location.reload();
    } catch (err) {
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
      await api.patch('/users/alterar-senha', { senhaAtual, novaSenha });
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmarSenha('');
      setMensagem('Senha alterada com sucesso!');
      setTimeout(() => setMensagem(''), 3000);
    } catch (err) {
      setMensagem('Senha atual incorreta.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setPerfil({ ...perfil, [e.target.name]: e.target.value });
  };

  const assinarPlano = async (priceId: string) => {
    setAssinarLoading(priceId);
    try {
      const res = await api.post('/stripe/create-checkout-session', { priceId });
      window.location.href = res.data.url;
    } catch (err) {
      setMensagem('Erro ao iniciar pagamento.');
      setAssinarLoading(null);
    }
  };

  const abrirPortal = async () => {
    try {
      const res = await api.get('/stripe/portal');
      window.location.href = res.data.url;
    } catch (err) {
      setMensagem('Erro ao abrir portal.');
    }
  };

  const priceBasic = import.meta.env.VITE_STRIPE_PRICE_BASIC || 'price_1TgB1WRxnn8X2fAM5pL8MCG8';
  const pricePro = import.meta.env.VITE_STRIPE_PRICE_PRO || 'price_1TgB2sRxnn8X2fAMGozAIlMr';
  const pricePremium = import.meta.env.VITE_STRIPE_PRICE_PREMIUM || 'price_1TgB3yRxnn8X2fAMtVdqzTJ4';

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-white flex items-center gap-2">
          <User size={24} className="text-cyan-400" /> Configurações
        </h1>
        <p className="text-slate-400 text-sm mt-1">Gerencie seus dados e planos de assinatura</p>
      </div>

      {mensagem && (
        <div className={`text-sm p-3 rounded-lg ${
          mensagem.includes('Erro') ? 'bg-red-500/10 border border-red-500/30 text-red-400' : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
        }`}>
          {mensagem}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Coluna esquerda – Formulários */}
        <div className="space-y-6">
          <div className="bg-[#0f172a] rounded-xl border border-slate-800 p-5">
            <h2 className="text-white font-medium flex items-center gap-2 mb-4">
              <User size={16} className="text-cyan-400" /> Perfil
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input name="nome" placeholder="Nome completo" value={perfil.nome || ''} onChange={handleChange}
                className="bg-[#1e293b] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white" />
              <input name="email" placeholder="E-mail" value={perfil.email || ''} onChange={handleChange}
                className="bg-[#1e293b] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white" />
              <input name="nomeNegocio" placeholder="Nome do negócio" value={perfil.nomeNegocio || ''} onChange={handleChange}
                className="bg-[#1e293b] border border-slate-700 rounded-lg px-3 py-2 text-sm" />
              <input name="telefone" placeholder="Telefone" value={perfil.telefone || ''} onChange={handleChange}
                className="bg-[#1e293b] border border-slate-700 rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>

          <div className="bg-[#0f172a] rounded-xl border border-slate-800 p-5">
            <h2 className="text-white font-medium flex items-center gap-2 mb-4">
              <Building size={16} className="text-cyan-400" /> Empresa
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <input name="cnpj" placeholder="CNPJ" value={perfil.cnpj || ''} onChange={handleChange}
                className="bg-[#1e293b] border border-slate-700 rounded-lg px-3 py-2 text-sm" />
              <input name="logo" placeholder="URL da logo (opcional)" value={perfil.logo || ''} onChange={handleChange}
                className="bg-[#1e293b] border border-slate-700 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="flex items-center gap-3">
              <label className="bg-slate-700 hover:bg-slate-600 text-white text-xs px-3 py-2 rounded-lg cursor-pointer">
                📁 Enviar logo
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              </label>
              <span className="text-xs text-slate-400">{uploading ? 'Carregando...' : 'PNG, JPG (máx 200 KB)'}</span>
            </div>
            {perfil.logo && (
              <div className="flex items-center gap-3 mt-3 p-2 bg-slate-800 rounded-lg">
                <img src={perfil.logo} alt="Logo" className="h-8 w-8 rounded object-cover" />
                <button onClick={() => setPerfil({ ...perfil, logo: '' })} className="text-red-400 text-xs hover:underline">Remover</button>
              </div>
            )}
          </div>

          <div className="bg-[#0f172a] rounded-xl border border-slate-800 p-5">
            <h2 className="text-white font-medium flex items-center gap-2 mb-4">
              <MapPin size={16} className="text-cyan-400" /> Endereço de Origem (entregas)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input name="enderecoOrigem" placeholder="Rua, número" value={perfil.enderecoOrigem || ''} onChange={handleChange}
                className="bg-[#1e293b] border border-slate-700 rounded-lg px-3 py-2 text-sm" />
              <input name="bairroOrigem" placeholder="Bairro" value={perfil.bairroOrigem || ''} onChange={handleChange}
                className="bg-[#1e293b] border border-slate-700 rounded-lg px-3 py-2 text-sm" />
              <input name="cidadeOrigem" placeholder="Cidade" value={perfil.cidadeOrigem || ''} onChange={handleChange}
                className="bg-[#1e293b] border border-slate-700 rounded-lg px-3 py-2 text-sm" />
              <input name="estadoOrigem" placeholder="Estado" value={perfil.estadoOrigem || ''} onChange={handleChange}
                className="bg-[#1e293b] border border-slate-700 rounded-lg px-3 py-2 text-sm" />
              <input name="cepOrigem" placeholder="CEP" value={perfil.cepOrigem || ''} onChange={handleChange}
                className="bg-[#1e293b] border border-slate-700 rounded-lg px-3 py-2 text-sm" />
              <div className="relative">
                <input name="taxaFreteKm" type="number" step="0.01" placeholder="Taxa por km" value={perfil.taxaFreteKm || ''} onChange={handleChange}
                  className="bg-[#1e293b] border border-slate-700 rounded-lg px-3 py-2 text-sm w-full" />
                <span className="absolute right-3 top-2 text-slate-400 text-xs">R$/km</span>
              </div>
            </div>
            <button onClick={salvarPerfil} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-1">
              <Save size={14} /> Salvar alterações
            </button>
          </div>
        </div>

        {/* Coluna direita – Planos e Segurança */}
        <div className="space-y-6">
          <div className="bg-[#0f172a] rounded-xl border border-slate-800 p-5">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-white font-medium flex items-center gap-2">
                  <Crown size={16} className="text-yellow-400" /> Planos e Assinatura
                </h2>
                <p className="text-xs text-slate-400">Escolha o plano ideal para o seu negócio</p>
              </div>
              {perfil.stripeSubscriptionStatus === 'active' && (
                <button onClick={abrirPortal} className="text-xs text-cyan-400 hover:underline">Gerenciar</button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {planos.map((plano) => {
                const isCurrentPlan = perfil.plano === plano.nome.toLowerCase();
                const priceId = plano.nome === 'Basic' ? priceBasic : plano.nome === 'Pro' ? pricePro : plano.nome === 'Premium' ? pricePremium : null;

                return (
                  <div
                    key={plano.nome}
                    className={`relative rounded-xl border transition-all ${
                      plano.destaque ? 'border-cyan-500/50 shadow-lg shadow-cyan-500/10' : 'border-slate-700'
                    } ${isCurrentPlan ? 'bg-slate-800/50 ring-1 ring-cyan-500' : 'bg-slate-800/30'} p-4`}
                  >
                    {plano.destaque && (
                      <div className="absolute -top-2 left-3 bg-cyan-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        MAIS POPULAR
                      </div>
                    )}
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-bold text-white">{plano.nome}</h3>
                        <p className="text-xs text-slate-400">{plano.descricao}</p>
                      </div>
                      {isCurrentPlan && <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">Atual</span>}
                    </div>
                    <div className="mt-2">
                      <span className="text-2xl font-bold text-white">{plano.preco}</span>
                      {plano.periodo !== 'sempre grátis' && <span className="text-slate-400 text-sm">{plano.periodo}</span>}
                    </div>

                    <div className="mt-3">
                      <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Limites</p>
                      <div className="grid grid-cols-3 gap-1 text-center">
                        {plano.limites.map((lim) => (
                          <div key={lim.label} className="bg-slate-900 rounded-md p-1.5">
                            <div className="text-[10px] text-slate-400">{lim.label}</div>
                            <div className="text-sm font-semibold text-white">{lim.value}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-3">
                      <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Recursos</p>
                      <ul className="space-y-0.5 text-xs">
                        {plano.recursos.slice(0, 3).map((recurso, idx) => (
                          <li key={idx} className="flex items-center gap-1 text-slate-300">
                            <Check size={12} className="text-emerald-400" /> {recurso}
                          </li>
                        ))}
                        {plano.recursos.length > 3 && (
                          <li className="text-slate-500 text-[11px] mt-1">+ {plano.recursos.length - 3} outros benefícios</li>
                        )}
                      </ul>
                    </div>

                    {priceId && perfil.plano !== plano.nome.toLowerCase() && (
                      <button
                        onClick={() => assinarPlano(priceId)}
                        disabled={assinarLoading === priceId}
                        className="mt-4 w-full bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white py-1.5 rounded-lg text-sm font-medium transition"
                      >
                        {assinarLoading === priceId ? 'Redirecionando...' : `Assinar ${plano.nome}`}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {perfil.plano === 'free' && perfil.trialEndsAt && (
              <div className="mt-4 text-xs bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-2 text-yellow-400">
                ⏳ Teste grátis termina em {new Date(perfil.trialEndsAt).toLocaleDateString('pt-BR')}. Escolha um plano.
              </div>
            )}
          </div>

          <div className="bg-[#0f172a] rounded-xl border border-slate-800 p-5">
            <h2 className="text-white font-medium flex items-center gap-2 mb-4">
              <Key size={16} className="text-yellow-400" /> Segurança
            </h2>
            <div className="space-y-3">
              <input type="password" placeholder="Senha atual" value={senhaAtual} onChange={(e) => setSenhaAtual(e.target.value)}
                className="w-full bg-[#1e293b] border border-slate-700 rounded-lg px-3 py-2 text-sm" />
              <input type="password" placeholder="Nova senha" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)}
                className="w-full bg-[#1e293b] border border-slate-700 rounded-lg px-3 py-2 text-sm" />
              <input type="password" placeholder="Confirmar nova senha" value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)}
                className="w-full bg-[#1e293b] border border-slate-700 rounded-lg px-3 py-2 text-sm" />
              <button onClick={alterarSenha} className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-1">
                <Key size={14} /> Alterar senha
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}