import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import '../../cyberpunk.css';

interface CyberpunkLayoutProps {
  children: React.ReactNode;
}

export function CyberpunkLayout({ children }: CyberpunkLayoutProps) {
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
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#0ff] opacity-[0.03] blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-[#0055ff] opacity-[0.05] blur-[150px] rounded-full pointer-events-none" />

      {/* Retro CRT Scanlines Overlay */}
      <div className="fixed inset-0 crt-scanlines z-50 pointer-events-none" />
      
      {/* Background Tech Grid */}
      <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none" />

      {/* Main Cyber Frame */}
      <div className="flex w-full h-full bg-[#050510]/90 backdrop-blur-md overflow-hidden relative rounded-sm shadow-[0_0_20px_rgba(0,255,255,0.1)] border border-[#0ff]/20 z-10 flex-col">
        
        {/* Frame corner decorative elements */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#0ff] pointer-events-none" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#0ff] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#0ff] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#0ff] pointer-events-none" />

        <div className="flex-1 flex flex-col w-full h-full relative z-10 overflow-hidden terminal-content-wrapper">
          {/* We will inject a global CSS file or handle text colors explicitly in App via data-theme, 
              but CyberpunkLayout guarantees the container has the right aesthetics. */}
          {children}
        </div>
      </div>
    </div>
  );
}
