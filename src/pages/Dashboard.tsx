import { useEffect, useState } from 'react';
import { Wallet, TrendingUp, TrendingDown, DollarSign, BarChart2, Calendar } from 'lucide-react';
import api from '../api';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

export default function Dashboard() {
  const [despesas, setDespesas] = useState<any[]>([]);
  const [vendas, setVendas] = useState<any[]>([]);

  // Mês selecionado (formato 'YYYY-MM')
  const hoje = new Date();
  const mesAtualStr = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;
  const [mesSelecionado, setMesSelecionado] = useState(mesAtualStr);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      const [despesasRes, vendasRes] = await Promise.all([
        api.get('/despesas'),
        api.get('/vendas'),
      ]);
      setDespesas(despesasRes.data);
      setVendas(vendasRes.data);
    } catch (error) {
      console.error(error);
    }
  }

  // Datas calculadas a partir do mês selecionado
  const [ano, mes] = mesSelecionado.split('-').map(Number);
  const inicioMesAtual = new Date(ano, mes - 1, 1);
  const fimMesAtual = new Date(ano, mes, 0); // último dia do mês
  const inicioMesAnterior = new Date(ano, mes - 2, 1);
  const fimMesAnterior = new Date(ano, mes - 1, 0);

  // Filtro de vendas do mês selecionado
  const vendasMesAtual = vendas.filter(v => {
    const [anoV, mesV, diaV] = v.dataVenda.split('T')[0].split('-').map(Number);
    const dataLocal = new Date(anoV, mesV - 1, diaV);
    return dataLocal >= inicioMesAtual && dataLocal <= fimMesAtual;
  });

  // Filtro de vendas do mês anterior
  const vendasMesAnterior = vendas.filter(v => {
    const [anoV, mesV, diaV] = v.dataVenda.split('T')[0].split('-').map(Number);
    const dataLocal = new Date(anoV, mesV - 1, diaV);
    return dataLocal >= inicioMesAnterior && dataLocal <= fimMesAnterior;
  });

  // Filtro de despesas do mês selecionado (campo "data" é string 'YYYY-MM-DD')
  const inicioMesAtualStr = inicioMesAtual.toISOString().split('T')[0];
  const fimMesAtualStr = fimMesAtual.toISOString().split('T')[0];
  const despesasMesAtual = despesas.filter(d => {
    if (!d.data) return false;
    const dataFormatada = d.data.slice(0, 10);
    return dataFormatada >= inicioMesAtualStr && dataFormatada <= fimMesAtualStr;
  });

  const totalEntradas = vendasMesAtual.reduce((acc, v) => acc + Number(v.valorTotal || 0), 0);
  const totalEntradasAnterior = vendasMesAnterior.reduce((acc, v) => acc + Number(v.valorTotal || 0), 0);
  const variacaoEntradas = totalEntradasAnterior > 0
    ? ((totalEntradas - totalEntradasAnterior) / totalEntradasAnterior) * 100
    : null;

  const totalEmpresa = despesasMesAtual.reduce((acc, item) => acc + Number(item.valor), 0);
  const saldo = totalEntradas - totalEmpresa;
  const ticketMedio = vendasMesAtual.length > 0 ? totalEntradas / vendasMesAtual.length : 0;

  // Top 3 produtos (considera todas as vendas, não apenas do mês – pode filtrar se quiser)
  const produtosMap: Record<string, { nome: string; quantidade: number; receita: number }> = {};
  vendas.forEach(v => {
    const nome = v.produto || 'Item Geral';
    if (!produtosMap[nome]) produtosMap[nome] = { nome, quantidade: 0, receita: 0 };
    produtosMap[nome].quantidade += Number(v.quantidade || 1);
    produtosMap[nome].receita += Number(v.valorTotal || 0);
  });
  const top3 = Object.values(produtosMap).sort((a, b) => b.quantidade - a.quantidade).slice(0, 3);

  // Últimos 7 dias a partir da data final do mês selecionado
  const ultimos7Dias = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(fimMesAtual);
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const dadosGrafico = ultimos7Dias.map(dia => ({
    data: dia.slice(5),
    valor: vendas
      .filter(v => v.dataVenda?.split('T')[0] === dia)
      .reduce((acc, v) => acc + Number(v.valorTotal || 0), 0),
  }));

  const temDadosGrafico = dadosGrafico.some(d => d.valor > 0);

  const cards = [
    {
      titulo: 'Entradas (mês)',
      valor: `R$ ${totalEntradas.toFixed(2)}`,
      variacao: variacaoEntradas,
      icon: TrendingUp,
      cor: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
    {
      titulo: 'Gastos Empresa',
      valor: `R$ ${totalEmpresa.toFixed(2)}`,
      variacao: null,
      icon: TrendingDown,
      cor: 'text-red-400',
      bg: 'bg-red-500/10',
    },
    {
      titulo: 'Saldo',
      valor: `R$ ${saldo.toFixed(2)}`,
      variacao: null,
      icon: Wallet,
      cor: saldo >= 0 ? 'text-cyan-400' : 'text-pink-400',
      bg: saldo >= 0 ? 'bg-cyan-500/10' : 'bg-pink-500/10',
    },
    {
      titulo: 'Ticket Médio',
      valor: `R$ ${ticketMedio.toFixed(2)}`,
      variacao: null,
      icon: DollarSign,
      cor: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
  ];

  return (
    <div className="space-y-6 text-slate-200">
      {/* Header + Seletor de mês */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#0f172a] p-4 rounded-lg border border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">Dashboard</h1>
          <p className="text-xs text-slate-400">Visão geral do desempenho financeiro do seu negócio.</p>
        </div>
        <div className="flex items-center gap-1 bg-[#020617] border border-slate-700 rounded px-3 py-2">
          <Calendar size={14} className="text-slate-400" />
          <input
            type="month"
            value={mesSelecionado}
            onChange={(e) => setMesSelecionado(e.target.value)}
            className="bg-transparent text-slate-200 text-sm focus:outline-none"
          />
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.titulo} className="bg-[#0f172a] border border-slate-800 rounded-lg p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[11px] uppercase tracking-wide text-slate-400 font-medium">{card.titulo}</p>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${card.bg}`}>
                  <Icon className={card.cor} size={20} />
                </div>
              </div>
              <h2 className="text-xl font-bold text-white">{card.valor}</h2>
              {card.variacao !== null && (
                <p className={`text-xs mt-1 ${card.variacao >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {card.variacao >= 0 ? '▲' : '▼'} {Math.abs(card.variacao).toFixed(1)}% vs mês anterior
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Gráfico + Top 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-[#0f172a] border border-slate-800 rounded-lg p-5 lg:col-span-2">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
            <BarChart2 className="h-4 w-4 text-blue-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Faturamento — Últimos 7 dias</h2>
          </div>
          <div className="h-48 text-xs flex items-center justify-center">
            {temDadosGrafico ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dadosGrafico}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="data" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
                    formatter={(v: any) => [`R$ ${Number(v).toFixed(2)}`, 'Faturamento']}
                  />
                  <Line type="monotone" dataKey="valor" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-500">Sem vendas nos últimos 7 dias do período.</p>
            )}
          </div>
        </div>

        <div className="bg-[#0f172a] border border-slate-800 rounded-lg p-5">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Top Produtos</h2>
          </div>
          <div className="space-y-3">
            {top3.length > 0 ? top3.map((p, i) => (
              <div key={p.nome} className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-500 w-4">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{p.nome}</p>
                  <p className="text-xs text-slate-400">{p.quantidade} un · R$ {p.receita.toFixed(2)}</p>
                </div>
              </div>
            )) : (
              <p className="text-xs text-slate-500 italic">Nenhuma venda registrada.</p>
            )}
          </div>
        </div>
      </div>

      {/* Últimas vendas */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-lg p-5">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
          <DollarSign className="h-4 w-4 text-emerald-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Últimas Vendas</h2>
        </div>
        <div className="space-y-2">
          {vendas.slice(0, 5).map((item) => (
            <div key={item.id} className="flex items-center justify-between bg-white/5 rounded-lg p-3">
              <div>
                <p className="font-semibold text-white text-sm">{item.produto}</p>
                <p className="text-xs text-slate-400">
                  {new Date(item.dataVenda).toLocaleDateString('pt-BR', { timeZone: 'UTC' })} · {item.canalVenda}
                </p>
              </div>
              <p className="font-bold text-emerald-400 text-sm">R$ {Number(item.valorTotal).toFixed(2)}</p>
            </div>
          ))}
          {vendas.length === 0 && (
            <p className="text-xs text-slate-500 italic text-center py-4">Nenhuma venda registrada ainda.</p>
          )}
        </div>
      </div>
    </div>
  );
}