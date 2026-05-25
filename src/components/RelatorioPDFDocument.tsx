// src/components/RelatorioPDFDocument.tsx
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';

// Registre uma fonte para melhor tipografia (opcional, fallback para Helvetica)
Font.register({
  family: 'Inter',
  src: 'https://fonts.gstatic.com/s/inter/v13/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7.woff2',
});

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#1e293b',
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 20,
    borderBottom: '2 solid #22d3ee',
    paddingBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    color: '#0f172a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#475569',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  card: {
    width: '24%',
    padding: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 6,
    border: '1 solid #e2e8f0',
  },
  cardLabel: {
    fontSize: 8,
    color: '#64748b',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 14,
    fontWeight: 700,
    color: '#0f172a',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: '#0f172a',
    marginBottom: 8,
    marginTop: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    padding: 6,
    borderRadius: 4,
    marginBottom: 4,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1 solid #e2e8f0',
    paddingVertical: 4,
  },
  cell: {
    flex: 1,
    fontSize: 8,
    paddingHorizontal: 4,
  },
  chartImage: {
    marginVertical: 10,
    width: '100%',
    height: 180,
  },
  footer: {
    position: 'absolute',
    bottom: 28,
    left: 32,
    right: 32,
    fontSize: 7,
    color: '#94a3b8',
    textAlign: 'center',
    borderTop: '1 solid #e2e8f0',
    paddingTop: 6,
  },
});

interface Props {
  dados: any;
  nomeMes: string;
  ano: string;
  chartsBase64: { linha?: string; pizza?: string; barras?: string };
}

export function RelatorioPDFDocument({ dados, nomeMes, ano, chartsBase64 }: Props) {
  const { totalVendas, totalDespesas, saldo, ticketMedio, vendas, despesas, receitas, topClientes } = dados;
  const nomeMesFormatado = nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1);

  return (
    <Document>
      {/* Página 1 */}
      <Page size="A4" style={styles.page}>
        {/* Cabeçalho */}
        <View style={styles.header}>
          <Text style={styles.title}>IonFinance</Text>
          <Text style={styles.subtitle}>Relatório Mensal — {nomeMesFormatado} de {ano}</Text>
        </View>

        {/* Cards de resumo */}
        <View style={styles.row}>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Faturamento</Text>
            <Text style={styles.cardValue}>R$ {totalVendas.toFixed(2)}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Gastos</Text>
            <Text style={styles.cardValue}>R$ {totalDespesas.toFixed(2)}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Saldo</Text>
            <Text style={styles.cardValue}>R$ {saldo.toFixed(2)}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Ticket Médio</Text>
            <Text style={styles.cardValue}>R$ {ticketMedio.toFixed(2)}</Text>
          </View>
        </View>

        {/* Gráfico de faturamento diário */}
        {chartsBase64.linha && (
          <>
            <Text style={styles.sectionTitle}>📊 Faturamento Diário</Text>
            <Image src={chartsBase64.linha} style={styles.chartImage} />
          </>
        )}

        {/* Gráficos lado a lado */}
        {(chartsBase64.pizza || chartsBase64.barras) && (
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
            {chartsBase64.pizza && (
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 10, fontWeight: 700, marginBottom: 6 }}>🥧 Vendas por Canal</Text>
                <Image src={chartsBase64.pizza} style={{ width: '100%', height: 130 }} />
              </View>
            )}
            {chartsBase64.barras && (
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 10, fontWeight: 700, marginBottom: 6 }}>🏆 Top Produtos</Text>
                <Image src={chartsBase64.barras} style={{ width: '100%', height: 130 }} />
              </View>
            )}
          </View>
        )}

        {/* Top clientes */}
        {topClientes?.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>👥 Top Clientes</Text>
            <View style={styles.tableHeader}>
              <Text style={[styles.cell, { flex: 0.5 }]}>#</Text>
              <Text style={[styles.cell, { flex: 3 }]}>Cliente</Text>
              <Text style={[styles.cell, { flex: 1.5, textAlign: 'right' }]}>Faturamento</Text>
            </View>
            {topClientes.slice(0, 8).map((c: any, i: number) => (
              <View style={styles.tableRow} key={i}>
                <Text style={[styles.cell, { flex: 0.5 }]}>{i + 1}</Text>
                <Text style={[styles.cell, { flex: 3 }]}>{c.nome}</Text>
                <Text style={[styles.cell, { flex: 1.5, textAlign: 'right' }]}>R$ {Number(c.faturamento || 0).toFixed(2)}</Text>
              </View>
            ))}
          </>
        )}

        {/* Rodapé */}
        <Text style={styles.footer}>
          IonFinance • {nomeMesFormatado} {ano} • Gerado em {new Date().toLocaleDateString('pt-BR')}
        </Text>
      </Page>

      {/* Página 2 — Despesas e Receitas */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Despesas & Receitas</Text>
          <Text style={styles.subtitle}>{nomeMesFormatado} de {ano}</Text>
        </View>

        {/* Despesas */}
        <Text style={styles.sectionTitle}>💸 Despesas do Mês</Text>
        <View style={styles.tableHeader}>
          <Text style={[styles.cell, { flex: 2 }]}>Descrição</Text>
          <Text style={[styles.cell, { flex: 1.5, textAlign: 'right' }]}>Valor</Text>
        </View>
        {despesas.slice(0, 25).map((d: any, i: number) => (
          <View style={styles.tableRow} key={i}>
            <Text style={[styles.cell, { flex: 2 }]}>{d.descricao || d.tipo}</Text>
            <Text style={[styles.cell, { flex: 1.5, textAlign: 'right', color: '#ef4444' }]}>
              -R$ {Number(d.valor).toFixed(2)}
            </Text>
          </View>
        ))}
        <View style={{ marginTop: 4, paddingVertical: 4, borderTop: '1 solid #cbd5e1' }}>
          <Text style={{ fontSize: 9, fontWeight: 700, textAlign: 'right' }}>
            Total: R$ {totalDespesas.toFixed(2)}
          </Text>
        </View>

        {/* Receitas */}
        <Text style={styles.sectionTitle}>🧁 Receitas e Precificação</Text>
        <View style={styles.tableHeader}>
          <Text style={[styles.cell, { flex: 3 }]}>Receita</Text>
          <Text style={[styles.cell, { flex: 2, textAlign: 'right' }]}>Preço Venda</Text>
        </View>
        {receitas.slice(0, 20).map((r: any, i: number) => (
          <View style={styles.tableRow} key={i}>
            <Text style={[styles.cell, { flex: 3 }]}>{r.nome}</Text>
            <Text style={[styles.cell, { flex: 2, textAlign: 'right', color: '#22d3ee' }]}>
              R$ {Number(r.precoVendaFinal || 0).toFixed(2)}
            </Text>
          </View>
        ))}

        <Text style={styles.footer}>
          IonFinance • {nomeMesFormatado} {ano} • Página 2
        </Text>
      </Page>
    </Document>
  );
}