import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import api from '../api';

interface DespesasProps {
  onChange?: () => void;
}

export default function Despesas({ onChange }: DespesasProps) {
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [categoria, setCategoria] = useState('Fornecedor');
  const [data, setData] = useState('');
  const [formaPagamento, setFormaPagamento] = useState('Pix');
  const [despesas, setDespesas] = useState<any[]>([]);
  const [editandoId, setEditandoId] = useState<string | null>(null);
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
    const payload = { descricao, categoria, valor: Number(valor), formaPagamento, data };
    try {
      if (editandoId !== null) {
        await api.patch(`/despesas/${editandoId}`, payload);
        setEditandoId(null);
      } else {
        await api.post('/despesas', payload);
      }
      setDescricao(''); setValor(''); setCategoria('Fornecedor'); setData(''); setFormaPagamento('Pix');
      await carregarDespesas();
      if (onChange) onChange();
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
    setCategoria(despesa.categoria || 'Fornecedor');
    setData(despesa.data?.slice(0, 10) ?? '');
    setFormaPagamento(despesa.formaPagamento ?? 'Pix');
    setEditandoId(despesa.id);
  }

  useEffect(() => { carregarDespesas(); }, []);

  const despesasFiltradas = despesas.filter((item) => {
    const mesOk = !filtroMes || item.data?.slice(0, 7) === filtroMes;
    return mesOk;
  });

  const inputCompacto = "bg-gray-800 border border-gray-700 text-white placeholder-gray-500 px-2 py-2 rounded-lg text-xs focus:outline-none focus:border-blue-500 transition-colors";

  return (
    <div className="space-y-3">
      {/* Formulário compacto inline */}
      <div className="bg-gray-900 rounded-xl p-3 border border-gray-800">
        <h3 className="text-sm font-semibold text-white mb-2">
          {editandoId ? '✏ Editar Despesa' : '➕ Nova Despesa'}
        </h3>
        <div className="flex flex-wrap items-end gap-2">
          <input type="text" placeholder="Descrição" value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            className={`${inputCompacto} flex-[2] min-w-[130px]`} />
          <input type="number" placeholder="Valor" value={valor}
            onChange={(e) => setValor(e.target.value)}
            className={`${inputCompacto} flex-1 min-w-[90px]`} />
          <input type="date" value={data}
            onChange={(e) => setData(e.target.value)}
            className={`${inputCompacto} flex-1 min-w-[110px]`} />
          <select value={categoria} onChange={(e) => setCategoria(e.target.value)}
            className={`${inputCompacto} flex-1 min-w-[100px]`}>
            <option value="Fornecedor">Fornecedor</option>
            <option value="Contas (Água/Luz/Internet)">Contas (Água/Luz/Internet)</option>
            <option value="Entregas/Fretes">Entregas/Fretes</option>
            <option value="Marketing">Marketing</option>
            <option value="Equipamentos">Equipamentos</option>
            <option value="Impostos/Taxas">Impostos/Taxas</option>
            <option value="Mão de Obra">Mão de Obra</option>
            <option value="Outros">Outros</option>
          </select>
          <select value={formaPagamento} onChange={(e) => setFormaPagamento(e.target.value)}
            className={`${inputCompacto} flex-1 min-w-[100px]`}>
            <option value="Pix">Pix</option>
            <option value="Cartão de Crédito">Cartão de Crédito</option>
            <option value="Cartão de Débito">Cartão de Débito</option>
            <option value="Dinheiro">Dinheiro</option>
            <option value="Boleto">Boleto</option>
            <option value="Transferência">Transferência</option>
          </select>
          <button onClick={salvarDespesa} disabled={!descricao || !valor || !data}
            className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors">
            <Plus size={14} />
            {editandoId ? 'Atualizar' : 'Salvar'}
          </button>
        </div>
      </div>

      {/* Filtro por mês + Lista */}
      <div className="bg-gray-900 rounded-xl p-3 border border-gray-800">
        <div className="flex items-center gap-3 mb-2">
          <h3 className="text-sm font-semibold text-white">Lançamentos</h3>
          <input type="month" value={filtroMes} onChange={(e) => setFiltroMes(e.target.value)}
            className="bg-gray-800 border border-gray-700 text-white p-1 rounded-lg text-xs focus:outline-none focus:border-blue-500" />
          {filtroMes && <button onClick={() => setFiltroMes('')}
            className="text-xs text-gray-400 hover:text-white underline transition-colors">Limpar</button>}
        </div>

        <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-1">
          {despesasFiltradas.map((despesa) => (
            <div key={despesa.id}
              className="bg-gray-800 rounded-lg p-2.5 flex items-center justify-between gap-2 border border-gray-700 hover:border-gray-600 transition-colors">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">{despesa.descricao}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {despesa.categoria} • {despesa.formaPagamento} • {despesa.data?.slice(0, 10)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-xs font-bold text-red-400 whitespace-nowrap">
                  R$ {Number(despesa.valor).toFixed(2)}
                </p>
                <button onClick={() => editarDespesa(despesa)}
                  className="p-1 rounded bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 transition-colors">
                  <Pencil size={12} />
                </button>
                <button onClick={() => deletarDespesa(despesa.id)}
                  className="p-1 rounded bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors">
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
          {despesasFiltradas.length === 0 && (
            <p className="text-center text-gray-500 py-4 text-xs">Nenhuma despesa encontrada.</p>
          )}
        </div>
      </div>
    </div>
  );
}