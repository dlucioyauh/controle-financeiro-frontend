import { useState } from 'react';
import api from '../api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { AlertTriangle, FileSpreadsheet, FileText, RefreshCw } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF6B6B', '#4ECDC4', '#45B7D1'];

export default function RelatoriosAvancados() {
  const hoje = new Date().toISOString().split('T')[0];
  const [filtros, setFiltros] = useState({
    dataInicio: '',
    dataFim: hoje,
    tipo: 'ambos',
    produto: '',
  });
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [erroPermissao, setErroPermissao] = useState(false);

  const handleBuscar = async () => {
    setLoading(true);
    setErroPermissao(false);
    try {
      const response = await api.get('/relatorios-avancados/resumo', { params: filtros });
      setData(response.data);
    } catch (error: any) {
      console.error(error);
      if (error.response?.status === 403) {
        setErroPermissao(true);
      } else {
        console.error('Falha ao carregar dados do relatório.');
      }
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const exportarExcel = async () => {
    if (!data) return;
    setExporting(true);
    try {
      const response = await api.get('/export/vendas', {
        params: {
          startDate: filtros.dataInicio || undefined,
          endDate: filtros.dataFim || undefined,
        },
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `relatorio_vendas_${hoje}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (error: any) {
      console.error('Erro ao exportar:', error);
      alert(error.response?.data?.message || 'Erro ao gerar o arquivo Excel.');
    } finally {
      setExporting(false);
    }
  };

  const exportarPDF = async () => {
    if (!data) return;
    const doc = new jsPDF();
    let y = 20;

    const logo = localStorage.getItem('logo');
    if (logo) {
      try {
        doc.addImage(logo, 'JPEG', 14, y, 30, 30);
        y += 35;
      } catch (e) {
        doc.setFontSize(16);
        doc.text('IonFinance', 14, y);
        y += 10;
      }
    } else {
      doc.setFontSize(16);
      doc.text('IonFinance', 14, y);
      y += 10;
    }

    doc.setFontSize(16);
    doc.text('Relatório Avançado', 14, y);
    y += 10;
    doc.setFontSize(10);
    doc.text(`Período: ${filtros.dataInicio || 'início'} a ${filtros.dataFim || 'hoje'}`, 14, y);
    y += 8;
    doc.text(`Total Vendas: R$ ${data.totalVendas?.toFixed(2)}`, 14, y);
    y += 7;
    doc.text(`Total Despesas: R$ ${data.totalDespesas?.toFixed(2)}`, 14, y);
    y += 7;
    doc.text(`Lucro: R$ ${data.lucro?.toFixed(2)}`, 14, y);
    y += 15;

    const pizzaData = getPizzaData();
    if (pizzaData.length > 0) {
      const total = pizzaData.reduce((sum: number, item: any) => sum + item.value, 0);
      const canalRows = pizzaData.map((item: any) => [
        item.name,
        `R$ ${item.value.toFixed(2)}`,
        `${((item.value / total) * 100).toFixed(1)}%`
      ]);
      autoTable(doc, {
        startY: y,
        head: [['Canal', 'Valor', 'Percentual']],
        body: canalRows,
        theme: 'striped',
        styles: { fontSize: 8 },
      });
      y = (doc as any).lastAutoTable.finalY + 10;
    }

    const vendas = data.vendas || [];
    const vendasTable = vendas.map((v: any) => [
      new Date(v.dataVenda).toLocaleDateString('pt-BR'),
      v.produto,
      v.clienteNome || '-',
      `R$ ${Number(v.valorTotal).toFixed(2)}`
    ]);
    
    autoTable(doc, {
      startY: y,
      head: [['Data', 'Produto', 'Cliente', 'Valor']],
      body: vendasTable,
      theme: 'striped',
    });
    
    doc.save(`relatorio_${hoje}.pdf`);
  };

  const getPizzaData = () => {
    if (!data || !data.vendas || data.vendas.length === 0) return [];
    const canalMap: Record<string, number> = {};
    data.vendas.forEach((v: any) => {
      const canal = v.canalVenda || 'Balcão';
      canalMap[canal] = (canalMap[canal] || 0) + Number(v.valorTotal);
    });
    return Object.entries(canalMap).map(([name, value]) => ({ name, value }));
  };

  const pizzaData = getPizzaData();

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <RefreshCw className="animate-spin text-cyan-400" size={32} />
      </div>
    );
  }

  if (erroPermissao) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
        <div className="bg-red-500/10 p-6 rounded-full">
          <AlertTriangle size={48} className="text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-white">Acesso não autorizado</h2>
        <p className="text-slate-300 max-w-md">
          O recurso de Relatórios Avançados está disponível apenas para os planos <strong>Pro</strong> e <strong>Premium</strong>.
        </p>
        <button 
          onClick={() => window.location.href = '/app/configuracoes'} 
          className="mt-4 bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-2 rounded-lg transition"
        >
          Ir para Configurações
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-slate-200">
      <div className="bg-[#0f172a] p-4 rounded-lg border border-slate-800 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-white">Relatórios Avançados</h1>
          <p className="text-xs text-slate-400">Filtros personalizados, gráficos e exportação profissional</p>
        </div>
      </div>

      <div className="bg-[#0f172a] p-4 rounded-lg border border-slate-800 grid grid-cols-1 md:grid-cols-5 gap-4">
        <input 
          type="date" 
          value={filtros.dataInicio} 
          onChange={e => setFiltros({ ...filtros, dataInicio: e.target.value })} 
          className="bg-[#020617] border border-slate-700 rounded p-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500" 
        />
        <input 
          type="date" 
          value={filtros.dataFim} 
          onChange={e => setFiltros({ ...filtros, dataFim: e.target.value })} 
          className="bg-[#020617] border border-slate-700 rounded p-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500" 
        />
        <select 
          value={filtros.tipo} 
          onChange={e => setFiltros({ ...filtros, tipo: e.target.value })} 
          className="bg-[#020617] border border-slate-700 rounded p-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
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
          className="bg-[#020617] border border-slate-700 rounded p-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500" 
        />
        <button 
          onClick={handleBuscar} 
          className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded text-sm font-semibold transition-colors"
        >
          Buscar Dados
        </button>
      </div>

      {data && (
        <>
          <div className="flex gap-2 justify-end">
            <button 
              onClick={exportarExcel} 
              disabled={exporting} 
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded text-sm font-semibold transition-colors"
            >
              {exporting ? <RefreshCw className="animate-spin h-4 w-4" /> : <FileSpreadsheet className="h-4 w-4" />}
              {exporting ? 'Gerando Excel...' : 'Exportar Excel'}
            </button>
            <button 
              onClick={exportarPDF} 
              className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded text-sm font-semibold transition-colors"
            >
              <FileText className="h-4 w-4" /> Exportar PDF
            </button>
          </div>

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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="bg-[#0f172a] p-4 rounded-lg border border-slate-800 lg:col-span-2">
              <h3 className="text-sm font-bold mb-2 text-white">Evolução Diária (Vendas)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.evolucao || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="data" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} />
                  <Tooltip formatter={(v: any) => `R$ ${v}`} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#e2e8f0' }} />
                  <Line type="monotone" dataKey="valor" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-[#0f172a] p-4 rounded-lg border border-slate-800">
              <h3 className="text-sm font-bold mb-2 text-white">Distribuição por Canal</h3>
              {pizzaData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie 
                      data={pizzaData} 
                      cx="50%" 
                      cy="50%" 
                      labelLine={false} 
                      label={({ name, percent }: any) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`} 
                      outerRadius={80} 
                      fill="#8884d8" 
                      dataKey="value"
                    >
                      {pizzaData.map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => `R$ ${value.toFixed(2)}`} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#e2e8f0' }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-xs text-slate-500 italic text-center py-10">Sem dados de canais disponíveis.</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}