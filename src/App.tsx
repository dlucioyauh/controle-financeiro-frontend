import { useEffect, useState } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

function App() {
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [tipo, setTipo] = useState('empresa');
  const [categoria, setCategoria] = useState('Geral');
  const [despesas, setDespesas] = useState<any[]>([]);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [data, setData] = useState('');
  const [formaPagamento, setFormaPagamento] = useState('Pix');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroMes, setFiltroMes] = useState('');

  async function carregarDespesas() {
    const response = await axios.get('http://localhost:3001/despesas');
    setDespesas(response.data);
  }

  async function salvarDespesa() {
    if (!descricao || !valor || !data) {
      alert('Preencha descrição, valor e data!');
      return;
    }

    const payload = {
      tipo,
      descricao,
      categoria,
      valor: Number(valor),
      formaPagamento,
      data,
    };

    if (editandoId !== null) {
      await axios.put(`http://localhost:3001/despesas/${editandoId}`, payload);
      setEditandoId(null);
    } else {
      await axios.post('http://localhost:3001/despesas', payload);
    }

    setDescricao('');
    setValor('');
    setTipo('empresa');
    setCategoria('Geral');
    setData('');
    setFormaPagamento('Pix');

    carregarDespesas();
  }

  async function deletarDespesa(id: number) {
    await axios.delete(`http://localhost:3001/despesas/${id}`);
    carregarDespesas();
  }

  function editarDespesa(despesa: any) {
    setDescricao(despesa.descricao);
    setValor(String(despesa.valor));
    setTipo(despesa.tipo);
    setCategoria(despesa.categoria);
    setData(despesa.data?.slice(0, 10) ?? '');
    setFormaPagamento(despesa.formaPagamento ?? 'Pix');
    setEditandoId(despesa.id);
  }

  useEffect(() => {
    carregarDespesas();
  }, []);

  const total = despesas.reduce(
    (acc, item) => acc + (Number(item.valor) || 0),
    0,
  );

  const totalEmpresa = despesas
    .filter((item) => item.tipo === 'empresa')
    .reduce((acc, item) => acc + (Number(item.valor) || 0), 0);

  const totalPessoal = despesas
    .filter((item) => item.tipo === 'pessoal')
    .reduce((acc, item) => acc + (Number(item.valor) || 0), 0);

  const despesasFiltradas = despesas.filter((item) => {
    const tipoOk = filtroTipo === 'todos' || item.tipo === filtroTipo;
    const mesOk = !filtroMes || item.data?.slice(0, 7) === filtroMes;
    return tipoOk && mesOk;
  });

  const dadosGrafico = Object.entries(
  despesasFiltradas.reduce((acc: Record<string, number>, item) => {
    acc[item.categoria] = (acc[item.categoria] || 0) + Number(item.valor);
    return acc;
  }, {})
).map(([name, value]) => ({ name, value }));

const CORES = [
  '#6366f1', '#22c55e', '#f59e0b', '#ef4444',
  '#3b82f6', '#ec4899', '#14b8a6',
];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">

        {/* RESUMO */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-2">Total Geral</h2>
            <p className="text-3xl text-green-600 font-bold">
              R$ {total.toFixed(2)}
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-2">Empresa</h2>
            <p className="text-3xl text-blue-600 font-bold">
              R$ {totalEmpresa.toFixed(2)}
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-2">Pessoal</h2>
            <p className="text-3xl text-red-600 font-bold">
              R$ {totalPessoal.toFixed(2)}
            </p>
          </div>
        </div>

        {/* FORM */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold mb-6">Controle Financeiro</h1>

          <div className="grid md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Descrição"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="border p-3 rounded-lg"
            />
            <input
              type="number"
              placeholder="Valor"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              className="border p-3 rounded-lg"
            />
            <input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="border p-3 rounded-lg"
            />
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="border p-3 rounded-lg"
            >
              <option value="empresa">Empresa</option>
              <option value="pessoal">Pessoal</option>
            </select>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="border p-3 rounded-lg"
            >
              <option value="Geral">Geral</option>
              <option value="Alimentação">Alimentação</option>
              <option value="Mercado">Mercado</option>
              <option value="Internet">Internet</option>
              <option value="Transporte">Transporte</option>
              <option value="Investimento">Investimento</option>
            </select>
            <select
              value={formaPagamento}
              onChange={(e) => setFormaPagamento(e.target.value)}
              className="border p-3 rounded-lg"
            >
              <option value="Pix">Pix</option>
              <option value="Cartão de Crédito">Cartão de Crédito</option>
              <option value="Cartão de Débito">Cartão de Débito</option>
              <option value="Dinheiro">Dinheiro</option>
              <option value="Boleto">Boleto</option>
              <option value="Transferência">Transferência</option>
            </select>
          </div>

          <button
            onClick={salvarDespesa}
            disabled={!descricao || !valor || !data}
            className="mt-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-3 rounded-xl"
          >
            {editandoId !== null ? 'Atualizar Despesa' : 'Salvar Despesa'}
          </button>
        </div>

        {/* GRÁFICO */}
          {dadosGrafico.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <h2 className="text-2xl font-bold mb-4">Gastos por Categoria</h2>
              <div className="flex justify-center">
                <PieChart width={400} height={300}>
                  <Pie
                    data={dadosGrafico}
                    cx={200}
                    cy={140}
                    outerRadius={110}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {dadosGrafico.map((_, index) => (
                      <Cell key={index} fill={CORES[index % CORES.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `R$ ${value.toFixed(2)}`} />
                  <Legend />
                </PieChart>
              </div>
            </div>
          )}

        {/* LISTA */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex flex-wrap gap-4 mb-4 items-center">
            <h2 className="text-2xl font-bold w-full">Despesas</h2>

            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="border p-2 rounded-lg"
            >
              <option value="todos">Todos</option>
              <option value="empresa">Empresa</option>
              <option value="pessoal">Pessoal</option>
            </select>

            <input
              type="month"
              value={filtroMes}
              onChange={(e) => setFiltroMes(e.target.value)}
              className="border p-2 rounded-lg"
            />

            <button
              onClick={() => { setFiltroTipo('todos'); setFiltroMes(''); }}
              className="text-sm text-gray-500 underline"
            >
              Limpar filtros
            </button>
          </div>

          <div className="space-y-3">
            {despesasFiltradas.map((despesa) => (
              <div
                key={despesa.id}
                className="border rounded-xl p-4 flex justify-between items-center"
              >
                <div>
                  <p className="font-bold">{despesa.descricao}</p>
                  <p className="text-sm text-gray-500">
                    {despesa.tipo} • {despesa.categoria} • {despesa.formaPagamento} • {despesa.data?.slice(0, 10)}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-bold text-red-600">
                    R$ {Number(despesa.valor).toFixed(2)}
                  </p>
                  <button
                    onClick={() => editarDespesa(despesa)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-lg"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => deletarDespesa(despesa.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))}

            {despesasFiltradas.length === 0 && (
              <p className="text-center text-gray-400 py-6">
                Nenhuma despesa encontrada.
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;