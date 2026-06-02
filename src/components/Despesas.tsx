import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Briefcase, User } from 'lucide-react';
import api from '../api';

interface DespesasProps {
  onChange?: () => void;
  plano?: string;
  modoAtivo?: 'empresa' | 'pessoal';
  onToggleModo?: (modo: 'empresa' | 'pessoal') => void;
}

export default function Despesas({ onChange, plano = 'free', modoAtivo = 'empresa', onToggleModo }: DespesasProps) {
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [categoria, setCategoria] = useState('Fornecedor');
  const [data, setData] = useState('');
  const [formaPagamento, setFormaPagamento] = useState('Pix');
  const [despesas, setDespesas] = useState<any[]>([]);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [filtroMes, setFiltroMes] = useState('');

  const podePessoal = plano === 'pro' || plano === 'premium';
  const tipo = modoAtivo; // usa o modo controlado pelo pai

  const categoriasEmpresa = [
    'Fornecedor',
    'Contas (Água/Luz/Internet)',
    'Entregas/Fretes',
    'Marketing',
    'Equipamentos',
    'Impostos/Taxas',
    'Mão de Obra',
    'Outros',
  ];

  const categoriasPessoal = [
    'Moradia',
    'Alimentação',
    'Lazer',
    'Saúde',
    'Educação',
    'Transporte',
    'Outros',
  ];

  async function carregarDespesas() {
    const endpoint = tipo === 'pessoal' ? '/despesas/pessoais' : '/despesas';
    const r = await api.get(endpoint);
    setDespesas(r.data);
  }

  async function salvarDespesa() {
    if (!descricao || !valor || !data) {
      alert('Preencha descrição, valor e data!');
      return;
    }
    const payload = {
      descricao,
      categoria,
      valor: Number(valor),
      formaPagamento,
      data,
      pessoal: tipo === 'pessoal',
    };
    try {
      if (editandoId !== null) {
        await api.patch(`/despesas/${editandoId}`, payload);
        setEditandoId(null);
      } else {
        await api.post('/despesas', payload);
      }
      setDescricao('');
      setValor('');
      setCategoria(tipo === 'pessoal' ? 'Moradia' : 'Fornecedor');
      setData('');
      setFormaPagamento('Pix');
      await carregarDespesas();
      if (onChange) onChange();
    } catch (error) {
      alert('Erro ao salvar despesa.');
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

  useEffect(() => {
    carregarDespesas();
  }, [tipo]);

  const despesasFiltradas = despesas.filter((item) => {
    const mesOk = !filtroMes || item.data?.slice(0, 7) === filtroMes;
    return mesOk;
  });

  const inputCompacto =
    'bg-gray-800 border border-gray-700 text-white placeholder-gray-500 px-2 py-2 rounded-lg text-xs focus:outline-none focus:border-blue-500 transition-colors';

  const alternarModo = (novoModo: 'empresa' | 'pessoal') => {
    if (novoModo === 'pessoal' && !podePessoal) {
      alert('Módulo pessoal disponível nos planos Pro e Premium.');
      return;
    }
    if (onToggleModo) onToggleModo(novoModo);
    setCategoria(novoModo === 'pessoal' ? 'Moradia' : 'Fornecedor');
  };

  return (
    <div className="space-y-3">
      {/* Toggle Empresa / Pessoal */}
      <div className="flex justify-center">
        <div className="bg-gray-800 rounded-xl p-1 flex gap-1">
          <button
            onClick={() => alternarModo('empresa')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
              tipo === 'empresa'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Briefcase size={16} />
            Empresa
          </button>
          <button
            onClick={() => alternarModo('pessoal')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
              tipo === 'pessoal'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                : 'text-gray-400 hover:text-white'
            } ${!podePessoal ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={!podePessoal ? 'Disponível nos planos Pro e Premium' : 'Despesas pessoais'}
          >
            <User size={16} />
            Pessoal
          </button>
        </div>
      </div>

      {/* Formulário */}
      <div className="bg-gray-900 rounded-xl p-3 border border-gray-800">
        <h3 className="text-sm font-semibold text-white mb-2">
          {editandoId ? '✏ Editar Despesa' : `➕ Nova Despesa ${tipo === 'pessoal' ? 'Pessoal' : 'Empresarial'}`}
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
            {(tipo === 'pessoal' ? categoriasPessoal : categoriasEmpresa).map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
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
            className={`flex items-center gap-1 ${tipo === 'pessoal' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'} disabled:opacity-50 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors`}>
            <Plus size={14} />
            {editandoId ? 'Atualizar' : 'Salvar'}
          </button>
        </div>
      </div>

      {/* Filtro + Lista */}
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
                <div className="flex items-center gap-2">
                  <p className="text-xs font-semibold text-white truncate">{despesa.descricao}</p>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                    despesa.pessoal ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {despesa.pessoal ? 'Pessoal' : 'Empresa'}
                  </span>
                </div>
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