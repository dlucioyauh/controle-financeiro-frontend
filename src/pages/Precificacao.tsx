import { useState, useEffect } from 'react';
import api from '../api';
import Tooltip from '../components/Tooltip';
import { useUnitConverter } from '../hooks/useUnitConverter';
import { ChefHat, Plus, Pencil, Trash2, HelpCircle } from 'lucide-react';

interface Receita {
  id: string;
  nome: string;
  descricao?: string;
  rendimento: number;
  unidadeRendimento?: string;
  maoDeObra: number;
  custosFixosPorcentagem: number;
  custoIngredientes: number;
  precoVendaFinal: number;
  ingredientes?: any[];
}

export default function Precificacao() {
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [loading, setLoading] = useState(true);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  
  // Estados do formulário
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const { rawValue: rendimentoRaw, normalizedValue: rendimento, handleChange: handleRendimentoChange } = useUnitConverter('');
  const [unidadeRendimento, setUnidadeRendimento] = useState('un');
  const { rawValue: maoDeObraRaw, normalizedValue: maoDeObra, handleChange: handleMaoDeObraChange } = useUnitConverter('0');
  const [custosFixosPorcentagem, setCustosFixosPorcentagem] = useState('10');

  useEffect(() => {
    carregarReceitas();
  }, []);

  async function carregarReceitas() {
    try {
      const r = await api.get('/receitas');
      setReceitas(r.data);
    } catch (error) {
      console.error('Erro ao carregar receitas:', error);
    } finally {
      setLoading(false);
    }
  }

  async function salvarReceita() {
    if (!nome || !rendimento) {
      alert('Preencha nome e rendimento!');
      return;
    }

    const payload = {
      nome,
      descricao,
      rendimento,
      unidadeRendimento,
      maoDeObra,
      custosFixosPorcentagem: parseFloat(custosFixosPorcentagem) || 10,
    };

    try {
      if (editandoId) {
        await api.patch(`/receitas/${editandoId}`, payload);
      } else {
        await api.post('/receitas', payload);
      }
      
      // Limpar formulário
      setNome('');
      setDescricao('');
      handleRendimentoChange('');
      setUnidadeRendimento('un');
      handleMaoDeObraChange('0');
      setCustosFixosPorcentagem('10');
      setEditandoId(null);
      
      await carregarReceitas();
    } catch (error) {
      alert('Erro ao salvar receita');
    }
  }

  function editarReceita(receita: Receita) {
    setEditandoId(receita.id);
    setNome(receita.nome);
    setDescricao(receita.descricao || '');
    handleRendimentoChange(receita.rendimento.toString());
    setUnidadeRendimento(receita.unidadeRendimento || 'un');
    handleMaoDeObraChange(receita.maoDeObra.toString());
    setCustosFixosPorcentagem(receita.custosFixosPorcentagem.toString());
  }

  async function deletarReceita(id: string) {
    if (!confirm('Tem certeza que deseja excluir esta receita?')) return;
    
    try {
      await api.delete(`/receitas/${id}`);
      await carregarReceitas();
    } catch (error) {
      alert('Erro ao excluir receita');
    }
  }

  if (loading) {
    return <div className="text-center p-8 text-gray-400">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ChefHat className="text-cyan-400" />
            Precificação de Receitas
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Calcule o custo e preço de venda das suas receitas
          </p>
        </div>
      </div>

      {/* Formulário */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-lg font-semibold text-white mb-4">
          {editandoId ? '️ Editar Receita' : ' Nova Receita'}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nome */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Nome da Receita
              <Tooltip 
                text="Nome identificador da receita"
                example="Bolo de Chocolate, Brigadeiro Gourmet"
              />
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Bolo de Chocolate"
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Rendimento */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Rendimento
              <Tooltip 
                text="Quantidade que esta receita produz. Aceita: 20un, 1kg, 500g"
                example="20un (rende 20 unidades), 1kg (rende 1 quilo)"
              />
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={rendimentoRaw}
                onChange={(e) => handleRendimentoChange(e.target.value)}
                placeholder="Ex: 20un, 1kg, 500g"
                className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              />
              <select
                value={unidadeRendimento}
                onChange={(e) => setUnidadeRendimento(e.target.value)}
                className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="un">unidades</option>
                <option value="kg">kg</option>
                <option value="L">litros</option>
                <option value="porção">porções</option>
              </select>
            </div>
            {rendimento > 0 && (
              <p className="text-xs text-cyan-400 mt-1">
                ✓ Convertido: {rendimento} {unidadeRendimento}
              </p>
            )}
          </div>

          {/* Mão de Obra */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Mão de Obra (R$)
              <Tooltip 
                text="Custo do tempo gasto para produzir. Calcule: horas trabalhadas × valor da sua hora"
                example="Se levou 2h e sua hora vale R$ 25, coloque 50"
              />
            </label>
            <input
              type="text"
              value={maoDeObraRaw}
              onChange={(e) => handleMaoDeObraChange(e.target.value)}
              placeholder="Ex: 50"
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Custos Fixos */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Custos Fixos (%)
              <Tooltip 
                text="Percentual para cobrir custos fixos (água, luz, aluguel, equipamentos). Recomendado: 10% a 20%"
                example="10 (para 10%)"
              />
            </label>
            <input
              type="number"
              value={custosFixosPorcentagem}
              onChange={(e) => setCustosFixosPorcentagem(e.target.value)}
              placeholder="10"
              min="0"
              max="100"
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={salvarReceita}
            className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Plus size={18} />
            {editandoId ? 'Atualizar' : 'Salvar Receita'}
          </button>
          {editandoId && (
            <button
              onClick={() => setEditandoId(null)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Cancelar
            </button>
          )}
        </div>
      </div>

      {/* Lista de Receitas */}
      {receitas.length === 0 ? (
        <div className="text-center p-12 bg-gray-800 rounded-lg border border-gray-700">
          <ChefHat size={64} className="mx-auto text-gray-600 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">
            Nenhuma receita cadastrada
          </h3>
          <p className="text-gray-400 text-sm mb-6">
            Comece cadastrando sua primeira receita para calcular custos e precificação
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {receitas.map((receita) => (
            <div key={receita.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-cyan-500 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-semibold text-white">{receita.nome}</h3>
                <div className="flex gap-1">
                  <button
                    onClick={() => editarReceita(receita)}
                    className="p-1 text-yellow-400 hover:bg-yellow-400/10 rounded"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => deletarReceita(receita.id)}
                    className="p-1 text-red-400 hover:bg-red-400/10 rounded"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <div className="space-y-1 text-sm">
                <p className="text-gray-400">
                  Rendimento: <span className="text-white">{receita.rendimento} {receita.unidadeRendimento}</span>
                </p>
                <p className="text-gray-400">
                  Custo Ingredientes: <span className="text-cyan-400">R$ {receita.custoIngredientes.toFixed(2)}</span>
                </p>
                <p className="text-gray-400">
                  Preço Venda: <span className="text-green-400">R$ {receita.precoVendaFinal.toFixed(2)}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}