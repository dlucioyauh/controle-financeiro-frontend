import { useEffect, useState } from 'react';
import { Users, Trash2, Shield, Loader2 } from 'lucide-react';
import api from '../api';

interface Usuario {
  id: string;
  username: string;
  nome: string | null;
  email: string | null;
  createdAt: string;
  totalVendas: number;
  totalDespesas: number;
  totalClientes: number;
  totalReceitas: number;
  totalIngredientes: number;
}

export default function Admin() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [excluindo, setExcluindo] = useState<string | null>(null);

  const carregarUsuarios = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users');
      setUsuarios(res.data);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const excluirUsuario = async (id: string, username: string) => {
    if (
      !confirm(
        `Tem certeza que deseja excluir permanentemente o usuário "${username}" e TODOS os seus dados? Esta ação não pode ser desfeita.`,
      )
    )
      return;
    setExcluindo(id);
    try {
      await api.delete(`/users/${id}`);
      setUsuarios((prev) => prev.filter((u) => u.id !== id));
    } catch (error) {
      alert('Erro ao excluir usuário.');
    } finally {
      setExcluindo(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 size={32} className="animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6 text-slate-200">
      <div className="bg-[#0f172a] p-4 rounded-lg border border-slate-800">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Shield size={20} className="text-yellow-400" /> Painel de Administração
        </h1>
        <p className="text-xs text-slate-400">
          Gerencie os usuários da plataforma.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0f172a] p-4 rounded-lg border border-slate-800">
          <p className="text-[11px] uppercase text-slate-400">
            Total de usuários
          </p>
          <p className="text-2xl font-bold text-white">{usuarios.length}</p>
        </div>
        <div className="bg-[#0f172a] p-4 rounded-lg border border-slate-800">
          <p className="text-[11px] uppercase text-slate-400">
            Usuários ativos (com vendas)
          </p>
          <p className="text-2xl font-bold text-emerald-400">
            {usuarios.filter((u) => u.totalVendas > 0).length}
          </p>
        </div>
        <div className="bg-[#0f172a] p-4 rounded-lg border border-slate-800">
          <p className="text-[11px] uppercase text-slate-400">Inativos</p>
          <p className="text-2xl font-bold text-slate-400">
            {
              usuarios.filter(
                (u) => u.totalVendas === 0 && u.totalDespesas === 0,
              ).length
            }
          </p>
        </div>
      </div>

      <div className="bg-[#0f172a] rounded-lg border border-slate-800 overflow-x-auto">
        <table className="w-full text-xs text-slate-300">
          <thead className="text-[10px] text-slate-500 uppercase border-b border-slate-800">
            <tr>
              <th className="py-2 px-3 text-left">Usuário</th>
              <th className="py-2 px-3 text-left">Nome</th>
              <th className="py-2 px-3 text-left">E-mail</th>
              <th className="py-2 px-3 text-center">Vendas</th>
              <th className="py-2 px-3 text-center">Despesas</th>
              <th className="py-2 px-3 text-center">Clientes</th>
              <th className="py-2 px-3 text-center">Receitas</th>
              <th className="py-2 px-3 text-center">Cadastro</th>
              <th className="py-2 px-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40">
            {usuarios.map((u) => (
              <tr
                key={u.id}
                className="hover:bg-slate-800/20 transition-colors"
              >
                <td className="py-2 px-3 font-medium text-white">
                  {u.username}
                </td>
                <td className="py-2 px-3">{u.nome || '—'}</td>
                <td className="py-2 px-3">{u.email || '—'}</td>
                <td className="py-2 px-3 text-center">{u.totalVendas}</td>
                <td className="py-2 px-3 text-center">{u.totalDespesas}</td>
                <td className="py-2 px-3 text-center">{u.totalClientes}</td>
                <td className="py-2 px-3 text-center">{u.totalReceitas}</td>
                <td className="py-2 px-3 text-slate-400">
                  {new Date(u.createdAt).toLocaleDateString('pt-BR')}
                </td>
                <td className="py-2 px-3 text-right">
                  <button
                    onClick={() => excluirUsuario(u.id, u.username)}
                    disabled={excluindo === u.id || u.username === 'dlucio'}
                    className="p-1 text-red-400 hover:text-red-300 disabled:opacity-30 disabled:cursor-not-allowed"
                    title={
                      u.username === 'dlucio'
                        ? 'Você não pode excluir a si mesmo'
                        : 'Excluir usuário'
                    }
                  >
                    {excluindo === u.id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Trash2 size={14} />
                    )}
                  </button>
                </td>
              </tr>
            ))}
            {usuarios.length === 0 && (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-500">
                  Nenhum usuário encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}