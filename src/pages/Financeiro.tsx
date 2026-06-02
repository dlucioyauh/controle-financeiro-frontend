import { useState, useEffect } from 'react';
import {
  DollarSign, TrendingDown, TrendingUp, Loader2, Calendar, ArrowUpRight, ArrowDownRight,
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import api from '../api';
import Despesas from '../components/Despesas';

const CORES_GRAFICO = ['#06b6d4', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#f43f5e', '#14b8a6'];

export default function Financeiro() {
  const hoje = new Date().toISOString().split('T')[0];
  const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString()
    .split('T')[0];

  const [dataInicio, setDataInicio] = useState(inicioMes);
  const [dataFim, setDataFim] = useState(hoje);
  const [carregando, setCarregando] = useState(true);
  const [totais, setTotais] = useState({ receita: 0, despesas: 0, saldo: 0 });
  const [evolucaoSaldo, setEvolucaoSaldo] = useState<any[]>([]);
  const [despesasPorCategoria, setDespesasPorCategoria] = useState<any[]>([]);
  const [transacoes, setTransacoes] = useState<any[]>([]);
  const [plano, setPlano] = useState('free');
  const [modoExibicao, setModoExibicao] = useState<'empresa' | 'pessoal'>('empresa'); // ← novo estado

  useEffect(() => {
    api.get('/users/perfil')
      .then(res => setPlano(res.data.plano || 'free'))
      .catch(() => setPlano('free'));
  }, []);

  const carregarDados = async () => {
    setCarregando(true);
    try {
      const [vendasRes, despesasRes] = await Promise.all([
        api.get('/vendas/estatisticas', { params: { dataInicio, dataFim } }),
        api.get('/despesas'), // sempre carrega todas (empresariais) – para modo empresa
      ]);

      const vendasData = vendasRes.data;
      const receita = vendasData?.totalReceita || 0;

      // Despesas empresariais (padrão) ou pessoais (se modo = pessoal)
      const despesasFiltradas = (despesasRes.data || []).filter((d: any) => {
        if (!d.data) return false;
        const dataFormatada = d.data.slice(0, 10);
        const okData = dataFormatada >= dataInicio && dataFormatada <= dataFim;
        // Filtra pelo tipo atual
        if (modoExibicao === 'pessoal') return okData && d.pessoal === true;
        return okData && !d.pessoal; // empresa (ou false/null)
      });

      const totalDespesas = despesasFiltradas.reduce(
        (acc: number, d: any) => acc + Number(d.valor || 0),
        0,
      );
      const saldo = receita - totalDespesas;

      setTotais({ receita, despesas: totalDespesas, saldo });

      // Evolução do saldo
      const mapaDespesasDia: Record<string, number> = {};
      despesasFiltradas.forEach((d: any) => {
        const dia = d.data.slice(0, 10);
        mapaDespesasDia[dia] = (mapaDespesasDia[dia] || 0) + Number(d.valor || 0);
      });

      const vendasPorDia = vendasData?.vendasPorDia || {};
      const todasDatas = new Set([
        ...Object.keys(vendasPorDia),
        ...Object.keys(mapaDespesasDia),
      ]);

      const evo = Array.from(todasDatas)
        .sort()
        .map((dia) => ({
          dia: new Date(dia + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          receita: Number(vendasPorDia[dia] || 0),
          despesas: Number(mapaDespesasDia[dia] || 0),
          saldo: Number(vendasPorDia[dia] || 0) - Number(mapaDespesasDia[dia] || 0),
        }));

      setEvolucaoSaldo(evo);

      // Despesas por categoria
      const mapaCat: Record<string, number> = {};
      despesasFiltradas.forEach((d: any) => {
        const cat = d.categoria || 'Outros';
        mapaCat[cat] = (mapaCat[cat] || 0) + Number(d.valor || 0);
      });
      const pizzaData = Object.entries(mapaCat).map(([name, value]) => ({
        name,
        value: Math.round(value * 100) / 100,
      }));
      setDespesasPorCategoria(pizzaData);

      // Transações unificadas
      const vendasDetalhadasRes = await api.get('/vendas');
      const vendasDetalhadas = (vendasDetalhadasRes.data || [])
        .filter((v: any) => {
          if (!v.dataVenda) return false;
          const data = v.dataVenda.split('T')[0];
          return data >= dataInicio && data <= dataFim;
        })
        .map((v: any) => ({
          tipo: 'venda',
          data: v.dataVenda.split('T')[0],
          descricao: v.produto,
          valor: Number(v.valorTotal),
          canal: v.canalVenda,
        }));

      const despesasTrans = despesasFiltradas.map((d: any) => ({
        tipo: modoExibicao === 'pessoal' ? 'despesa-pessoal' : 'despesa',
        data: d.data.slice(0, 10),
        descricao: d.descricao || 'Sem descrição',
        valor: -Number(d.valor),
        categoria: d.categoria,
      }));

      const todasTransacoes = [...vendasDetalhadas, ...despesasTrans]
        .sort((a, b) => b.data.localeCompare(a.data))
        .slice(0, 15);

      setTransacoes(todasTransacoes);
    } catch (err) {
      console.error('Erro ao carregar financeiro:', err);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, [dataInicio, dataFim, modoExibicao]); // recarrega ao alternar modo

  const formatarMoeda = (valor: number) =>
    valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const categoriasOrdenadas = [...despesasPorCategoria]
    .sort((a, b) => b.value - a.value);

  return (
    <div className="space-y-6 text-slate-200 pb-10">
      {/* Cabeçalho + Filtro + Badge de modo */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#0f172a] p-4 rounded-lg border border-slate-800">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">Financeiro</h1>
            <p className="text-xs text-slate-400">Centro de Controle Financeiro</p>
          </div>
          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
            modoExibicao === 'pessoal'
              ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
              : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
          }`}>
            {modoExibicao === 'pessoal' ? '👤 Pessoal' : '🏢 Empresa'}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-[#020617] border border-slate-700 rounded px-2 py-1 text-xs">
            <Calendar size={12} className="text-slate-400" />
            <input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none" />
          </div>
          <span className="text-xs text-slate-500">até</span>
          <div className="flex items-center gap-1 bg-[#020617] border border-slate-700 rounded px-2 py-1 text-xs">
            <Calendar size={12} className="text-slate-400" />
            <input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none" />
          </div>
        </div>
      </div>

      {carregando ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={32} className="animate-spin text-cyan-400" />
        </div>
      ) : (
        <>
          {/* Cards de resumo */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#0f172a] p-5 rounded-lg border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-slate-400 font-medium">
                  {modoExibicao === 'pessoal' ? 'Receitas Gerais' : 'Receitas'}
                </p>
                <p className="text-2xl font-bold text-emerald-400 mt-1">{formatarMoeda(totais.receita)}</p>
              </div>
              <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400"><TrendingUp size={24} /></div>
            </div>
            <div className="bg-[#0f172a] p-5 rounded-lg border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-slate-400 font-medium">
                  {modoExibicao === 'pessoal' ? 'Despesas Pessoais' : 'Despesas'}
                </p>
                <p className="text-2xl font-bold text-red-400 mt-1">{formatarMoeda(totais.despesas)}</p>
              </div>
              <div className="p-3 bg-red-500/10 rounded-xl text-red-400"><TrendingDown size={24} /></div>
            </div>
            <div className="bg-[#0f172a] p-5 rounded-lg border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-slate-400 font-medium">
                  {modoExibicao === 'pessoal' ? 'Saldo Pessoal' : 'Saldo'}
                </p>
                <p className={`text-2xl font-bold mt-1 ${totais.saldo >= 0 ? 'text-cyan-400' : 'text-red-400'}`}>
                  {formatarMoeda(totais.saldo)}
                </p>
              </div>
              <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-400"><DollarSign size={24} /></div>
            </div>
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-[#0f172a] p-4 rounded-lg border border-slate-800">
              <h3 className="text-sm font-bold text-white mb-4">
                {modoExibicao === 'pessoal' ? 'Evolução do Saldo Pessoal' : 'Evolução do Saldo Diário'}
              </h3>
              <div className="h-72 flex items-center justify-center">
                {evolucaoSaldo.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={evolucaoSaldo}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="dia" stroke="#64748b" fontSize={10} />
                      <YAxis stroke="#64748b" fontSize={10} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
                        formatter={(value: any) => formatarMoeda(Number(value))} />
                      <Line type="monotone" dataKey="saldo" stroke={modoExibicao === 'pessoal' ? '#a855f7' : '#06b6d4'} strokeWidth={3} dot={{ r: 4 }} name="Saldo" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-xs text-slate-500">Sem movimentações no período.</p>
                )}
              </div>
            </div>
            <div className="bg-[#0f172a] p-4 rounded-lg border border-slate-800 flex flex-col">
              <h3 className="text-sm font-bold text-white mb-4">
                {modoExibicao === 'pessoal' ? 'Gastos Pessoais por Categoria' : 'Despesas por Categoria'}
              </h3>
              <div className="flex-1 flex items-center justify-center">
                {despesasPorCategoria.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={despesasPorCategoria} cx="50%" cy="50%" outerRadius={80} innerRadius={50} paddingAngle={3} dataKey="value">
                        {despesasPorCategoria.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={CORES_GRAFICO[index % CORES_GRAFICO.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any) => formatarMoeda(Number(value))}
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} />
                      <Legend wrapperStyle={{ fontSize: '10px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-xs text-slate-500">Nenhuma despesa no período.</p>
                )}
              </div>
            </div>
          </div>

          {/* Últimas movimentações + Gerenciador de despesas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#0f172a] p-4 rounded-lg border border-slate-800">
              <h3 className="text-sm font-bold text-white mb-4">Últimas Movimentações</h3>
              <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
                <table className="w-full text-xs text-slate-300">
                  <thead className="text-[10px] text-slate-500 uppercase border-b border-slate-800 sticky top-0 bg-[#0f172a]">
                    <tr>
                      <th className="py-2 px-2 text-left">Data</th>
                      <th className="py-2 px-2 text-left">Tipo</th>
                      <th className="py-2 px-2 text-left">Descrição</th>
                      <th className="py-2 px-2 text-right">Valor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    {transacoes.map((t, i) => (
                      <tr key={i} className="hover:bg-slate-800/20 transition-colors">
                        <td className="py-1.5 px-2 text-slate-400">
                          {new Date(t.data + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                        </td>
                        <td className="py-1.5 px-2">
                          {t.tipo === 'venda' ? (
                            <span className="inline-flex items-center gap-1 text-emerald-400">
                              <ArrowUpRight size={10} /> Venda
                            </span>
                          ) : t.tipo === 'despesa-pessoal' ? (
                            <span className="inline-flex items-center gap-1 text-purple-400">
                              <ArrowDownRight size={10} /> Desp. Pessoal
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-red-400">
                              <ArrowDownRight size={10} /> Desp
                            </span>
                          )}
                        </td>
                        <td className="py-1.5 px-2 text-white max-w-[120px] truncate">{t.descricao}</td>
                        <td className={`py-1.5 px-2 text-right font-bold ${t.valor >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {t.valor >= 0 ? '+' : ''}{formatarMoeda(Math.abs(t.valor))}
                        </td>
                      </tr>
                    ))}
                    {transacoes.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-slate-500">Nenhuma movimentação.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-[#0f172a] p-4 rounded-lg border border-slate-800">
                <h3 className="text-sm font-bold text-white mb-3">Distribuição de Gastos</h3>
                {categoriasOrdenadas.length > 0 ? (
                  <div className="space-y-2">
                    {categoriasOrdenadas.map((cat, index) => {
                      const maxVal = categoriasOrdenadas[0]?.value || 1;
                      const pct = ((cat.value / maxVal) * 100).toFixed(0);
                      return (
                        <div key={cat.name} className="flex items-center gap-2 text-xs">
                          <div className="w-20 text-slate-400 truncate">{cat.name}</div>
                          <div className="flex-1 bg-slate-800 rounded-full h-3 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${pct}%`,
                                backgroundColor: CORES_GRAFICO[index % CORES_GRAFICO.length],
                              }}
                            />
                          </div>
                          <div className="w-20 text-right text-slate-300 font-medium">
                            {formatarMoeda(cat.value)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 text-center py-4">Nenhum gasto no período.</p>
                )}
              </div>

              <div className="bg-[#0f172a] p-4 rounded-lg border border-slate-800">
                <h2 className="text-sm font-bold text-white mb-4">Adicionar / Gerenciar Despesas</h2>
                <Despesas onChange={carregarDados} plano={plano} modoAtivo={modoExibicao} onToggleModo={setModoExibicao} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}