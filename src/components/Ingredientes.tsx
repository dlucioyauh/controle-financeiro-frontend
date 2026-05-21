import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import api from '../api';

// Adicionado 'unidades' para manter compatibilidade perfeita com a tela de receitas
const unidades = ['kg', 'g', 'litro', 'ml', 'un', 'unidades'];

export default function Ingredientes() {
  const [ingredientes, setIngredientes] = useState<any[]>([]);
  const [nome, setNome] = useState('');
  const [precoCompra, setPrecoCompra] = useState('');
  const [quantidadeCompra, setQuantidadeCompra] = useState('1'); // Padrão 1
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

  // Função essencial que estava faltando para limpar os campos após salvar/editar
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

    // Monta o payload garantindo que os números sejam convertidos corretamente
    // e remove espaços em branco acidentais
    const payload = {
      nome: nome.trim(),
      precoCompra: Number(String(precoCompra).replace(',', '.')),
      quantidadeCompra: Number(String(quantidadeCompra).replace(',', '.')),
      unidadeMedida: (unidadeMedida || 'kg').toLowerCase().trim(),
    };

    try {
      if (editandoId !== null) {
        await api.put(`/ingredientes/${editandoId}`, payload);
        setEditandoId(null);
      } else {
        await api.post('/ingredientes', payload);
      }
      
      resetForm(); // Agora vai funcionar perfeitamente!
      carregar();  // Recarrega a lista de ingredientes
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

  const inputClass = "bg-gray-800 border border-gray-700 text-white placeholder-gray-500 p-3 rounded-xl w-full focus:outline-none focus:border-blue-500 transition-colors text-xs";

  return (
    <div className="space-y-6">

      {/* Formulário */}
      <div className="bg-[#0f172a] rounded-2xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">
          {editandoId ? '✏️ Editar Ingrediente' : '➕ Novo Ingrediente'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-gray-400 uppercase mb-1 tracking-wide">Nome</label>
            <input type="text" placeholder="Ex: Chocolate, Farinha"
              value={nome} onChange={(e) => setNome(e.target.value)}
              className={inputClass} />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-gray-400 uppercase mb-1 tracking-wide">Preço de Compra (R$)</label>
            <input type="text" placeholder="0.00"
              value={precoCompra} onChange={(e) => setPrecoCompra(e.target.value)}
              className={inputClass} />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-gray-400 uppercase mb-1 tracking-wide">Qtd. Embalagem</label>
            <input type="text" placeholder="Ex: 1, 500"
              value={quantidadeCompra} onChange={(e) => setQuantidadeCompra(e.target.value)}
              className={inputClass} />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-gray-400 uppercase mb-1 tracking-wide">Unidade Medida</label>
            <select value={unidadeMedida} onChange={(e) => setUnidadeMedida(e.target.value)}
              className={inputClass}>
              {unidades.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={salvar} disabled={!nome || !precoCompra || !quantidadeCompra}
            className="mt-4 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-medium text-sm transition-colors">
            <Plus size={16} />
            {editandoId ? 'Atualizar' : 'Salvar Ingrediente'}
          </button>
          {editandoId && (
            <button onClick={resetForm}
              className="mt-4 px-6 py-3 rounded-xl font-medium text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-gray-600 transition-colors">
              Cancelar Edição
            </button>
          )}
        </div>
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
                <th className="py-2.5 px-3">Preço Compra</th>
                <th className="py-2.5 px-3">Qtd. Embalagem</th>
                <th className="py-2.5 px-3">Unidade</th>
                <th className="py-2.5 px-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/40">
              {ingredientes.map((i) => (
                <tr key={i.id} className="hover:bg-gray-800/40 transition-colors">
                  <td className="py-2.5 px-3 font-medium text-white">{i.nome}</td>
                  <td className="py-2.5 px-3 text-emerald-400 font-bold">
                    R$ {Number(i.precoCompra ?? 0).toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3">{i.quantidadeCompra ?? 1}</td>
                  <td className="py-2.5 px-3">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 border border-gray-700">
                      {i.unidadeMedida}
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