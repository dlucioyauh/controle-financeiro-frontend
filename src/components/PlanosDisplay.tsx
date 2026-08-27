import React from 'react';
import { Check, Star } from 'lucide-react';

const planos = [
  {
    nome: 'Free',
    preco: 'R$ 0',
    periodo: '/mês',
    destaque: false,
    recursos: [
      '5 clientes', // ✅ ALTERADO PARA 5 PARA COMBINAR COM O BACKEND
      'Até 5 produtos',
      '1 usuário',
      'Relatórios básicos',
    ],
  },
  {
    nome: 'Basic',
    preco: 'R$ 49,90',
    periodo: '/mês',
    destaque: false,
    recursos: [
      'Clientes ilimitados',
      'Produtos ilimitados',
      'Relatórios financeiros',
      'Suporte por e-mail',
    ],
  },
  {
    nome: 'Pro',
    preco: 'R$ 99,90',
    periodo: '/mês',
    destaque: true,
    recursos: [
      'Tudo do plano Basic',
      'WhatsApp integrado',
      'Relatórios avançados',
      'Suporte prioritário',
    ],
  },
  {
    nome: 'Premium',
    preco: 'R$ 199,90',
    periodo: '/mês',
    destaque: false,
    recursos: [
      'Tudo do plano Pro',
      'Setup/Consultoria inicial (1h)',
      'API de integração',
      'Gerente de conta dedicado',
    ],
  },
];

const PlanosDisplay: React.FC<{ onSelect?: (plano: string) => void }> = ({
  onSelect,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {planos.map((plano) => (
        <div
          key={plano.nome}
          className={`relative flex flex-col rounded-xl p-6 transition-all duration-300 ${
            plano.destaque
              ? 'bg-[#0f172a] border-2 border-cyan-500 shadow-lg shadow-cyan-500/10 scale-105 z-10'
              : 'bg-[#0f172a] border border-slate-800 hover:border-slate-700'
          }`}
        >
          {plano.destaque && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-cyan-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
              <Star size={12} fill="white" />
              MAIS POPULAR
            </div>
          )}

          <div className="mb-4">
            <h3 className="text-lg font-bold text-white">{plano.nome}</h3>
            <div className="flex items-baseline mt-2">
              <span className="text-3xl font-extrabold text-white">{plano.preco}</span>
              <span className="text-sm text-slate-400 ml-1">{plano.periodo}</span>
            </div>
          </div>

          <ul className="flex-1 space-y-3 mb-6">
            {plano.recursos.map((recurso, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-slate-300">
                <Check className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                <span>{recurso}</span>
              </li>
            ))}
          </ul>

          {onSelect && (
            <button
              className={`w-full py-2.5 rounded-lg font-semibold transition-all duration-200 ${
                plano.destaque
                  ? 'bg-cyan-600 text-white hover:bg-cyan-500 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
              }`}
              onClick={() => onSelect(plano.nome.toLowerCase())}
            >
              Escolher {plano.nome}
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default PlanosDisplay;