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
import ThemeToggle from '../components/ThemeToggle';

const links = [
  { to: '/app', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/app/analytics', label: 'Analytics', icon: TrendingUp },
  { to: '/app/financeiro', label: 'Financeiro', icon: DollarSign },
  { to: '/app/vendas', label: 'Vendas', icon: ShoppingBag },
  { to: '/app/precificacao', label: 'Precificação', icon: ChefHat },
  { to: '/app/relatorios', label: 'Relatórios', icon: FileText },
  { to: '/app/clientes', label: 'Clientes', icon: Users },
  { to: '/app/configuracoes', label: 'Configurações', icon: Settings },
];

export default function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [logo, setLogo] = useState(localStorage.getItem('logo') || '');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUser(payload);
    } catch {
      navigate('/login');
    }

    if (!localStorage.getItem('logo')) {
      api.get('/users/perfil')
        .then(res => {
          if (res.data.logo) {
            localStorage.setItem('logo', res.data.logo);
            setLogo(res.data.logo);
          }
        })
        .catch(() => {});
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('logo');
    navigate('/login');
  };

  const LogoComponent = () => (
    logo ? (
      <img src={logo} alt="Logo" className="h-8 w-8 rounded object-cover" />
    ) : (
      <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20">
        <ChefHat size={18} className="text-white" />
      </div>
    )
  );

  return (
    <div className="min-h-screen flex bg-[#020617]">
      {/* Sidebar para desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#0f172a] border-r border-slate-800 p-4">
        <div className="flex items-center gap-2 mb-8">
          <LogoComponent />
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
              to="/app/admin"
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                location.pathname === '/app/admin'
                  ? 'bg-blue-600 text-white'
                  : 'text-yellow-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Shield size={18} />
              Admin
            </Link>
          )}
        </nav>
        <div className="mt-4 flex flex-col gap-2">
          <ThemeToggle />
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
          >
            <LogOut size={18} />
            Sair
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#0f172a] border-b border-slate-800 px-4 py-2 flex items-center justify-between">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white">
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <div className="flex items-center gap-2">
          <LogoComponent />
          <span className="text-white font-bold">IonFinance</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button onClick={handleLogout} className="text-slate-400">
            <LogOut size={20} />
          </button>
        </div>
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
                  to="/app/admin"
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    location.pathname === '/app/admin'
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