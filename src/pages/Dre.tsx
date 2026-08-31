import { useState } from 'react';
import api from '../api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import {
  TrendingUp, TrendingDown, DollarSign, RefreshCw, FileText, Building2, User, Layers,
} from 'lucide-react';

interface DreData {
  periodo: { dataInicio: string; dataFim: string; ambito: string };
  receitaBruta: number;
  deducoes: number;
  cpv: number;
  lucroBruto: number;
  despesasOperacionais: number;
  lucroLiquido: number;
  margemBruta: number;
  margemLiquida: number;
  despesasPorCategoria: Record<string, number>;
  totalVendas: number;
  totalDespesas: number;
}

const formatarMoeda = (valor: number) =>
  valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function Dre() {
  const hoje = new Date().toISOString().split('T')[0];
  const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString()
    .split('T')[0];

  const [dataInicio, setDataInicio] = useState(inicioMes);
  const [dataFim, setDataFim] = useState(hoje);
  const [ambito, setAmbito] = useState<'EMPRESA' | 'PESSOAL' | 'TODOS'>('EMPRESA');
  const [data, setData] = useState<DreData | null>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const buscarDre = async () => {
    setLoading(true);
    setErro(null);
    try {
      const params: any = { dataInicio, dataFim };
      if (ambito !== 'TODOS') params.ambito = ambito;

      const res = await api.get('/relatorios-avancados/dre', { params });
      setData(res.data);
    } catch (error: any) {
      setErro(error.response?.data?.message || 'Falha ao carregar o DRE.');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  // Dados para o gráfico de cascata
  const getCascataData = () => {
    if (!data) return [];
    return [
      { name: 'Receita Bruta', valor: data.receitaBruta, tipo: 'receita' },
      { name: 'Deduções', valor: -data.deducoes, tipo: 'deducao' },
      { name: 'CPV/CMV', valor: -data.cpv, tipo: 'custo' },
      { name: 'Lucro Bruto', valor: data.lucroBruto, tipo: 'lucro' },
      { name: 'Desp. Operacionais', valor: -data.despesasOperacionais, tipo: 'despesa' },
      { name: 'Lucro Líquido', valor: data.lucroLiquido, tipo: data.lucroLiquido >= 0 ? 'lucro' : 'prejuizo' },
    ];
  };

  const getCorCascata = (tipo: string) => {
    switch (tipo) {
      case 'receita': return '#10b981';
      case 'deducao': return '#f59e0b';
      case 'custo': return '#ef4444';
      case 'lucro': return '#06b6d4';
      case 'despesa': return '#f43f5e';
      case 'prejuizo': return '#dc2626';
      default: return '#64748b';
    }
  };

  return (
    <div className="space-y-6 text-slate-200">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#0f172a] p-4 rounded-lg border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/10 rounded-lg">
            <FileText className="h-5 w-5 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">DRE Automático</h1>
            <p className="text-xs text-slate-400">Demonstrativo do Resultado do Exercício</p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-[#0f172a] p-4 rounded-lg border border-slate-800 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-[11px] font-bold text-slate-400 mb-1 uppercase tracking-wide">Data Início</label>
          <input
            type="date"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
            className="w-full bg-[#020617] border border-slate-700 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-slate-400 mb-1 uppercase tracking-wide">Data Fim</label>
          <input
            type="date"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
            className="w-full bg-[#020617] border border-slate-700 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-slate-400 mb-1 uppercase tracking-wide">Âmbito</label>
          <div className="flex gap-1">
            {(['EMPRESA', 'PESSOAL', 'TODOS'] as const).map((a) => (
              <button
                key={a}
                onClick={() => setAmbito(a)}
                className={`flex-1 flex items-center justify-center gap-1 px-2 py-2 rounded text-[11px] font-bold transition-all ${
                  ambito === a
                    ? a === 'EMPRESA'
                      ? 'bg-cyan-500/20 border border-cyan-500 text-cyan-400'
                      : a === 'PESSOAL'
                      ? 'bg-purple-500/20 border border-purple-500 text-purple-400'
                      : 'bg-blue-500/20 border border-blue-500 text-blue-400'
                    : 'bg-[#020617] border border-slate-700 text-slate-500 hover:text-slate-300'
                }`}
              >
                {a === 'EMPRESA' ? <Building2 size={12} /> : a === 'PESSOAL' ? <User size={12} /> : <Layers size={12} />}
                {a === 'TODOS' ? 'Geral' : a}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-end">
          <button
            onClick={buscarDre}
            disabled={loading}
            className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-sm font-semibold py-2 rounded flex items-center justify-center gap-2 transition-colors"
          >
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <TrendingUp className="h-4 w-4" />}
            {loading ? 'Carregando...' : 'Gerar DRE'}
          </button>
        </div>
      </div>

      {/* Erro */}
      {erro && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-sm text-red-400">
          {erro}
        </div>
      )}

      {/* Resultados */}
      {data && (
        <>
          {/* Cards de Resumo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#0f172a] p-4 rounded-lg border border-slate-800">
              <p className="text-[11px] uppercase tracking-wide text-slate-400 font-medium">Receita Bruta</p>
              <p className="text-2xl font-bold text-emerald-400 mt-1">{formatarMoeda(data.receitaBruta)}</p>
              <p className="text-[10px] text-slate-500 mt-1">{data.totalVendas} vendas no período</p>
            </div>
            <div className="bg-[#0f172a] p-4 rounded-lg border border-slate-800">
              <p className="text-[11px] uppercase tracking-wide text-slate-400 font-medium">Lucro Bruto</p>
              <p className={`text-2xl font-bold mt-1 ${data.lucroBruto >= 0 ? 'text-cyan-400' : 'text-red-400'}`}>
                {formatarMoeda(data.lucroBruto)}
              </p>
              <p className="text-[10px] text-slate-500 mt-1">Margem: {data.margemBruta.toFixed(1)}%</p>
            </div>
            <div className="bg-[#0f172a] p-4 rounded-lg border border-slate-800">
              <p className="text-[11px] uppercase tracking-wide text-slate-400 font-medium">Desp. Operacionais</p>
              <p className="text-2xl font-bold text-red-400 mt-1">{formatarMoeda(data.despesasOperacionais)}</p>
              <p className="text-[10px] text-slate-500 mt-1">{data.totalDespesas} despesas no período</p>
            </div>
            <div className="bg-[#0f172a] p-4 rounded-lg border border-slate-800">
              <p className="text-[11px] uppercase tracking-wide text-slate-400 font-medium">Lucro Líquido</p>
              <p className={`text-2xl font-bold mt-1 ${data.lucroLiquido >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {formatarMoeda(data.lucroLiquido)}
              </p>
              <p className="text-[10px] text-slate-500 mt-1">Margem: {data.margemLiquida.toFixed(1)}%</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tabela Escalonada Contábil */}
            <div className="bg-[#0f172a] p-5 rounded-lg border border-slate-800">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-cyan-400" />
                Tabela Escalonada (DRE)
              </h3>
              <p className="text-[10px] text-slate-500 mb-3">
                Período: {data.periodo.dataInicio} a {data.periodo.dataFim} | {data.periodo.ambito}
              </p>

              <div className="space-y-1 text-sm">
                {/* Receita Bruta */}
                <div className="flex justify-between items-center py-2 border-b border-slate-800">
                  <span className="font-bold text-emerald-400">Receita Bruta</span>
                  <span className="font-bold text-emerald-400">{formatarMoeda(data.receitaBruta)}</span>
                </div>

                {/* Deduções */}
                <div className="flex justify-between items-center py-1.5 pl-4">
                  <span className="text-slate-400">(-) Deduções</span>
                  <span className="text-yellow-400">{formatarMoeda(data.deducoes)}</span>
                </div>

                {/* CPV */}
                <div className="flex justify-between items-center py-1.5 pl-4">
                  <span className="text-slate-400">(-) CPV / CMV</span>
                  <span className="text-red-400">{formatarMoeda(data.cpv)}</span>
                </div>

                {/* Lucro Bruto */}
                <div className={`flex justify-between items-center py-2 border-y border-slate-700 ${data.lucroBruto >= 0 ? 'bg-cyan-500/5' : 'bg-red-500/5'}`}>
                  <span className={`font-bold ${data.lucroBruto >= 0 ? 'text-cyan-400' : 'text-red-400'}`}>
                    Lucro Bruto
                  </span>
                  <span className={`font-bold ${data.lucroBruto >= 0 ? 'text-cyan-400' : 'text-red-400'}`}>
                    {formatarMoeda(data.lucroBruto)}
                  </span>
                </div>

                {/* Despesas Operacionais */}
                <div className="flex justify-between items-center py-1.5 pl-4">
                  <span className="text-slate-400">(-) Despesas Operacionais</span>
                  <span className="text-red-400">{formatarMoeda(data.despesasOperacionais)}</span>
                </div>

                {/* Lucro Líquido */}
                <div className={`flex justify-between items-center py-3 border-t-2 border-slate-600 mt-2 ${data.lucroLiquido >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10'} rounded px-2`}>
                  <span className={`font-bold text-base ${data.lucroLiquido >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {data.lucroLiquido >= 0 ? '✓' : '✗'} Lucro Líquido
                  </span>
                  <span className={`font-bold text-base ${data.lucroLiquido >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {formatarMoeda(data.lucroLiquido)}
                  </span>
                </div>
              </div>
            </div>

            {/* Gráfico de Cascata */}
            <div className="bg-[#0f172a] p-5 rounded-lg border border-slate-800">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-cyan-400" />
                Formação do Lucro (Cascata)
              </h3>

              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getCascataData()} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis
                      dataKey="name"
                      stroke="#64748b"
                      fontSize={9}
                      angle={-25}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis
                      stroke="#64748b"
                      fontSize={10}
                      tickFormatter={(v: number) => `R$${(v / 1000).toFixed(1)}k`}
                    />
                    <Tooltip
                      /* ✅ CORREÇÃO: Tipagem 'any' para evitar conflito com ValueType do recharts */
                      formatter={(value: any) => formatarMoeda(Number(value))}
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        color: '#f8fafc',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="valor" radius={[4, 4, 0, 0]}>
                      {getCascataData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getCorCascata(entry.tipo)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Despesas por Categoria */}
          {Object.keys(data.despesasPorCategoria).length > 0 && (
            <div className="bg-[#0f172a] p-5 rounded-lg border border-slate-800">
              <h3 className="text-sm font-bold text-white mb-4">Despesas por Categoria</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(data.despesasPorCategoria)
                  .sort(([, a], [, b]) => b - a)
                  .map(([cat, val]) => (
                    <div key={cat} className="flex justify-between items-center bg-[#020617] rounded px-3 py-2 border border-slate-800">
                      <span className="text-xs text-slate-300 capitalize">{cat}</span>
                      <span className="text-xs font-bold text-red-400">{formatarMoeda(val)}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Estado vazio */}
      {!data && !loading && !erro && (
        <div className="bg-[#0f172a] p-10 rounded-lg border border-slate-800 text-center">
          <FileText className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-400">Nenhum DRE gerado</h3>
          <p className="text-sm text-slate-500 mt-2">
            Selecione o período e o âmbito acima e clique em "Gerar DRE" para visualizar o demonstrativo.
          </p>
        </div>
      )}
    </div>
  );
}