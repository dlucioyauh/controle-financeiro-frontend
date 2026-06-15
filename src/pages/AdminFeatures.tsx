import { useEffect, useState } from 'react';
import api from '../api';

interface FeatureFlag {
  id: string;
  name: string;
  description: string | null;
  enabled: boolean;
}

export default function AdminFeatures() {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const carregarFlags = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/features');
      setFlags(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleFlag = async (id: string, currentEnabled: boolean) => {
    setUpdating(id);
    try {
      await api.patch(`/admin/features/${id}`, { enabled: !currentEnabled });
      await carregarFlags();
    } catch (err) {
      console.error('Erro ao alterar flag', err);
      alert('Erro ao alterar flag. Verifique se você é administrador.');
    } finally {
      setUpdating(null);
    }
  };

  useEffect(() => {
    carregarFlags();
  }, []);

  if (loading) return <div className="text-center py-10">Carregando...</div>;

  return (
    <div className="space-y-6 text-slate-200">
      <div className="bg-[#0f172a] p-4 rounded-lg border border-slate-800">
        <h1 className="text-xl font-bold text-white">Feature Flags</h1>
        <p className="text-xs text-slate-400">Controle de funcionalidades do sistema.</p>
      </div>

      <div className="bg-[#0f172a] rounded-lg border border-slate-800 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-800">
            <tr className="text-left text-slate-400">
              <th className="p-3">Nome</th>
              <th className="p-3">Descrição</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3 text-center">Ação</th>
            </tr>
          </thead>
          <tbody>
            {flags.map((flag) => (
              <tr key={flag.id} className="border-b border-slate-800/50">
                <td className="p-3 font-mono text-xs">{flag.name}</td>
                <td className="p-3 text-slate-300">{flag.description || '—'}</td>
                <td className="p-3 text-center">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      flag.enabled
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {flag.enabled ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="p-3 text-center">
                  <button
                    onClick={() => toggleFlag(flag.id, flag.enabled)}
                    disabled={updating === flag.id}
                    className={`px-3 py-1 rounded text-sm transition ${
                      flag.enabled
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    {updating === flag.id ? '...' : flag.enabled ? 'Desativar' : 'Ativar'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}