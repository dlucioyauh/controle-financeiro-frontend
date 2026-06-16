import { useState } from 'react';
import api from '../api';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import { AlertTriangle, Crown } from 'lucide-react';

export default function RelatoriosAvancados() {
  const [filtros, setFiltros] = useState({
    dataInicio: '',
    dataFim: '',
    tipo: 'ambos',
    produto: '',
  });
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [erroPermissao, setErroPermissao] = useState(false);
  const [erroGenerico, setErroGenerico] = useState<string | null>(null);

  const handleBuscar = async () => {
    setLoading(true);
    setErroPermissao(false);
    setErroGenerico(null);
    try {
      const response = await api.get('/relatorios-avancados/resumo', { params: filtros });
      console.log('Resposta do backend:', response.data);
      setData(response.data);
    } catch (error: any) {
      console.error('Erro na requisição:', error);
      if (error.response?.status === 403) {
        setErroPermissao(true);
      } else if (error.response?.status === 500) {
        setErroGenerico('Erro interno do servidor. Tente novamente mais tarde.');
      } else {
        setErroGenerico('Falha ao carregar dados. Verifique sua conexão.');
      }
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  // --- Export Excel (XLSX) ---
  const exportarExcel = () => {
    if (!data) return;
    const vendas = data.vendas || [];
    const despesas = data.despesas || [];
    const linhas = [
      ['Tipo', 'Data', 'Descrição/Produto', 'Valor', 'Categoria/Cliente'],
      ...vendas.map((v: any) => [
        'Venda',
        new Date(v.dataVenda).toLocaleDateString('pt-BR'),
        v.produto + (v.clienteNome ? ` (${v.clienteNome})` : ''),
        v.valorTotal,
        v.canalVenda || ''
      ]),
      ...despesas.map((d: any) => [
        'Despesa',
        new Date(d.data).toLocaleDateString('pt-BR'),
        d.descricao,
        d.valor,
        d.categoria
      ])
    ];
    const ws = XLSX.utils.aoa_to_sheet(linhas);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Relatorio');
    XLSX.writeFile(wb, `relatorio_${new Date().toISOString().slice(0,19)}.xlsx`);
  };

  // --- Export PDF ---
  const exportarPDF = () => {
    if (!data) return;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Relatório Avançado', 14, 20);
    doc.setFontSize(10);
    doc.text(`Período: ${filtros.dataInicio || 'início'} a ${filtros.dataFim || 'hoje'}`, 14, 30);
    doc.text(`Total Vendas: R$ ${data.totalVendas?.toFixed(2)}`, 14, 40);
    doc.text(`Total Despesas: R$ ${data.totalDespesas?.toFixed(2)}`, 14, 48);
    doc.text(`Lucro: R$ ${data.lucro?.toFixed(2)}`, 14, 56);
    doc.text(`Ticket Médio: R$ ${data.ticketMedio?.toFixed(2)}`, 14, 64);

    const vendas = data.vendas || [];
    const vendasTable = vendas.map((v: any) => [
      new Date(v.dataVenda).toLocaleDateString('pt-BR'),
      v.produto,
      v.clienteNome || '',
      `R$ ${Number(v.valorTotal).toFixed(2)}`
    ]);
    autoTable(doc, {
      startY: 74,
      head: [['Data', 'Produto', 'Cliente', 'Valor']],
      body: vendasTable,
      theme: 'striped',
    });

    const despesas = data.despesas || [];
    if (despesas.length) {
      const despesasTable = despesas.map((d: any) => [
        new Date(d.data).toLocaleDateString('pt-BR'),
        d.descricao,
        d.categoria,
        `R$ ${Number(d.valor).toFixed(2)}`
      ]);
      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 10,
        head: [['Data', 'Descrição', 'Categoria', 'Valor']],
        body: despesasTable,
        theme: 'striped',
      });
    }
    doc.save(`relatorio_${new Date().toISOString().slice(0,19)}.pdf`);
  };

  if (loading) return <div className="text-center py-10">Carregando...</div>;

  if (erroPermissao) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
        <div className="bg-red-500/10 p-6 rounded-full">
          <AlertTriangle size={48} className="text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-white">Acesso não autorizado</h2>
        <p className="text-slate-300 max-w-md">
          O recurso de <strong>Relatórios Avançados</strong> está disponível apenas para os planos <strong>Pro</strong> e <strong>Premium</strong>.
        </p>
        <div className="bg-[#0f172a] border border-slate-800 rounded-lg p-6 max-w-md text-left space-y-2">
          <div className="flex items-center gap-2 text-emerald-400">
            <Crown size={18} /> <span className="font-semibold">Plano Pro</span>
          </div>
          <div className="flex items-center gap-2 text-purple-400">
            <Crown size={18} /> <span className="font-semibold">Plano Premium</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Faça o upgrade nas suas Configurações para desbloquear relatórios completos, gráficos avançados e exportação de dados.
          </p>
        </div>
        <button
          onClick={() => window.location.href = '/app/configuracoes'}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
        >
          Ir para Configurações
        </button>
      </div>
    );
  }

  if (erroGenerico) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <AlertTriangle size={48} className="text-red-500" />
        <p className="text-slate-300">{erroGenerico}</p>
        <button onClick={handleBuscar} className="bg-blue-600 px-4 py-2 rounded">Tentar novamente</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-slate-200">
      <div className="bg-[#0f172a] p-4 rounded-lg border border-slate-800">
        <h1 className="text-xl font-bold text-white">Relatórios Avançados</h1>
        <p className="text-xs text-slate-400">Filtros personalizados, gráficos e exportação</p>
      </div>

      {/* Filtros */}
      <div className="bg-[#0f172a] p-4 rounded-lg border border-slate-800 grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          type="date"
          value={filtros.dataInicio}
          onChange={e => setFiltros({ ...filtros, dataInicio: e.target.value })}
          className="bg-[#020617] border border-slate-700 rounded p-2 text-sm"
        />
        <input
          type="date"
          value={filtros.dataFim}
          onChange={e => setFiltros({ ...filtros, dataFim: e.target.value })}
          className="bg-[#020617] border border-slate-700 rounded p-2 text-sm"
        />
        <select
          value={filtros.tipo}
          onChange={e => setFiltros({ ...filtros, tipo: e.target.value as any })}
          className="bg-[#020617] border border-slate-700 rounded p-2 text-sm"
        >
          <option value="ambos">Vendas + Despesas</option>
          <option value="venda">Apenas Vendas</option>
          <option value="despesa">Apenas Despesas</option>
        </select>
        <input
          type="text"
          placeholder="Produto (opcional)"
          value={filtros.produto}
          onChange={e => setFiltros({ ...filtros, produto: e.target.value })}
          className="bg-[#020617] border border-slate-700 rounded p-2 text-sm"
        />
        <button onClick={handleBuscar} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
          Buscar
        </button>
      </div>

      {/* Botões de exportação (só aparecem se data existir) */}
      {data && (
        <div className="flex gap-2 justify-end">
          <button onClick={exportarExcel} className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded text-sm">
            Exportar Excel
          </button>
          <button onClick={exportarPDF} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm">
            Exportar PDF
          </button>
        </div>
      )}

      {/* Cards resumo */}
      {data && (
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
      )}

      {/* Gráficos */}
      {data && (
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
      )}

      {/* Tabela de transações */}
      {data && (
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
                    <td className="py-1">{v.produto} {v.clienteNome && `- ${v.clienteNome}`}</td>
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
      )}
    </div>
  );
}