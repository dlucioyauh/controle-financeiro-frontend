import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Calculator } from 'lucide-react';
import api from '../api';

export default function Receitas() {
  const [receitas, setReceitas] = useState<any[]>([]);
  const [ingredientes, setIngredientes] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);

  // Campos da receita
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [rendimento, setRendimento] = useState('');
  const [unidadeRendimento, setUnidadeRendimento] = useState('unidades');
  const [maoDeObra, setMaoDeObra] = useState('');
  const [custosFixosPorcentagem, setCustosFixosPorcentagem] = useState('10');
  const [precoVendaFinal, setPrecoVendaFinal] = useState('');
  const [precoVendaParceiro, setPrecoVendaParceiro] = useState('');
  const [editandoId, setEditandoId] = useState<number | null>(null);

  // Ingredientes da receita
  const [ingredientesReceita, setIngredientesReceita] = useState<any[]>([]);
  const [ingSelecionado, setIngSelecionado] = useState('');
  const [ingQuantidade, setIngQuantidade] = useState('');

  async function carregar() {
    const [r, i] = await Promise.all([
      api.get('/receitas'),
      api.get('/ingredientes'),
    ]);
    setReceitas(r.data);
    setIngredientes(i.data);
  }

  function adicionarIngrediente() {
    const ing = ingredientes.find((i) => i.id === Number(ingSelecionado));
    if (!ing || !ingQuantidade) return;

    const custoTotal = (Number(ingQuantidade) / (ing.unidade === 'g' || ing.unidade === 'ml' ? 1000 : 1)) * Number(ing.preco);

    setIngredientesReceita((prev) => [
      ...prev,
      {
        ingredienteId: ing.id,
        nome: ing.nome,
        quantidade: Number(ingQuantidade),
        unidade: ing.unidade,
        custoUnitario: Number(ing.preco),
        custoTotal,
      },
    ]);
    setIngSelecionado('');
    setIngQuantidade('');
  }

  function removerIngrediente(index: number) {
    setIngredientesReceita((prev) => prev.filter((_, i) => i !== index));
  }

  const custoIngredientes = ingredientesReceita.reduce((acc, i) => acc + i.custoTotal, 0);
  const custoFixos = custoIngredientes * (Number(custosFixosPorcentagem) / 100);
  const custoTotal = custoIngredientes + custoFixos + Number(maoDeObra || 0);
  const custoPorUnidade = rendimento ? custoTotal / Number(rendimento) : 0;
  const margemFinal = precoVendaFinal ? ((Number(precoVendaFinal) - custoPorUnidade) / Number(precoVendaFinal)) * 100 : 0;
  const margemParceiro = precoVendaParceiro ? ((Number(precoVendaParceiro) - custoPorUnidade) / Number(precoVendaParceiro)) * 100 : 0;

  async function salvar() {
    if (!nome || !rendimento) {
      alert('Preencha nome e rendimento!');
      return;
    }
    const payload = {
      nome, descricao, rendimento: Number(rendimento),
      unidadeRendimento, maoDeObra: Number(maoDeObra || 0),
      custosFixosPorcentagem: Number(custosFixosPorcentagem),
      custoIngredientes,
      precoVendaFinal: Number(precoVendaFinal || 0),
      precoVendaParceiro: Number(precoVendaParceiro || 0),
      ingredientes: ingredientesReceita,
    };
    if (editandoId !== null) {
      await api.put(`/receitas/${editandoId}`, payload);
      setEditandoId(null);
    } else {
      await api.post('/receitas', payload);
    }
    resetForm();
    carregar();
  }

  function resetForm() {
    setNome(''); setDescricao(''); setRendimento('');
    setUnidadeRendimento('unidades'); setMaoDeObra('');
    setCustosFixosPorcentagem('10'); setPrecoVendaFinal('');
    setPrecoVendaParceiro(''); setIngredientesReceita([]);
    setShowForm(false); setEditandoId(null);
  }

  function editar(r: any) {
    setNome(r.nome); setDescricao(r.descricao || '');
    setRendimento(String(r.rendimento));
    setUnidadeRendimento(r.unidadeRendimento || 'unidades');
    setMaoDeObra(String(r.maoDeObra || ''));
    setCustosFixosPorcentagem(String(r.custosFixosPorcentagem || 10));
    setPrecoVendaFinal(String(r.precoVendaFinal || ''));
    setPrecoVendaParceiro(String(r.precoVendaParceiro || ''));
    setIngredientesReceita(r.ingredientes || []);
    setEditandoId(r.id); setShowForm(true);
  }

  async function deletar(id: number) {
    await api.delete(`/receitas/${id}`);
    carregar();
  }

  useEffect(() => { carregar(); }, []);

  const inputClass = "bg-gray-800 border border-gray-700 text-white placeholder-gray-500 p-3 rounded-xl w-full focus:outline-none focus:border-blue-500 transition-colors";

  return (
    <div className="space-y-6">

      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
        >
          <Plus size={18} /> Nova Receita
        </button>
      )}

      {/* Formulário */}
      {showForm && (
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 space-y-6">
          <h3 className="text-lg font-semibold text-white">
            {editandoId ? '✏️ Editar Receita' : '➕ Nova Receita'}
          </h3>

          {/* Dados básicos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input type="text" placeholder="Nome da receita" value={nome}
              onChange={(e) => setNome(e.target.value)} className={inputClass} />
            <input type="text" placeholder="Descrição (opcional)" value={descricao}
              onChange={(e) => setDescricao(e.target.value)} className={inputClass} />
            <input type="number" placeholder="Rendimento (qtd de unidades)" value={rendimento}
              onChange={(e) => setRendimento(e.target.value)} className={inputClass} />
            <select value={unidadeRendimento} onChange={(e) => setUnidadeRendimento(e.target.value)} className={inputClass}>
              <option value="unidades">Unidades</option>
              <option value="fatias">Fatias</option>
              <option value="porções">Porções</option>
            </select>
            <input type="number" placeholder="Mão de obra R$ (por receita)" value={maoDeObra}
              onChange={(e) => setMaoDeObra(e.target.value)} className={inputClass} />
            <div className="relative">
              <input type="number" placeholder="% Custos fixos (água, luz, gás)" value={custosFixosPorcentagem}
                onChange={(e) => setCustosFixosPorcentagem(e.target.value)} className={inputClass} />
              <span className="absolute right-3 top-3.5 text-gray-400">%</span>
            </div>
          </div>

          {/* Ingredientes */}
          <div>
            <h4 className="text-white font-medium mb-3">Ingredientes da Receita</h4>
            <div className="flex gap-2 mb-3">
              <select value={ingSelecionado} onChange={(e) => setIngSelecionado(e.target.value)}
                className="flex-1 bg-gray-800 border border-gray-700 text-white p-3 rounded-xl focus:outline-none focus:border-blue-500">
                <option value="">Selecione o ingrediente</option>
                {ingredientes.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.nome} (R$ {Number(i.preco).toFixed(2)}/{i.unidade})
                  </option>
                ))}
              </select>
              <input type="number" placeholder="Qtd" value={ingQuantidade}
                onChange={(e) => setIngQuantidade(e.target.value)}
                className="w-28 bg-gray-800 border border-gray-700 text-white p-3 rounded-xl focus:outline-none focus:border-blue-500" />
              <button onClick={adicionarIngrediente}
                className="bg-green-600 hover:bg-green-700 text-white px-4 rounded-xl transition-colors">
                <Plus size={18} />
              </button>
            </div>

            {ingredientesReceita.map((i, index) => (
              <div key={index} className="flex justify-between items-center bg-gray-800 rounded-xl p-3 mb-2 border border-gray-700">
                <div>
                  <p className="text-white text-sm font-medium">{i.nome}</p>
                  <p className="text-gray-400 text-xs">{i.quantidade} {i.unidade} → R$ {i.custoTotal.toFixed(2)}</p>
                </div>
                <button onClick={() => removerIngrediente(index)} className="text-red-400 hover:text-red-300">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          {/* Resumo de custos */}
          {custoIngredientes > 0 && (
            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 space-y-2">
              <h4 className="text-white font-medium flex items-center gap-2">
                <Calculator size={16} /> Resumo de Custos
              </h4>
              <div className="text-sm space-y-1">
                <div className="flex justify-between text-gray-400">
                  <span>Ingredientes</span>
                  <span>R$ {custoIngredientes.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Custos fixos ({custosFixosPorcentagem}%)</span>
                  <span>R$ {custoFixos.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Mão de obra</span>
                  <span>R$ {Number(maoDeObra || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-white font-bold border-t border-gray-700 pt-2 mt-2">
                  <span>Custo total</span>
                  <span>R$ {custoTotal.toFixed(2)}</span>
                </div>
                {rendimento && (
                  <div className="flex justify-between text-blue-400 font-bold">
                    <span>Custo por unidade</span>
                    <span>R$ {custoPorUnidade.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Preços de venda */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Preço Cliente Final (R$)</label>
              <input type="number" value={precoVendaFinal}
                onChange={(e) => setPrecoVendaFinal(e.target.value)} className={inputClass} />
              {precoVendaFinal && (
                <p className={`text-xs mt-1 ${margemFinal > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  Margem: {margemFinal.toFixed(1)}%
                </p>
              )}
            </div>
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Preço Parceiro/Café (R$)</label>
              <input type="number" value={precoVendaParceiro}
                onChange={(e) => setPrecoVendaParceiro(e.target.value)} className={inputClass} />
              {precoVendaParceiro && (
                <p className={`text-xs mt-1 ${margemParceiro > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  Margem: {margemParceiro.toFixed(1)}%
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={salvar}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors">
              <Plus size={18} />
              {editandoId ? 'Atualizar Receita' : 'Salvar Receita'}
            </button>
            <button onClick={resetForm}
              className="px-6 py-3 rounded-xl font-medium text-gray-400 hover:text-white border border-gray-700 hover:border-gray-600 transition-colors">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Lista de receitas */}
      <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
        <h3 className="text-lg font-semibold text-white mb-4">
          Receitas Cadastradas ({receitas.length})
        </h3>
        <div className="space-y-3">
          {receitas.map((r) => (
            <div key={r.id}
              className="bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-gray-600 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold text-white">{r.nome}</p>
                  {r.descricao && <p className="text-gray-400 text-sm mt-1">{r.descricao}</p>}
                  <p className="text-gray-500 text-xs mt-1">Rende: {r.rendimento} {r.unidadeRendimento}</p>
                </div>
                <div className="text-right">
                  <p className="text-blue-400 font-bold">R$ {Number(r.precoVendaFinal || 0).toFixed(2)}</p>
                  <p className="text-gray-500 text-xs">Cliente final</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => editar(r)}
                  className="flex-1 flex items-center justify-center gap-1 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 py-2 rounded-lg text-sm transition-colors">
                  <Pencil size={14} /> Editar
                </button>
                <button onClick={() => deletar(r.id)}
                  className="flex-1 flex items-center justify-center gap-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 py-2 rounded-lg text-sm transition-colors">
                  <Trash2 size={14} /> Excluir
                </button>
              </div>
            </div>
          ))}
          {receitas.length === 0 && (
            <p className="text-center text-gray-500 py-10">Nenhuma receita cadastrada.</p>
          )}
        </div>
      </div>

    </div>
  );
}