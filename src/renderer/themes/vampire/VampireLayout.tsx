import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { VampireBg } from './vampireAssets/VampireBg';
import './vampire.css';

interface VampireLayoutProps {
  children: React.ReactNode;
}

export function VampireLayout({ children }: VampireLayoutProps) {
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
      className="flex h-screen w-full bg-[#030304] p-2 sm:p-4 md:p-6 overflow-hidden relative font-sans text-[#d1d1d6]"
      data-theme="vampire"
    >
      <VampireBg />

      {/* Main Coffin/Gothic Frame */}
      <div className="flex w-full h-full bg-[#0a0a0f]/95 backdrop-blur-md overflow-hidden relative rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.9),inset_0_0_80px_rgba(0,0,0,0.8)] border-2 border-[#1f1f2e] z-10 flex-col"
           style={{
             backgroundImage: 'radial-gradient(circle at center, rgba(30,30,40,0.3) 0%, #050508 100%)'
           }}
      >
        
        {/* Ornate corner decorations (simulated with CSS borders) */}
        <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-[#3d3d4a] rounded-tl-lg pointer-events-none shadow-[0_0_10px_rgba(0,0,0,0.8)]" />
        <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-[#3d3d4a] rounded-tr-lg pointer-events-none shadow-[0_0_10px_rgba(0,0,0,0.8)]" />
        <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-[#3d3d4a] rounded-bl-lg pointer-events-none shadow-[0_0_10px_rgba(0,0,0,0.8)]" />
        <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-[#3d3d4a] rounded-br-lg pointer-events-none shadow-[0_0_10px_rgba(0,0,0,0.8)]" />

        {/* Velvet interior texture overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIi8+CjxwYXRoIGQ9Ik0wIDBMODggTTggMEwwIDgiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIwLjUiLz4KPC9zdmc+')] mix-blend-multiply" />

        <div className="flex-1 flex flex-col w-full h-full relative z-10 overflow-hidden overflow-y-auto pl-2 pr-2">
          {children}
        </div>
      </div>
    </div>
  );
}
