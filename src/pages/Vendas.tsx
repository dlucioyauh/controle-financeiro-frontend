import React, { useState, useEffect } from 'react';
import api from '../api';

interface Venda {
  id?: string;
  produto: string;
  quantidade: number;
  precoUnitario: number;
  valorTotal: number;
  canalVenda: string;
  contextoData: string;
  dataVenda?: string;
}

export default function Vendas() {
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [loading, setLoading] = useState(true);

  const [produto, setProduto] = useState('');
  const [quantidade, setQuantidade] = useState(1);
  const [precoUnitario, setPrecoUnitario] = useState(0);
  const [canalVenda, setCanalVenda] = useState('Balcão');
  const [contextoData, setContextoData] = useState('Regular');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchVendas();
  }, []);

  const fetchVendas = async () => {
    try {
      const response = await api.get('/vendas');
      setVendas(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao buscar vendas:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!produto || quantidade <= 0 || precoUnitario <= 0) {
      alert('Por favor, preencha todos os campos corretamente.');
      return;
    }

    setIsSubmitting(true);
    const valorTotal = quantidade * precoUnitario;

    const novaVenda: Venda = {
      produto,
      quantidade,
      precoUnitario,
      valorTotal,
      canalVenda,
      contextoData,
    };

    try {
      await api.post('/vendas', novaVenda);
      setProduto('');
      setQuantidade(1);
      setPrecoUnitario(0);
      setCanalVenda('Balcão');
      setContextoData('Regular');
      fetchVendas();
    } catch (error) {
      console.error('Erro ao salvar venda:', error);
      alert('Erro ao registrar a venda.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = "bg-gray-800 border border-gray-700 text-white placeholder-gray-500 p-3 rounded-xl w-full focus:outline-none focus:border-blue-500 transition-colors text-xs";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Registro de Vendas</h2>
        <p className="text-gray-400 text-sm mt-1">Insira os fluxos de entrada e gerencie o faturamento comercial.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Formulário de Cadastro */}
        <div className="lg:col-span-1 bg-gray-900 p-6 rounded-2xl border border-gray-800 h-fit">
          <h3 className="text-lg font-semibold text-white mb-4">🛒 Nova Venda</h3>
          
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-medium text-gray-400 uppercase mb-1 tracking-wide">Produto / Item</label>
              <input
                type="text"
                placeholder="Ex: Ovo Trufado, Brownie"
                value={produto}
                onChange={(e) => setProduto(e.target.value)}
                className={inputClass}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-gray-400 uppercase mb-1 tracking-wide">Qtd</label>
                <input
                  type="number"
                  min="1"
                  value={quantidade}
                  onChange={(e) => setQuantidade(Math.max(1, parseInt(e.target.value) || 1))}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-400 uppercase mb-1 tracking-wide">Preço Unit. (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  value={precoUnitario || ''}
                  onChange={(e) => setPrecoUnitario(parseFloat(e.target.value) || 0)}
                  className={inputClass}
                  required
                />
              </div>
            </div>

            <div className="bg-gray-800 p-3 rounded-xl border border-gray-700 flex justify-between items-center">
              <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Total Geral:</span>
              <span className="text-emerald-400 font-bold text-sm">
                R$ {(quantidade * precoUnitario).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-gray-400 uppercase mb-1 tracking-wide">Canal de Venda</label>
              <select
                value={canalVenda}
                onChange={(e) => setCanalVenda(e.target.value)}
                className={inputClass}
              >
                <option value="Balcão">Balcão / Loja Física</option>
                <option value="WhatsApp">WhatsApp / Encomenda</option>
                <option value="iFood">iFood</option>
                <option value="Parceiros">Parceiros / Cafés</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-gray-400 uppercase mb-1 tracking-wide">Sazonalidade</label>
              <select
                value={contextoData}
                onChange={(e) => setContextoData(e.target.value)}
                className={inputClass}
              >
                <option value="Regular">Dias Comuns</option>
                <option value="Páscoa">Campanha de Páscoa</option>
                <option value="Natal">Campanha de Natal</option>
                <option value="Dia das Mães">Dia das Mães</option>
                <option value="Feriado">Feriados / Pontes</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium text-sm py-3 px-6 rounded-xl transition-colors mt-2"
            >
              {isSubmitting ? 'Registrando...' : 'Lançar no Caixa'}
            </button>
          </form>
        </div>

        {/* Histórico Recente de Lançamentos */}
        <div className="lg:col-span-2 bg-gray-900 p-6 rounded-2xl border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4">📋 Histórico de Movimentações</h3>
          
          {loading ? (
            <p className="text-gray-500 text-xs animate-pulse">Buscando fluxo de caixa...</p>
          ) : vendas.length === 0 ? (
            <p className="text-gray-500 text-xs text-center py-6">Nenhuma venda lançada no sistema ainda.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="text-[10px] text-gray-400 uppercase border-b border-gray-800 bg-gray-950/40">
                  <tr>
                    <th className="py-2.5 px-3">Produto</th>
                    <th className="py-2.5 px-3">Qtd</th>
                    <th className="py-2.5 px-3">Canal</th>
                    <th className="py-2.5 px-3">Contexto</th>
                    <th className="py-2.5 px-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/40">
                  {vendas.slice().reverse().map((v, i) => (
                    <tr key={v.id || i} className="hover:bg-gray-800/40 transition-colors">
                      <td className="py-2.5 px-3 font-medium text-white truncate max-w-[120px]">{v.produto}</td>
                      <td className="py-2.5 px-3 text-gray-400">{v.quantidade}x</td>
                      <td className="py-2.5 px-3">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 border border-gray-700">
                          {v.canalVenda}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                          v.contextoData !== 'Regular' 
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-800/30' 
                            : 'bg-gray-800 text-gray-500 border border-gray-700'
                        }`}>
                          {v.contextoData}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-emerald-400">
                        R$ {Number(v.valorTotal).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}