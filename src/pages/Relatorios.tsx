import { useState, useEffect } from 'react';
import { FileText, Download, FileSpreadsheet, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import api from '../api';

const PALETA = {
  azul: '#2563eb',
  azulClaro: '#dbeafe',
  verde: '#16a34a',
  verdeClaro: '#dcfce7',
  vermelho: '#dc2626',
  vermelhoClaro: '#fee2e2',
  amarelo: '#f59e0b',
  amareloClaro: '#fef3c7',
  ciano: '#0891b2',
  cinza: '#6b7280',
  fundo: '#f9fafb',
  branco: '#ffffff',
};

export default function Relatorios() {
  const [mes, setMes] = useState(new Date().toISOString().slice(0, 7));
  const [gerando, setGerando] = useState(false);
  const [modo, setModo] = useState<'pdf' | 'excel' | null>(null);
  const [erro, setErro] = useState('');

  const [plano, setPlano] = useState('free');
  const podeGerarRelatorio = plano !== 'free';

  useEffect(() => {
    api.get('/users/perfil')
      .then(res => setPlano(res.data.plano || 'free'))
      .catch(() => setPlano('free'));
  }, []);

  const buscarDados = async () => {
    const [ano, mesNum] = mes.split('-');
    const inicio = `${ano}-${mesNum}-01`;
    const fim = new Date(Number(ano), Number(mesNum), 0).toISOString().split('T')[0];

    const [
      vendasRes, despesasRes, clientesRes, receitasRes,
      estatisticasRes, estatClientesRes,
    ] = await Promise.all([
      api.get('/vendas'),
      api.get('/despesas'),
      api.get('/clientes'),
      api.get('/receitas'),
      api.get('/vendas/estatisticas', { params: { dataInicio: inicio, dataFim: fim } }),
      api.get('/vendas/estatisticas-clientes', { params: { dataInicio: inicio, dataFim: fim } }),
    ]);

    const vendas = vendasRes.data.filter((v: any) =>
      v.dataVenda?.startsWith(`${ano}-${mesNum}`)
    );
    const despesas = despesasRes.data.filter((d: any) =>
      d.data?.startsWith(`${ano}-${mesNum}`)
    );

    const totalVendas = vendas.reduce((acc: number, v: any) => acc + Number(v.valorTotal || 0), 0);
    const totalDespesas = despesas.reduce((acc: number, d: any) => acc + Number(d.valor || 0), 0);
    const saldo = totalVendas - totalDespesas;
    const ticketMedio = vendas.length > 0 ? totalVendas / vendas.length : 0;

    return {
      ano, mesNum, inicio, fim,
      vendas, despesas, clientes: clientesRes.data, receitas: receitasRes.data,
      totalVendas, totalDespesas, saldo, ticketMedio,
      vendasPorDia: estatisticasRes.data?.vendasPorDia || {},
      canaisMap: estatisticasRes.data?.canaisMap || {},
      produtosMaisVendidos: estatisticasRes.data?.produtosMaisVendidos || [],
      topClientes: estatClientesRes.data || [],
    };
  };

  // ─── Gerar PDF Profissional ────────────────────────
  const gerarPDF = async () => {
    setModo('pdf');
    setGerando(true);
    setErro('');
    try {
      const d = await buscarDados();
      const nomeMes = new Date(Number(d.ano), Number(d.mesNum) - 1).toLocaleDateString('pt-BR', { month: 'long' });
      const nomeMesCapitalizado = nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1);

      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const margem = 16;
      const larguraUtil = 178;
      let y = margem;

      // Logo do usuário (se existir)
      const logoBase64 = localStorage.getItem('logo');
      if (logoBase64) {
        try {
          doc.addImage(logoBase64, 'PNG', margem, y, 20, 20);
          y += 22;
        } catch (err) {
          console.warn('Não foi possível adicionar a logo ao PDF:', err);
        }
      }

      const novaPagina = () => {
        doc.addPage();
        y = margem;
        adicionarRodape();
      };

      const adicionarRodape = () => {
        doc.setFontSize(7);
        doc.setTextColor(156, 163, 175);
        doc.text(`IonFinance • ${nomeMesCapitalizado} de ${d.ano} • Página gerada em ${new Date().toLocaleDateString('pt-BR')}`, margem, 290, { align: 'left' });
      };

      const adicionarCabecalho = (titulo: string) => {
        doc.setFillColor(37, 99, 235);
        doc.rect(margem, y, larguraUtil, 10, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(titulo, margem + 4, y + 7);
        y += 14;
      };

      adicionarRodape();

      // Cards de resumo
      const cards = [
        { label: 'FATURAMENTO', valor: `R$ ${d.totalVendas.toFixed(2)}`, bg: PALETA.azul, corFundo: PALETA.azulClaro },
        { label: 'GASTOS', valor: `R$ ${d.totalDespesas.toFixed(2)}`, bg: PALETA.vermelho, corFundo: PALETA.vermelhoClaro },
        { label: 'SALDO', valor: `R$ ${d.saldo.toFixed(2)}`, bg: PALETA.verde, corFundo: PALETA.verdeClaro },
        { label: 'TICKET MÉDIO', valor: `R$ ${d.ticketMedio.toFixed(2)}`, bg: PALETA.amarelo, corFundo: PALETA.amareloClaro },
      ];
      const cardLarg = (larguraUtil - 6) / 4;
      cards.forEach((card, i) => {
        const x = margem + i * (cardLarg + 2);
        doc.setFillColor(card.corFundo);
        doc.roundedRect(x, y, cardLarg, 16, 2, 2, 'F');
        doc.setFontSize(6);
        doc.setTextColor(107, 114, 128);
        doc.text(card.label, x + 3, y + 6);
        doc.setFontSize(11);
        doc.setTextColor(card.bg);
        doc.setFont('helvetica', 'bold');
        doc.text(card.valor, x + 3, y + 12);
      });
      y += 22;

      // Vendas por dia
      const vendasDiarias = Object.entries(d.vendasPorDia as Record<string, number>)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([dia, valor]) => [
          new Date(dia + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          `R$ ${Number(valor).toFixed(2)}`,
        ]);

      if (vendasDiarias.length > 0) {
        if (y > 240) novaPagina();
        adicionarCabecalho(' FATURAMENTO DIÁRIO');
        autoTable(doc, {
          startY: y,
          margin: { left: margem, right: margem },
          head: [['Dia', 'Valor']],
          body: vendasDiarias,
          styles: { fontSize: 8, cellPadding: 2 },
          headStyles: { fillColor: [37, 99, 235], textColor: 255 },
          alternateRowStyles: { fillColor: [249, 250, 251] },
        });
        y = (doc as any).lastAutoTable.finalY + 12;
      }

      // Top produtos
      if (d.produtosMaisVendidos.length > 0) {
        if (y > 200) novaPagina();
        adicionarCabecalho('TOP PRODUTOS');
        const maxQtd = Math.max(...d.produtosMaisVendidos.map((p: any) => Number(p.quantidade)));
        const bodyProdutos = d.produtosMaisVendidos.slice(0, 10).map((p: any) => {
          const qtd = Number(p.quantidade);
          const barra = ''.repeat(Math.round((qtd / maxQtd) * 20));
          return [p.nome.substring(0, 25), `${qtd}`, barra];
        });
        autoTable(doc, {
          startY: y,
          margin: { left: margem, right: margem },
          head: [['Produto', 'Qtd', 'Visualização']],
          body: bodyProdutos,
          styles: { fontSize: 7, cellPadding: 1.5 },
          headStyles: { fillColor: [37, 99, 235], textColor: 255 },
          alternateRowStyles: { fillColor: [249, 250, 251] },
          columnStyles: {
            2: { cellWidth: 40, font: 'Courier', textColor: [8, 145, 178] },
          },
        });
        y = (doc as any).lastAutoTable.finalY + 10;
      }

      // Top clientes
      if (d.topClientes.length > 0) {
        if (y > 220) novaPagina();
        adicionarCabecalho('TOP CLIENTES');
        const bodyClientes = d.topClientes.slice(0, 8).map((c: any, i: number) => [
          `${i + 1}`, c.nome.substring(0, 30), `R$ ${Number(c.faturamento || 0).toFixed(2)}`,
        ]);
        autoTable(doc, {
          startY: y,
          margin: { left: margem, right: margem },
          head: [['#', 'Cliente', 'Faturamento']],
          body: bodyClientes,
          styles: { fontSize: 7, cellPadding: 1.5 },
          headStyles: { fillColor: [37, 99, 235], textColor: 255 },
          alternateRowStyles: { fillColor: [249, 250, 251] },
          columnStyles: {
            2: { halign: 'right', fontStyle: 'bold', textColor: [8, 145, 178] },
          },
        });
        y = (doc as any).lastAutoTable.finalY + 10;
      }

      // Despesas
      if (d.despesas.length > 0) {
        if (y > 180) novaPagina();
        adicionarCabecalho('DESPESAS DO MÊS');
        const bodyDespesas = d.despesas.slice(0, 20).map((d: any) => [
          new Date(d.data).toLocaleDateString('pt-BR'),
          d.descricao?.substring(0, 30) || d.tipo,
          `-R$ ${Number(d.valor).toFixed(2)}`,
        ]);
        autoTable(doc, {
          startY: y,
          margin: { left: margem, right: margem },
          head: [['Data', 'Descrição', 'Valor']],
          body: bodyDespesas,
          styles: { fontSize: 7, cellPadding: 1.5 },
          headStyles: { fillColor: [220, 38, 38], textColor: 255 },
          alternateRowStyles: { fillColor: [254, 226, 226] },
          columnStyles: {
            2: { halign: 'right', fontStyle: 'bold', textColor: [220, 38, 38] },
          },
        });
        y = (doc as any).lastAutoTable.finalY + 5;
        doc.setFontSize(8);
        doc.setTextColor(220, 38, 38);
        doc.setFont('helvetica', 'bold');
        doc.text(`Total: -R$ ${d.totalDespesas.toFixed(2)}`, margem + larguraUtil - 30, y, { align: 'right' });
        y += 12;
      }

      // Receitas
      if (d.receitas.length > 0) {
        if (y > 180) novaPagina();
        adicionarCabecalho('RECEITAS E PRECIFICAÇÃO');
        const bodyReceitas = d.receitas.slice(0, 15).map((r: any) => [
          r.nome.substring(0, 25),
          `${r.rendimento} ${r.unidadeRendimento || 'un'}`,
          `R$ ${Number(r.precoVendaFinal || 0).toFixed(2)}`,
        ]);
        autoTable(doc, {
          startY: y,
          margin: { left: margem, right: margem },
          head: [['Receita', 'Rendimento', 'Preço Venda']],
          body: bodyReceitas,
          styles: { fontSize: 7, cellPadding: 1.5 },
          headStyles: { fillColor: [8, 145, 178], textColor: 255 },
          alternateRowStyles: { fillColor: [240, 253, 250] },
          columnStyles: {
            2: { halign: 'right', fontStyle: 'bold', textColor: [8, 145, 178] },
          },
        });
        y = (doc as any).lastAutoTable.finalY + 10;
      }

      doc.save(`IonFinance_${nomeMes}_${d.ano}.pdf`);
    } catch (err: any) {
      console.error('Erro ao gerar PDF:', err);
      setErro(err?.message || 'Erro desconhecido');
    } finally {
      setGerando(false);
      setModo(null);
    }
  };

  // ─── Excel ──────────────────────────────────────────
  const exportarExcel = async () => {
    setModo('excel');
    setGerando(true);
    setErro('');
    try {
      const d = await buscarDados();
      const wb = XLSX.utils.book_new();
      const wsResumo = XLSX.utils.json_to_sheet([
        { Métrica: 'Faturamento', Valor: `R$ ${d.totalVendas.toFixed(2)}` },
        { Métrica: 'Gastos', Valor: `R$ ${d.totalDespesas.toFixed(2)}` },
        { Métrica: 'Saldo', Valor: `R$ ${d.saldo.toFixed(2)}` },
        { Métrica: 'Ticket Médio', Valor: `R$ ${d.ticketMedio.toFixed(2)}` },
      ]);
      XLSX.utils.book_append_sheet(wb, wsResumo, 'Resumo');
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(d.vendas.map((v: any) => ({
        Data: new Date(v.dataVenda).toLocaleDateString('pt-BR'), Produto: v.produto, Cliente: v.clienteNome || '—', Quantidade: v.quantidade, Valor: Number(v.valorTotal).toFixed(2),
      }))), 'Vendas');
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(d.despesas.map((d: any) => ({
        Data: new Date(d.data).toLocaleDateString('pt-BR'), Descrição: d.descricao || d.tipo, Valor: Number(d.valor).toFixed(2),
      }))), 'Despesas');
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(d.clientes.map((c: any) => ({ Nome: c.nome, Telefone: c.telefone || '—', Cidade: c.cidade || '—' }))), 'Clientes');
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(d.receitas.map((r: any) => ({
        Receita: r.nome, Rendimento: `${r.rendimento} ${r.unidadeRendimento}`, 'Preço Venda': Number(r.precoVendaFinal).toFixed(2),
      }))), 'Receitas');
      XLSX.writeFile(wb, `IonFinance_${d.ano}_${d.mesNum}.xlsx`);
    } catch (err: any) {
      setErro(err?.message || 'Erro desconhecido');
    } finally {
      setGerando(false);
      setModo(null);
    }
  };

  return (
    <div className="space-y-6 text-slate-200">
      <div className="bg-[#0f172a] p-4 rounded-lg border border-slate-800">
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <FileText size={20} className="text-cyan-400" /> Relatórios
        </h1>
        <p className="text-xs text-slate-400">Exporte relatórios profissionais com tabelas e resumos.</p>
      </div>

      {!podeGerarRelatorio && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-xs text-yellow-400">
          Relatórios em PDF e Excel estão disponíveis a partir do plano <strong>Basic</strong>. 
          <a href="/app/configuracoes" className="underline ml-1">Faça upgrade</a>.
        </div>
      )}

      <div className="bg-[#0f172a] border border-slate-800 rounded-lg p-5">
        <label className="block text-[11px] uppercase tracking-wide text-slate-400 font-medium mb-2">Mês de Referência</label>
        <input type="month" value={mes} onChange={(e) => setMes(e.target.value)} className="bg-[#020617] border border-slate-700 text-slate-200 px-3 py-2 rounded-lg text-xs focus:outline-none focus:border-cyan-500" />
      </div>

      {erro && <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-xs">{erro}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#0f172a] border border-slate-800 rounded-lg p-6 space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-500/10 rounded-xl"><FileText size={24} className="text-red-400" /></div>
            <div>
              <h3 className="text-sm font-bold text-white">Relatório Mensal PDF</h3>
              <p className="text-xs text-slate-400">Profissional com tabelas e resumos</p>
            </div>
          </div>
          <button
            onClick={gerarPDF}
            disabled={gerando || !podeGerarRelatorio}
            title={!podeGerarRelatorio ? 'Disponível a partir do plano Basic' : ''}
            className={`w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-2.5 rounded-lg text-xs transition-colors`}
          >
            {gerando && modo === 'pdf' ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            {!podeGerarRelatorio ? 'Indisponível (upgrade)' : gerando && modo === 'pdf' ? 'Gerando PDF...' : 'Gerar PDF'}
          </button>
        </div>
        <div className="bg-[#0f172a] border border-slate-800 rounded-lg p-6 space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/10 rounded-xl"><FileSpreadsheet size={24} className="text-emerald-400" /></div>
            <div>
              <h3 className="text-sm font-bold text-white">Exportar Excel</h3>
              <p className="text-xs text-slate-400">Dados completos para análise</p>
            </div>
          </div>
          <button
            onClick={exportarExcel}
            disabled={gerando || !podeGerarRelatorio}
            title={!podeGerarRelatorio ? 'Disponível a partir do plano Basic' : ''}
            className={`w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-2.5 rounded-lg text-xs transition-colors`}
          >
            {gerando && modo === 'excel' ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            {!podeGerarRelatorio ? 'Indisponível (upgrade)' : gerando && modo === 'excel' ? 'Exportando...' : 'Exportar Excel'}
          </button>
        </div>
      </div>
    </div>
  );
}