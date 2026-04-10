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
        <div className="castle-ceiling relative w-full h-32 flex justify-center z-30">
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
        <div className="absolute top-24 bottom-10 left-20 right-20 shadow-[inset_0_0_120px_rgba(0,0,0,1)] pointer-events-none z-30" />
      </div>

      {/* Content area */}
      <div className="flex-1 flex flex-col w-full h-full relative z-20 overflow-hidden overflow-y-auto px-28 pt-40 pb-20">
        <div className="min-h-full">
          {children}
        </div>
      </div>
    </div>
  );
}
