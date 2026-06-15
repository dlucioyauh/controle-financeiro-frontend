import { useState } from 'react';
import api from '../api';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';

export default function RelatoriosAvancados() {
  const [filtros, setFiltros] = useState({
    dataInicio: '',
    dataFim: '',
    tipo: 'ambos',
    produto: '',
  });
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleBuscar = async () => {
    setLoading(true);
    try {
      const response = await api.get('/relatorios-avancados/resumo', { params: filtros });
      setData(response.data);
    } catch (error) {
      console.error('Erro ao carregar relatório:', error);
      alert('Erro ao carregar dados. Verifique se a flag "novo_relatorio" está ativa.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-10">Carregando...</div>;

  return (
    <div className="space-y-6 text-slate-200">
      <div className="bg-[#0f172a] p-4 rounded-lg border border-slate-800">
        <h1 className="text-xl font-bold text-white">Relatórios Avançados</h1>
        <p className="text-xs text-slate-400">Filtros personalizados, gráficos e exportação</p>
      </div>

      {/* Filtros */}
      <div className="bg-[#0f172a] p-4 rounded-lg border border-slate-800 grid grid-cols-1 md:grid-cols-4 gap-4">
        <input type="date" value={filtros.dataInicio} onChange={e => setFiltros({ ...filtros, dataInicio: e.target.value })} className="bg-[#020617] border border-slate-700 rounded p-2 text-sm" />
        <input type="date" value={filtros.dataFim} onChange={e => setFiltros({ ...filtros, dataFim: e.target.value })} className="bg-[#020617] border border-slate-700 rounded p-2 text-sm" />
        <select value={filtros.tipo} onChange={e => setFiltros({ ...filtros, tipo: e.target.value as any })} className="bg-[#020617] border border-slate-700 rounded p-2 text-sm">
          <option value="ambos">Vendas + Despesas</option>
          <option value="venda">Apenas Vendas</option>
          <option value="despesa">Apenas Despesas</option>
        </select>
        <input type="text" placeholder="Produto (opcional)" value={filtros.produto} onChange={e => setFiltros({ ...filtros, produto: e.target.value })} className="bg-[#020617] border border-slate-700 rounded p-2 text-sm" />
        <button onClick={handleBuscar} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">Buscar</button>
      </div>

      {data && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#0f172a] p-4 rounded-lg border border-slate-800">
              <p className="text-xs uppercase text-slate-400">Total Vendas</p>
              <p className="text-2xl font-bold text-emerald-400">R$ {data.totalVendas?.toFixed(2)}</p>
            </div>
            <div className="bg-[#0f172a] p-4 rounded-lg border border-slate-800">
              <p className="text-xs uppercase text-slate-400">Total Despesas</p>
              <p className="text-2xl font-bold text-red-400">R$ {data.totalDespesas?.toFixed(2)}</p>
            </div>
            <div className="bg-[#0f172a] p-4 rounded-lg border border-slate-800">
              <p className="text-xs uppercase text-slate-400">Lucro</p>
              <p className="text-2xl font-bold text-cyan-400">R$ {data.lucro?.toFixed(2)}</p>
            </div>
            <div className="bg-[#0f172a] p-4 rounded-lg border border-slate-800">
              <p className="text-xs uppercase text-slate-400">Ticket Médio</p>
              <p className="text-2xl font-bold text-blue-400">R$ {data.ticketMedio?.toFixed(2)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-[#0f172a] p-4 rounded-lg border border-slate-800">
              <h3 className="text-sm font-bold mb-2">Evolução Diária (Vendas)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.evolucao || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="data" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} />
                  <Tooltip formatter={(v: any) => `R$ ${v}`} />
                  <Line type="monotone" dataKey="valor" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-[#0f172a] p-4 rounded-lg border border-slate-800">
              <h3 className="text-sm font-bold mb-2">Top 5 Produtos (Receita)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.topProdutos || []} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis type="number" />
                  <YAxis dataKey="nome" type="category" width={100} stroke="#64748b" fontSize={10} />
                  <Tooltip formatter={(v: any) => `R$ ${v}`} />
                  <Bar dataKey="receita" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-[#0f172a] p-4 rounded-lg border border-slate-800">
            <h3 className="text-sm font-bold mb-2">Últimas Transações</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs">
                <thead className="border-b border-slate-700">
                  <tr>
                    <th className="text-left py-2">Data</th>
                    <th className="text-left py-2">Tipo</th>
                    <th className="text-left py-2">Descrição/Produto</th>
                    <th className="text-right py-2">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {data.vendas?.slice(0, 5).map((v: any) => (
                    <tr key={v.id} className="border-b border-slate-800">
                      <td className="py-1">{new Date(v.dataVenda).toLocaleDateString('pt-BR')}</td>
                      <td className="py-1">Venda</td>
                      <td className="py-1">{v.produto} {v.cliente && `- ${v.cliente.nome}`}</td>
                      <td className="py-1 text-right text-emerald-400">R$ {Number(v.valorTotal).toFixed(2)}</td>
                    </tr>
                  ))}
                  {data.despesas?.slice(0, 5).map((d: any) => (
                    <tr key={d.id} className="border-b border-slate-800">
                      <td className="py-1">{new Date(d.data).toLocaleDateString('pt-BR')}</td>
                      <td className="py-1">Despesa</td>
                      <td className="py-1">{d.descricao} - {d.categoria}</td>
                      <td className="py-1 text-right text-red-400">R$ {Number(d.valor).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}