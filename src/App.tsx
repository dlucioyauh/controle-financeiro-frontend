import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Login from './Login';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Despesas from './pages/Despesas';
import Precificacao from './pages/Precificacao';

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
        <Route path="/" element={<MainLayout onLogout={logout} />}>
          <Route index element={<Dashboard />} />
          <Route path="despesas" element={<Despesas />} />
          <Route path="precificacao" element={<Precificacao />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;