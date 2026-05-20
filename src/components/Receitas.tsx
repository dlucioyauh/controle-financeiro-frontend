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

  // Estado auxiliar para simular fatias de bolo no resumo de custos
  const [pesoFatiaSimulada, setPesoFatiaSimulada] = useState('150');

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

  // Lógica de Precificação Inteligente
  const custoIngredientes = ingredientesReceita.reduce((acc, i) => acc + i.custoTotal, 0);
  const custoFixos = custoIngredientes * (Number(custosFixosPorcentagem) / 100);
  const custoTotal = custoIngredientes + custoFixos + Number(maoDeObra || 0);
  
  // Calcula o custo base por unidade ou por grama
  const custoPorUnidade = rendimento ? custoTotal / Number(rendimento) : 0;

  // Se for bolo por peso em gramas, calcula custo de fatias comuns (100g e 150g)
  const isPesoGramas = unidadeRendimento === 'gramas';
  const custoFatiaPersonalizada = isPesoGramas ? (custoTotal / Number(rendimento || 1)) * Number(pesoFatiaSimulada) : 0;

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
        <div className="bg-[#0f172a] rounded-2xl p-6 border border-gray-800 space-y-6">
          <h3 className="text-lg font-semibold text-white">
            {editandoId ? '✏️ Editar Receita' : '➕ Nova Receita'}
          </h3>

          {/* Dados básicos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input type="text" placeholder="Nome da receita (ex: Brownie Tradicional, Bolo de Cenoura)" value={nome}
              onChange={(e) => setNome(e.target.value)} className={inputClass} />
            <input type="text" placeholder="Descrição (opcional)" value={descricao}
              onChange={(e) => setDescricao(e.target.value)} className={inputClass} />
            
            <input 
              type="number" 
              placeholder={unidadeRendimento === 'gramas' ? "Peso total da receita pronta (em gramas)" : "Quantidade total de rendimento"} 
              value={rendimento}
              onChange={(e) => setRendimento(e.target.value)} 
              className={inputClass} 
            />
            
            <select value={unidadeRendimento} onChange={(e) => setUnidadeRendimento(e.target.value)} className={inputClass}>
              <option value="unidades">Unidades Individuais (Ex: Brownies, Brigadeiros)</option>
              <option value="gramas">Peso em Gramas (Ex: Bolos Inteiros, Tortas por Peso)</option>
              <option value="Bolo P">Bolo Tamanho P</option>
              <option value="Bolo M">Bolo Tamanho M</option>
              <option value="Bolo G">Bolo Tamanho G</option>
              <option value="fatias">Fatias Prontas</option>
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

          {/* Resumo de custos Inteligente */}
          {custoIngredientes > 0 && (
            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 space-y-2">
              <h4 className="text-white font-medium flex items-center gap-2">
                <Calculator size={16} /> Resumo Analítico de Custos
              </h4>
              <div className="text-sm space-y-1">
                <div className="flex justify-between text-gray-400">
                  <span>Custo Bruto dos Ingredientes</span>
                  <span>R$ {custoIngredientes.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Custos fixos adicionais ({custosFixosPorcentagem}%)</span>
                  <span>R$ {custoFixos.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Mão de Obra aplicada</span>
                  <span>R$ {Number(maoDeObra || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-white font-bold border-t border-gray-700 pt-2 mt-2">
                  <span>Custo Total da Receita Completa</span>
                  <span className="text-lg text-amber-400">R$ {custoTotal.toFixed(2)}</span>
                </div>

                {/* Condicional para cálculo de Unidades vs Peso de Bolos */}
                {rendimento && (
                  <div className="border-t border-gray-700/50 pt-2 mt-2 space-y-1">
                    {isPesoGramas ? (
                      <>
                        <div className="flex justify-between text-sky-400 font-medium">
                          <span>Custo a cada 100g de Bolo</span>
                          <span>R$ {((custoTotal / Number(rendimento)) * 100).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center gap-4 text-blue-400 font-bold bg-[#0f172a]/40 p-2 rounded-lg mt-1">
                          <div className="flex items-center gap-1">
                            <span>Custo por fatia de</span>
                            <input 
                              type="number" 
                              value={pesoFatiaSimulada} 
                              onChange={(e) => setPesoFatiaSimulada(e.target.value)} 
                              className="w-12 bg-gray-800 border border-gray-700 rounded text-center text-white text-xs p-0.5 focus:outline-none"
                            />
                            <span>g</span>
                          </div>
                          <span>R$ {custoFatiaPersonalizada.toFixed(2)}</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex justify-between text-blue-400 font-bold">
                        <span>Custo Real por Unidade / Item ({unidadeRendimento})</span>
                        <span>R$ {custoPorUnidade.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Preços de venda */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Preço Comercial Cliente Final (R$)</label>
              <input type="number" value={precoVendaFinal}
                onChange={(e) => setPrecoVendaFinal(e.target.value)} className={inputClass} />
              {precoVendaFinal && (
                <p className={`text-xs mt-1 ${margemFinal > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  Margem sobre Custo Base: {margemFinal.toFixed(1)}%
                </p>
              )}
            </div>
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Preço Comercial Parceiro/Café (R$)</label>
              <input type="number" value={precoVendaParceiro}
                onChange={(e) => setPrecoVendaParceiro(e.target.value)} className={inputClass} />
              {precoVendaParceiro && (
                <p className={`text-xs mt-1 ${margemParceiro > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  Margem sobre Custo Base: {margemParceiro.toFixed(1)}%
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
      <div className="bg-[#0f172a] rounded-2xl p-6 border border-gray-800">
        <h3 className="text-lg font-semibold text-white mb-4">
          Receitas Cadastradas ({receitas.length})
        </h3>
        <div className="space-y-3">
          {receitas.map((r) => {
            // Cálculo dinâmico para exibição nos cards da lista
            const cIng = (r.ingredientes || []).reduce((acc: number, i: any) => acc + (i.custoTotal || 0), 0);
            const cFix = cIng * ((r.custosFixosPorcentagem || 10) / 100);
            const cTotal = cIng + cFix + Number(r.maoDeObra || 0);
            const cUnid = r.rendimento ? cTotal / r.rendimento : 0;

            return (
              <div key={r.id}
                className="bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-gray-600 transition-colors">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-3">
                  <div>
                    <p className="font-semibold text-white text-base">{r.nome}</p>
                    {r.descricao && <p className="text-gray-400 text-sm mt-0.5">{r.descricao}</p>}
                    <p className="text-gray-500 text-xs mt-1">
                      Rendimento: <span className="text-gray-300 font-medium">{r.rendimento} {r.unidadeRendimento}</span>
                    </p>
                    
                    {/* Exibição Analítica de Custos no Card */}
                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 bg-[#0f172a]/50 p-2.5 rounded-lg border border-gray-700/40 w-fit">
                      <p className="text-[11px] text-gray-400">
                        Custo Receita: <span className="text-amber-400 font-bold">R$ {cTotal.toFixed(2)}</span>
                      </p>
                      {r.unidadeRendimento === 'gramas' ? (
                        <p className="text-[11px] text-gray-400">
                          Custo p/ Fatia (150g): <span className="text-blue-400 font-bold">R$ {(cUnid * 150).toFixed(2)}</span>
                        </p>
                      ) : (
                        <p className="text-[11px] text-gray-400">
                          Custo Unitário: <span className="text-blue-400 font-bold">R$ {cUnid.toFixed(2)}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-left sm:text-right whitespace-nowrap">
                    <p className="text-emerald-400 font-bold text-lg">R$ {Number(r.precoVendaFinal || 0).toFixed(2)}</p>
                    <p className="text-gray-500 text-xs">Venda Cliente Final</p>
                    {r.precoVendaParceiro > 0 && (
                      <p className="text-gray-400 text-xs mt-1">
                        Parceiro: <span className="text-zinc-300 font-medium">R$ {Number(r.precoVendaParceiro).toFixed(2)}</span>
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2 mt-4">
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
            );
          })}
          {receitas.length === 0 && (
            <p className="text-center text-gray-500 py-10">Nenhuma receita cadastrada.</p>
          )}
        </div>
      </div>

    </div>
  );
}