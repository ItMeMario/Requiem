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
      <div className="gothic-castle-frame absolute inset-0 z-10 pointer-events-none">
        
        {/* Stone Walls for Borders */}
        <div className="absolute top-0 left-0 right-0 h-10 gothic-stone-wall border-b-2 border-[#220303]" />
        <div className="absolute bottom-0 left-0 right-0 h-10 gothic-stone-wall border-t-2 border-[#220303]" />
        <div className="absolute top-0 bottom-0 left-0 w-10 gothic-stone-wall border-r-2 border-[#220303]" />
        <div className="absolute top-0 bottom-0 right-0 w-10 gothic-stone-wall border-l-2 border-[#220303]" />

        {/* Victorian Gothic Corner Ornaments */}
        <div className="gothic-corner gothic-corner-tl" />
        <div className="gothic-corner gothic-corner-tr" />
        <div className="gothic-corner gothic-corner-bl" />
        <div className="gothic-corner gothic-corner-br" />

        {/* Top Arch Decoration Overlay */}
        <div className="gothic-arch-top">
          <div className="gothic-arch-inner" />
          <div className="gothic-moon-symbol flex items-center justify-center">☽☉☾</div>
        </div>
        <div className="gothic-arch-bottom" />

        {/* Inner shadow over edge of the viewing area */}
        <div className="absolute top-10 bottom-10 left-10 right-10 shadow-[inset_0_0_80px_rgba(0,0,0,0.9)] pointer-events-none" />
      </div>

      {/* Content area */}
      <div className="flex-1 flex flex-col w-full h-full relative z-20 overflow-hidden overflow-y-auto px-12 md:px-16 pt-16 pb-16">
        {/* Removed opaque background overlays so blood animation is clearly visible */}
        <div className="min-h-full">
          {children}
        </div>
      </div>
    </div>
  );
}
