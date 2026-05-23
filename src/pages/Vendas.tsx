import { useState, useEffect } from 'react';
import api from '../api';
import { ShoppingBag, Trash2, Calendar, DollarSign, Plus, RefreshCw, User } from 'lucide-react';

interface Venda {
  id: string;
  produto: string;
  quantidade: number;
  precoUnitario: number;
  valorTotal: number;
  canalVenda: string;
  dataVenda: string;
  clienteNome?: string;
}

interface Receita {
  id: string;
  nome: string;
}

interface Cliente {
  id: string;
  nome: string;
}

export default function Vendas() {
  const hoje = new Date().toISOString().split('T')[0];
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);
  const [produto, setProduto] = useState('');
  const [quantidade, setQuantidade] = useState(1);
  const [precoUnitario, setPrecoUnitario] = useState('');
  const [canalVenda, setCanalVenda] = useState('Balcão');
  const [dataVenda, setDataVenda] = useState(hoje);
  const [clienteId, setClienteId] = useState('');
  const [clienteNome, setClienteNome] = useState('');

  const carregarDados = async () => {
    setLoading(true);
    try {
      const [vendasRes, receitasRes, clientesRes] = await Promise.all([
        api.get('/vendas'),
        api.get('/receitas'),
        api.get('/clientes'),
      ]);
      setVendas(vendasRes.data);
      setReceitas(receitasRes.data);
      setClientes(clientesRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados de vendas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregarDados(); }, []);

  const handleCriarVenda = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!produto) return alert('Selecione um produto.');
    const pUnitario = parseFloat(precoUnitario) || 0;
    const vTotal = pUnitario * quantidade;
    try {
      await api.post('/vendas', {
        produto,
        quantidade,
        precoUnitario: pUnitario,
        valorTotal: vTotal,
        canalVenda,
        dataVenda: new Date(dataVenda).toISOString(),
        clienteId: clienteId || null,
        clienteNome: clienteNome || null,
      });
      setProduto('');
      setQuantidade(1);
      setPrecoUnitario('');
      setCanalVenda('Balcão');
      setDataVenda(hoje);
      setClienteId('');
      setClienteNome('');
      carregarDados();
    } catch (error) {
      console.error('Erro ao salvar venda:', error);
    }
  };

  const handleRemoverVenda = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover esta venda?')) return;
    try {
      await api.delete(`/vendas/${id}`);
      carregarDados();
    } catch (error) {
      console.error('Erro ao remover venda:', error);
    }
  };

  const selectStyle = {
    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2364748b' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
    backgroundPosition: 'right 0.75rem center',
    backgroundSize: '1.2em',
    backgroundRepeat: 'no-repeat',
  };

  return (
    <div className="space-y-6 text-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between bg-[#0f172a] p-4 rounded-lg border border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">Registro de Vendas</h1>
          <p className="text-xs text-slate-400">Insira os fluxos de entrada e gerencie o faturamento comercial.</p>
        </div>
        <button onClick={carregarDados} className="p-2 text-slate-400 hover:text-white rounded bg-[#1e293b] border border-slate-700 transition-colors">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulário */}
        <div className="bg-[#0f172a] p-5 rounded-lg border border-slate-800 h-fit space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <ShoppingBag className="h-4 w-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">🛒 Nova Venda</h2>
          </div>

          <form onSubmit={handleCriarVenda} className="space-y-4 text-xs">
            {/* Produto */}
            <div>
              <label className="block text-[11px] font-bold text-white mb-1.5 uppercase tracking-wide">Produto / Item</label>
              <select
                value={produto}
                onChange={e => setProduto(e.target.value)}
                className="w-full bg-[#1e293b]/40 border border-slate-800 rounded-lg px-3 py-2.5 text-slate-300 focus:outline-none focus:border-blue-500/50 h-10 transition-colors pr-8 appearance-none"
                style={selectStyle}
                required
              >
                <option value="" className="bg-[#0f172a]">-- Selecione o Produto --</option>
                {receitas.map(rec => (
                  <option key={rec.id} value={rec.nome} className="bg-[#0f172a]">{rec.nome}</option>
                ))}
              </select>
            </div>

            {/* Cliente */}
            <div>
              <label className="block text-[11px] font-bold text-white mb-1.5 uppercase tracking-wide">
                Cliente <span className="text-slate-500 normal-case font-normal">(opcional)</span>
              </label>
              <select
                value={clienteId}
                onChange={e => {
                  const id = e.target.value;
                  setClienteId(id);
                  const c = clientes.find(c => c.id === id);
                  setClienteNome(c ? c.nome : '');
                }}
                className="w-full bg-[#1e293b]/40 border border-slate-800 rounded-lg px-3 py-2.5 text-slate-300 focus:outline-none focus:border-blue-500/50 h-10 transition-colors pr-8 appearance-none"
                style={selectStyle}
              >
                <option value="" className="bg-[#0f172a]">-- Sem cliente --</option>
                {clientes.map(c => (
                  <option key={c.id} value={c.id} className="bg-[#0f172a]">{c.nome}</option>
                ))}
              </select>
            </div>

            {/* Quantidade e Preço */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-white mb-1.5 uppercase tracking-wide">Quantidade</label>
                <input
                  type="number" min="1" value={quantidade}
                  onChange={e => setQuantidade(parseInt(e.target.value) || 1)}
                  className="w-full bg-[#1e293b]/40 border border-slate-800 rounded-lg px-3 py-2.5 text-slate-300 focus:outline-none focus:border-blue-500/50 h-10"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-white mb-1.5 uppercase tracking-wide">Preço Unitário (R$)</label>
                <input
                  type="number" step="0.01" placeholder="0.00" value={precoUnitario}
                  onChange={e => setPrecoUnitario(e.target.value)}
                  className="w-full bg-[#1e293b]/40 border border-slate-800 rounded-lg px-3 py-2.5 text-slate-300 focus:outline-none focus:border-blue-500/50 h-10"
                  required
                />
              </div>
            </div>

            {/* Canal e Data */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-white mb-1.5 uppercase tracking-wide">Canal de Venda</label>
                <select
                  value={canalVenda}
                  onChange={e => setCanalVenda(e.target.value)}
                  className="w-full bg-[#1e293b]/40 border border-slate-800 rounded-lg px-3 py-2.5 text-slate-300 focus:outline-none focus:border-blue-500/50 h-10 transition-colors pr-8 appearance-none"
                  style={selectStyle}
                >
                  <option value="Balcão" className="bg-[#0f172a]">Balcão</option>
                  <option value="Encomenda" className="bg-[#0f172a]">Encomenda</option>
                  <option value="Instagram" className="bg-[#0f172a]">Instagram</option>
                  <option value="WhatsApp" className="bg-[#0f172a]">WhatsApp</option>
                  <option value="iFood" className="bg-[#0f172a]">iFood</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-white mb-1.5 uppercase tracking-wide">Data da Venda</label>
                <input
                  type="date" value={dataVenda}
                  onChange={e => setDataVenda(e.target.value)}
                  className="w-full bg-[#1e293b]/40 border border-slate-800 rounded-lg px-3 py-2.5 text-slate-300 focus:outline-none focus:border-blue-500/50 h-10"
                  required
                />
              </div>
            </div>

            {/* Total */}
            <div className="bg-[#020617]/50 p-3 rounded-lg border border-slate-850 flex justify-between items-center">
              <span className="text-slate-400 text-[10px] uppercase tracking-wider font-semibold">Valor Total Estimado:</span>
              <span className="text-emerald-400 font-bold text-base">
                R$ {((parseFloat(precoUnitario) || 0) * quantidade).toFixed(2)}
              </span>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" /> Registrar Venda
            </button>
          </form>
        </div>

        {/* Histórico */}
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
                  <th className="py-2.5">Cliente</th>
                  <th className="py-2.5">Qtd</th>
                  <th className="py-2.5">Unitário</th>
                  <th className="py-2.5">Total</th>
                  <th className="py-2.5">Canal</th>
                  <th className="py-2.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {vendas.length > 0 ? vendas.map(v => (
                  <tr key={v.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-2.5 whitespace-nowrap flex items-center gap-1 text-slate-400">
                      <Calendar className="h-3 w-3 text-slate-500" />
                      {new Date(v.dataVenda).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                    </td>
                    <td className="py-2.5 font-medium text-white">{v.produto}</td>
                    <td className="py-2.5">
                      {v.clienteNome ? (
                        <span className="flex items-center gap-1 text-cyan-400">
                          <User className="h-3 w-3" /> {v.clienteNome}
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
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
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={8} className="py-6 text-center text-slate-500 italic">
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