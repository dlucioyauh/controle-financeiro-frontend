import { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';
import api from '../api';

const steps = [
  {
    title: '👋 Bem-vindo!',
    content: 'Vamos te guiar pelos primeiros passos para você começar a gerenciar seu negócio.',
    target: 'body',
  },
  {
    title: '📇 Clientes',
    content: 'Cadastre seus clientes aqui. Isso ajuda a organizar suas vendas.',
    target: '[data-tour="clientes"]',
  },
  {
    title: '🧑‍🍳 Produtos',
    content: 'Crie seus produtos ou receitas com ingredientes e defina o preço.',
    target: '[data-tour="precificacao"]',
  },
  {
    title: '💰 Vendas',
    content: 'Registre suas vendas e veja o faturamento crescer.',
    target: '[data-tour="vendas"]',
  },
  {
    title: '📊 Analytics',
    content: 'Acompanhe seus resultados com gráficos e análises detalhadas.',
    target: '[data-tour="analytics"]',
  },
  {
    title: '📄 Relatórios',
    content: 'Exporte relatórios profissionais em PDF e Excel.',
    target: '[data-tour="relatorios"]',
  },
];

export default function OnboardingTour() {
  const [stepIndex, setStepIndex] = useState(0);
  const [stepsCompleted, setStepsCompleted] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);

  const loadStatus = async () => {
    try {
      const res = await api.get('/users/onboarding-status');
      const data = res.data;
      const completed = Object.keys(data).filter(key => data[key] === true);
      setStepsCompleted(completed);
      if (completed.length < steps.length) {
        // Determina o primeiro passo não concluído
        const firstIncomplete = steps.findIndex((_, i) => !completed.includes(`step_${i}`));
        setStepIndex(firstIncomplete >= 0 ? firstIncomplete : 0);
        setVisible(true);
      } else {
        setVisible(false);
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
    if (stepsCompleted.includes(stepKey)) return;
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

  const handleNext = async () => {
    // Salva o passo atual
    const currentKey = `step_${stepIndex}`;
    await saveStep(currentKey);

    // Avança para o próximo
    const nextIndex = stepIndex + 1;
    if (nextIndex < steps.length) {
      setStepIndex(nextIndex);
    } else {
      // Último passo: finaliza o tour
      setVisible(false);
      // Salva o último passo (já foi salvo, mas garante)
      const lastKey = `step_${steps.length - 1}`;
      await saveStep(lastKey);
    }
  };

  const handleSkip = async () => {
    // Marca todos os passos como concluídos
    for (let i = 0; i < steps.length; i++) {
      await saveStep(`step_${i}`);
    }
    setVisible(false);
  };

  const handlePrev = () => {
    if (stepIndex > 0) {
      setStepIndex(stepIndex - 1);
    }
  };

  if (loading) return null;
  if (!visible) return null;
  if (stepsCompleted.length >= steps.length) return null;

  const currentStep = steps[stepIndex];
  const isLast = stepIndex === steps.length - 1;
  const progress = ((stepIndex + 1) / steps.length) * 100;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-[#0f172a] border border-slate-700 rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-white">{currentStep.title}</h2>
          <button
            onClick={handleSkip}
            className="text-slate-400 hover:text-white transition"
          >
            <X size={20} />
          </button>
        </div>

        <p className="text-slate-300 text-sm">{currentStep.content}</p>

        <div className="w-full bg-slate-800 rounded-full h-2">
          <div className="bg-cyan-500 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>

        <div className="flex justify-between items-center pt-2">
          <button
            onClick={handlePrev}
            disabled={stepIndex === 0}
            className="px-3 py-1.5 text-sm text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed hover:text-white transition"
          >
            <ChevronLeft size={18} className="inline mr-1" />
            Voltar
          </button>
          <div className="flex gap-2">
            <button
              onClick={handleSkip}
              className="px-3 py-1.5 text-sm text-slate-400 hover:text-white transition"
            >
              Pular
            </button>
            <button
              onClick={handleNext}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition"
            >
              {isLast ? 'Concluir' : 'Próximo'}
              {!isLast && <ChevronRight size={18} className="inline ml-1" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}