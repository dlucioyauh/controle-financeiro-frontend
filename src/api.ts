import axios from 'axios';

const api = axios.create({
  baseURL: 'https://controle-financeiro-backend-production-dc8c.up.railway.app',
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