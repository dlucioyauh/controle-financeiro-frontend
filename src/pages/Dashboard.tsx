import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import api from '../api';

const CORES = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899', '#14b8a6'];

export default function Dashboard() {
  const [despesas, setDespesas] = useState<any[]>([]);

  useEffect(() => {
    api.get('/despesas').then((r) => setDespesas(r.data));
  }, []);

  const total = despesas.reduce((acc, item) => acc + Number(item.valor), 0);
  const totalEmpresa = despesas.filter((i) => i.tipo === 'empresa').reduce((acc, i) => acc + Number(i.valor), 0);
  const totalPessoal = despesas.filter((i) => i.tipo === 'pessoal').reduce((acc, i) => acc + Number(i.valor), 0);

  const dadosGrafico = Object.entries(
    despesas.reduce((acc: Record<string, number>, item) => {
      acc[item.categoria] = (acc[item.categoria] || 0) + Number(item.valor);
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const cards = [
    { label: 'Total Geral', value: total, icon: DollarSign, color: 'from-blue-600 to-blue-400', shadow: 'shadow-blue-500/20' },
    { label: 'Empresa', value: totalEmpresa, icon: TrendingUp, color: 'from-purple-600 to-purple-400', shadow: 'shadow-purple-500/20' },
    { label: 'Pessoal', value: totalPessoal, icon: TrendingDown, color: 'from-pink-600 to-pink-400', shadow: 'shadow-pink-500/20' },
  ];

  return (
    <div className="space-y-8">

      <div>
        <h2 className="text-2xl font-bold text-white">Dashboard</h2>
        <p className="text-gray-400 text-sm mt-1">Visão geral das suas finanças</p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map(({ label, value, icon: Icon, color, shadow }) => (
          <div key={label} className={`bg-gradient-to-br ${color} rounded-2xl p-6 shadow-lg ${shadow}`}>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-white/70 text-sm font-medium">{label}</p>
                <p className="text-white text-2xl font-bold mt-1">
                  R$ {value.toFixed(2)}
                </p>
              </div>
              <div className="bg-white/20 rounded-xl p-2">
                <Icon size={20} className="text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Gráfico */}
      {dadosGrafico.length > 0 && (
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-6">Gastos por Categoria</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dadosGrafico}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
              >
                {dadosGrafico.map((_, index) => (
                  <Cell key={index} fill={CORES[index % CORES.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => `R$ ${Number(value).toFixed(2)}`}
                contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '12px' }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

    </div>
  );
}