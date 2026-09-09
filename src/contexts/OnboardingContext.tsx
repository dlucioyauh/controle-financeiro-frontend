import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import api from '../api';

interface OnboardingContextData {
  completedSteps: Record<string, boolean>;
  stepsCompleted: string[]; // ✅ Adicionado para compatibilidade com OnboardingProgress.tsx
  markStepAsCompleted: (step: string) => Promise<void>;
  shouldShowTour: (step: string) => boolean;
  loading: boolean; // ✅ Renomeado de isLoading para compatibilidade
  refreshStatus: () => Promise<void>; // ✅ Adicionado para permitir re-fetch manual
}

const OnboardingContext = createContext<OnboardingContextData>({} as OnboardingContextData);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true); // ✅ Renomeado

  const fetchOnboardingStatus = async () => {
    setLoading(true);
    try {
      const response = await api.get('/users/onboarding-status');
      const data = response.data || {};
      setCompletedSteps(data);
    } catch (error) {
      console.error('Erro ao buscar status do onboarding:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOnboardingStatus();
  }, []);

  const markStepAsCompleted = async (step: string) => {
    try {
      setCompletedSteps((prev) => ({ ...prev, [step]: true }));
      await api.patch('/users/onboarding-status', { step, completed: true });
    } catch (error) {
      console.error(`Erro ao marcar passo ${step} como concluído:`, error);
    }
  };

  const shouldShowTour = (step: string) => {
    if (loading) return false;
    return !completedSteps[step];
  };

  // ✅ Converte o Record em array de strings para o OnboardingProgress.tsx
  const stepsCompletedArray = Object.keys(completedSteps).filter((key) => completedSteps[key]);

  return (
    <OnboardingContext.Provider 
      value={{ 
        completedSteps, 
        stepsCompleted: stepsCompletedArray, 
        markStepAsCompleted, 
        shouldShowTour, 
        loading, 
        refreshStatus: fetchOnboardingStatus 
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}