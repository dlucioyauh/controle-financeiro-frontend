import axios from 'axios';

/**
 * Retorna a URL base do backend de acordo com o ambiente atual.
 * - Preview da Vercel (qualquer *.vercel.app) → backend de staging
 * - Produção (ionfinance.com.br) → backend de produção
 * - Localhost → usa VITE_API_URL ou localhost:3001
 */
const getApiUrl = (): string => {
  // Verifica se está rodando no navegador
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;

    // Se for um preview da Vercel (contém "vercel.app")
    if (hostname.includes('vercel.app')) {
      return 'https://controle-financeiro-backend-staging.up.railway.app';
    }

    // Se for produção
    if (hostname === 'ionfinance.com.br' || hostname === 'www.ionfinance.com.br') {
      return 'https://api.ionfinance.com.br';
    }
  }

  // Fallback: usa variável de ambiente ou localhost
  return import.meta.env.VITE_API_URL || 'http://localhost:3001';
};

const api = axios.create({
  baseURL: getApiUrl(),
});

// Interceptor para adicionar token JWT
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