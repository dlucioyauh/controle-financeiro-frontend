import { useState, useEffect } from 'react';
import { Joyride } from 'react-joyride';
import { useOnboarding } from '../contexts/OnboardingContext';

const JoyrideComponent = Joyride as any;

const steps: any[] = [
  { target: 'body', content: '👋 Bem-vindo ao IonFinance!', placement: 'center' },
  { target: '[data-tour="clientes"]', content: '📇 Cadastre seus clientes.', placement: 'bottom' },
  { target: '[data-tour="precificacao"]', content: '🧑‍🍳 Crie seus produtos.', placement: 'bottom' },
  { target: '[data-tour="vendas"]', content: '💰 Registre suas vendas.', placement: 'bottom' },
  { target: '[data-tour="analytics"]', content: '📊 Analise seus resultados.', placement: 'bottom' },
  { target: '[data-tour="relatorios"]', content: '📄 Exporte relatórios.', placement: 'bottom' },
];

export default function OnboardingTour() {
  const { stepsCompleted, markStepCompleted, loading, refreshStatus } = useOnboarding();
  const [run, setRun] = useState(false);

  useEffect(() => {
    if (!loading && stepsCompleted.length < steps.length) {
      setRun(true);
    } else {
      setRun(false);
    }
  }, [loading, stepsCompleted]);

  const handleJoyrideCallback = (data: any) => {
    console.log('🔥 CALLBACK EXECUTADO!', data);
    const { status, type, step, action } = data;

    // Salva o passo atual quando o usuário avança
    if (type === 'step:after' || action === 'next' || action === 'close') {
      const stepIndex = step?.index;
      if (stepIndex !== undefined && stepIndex >= 0) {
        const stepKey = `step_${stepIndex}`;
        // Marca como concluído e recarrega o status
        markStepCompleted(stepKey).then(() => {
          refreshStatus(); // Força recarga após salvar
        });
      }
    }

    if (status === 'finished' || status === 'skipped') {
      console.log('🏁 Tour finalizado ou pulado.');
      setRun(false);
      const lastKey = `step_${steps.length - 1}`;
      if (!stepsCompleted.includes(lastKey)) {
        markStepCompleted(lastKey).then(() => {
          refreshStatus();
        });
      }
    }
  };

  if (loading || stepsCompleted.length >= steps.length) return null;

  return (
    <JoyrideComponent
      steps={steps}
      run={run}
      callback={handleJoyrideCallback}
      continuous
      showSkipButton
      showProgress
      disableOverlayClose
      disableScrolling
      styles={{
        options: {
          primaryColor: '#0284c7',
          textColor: '#f8fafc',
          zIndex: 1000,
        },
      }}
      locale={{
        back: 'Voltar',
        close: 'Fechar',
        last: 'Último',
        next: 'Próximo',
        skip: 'Pular',
      }}
    />
  );
}