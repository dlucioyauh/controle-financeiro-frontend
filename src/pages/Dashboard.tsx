export function Dashboard() {
  return (
    <div>

      <div className="flex items-center justify-between mb-10">

        <div>
          <h1 className="text-5xl font-black">
            Dashboard
          </h1>

          <p className="text-zinc-400 mt-2">
            Controle financeiro inteligente
          </p>
        </div>

        <button className="bg-cyan-500 hover:bg-cyan-400 transition-all px-6 py-4 rounded-2xl font-bold shadow-lg shadow-cyan-500/20">
          Nova Venda
        </button>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
          <p className="text-zinc-400 mb-2">
            Receita Total
          </p>

          <h2 className="text-4xl font-black text-green-400">
            R$ 12.480
          </h2>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
          <p className="text-zinc-400 mb-2">
            Despesas
          </p>

          <h2 className="text-4xl font-black text-red-400">
            R$ 3.240
          </h2>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
          <p className="text-zinc-400 mb-2">
            Lucro
          </p>

          <h2 className="text-4xl font-black text-cyan-400">
            R$ 9.240
          </h2>
        </div>

      </div>

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">

        <h2 className="text-2xl font-bold mb-6">
          Últimas movimentações
        </h2>

        <div className="space-y-4">

          <div className="bg-black/20 rounded-2xl p-5 flex justify-between">
            <div>
              <p className="font-bold">
                Venda Brownie Gourmet
              </p>

              <p className="text-zinc-400 text-sm">
                iFood
              </p>
            </div>

            <p className="text-green-400 font-bold">
              + R$ 120
            </p>
          </div>

          <div className="bg-black/20 rounded-2xl p-5 flex justify-between">
            <div>
              <p className="font-bold">
                Compra Ingredientes
              </p>

              <p className="text-zinc-400 text-sm">
                Mercado
              </p>
            </div>

            <p className="text-red-400 font-bold">
              - R$ 80
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}