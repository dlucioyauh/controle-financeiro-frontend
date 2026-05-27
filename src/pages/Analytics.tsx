import { useState, useEffect } from 'react';
import api from '../api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { DollarSign, ShoppingBag, TrendingUp, RefreshCw, Users } from 'lucide-react';

interface AnalyticsData {
  totalReceita: number;
  totalVendas: number;
  ticketMedio: number;
  produtosMaisVendidos: Array<{ nome: string; quantidade: number; receita: number }>;
  canaisMap: Record<string, number>;
  vendasPorDia: Record<string, number>;
}

interface TopCliente {
  nome: string;
  pedidos: number;
  faturamento: number;
}

export default function Analytics() {
  const hoje = new Date().toISOString().split('T')[0];
  const trintaDiasAtras = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [dataInicio, setDataInicio] = useState(trintaDiasAtras);
  const [dataFim, setDataFim] = useState(hoje);
  const [loading, setLoading] = useState(false);
  const [dados, setDados] = useState<AnalyticsData | null>(null);
  const [topClientes, setTopClientes] = useState<TopCliente[]>([]);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const [statsRes, clientesRes] = await Promise.all([
        api.get('/vendas/estatisticas', { params: { dataInicio, dataFim } }),
        api.get('/vendas/estatisticas-clientes', { params: { dataInicio, dataFim } }),
      ]);
      setDados(statsRes.data);
      setTopClientes(clientesRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados do analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const dadosPizza = dados?.canaisMap
    ? Object.entries(dados.canaisMap).map(([name, value]) => ({ name, value }))
    : [];

  const dadosLinha = dados?.vendasPorDia
    ? Object.entries(dados.vendasPorDia).map(([data, valor]) => ({ data, valor }))
    : [];

  const produtosData = dados?.produtosMaisVendidos || [];

  const CORES_PIZZA = ['#06b6d4', '#3b82f6', '#10b981', '#f59e0b', '#ec4899'];

  return (
    <div className="space-y-6 text-slate-200">

      {/* Topo / Filtro de Data */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#0f172a] p-4 rounded-lg border border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">Analytics</h1>
          <p className="text-xs text-slate-400">Desempenho comercial e financeiro do seu negócio.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <div className="flex items-center gap-1 bg-[#020617] border border-slate-700 rounded px-2 py-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">De:</span>
            <input type="date" value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none" />
          </div>
          <div className="flex items-center gap-1 bg-[#020617] border border-slate-700 rounded px-2 py-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Até:</span>
            <input type="date" value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none" />
          </div>
          <button onClick={carregarDados} disabled={loading}
            className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded font-medium transition">
            <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Filtrando...' : 'Filtrar'}
          </button>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0f172a] p-4 rounded-lg border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-slate-400 font-medium">Faturamento Total</p>
            <h3 className="text-xl font-bold text-white mt-1">R$ {(dados?.totalReceita || 0).toFixed(2)}</h3>
          </div>
          <div className="p-2 bg-blue-600/10 rounded-lg text-blue-500">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>
        <div className="bg-[#0f172a] p-4 rounded-lg border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-slate-400 font-medium">Volume de Pedidos</p>
            <h3 className="text-xl font-bold text-white mt-1">{dados?.totalVendas || 0}</h3>
          </div>
          <div className="p-2 bg-cyan-600/10 rounded-lg text-cyan-400">
            <ShoppingBag className="h-5 w-5" />
          </div>
        </div>
        <div className="bg-[#0f172a] p-4 rounded-lg border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-slate-400 font-medium">Ticket Médio</p>
            <h3 className="text-xl font-bold text-white mt-1">R$ {(dados?.ticketMedio || 0).toFixed(2)}</h3>
          </div>
          <div className="p-2 bg-emerald-600/10 rounded-lg text-emerald-500">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Zona dos Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Gráfico de Linha */}
        <div className="bg-[#0f172a] p-4 rounded-lg border border-slate-800">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Evolução de Faturamento (Diário)</h4>
          <div className="h-64 text-xs flex items-center justify-center">
            {dadosLinha.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dadosLinha}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="data" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} />
                  <Line type="monotone" dataKey="valor" stroke="#3b82f6" name="Faturamento R$" strokeWidth={2} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-500">Sem dados de faturamento no período.</p>
            )}
          </div>
        </div>

        {/* Gráfico de Pizza */}
        <div className="bg-[#0f172a] p-4 rounded-lg border border-slate-800">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Participação por Canal de Venda</h4>
          <div className="h-64 text-xs flex items-center justify-center">
            {dadosPizza.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={dadosPizza} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={4} dataKey="value">
                    {dadosPizza.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CORES_PIZZA[index % CORES_PIZZA.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `R$ ${Number(value).toFixed(2)}`} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-500">Nenhuma venda registrada no período.</p>
            )}
          </div>
        </div>

        {/* Gráfico de Barras */}
        <div className="bg-[#0f172a] p-4 rounded-lg border border-slate-800 lg:col-span-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Top 10 Produtos Mais Vendidos (Quantidade)</h4>
          <div className="h-72 text-xs flex items-center justify-center">
            {produtosData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={produtosData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="nome" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} />
                  <Bar dataKey="quantidade" fill="#06b6d4" name="Unidades Vendidas" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-500">Nenhum produto vendido no período.</p>
            )}
          </div>
        </div>
      </div>

      {/* Top Clientes */}
      <div className="bg-[#0f172a] p-4 rounded-lg border border-slate-800">
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-4 w-4 text-cyan-400" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Top 10 Clientes por Faturamento</h4>
        </div>
        {topClientes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-slate-300">
              <thead className="text-[10px] text-slate-500 uppercase border-b border-slate-800">
                <tr>
                  <th className="py-2 px-3 text-left">#</th>
                  <th className="py-2 px-3 text-left">Cliente</th>
                  <th className="py-2 px-3 text-center">Pedidos</th>
                  <th className="py-2 px-3 text-right">Faturamento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {topClientes.map((cliente, index) => (
                  <tr key={index} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 px-3">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                        index === 1 ? 'bg-slate-400/20 text-slate-300' :
                        index === 2 ? 'bg-orange-500/20 text-orange-400' :
                        'bg-slate-800 text-slate-500'
                      }`}>
                        {index + 1}º
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-white">{cliente.nome || 'Cliente não identificado'}</td>
                    <td className="py-2.5 px-3 text-center text-slate-400">{cliente.pedidos}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-400">
                      R$ {Number(cliente.faturamento).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-slate-500 text-center py-6">Nenhum cliente identificado no período.</p>
        )}
      </div>

    </div>
  );
}