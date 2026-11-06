import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  compact?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '', compact = false }) => {
  const { resolvedTheme, toggleTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      type="button"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className={`group relative flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl border transition-all duration-300 active:scale-95 ${
        isDark
          ? 'bg-dark-850 hover:bg-dark-800 border-slate-700/60 text-slate-300 hover:text-amber-300 shadow-sm'
          : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700 hover:text-indigo-600 shadow-sm'
      } ${className}`}
    >
      <div className="relative w-8 h-4 bg-slate-700/40 dark:bg-slate-800 rounded-full p-0.5 flex items-center transition-colors">
        <div
          className={`w-3.5 h-3.5 rounded-full shadow-md transform transition-transform duration-300 flex items-center justify-center ${
            isDark
              ? 'translate-x-4 bg-indigo-500 text-white'
              : 'translate-x-0 bg-amber-400 text-amber-950'
          }`}
        >
          {isDark ? (
            <Moon className="w-2.5 h-2.5" />
          ) : (
            <Sun className="w-2.5 h-2.5" />
          )}
        </div>
      </div>

      {!compact && (
        <span className="text-[11px] font-semibold select-none hidden sm:inline-block">
          {isDark ? 'Dark' : 'Light'}
        </span>
      )}
    </button>
  );
};
