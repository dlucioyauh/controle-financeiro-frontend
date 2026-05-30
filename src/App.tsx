import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Financeiro from './pages/Financeiro';
import Vendas from './pages/Vendas';
import Precificacao from './pages/Precificacao';
import Relatorios from './pages/Relatorios';
import Clientes from './pages/Clientes';
import Configuracoes from './pages/Configuracoes';
import Landing from './pages/Landing';
import Login from './Login';
import Register from './pages/Register';
import Admin from './pages/Admin';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  useEffect(() => {
    const tema = localStorage.getItem('tema') || 'dark';
    document.documentElement.classList.toggle('light', tema === 'light');
    document.documentElement.classList.toggle('dark', tema === 'dark');
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="financeiro" element={<Financeiro />} />
          <Route path="vendas" element={<Vendas />} />
          <Route path="precificacao" element={<Precificacao />} />
          <Route path="relatorios" element={<Relatorios />} />
          <Route path="clientes" element={<Clientes />} />
          <Route path="configuracoes" element={<Configuracoes />} />
          <Route path="admin" element={<Admin />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}