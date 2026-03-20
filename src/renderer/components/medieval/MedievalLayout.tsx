import React from 'react';
import { useTheme } from '../../context/ThemeContext';

interface MedievalLayoutProps {
  children: React.ReactNode;
}

export function MedievalLayout({ children }: MedievalLayoutProps) {
  const { theme } = useTheme();

  if (theme !== 'medieval') {
    return (
      <div className="flex flex-col h-screen w-full overflow-hidden bg-surface-app text-primary font-sans relative">
        {children}
      </div>
    );
  }

  return (
    <div 
      className="flex h-screen w-full p-1 sm:p-3 md:p-6 lg:p-10 overflow-hidden relative" 
      style={{ background: 'linear-gradient(to bottom right, #3b2314, #1a0e08)' }}
    >
      {/* Background ambient corner shadow */}
      <div className="absolute inset-0 shadow-[inset_0_0_120px_rgba(0,0,0,0.9)] pointer-events-none" />
      
      {/* Decorative Leather Stitching */}
      <div className="absolute inset-[3px] sm:inset-2 md:inset-4 lg:inset-8 border-2 border-[#a87a41] border-dashed rounded-lg opacity-30 pointer-events-none shadow-[0_0_2px_#000]" />
      
      {/* Open Journal "Pages" Container */}
      <div className="flex w-full h-full bg-surface-app text-primary font-sans overflow-hidden relative rounded-r-xl rounded-l-md shadow-[10px_10px_40px_rgba(0,0,0,0.8)] border border-[#8c6b3e]/30 z-10">
        
        {/* Spine/Binding shadow on the left edge */}
        <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-black/60 via-black/20 to-transparent pointer-events-none z-[60]" />
        
        <div className="flex-1 flex flex-col w-full h-full relative">
          {children}
        </div>
      </div>
    </div>
  );
}
