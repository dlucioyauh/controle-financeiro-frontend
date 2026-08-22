import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Package } from 'lucide-react';
import api from '../api';

const unidades = ['kg', 'g', 'litro', 'ml', 'un', 'unidades'];

export default function Ingredientes() {
  const [ingredientes, setIngredientes] = useState<any[]>([]);
  const [nome, setNome] = useState('');
  const [precoCompra, setPrecoCompra] = useState('');
  const [quantidadeCompra, setQuantidadeCompra] = useState('1');
  const [unidadeMedida, setUnidadeMedida] = useState('kg');
  const [editandoId, setEditandoId] = useState<number | null>(null);

  async function carregar() {
    try {
      const r = await api.get('/ingredientes');
      setIngredientes(r.data);
    } catch (error) {
      console.error("Erro ao carregar ingredientes:", error);
    }
  }

  function resetForm() {
    setNome('');
    setPrecoCompra('');
    setQuantidadeCompra('1');
    setUnidadeMedida('kg');
    setEditandoId(null);
  }

  async function salvar() {
    if (!nome || !precoCompra || !quantidadeCompra) {
      alert('Preencha os campos obrigatórios (Nome, Preço e Quantidade)!');
      return;
    }

    const payload = {
      nome: nome.trim(),
      precoCompra: Number(String(precoCompra).replace(',', '.')),
      quantidadeCompra: Number(String(quantidadeCompra).replace(',', '.')),
      unidadeMedida: (unidadeMedida || 'kg').toLowerCase().trim(),
    };

    try {
      if (editandoId !== null) {
        await api.patch(`/ingredientes/${editandoId}`, payload);
        setEditandoId(null);
      } else {
        await api.post('/ingredientes', payload);
      }
      resetForm();
      carregar();
      alert('Ingrediente salvo com sucesso!');
    } catch (error: any) {
      console.error("Erro detalhado ao salvar ingrediente:", error.response?.data || error);
      alert(`Erro ao salvar ingrediente: ${error.response?.data?.message || 'Verifique os dados informados.'}`);
    }
  }

  async function deletar(id: number) {
    if (confirm('Deseja realmente excluir este ingrediente?')) {
      await api.delete(`/ingredientes/${id}`);
      carregar();
    }
  }

  function editar(i: any) {
    setNome(i.nome);
    setPrecoCompra(String(i.precoCompra ?? i.preco ?? ''));
    setQuantidadeCompra(String(i.quantidadeCompra ?? '1'));
    setUnidadeMedida(i.unidadeMedida ?? i.unidade ?? 'kg');
    setEditandoId(i.id);
  }

  useEffect(() => { carregar(); }, []);

  const inputClass = "bg-gray-800 border border-gray-700 text-white placeholder-gray-500 p-3 rounded-xl w-full focus:outline-none focus:border-cyan-500 transition-colors text-sm";

  return (
    <div className="space-y-8 w-full">
      {/* Formulário */}
      <div className="bg-[#0f172a] rounded-2xl p-6 border border-white/10 shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-6">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Package size={20} className="text-cyan-400" />
            {editandoId ? 'Editar Ingrediente' : 'Novo Ingrediente'}
          </h3>
          {editandoId && (
            <button onClick={resetForm} className="text-sm text-gray-400 hover:text-white transition-colors">
              Cancelar edição
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 uppercase mb-1.5 tracking-wide">Nome</label>
            <input type="text" placeholder="Ex: Chocolate, Farinha"
              value={nome} onChange={(e) => setNome(e.target.value)}
              className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 uppercase mb-1.5 tracking-wide">Preço de Compra (R$)</label>
            <input type="text" placeholder="0.00"
              value={precoCompra} onChange={(e) => setPrecoCompra(e.target.value)}
              className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 uppercase mb-1.5 tracking-wide">Qtd. Embalagem</label>
            <input type="text" placeholder="Ex: 1, 500"
              value={quantidadeCompra} onChange={(e) => setQuantidadeCompra(e.target.value)}
              className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 uppercase mb-1.5 tracking-wide">Unidade de Medida</label>
            <select value={unidadeMedida} onChange={(e) => setUnidadeMedida(e.target.value)} className={inputClass}>
              {unidades.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="flex gap-3 mt-6 pt-4 border-t border-gray-800">
          <button 
            onClick={salvar} 
            disabled={!nome || !precoCompra || !quantidadeCompra}
            className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-medium text-sm transition-all active:scale-95"
          >
            <Plus size={16} />
            {editandoId ? 'Atualizar Ingrediente' : 'Salvar Ingrediente'}
          </button>
          {editandoId && (
            <button 
              onClick={resetForm}
              className="px-6 py-3 rounded-xl font-medium text-sm text-gray-400 hover:text-white border border-gray-700 hover:bg-gray-800 transition-colors"
            >
              Cancelar
            </button>
          )}
        </div>
      </div>

      {/* Lista */}
      <div className="bg-[#0f172a] rounded-2xl p-6 border border-white/10 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Package size={20} className="text-cyan-400" />
            Ingredientes Cadastrados
            <span className="bg-cyan-500/20 text-cyan-400 text-xs px-2.5 py-0.5 rounded-full font-bold">
              {ingredientes.length}
            </span>
          </h3>
        </div>

        {ingredientes.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-gray-700 rounded-xl bg-gray-800/20">
            <Package size={40} className="mx-auto text-gray-600 mb-3" />
            <p className="text-gray-400 font-medium">Nenhum ingrediente cadastrado ainda.</p>
            <p className="text-gray-500 text-sm mt-1">Preencha o formulário acima para adicionar.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-800">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="text-xs text-gray-400 uppercase bg-gray-900/50 border-b border-gray-800">
                <tr>
                  <th className="py-3 px-4 font-semibold">Nome</th>
                  <th className="py-3 px-4 font-semibold">Preço de Compra</th>
                  <th className="py-3 px-4 font-semibold">Qtd. Embalagem</th>
                  <th className="py-3 px-4 font-semibold">Unidade</th>
                  <th className="py-3 px-4 text-right font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50 bg-[#0f172a]">
                {ingredientes.map((i) => (
                  <tr key={i.id} className="hover:bg-gray-800/40 transition-colors group">
                    <td className="py-3 px-4 font-medium text-white">{i.nome}</td>
                    <td className="py-3 px-4 text-emerald-400 font-bold">
                      R$ {Number(i.precoCompra ?? 0).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-gray-300">{i.quantidadeCompra ?? 1}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        {i.unidadeMedida}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex gap-1 justify-end opacity-60 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => editar(i)}
                          className="p-1.5 hover:bg-yellow-500/20 text-yellow-400 rounded-lg transition-colors" 
                          title="Editar"
                        >
                          <Pencil size={14} />
                        </button>
                        <button 
                          onClick={() => deletar(i.id)}
                          className="p-1.5 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors" 
                          title="Excluir"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}