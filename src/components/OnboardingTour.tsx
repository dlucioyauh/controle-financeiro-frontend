import { useState, useEffect } from 'react';
import { Joyride } from 'react-joyride';
import type { Step } from 'react-joyride';
import api from '../api';

const steps: Step[] = [
  {
    target: 'body',
    content: '👋 Bem-vindo ao IonFinance! Vamos te guiar pelos primeiros passos para você começar a gerenciar seu negócio.',
    placement: 'center',
  },
  {
    target: '[data-tour="clientes"]',
    content: '📇 Aqui você cadastra seus clientes. Comece adicionando o primeiro!',
    placement: 'bottom',
  },
  {
    target: '[data-tour="precificacao"]',
    content: '🧑‍🍳 Crie seus produtos ou receitas com os ingredientes e defina o preço de venda.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="vendas"]',
    content: '💰 Registre suas vendas e veja o faturamento crescer.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="analytics"]',
    content: '📊 Acompanhe seus resultados com gráficos e análises detalhadas.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="relatorios"]',
    content: '📄 Exporte relatórios profissionais em PDF e Excel para compartilhar.',
    placement: 'bottom',
  },
];

// Força o tipo do componente para any, ignorando erros de tipagem
const JoyrideComponent = Joyride as any;

export default function OnboardingTour() {
  const [run, setRun] = useState(false);
  const [stepsCompleted, setStepsCompleted] = useState<string[]>([]);

  useEffect(() => {
    api.get('/users/onboarding-status')
      .then(res => {
        const data = res.data;
        const completed = Object.keys(data).filter(key => data[key] === true);
        setStepsCompleted(completed);
        if (completed.length < steps.length) {
          setRun(true);
        }
      })
      .catch(() => {});
  }, []);

  const handleJoyrideCallback = (data: any) => {
    const { status, type, step } = data;
    if (type === 'step:after') {
      const stepKey = `step_${step?.index}`;
      if (!stepsCompleted.includes(stepKey)) {
        api.patch('/users/onboarding-status', { step: stepKey, completed: true });
        setStepsCompleted(prev => [...prev, stepKey]);
      }
    }
    if (status === 'finished' || status === 'skipped') {
      setRun(false);
    }
  };

  return (
    <JoyrideComponent
      steps={steps}
      run={run}
      callback={handleJoyrideCallback}
      continuous
      showSkipButton
      showProgress
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