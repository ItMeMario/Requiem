import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { VampireBg } from './vampireAssets/VampireBg';
import './vampire.css';

import { Play } from 'lucide-react';

interface VampireLayoutProps {
  children: React.ReactNode;
  lastOpenedCampaign?: any;
  handleSelectCampaign?: (camp: any) => void;
}

export function VampireLayout({ children, lastOpenedCampaign, handleSelectCampaign }: VampireLayoutProps) {
  const { theme } = useTheme();

  if (theme !== 'vampire') {
    return (
      <div className="flex flex-col h-screen w-full overflow-hidden bg-surface-app text-primary font-sans relative">
        {children}
      </div>
    );
  }

  return (
    <div 
      className="flex h-screen w-full bg-transparent overflow-hidden relative font-sans text-[#d1d1d6]"
      data-theme="vampire"
    >
      <VampireBg />

      {/* Main Gothic Frame */}
      <div className="gothic-castle-frame absolute inset-0 z-10 pointer-events-none flex flex-col">
        
        {/* Castle Ceiling / Vaulted Arch */}
        <div className="castle-ceiling relative w-full h-16 flex justify-center z-30">
          <div className="castle-arch" />
        </div>

        {/* Pillars framing the left and right */}
        <div className="castle-pillar pillar-left z-20" />
        <div className="castle-pillar pillar-right z-20" />
        
        {/* Stone Walls for Borders */}
        <div className="absolute top-0 bottom-0 left-0 w-20 castle-wall-side shadow-[inset_-20px_0_40px_rgba(0,0,0,0.9)] z-10" />
        <div className="absolute top-0 bottom-0 right-0 w-20 castle-wall-side shadow-[inset_20px_0_40px_rgba(0,0,0,0.9)] z-10" />
        <div className="absolute bottom-0 left-0 right-0 h-16 castle-wall-floor shadow-[inset_0_20px_40px_rgba(0,0,0,0.9)] z-10" />

        {/* Inner shadow over edge of the viewing area */}
        <div className="absolute top-12 bottom-10 left-20 right-20 shadow-[inset_0_0_120px_rgba(0,0,0,1)] pointer-events-none z-30" />
      </div>

      {/* Content area */}
      <div className="flex-1 flex flex-col w-full h-full relative z-20 overflow-hidden px-8 md:px-16 lg:px-24 pt-12 pb-16">
        
        {/* Top Gothic Header matching Medieval */}
        <div className="h-24 bg-[#0a0a0f] border-y border-[#3d3d4a] shadow-[0_15px_30px_rgba(0,0,0,0.9)] z-30 flex items-center justify-between relative shrink-0 mb-6">
           <div className="absolute inset-0 bg-[#8b0000] mix-blend-multiply opacity-20 pointer-events-none" />
           
           <div className="text-[#a0a0b0] text-4xl md:text-5xl lg:text-6xl font-serif tracking-[0.2em] pl-4 md:pl-20 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] z-10 font-bold" style={{ textShadow: '0 0 10px rgba(255,0,0,0.2), 0 2px 4px rgba(0,0,0,1)' }}>
             REQUIEM
           </div>

           {/* Central Gothic Clasp */}
           <div className="absolute top-[16px] left-1/2 -translate-x-1/2 w-28 h-28 bg-[#0a0a0f] rounded-full shadow-[0_10px_20px_rgba(0,0,0,0.8)] z-40 flex items-center justify-center border-4 border-[#1f1f2e] transition-transform hover:scale-105 cursor-pointer hover:border-[#500000] duration-500">
               <div className="w-20 h-20 bg-gradient-to-b from-[#1a1a24] to-[#050508] rounded-full flex items-center justify-center shadow-[inset_0_2px_8px_rgba(255,0,0,0.1),0_2px_10px_rgba(0,0,0,0.8)] border border-[#3d3d4a]">
                   <div className="w-14 h-14 rounded-full border border-[#500000] flex items-center justify-center" style={{ background: 'radial-gradient(circle, #2a0000, #0a0a0f)' }}>
                      <span className="text-2xl font-serif text-[#ff3333] flex items-center justify-center pt-1 tracking-widest drop-shadow-[0_0_8px_rgba(255,0,0,0.8)]">
                        ☽☉☾
                      </span>
                   </div>
               </div>
           </div>
        </div>

        {/* Scrollable Children Container */}
        <div className="flex-1 overflow-y-auto bg-[#0d0d12]/60 backdrop-blur-sm border border-[#1f1f2e] shadow-[inset_0_0_40px_rgba(0,0,0,0.8)] rounded-sm relative z-20">
          {children}
        </div>
      </div>
    </div>
  );
}
