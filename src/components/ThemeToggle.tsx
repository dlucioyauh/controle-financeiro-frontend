import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useFeatureFlag } from '../contexts/FeatureFlagsContext';

export default function ThemeToggle() {
  const darkModeEnabled = useFeatureFlag('dark_mode');
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Sincroniza com o tema atual do localStorage ao montar
    const tema = localStorage.getItem('tema') || 'dark';
    const isDarkMode = tema === 'dark';
    setIsDark(isDarkMode);
    document.documentElement.classList.toggle('dark', isDarkMode);
    document.documentElement.classList.toggle('light', !isDarkMode);
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    const newTheme = newIsDark ? 'dark' : 'light';
    localStorage.setItem('tema', newTheme);
    document.documentElement.classList.toggle('dark', newIsDark);
    document.documentElement.classList.toggle('light', !newIsDark);
  };

  if (!darkModeEnabled) return null; // só exibe se a flag estiver ativa

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-[#020617] border border-slate-700 text-slate-400 hover:text-slate-200 transition"
      aria-label="Alternar tema"
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}