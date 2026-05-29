import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  ChefHat,
  FileText,
  Settings,
  Users,
  Shield,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import api from '../api';

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/analytics', label: 'Analytics', icon: TrendingUp },
  { to: '/financeiro', label: 'Financeiro', icon: DollarSign },
  { to: '/vendas', label: 'Vendas', icon: ShoppingBag },
  { to: '/precificacao', label: 'Precificação', icon: ChefHat },
  { to: '/relatorios', label: 'Relatórios', icon: FileText },
  { to: '/clientes', label: 'Clientes', icon: Users },
  { to: '/configuracoes', label: 'Configurações', icon: Settings },
];

export default function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    // Decodifica o payload do token para obter o username
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUser(payload);
    } catch {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-[#020617]">
      {/* Sidebar para desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#0f172a] border-r border-slate-800 p-4">
        <div className="flex items-center gap-2 mb-8">
          <img src="/vite.svg" alt="Logo" className="h-8" />
          <span className="text-white font-bold text-lg">IonFinance</span>
        </div>
        <nav className="flex-1 space-y-1">
          {links.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                location.pathname === to
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
          {user?.username === 'dlucio' && (
            <Link
              to="/admin"
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                location.pathname === '/admin'
                  ? 'bg-blue-600 text-white'
                  : 'text-yellow-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Shield size={18} />
              Admin
            </Link>
          )}
        </nav>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 mt-4 px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
        >
          <LogOut size={18} />
          Sair
        </button>
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#0f172a] border-b border-slate-800 px-4 py-2 flex items-center justify-between">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white">
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <span className="text-white font-bold">IonFinance</span>
        <button onClick={handleLogout} className="text-slate-400">
          <LogOut size={20} />
        </button>
      </div>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-64 bg-[#0f172a] p-4 z-50">
            <nav className="space-y-1 mt-14">
              {links.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    location.pathname === to
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon size={18} />
                  {label}
                </Link>
              ))}
              {user?.username === 'dlucio' && (
                <Link
                  to="/admin"
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    location.pathname === '/admin'
                      ? 'bg-blue-600 text-white'
                      : 'text-yellow-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Shield size={18} />
                  Admin
                </Link>
              )}
            </nav>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 p-4 lg:p-6 mt-12 lg:mt-0 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}