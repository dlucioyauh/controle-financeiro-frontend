import { useEffect, useState } from 'react';
import api from '../api';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { Users, UserCheck, UserPlus, DollarSign, Clock, TrendingUp } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

export default function AdminMetrics() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/metrics/overview')
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Erro ao carregar métricas:', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-center py-20">Carregando métricas...</div>;

  if (!data) return <div className="text-center py-20 text-red-400">Erro ao carregar métricas.</div>;

  const { totalUsers, activeUsers, newUsers, mrr, trialsExpiring, conversionRate, plansDistribution, revenueByMonth } = data;

  const planPieData = plansDistribution.map((item: any) => ({
    name: item.plano || 'free',
    value: Number(item.count),
  }));

  return (
    <div className="space-y-6 text-slate-200">
      <div className="bg-[#0f172a] p-4 rounded-lg border border-slate-800">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <TrendingUp size={20} className="text-cyan-400" /> Métricas do Negócio
        </h1>
        <p className="text-xs text-slate-400">Visão geral do desempenho do IonFinance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0f172a] p-4 rounded-lg border border-slate-800">
          <div className="flex items-center gap-2 text-slate-400"><Users size={16} /> Total de usuários</div>
          <p className="text-2xl font-bold text-white">{totalUsers}</p>
        </div>
        <div className="bg-[#0f172a] p-4 rounded-lg border border-slate-800">
          <div className="flex items-center gap-2 text-emerald-400"><UserCheck size={16} /> Usuários ativos (30d)</div>
          <p className="text-2xl font-bold text-white">{activeUsers}</p>
        </div>
        <div className="bg-[#0f172a] p-4 rounded-lg border border-slate-800">
          <div className="flex items-center gap-2 text-blue-400"><UserPlus size={16} /> Novos (mês)</div>
          <p className="text-2xl font-bold text-white">{newUsers}</p>
        </div>
        <div className="bg-[#0f172a] p-4 rounded-lg border border-slate-800">
          <div className="flex items-center gap-2 text-yellow-400"><DollarSign size={16} /> MRR</div>
          <p className="text-2xl font-bold text-white">R$ {mrr.toFixed(2)}</p>
        </div>
        <div className="bg-[#0f172a] p-4 rounded-lg border border-slate-800">
          <div className="flex items-center gap-2 text-orange-400"><Clock size={16} /> Trials expirando (3d)</div>
          <p className="text-2xl font-bold text-white">{trialsExpiring}</p>
        </div>
        <div className="bg-[#0f172a] p-4 rounded-lg border border-slate-800">
          <div className="flex items-center gap-2 text-purple-400"><TrendingUp size={16} /> Conversão trial → pago</div>
          <p className="text-2xl font-bold text-white">{conversionRate.toFixed(1)}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-[#0f172a] p-4 rounded-lg border border-slate-800">
          <h3 className="text-sm font-bold mb-2">Evolução da Receita Mensal</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueByMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={10} />
              <YAxis stroke="#64748b" fontSize={10} />
              <Tooltip formatter={(value: any) => `R$ ${value.toFixed(2)}`} />
              <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#0f172a] p-4 rounded-lg border border-slate-800">
          <h3 className="text-sm font-bold mb-2">Distribuição de Planos</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={planPieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {planPieData.map((_: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}