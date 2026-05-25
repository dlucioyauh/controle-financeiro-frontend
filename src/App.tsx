import Landing from './pages/Landing';
import Register from './pages/Register';
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
import Clientes from './pages/Clientes';
import Relatorios from './pages/Relatorios';

function App() {
  const [autenticado, setAutenticado] = useState(!!localStorage.getItem('token'));

  function handleLogin() {
    setAutenticado(true);
  }

  function logout() {
    localStorage.removeItem('token');
    setAutenticado(false);
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Públicas */}
        <Route path="/landing" element={<Landing />} />
        <Route
          path="/register"
          element={
            autenticado ? (
              <Navigate to="/" replace />
            ) : (
              <Register onRegister={handleLogin} />
            )
          }
        />
        <Route
          path="/login"
          element={
            autenticado ? (
              <Navigate to="/" replace />
            ) : (
              <Login onLogin={handleLogin} />
            )
          }
        />

        {/* Protegidas */}
        <Route
          element={
            autenticado ? (
              <MainLayout onLogout={logout} />
            ) : (
              <Navigate to="/landing" replace />
            )
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="/financeiro" element={<Financeiro />} />
          <Route path="/vendas" element={<Vendas />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/precificacao" element={<Precificacao />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/relatorios" element={<Relatorios />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
        </Route>

        {/* Fallback */}
        <Route
          path="*"
          element={
            autenticado ? <Navigate to="/" replace /> : <Navigate to="/landing" replace />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;