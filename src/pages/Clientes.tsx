import { useState, useEffect } from 'react';
import { Users, Plus, Pencil, Trash2, Phone, MapPin, X, Check } from 'lucide-react';
import api from '../api';

interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  endereco: string;
  bairro: string;
  cidade: string;
}

const vazio = { nome: '', telefone: '', endereco: '', bairro: '', cidade: '' };

export default function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [form, setForm] = useState(vazio);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { carregar(); }, []);

  async function carregar() {
    setLoading(true);
    try {
      const res = await api.get('/clientes');
      setClientes(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function salvar() {
    if (!form.nome.trim()) return alert('Nome é obrigatório.');
    try {
      if (editandoId) {
        await api.patch(`/clientes/${editandoId}`, form);
      } else {
        await api.post('/clientes', form);
      }
      setForm(vazio);
      setEditandoId(null);
      carregar();
    } catch (e) { console.error(e); }
  }

  function editar(c: Cliente) {
    setEditandoId(c.id);
    setForm({ nome: c.nome, telefone: c.telefone, endereco: c.endereco, bairro: c.bairro, cidade: c.cidade });
  }

  async function remover(id: string) {
    if (!confirm('Remover este cliente?')) return;
    await api.delete(`/clientes/${id}`);
    carregar();
  }

  return (
    <div className="space-y-6 text-slate-200">
      <div className="bg-[#0f172a] p-4 rounded-lg border border-slate-800">
        <h1 className="text-xl font-bold tracking-tight text-white">Clientes</h1>
        <p className="text-xs text-slate-400">Cadastre e gerencie seus clientes.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulário */}
        <div className="bg-[#0f172a] p-5 rounded-lg border border-slate-800 h-fit space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <Users className="h-4 w-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              {editandoId ? 'Editar Cliente' : 'Novo Cliente'}
            </h2>
          </div>

          <div className="space-y-3 text-xs">
            {[
              { label: 'Nome', key: 'nome', placeholder: 'Nome completo' },
              { label: 'Telefone', key: 'telefone', placeholder: '(48) 99999-9999' },
              { label: 'Endereço', key: 'endereco', placeholder: 'Rua, número' },
              { label: 'Bairro', key: 'bairro', placeholder: 'Bairro' },
              { label: 'Cidade', key: 'cidade', placeholder: 'Cidade' },
            ].map(({ label, key, placeholder }) => (
              <div key={key}>
                <label className="block text-[11px] font-bold text-white mb-1 uppercase tracking-wide">{label}</label>
                <input
                  type="text"
                  placeholder={placeholder}
                  value={form[key as keyof typeof form]}
                  onChange={e => setForm({ ...form, [key]: e.target.value })}
                  className="w-full bg-[#1e293b]/40 border border-slate-800 rounded-lg px-3 py-2.5 text-slate-300 focus:outline-none focus:border-blue-500/50 h-10"
                />
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={salvar}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
            >
              {editandoId ? <><Check className="h-3.5 w-3.5" /> Salvar</> : <><Plus className="h-3.5 w-3.5" /> Cadastrar</>}
            </button>
            {editandoId && (
              <button
                onClick={() => { setForm(vazio); setEditandoId(null); }}
                className="px-3 py-2.5 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Lista */}
        <div className="bg-[#0f172a] p-5 rounded-lg border border-slate-800 lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <Users className="h-4 w-4 text-blue-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Clientes Cadastrados ({clientes.length})
            </h2>
          </div>

          {loading ? (
            <p className="text-xs text-slate-500 italic text-center py-6">Carregando...</p>
          ) : clientes.length === 0 ? (
            <p className="text-xs text-slate-500 italic text-center py-6">Nenhum cliente cadastrado ainda.</p>
          ) : (
            <div className="space-y-2">
              {clientes.map(c => (
                <div key={c.id} className="bg-white/5 rounded-lg p-4 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-semibold text-white text-sm truncate">{c.nome}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                      {c.telefone && (
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <Phone className="h-3 w-3" /> {c.telefone}
                        </span>
                      )}
                      {(c.endereco || c.bairro || c.cidade) && (
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <MapPin className="h-3 w-3" />
                          {[c.endereco, c.bairro, c.cidade].filter(Boolean).join(', ')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => editar(c)} className="p-1.5 text-slate-500 hover:text-blue-400 rounded hover:bg-blue-500/10 transition">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => remover(c.id)} className="p-1.5 text-slate-500 hover:text-red-400 rounded hover:bg-red-500/10 transition">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
