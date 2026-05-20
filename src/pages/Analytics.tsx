import React, { useState, useEffect } from 'react';
import api from '../api';

interface Venda {
  id: string;
  produto: string;
  quantidade: number;
  precoUnitario: number;
  valorTotal: number;
  canalVenda: string;
  contextoData: string;
  dataVenda: string;
}

export default function Analytics() {
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/vendas')
      .then((response) => {
        setVendas(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Erro ao buscar dados de vendas:", error);
        setLoading(false);
      });
  }, []);

  const faturamentoTotal = vendas.reduce((acc, v) => acc + Number(v.valorTotal), 0);
  const totalProdutosVendidos = vendas.reduce((acc, v) => acc + v.quantidade, 0);
  const ticketMedio = vendas.length > 0 ? faturamentoTotal / vendas.length : 0;

  const vendasPorContexto = vendas.reduce((acc: Record<string, number>, v) => {
    const contexto = v.contextoData || 'Dias Comuns';
    acc[contexto] = (acc[contexto] || 0) + Number(v.valorTotal);
    return acc;
  }, {});

  const produtosMaisVendidos = vendas.reduce((acc: Record<string, { qtd: number; total: number }>, v) => {
    if (!acc[v.produto]) {
      acc[v.produto] = { qtd: 0, total: 0 };
    }
    acc[v.produto].qtd += v.quantidade;
    acc[v.produto].total += Number(v.valorTotal);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="text-center text-gray-500 py-10 text-xs animate-pulse">
        Carregando dados estatísticos...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Análise Estatística</h2>
        <p className="text-gray-400 text-sm mt-1">Dados de faturamento, faturamento por datas festivas e produtos.</p>
      </div>

      {/* Cards de Métricas Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gray-900 p-5 rounded-2xl border border-gray-800">
          <p className="text-gray-400 text-[10px] font-semibold uppercase tracking-wider">Entrada em Caixa</p>
          <p className="text-xl md:text-2xl font-bold text-emerald-400 mt-1">
            R$ {faturamentoTotal.toFixed(2)}
          </p>
        </div>
        
        <div className="bg-gray-900 p-5 rounded-2xl border border-gray-800">
          <p className="text-gray-400 text-[10px] font-semibold uppercase tracking-wider">Itens Vendidos</p>
          <p className="text-xl md:text-2xl font-bold text-sky-400 mt-1">
            {totalProdutosVendidos} <span className="text-xs font-normal text-gray-500">unid.</span>
          </p>
        </div>

        <div className="bg-gray-900 p-5 rounded-2xl border border-gray-800">
          <p className="text-gray-400 text-[10px] font-semibold uppercase tracking-wider">Ticket Médio</p>
          <p className="text-xl md:text-2xl font-bold text-amber-400 mt-1">
            R$ {ticketMedio.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Sazonalidade */}
        <div className="bg-gray-900 p-5 rounded-2xl border border-gray-800">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300 mb-0.5">📊 Faturamento por Sazonalidade</h3>
          <p className="text-gray-500 text-[11px] mb-4">Performance em datas comemorativas vs períodos normais.</p>
          
          <div className="space-y-2">
            {Object.keys(vendasPorContexto).length === 0 ? (
              <p className="text-gray-500 text-xs py-2 text-center">Nenhuma venda registrada.</p>
            ) : (
              Object.entries(vendasPorContexto).map(([evento, valor]) => (
                <div key={evento} className="flex justify-between items-center p-3 bg-gray-800 rounded-xl border border-gray-700">
                  <span className="text-xs text-white">{evento}</span>
                  <span className="text-emerald-400 font-bold text-xs">
                    R$ {valor.toFixed(2)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Ranking de Produtos */}
        <div className="bg-gray-900 p-5 rounded-2xl border border-gray-800">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300 mb-0.5">🏆 Líderes de Venda</h3>
          <p className="text-gray-500 text-[11px] mb-4">Itens que mais giram e trazem retorno financeiro.</p>
          
          <div className="space-y-2">
            {Object.keys(produtosMaisVendidos).length === 0 ? (
              <p className="text-gray-500 text-xs py-2 text-center">Nenhum produto vendido.</p>
            ) : (
              Object.entries(produtosMaisVendidos)
                .sort((a, b) => b[1].qtd - a[1].qtd)
                .map(([nome, dados]) => (
                  <div key={nome} className="flex justify-between items-center p-3 bg-gray-800 rounded-xl border border-gray-700">
                    <div>
                      <p className="text-xs font-medium text-white">{nome}</p>
                      <p className="text-[10px] text-gray-500">{dados.qtd} saídas</p>
                    </div>
                    <span className="text-gray-300 font-semibold text-xs">
                      R$ {dados.total.toFixed(2)}
                    </span>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}