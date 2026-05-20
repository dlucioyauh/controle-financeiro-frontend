import { useEffect, useState } from 'react';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
} from 'lucide-react';

import api from '../api';

export default function Dashboard() {
  const [despesas, setDespesas] = useState<any[]>([]);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      const response = await api.get('/despesas');

      setDespesas(response.data);
    } catch (error) {
      console.error(error);
    }
  }

  const totalEmpresa = despesas
    .filter((item) => item.tipo === 'empresa')
    .reduce((acc, item) => acc + Number(item.valor), 0);

  const totalPessoal = despesas
    .filter((item) => item.tipo === 'pessoal')
    .reduce((acc, item) => acc + Number(item.valor), 0);

  const totalGeral = totalEmpresa + totalPessoal;

  const cards = [
    {
      titulo: 'Total Geral',
      valor: totalGeral,
      icon: Wallet,
      cor: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
    },
    {
      titulo: 'Empresa',
      valor: totalEmpresa,
      icon: TrendingUp,
      cor: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      titulo: 'Pessoal',
      valor: totalPessoal,
      icon: TrendingDown,
      cor: 'text-pink-400',
      bg: 'bg-pink-500/10',
    },
    {
      titulo: 'Lançamentos',
      valor: despesas.length,
      icon: ShoppingCart,
      cor: 'text-orange-400',
      bg: 'bg-orange-500/10',
    },
  ];

  return (
    <div className="space-y-8">

      <div>

        <h1 className="text-4xl font-black text-white">
          Dashboard
        </h1>

        <p className="text-zinc-400 mt-2">
          Visão geral do seu sistema financeiro
        </p>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.titulo}
              className="bg-[#0f172a] border border-white/10 rounded-3xl p-6"
            >

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-zinc-400 text-sm">
                    {card.titulo}
                  </p>

                  <h2 className="text-3xl font-black text-white mt-2">
                    {typeof card.valor === 'number'
                      ? `R$ ${card.valor.toFixed(2)}`
                      : card.valor}
                  </h2>

                </div>

                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center ${card.bg}`}
                >
                  <Icon
                    className={card.cor}
                    size={28}
                  />
                </div>

              </div>

            </div>
          );
        })}

      </div>

      <div className="bg-[#0f172a] border border-white/10 rounded-3xl p-6">

        <h2 className="text-2xl font-bold text-white mb-6">
          Últimos lançamentos
        </h2>

        <div className="space-y-3">

          {despesas.slice(0, 5).map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between bg-white/5 rounded-2xl p-4"
            >

              <div>

                <p className="font-semibold text-white">
                  {item.descricao}
                </p>

                <p className="text-sm text-zinc-400">
                  {item.categoria}
                </p>

              </div>

              <p className="font-bold text-red-400">
                R$ {Number(item.valor).toFixed(2)}
              </p>

            </div>
          ))}

        </div>

      </div>

    </div>
  );
}