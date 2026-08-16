import React from 'react';

const planos = [
  {
    nome: 'Free',
    preco: 'R$ 0',
    periodo: '/mês',
    destaque: false,
    recursos: [
      '3 clientes',
      '5 produtos',
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
      'Tudo do Basic',
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
      'Tudo do Pro',
      'Consultoria personalizada',
      'API de integração',
      'Gerente de conta',
    ],
  },
];

const PlanosDisplay: React.FC<{ onSelect?: (plano: string) => void }> = ({
  onSelect,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {planos.map((plano) => (
        <div
          key={plano.nome}
          className={`border rounded-lg p-4 ${
            plano.destaque
              ? 'border-blue-500 shadow-lg'
              : 'border-gray-200'
          }`}
        >
          <h3 className="text-lg font-bold">{plano.nome}</h3>
          <p className="text-2xl font-bold my-2">
            {plano.preco}
            <span className="text-sm font-normal">{plano.periodo}</span>
          </p>
          <ul className="text-sm space-y-1">
            {plano.recursos.map((recurso) => (
              <li key={recurso}>✓ {recurso}</li>
            ))}
          </ul>
          {onSelect && (
            <button
              className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
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