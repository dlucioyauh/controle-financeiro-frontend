import { type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionLink?: string;
  className?: string;
}

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  actionLink,
  className = '',
}: EmptyStateProps) {
  const navigate = useNavigate();

  const handleAction = () => {
    if (actionLink) {
      navigate(actionLink);
    } else if (onAction) {
      onAction();
    }
  };

  return (
    <div
      className={`flex flex-col items-center justify-center text-center py-16 px-6 border-2 border-dashed border-slate-700 rounded-xl bg-slate-800/20 ${className}`}
      role="status"
      aria-label={title}
    >
      <div className="w-16 h-16 rounded-full bg-slate-700/30 flex items-center justify-center mb-4 text-cyan-400">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-400 max-w-sm mb-6">{description}</p>
      {actionLabel && (
        <button
          onClick={handleAction}
          className="bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors shadow-lg shadow-cyan-600/20"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
