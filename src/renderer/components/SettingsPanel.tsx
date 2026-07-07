import React, { useState, useRef, useEffect } from 'react';
import { Settings, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { ThemeSwitcher } from './ThemeSwitcher';
import { DatabaseControls } from './DatabaseControls';
import { AuthControls } from './AuthControls';

export function SettingsPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme } = useTheme();
  const { isConfigured } = useAuth();
  
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const isCyber = theme === 'cyberpunk';
  const isMed = theme === 'medieval';
  const isVamp = theme === 'vampire';

  // Toggle settings panel
  const togglePanel = () => setIsOpen(prev => !prev);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        panelRef.current && 
        !panelRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Settings button styling per theme
  const getButtonClass = () => {
    const base = '!fixed bottom-4 right-4 z-[101] w-12 h-12 flex items-center justify-center transition-all duration-300 shadow-2xl';
    if (isCyber) {
      return `${base} rounded-br-xl rounded-tl-xl bg-[#050c18] border border-[#0ff]/50 text-[#0ff] hover:bg-[#0ff]/20 hover:shadow-[0_0_15px_rgba(0,255,255,0.6)] ${isOpen ? 'rotate-90' : ''}`;
    }
    if (isVamp) {
      return `${base} rounded-full bg-[#1a1a24] border border-[#ff3333]/50 text-[#a0a0b0] hover:text-[#ff3333] hover:border-[#ff3333] hover:bg-[#2a0404] hover:shadow-[0_0_15px_rgba(255,0,0,0.6)] ${isOpen ? 'rotate-90 text-[#ff3333]' : ''}`;
    }
    if (isMed) {
      return `${base} rounded-lg wood-plank border-2 border-[#5c2e0b] text-[#f4eacc] hover:shadow-[inset_0_0_10px_rgba(0,0,0,0.5)] ${isOpen ? 'rotate-45' : ''}`;
    }
    return `${base} rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-gray-400 hover:text-white hover:bg-black/80 hover:border-white/35 ${isOpen ? 'rotate-90 text-white' : ''}`;
  };

  // Settings panel styling per theme
  const getPanelClass = () => {
    const base = '!fixed bottom-20 right-4 z-[101] w-80 max-w-[calc(100vw-2rem)] p-5 transition-all duration-300 transform shadow-2xl';
    const visibility = isOpen ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' : 'opacity-0 translate-y-4 scale-95 pointer-events-none';
    
    if (isCyber) {
      return `${base} ${visibility} cyber-smoked-glass border-[#0ff]/50 bg-[#050c18]/95 text-[#0ff] shadow-[0_0_30px_rgba(0,255,255,0.35)] font-mono`;
    }
    if (isVamp) {
      return `${base} ${visibility} bg-[#0d0d12]/95 border border-[#ff3333]/40 text-[#e0e0e0] shadow-[0_0_40px_rgba(80,0,0,0.7)] font-serif rounded-lg`;
    }
    if (isMed) {
      return `${base} ${visibility} wood-plank border-2 border-[#8b4513] text-[#f4eacc] shadow-[inset_0_2px_10px_rgba(139,69,19,0.3),0_15px_30px_rgba(0,0,0,0.6)] rounded-lg font-serif`;
    }
    return `${base} ${visibility} bg-black/80 backdrop-blur-xl border border-white/10 text-white rounded-2xl`;
  };

  // Section header typography per theme
  const getSectionTitleClass = () => {
    if (isCyber) return 'text-[10px] tracking-widest text-[#0ff]/60 font-mono uppercase mb-2';
    if (isVamp) return 'text-xs tracking-wider text-[#ff3333] font-serif uppercase mb-2 italic';
    if (isMed) return 'text-sm tracking-wide text-[#d9c596] font-serif mb-2';
    return 'text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2';
  };

  // Panel title text
  const getPanelHeader = () => {
    if (isCyber) return '[SYS_SETTINGS]';
    if (isVamp) return 'Ajustes Góticos';
    if (isMed) return 'Ajustes da Campanha';
    return 'Settings';
  };

  // Panel border divider color
  const getDividerClass = () => {
    if (isCyber) return 'border-[#0ff]/20 my-4';
    if (isVamp) return 'border-[#ff3333]/20 my-4';
    if (isMed) return 'border-[#8b4513]/30 my-4';
    return 'border-white/10 my-4';
  };

  return (
    <>
      {/* Settings Toggle Button */}
      <button
        ref={buttonRef}
        onClick={togglePanel}
        className={getButtonClass()}
        title="Settings / Configurações"
      >
        {isOpen ? <X size={20} /> : <Settings size={22} />}
      </button>

      {/* Settings Card / Panel */}
      <div ref={panelRef} className={getPanelClass()}>
        {/* Panel Header */}
        <div className="flex items-center justify-between border-b pb-2 mb-4 border-current/10">
          <span className="text-sm font-bold tracking-wider">{getPanelHeader()}</span>
          <button 
            onClick={() => setIsOpen(false)} 
            className="opacity-60 hover:opacity-100 transition-opacity p-0.5"
            title="Fechar"
          >
            <X size={16} />
          </button>
        </div>

        {/* Panel Body */}
        <div className="space-y-4">
          {/* Theme Switcher Section */}
          <div>
            <h4 className={getSectionTitleClass()}>Aparência (Tema)</h4>
            <ThemeSwitcher inline size="md" />
          </div>

          <hr className={getDividerClass()} />

          {/* Database Backup Section */}
          <div>
            <h4 className={getSectionTitleClass()}>Backup & Dados</h4>
            <DatabaseControls inline />
          </div>

          {/* Optional Cloud Sync Section */}
          {isConfigured && (
            <>
              <hr className={getDividerClass()} />
              <div>
                <h4 className={getSectionTitleClass()}>Sincronização Nuvem</h4>
                <div className="flex justify-center p-1">
                  <AuthControls />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
