import { useState, useEffect } from 'react';
import api from '../api';
import { Plus, Trash2, RefreshCw, Calendar, DollarSign, TrendingUp, TrendingDown, AlertCircle, Building2, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Recorrencia {
  id: string;
  descricao: string;
  tipo: 'RECEITA' | 'DESPESA';
  ambito: 'EMPRESA' | 'PESSOAL';
  valor: number;
  frequencia: 'DIARIA' | 'SEMANAL' | 'MENSAL' | 'ANUAL';
  proximaExecucao: string;
  ativa: boolean;
  categoria?: string;
}

export default function Recorrencias() {
  const [recorrencias, setRecorrencias] = useState<Recorrencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    descricao: '',
    tipo: 'DESPESA' as 'RECEITA' | 'DESPESA',
    ambito: 'EMPRESA' as 'EMPRESA' | 'PESSOAL',
    valor: '',
    frequencia: 'MENSAL' as 'DIARIA' | 'SEMANAL' | 'MENSAL' | 'ANUAL',
    categoria: '',
  });

  const carregarRecorrencias = async () => {
    setLoading(true);
    try {
      const res = await api.get('/recorrencias');
      setRecorrencias(res.data);
    } catch (error) {
      console.error('Erro ao carregar recorrências:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregarRecorrencias(); }, []);

  // ✅ CORREÇÃO: Função para calcular a próxima data baseada na frequência
  const calcularProximaExecucao = (frequencia: string) => {
    const data = new Date();
    switch (frequencia) {
      case 'DIARIA': data.setDate(data.getDate() + 1); break;
      case 'SEMANAL': data.setDate(data.getDate() + 7); break;
      case 'MENSAL': data.setMonth(data.getMonth() + 1); break;
      case 'ANUAL': data.setFullYear(data.getFullYear() + 1); break;
      default: data.setMonth(data.getMonth() + 1);
    }
    return data.toISOString();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.descricao || !formData.valor) return;

    setSubmitting(true);
    try {
      await api.post('/recorrencias', {
        ...formData,
        valor: parseFloat(formData.valor),
        proximaExecucao: calcularProximaExecucao(formData.frequencia), // ✅ Usa a função correta
      });
      
      setFormData({ descricao: '', tipo: 'DESPESA', ambito: 'EMPRESA', valor: '', frequencia: 'MENSAL', categoria: '' });
      await carregarRecorrencias();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao criar recorrência.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelar = async (id: string) => {
    if (!confirm('Tem certeza que deseja cancelar esta recorrência? Ela não será mais processada.')) return;
    try {
      await api.patch(`/recorrencias/${id}/cancelar`);
      await carregarRecorrencias(); // ✅ Garante que a lista seja recarregada após o cancelamento
    } catch (error) {
      alert('Erro ao cancelar recorrência.');
    }
  };

  const selectStyle = {
    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2364748b' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
    backgroundPosition: 'right 0.75rem center',
    backgroundSize: '1.2em',
    backgroundRepeat: 'no-repeat',
  };

  return (
    <div className="space-y-6 text-slate-200">
      <div className="flex items-center justify-between bg-[#0f172a] p-4 rounded-lg border border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">Transações Recorrentes</h1>
          <p className="text-xs text-slate-400">Automatize receitas e despesas fixas (Aluguel, Assinaturas, Mensalidades).</p>
        </div>
        <button onClick={carregarRecorrencias} className="p-2 text-slate-400 hover:text-white rounded bg-[#1e293b] border border-slate-700 transition-colors">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-[#0f172a] p-5 rounded-lg border border-slate-800 h-fit space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <Calendar className="h-4 w-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Nova Regra</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-white mb-1.5 uppercase tracking-wide">Tipo</label>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setFormData({ ...formData, tipo: 'RECEITA' })} className={`flex items-center justify-center gap-1 py-2 rounded border transition-all ${formData.tipo === 'RECEITA' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-[#1e293b]/40 border-slate-700 text-slate-400'}`}>
                  <TrendingUp size={14} /> Receita
                </button>
                <button type="button" onClick={() => setFormData({ ...formData, tipo: 'DESPESA' })} className={`flex items-center justify-center gap-1 py-2 rounded border transition-all ${formData.tipo === 'DESPESA' ? 'bg-red-500/10 border-red-500 text-red-400' : 'bg-[#1e293b]/40 border-slate-700 text-slate-400'}`}>
                  <TrendingDown size={14} /> Despesa
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-white mb-1.5 uppercase tracking-wide">Âmbito</label>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setFormData({ ...formData, ambito: 'EMPRESA' })} className={`flex items-center justify-center gap-1 py-2 rounded border transition-all ${formData.ambito === 'EMPRESA' ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400' : 'bg-[#1e293b]/40 border-slate-700 text-slate-400'}`}>
                  <Building2 size={14} /> Empresa
                </button>
                <button type="button" onClick={() => setFormData({ ...formData, ambito: 'PESSOAL' })} className={`flex items-center justify-center gap-1 py-2 rounded border transition-all ${formData.ambito === 'PESSOAL' ? 'bg-purple-500/10 border-purple-500 text-purple-400' : 'bg-[#1e293b]/40 border-slate-700 text-slate-400'}`}>
                  <User size={14} /> Pessoal
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-white mb-1.5 uppercase tracking-wide">Descrição</label>
              <input type="text" placeholder="Ex: Aluguel do Ponto, Netflix" value={formData.descricao} onChange={e => setFormData({ ...formData, descricao: e.target.value })} className="w-full bg-[#1e293b]/40 border border-slate-800 rounded-lg px-3 py-2.5 text-slate-300 focus:outline-none focus:border-cyan-500/50 h-10" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-white mb-1.5 uppercase tracking-wide">Valor (R$)</label>
                <input type="number" step="0.01" placeholder="0.00" value={formData.valor} onChange={e => setFormData({ ...formData, valor: e.target.value })} className="w-full bg-[#1e293b]/40 border border-slate-800 rounded-lg px-3 py-2.5 text-slate-300 focus:outline-none focus:border-cyan-500/50 h-10" required />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-white mb-1.5 uppercase tracking-wide">Frequência</label>
                <select value={formData.frequencia} onChange={e => setFormData({ ...formData, frequencia: e.target.value as any })} className="w-full bg-[#1e293b]/40 border border-slate-800 rounded-lg px-3 py-2.5 text-slate-300 focus:outline-none focus:border-cyan-500/50 h-10 transition-colors pr-8 appearance-none" style={selectStyle}>
                  <option value="MENSAL" className="bg-[#0f172a]">Mensal</option>
                  <option value="SEMANAL" className="bg-[#0f172a]">Semanal</option>
                  <option value="ANUAL" className="bg-[#0f172a]">Anual</option>
                  <option value="DIARIA" className="bg-[#0f172a]">Diária</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-white mb-1.5 uppercase tracking-wide">Categoria (Opcional)</label>
              <input type="text" placeholder="Ex: Infraestrutura, Lazer" value={formData.categoria} onChange={e => setFormData({ ...formData, categoria: e.target.value })} className="w-full bg-[#1e293b]/40 border border-slate-800 rounded-lg px-3 py-2.5 text-slate-300 focus:outline-none focus:border-cyan-500/50 h-10" />
            </div>

            <button type="submit" disabled={submitting} className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors mt-2">
              {submitting ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />} 
              {submitting ? 'Salvando...' : 'Programar Recorrência'}
            </button>
          </form>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-[#0f172a] p-5 rounded-lg border border-slate-800 lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <DollarSign className="h-4 w-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Regras Programadas</h2>
          </div>

          {loading ? (
            <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-16 bg-slate-800/50 rounded-lg animate-pulse" />)}</div>
          ) : recorrencias.length === 0 ? (
            <div className="text-center py-10 text-slate-500 flex flex-col items-center gap-2">
              <AlertCircle size={32} className="opacity-50" />
              <p>Nenhuma transação recorrente programada.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {recorrencias.map((rec) => (
                  <motion.div key={rec.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} className="flex items-center justify-between p-4 bg-[#1e293b]/30 border border-slate-800 rounded-lg hover:border-slate-700 transition-colors group">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${rec.tipo === 'RECEITA' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                        {rec.tipo === 'RECEITA' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-white">{rec.descricao}</h3>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 uppercase tracking-wide">
                          <span className={`px-1.5 py-0.5 rounded border ${rec.ambito === 'EMPRESA' ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' : 'bg-purple-500/10 border-purple-500/30 text-purple-400'}`}>
                            {rec.ambito}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700">{rec.frequencia}</span>
                          {rec.categoria && <span>• {rec.categoria}</span>}
                        </div>
                        <p className="text-[10px] text-cyan-400 mt-1">Próxima: {new Date(rec.proximaExecucao).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <span className={`text-base font-bold ${rec.tipo === 'RECEITA' ? 'text-emerald-400' : 'text-red-400'}`}>
                        R$ {Number(rec.valor).toFixed(2)}
                      </span>
                      <button onClick={() => handleCancelar(rec.id)} className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                        <Trash2 size={12} /> Cancelar
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}