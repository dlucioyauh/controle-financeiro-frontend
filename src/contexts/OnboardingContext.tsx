import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import api from '../api';

interface OnboardingContextData {
  completedSteps: Record<string, boolean>;
  stepsCompleted: string[];
  markStepAsCompleted: (step: string) => Promise<void>;
  shouldShowTour: (step: string) => boolean;
  loading: boolean;
  refreshStatus: () => Promise<void>;
}

const OnboardingContext = createContext<OnboardingContextData>({} as OnboardingContextData);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  const fetchOnboardingStatus = async () => {
    setLoading(true);
    try {
      console.log('🔄 Buscando status do onboarding no backend...');
      const response = await api.get('/users/onboarding-status');
      const data = response.data || {};
      console.log('✅ Status recebido do backend:', data);
      setCompletedSteps(data);
    } catch (error) {
      console.error('❌ Erro ao buscar status do onboarding:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOnboardingStatus();
  }, []);

  const markStepAsCompleted = async (step: string) => {
    try {
      console.log(`💾 Salvando passo '${step}' como concluído...`);
      
      // 1. Atualiza localmente imediatamente (Optimistic UI)
      setCompletedSteps((prev) => {
        const updated = { ...prev, [step]: true };
        // 2. Salva também no localStorage como fallback de segurança
        localStorage.setItem(`onboarding_completed_${step}`, 'true');
        return updated;
      });

      // 3. Envia para o backend
      const response = await api.patch('/users/onboarding-status', { step, completed: true });
      console.log('✅ Resposta do backend ao salvar:', response.data);
    } catch (error) {
      console.error(`❌ Erro ao marcar passo ${step} como concluído no backend:`, error);
      // Mesmo se o backend falhar, o localStorage já garantiu que não vai reaparecer no F5
    }
  };

  const shouldShowTour = (step: string) => {
    if (loading) return false;
    
    // Verifica no estado vindo do backend OU no fallback do localStorage
    const isCompletedInState = completedSteps[step];
    const isCompletedInStorage = localStorage.getItem(`onboarding_completed_${step}`) === 'true';
    
    const shouldShow = !(isCompletedInState || isCompletedInStorage);
    console.log(`🔍 shouldShowTour('${step}'): Estado=${isCompletedInState}, Storage=${isCompletedInStorage}, Resultado=${shouldShow}`);
    
    return shouldShow;
  };

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