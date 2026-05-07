import { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [tipo, setTipo] = useState('empresa');
  const [despesas, setDespesas] = useState<any[]>([]);

  async function carregarDespesas() {
    const response = await axios.get('http://localhost:3001/despesas');
    setDespesas(response.data);
  }

  async function salvarDespesa() {
    await axios.post('http://localhost:3001/despesas', {
      tipo,
      descricao,
      categoria: 'Geral',
      valor: Number(valor),
      formaPagamento: 'Pix',
      data: new Date(),
    });

    setDescricao('');
    setValor('');

    carregarDespesas();
  }

  useEffect(() => {
    carregarDespesas();
  }, []);

  const total = despesas.reduce(
    (acc, item) => acc + Number(item.valor),
    0,
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold mb-6">
            Controle Financeiro
          </h1>

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

            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="border p-3 rounded-lg"
            >
              <option value="empresa">
                Empresa
              </option>

              <option value="pessoal">
                Pessoal
              </option>
            </select>

          </div>

          <button
            onClick={salvarDespesa}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl"
          >
            Salvar Despesa
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold mb-2">
            Total
          </h2>

          <p className="text-3xl text-green-600 font-bold">
            R$ {total.toFixed(2)}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">
            Despesas
          </h2>

          <div className="space-y-3">

            {despesas.map((despesa) => (

              <div
                key={despesa.id}
                className="border rounded-xl p-4 flex justify-between items-center"
              >

                <div>
                  <p className="font-bold">
                    {despesa.descricao}
                  </p>

                  <p className="text-sm text-gray-500">
                    {despesa.tipo}
                  </p>
                </div>

                <p className="font-bold text-red-600">
                  R$ {Number(despesa.valor).toFixed(2)}
                </p>

              </div>

            ))}

          </div>
        </div>

      </div>
    </div>
  );
}

export default App;