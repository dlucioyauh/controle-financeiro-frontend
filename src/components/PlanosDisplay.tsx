import { Crown } from 'lucide-react';

interface Plano {
  nome: string;
  preco: string;
  recursos: string[];
  limiteVendas: string;
  limiteClientes: string;
  limiteReceitas: string;
  relatoriosAvancados: boolean;
  cor: string;
}

const planos: Plano[] = [
  {
    nome: 'Free',
    preco: 'R$ 0',
    recursos: ['Cadastro de clientes', 'Registro de vendas', 'Despesas básicas', 'Relatórios simples (PDF/Excel)'],
    limiteVendas: '10 vendas/mês',
    limiteClientes: '5 clientes',
    limiteReceitas: '5 receitas',
    relatoriosAvancados: false,
    cor: 'from-gray-600 to-gray-800',
  },
  {
    nome: 'Basic',
    preco: 'R$ 29,90/mês',
    recursos: ['Tudo do Free', 'Limites maiores', 'Suporte por e-mail', 'Exportação avançada'],
    limiteVendas: '100 vendas/mês',
    limiteClientes: '50 clientes',
    limiteReceitas: '30 receitas',
    relatoriosAvancados: false,
    cor: 'from-blue-600 to-blue-800',
  },
  {
    nome: 'Pro',
    preco: 'R$ 79,90/mês',
    recursos: ['Tudo do Basic', 'Relatórios avançados (gráficos, filtros)', 'Mapa de clientes', 'Cálculo de frete automático', 'Suporte prioritário'],
    limiteVendas: 'Ilimitado',
    limiteClientes: 'Ilimitado',
    limiteReceitas: 'Ilimitado',
    relatoriosAvancados: true,
    cor: 'from-purple-600 to-purple-800',
  },
  {
    nome: 'Premium',
    preco: 'R$ 199,90/mês',
    recursos: ['Tudo do Pro', 'Consultoria personalizada', 'API de integração', 'Múltiplos usuários', 'Suporte 24/7'],
    limiteVendas: 'Ilimitado',
    limiteClientes: 'Ilimitado',
    limiteReceitas: 'Ilimitado',
    relatoriosAvancados: true,
    cor: 'from-yellow-600 to-yellow-800',
  },
];

export default function PlanosDisplay() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-white">Planos e Assinatura</h2>
        <p className="text-xs text-slate-400">Escolha o plano que melhor atende às suas necessidades</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {planos.map((plano) => (
          <div
            key={plano.nome}
            className={`bg-gradient-to-br ${plano.cor} rounded-xl p-5 shadow-lg transition-transform hover:scale-105`}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-bold text-white">{plano.nome}</h3>
              {plano.nome === 'Pro' && <Crown size={20} className="text-purple-300" />}
              {plano.nome === 'Premium' && <Crown size={20} className="text-yellow-300" />}
            </div>
            <p className="text-2xl font-bold text-white mb-4">{plano.preco}</p>
            <ul className="space-y-2 text-sm text-white/90">
              {plano.recursos.map((recurso, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-white/70">✓</span> {recurso}
                </li>
              ))}
              <li className="flex items-start gap-2">
                <span className="text-white/70">📊</span> Limite de vendas: {plano.limiteVendas}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-white/70">👥</span> Limite de clientes: {plano.limiteClientes}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-white/70">📈</span> Limite de receitas: {plano.limiteReceitas}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-white/70">📑</span> Relatórios avançados: {plano.relatoriosAvancados ? '✔️ Sim' : '❌ Não'}
              </li>
            </ul>
            <button className="mt-6 w-full bg-white/20 hover:bg-white/30 text-white font-semibold py-2 rounded-lg transition">
              Escolher {plano.nome}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}