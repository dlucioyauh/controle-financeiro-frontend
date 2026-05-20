import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import api from '../api';

const unidades = ['kg', 'g', 'litro', 'ml', 'un'];

export default function Ingredientes() {
  const [ingredientes, setIngredientes] = useState<any[]>([]);
  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');
  const [unidade, setUnidade] = useState('kg');
  const [editandoId, setEditandoId] = useState<number | null>(null);

  async function carregar() {
    const r = await api.get('/ingredientes');
    setIngredientes(r.data);
  }

  async function salvar() {
    if (!nome || !preco) {
      alert('Preencha nome e preço!');
      return;
    }
    const payload = { nome, preco: Number(preco), unidade };
    if (editandoId !== null) {
      await api.put(`/ingredientes/${editandoId}`, payload);
      setEditandoId(null);
    } else {
      await api.post('/ingredientes', payload);
    }
    setNome(''); setPreco(''); setUnidade('kg');
    carregar();
  }

  async function deletar(id: number) {
    await api.delete(`/ingredientes/${id}`);
    carregar();
  }

  function editar(i: any) {
    setNome(i.nome);
    setPreco(String(i.preco));
    setUnidade(i.unidade);
    setEditandoId(i.id);
  }

  useEffect(() => { carregar(); }, []);

  const inputClass = "bg-gray-800 border border-gray-700 text-white placeholder-gray-500 p-3 rounded-xl w-full focus:outline-none focus:border-blue-500 transition-colors text-xs";

  return (
    <div className="space-y-6">

      {/* Formulário */}
      <div className="bg-[#0f172a] rounded-2xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">
          {editandoId ? '✏️ Editar Ingrediente' : '➕ Novo Ingrediente'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-gray-400 uppercase mb-1 tracking-wide">Nome</label>
            <input type="text" placeholder="Ex: Chocolate, Farinha"
              value={nome} onChange={(e) => setNome(e.target.value)}
              className={inputClass} />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-gray-400 uppercase mb-1 tracking-wide">Preço (R$)</label>
            <input type="number" placeholder="0,00"
              value={preco} onChange={(e) => setPreco(e.target.value)}
              className={inputClass} />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-gray-400 uppercase mb-1 tracking-wide">Unidade</label>
            <select value={unidade} onChange={(e) => setUnidade(e.target.value)}
              className={inputClass}>
              {unidades.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
        </div>
        <button onClick={salvar} disabled={!nome || !preco}
          className="mt-4 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-medium text-sm transition-colors">
          <Plus size={16} />
          {editandoId ? 'Atualizar' : 'Salvar Ingrediente'}
        </button>
      </div>

      {/* Lista */}
      <div className="bg-[#0f172a] rounded-2xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">
          Ingredientes Cadastrados ({ingredientes.length})
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="text-[10px] text-gray-400 uppercase border-b border-gray-800 bg-gray-950/40">
              <tr>
                <th className="py-2.5 px-3">Nome</th>
                <th className="py-2.5 px-3">Preço</th>
                <th className="py-2.5 px-3">Unidade</th>
                <th className="py-2.5 px-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/40">
              {ingredientes.map((i) => (
                <tr key={i.id} className="hover:bg-gray-800/40 transition-colors">
                  <td className="py-2.5 px-3 font-medium text-white">{i.nome}</td>
                  <td className="py-2.5 px-3 text-emerald-400 font-bold">
                    R$ {Number(i.preco).toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 border border-gray-700">
                      {i.unidade}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => editar(i)}
                        className="flex items-center gap-1 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 px-2 py-1 rounded-lg text-[10px] transition-colors">
                        <Pencil size={10} /> Editar
                      </button>
                      <button onClick={() => deletar(i.id)}
                        className="flex items-center gap-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 px-2 py-1 rounded-lg text-[10px] transition-colors">
                        <Trash2 size={10} /> Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {ingredientes.length === 0 && (
            <p className="text-center text-gray-500 text-xs py-10">Nenhum ingrediente cadastrado.</p>
          )}
        </div>
      </div>

    </div>
  );
}