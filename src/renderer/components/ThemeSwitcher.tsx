import React from 'react';
import { Sun, Moon, Sword } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ThemeSwitcherProps {
  size?: 'sm' | 'md';
}

export function ThemeSwitcher({ size = 'md' }: ThemeSwitcherProps) {
  const { theme, setTheme } = useTheme();

  const isSmall = size === 'sm';
  const containerClass = `flex ${isSmall ? 'p-0.5 scale-90 origin-right' : 'p-1'} bg-surface-deep rounded border border-border-subtle`;
  const buttonClass = (targetTheme: string) => {
    const base = `flex items-center justify-center rounded transition-colors ${isSmall ? 'w-8 h-8' : 'w-10 h-8'}`;
    const isActive = theme === targetTheme;
    
    if (isActive) {
      if (targetTheme === 'light') return `${base} bg-surface-hover text-yellow-500 shadow-sm`;
      if (targetTheme === 'dark') return `${base} bg-surface-hover text-accent-text shadow-sm`;
      if (targetTheme === 'medieval') return `${base} bg-surface-hover text-amber-500 shadow-sm`;
    }
    
    return `${base} text-faint hover:text-secondary`;
  };

  const iconSize = isSmall ? 14 : 16;

  return (
    <div className={containerClass}>
      <button
        onClick={() => setTheme('light')}
        className={buttonClass('light')}
        title="Light Mode"
      >
        <Sun size={iconSize} />
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={buttonClass('dark')}
        title="Dark Mode"
      >
        <Moon size={iconSize} />
      </button>
      <button
        onClick={() => setTheme('medieval')}
        className={buttonClass('medieval')}
        title="Medieval Mode"
      >
        <Sword size={iconSize} />
      </button>
    </div>
  );
}
