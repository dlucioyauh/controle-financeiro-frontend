import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import { MainLayout } from './layouts/MainLayout';
import Login from './Login';
import Dashboard from './pages/Dashboard';
import Financeiro from './pages/Financeiro';
import Vendas from './pages/Vendas';
import Precificacao from './pages/Precificacao';
import Analytics from './pages/Analytics';
import Configuracoes from './pages/Configuracoes';

function App() {
  const [autenticado, setAutenticado] = useState(!!localStorage.getItem('token'));

  function logout() {
    localStorage.removeItem('token');
    setAutenticado(false);
  }

  if (!autenticado) {
    return <Login onLogin={() => setAutenticado(true)} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout onLogout={logout} />}>
          <Route index element={<Dashboard />} />
          <Route path="/financeiro" element={<Financeiro />} />
          <Route path="/vendas" element={<Vendas />} />
          <Route path="/precificacao" element={<Precificacao />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;