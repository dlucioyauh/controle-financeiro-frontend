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

const JoyrideComponent = Joyride as any;

export default function OnboardingTour() {
  const [run, setRun] = useState(false);
  const [stepsCompleted, setStepsCompleted] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Função para carregar o status do onboarding
  const loadOnboardingStatus = async () => {
    try {
      const res = await api.get('/users/onboarding-status');
      const data = res.data;
      const completed = Object.keys(data).filter(key => data[key] === true);
      setStepsCompleted(completed);
      setRun(completed.length < steps.length);
      console.log('📊 Status carregado:', completed);
    } catch (error) {
      console.error('Erro ao carregar onboarding status:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOnboardingStatus();
  }, []);

  const handleJoyrideCallback = async (data: any) => {
    const { status, type, step } = data;
    console.log('🔄 Evento do tour:', { status, type, stepIndex: step?.index });

    if (type === 'step:after') {
      const stepKey = `step_${step?.index}`;
      console.log('✅ Salvando passo:', stepKey);

      // Se o passo já foi salvo, não envia novamente
      if (stepsCompleted.includes(stepKey)) {
        console.log('⏭️ Passo já concluído, ignorando.');
        return;
      }

      try {
        const response = await api.patch('/users/onboarding-status', {
          step: stepKey,
          completed: true,
        });
        console.log('📥 Resposta do backend:', response.data);

        // Atualiza o estado local com os passos completos
        setStepsCompleted(prev => [...prev, stepKey]);

        // Recarrega o status do backend para sincronizar
        await loadOnboardingStatus();
      } catch (error) {
        console.error('❌ Erro ao salvar passo:', error);
      }
    }

    if (status === 'finished' || status === 'skipped') {
      console.log('🏁 Tour finalizado ou pulado.');
      setRun(false);
      // Recarrega o status para garantir que tudo foi salvo
      loadOnboardingStatus();
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