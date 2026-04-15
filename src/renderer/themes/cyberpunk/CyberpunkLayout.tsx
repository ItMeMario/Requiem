import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { CyberpunkBg } from './cyberpunkAssets/CyberpunkBg';
import './cyberpunk.css';

import { Play } from 'lucide-react';

interface CyberpunkLayoutProps {
  children: React.ReactNode;
  lastOpenedCampaign?: any;
  handleSelectCampaign?: (camp: any) => void;
}

export function CyberpunkLayout({ children, lastOpenedCampaign, handleSelectCampaign }: CyberpunkLayoutProps) {
  const { theme } = useTheme();

  if (theme !== 'cyberpunk') {
    return (
      <div className="flex flex-col h-screen w-full overflow-hidden bg-surface-app text-primary font-sans relative">
        {children}
      </div>
    );
  }

  return (
    <div 
      className="flex h-screen w-full p-2 sm:p-4 md:p-6 overflow-hidden relative font-base select-none"
      style={{ backgroundColor: '#02050a', color: '#0ff' }}
      data-theme="cyberpunk"
    >
      {/* Smoky Ambient Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#0ff] opacity-[0.02] blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-[#0055ff] opacity-[0.03] blur-[150px] rounded-full pointer-events-none" />

      {/* Reactive Neural Network Background */}
      <CyberpunkBg />

      {/* Retro CRT Scanlines Overlay */}
      <div className="fixed inset-0 crt-scanlines z-50 pointer-events-none" />
      
      {/* Background Tech Grid */}
      <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none" />

      {/* Main Cyber Frame */}
      <div className="flex w-full h-full bg-transparent overflow-hidden relative rounded-sm shadow-[0_0_20px_rgba(0,255,255,0.1)] border border-[#0ff]/20 z-10 flex-col">
        
        {/* Top Tech Bar (Structural Header matching Medieval) */}
        <div className="h-24 bg-[#02050a]/90 backdrop-blur border-b-2 border-[#0ff] shadow-[0_4px_20px_rgba(0,255,255,0.3)] z-30 flex items-center justify-between relative shrink-0">
           <div className="absolute inset-0 bg-[#0ff]/5 pointer-events-none cyber-glitch-bg" />
           <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#0ff] to-transparent shadow-[0_0_8px_#0ff] pointer-events-none" />

           <div className="text-[#0ff] text-4xl md:text-5xl lg:text-6xl font-mono tracking-[0.3em] pl-4 md:pl-20 drop-shadow-[0_0_10px_rgba(0,255,255,1)] z-10 uppercase font-bold" style={{ textShadow: '2px 0 0 rgba(255,0,255,0.5), -2px 0 0 rgba(0,255,255,0.5)' }}>
             REQUIEM
           </div>

           {/* Central Cyber Clasp */}
           <div className="absolute top-[16px] left-1/2 -translate-x-1/2 w-28 h-28 bg-[#02050a] rounded-full shadow-[0_0_20px_rgba(0,255,255,0.4)] z-40 flex items-center justify-center border-4 border-[#0ff]/50 transition-transform hover:scale-105 cursor-pointer neon-ring-pulse">
               <div className="w-20 h-20 bg-[#02050a] rounded-full flex items-center justify-center shadow-[inset_0_0_20px_rgba(0,255,255,0.5)] border border-[#0ff]">
                   <div className="w-14 h-14 rounded-full border border-[#0ff]/50 flex items-center justify-center relative" style={{ background: 'radial-gradient(circle, rgba(0,255,255,0.1), transparent)' }}>
                      <div className="absolute inset-0 border-[2px] border-dashed border-[#b400ff]/40 rounded-full animate-[spin_10s_linear_infinite]" />
                      <span className="text-lg font-mono text-[#0ff] font-bold z-10 cyber-glitch tracking-widest mt-0.5" data-text="[SYS]" style={{ textShadow: '0 0 8px rgba(0,255,255,0.8)' }}>
                        [SYS]
                      </span>
                   </div>
               </div>
           </div>
        </div>

        {/* Frame corner decorative elements */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#0ff] pointer-events-none" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#0ff] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#0ff] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#0ff] pointer-events-none" />

        <div className="flex-1 flex flex-col w-full h-full relative z-10 overflow-hidden overflow-y-auto terminal-content-wrapper">
          {/* We will inject a global CSS file or handle text colors explicitly in App via data-theme, 
              but CyberpunkLayout guarantees the container has the right aesthetics. */}
          {children}
        </div>
      </div>
    </div>
  );
}
