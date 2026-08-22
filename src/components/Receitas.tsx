import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Calculator, Lightbulb, ChefHat, Package } from 'lucide-react';
import api from '../api';

export default function Receitas() {
  const [receitas, setReceitas] = useState<any[]>([]);
  const [ingredientes, setIngredientes] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);

  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [rendimento, setRendimento] = useState('');
  const [unidadeRendimento, setUnidadeRendimento] = useState('unidades');
  const [maoDeObra, setMaoDeObra] = useState('');
  const [custosFixosPorcentagem, setCustosFixosPorcentagem] = useState('10');
  const [precoVendaFinal, setPrecoVendaFinal] = useState('');
  const [precoVendaParceiro, setPrecoVendaParceiro] = useState('');
  const [editandoId, setEditandoId] = useState<string | null>(null);

  const [ingredientesReceita, setIngredientesReceita] = useState<any[]>([]);
  const [ingSelecionado, setIngSelecionado] = useState('');
  const [ingQuantidade, setIngQuantidade] = useState('');

  const [pesoFatiaSimulada, setPesoFatiaSimulada] = useState('150');

  const [margemSugeridaCliente, setMargemSugeridaCliente] = useState('100');
  const [margemSugeridaParceiro, setMargemSugeridaParceiro] = useState('50');

  async function carregar() {
    try {
      const [r, i] = await Promise.all([
        api.get('/receitas'),
        api.get('/ingredientes'),
      ]);
      setReceitas(r.data);
      setIngredientes(i.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  }

  function adicionarIngrediente() {
    const ing = ingredientes.find((i) => String(i.id) === String(ingSelecionado));
    if (!ing || !ingQuantidade) return;

    const precoBase = Number(ing.precoCompra ?? 0);
    const qtdEmbalagem = Number(ing.quantidadeCompra ?? 1);
    const uniMedida = (ing.unidadeMedida ?? 'kg').toLowerCase().trim();
    const qtdUsada = Number(String(ingQuantidade).replace(',', '.'));

    let custoTotal = 0;
    if (uniMedida === 'un' || uniMedida === 'unid' || uniMedida === 'unidade' || uniMedida === 'unidades') {
      const precoUnitarioItem = precoBase / qtdEmbalagem;
      custoTotal = qtdUsada * precoUnitarioItem;
    } else {
      const precoPorUnidadeMedida = precoBase / qtdEmbalagem;
      custoTotal = qtdUsada * precoPorUnidadeMedida;
    }

    setIngredientesReceita((prev) => [
      ...prev,
      {
        ingredienteId: ing.id,
        nome: ing.nome,
        quantidade: qtdUsada,
        unidade: ing.unidadeMedida ?? 'kg',
        custoUnitario: precoBase,
        custoTotal: Number(custoTotal.toFixed(4)),
      },
    ]);

    setIngSelecionado('');
    setIngQuantidade('');
  }

  function removerIngrediente(index: number) {
    setIngredientesReceita((prev) => prev.filter((_, i) => i !== index));
  }

  const custoIngredientes = ingredientesReceita.reduce((acc, i) => acc + (i.custoTotal || 0), 0);
  const custoFixos = custoIngredientes * (Number(custosFixosPorcentagem) / 100);
  const custoTotal = custoIngredientes + custoFixos + Number(maoDeObra || 0);
  const custoPorUnidade = rendimento ? custoTotal / Number(rendimento) : 0;
  const isPesoGramas = unidadeRendimento === 'gramas';
  const custoFatiaPersonalizada = isPesoGramas ? (custoTotal / Number(rendimento || 1)) * Number(pesoFatiaSimulada) : 0;

  const precoSugeridoClienteInteiro = custoTotal * (1 + Number(margemSugeridaCliente) / 100);
  const precoSugeridoParceiroInteiro = custoTotal * (1 + Number(margemSugeridaParceiro) / 100);
  const precoSugeridoClienteUnitario = custoPorUnidade * (1 + Number(margemSugeridaCliente) / 100);
  const precoSugeridoParceiroUnitario = custoPorUnidade * (1 + Number(margemSugeridaParceiro) / 100);

  const margemFinal = precoVendaFinal ? ((Number(precoVendaFinal) - custoPorUnidade) / Number(precoVendaFinal)) * 100 : 0;
  const margemParceiro = precoVendaParceiro ? ((Number(precoVendaParceiro) - custoPorUnidade) / Number(precoVendaParceiro)) * 100 : 0;

  async function salvar() {
    if (!nome || !rendimento) {
      alert('Preencha nome e rendimento!');
      return;
    }

    const payload = {
      nome,
      descricao,
      rendimento: Number(rendimento),
      unidadeRendimento,
      maoDeObra: Number(maoDeObra || 0),
      custosFixosPorcentagem: Number(custosFixosPorcentagem),
      custoIngredientes: Number(custoIngredientes.toFixed(2)),
      precoVendaFinal: Number(precoVendaFinal || 0),
      precoVendaParceiro: Number(precoVendaParceiro || 0),
      ingredientes: ingredientesReceita.map((i) => ({
        ingredienteId: i.ingredienteId,
        quantidade: i.quantidade,
        unidade: i.unidade,
        custoTotal: i.custoTotal,
      })),
    };

    try {
      if (editandoId !== null) {
        await api.patch(`/receitas/${editandoId}`, payload);
        setEditandoId(null);
      } else {
        await api.post('/receitas', payload);
      }
      resetForm();
      carregar();
      alert('Receita salva com sucesso!');
    } catch (error: any) {
      console.error('Erro ao salvar receita:', error.response?.data || error);
      alert(`Erro ao salvar a receita: ${error.response?.data?.message || 'Verifique o terminal do backend.'}`);
    }
  }

  function resetForm() {
    setNome('');
    setDescricao('');
    setRendimento('');
    setUnidadeRendimento('unidades');
    setMaoDeObra('');
    setCustosFixosPorcentagem('10');
    setPrecoVendaFinal('');
    setPrecoVendaParceiro('');
    setIngredientesReceita([]);
    setShowForm(false);
    setEditandoId(null);
  }

  function editar(r: any) {
    setNome(r.nome);
    setDescricao(r.descricao || '');
    setRendimento(String(r.rendimento));
    setUnidadeRendimento(r.unidadeRendimento || 'unidades');
    setMaoDeObra(String(r.maoDeObra || ''));
    setCustosFixosPorcentagem(String(r.custosFixosPorcentagem || 10));
    setPrecoVendaFinal(String(r.precoVendaFinal || ''));
    setPrecoVendaParceiro(String(r.precoVendaParceiro || ''));

    const ingsMapeados = (r.ingredientes || []).map((i: any) => {
      const ingCompleto = ingredientes.find((ing) => ing.id === i.ingredienteId);
      return {
        ingredienteId: i.ingredienteId,
        nome: ingCompleto?.nome || 'Ingrediente (não encontrado)',
        quantidade: i.quantidade,
        unidade: i.unidade,
        custoTotal: i.custoTotal ?? 0,
      };
    });
    setIngredientesReceita(ingsMapeados);
    setEditandoId(r.id);
    setShowForm(true);
  }

  async function deletar(id: string) {
    if (confirm('Deseja realmente excluir esta receita?')) {
      await api.delete(`/receitas/${id}`);
      carregar();
    }
  }

  useEffect(() => { carregar(); }, []);

  const inputClass =
    'bg-gray-800 border border-gray-700 text-white placeholder-gray-500 p-3 rounded-xl w-full focus:outline-none focus:border-cyan-500 transition-colors text-sm';

  return (
    <div className="space-y-8 w-full"> {/* ALTERADO: Removido max-w-7xl mx-auto para alinhar ao menu */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-3 rounded-xl font-medium transition-all hover:shadow-lg hover:shadow-cyan-500/20 active:scale-95"
        >
          <Plus size={18} /> Nova Receita
        </button>
      )}

      {showForm && (
        <div className="bg-[#0f172a] rounded-2xl p-6 border border-white/10 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-gray-800 pb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <ChefHat size={20} className="text-cyan-400" />
              {editandoId ? 'Editar Receita' : 'Nova Receita'}
            </h3>
            <button onClick={resetForm} className="text-sm text-gray-400 hover:text-white transition-colors">
              Fechar formulário
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <input type="text" placeholder="Nome da receita" value={nome} onChange={(e) => setNome(e.target.value)} className={inputClass} />
            <input type="text" placeholder="Descrição (opcional)" value={descricao} onChange={(e) => setDescricao(e.target.value)} className={inputClass} />
            <input type="number" placeholder="Rendimento (ex: 10)" value={rendimento} onChange={(e) => setRendimento(e.target.value)} className={inputClass} />
            <select value={unidadeRendimento} onChange={(e) => setUnidadeRendimento(e.target.value)} className={inputClass}>
              <option value="unidades">Unidades</option>
              <option value="gramas">Gramas</option>
              <option value="Bolo P">Bolo P</option>
              <option value="Bolo M">Bolo M</option>
              <option value="Bolo G">Bolo G</option>
              <option value="fatias">Fatias</option>
            </select>
            <input type="number" placeholder="Mão de obra R$" value={maoDeObra} onChange={(e) => setMaoDeObra(e.target.value)} className={inputClass} />
            <div className="relative">
              <input type="number" placeholder="% Custos fixos" value={custosFixosPorcentagem} onChange={(e) => setCustosFixosPorcentagem(e.target.value)} className={inputClass} />
              <span className="absolute right-3 top-3.5 text-gray-400">%</span>
            </div>
          </div>

          <div className="bg-gray-800/30 p-4 rounded-xl border border-gray-700/50">
            <h4 className="text-white font-medium mb-3 flex items-center gap-2">
              <Package size={16} className="text-cyan-400" /> Ingredientes da Receita
            </h4>
            <div className="flex flex-col sm:flex-row gap-2 mb-4">
              <select value={ingSelecionado} onChange={(e) => setIngSelecionado(e.target.value)} className="flex-1 bg-gray-800 border border-gray-700 text-white p-3 rounded-xl text-sm focus:border-cyan-500 focus:outline-none">
                <option value="">Selecione o ingrediente</option>
                {ingredientes.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.nome} (R$ {Number(i.precoCompra ?? 0).toFixed(2)} / {i.quantidadeCompra}{i.unidadeMedida ?? 'kg'})
                  </option>
                ))}
              </select>
              <input type="text" placeholder="Qtd" value={ingQuantidade} onChange={(e) => setIngQuantidade(e.target.value)} className="w-full sm:w-28 bg-gray-800 border border-gray-700 text-white p-3 rounded-xl text-sm focus:border-cyan-500 focus:outline-none" />
              <button onClick={adicionarIngrediente} className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 rounded-xl transition-colors flex items-center justify-center">
                <Plus size={18} />
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {ingredientesReceita.map((i, index) => (
                <div key={index} className="flex justify-between items-center bg-gray-800 rounded-lg p-3 border border-gray-700 group hover:border-gray-600 transition-colors">
                  <div>
                    <p className="text-white text-sm font-medium">{i.nome}</p>
                    <p className="text-gray-400 text-xs">
                      {i.quantidade} {i.unidade} → <span className="text-amber-400 font-medium">R$ {Number(i.custoTotal ?? 0).toFixed(2)}</span>
                    </p>
                  </div>
                  <button onClick={() => removerIngrediente(index)} className="text-gray-500 hover:text-red-400 transition-colors p-1">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {ingredientesReceita.length === 0 && (
                <p className="text-center text-gray-500 text-sm py-4 italic">Nenhum ingrediente adicionado.</p>
              )}
            </div>
          </div>

          {custoIngredientes > 0 && (
            <div className="bg-gray-800/30 rounded-xl p-5 border border-gray-700/50 space-y-4">
              <h4 className="text-white font-medium flex items-center gap-2">
                <Calculator size={16} className="text-cyan-400" /> Resumo de Custos
              </h4>
              <div className="text-sm space-y-2">
                <div className="flex justify-between text-gray-400"><span>Insumos</span><span>R$ {custoIngredientes.toFixed(2)}</span></div>
                <div className="flex justify-between text-gray-400"><span>Custos fixos ({custosFixosPorcentagem}%)</span><span>R$ {custoFixos.toFixed(2)}</span></div>
                <div className="flex justify-between text-gray-400"><span>Mão de obra</span><span>R$ {Number(maoDeObra || 0).toFixed(2)}</span></div>
                <div className="flex justify-between text-white font-bold border-t border-gray-700 pt-3 mt-3 text-base">
                  <span>Custo Total da Receita</span><span className="text-amber-400">R$ {custoTotal.toFixed(2)}</span>
                </div>
                {rendimento && (
                  <div className="border-t border-gray-700/50 pt-3 mt-3 space-y-2">
                    {isPesoGramas ? (
                      <>
                        <div className="flex justify-between text-sky-400"><span>Custo 100g</span><span>R$ {((custoTotal / Number(rendimento)) * 100).toFixed(2)}</span></div>
                        <div className="flex justify-between items-center gap-4 text-blue-400 font-bold bg-[#0f172a] p-3 rounded-lg border border-gray-700">
                          <span>Fatia de</span>
                          <input type="number" value={pesoFatiaSimulada} onChange={(e) => setPesoFatiaSimulada(e.target.value)} className="w-16 bg-gray-800 border border-gray-600 rounded text-center text-white text-sm p-1 focus:border-cyan-500 focus:outline-none" />
                          <span>g</span>
                          <span className="text-lg">R$ {custoFatiaPersonalizada.toFixed(2)}</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex justify-between text-blue-400 font-bold bg-[#0f172a] p-3 rounded-lg border border-gray-700">
                        <span>Custo por unidade</span>
                        <span className="text-lg">R$ {custoPorUnidade.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="border-t border-gray-700 pt-4 mt-4 space-y-4">
                <h4 className="text-white font-medium flex items-center gap-2">
                  <Lightbulb size={16} className="text-yellow-400" /> Precificação Sugerida
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-2 bg-[#0f172a] p-2.5 rounded-lg border border-gray-700">
                    <span className="text-gray-400">Margem Cliente:</span>
                    <input type="number" value={margemSugeridaCliente} onChange={(e) => setMargemSugeridaCliente(e.target.value)} className="w-14 bg-gray-800 border border-gray-600 rounded text-center text-white p-1 focus:border-cyan-500 focus:outline-none" />
                    <span className="text-gray-400">%</span>
                  </div>
                  <div className="flex items-center gap-2 bg-[#0f172a] p-2.5 rounded-lg border border-gray-700">
                    <span className="text-gray-400">Margem Parceiro:</span>
                    <input type="number" value={margemSugeridaParceiro} onChange={(e) => setMargemSugeridaParceiro(e.target.value)} className="w-14 bg-gray-800 border border-gray-600 rounded text-center text-white p-1 focus:border-cyan-500 focus:outline-none" />
                    <span className="text-gray-400">%</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-emerald-500/5 p-4 rounded-lg border border-emerald-500/20 space-y-2">
                    <p className="text-[11px] uppercase tracking-wide text-emerald-400 font-bold">Cliente Final</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-400">Receita Inteira:</span>
                      <span className="text-base font-bold text-emerald-400">R$ {precoSugeridoClienteInteiro.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-400">{isPesoGramas ? `p/ Fatia (${pesoFatiaSimulada}g):` : 'p/ Unidade:'}</span>
                      <span className="text-base font-bold text-emerald-400">
                        R$ {isPesoGramas ? ((custoTotal / Number(rendimento)) * Number(pesoFatiaSimulada) * (1 + Number(margemSugeridaCliente) / 100)).toFixed(2) : precoSugeridoClienteUnitario.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="bg-blue-500/5 p-4 rounded-lg border border-blue-500/20 space-y-2">
                    <p className="text-[11px] uppercase tracking-wide text-blue-400 font-bold">Parceiro / Café</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-400">Receita Inteira:</span>
                      <span className="text-base font-bold text-blue-400">R$ {precoSugeridoParceiroInteiro.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-400">{isPesoGramas ? `p/ Fatia (${pesoFatiaSimulada}g):` : 'p/ Unidade:'}</span>
                      <span className="text-base font-bold text-blue-400">
                        R$ {isPesoGramas ? ((custoTotal / Number(rendimento)) * Number(pesoFatiaSimulada) * (1 + Number(margemSugeridaParceiro) / 100)).toFixed(2) : precoSugeridoParceiroUnitario.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-gray-500 italic text-center">
                  Sugestões baseadas no custo + margem. Ajuste manualmente nos campos abaixo se necessário.
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-gray-400 text-sm mb-1.5 block font-medium">Preço Comercial Cliente Final (R$)</label>
              <input type="number" value={precoVendaFinal} onChange={(e) => setPrecoVendaFinal(e.target.value)} className={inputClass} />
              {precoVendaFinal && (
                <p className={`text-xs mt-1.5 font-medium ${margemFinal > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  Margem sobre custo: {margemFinal.toFixed(1)}%
                </p>
              )}
            </div>
            <div>
              <label className="text-gray-400 text-sm mb-1.5 block font-medium">Preço Comercial Parceiro/Café (R$)</label>
              <input type="number" value={precoVendaParceiro} onChange={(e) => setPrecoVendaParceiro(e.target.value)} className={inputClass} />
              {precoVendaParceiro && (
                <p className={`text-xs mt-1.5 font-medium ${margemParceiro > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  Margem sobre custo: {margemParceiro.toFixed(1)}%
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-800">
            <button onClick={salvar} className="flex-1 flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-3 rounded-xl font-medium transition-all active:scale-95">
              <Plus size={18} /> {editandoId ? 'Atualizar Receita' : 'Salvar Receita'}
            </button>
            <button onClick={resetForm} className="px-6 py-3 rounded-xl font-medium text-gray-400 hover:text-white border border-gray-700 hover:bg-gray-800 transition-all">
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="bg-[#0f172a] rounded-2xl p-6 border border-white/10 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <ChefHat size={20} className="text-cyan-400" />
            Receitas Cadastradas
            <span className="bg-cyan-500/20 text-cyan-400 text-xs px-2.5 py-0.5 rounded-full font-bold">
              {receitas.length}
            </span>
          </h3>
        </div>

        {receitas.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-gray-700 rounded-xl bg-gray-800/20">
            <Package size={40} className="mx-auto text-gray-600 mb-3" />
            <p className="text-gray-400 font-medium">Nenhuma receita cadastrada ainda.</p>
            <p className="text-gray-500 text-sm mt-1">Clique em "Nova Receita" para começar.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {receitas.map((r) => {
              const cIng = (r.ingredientes || []).reduce((acc: number, i: any) => acc + (i.custoTotal || 0), 0);
              const cFix = cIng * ((r.custosFixosPorcentagem || 10) / 100);
              const cTotal = cIng + cFix + Number(r.maoDeObra || 0);

              return (
                <div key={r.id} className="bg-gray-800/40 hover:bg-gray-800 border border-gray-700/50 hover:border-cyan-500/40 rounded-xl p-4 transition-all duration-200 group flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-semibold text-white text-sm truncate pr-2 flex-1" title={r.nome}>
                      {r.nome}
                    </h4>
                    <div className="flex gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => editar(r)} className="p-1.5 hover:bg-yellow-500/20 text-yellow-400 rounded-lg transition-colors" title="Editar">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => deletar(r.id)} className="p-1.5 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors" title="Excluir">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="bg-[#0f172a] p-2.5 rounded-lg border border-gray-700/50">
                      <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Custo Total</p>
                      <p className="text-amber-400 font-bold text-sm">R$ {cTotal.toFixed(2)}</p>
                    </div>
                    <div className="bg-[#0f172a] p-2.5 rounded-lg border border-gray-700/50">
                      <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Preço Venda</p>
                      <p className="text-emerald-400 font-bold text-sm">R$ {Number(r.precoVendaFinal || 0).toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="mt-auto pt-3 border-t border-gray-700/50 flex justify-between items-center text-xs">
                    <span className="flex items-center gap-1.5 text-gray-400 bg-gray-800 px-2 py-1 rounded-md">
                      <Package size={12} />
                      {r.rendimento} {r.unidadeRendimento}
                    </span>
                    {r.precoVendaParceiro > 0 && (
                      <span className="text-blue-400 font-semibold bg-blue-500/10 px-2 py-1 rounded-md">
                        Parceiro: R$ {Number(r.precoVendaParceiro).toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}