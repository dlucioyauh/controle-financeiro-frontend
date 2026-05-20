import { Outlet } from 'react-router-dom';

import {
  LayoutDashboard,
  Wallet,
  ShoppingCart,
  BarChart3,
  Package,
  Settings,
} from 'lucide-react';

export function MainLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#111827] text-white flex">

      <aside className="w-72 bg-white/5 backdrop-blur-2xl border-r border-white/10 p-8 flex flex-col justify-between">

        <div>

          <div className="mb-14">

            <h1 className="text-4xl font-black bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              IonFinance
            </h1>

            <p className="text-zinc-400 mt-2">
              SaaS Financeiro Inteligente
            </p>

          </div>

          <nav className="space-y-3">

            <button className="w-full flex items-center gap-4 bg-cyan-500/20 hover:bg-cyan-500/30 transition-all border border-cyan-400/20 rounded-2xl p-4 text-left">

              <LayoutDashboard size={22} />

              Dashboard

            </button>

            <button className="w-full flex items-center gap-4 bg-white/5 hover:bg-white/10 transition-all rounded-2xl p-4 text-left">

              <Wallet size={22} />

              Financeiro

            </button>

            <button className="w-full flex items-center gap-4 bg-white/5 hover:bg-white/10 transition-all rounded-2xl p-4 text-left">

              <ShoppingCart size={22} />

              Vendas

            </button>

            <button className="w-full flex items-center gap-4 bg-white/5 hover:bg-white/10 transition-all rounded-2xl p-4 text-left">

              <Package size={22} />

              Produtos

            </button>

            <button className="w-full flex items-center gap-4 bg-white/5 hover:bg-white/10 transition-all rounded-2xl p-4 text-left">

              <BarChart3 size={22} />

              Analytics

            </button>

          </nav>

        </div>

        <button className="w-full flex items-center gap-4 bg-white/5 hover:bg-white/10 transition-all rounded-2xl p-4 text-left">

          <Settings size={22} />

          Configurações

        </button>

      </aside>

      <main className="flex-1 p-10 overflow-auto">
        <Outlet />
      </main>

    </div>
  );
}