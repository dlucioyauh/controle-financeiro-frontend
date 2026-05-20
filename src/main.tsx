import React from 'react';
import ReactDOM from 'react-dom/client';

import './index.css';

import {
  BrowserRouter,
  Routes,
  Route,
} from 'react-router-dom';

import Dashboard from './pages/Dashboard';
import { MainLayout } from './layouts/MainLayout';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>

    <BrowserRouter>

      <Routes>

        <Route element={<MainLayout />}>

          <Route
            path="/"
            element={<Dashboard />}
          />

        </Route>

      </Routes>

    </BrowserRouter>

  </React.StrictMode>,
);