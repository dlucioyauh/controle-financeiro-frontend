import { useEffect, useState } from 'react';
import { Wallet, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import api from '../api';

export default function Dashboard() {
  const [despesas, setDespesas] = useState<any[]>([]);
  const [vendas, setVendas] = useState<any[]>([]);

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

  const totalEmpresa = despesas
    .filter((item) => item.tipo === 'empresa')
    .reduce((acc, item) => acc + Number(item.valor), 0);

  const totalEntradas = vendas.reduce(
    (acc, v) => acc + Number(v.valorTotal || 0), 0
  );

  const saldo = totalEntradas - totalEmpresa;

  const cards = [
    {
      titulo: 'Entradas',
      valor: totalEntradas,
      icon: TrendingUp,
      cor: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      formato: 'moeda',
    },
    {
      titulo: 'Gastos Empresa',
      valor: totalEmpresa,
      icon: TrendingDown,
      cor: 'text-red-400',
      bg: 'bg-red-500/10',
      formato: 'moeda',
    },
    {
      titulo: 'Saldo',
      valor: saldo,
      icon: Wallet,
      cor: saldo >= 0 ? 'text-cyan-400' : 'text-pink-400',
      bg: saldo >= 0 ? 'bg-cyan-500/10' : 'bg-pink-500/10',
      formato: 'moeda',
    },
    {
      titulo: 'Total de Vendas',
      valor: vendas.length,
      icon: DollarSign,
      cor: 'text-blue-400',
      bg: 'bg-blue-500/10',
      formato: 'numero',
    },
  ];

  return (
    <div className="space-y-6 text-slate-200">
      <div className="bg-[#0f172a] p-4 rounded-lg border border-slate-800">
        <h1 className="text-xl font-bold tracking-tight text-white">Dashboard</h1>
        <p className="text-xs text-slate-400">Visão geral do desempenho financeiro do seu negócio.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.titulo}
              className="bg-[#0f172a] border border-slate-800 rounded-lg p-5 flex items-center justify-between"
            >
              <div>
                <p className="text-[11px] uppercase tracking-wide text-slate-400 font-medium">
                  {card.titulo}
                </p>
                <h2 className="text-xl font-bold text-white mt-1">
                  {card.formato === 'moeda'
                    ? `R$ ${Number(card.valor).toFixed(2)}`
                    : card.valor}
                </h2>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${card.bg}`}>
                <Icon className={card.cor} size={24} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Últimas vendas */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-lg p-5">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
          <DollarSign className="h-4 w-4 text-emerald-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Últimas Vendas
          </h2>
        </div>
        <div className="space-y-2">
          {vendas.slice(0, 5).map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between bg-white/5 rounded-lg p-3"
            >
              <div>
                <p className="font-semibold text-white text-sm">{item.produto}</p>
                <p className="text-xs text-slate-400">
                  {new Date(item.dataVenda).toLocaleDateString('pt-BR', { timeZone: 'UTC' })} · {item.canalVenda}
                </p>
              </div>
              <p className="font-bold text-emerald-400 text-sm">
                R$ {Number(item.valorTotal).toFixed(2)}
              </p>
            </div>
          ))}
          {vendas.length === 0 && (
            <p className="text-xs text-slate-500 italic text-center py-4">
              Nenhuma venda registrada ainda.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}