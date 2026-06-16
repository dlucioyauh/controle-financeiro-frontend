import { useEffect, useState } from 'react';
import { CheckCircle, Circle } from 'lucide-react';
import api from '../api';

const STEPS = [
  { key: 'step_0', label: 'Boas-vindas' },
  { key: 'step_1', label: 'Cadastrar cliente' },
  { key: 'step_2', label: 'Criar produto' },
  { key: 'step_3', label: 'Registrar venda' },
  { key: 'step_4', label: 'Ver Analytics' },
  { key: 'step_5', label: 'Gerar relatório' },
];

export default function OnboardingProgress() {
  const [completed, setCompleted] = useState<string[]>([]);

  useEffect(() => {
    api.get('/users/onboarding-status').then(res => {
      const data = res.data;
      const done = Object.keys(data).filter(key => data[key] === true);
      setCompleted(done);
    }).catch(() => {});
  }, []);

  const progress = Math.min((completed.length / STEPS.length) * 100, 100);

  if (completed.length >= STEPS.length) return null;

  return (
    <div className="bg-[#0f172a] border border-slate-800 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-white">Seu progresso no onboarding</span>
        <span className="text-xs text-slate-400">{completed.length} / {STEPS.length}</span>
      </div>
      <div className="w-full bg-slate-800 rounded-full h-2 mb-3">
        <div className="bg-cyan-500 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
      </div>
      <div className="flex flex-wrap gap-2">
        {STEPS.map((step) => {
          const done = completed.includes(step.key);
          return (
            <div key={step.key} className="flex items-center gap-1 text-xs">
              {done ? (
                <CheckCircle size={14} className="text-emerald-400" />
              ) : (
                <Circle size={14} className="text-slate-500" />
              )}
              <span className={done ? 'text-slate-300' : 'text-slate-500'}>{step.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}