import { useState } from 'react';
import { HelpCircle } from 'lucide-react';

interface TooltipProps {
  text: string;
  example?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export default function Tooltip({ 
  text, 
  example, 
  position = 'bottom' 
}: TooltipProps) {
  const [show, setShow] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-l border-t',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-r border-b',
    left: 'left-full top-1/2 -translate-y-1/2 border-r border-t',
    right: 'right-full top-1/2 -translate-y-1/2 border-l border-b',
  };

  return (
    <div className="relative inline-block ml-2">
      <button
        type="button"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow(!show)}
        className="text-cyan-400 hover:text-cyan-300 transition-colors focus:outline-none"
        aria-label="Ajuda"
      >
        <HelpCircle size={14} />
      </button>
      
      {show && (
        <div className={`absolute z-50 w-64 p-3 bg-gray-800 border border-gray-700 rounded-lg shadow-xl ${positionClasses[position]}`}>
          <p className="text-xs text-gray-200 leading-relaxed">{text}</p>
          {example && (
            <p className="text-[10px] text-cyan-400 mt-2 italic border-t border-gray-700 pt-2">
               Ex: {example}
            </p>
          )}
          <div className={`absolute w-2 h-2 bg-gray-800 border-gray-700 rotate-45 ${arrowClasses[position]}`}></div>
        </div>
      )}
    </div>
  );
}