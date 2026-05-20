import { Outlet } from 'react-router-dom';

import {
  Home,
  Wallet,
  ShoppingCart,
  BarChart3,
  Settings,
} from 'lucide-react';

export function MainLayout() {
  return (
    <div className="min-h-screen bg-[#020617] text-white flex">

      <aside className="hidden md:flex w-72 bg-[#0f172a] border-r border-white/10 flex-col p-8">

        <h1 className="text-4xl font-black text-cyan-400 mb-12">
          IonFinance
        </h1>

        <nav className="space-y-3">

          <button className="w-full flex items-center gap-3 bg-cyan-500/10 hover:bg-cyan-500/20 transition-all text-cyan-400 px-4 py-4 rounded-2xl">

            <Home size={22} />

            Dashboard

          </button>

          <button className="w-full flex items-center gap-3 hover:bg-white/5 transition-all px-4 py-4 rounded-2xl">

            <Wallet size={22} />

            Financeiro

          </button>

          <button className="w-full flex items-center gap-3 hover:bg-white/5 transition-all px-4 py-4 rounded-2xl">

            <ShoppingCart size={22} />

            Vendas

          </button>

          <button className="w-full flex items-center gap-3 hover:bg-white/5 transition-all px-4 py-4 rounded-2xl">

            <BarChart3 size={22} />

            Analytics

          </button>

        </nav>

        <div className="mt-auto">

          <button className="w-full flex items-center gap-3 hover:bg-white/5 transition-all px-4 py-4 rounded-2xl text-zinc-400">

            <Settings size={22} />

            Configurações

          </button>

        </div>

      </aside>

      <main className="flex-1 p-4 md:p-10">

        <div className="md:hidden mb-6">

          <h1 className="text-3xl font-black text-cyan-400">
            IonFinance
          </h1>

        </div>

        <Outlet />

      </main>

    </div>
  );
}