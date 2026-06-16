import React from 'react';
import { Book } from 'lucide-react';
import { getThemeLabels } from '../../utils/themeLabels';

interface DashboardHeaderProps {
  theme: string;
}

export function DashboardHeader({ theme }: DashboardHeaderProps) {
  if (theme === 'medieval') {
    return (
      <div className="flex w-full items-center justify-center relative py-4">
        <div className="flex flex-col w-full relative max-w-2xl mx-auto">
          <div className="flex items-center justify-center mb-6">
            <div className="flex-1 border-b-[3px] border-double border-[#8b4513]/40 mr-6 shadow-[0_1px_0_rgba(255,255,255,0.4)] relative">
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full border border-[#8b4513]/60 bg-[#d9c596]"></div>
            </div>
            <Book size={32} className="text-[#8b4513] drop-shadow-[0_1px_1px_rgba(255,255,255,0.7)]" strokeWidth={1.5} />
            <div className="flex-1 border-b-[3px] border-double border-[#8b4513]/40 ml-6 shadow-[0_1px_0_rgba(255,255,255,0.4)] relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full border border-[#8b4513]/60 bg-[#d9c596]"></div>
            </div>
          </div>
          <div className="text-center">
            <h2 className="text-2xl md:text-4xl text-[#3e2723] mb-3 tracking-widest font-bold" style={{ fontFamily: '"Georgia", "Times New Roman", serif', textShadow: '1px 1px 0px rgba(255,255,255,0.8)' }}>
              {getThemeLabels(theme).dashboardTitle}
            </h2>
            <p className="text-[#5c3a21] italic font-serif text-[17px] opacity-90 drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)]">
              Select a campaign or create a new one to begin your journey...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (theme === 'vampire') {
    return (
      <div className="flex w-full items-center justify-center relative py-4">
        <div className="flex flex-col w-full relative max-w-2xl mx-auto">
          <div className="flex items-center justify-center mb-6">
            <div className="flex-1 border-b border-solid border-[#8b0000]/40 mr-6 shadow-[0_1px_8px_rgba(255,0,0,0.4)] relative">
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#8b0000] shadow-[0_0_5px_rgba(255,0,0,0.8)]"></div>
            </div>
            <span className="text-3xl text-[#8b0000] drop-shadow-[0_0_15px_rgba(255,0,0,0.8)] mx-2 tracking-[0.3em] font-serif select-none" style={{ textShadow: '0 0 10px rgba(255,0,0,0.8), 0 2px 4px rgba(0,0,0,1)' }}>☽☉☾</span>
            <div className="flex-1 border-b border-solid border-[#8b0000]/40 ml-6 shadow-[0_1px_8px_rgba(255,0,0,0.4)] relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#8b0000] shadow-[0_0_5px_rgba(255,0,0,0.8)]"></div>
            </div>
          </div>
          <div className="text-center">
            <h2 className="text-2xl md:text-4xl text-[#e0e0e0] mb-3 tracking-[0.2em] font-bold" style={{ fontFamily: '"Georgia", "Times New Roman", serif', textShadow: '0 0 15px rgba(255,0,0,0.6), 0 2px 4px rgba(0,0,0,0.9)' }}>
              {getThemeLabels(theme).dashboardTitle}
            </h2>
            <p className="text-[#a0a0b0] italic font-serif text-[17px] opacity-80 drop-shadow-[0_1px_2px_rgba(0,0,0,1)]">
              Select a bloodline or weave a new tale to begin your journey...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (theme === 'cyberpunk') {
    return (
      <div className="flex w-full items-center justify-center relative py-4">
        <div className="flex flex-col w-full relative max-w-3xl mx-auto">
          <div className="flex items-center justify-center mb-6 relative">
            <div className="flex-1 hidden sm:flex items-center justify-end mr-6 opacity-80">
              <div className="text-[10px] text-[#0ff]/50 tracking-[0.3em] mr-4 font-mono">SYS.OP: OPTIMAL</div>
              <div className="h-[2px] w-full max-w-[120px] bg-gradient-to-l from-[#0ff] to-transparent shadow-[0_0_8px_#0ff]"></div>
            </div>

            <div className="relative flex items-center justify-center">
              <span className="text-3xl text-[#0ff] drop-shadow-[0_0_10px_rgba(0,255,255,1)] mx-2 tracking-widest font-mono select-none text-cyan-glitch" data-text="[SYS]">
                [SYS]
              </span>
              <div className="absolute -inset-2 border border-[#0ff]/30 rounded-sm animate-pulse pointer-events-none shadow-[inset_0_0_10px_rgba(0,255,255,0.2)]"></div>
              <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-[#0ff] animate-ping"></div>
            </div>

            <div className="flex-1 hidden sm:flex items-center justify-start ml-6 opacity-80">
              <div className="h-[2px] w-full max-w-[120px] bg-gradient-to-r from-[#0ff] to-transparent shadow-[0_0_8px_#0ff] mr-4"></div>
              <div className="eeg-waveform">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="eeg-bar" style={{ animationDelay: `${i * 0.1}s` }} />
                ))}
              </div>
            </div>
          </div>
          
          <div className="text-center relative">
            <h2 className="text-2xl md:text-4xl text-[#0ff] mb-3 tracking-[0.3em] font-bold font-mono text-cyan-glitch uppercase" data-text={getThemeLabels(theme).dashboardTitle} style={{ textShadow: '0 0 10px rgba(0,255,255,0.6)' }}>
              {getThemeLabels(theme).dashboardTitle}
            </h2>
            <div className="text-[#0ff]/70 font-mono text-[13px] tracking-[0.15em] uppercase flex items-center justify-center">
              <span className="text-[#b400ff] mr-2 animate-pulse font-bold text-lg leading-none">&gt;</span> 
              <span>Initialize neural link or establish new sequence_</span>
            </div>
          </div>
          
          <div className="absolute bottom-2 right-[-20px] flex flex-col items-end text-[#0ff]/40 text-[10px] font-mono tracking-widest pointer-events-none hidden lg:flex">
            <span>NET.SEC: <span className="text-[#0ff] font-bold drop-shadow-[0_0_2px_#0ff]">SECURE</span></span>
            <span>MEM.CAP: <span className="text-[#b400ff] font-bold drop-shadow-[0_0_2px_#b400ff]">84%</span></span>
          </div>
        </div>
      </div>
    );
  }

  // Default theme header
  return (
    <div className="flex w-full items-center justify-between">
      <div className="flex flex-col gap-2">
        <div className="flex items-center space-x-3 mb-1">
          <span className="text-3xl tracking-widest select-none flex items-center justify-center text-accent-text" data-text="☽☉☾">☽☉☾</span>
          <h1 className="text-2xl font-bold tracking-wider">REQUIEM</h1>
        </div>
        <h2 className="text-xl font-bold text-heading">
          {getThemeLabels(theme).dashboardTitle}
        </h2>
        <p className="text-sm text-muted">Select a campaign or create a new one to begin your journey.</p>
      </div>
    </div>
  );
}
