import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://controle-financeiro-backend-staging.up.railway.app',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  console.log('🔑 Token sendo enviado:', token ? '✅ existe' : '❌ não encontrado');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;