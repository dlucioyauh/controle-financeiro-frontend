import { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [despesas, setDespesas] = useState<any[]>([]);

  async function carregarDespesas() {
    const response = await axios.get('http://localhost:3001/despesas');
    setDespesas(response.data);
  }

  async function salvarDespesa() {
    await axios.post('http://localhost:3001/despesas', {
      tipo: 'empresa',
      descricao,
      categoria: 'Internet',
      valor: Number(valor),
      formaPagamento: 'Pix',
      data: '2026-05-06',
    });

    setDescricao('');
    setValor('');

    carregarDespesas();
  }

  useEffect(() => {
    carregarDespesas();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Controle Financeiro</h1>

      <input
        type="text"
        placeholder="Descrição"
        value={descricao}
        onChange={(e) => setDescricao(e.target.value)}
      />

      <br />
      <br />

      <input
        type="number"
        placeholder="Valor"
        value={valor}
        onChange={(e) => setValor(e.target.value)}
      />

      <br />
      <br />

      <button onClick={salvarDespesa}>
        Salvar
      </button>

      <hr />

      <h2>Despesas</h2>

      {despesas.map((despesa) => (
        <div key={despesa.id}>
          <strong>{despesa.descricao}</strong> - R$ {despesa.valor}
        </div>
      ))}
    </div>
  );
}

export default App;