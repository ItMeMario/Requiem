import React from 'react';
import { Sword, Terminal, Droplet } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ThemeSwitcherProps {
  size?: 'sm' | 'md';
}

export function ThemeSwitcher({ size = 'md' }: ThemeSwitcherProps) {
  const { theme, setTheme } = useTheme();

  const isSmall = size === 'sm';
  const isCyber = theme === 'cyberpunk';
  const containerClass = `fixed top-4 right-4 z-[100] flex gap-1.5 ${isSmall ? 'p-1 scale-90 origin-right' : 'p-1.5'} ${isCyber ? 'bg-transparent' : 'bg-black/60 backdrop-blur-md rounded-xl border border-white/10 shadow-2xl'}`;
  
  const buttonClass = (targetTheme: string) => {
    // Base button styles: size and shape
    const baseSize = isSmall ? 'w-8 h-8' : 'w-10 h-10'; // slightly smaller sizing
    const base = `flex items-center justify-center transition-all ${baseSize} ${isCyber ? 'rounded-br-lg rounded-tl-lg' : 'rounded-lg'} `;
    const isActive = theme === targetTheme;
    
    if (isActive) {
      if (targetTheme === 'medieval') return `${base} bg-[#2a2015] text-amber-500 border border-amber-600/50 shadow-[0_0_12px_rgba(245,158,11,0.4)]`;
      if (targetTheme === 'cyberpunk') return `${base} bg-[#0ff]/10 text-[#0ff] border border-[#0ff] shadow-[0_0_8px_rgba(0,255,255,0.4)]`;
      if (targetTheme === 'vampire') {
        // Emphasize vampire mode with a deep red background, brighter text, thicker border, and a subtle pulse
        return `${base} bg-[#2a0404] text-[#ff6666] border border-[#8b0000] shadow-[0_0_8px_rgba(255,0,0,0.7)] animate-pulse`;
      }
    }
    
    // Inactive themes get a solid background to stand out
    if (isCyber) return `${base} bg-[#050c18] border border-[#0ff]/30 text-[#0ff]/60 hover:text-[#0ff] hover:border-[#0ff]/70 hover:bg-[#0ff]/20`;
    
    return `${base} bg-[#1a1a1a] text-gray-400 border border-[#333] shadow-md hover:bg-[#2a2a2a] hover:text-gray-100 hover:border-gray-500`;
  };

  const iconSize = isSmall ? 14 : 16;

  return (
    <div className={containerClass}>

      <button
        onClick={() => setTheme('medieval')}
        className={buttonClass('medieval')}
        title="Medieval Mode"
      >
        <Sword size={iconSize} />
      </button>
      <button
        onClick={() => setTheme('cyberpunk')}
        className={buttonClass('cyberpunk')}
        title="Cyberpunk Mode"
      >
        <Terminal size={iconSize} />
      </button>
      <button
        onClick={() => setTheme('vampire')}
        className={buttonClass('vampire')}
        title="Vampire Mode"
      >
        <Droplet size={iconSize} />
      </button>
    </div>
  );
}
