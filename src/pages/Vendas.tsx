import { useState, useEffect } from 'react';
import api from '../api';
import { ShoppingBag, Trash2, Calendar, DollarSign, Plus, RefreshCw } from 'lucide-react';

interface Venda {
  id: string;
  produto: string;
  quantidade: number;
  precoUnitario: number;
  valorTotal: number;
  canalVenda: string;
  dataVenda: string;
}

interface Receita {
  id: string;
  nome: string;
}

export default function Vendas() {
  const hoje = new Date().toISOString().split('T')[0];

  const [vendas, setVendas] = useState<Venda[]>([]);
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [loading, setLoading] = useState(false);

  const [produto, setProduto] = useState('');
  const [quantidade, setQuantidade] = useState(1);
  const [precoUnitario, setPrecoUnitario] = useState('');
  const [canalVenda, setCanalVenda] = useState('Balcão');
  const [dataVenda, setDataVenda] = useState(hoje);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const [vendasRes, receitasRes] = await Promise.all([
        api.get('/vendas'),
        api.get('/receitas')
      ]);
      setVendas(vendasRes.data);
      setReceitas(receitasRes.data);
    } catch (error) {
      console.error("Erro ao carregar dados de vendas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const handleCriarVenda = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!produto) return alert("Selecione um produto.");

    const pUnitario = parseFloat(precoUnitario) || 0;
    const vTotal = pUnitario * quantidade;

    try {
      await api.post('/vendas', {
        produto,
        quantidade,
        precoUnitario: pUnitario,
        valorTotal: vTotal,
        canalVenda,
        dataVenda: new Date(dataVenda).toISOString()
      });

      setProduto('');
      setQuantidade(1);
      setPrecoUnitario('');
      setCanalVenda('Balcão');
      setDataVenda(hoje);
      carregarDados();
    } catch (error) {
      console.error("Erro ao salvar venda:", error);
    }
  };

  const handleRemoverVenda = async (id: string) => {
    if (!confirm("Tem certeza que deseja remover esta venda?")) return;
    try {
      await api.delete(`/vendas/${id}`);
      carregarDados();
    } catch (error) {
      console.error("Erro ao remover venda:", error);
    }
  };

  return (
    <div className="space-y-6 text-slate-200">
      <div className="flex items-center justify-between bg-[#0f172a] p-4 rounded-lg border border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">Registro de Vendas</h1>
          <p className="text-xs text-slate-400">Insira os fluxos de entrada e gerencie o faturamento comercial.</p>
        </div>
        <button onClick={carregarDados} className="p-2 text-slate-400 hover:text-white rounded bg-[#020617] border border-slate-700">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-[#0f172a] p-5 rounded-lg border border-slate-800 h-fit space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <ShoppingBag className="h-4 w-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">🛒 Nova Venda</h2>
          </div>

          <form onSubmit={handleCriarVenda} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="text-[11px] uppercase tracking-wide text-slate-400 font-medium">Produto / Item</label>
              <select
                value={produto}
                onChange={(e) => setProduto(e.target.value)}
                className="w-full bg-[#020617] border border-slate-700 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500 h-9"
                required
              >
                <option value="">-- Selecione o Produto --</option>
                {receitas.map((rec) => (
                  <option key={rec.id} value={rec.nome}>
                    {rec.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] uppercase tracking-wide text-slate-400 font-medium">Quantidade</label>
                <input
                  type="number"
                  min="1"
                  value={quantidade}
                  onChange={(e) => setQuantidade(parseInt(e.target.value) || 1)}
                  className="w-full bg-[#020617] border border-slate-700 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] uppercase tracking-wide text-slate-400 font-medium">Preço Unitário (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={precoUnitario}
                  onChange={(e) => setPrecoUnitario(e.target.value)}
                  className="w-full bg-[#020617] border border-slate-700 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] uppercase tracking-wide text-slate-400 font-medium">Canal de Venda</label>
                <select
                  value={canalVenda}
                  onChange={(e) => setCanalVenda(e.target.value)}
                  className="w-full bg-[#020617] border border-slate-700 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500 h-9"
                >
                  <option value="Balcão">Balcão</option>
                  <option value="Encomenda">Encomenda</option>
                  <option value="Instagram">Instagram</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="iFood">iFood</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] uppercase tracking-wide text-slate-400 font-medium">Data da Venda</label>
                <input
                  type="date"
                  value={dataVenda}
                  onChange={(e) => setDataVenda(e.target.value)}
                  className="w-full bg-[#020617] border border-slate-700 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500 h-9"
                  required
                />
              </div>
            </div>

            <div className="bg-[#020617] p-2.5 rounded border border-slate-800 flex justify-between items-center text-[11px]">
              <span className="text-slate-400 uppercase font-medium tracking-wide">Valor Total Estimado:</span>
              <span className="text-emerald-400 font-bold text-sm">
                R$ {((parseFloat(precoUnitario) || 0) * quantidade).toFixed(2)}
              </span>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded flex items-center justify-center gap-1 transition"
            >
              <Plus className="h-4 w-4" /> Registrar Venda
            </button>
          </form>
        </div>

        <div className="bg-[#0f172a] p-5 rounded-lg border border-slate-800 lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <DollarSign className="h-4 w-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Histórico de Movimentações</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase tracking-wider">
                  <th className="py-2.5">Data</th>
                  <th className="py-2.5">Produto</th>
                  <th className="py-2.5">Qtd</th>
                  <th className="py-2.5">Unidade</th>
                  <th className="py-2.5">Total</th>
                  <th className="py-2.5">Canal</th>
                  <th className="py-2.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {vendas.length > 0 ? (
                  vendas.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-2.5 whitespace-nowrap flex items-center gap-1 text-slate-400">
                        <Calendar className="h-3 w-3 text-slate-500" />
                        {new Date(v.dataVenda).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}
                      </td>
                      <td className="py-2.5 font-medium text-white">{v.produto}</td>
                      <td className="py-2.5">{v.quantidade}</td>
                      <td className="py-2.5">R$ {Number(v.precoUnitario).toFixed(2)}</td>
                      <td className="py-2.5 text-emerald-400 font-semibold">R$ {Number(v.valorTotal).toFixed(2)}</td>
                      <td className="py-2.5">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-800 border border-slate-700 text-slate-300">
                          {v.canalVenda}
                        </span>
                      </td>
                      <td className="py-2.5 text-right">
                        <button
                          onClick={() => handleRemoverVenda(v.id)}
                          className="p-1 text-slate-500 hover:text-red-400 rounded hover:bg-red-500/10 transition"
                          title="Remover Venda"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-slate-500 italic">
                      Nenhuma venda registrada no sistema.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}