import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://controle-financeiro-backend-staging.up.railway.app',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

// Função para criar checkout de setup
export const createSetupCheckout = async (priceId: string) => {
  const response = await api.post('/stripe/setup-checkout', { priceId });
  return response.data.url;
};

// Função para criar checkout de assinatura
export const createCheckout = async (priceId: string) => {
  const response = await api.post('/stripe/create-checkout-session', { priceId });
  return response.data.url;
};

// Função para abrir portal do cliente
export const createPortal = async () => {
  const response = await api.get('/stripe/portal');
  return response.data.url;
};