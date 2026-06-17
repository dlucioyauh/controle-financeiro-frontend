import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import api from '../api';

interface OnboardingContextType {
  stepsCompleted: string[];
  totalSteps: number;
  loading: boolean;
  refreshStatus: () => Promise<void>;
  markStepCompleted: (stepKey: string) => Promise<void>;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [stepsCompleted, setStepsCompleted] = useState<string[]>([]);
  const [totalSteps] = useState(6);
  const [loading, setLoading] = useState(true);

  const refreshStatus = async () => {
    try {
      const res = await api.get('/users/onboarding-status');
      const data = res.data;
      const completed = Object.keys(data).filter(key => data[key] === true);
      console.log('📊 Status recarregado:', completed);
      setStepsCompleted(completed);
    } catch (error) {
      console.error('Erro ao carregar onboarding:', error);
    } finally {
      setLoading(false);
    }
  };

  const markStepCompleted = async (stepKey: string) => {
    if (stepsCompleted.includes(stepKey)) {
      console.log('⏭️ Passo já salvo:', stepKey);
      return;
    }
    console.log('📤 Salvando passo:', stepKey);
    try {
      await api.patch('/users/onboarding-status', { step: stepKey, completed: true });
      await refreshStatus();
    } catch (error) {
      console.error('❌ Erro ao salvar passo:', error);
    }
  };

  useEffect(() => {
    refreshStatus();
  }, []);

  const value = useMemo(
    () => ({ stepsCompleted, totalSteps, loading, refreshStatus, markStepCompleted }),
    [stepsCompleted, loading, totalSteps]
  );

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) throw new Error('useOnboarding must be used within OnboardingProvider');
  return context;
}