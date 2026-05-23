import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  Home,
  Wallet,
  ShoppingCart,
  BarChart3,
  Settings,
  Calculator,
  LogOut,
  Menu,
  X,
  Users,
} from 'lucide-react';

const menu = [
  { nome: 'Dashboard', rota: '/', icon: Home },
  { nome: 'Financeiro', rota: '/financeiro', icon: Wallet },
  { nome: 'Vendas', rota: '/vendas', icon: ShoppingCart },
  { nome: 'Clientes', rota: '/clientes', icon: Users },
  { nome: 'Precificação', rota: '/precificacao', icon: Calculator },
  { nome: 'Analytics', rota: '/analytics', icon: BarChart3 },
  { nome: 'Configurações', rota: '/configuracoes', icon: Settings },
];

interface Props {
  onLogout: () => void;
}

export function MainLayout({ onLogout }: Props) {
  const location = useLocation();
  const [menuAberto, setMenuAberto] = useState(false);

  const alternarMenu = () => setMenuAberto(!menuAberto);
  const fecharMenu = () => setMenuAberto(false);

  return (
    <div className="min-h-screen bg-[#020617] text-white flex relative overflow-x-hidden">

      {/* SIDEBAR DESKTOP */}
      <aside className="hidden md:flex w-72 bg-[#0f172a] border-r border-white/10 flex-col p-8 shrink-0">
        <h1 className="text-4xl font-black text-cyan-400 mb-12">IonFinance</h1>
        <nav className="space-y-3 flex-1">
          {menu.map((item) => {
            const Icon = item.icon;
            const ativo = location.pathname === item.rota;
            return (
              <Link
                key={item.nome}
                to={item.rota}
                className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl transition-all ${
                  ativo ? 'bg-cyan-500/10 text-cyan-400' : 'hover:bg-white/5 text-zinc-300'
                }`}
              >
                <Icon size={22} />
                {item.nome}
              </Link>
            );
          })}
        </nav>
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-4 py-4 rounded-2xl text-zinc-400 hover:text-white hover:bg-white/5 transition-all w-full mt-4"
        >
          <LogOut size={22} />
          Sair
        </button>
      </aside>

      {/* FUNDO ESCURECIDO MOBILE */}
      {menuAberto && (
        <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={fecharMenu} />
      )}

      {/* SIDEBAR MOBILE */}
      <aside className={`fixed top-0 bottom-0 left-0 w-72 bg-[#0f172a] border-r border-white/10 flex flex-col p-8 z-50 transition-transform duration-300 md:hidden ${
        menuAberto ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-black text-cyan-400">IonFinance</h1>
          <button onClick={fecharMenu} className="text-zinc-400 hover:text-white">
            <X size={24} />
          </button>
        </div>
        <nav className="space-y-3 flex-1">
          {menu.map((item) => {
            const Icon = item.icon;
            const ativo = location.pathname === item.rota;
            return (
              <Link
                key={item.nome}
                to={item.rota}
                onClick={fecharMenu}
                className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl transition-all ${
                  ativo ? 'bg-cyan-500/10 text-cyan-400' : 'hover:bg-white/5 text-zinc-300'
                }`}
              >
                <Icon size={22} />
                {item.nome}
              </Link>
            );
          })}
        </nav>
        <button
          onClick={() => { fecharMenu(); onLogout(); }}
          className="flex items-center gap-3 px-4 py-4 rounded-2xl text-zinc-400 hover:text-white hover:bg-white/5 transition-all w-full mt-4"
        >
          <LogOut size={22} />
          Sair
        </button>
      </aside>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 p-4 md:p-10 w-full min-w-0">
        {/* HEADER MOBILE */}
        <div className="md:hidden flex justify-between items-center mb-6 bg-[#0f172a]/50 p-4 rounded-2xl border border-white/5">
          <button onClick={alternarMenu} className="text-zinc-300 hover:text-white p-1 transition-colors">
            <Menu size={26} />
          </button>
          <h1 className="text-2xl font-black text-cyan-400">IonFinance</h1>
          <button onClick={onLogout} className="text-zinc-400 hover:text-white transition-colors p-1">
            <LogOut size={22} />
          </button>
        </div>
        <Outlet />
      </main>
    </div>
  );
}