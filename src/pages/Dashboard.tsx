import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';

const data = [
  { mes: 'Jan', valor: 1200 },
  { mes: 'Fev', valor: 2100 },
  { mes: 'Mar', valor: 1800 },
  { mes: 'Abr', valor: 3200 },
  { mes: 'Mai', valor: 4100 },
];

export default function Dashboard() {
  return (
    <div className="space-y-8">

      <div>

        <h1 className="text-5xl font-black">
          Dashboard
        </h1>

        <p className="text-zinc-400 mt-3">
          Sistema SaaS Financeiro
        </p>

      </div>

      <div className="grid md:grid-cols-3 gap-6">

        <div className="bg-white/5 border border-white/10 rounded-3xl p-6">

          <p className="text-zinc-400">
            Receita Mensal
          </p>

          <h2 className="text-4xl font-black text-cyan-400 mt-4">
            R$ 4.100
          </h2>

        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-6">

          <p className="text-zinc-400">
            Vendas
          </p>

          <h2 className="text-4xl font-black text-green-400 mt-4">
            128
          </h2>

        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-6">

          <p className="text-zinc-400">
            Ticket Médio
          </p>

          <h2 className="text-4xl font-black text-purple-400 mt-4">
            R$ 42
          </h2>

        </div>

      </div>

      <div className="bg-white/5 border border-white/10 rounded-3xl p-6 h-[420px]">

        <h2 className="text-2xl font-bold mb-6">
          Receita Mensal
        </h2>

        <ResponsiveContainer width="100%" height="100%">

          <LineChart data={data}>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#27272a"
            />

            <XAxis
              dataKey="mes"
              stroke="#a1a1aa"
            />

            <YAxis stroke="#a1a1aa" />

            <Tooltip />

            <Line
              type="monotone"
              dataKey="valor"
              stroke="#06b6d4"
              strokeWidth={4}
            />

          </LineChart>

        </ResponsiveContainer>

      </div>

    </div>
  );
}