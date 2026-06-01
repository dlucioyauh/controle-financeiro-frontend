import { AlertTriangle } from 'lucide-react';

interface Props {
  mensagem: string;
}

export function AlertaUpgrade({ mensagem }: Props) {
  return (
    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 flex items-start gap-3 text-xs text-yellow-400">
      <AlertTriangle size={16} className="shrink-0 mt-0.5" />
      <div>
        <p className="font-semibold">Atenção</p>
        <p>{mensagem}</p>
      </div>
    </div>
  );
}