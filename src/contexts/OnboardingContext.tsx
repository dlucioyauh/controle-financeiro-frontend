import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

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
      console.log('🔄 Carregando status do onboarding do localStorage...');
      const steps: Record<string, boolean> = {};
      
      // Busca todas as chaves de onboarding no localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('onboarding_completed_')) {
          const stepName = key.replace('onboarding_completed_', '');
          steps[stepName] = localStorage.getItem(key) === 'true';
        }
      }
      
      console.log('✅ Status carregado do localStorage:', steps);
      setCompletedSteps(steps);
    } catch (error) {
      console.error('❌ Erro ao carregar status do onboarding:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOnboardingStatus();
  }, []);

  const markStepAsCompleted = async (step: string) => {
    try {
      console.log(`💾 Salvando passo '${step}' como concluído no localStorage...`);
      
      // Salva no localStorage imediatamente
      localStorage.setItem(`onboarding_completed_${step}`, 'true');
      
      // Atualiza o estado local
      setCompletedSteps((prev) => ({ ...prev, [step]: true }));
      
      console.log(`✅ Passo '${step}' salvo com sucesso!`);
    } catch (error) {
      console.error(`❌ Erro ao salvar passo ${step}:`, error);
    }
  };

  const shouldShowTour = (step: string) => {
    if (loading) return false;
    
    // Verifica apenas no localStorage e no estado local
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