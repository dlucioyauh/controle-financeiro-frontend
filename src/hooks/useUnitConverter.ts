import { useState, useCallback } from 'react';

/**
 * Hook para conversão automática de unidades de medida
 * Permite que usuários digitem "380g" e o sistema converte para 0,380 kg
 */
export function useUnitConverter(initialValue: string = '') {
  const [rawValue, setRawValue] = useState(initialValue);
  const [normalizedValue, setNormalizedValue] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const parseUnit = useCallback((input: string): number => {
    if (!input || typeof input !== 'string') return 0;

    const str = input.toLowerCase().trim();
    
    // Regex para capturar número e unidade
    const match = str.match(/^([\d.,]+)\s*(kg|g|gramas|grama|l|litro|litros|ml|mililitro|mililitros|un|und|unidade|unidades|pacote|pacotes|caixa|caixas)?$/);
    
    if (!match) {
      const num = parseFloat(str.replace(',', '.'));
      if (isNaN(num)) {
        setError('Valor inválido');
        return 0;
      }
      setError(null);
      return num;
    }
    
    const [, numStr, unit] = match;
    const num = parseFloat(numStr.replace(',', '.'));
    
    if (isNaN(num)) {
      setError('Valor inválido');
      return 0;
    }
    
    // Normaliza para kg (peso) ou L (volume)
    let normalized = num;
    switch (unit) {
      case 'g':
      case 'gramas':
      case 'grama':
        normalized = num / 1000;
        break;
      case 'ml':
      case 'mililitro':
      case 'mililitros':
        normalized = num / 1000;
        break;
      case 'kg':
      case 'l':
      case 'litro':
      case 'litros':
        normalized = num;
        break;
      default:
        normalized = num;
    }
    
    setError(null);
    return normalized;
  }, []);

  const handleChange = useCallback((value: string) => {
    setRawValue(value);
    const normalized = parseUnit(value);
    setNormalizedValue(normalized);
  }, [parseUnit]);

  const formatDisplay = useCallback((value: number): string => {
    if (value === 0) return '0';
    
    // Se for menor que 1, exibe em gramas/ml
    if (value < 1) {
      return `${(value * 1000).toFixed(0)}g`;
    }
    return `${value.toFixed(2).replace('.', ',')}kg`;
  }, []);

  return {
    rawValue,
    normalizedValue,
    error,
    handleChange,
    formatDisplay,
    setNormalizedValue,
  };
}