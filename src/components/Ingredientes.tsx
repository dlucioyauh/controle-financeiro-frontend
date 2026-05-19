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

  const inputClass = "bg-gray-800 border border-gray-700 text-white placeholder-gray-500 p-3 rounded-xl w-full focus:outline-none focus:border-blue-500 transition-colors";

  return (
    <div className="space-y-6">

      {/* Formulário */}
      <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
        <h3 className="text-lg font-semibold text-white mb-4">
          {editandoId ? '✏️ Editar Ingrediente' : '➕ Novo Ingrediente'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="text"
            placeholder="Nome do ingrediente"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className={inputClass}
          />
          <input
            type="number"
            placeholder="Preço (R$)"
            value={preco}
            onChange={(e) => setPreco(e.target.value)}
            className={inputClass}
          />
          <select
            value={unidade}
            onChange={(e) => setUnidade(e.target.value)}
            className={inputClass}
          >
            {unidades.map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>
        <button
          onClick={salvar}
          disabled={!nome || !preco}
          className="mt-4 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-medium transition-colors"
        >
          <Plus size={18} />
          {editandoId ? 'Atualizar' : 'Salvar Ingrediente'}
        </button>
      </div>

      {/* Lista */}
      <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
        <h3 className="text-lg font-semibold text-white mb-4">
          Ingredientes Cadastrados ({ingredientes.length})
        </h3>
        <div className="space-y-3">
          {ingredientes.map((i) => (
            <div key={i.id}
              className="bg-gray-800 rounded-xl p-4 flex justify-between items-center border border-gray-700 hover:border-gray-600 transition-colors">
              <div>
                <p className="font-semibold text-white">{i.nome}</p>
                <p className="text-sm text-gray-400 mt-1">
                  R$ {Number(i.preco).toFixed(2)} / {i.unidade}
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => editar(i)}
                  className="flex items-center gap-1 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 px-3 py-2 rounded-lg text-sm transition-colors">
                  <Pencil size={14} /> Editar
                </button>
                <button onClick={() => deletar(i.id)}
                  className="flex items-center gap-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-2 rounded-lg text-sm transition-colors">
                  <Trash2 size={14} /> Excluir
                </button>
              </div>
            </div>
          ))}
          {ingredientes.length === 0 && (
            <p className="text-center text-gray-500 py-10">Nenhum ingrediente cadastrado.</p>
          )}
        </div>
      </div>

    </div>
  );
}