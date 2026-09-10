import { useState, useEffect } from 'react';
import { Joyride, STATUS } from 'react-joyride';
import type { Step } from 'react-joyride';
import { useOnboarding } from '../contexts/OnboardingContext';

interface OnboardingTourProps {
  pageKey: 'dashboard' | 'precificacao' | 'vendas' | 'financeiro';
  steps: Step[];
}

export default function OnboardingTour({ pageKey, steps }: OnboardingTourProps) {
  const { shouldShowTour, markStepAsCompleted } = useOnboarding();
  const [run, setRun] = useState(false);

  useEffect(() => {
    if (shouldShowTour(pageKey)) {
      console.log(`🚀 Iniciando tour para a página: ${pageKey}`);
      const timer = setTimeout(() => setRun(true), 800);
      return () => clearTimeout(timer);
    }
  }, [pageKey, shouldShowTour]);

  const handleJoyrideCallback = (data: any) => {
    const { status, type } = data;
    console.log('🎯 Joyride Callback disparado:', { status, type });
    
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED || type === 'tour:end') {
      console.log(`✅ Tour finalizado ou pulado. Marcando '${pageKey}' como concluído.`);
      setRun(false);
      markStepAsCompleted(pageKey);
    }
  };

  if (!run) return null;

  const joyrideProps = {
    run,
    steps,
    continuous: true,
    showSkipButton: true,
    showProgress: true,
    hideCloseButton: false,
    disableCloseOnEsc: false,
    locale: {
      back: 'Voltar',
      close: 'Fechar',
      last: 'Concluir',
      next: 'Próximo',
      skip: 'Pular tour',
    },
    callback: handleJoyrideCallback,
  } as any;

  return <Joyride {...joyrideProps} />;
}