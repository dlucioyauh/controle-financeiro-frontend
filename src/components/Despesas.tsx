import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import api from '../api';

interface DespesasProps {
  onChange?: () => void; // callback para notificar o componente pai
}

export default function Despesas({ onChange }: DespesasProps) {
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [tipo, setTipo] = useState('empresa');
  const [categoria, setCategoria] = useState('Geral');
  const [data, setData] = useState('');
  const [formaPagamento, setFormaPagamento] = useState('Pix');
  const [despesas, setDespesas] = useState<any[]>([]);
  const [editandoId, setEditandoId] = useState<string | null>(null); // UUID → string
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroMes, setFiltroMes] = useState('');

  async function carregarDespesas() {
    const r = await api.get('/despesas');
    setDespesas(r.data);
  }

  async function salvarDespesa() {
    if (!descricao || !valor || !data) {
      alert('Preencha descrição, valor e data!');
      return;
    }
    const payload = { tipo, descricao, categoria, valor: Number(valor), formaPagamento, data };
    try {
      if (editandoId !== null) {
        await api.patch(`/despesas/${editandoId}`, payload);
        setEditandoId(null);
      } else {
        await api.post('/despesas', payload);
      }
      setDescricao(''); setValor(''); setTipo('empresa');
      setCategoria('Geral'); setData(''); setFormaPagamento('Pix');
      await carregarDespesas();
      if (onChange) onChange(); // notifica o pai
    } catch (error) {
      alert('Erro ao salvar despesa. Verifique os dados.');
      console.error(error);
    }
  }

  async function deletarDespesa(id: string) {
    await api.delete(`/despesas/${id}`);
    await carregarDespesas();
    if (onChange) onChange();
  }

  function editarDespesa(despesa: any) {
    setDescricao(despesa.descricao);
    setValor(String(despesa.valor));
    setTipo(despesa.tipo);
    setCategoria(despesa.categoria);
    setData(despesa.data?.slice(0, 10) ?? '');
    setFormaPagamento(despesa.formaPagamento ?? 'Pix');
    setEditandoId(despesa.id); // id é string (UUID)
  }

  useEffect(() => { carregarDespesas(); }, []);

  const despesasFiltradas = despesas.filter((item) => {
    const tipoOk = filtroTipo === 'todos' || item.tipo === filtroTipo;
    const mesOk = !filtroMes || item.data?.slice(0, 7) === filtroMes;
    return tipoOk && mesOk;
  });

  const inputClass = "bg-gray-800 border border-gray-700 text-white placeholder-gray-500 p-3 rounded-xl w-full focus:outline-none focus:border-blue-500 transition-colors";

  return (
    <div className="space-y-6">

      <div>
        <h2 className="text-2xl font-bold text-white">Despesas</h2>
        <p className="text-gray-400 text-sm mt-1">Gerencie suas despesas pessoais e empresariais</p>
      </div>

      {/* Formulário */}
      <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
        <h3 className="text-lg font-semibold text-white mb-4">
          {editandoId ? '✏ Editar Despesa' : '➕ Nova Despesa'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input type="text" placeholder="Descrição" value={descricao}
            onChange={(e) => setDescricao(e.target.value)} className={inputClass} />
          <input type="number" placeholder="Valor" value={valor}
            onChange={(e) => setValor(e.target.value)} className={inputClass} />
          <input type="date" value={data}
            onChange={(e) => setData(e.target.value)} className={inputClass} />
          <select value={tipo} onChange={(e) => setTipo(e.target.value)} className={inputClass}>
            <option value="empresa">Empresa</option>
            <option value="pessoal">Pessoal</option>
          </select>
          <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className={inputClass}>
            <option value="Geral">Geral</option>
            <option value="Alimentação">Alimentação</option>
            <option value="Mercado">Mercado</option>
            <option value="Internet">Internet</option>
            <option value="Transporte">Transporte</option>
            <option value="Investimento">Investimento</option>
          </select>
          <select value={formaPagamento} onChange={(e) => setFormaPagamento(e.target.value)} className={inputClass}>
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
          className="mt-4 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-medium transition-colors"
        >
          <Plus size={18} />
          {editandoId ? 'Atualizar Despesa' : 'Salvar Despesa'}
        </button>
      </div>

      {/* Filtros + Lista */}
      <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
        <div className="flex flex-wrap gap-3 mb-6 items-center">
          <h3 className="text-lg font-semibold text-white w-full">Lançamentos</h3>
          <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}
            className="bg-gray-800 border border-gray-700 text-white p-2 rounded-xl text-sm focus:outline-none focus:border-blue-500">
            <option value="todos">Todos</option>
            <option value="empresa">Empresa</option>
            <option value="pessoal">Pessoal</option>
          </select>
          <input type="month" value={filtroMes} onChange={(e) => setFiltroMes(e.target.value)}
            className="bg-gray-800 border border-gray-700 text-white p-2 rounded-xl text-sm focus:outline-none focus:border-blue-500" />
          <button onClick={() => { setFiltroTipo('todos'); setFiltroMes(''); }}
            className="text-sm text-gray-400 hover:text-white underline transition-colors">
            Limpar filtros
          </button>
        </div>

        <div className="space-y-3">
          {despesasFiltradas.map((despesa) => (
            <div key={despesa.id}
              className="bg-gray-800 rounded-xl p-4 flex flex-col gap-3 border border-gray-700 hover:border-gray-600 transition-colors">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-white">{despesa.descricao}</p>
                  <p className="text-sm text-gray-400 mt-1">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs mr-2 ${despesa.tipo === 'empresa' ? 'bg-blue-500/20 text-blue-400' : 'bg-pink-500/20 text-pink-400'}`}>
                      {despesa.tipo}
                    </span>
                    {despesa.categoria} • {despesa.formaPagamento} • {despesa.data?.slice(0, 10)}
                  </p>
                </div>
                <p className="font-bold text-red-400 whitespace-nowrap ml-2 text-lg">
                  R$ {Number(despesa.valor).toFixed(2)}
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => editarDespesa(despesa)}
                  className="flex-1 flex items-center justify-center gap-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 py-2 rounded-lg text-sm transition-colors">
                  <Pencil size={14} /> Editar
                </button>
                <button onClick={() => deletarDespesa(despesa.id)}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 py-2 rounded-lg text-sm transition-colors">
                  <Trash2 size={14} /> Excluir
                </button>
              </div>
            </div>
          ))}

          {despesasFiltradas.length === 0 && (
            <p className="text-center text-gray-500 py-10">Nenhuma despesa encontrada.</p>
          )}
        </div>
      </div>
    </div>
  );
}