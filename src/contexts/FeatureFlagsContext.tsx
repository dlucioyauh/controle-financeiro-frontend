import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

interface FeatureFlagsContextType {
  flags: Record<string, boolean>;
  refreshFlags: () => Promise<void>;
}

const FeatureFlagsContext = createContext<FeatureFlagsContextType | undefined>(undefined);

export const FeatureFlagsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [flags, setFlags] = useState<Record<string, boolean>>({});

  const refreshFlags = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Se não tiver token (ou for uma string inválida), nem tenta buscar.
      // Isso evita erros 401 em telas públicas como /login ou /resetar-senha
      if (!token || token === 'undefined' || token === 'null') {
        setFlags({});
        return;
      }

      const res = await api.get('/features');
      setFlags(res.data);
    } catch (error: any) {
      // Se for erro 401 (não autorizado), o token está expirado ou inválido.
      // Silenciamos o erro e limpamos o localStorage para forçar um login limpo depois.
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');
        setFlags({});
        return;
      }
      
      // Para outros erros (ex: 500, rede), logamos para debug
      console.error('Erro ao carregar feature flags:', error);
    }
  };

  useEffect(() => {
    refreshFlags();
    const interval = setInterval(refreshFlags, 5 * 60 * 1000); // a cada 5 minutos
    return () => clearInterval(interval);
  }, []);

  return (
    <FeatureFlagsContext.Provider value={{ flags, refreshFlags }}>
      {children}
    </FeatureFlagsContext.Provider>
  );
};

export const useFeatureFlag = (flagName: string): boolean => {
  const context = useContext(FeatureFlagsContext);
  if (!context) throw new Error('useFeatureFlag must be used within FeatureFlagsProvider');
  return !!context.flags[flagName];
};