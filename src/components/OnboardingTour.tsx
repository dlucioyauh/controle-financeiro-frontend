import { useState, useEffect } from 'react';
import { Joyride } from 'react-joyride';
import type { Step } from 'react-joyride';
import api from '../api';

const steps: Step[] = [
  {
    target: 'body',
    content: '👋 Bem-vindo ao IonFinance! Vamos te guiar pelos primeiros passos.',
    placement: 'center',
  },
  {
    target: '[data-tour="clientes"]',
    content: '📇 Cadastre seus clientes aqui.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="precificacao"]',
    content: '🧑‍🍳 Crie seus produtos com ingredientes.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="vendas"]',
    content: '💰 Registre suas vendas.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="analytics"]',
    content: '📊 Acompanhe seus resultados.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="relatorios"]',
    content: '📄 Exporte relatórios.',
    placement: 'bottom',
  },
];

const JoyrideComponent = Joyride as any;

export default function OnboardingTour() {
  const [run, setRun] = useState(false);
  const [stepsCompleted, setStepsCompleted] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const loadStatus = async () => {
    try {
      const res = await api.get('/users/onboarding-status');
      const data = res.data;
      const completed = Object.keys(data).filter(key => data[key] === true);
      setStepsCompleted(completed);
      setRun(completed.length < steps.length);
      console.log('📊 Status carregado:', completed);
    } catch (error) {
      console.error('Erro ao carregar status:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const saveStep = async (stepKey: string) => {
    if (stepsCompleted.includes(stepKey)) {
      console.log('⏭️ Passo já salvo:', stepKey);
      return;
    }

    console.log('📤 Salvando passo:', stepKey);
    try {
      const response = await api.patch('/users/onboarding-status', {
        step: stepKey,
        completed: true,
      });
      console.log('✅ Resposta do backend:', response.data);
      setStepsCompleted(prev => [...prev, stepKey]);
      await loadStatus(); // recarrega do backend
    } catch (error) {
      console.error('❌ Erro ao salvar passo:', error);
    }
  };

  const handleJoyrideCallback = (data: any) => {
    console.log('🔄 Evento Joyride:', data);

    const { status, type, step, action } = data;

    // Quando um passo é concluído (próximo ou finalizado)
    if (type === 'step:after' || action === 'next' || action === 'close') {
      const stepIndex = step?.index;
      if (stepIndex !== undefined && stepIndex >= 0) {
        const stepKey = `step_${stepIndex}`;
        // Salva o passo atual
        saveStep(stepKey);
      }
    }

    // Quando o tour termina ou é pulado, finaliza
    if (status === 'finished' || status === 'skipped') {
      console.log('🏁 Tour finalizado.');
      setRun(false);
      // Salva o último passo (se não foi salvo)
      const lastIndex = steps.length - 1;
      const lastKey = `step_${lastIndex}`;
      if (!stepsCompleted.includes(lastKey)) {
        saveStep(lastKey);
      }
    }
  };

  if (loading) return null;

  return (
    <JoyrideComponent
      steps={steps}
      run={run}
      callback={handleJoyrideCallback}
      continuous
      showSkipButton
      showProgress
      debug // <- ATIVA LOGS DETALHADOS DO JOYRIDE
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