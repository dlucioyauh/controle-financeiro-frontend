import { useEffect, useState } from 'react';
import { Wallet, TrendingUp, TrendingDown, DollarSign, BarChart2, Calendar, Tag, Package } from 'lucide-react';
import api from '../api';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { CardSkeleton, ChartSkeleton, Skeleton } from '../components/Skeleton';
import { useFeatureFlag } from '../contexts/FeatureFlagsContext';
import EmptyState from '../components/EmptyState';

export default function Dashboard() {
  const dashboardPessoalEnabled = useFeatureFlag('dashboard_pessoal');

  const [vendas, setVendas] = useState<any[]>([]);
  const [despesasEmpresa, setDespesasEmpresa] = useState<any[]>([]);
  const [despesasPessoais, setDespesasPessoais] = useState<any[]>([]);
  const [receitasPessoais, setReceitasPessoais] = useState<any[]>([]);
  
  const [carregando, setCarregando] = useState(true);
  const [modo, setModo] = useState<'empresa' | 'pessoal'>('empresa');

  const hoje = new Date();
  const mesAtualStr = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;
  const [mesSelecionado, setMesSelecionado] = useState(mesAtualStr);

  useEffect(() => {
    carregarDados();
  }, [mesSelecionado]);

  async function carregarDados() {
    setCarregando(true);
    try {
      const [vendasRes, despesasEmpRes, despesasPessRes, receitasPessRes] = await Promise.all([
        api.get('/vendas'),
        api.get('/despesas?pessoal=false'), 
        api.get('/despesas?pessoal=true&tipo=despesa'),
        api.get('/despesas?pessoal=true&tipo=receita'),
      ]);
      setVendas(vendasRes.data);
      setDespesasEmpresa(despesasEmpRes.data);
      setDespesasPessoais(despesasPessRes.data);
      setReceitasPessoais(receitasPessRes.data);
    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);
    } finally {
      setCarregando(false);
    }
  }

  const [ano, mes] = mesSelecionado.split('-').map(Number);
  const inicioMesAtual = new Date(ano, mes - 1, 1);
  const fimMesAtual = new Date(ano, mes, 0);
  const inicioMesAnterior = new Date(ano, mes - 2, 1);
  const fimMesAnterior = new Date(ano, mes - 1, 0);

  const inicioMesAtualStr = inicioMesAtual.toISOString().split('T')[0];
  const fimMesAtualStr = fimMesAtual.toISOString().split('T')[0];
  const inicioMesAnteriorStr = inicioMesAnterior.toISOString().split('T')[0];
  const fimMesAnteriorStr = fimMesAnterior.toISOString().split('T')[0];

  const filtrarPorMes = (lista: any[], campoData: string) => {
    return lista.filter(item => {
      if (!item[campoData]) return false;
      const dataStr = item[campoData].split('T')[0];
      return dataStr >= inicioMesAtualStr && dataStr <= fimMesAtualStr;
    });
  };

  const filtrarPorMesAnterior = (lista: any[], campoData: string) => {
    return lista.filter(item => {
      if (!item[campoData]) return false;
      const dataStr = item[campoData].split('T')[0];
      return dataStr >= inicioMesAnteriorStr && dataStr <= fimMesAnteriorStr;
    });
  };

  const vendasMesAtual = filtrarPorMes(vendas, 'dataVenda');
  const vendasMesAnterior = filtrarPorMesAnterior(vendas, 'dataVenda');
  
  const receitasPessoaisMesAtual = filtrarPorMes(receitasPessoais, 'data');
  const receitasPessoaisMesAnterior = filtrarPorMesAnterior(receitasPessoais, 'data');

  const despesasFiltradas = modo === 'empresa' 
    ? filtrarPorMes(despesasEmpresa, 'data') 
    : filtrarPorMes(despesasPessoais, 'data');

  const totalEntradas = modo === 'empresa'
    ? vendasMesAtual.reduce((acc, v) => acc + Number(v.valorTotal || 0), 0)
    : receitasPessoaisMesAtual.reduce((acc, d) => acc + Number(d.valor), 0);

  const totalEntradasAnterior = modo === 'empresa'
    ? vendasMesAnterior.reduce((acc, v) => acc + Number(v.valorTotal || 0), 0)
    : receitasPessoaisMesAnterior.reduce((acc, d) => acc + Number(d.valor), 0);

  const variacaoEntradas = totalEntradasAnterior > 0
    ? ((totalEntradas - totalEntradasAnterior) / totalEntradasAnterior) * 100
    : null;

  const totalDespesas = despesasFiltradas.reduce((acc, item) => acc + Number(item.valor), 0);
  const saldo = totalEntradas - totalDespesas;
  const ticketMedio = modo === 'empresa' && vendasMesAtual.length > 0 ? totalEntradas / vendasMesAtual.length : 0;

  const top3 = [];
  if (modo === 'empresa') {
    const produtosMap: Record<string, { nome: string; quantidade: number; receita: number }> = {};
    vendasMesAtual.forEach(v => {
      const nome = v.produto || 'Item Geral';
      if (!produtosMap[nome]) produtosMap[nome] = { nome, quantidade: 0, receita: 0 };
      produtosMap[nome].quantidade += Number(v.quantidade || 1);
      produtosMap[nome].receita += Number(v.valorTotal || 0);
    });
    top3.push(...Object.values(produtosMap).sort((a, b) => b.receita - a.receita).slice(0, 3));
  } else {
    const categoriasMap: Record<string, { nome: string; quantidade: number; valor: number }> = {};
    despesasFiltradas.forEach(d => {
      const cat = d.categoria || 'Sem categoria';
      if (!categoriasMap[cat]) categoriasMap[cat] = { nome: cat, quantidade: 0, valor: 0 };
      categoriasMap[cat].quantidade += 1;
      categoriasMap[cat].valor += Number(d.valor || 0);
    });
    top3.push(...Object.values(categoriasMap).sort((a, b) => b.valor - a.valor).slice(0, 3));
  }

  const ultimos7Dias = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(fimMesAtual);
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const dadosGrafico = ultimos7Dias.map(dia => ({
    data: dia.slice(5),
    valor: modo === 'empresa'
      ? vendas.filter(v => v.dataVenda?.split('T')[0] === dia).reduce((acc, v) => acc + Number(v.valorTotal || 0), 0)
      : receitasPessoais.filter(r => r.data?.split('T')[0] === dia).reduce((acc, r) => acc + Number(r.valor), 0)
  }));

  const temDadosGrafico = dadosGrafico.some(d => d.valor > 0);

  const cards = [
    {
      titulo: modo === 'empresa' ? 'Faturamento (mês)' : 'Receitas Pessoais',
      valor: `R$ ${totalEntradas.toFixed(2)}`,
      variacao: variacaoEntradas,
      icon: TrendingUp,
      cor: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
    {
      titulo: modo === 'empresa' ? 'Despesas Empresa' : 'Despesas Pessoais',
      valor: `R$ ${totalDespesas.toFixed(2)}`,
      variacao: null,
      icon: TrendingDown,
      cor: 'text-red-400',
      bg: 'bg-red-500/10',
    },
    {
      titulo: 'Saldo do Período',
      valor: `R$ ${saldo.toFixed(2)}`,
      variacao: null,
      icon: Wallet,
      cor: saldo >= 0 ? 'text-cyan-400' : 'text-pink-400',
      bg: saldo >= 0 ? 'bg-cyan-500/10' : 'bg-pink-500/10',
    },
    {
      titulo: modo === 'empresa' ? 'Ticket Médio' : 'Total Transações',
      valor: modo === 'empresa' ? `R$ ${ticketMedio.toFixed(2)}` : `${vendasMesAtual.length + despesasFiltradas.length}`,
      variacao: null,
      icon: modo === 'empresa' ? DollarSign : Tag,
      cor: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
  ];

  if (carregando) {
    return (
      <div className="space-y-6 text-slate-200">
        <div className="bg-[#0f172a] p-4 rounded-lg border border-slate-800">
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <CardSkeleton key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2"><ChartSkeleton /></div>
          <div className="bg-[#0f172a] border border-slate-800 rounded-lg p-5">
            <Skeleton className="h-4 w-32 mb-4" />
            <Skeleton className="h-12 w-full mb-3" />
            <Skeleton className="h-12 w-full mb-3" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-slate-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#0f172a] p-4 rounded-lg border border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">Dashboard {modo === 'pessoal' && '(Pessoal)'}</h1>
          <p className="text-xs text-slate-400">
            {modo === 'empresa' 
              ? 'Visão geral do desempenho financeiro do seu negócio.' 
              : 'Acompanhe suas receitas e despesas pessoais separadamente.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {dashboardPessoalEnabled && (
            <div className="flex bg-[#020617] border border-slate-700 rounded-md p-1">
              <button
                onClick={() => setModo('empresa')}
                className={`px-3 py-1.5 text-sm rounded transition font-medium ${modo === 'empresa' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
              >
                Empresa
              </button>
              <button
                onClick={() => setModo('pessoal')}
                className={`px-3 py-1.5 text-sm rounded transition font-medium ${modo === 'pessoal' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
              >
                Pessoal
              </button>
            </div>
          )}
          <div className="flex items-center gap-2 bg-[#020617] border border-slate-700 rounded-md px-3 py-2">
            <Calendar size={14} className="text-slate-400" />
            <input
              type="month"
              value={mesSelecionado}
              onChange={(e) => setMesSelecionado(e.target.value)}
              className="bg-transparent text-slate-200 text-sm focus:outline-none cursor-pointer"
            />
          </div>
        </div>
      </div>

      <div id="tour-dashboard-cards" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.titulo} className="bg-[#0f172a] border border-slate-800 rounded-lg p-5 transition-all hover:border-slate-700">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold">{card.titulo}</p>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${card.bg}`}>
                  <Icon className={card.cor} size={20} />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white">{card.valor}</h2>
              {card.variacao !== null && (
                <p className={`text-xs mt-2 font-medium ${card.variacao >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {card.variacao >= 0 ? '▲' : '▼'} {Math.abs(card.variacao).toFixed(1)}% vs mês anterior
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-[#0f172a] border border-slate-800 rounded-lg p-5 lg:col-span-2">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
            <BarChart2 className="h-4 w-4 text-blue-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              {modo === 'empresa' ? 'Faturamento — Últimos 7 dias' : 'Receitas Pessoais — Últimos 7 dias'}
            </h2>
          </div>
          {/* ✅ CORREÇÃO: Altura aumentada para h-64 e padding interno ajustado */}
          <div className="h-64 flex items-center justify-center p-4">
            {temDadosGrafico ? (
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <LineChart data={dadosGrafico}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="data" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `R$${v}`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px' }}
                    itemStyle={{ color: '#f8fafc' }}
                    formatter={(v: any) => [`R$ ${Number(v).toFixed(2)}`, modo === 'empresa' ? 'Faturamento' : 'Receita']}
                  />
                  <Line type="monotone" dataKey="valor" stroke={modo === 'empresa' ? '#06b6d4' : '#a855f7'} strokeWidth={2} dot={{ r: 3, fill: '#0f172a', strokeWidth: 2 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState
                icon={<BarChart2 size={32} />}
                title="Sem dados no período selecionado"
                description="Comece registrando vendas e despesas para visualizar seu faturamento aqui."
                actionLabel="Ir para Vendas"
                actionLink="/app/vendas"
                className="py-4"
              />
            )}
          </div>
        </div>

        <div className="bg-[#0f172a] border border-slate-800 rounded-lg p-5">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
            <TrendingUp className={`h-4 w-4 ${modo === 'empresa' ? 'text-emerald-400' : 'text-purple-400'}`} />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              {modo === 'empresa' ? 'Top Produtos' : 'Top Categorias de Gasto'}
            </h2>
          </div>
          <div className="space-y-4">
            {top3.length > 0 ? top3.map((p: any, i) => (
              <div key={p.nome} className="flex items-center gap-3 group">
                <span className={`text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full ${i === 0 ? 'bg-yellow-500/20 text-yellow-400' : i === 1 ? 'bg-slate-600/30 text-slate-300' : 'bg-orange-900/30 text-orange-400'}`}>
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate group-hover:text-cyan-400 transition-colors">{p.nome}</p>
                  <p className="text-xs text-slate-400">
                    {modo === 'empresa' ? `${p.quantidade} un` : `${p.quantidade} lançamentos`} · R$ {p.receita?.toFixed(2) || p.valor?.toFixed(2)}
                  </p>
                </div>
              </div>
            )) : (
              <EmptyState
                icon={<TrendingUp size={32} />}
                title="Nenhum dado registrado neste período"
                description="Seus produtos e categorias mais relevantes aparecerão aqui conforme você registra movimentações."
                className="py-4"
              />
            )}
          </div>
        </div>
      </div>

      <div className="bg-[#0f172a] border border-slate-800 rounded-lg p-5">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
          <DollarSign className="h-4 w-4 text-emerald-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            {modo === 'empresa' ? 'Últimas Vendas' : 'Últimos Movimentos Pessoais'}
          </h2>
        </div>
        <div className="space-y-2">
          {modo === 'empresa' ? (
            vendas.length === 0 ? (
              /* ✅ CORREÇÃO DE FLUXO: Guia o usuário para Precificação primeiro */
              <EmptyState
                icon={<Package size={32} />}
                title="Nenhuma venda registrada ainda"
                description="Para registrar sua primeira venda, siga estes passos: 1) Cadastre ingredientes em Precificação, 2) Crie uma receita, 3) Registre a venda aqui."
                actionLabel="Cadastrar Primeiro Ingrediente"
                actionLink="/app/precificacao"
              />
            ) : (
              vendas.slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-center justify-between bg-slate-800/30 hover:bg-slate-800/50 rounded-lg p-3 transition-colors">
                  <div>
                    <p className="font-semibold text-white text-sm">{item.produto}</p>
                    <p className="text-xs text-slate-400">
                      {new Date(item.dataVenda).toLocaleDateString('pt-BR')} · {item.canalVenda}
                    </p>
                  </div>
                  <p className="font-bold text-emerald-400 text-sm">+ R$ {Number(item.valorTotal).toFixed(2)}</p>
                </div>
              ))
            )
          ) : (
            [...despesasPessoais, ...receitasPessoais].length === 0 ? (
              <EmptyState
                icon={<Wallet size={32} />}
                title="Nenhum movimento pessoal registrado"
                description="Adicione suas receitas e despesas pessoais para ter controle total do seu fluxo de caixa."
                actionLabel="Adicionar Movimento"
                actionLink="/app/financeiro"
              />
            ) : (
              [...despesasPessoais, ...receitasPessoais]
                .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
                .slice(0, 5)
                .map((item) => (
                  <div key={item.id} className="flex items-center justify-between bg-slate-800/30 hover:bg-slate-800/50 rounded-lg p-3 transition-colors">
                    <div>
                      <p className="font-semibold text-white text-sm">{item.descricao}</p>
                      <p className="text-xs text-slate-400">
                        {new Date(item.data).toLocaleDateString('pt-BR')} · {item.categoria || 'Sem categoria'}
                      </p>
                    </div>
                    <p className={`font-bold text-sm ${item.tipo === 'receita' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {item.tipo === 'receita' ? '+' : '-'} R$ {Number(item.valor).toFixed(2)}
                    </p>
                  </div>
                ))
            )
          )}
        </div>
      </div>
    </div>
  );
}