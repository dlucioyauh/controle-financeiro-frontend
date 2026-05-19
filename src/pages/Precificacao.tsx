import { ChefHat } from 'lucide-react';

export default function Precificacao() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Precificação</h2>
        <p className="text-gray-400 text-sm mt-1">Calcule o custo e preço de venda dos seus produtos</p>
      </div>

      <div className="bg-gray-900 rounded-2xl p-12 border border-gray-800 flex flex-col items-center justify-center text-center">
        <div className="bg-blue-500/20 rounded-2xl p-6 mb-4">
          <ChefHat size={48} className="text-blue-400" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Em breve!</h3>
        <p className="text-gray-400 max-w-sm">
          O módulo de precificação para sua confeitaria está sendo construído. Em breve você poderá cadastrar ingredientes, montar receitas e calcular margens de lucro.
        </p>
      </div>
    </div>
  );
}