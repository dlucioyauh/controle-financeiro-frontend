import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Calculator, Lightbulb } from 'lucide-react';
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

  // Margens sugeridas (editáveis)
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

  // Preços sugeridos para a receita INTEIRA
  const precoSugeridoClienteInteiro = custoTotal * (1 + Number(margemSugeridaCliente) / 100);
  const precoSugeridoParceiroInteiro = custoTotal * (1 + Number(margemSugeridaParceiro) / 100);

  // Preços sugeridos por UNIDADE
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
    'bg-gray-800 border border-gray-700 text-white placeholder-gray-500 p-3 rounded-xl w-full focus:outline-none focus:border-blue-500 transition-colors text-sm';

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

      {showForm && (
        <div className="bg-[#0f172a] rounded-2xl p-6 border border-white/10 space-y-6">
          <h3 className="text-lg font-semibold text-white">
            {editandoId ? '✏ Editar Receita' : '➕ Nova Receita'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input type="text" placeholder="Nome da receita" value={nome}
              onChange={(e) => setNome(e.target.value)} className={inputClass} />
            <input type="text" placeholder="Descrição (opcional)" value={descricao}
              onChange={(e) => setDescricao(e.target.value)} className={inputClass} />
            <input type="number" placeholder="Rendimento" value={rendimento}
              onChange={(e) => setRendimento(e.target.value)} className={inputClass} />
            <select value={unidadeRendimento} onChange={(e) => setUnidadeRendimento(e.target.value)} className={inputClass}>
              <option value="unidades">Unidades</option>
              <option value="gramas">Gramas</option>
              <option value="Bolo P">Bolo P</option>
              <option value="Bolo M">Bolo M</option>
              <option value="Bolo G">Bolo G</option>
              <option value="fatias">Fatias</option>
            </select>
            <input type="number" placeholder="Mão de obra R$" value={maoDeObra}
              onChange={(e) => setMaoDeObra(e.target.value)} className={inputClass} />
            <div className="relative">
              <input type="number" placeholder="% Custos fixos" value={custosFixosPorcentagem}
                onChange={(e) => setCustosFixosPorcentagem(e.target.value)} className={inputClass} />
              <span className="absolute right-3 top-3.5 text-gray-400">%</span>
            </div>
          </div>

          {/* Ingredientes */}
          <div>
            <h4 className="text-white font-medium mb-3">Ingredientes da Receita</h4>
            <div className="flex gap-2 mb-3">
              <select value={ingSelecionado} onChange={(e) => setIngSelecionado(e.target.value)}
                className="flex-1 bg-gray-800 border border-gray-700 text-white p-3 rounded-xl text-sm">
                <option value="">Selecione o ingrediente</option>
                {ingredientes.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.nome} (R$ {Number(i.precoCompra ?? 0).toFixed(2)} / {i.quantidadeCompra}{i.unidadeMedida ?? 'kg'})
                  </option>
                ))}
              </select>
              <input type="text" placeholder="Qtd" value={ingQuantidade}
                onChange={(e) => setIngQuantidade(e.target.value)}
                className="w-28 bg-gray-800 border border-gray-700 text-white p-3 rounded-xl text-sm" />
              <button onClick={adicionarIngrediente}
                className="bg-green-600 hover:bg-green-700 text-white px-4 rounded-xl">
                <Plus size={18} />
              </button>
            </div>

            {ingredientesReceita.map((i, index) => (
              <div key={index} className="flex justify-between items-center bg-gray-800 rounded-xl p-3 mb-2 border border-gray-700">
                <div>
                  <p className="text-white text-sm font-medium">{i.nome}</p>
                  <p className="text-gray-400 text-xs">
                    {i.quantidade} {i.unidade} → R$ {Number(i.custoTotal ?? 0).toFixed(2)}
                  </p>
                </div>
                <button onClick={() => removerIngrediente(index)} className="text-red-400 hover:text-red-300">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          {/* Resumo de custos + Preços sugeridos */}
          {custoIngredientes > 0 && (
            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 space-y-3">
              <h4 className="text-white font-medium flex items-center gap-2">
                <Calculator size={16} /> Resumo de Custos
              </h4>
              <div className="text-sm space-y-1">
                <div className="flex justify-between text-gray-400"><span>Insumos</span><span>R$ {custoIngredientes.toFixed(2)}</span></div>
                <div className="flex justify-between text-gray-400"><span>Custos fixos ({custosFixosPorcentagem}%)</span><span>R$ {custoFixos.toFixed(2)}</span></div>
                <div className="flex justify-between text-gray-400"><span>Mão de obra</span><span>R$ {Number(maoDeObra || 0).toFixed(2)}</span></div>
                <div className="flex justify-between text-white font-bold border-t border-gray-700 pt-2 mt-2">
                  <span>Custo Total da Receita</span><span className="text-amber-400">R$ {custoTotal.toFixed(2)}</span>
                </div>
                {rendimento && (
                  <div className="border-t border-gray-700/50 pt-2 mt-2 space-y-1">
                    {isPesoGramas ? (
                      <>
                        <div className="flex justify-between text-sky-400"><span>Custo 100g</span><span>R$ {((custoTotal / Number(rendimento)) * 100).toFixed(2)}</span></div>
                        <div className="flex justify-between items-center gap-4 text-blue-400 font-bold bg-[#0f172a]/40 p-2 rounded-lg">
                          <span>Fatia de</span>
                          <input type="number" value={pesoFatiaSimulada} onChange={(e) => setPesoFatiaSimulada(e.target.value)}
                            className="w-12 bg-gray-800 border border-gray-700 rounded text-center text-white text-xs p-0.5" />
                          <span>g</span>
                          <span>R$ {custoFatiaPersonalizada.toFixed(2)}</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex justify-between text-blue-400 font-bold">
                        <span>Custo por unidade</span>
                        <span>R$ {custoPorUnidade.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 🔥 NOVA SEÇÃO: Preços Sugeridos (Inteiro + Unitário) */}
              <div className="border-t border-gray-700 pt-3 mt-3 space-y-3">
                <h4 className="text-white font-medium flex items-center gap-2">
                  <Lightbulb size={16} className="text-yellow-400" /> Precificação Sugerida
                </h4>

                {/* Margens configuráveis */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-2 bg-[#0f172a]/60 p-2 rounded-lg">
                    <span className="text-gray-400">Margem Cliente:</span>
                    <input type="number" value={margemSugeridaCliente}
                      onChange={(e) => setMargemSugeridaCliente(e.target.value)}
                      className="w-14 bg-gray-800 border border-gray-700 rounded text-center text-white p-1" />
                    <span className="text-gray-400">%</span>
                  </div>
                  <div className="flex items-center gap-2 bg-[#0f172a]/60 p-2 rounded-lg">
                    <span className="text-gray-400">Margem Parceiro:</span>
                    <input type="number" value={margemSugeridaParceiro}
                      onChange={(e) => setMargemSugeridaParceiro(e.target.value)}
                      className="w-14 bg-gray-800 border border-gray-700 rounded text-center text-white p-1" />
                    <span className="text-gray-400">%</span>
                  </div>
                </div>

                {/* Cards de preços sugeridos */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Cliente Final */}
                  <div className="bg-[#0f172a]/60 p-3 rounded-lg border border-gray-700/50 space-y-2">
                    <p className="text-[11px] uppercase tracking-wide text-gray-400 font-medium">Cliente Final</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-400">Receita Inteira:</span>
                      <span className="text-sm font-bold text-emerald-400">
                        R$ {precoSugeridoClienteInteiro.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-400">
                        {isPesoGramas ? 'p/ Fatia (' + pesoFatiaSimulada + 'g):' : 'p/ Unidade:'}
                      </span>
                      <span className="text-sm font-bold text-emerald-400">
                        R$ {isPesoGramas ? ((custoTotal / Number(rendimento)) * Number(pesoFatiaSimulada) * (1 + Number(margemSugeridaCliente) / 100)).toFixed(2) : precoSugeridoClienteUnitario.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Parceiro */}
                  <div className="bg-[#0f172a]/60 p-3 rounded-lg border border-gray-700/50 space-y-2">
                    <p className="text-[11px] uppercase tracking-wide text-gray-400 font-medium">Parceiro / Café</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-400">Receita Inteira:</span>
                      <span className="text-sm font-bold text-blue-400">
                        R$ {precoSugeridoParceiroInteiro.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-400">
                        {isPesoGramas ? 'p/ Fatia (' + pesoFatiaSimulada + 'g):' : 'p/ Unidade:'}
                      </span>
                      <span className="text-sm font-bold text-blue-400">
                        R$ {isPesoGramas ? ((custoTotal / Number(rendimento)) * Number(pesoFatiaSimulada) * (1 + Number(margemSugeridaParceiro) / 100)).toFixed(2) : precoSugeridoParceiroUnitario.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-gray-500 italic">
                  Os preços acima são sugestões baseadas no custo + margem. Você pode usá-los como referência ou ajustar manualmente abaixo.
                </p>
              </div>
            </div>
          )}

          {/* Preços de venda manuais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Preço Comercial Cliente Final (R$)</label>
              <input type="number" value={precoVendaFinal}
                onChange={(e) => setPrecoVendaFinal(e.target.value)} className={inputClass} />
              {precoVendaFinal && (
                <p className={`text-xs mt-1 ${margemFinal > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  Margem sobre custo: {margemFinal.toFixed(1)}%
                </p>
              )}
            </div>
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Preço Comercial Parceiro/Café (R$)</label>
              <input type="number" value={precoVendaParceiro}
                onChange={(e) => setPrecoVendaParceiro(e.target.value)} className={inputClass} />
              {precoVendaParceiro && (
                <p className={`text-xs mt-1 ${margemParceiro > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  Margem sobre custo: {margemParceiro.toFixed(1)}%
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={salvar} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium">
              <Plus size={18} /> {editandoId ? 'Atualizar' : 'Salvar'}
            </button>
            <button onClick={resetForm} className="px-6 py-3 rounded-xl font-medium text-gray-400 hover:text-white border border-gray-700">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Lista de receitas cadastradas */}
      <div className="bg-[#0f172a] rounded-2xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Receitas Cadastradas ({receitas.length})</h3>
        <div className="space-y-3">
          {receitas.map((r) => {
            const cIng = (r.ingredientes || []).reduce((acc: number, i: any) => acc + (i.custoTotal || 0), 0);
            const cFix = cIng * ((r.custosFixosPorcentagem || 10) / 100);
            const cTotal = cIng + cFix + Number(r.maoDeObra || 0);
            const cUnid = r.rendimento ? cTotal / r.rendimento : 0;
            return (
              <div key={r.id} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-semibold text-white">{r.nome}</p>
                    <p className="text-xs text-gray-400">Rendimento: {r.rendimento} {r.unidadeRendimento}</p>
                    <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 bg-[#0f172a]/50 p-2.5 rounded-lg border border-gray-700/40 w-fit text-xs">
                      <p className="text-gray-400">Custo Receita: <span className="text-amber-400 font-bold">R$ {cTotal.toFixed(2)}</span></p>
                      {r.unidadeRendimento === 'gramas' ? (
                        <p className="text-gray-400">Custo p/ Fatia (150g): <span className="text-blue-400 font-bold">R$ {(cUnid * 150).toFixed(2)}</span></p>
                      ) : (
                        <p className="text-gray-400">Custo Unitário: <span className="text-blue-400 font-bold">R$ {cUnid.toFixed(2)}</span></p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-emerald-400 font-bold text-lg">R$ {Number(r.precoVendaFinal || 0).toFixed(2)}</p>
                    {r.precoVendaParceiro > 0 && <p className="text-xs text-gray-400">Parceiro: R$ {Number(r.precoVendaParceiro).toFixed(2)}</p>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => editar(r)} className="flex-1 flex items-center justify-center gap-1 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 py-2 rounded-lg text-sm">
                    <Pencil size={14} /> Editar
                  </button>
                  <button onClick={() => deletar(r.id)} className="flex-1 flex items-center justify-center gap-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 py-2 rounded-lg text-sm">
                    <Trash2 size={14} /> Excluir
                  </button>
                </div>
              </div>
            );
          })}
          {receitas.length === 0 && <p className="text-center text-gray-500 py-10">Nenhuma receita cadastrada.</p>}
        </div>
      </div>
    </div>
  );
}