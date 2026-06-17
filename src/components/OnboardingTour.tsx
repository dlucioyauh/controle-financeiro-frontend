import { useState, useEffect } from 'react';
import { Joyride } from 'react-joyride';
import api from '../api';

const JoyrideComponent = Joyride as any;

const steps = [
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

export default function OnboardingTour() {
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [stepsCompleted, setStepsCompleted] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const loadStatus = async () => {
    try {
      const res = await api.get('/users/onboarding-status');
      const data = res.data;
      const completed = Object.keys(data).filter(key => data[key] === true);
      setStepsCompleted(completed);
      if (completed.length >= steps.length) {
        setRun(false);
      } else {
        setRun(true);
        const firstIncomplete = steps.findIndex((_, i) => !completed.includes(`step_${i}`));
        setStepIndex(firstIncomplete >= 0 ? firstIncomplete : 0);
      }
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
    } catch (error) {
      console.error('❌ Erro ao salvar passo:', error);
    }
  };

  // Salva o passo anterior sempre que o índice muda (exceto no início)
  useEffect(() => {
    if (!run) return;
    if (stepIndex > 0) {
      const prevKey = `step_${stepIndex - 1}`;
      if (!stepsCompleted.includes(prevKey)) {
        saveStep(prevKey);
      }
    }
  }, [stepIndex, run]);

  const handleJoyrideCallback = (data: any) => {
    console.log('🔥 CALLBACK EXECUTADO!', data);
    const { status, type, index } = data;

    // Quando o usuário avança para o próximo passo, atualiza o stepIndex
    if (type === 'step:after') {
      const newIndex = index !== undefined ? index : stepIndex + 1;
      if (newIndex !== stepIndex) {
        setStepIndex(newIndex);
      }
    }

    // Quando o tour termina ou é pulado, finaliza e salva o último passo
    if (status === 'finished' || status === 'skipped') {
      console.log('🏁 Tour finalizado ou pulado.');
      setRun(false);
      const lastKey = `step_${steps.length - 1}`;
      if (!stepsCompleted.includes(lastKey)) {
        saveStep(lastKey);
      }
    }
  };

  if (loading) return null;
  if (stepsCompleted.length >= steps.length) return null;

  return (
    <JoyrideComponent
      steps={steps}
      run={run}
      stepIndex={stepIndex}
      callback={handleJoyrideCallback}
      continuous
      showSkipButton
      showProgress
      debug
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