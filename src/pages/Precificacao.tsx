import { useState } from 'react';
import { ChefHat, Package } from 'lucide-react';
import Ingredientes from '../components/Ingredientes';
import Receitas from '../components/Receitas';

const abas = [
  { id: 'ingredientes', label: 'Ingredientes', icon: Package },
  { id: 'receitas', label: 'Receitas', icon: ChefHat },
];

export default function Precificacao() {
  const [aba, setAba] = useState('ingredientes');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Precificação</h2>
        <p className="text-gray-400 text-sm mt-1">Gerencie ingredientes e calcule o custo das suas receitas</p>
      </div>

      {/* Abas */}
      <div className="flex gap-2 bg-gray-900 p-1 rounded-xl border border-gray-800 w-fit">
        {abas.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setAba(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              aba === id
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {/* Conteúdo */}
      {aba === 'ingredientes' && <Ingredientes />}
      {aba === 'receitas' && <Receitas />}
    </div>
  );
}