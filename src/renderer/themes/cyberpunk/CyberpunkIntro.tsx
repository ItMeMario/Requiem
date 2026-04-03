import React, { useState, useEffect } from 'react';
import { Terminal as TerminalIcon } from 'lucide-react';
import './cyberpunk.css';

interface CyberpunkIntroProps {
  onOpen: () => void;
}

export function CyberpunkIntro({ onOpen }: CyberpunkIntroProps) {
  const [bootSequence, setBootSequence] = useState<string[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);

  useEffect(() => {
    const lines = [
      'INIT SYSTEM BOOT...',
      'LOADING KERNEL MEMORY... [OK]',
      'VERIFYING ENCRYPTION KEYS... [OK]',
      'ESTABLISHING SECURE CONNECTION... [OK]',
      'ACCESSING REQUIEM MAINFRAME...',
      'SYSTEM READY.'
    ];

    let currentLine = 0;
    const interval = setInterval(() => {
      if (currentLine < lines.length) {
        setBootSequence(prev => [...prev, lines[currentLine]]);
        currentLine++;
      } else {
        clearInterval(interval);
        setTimeout(() => setIsReady(true), 500);
      }
    }, 400);

    return () => clearInterval(interval);
  }, []);

  const handleUnlock = () => {
    if (!isReady || isUnlocking) return;
    setIsUnlocking(true);
    setBootSequence(prev => [...prev, 'AUTHORIZATION ACCEPTED.', 'ENTERING MAINFRAME...']);
    setTimeout(() => {
      onOpen();
    }, 1200);
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#020205] overflow-hidden relative font-mono text-[#0ff] select-none" data-theme="cyberpunk">
      {/* Background elements */}
      <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none" />
      <div className="absolute inset-0 crt-scanlines z-50 pointer-events-none" />
      
      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#000_100%)] opacity-80 pointer-events-none" />

      {/* Main Terminal Box */}
      <div 
        className={`relative z-10 w-full max-w-2xl p-8 border border-[#0ff]/30 bg-[#050510]/80 backdrop-blur-sm shadow-[0_0_30px_rgba(0,255,255,0.1)] rounded-sm transition-all duration-1000 ${isUnlocking ? 'scale-150 opacity-0 blur-md' : 'scale-100 opacity-100'}`}
      >
        {/* Terminal Header */}
        <div className="flex items-center space-x-3 mb-6 border-b border-[#0ff]/30 pb-4">
          <TerminalIcon className="text-[#0ff] animate-pulse" size={24} />
          <h1 className="text-2xl font-bold tracking-widest text-[#0ff] drop-shadow-[0_0_8px_rgba(0,255,255,0.8)] glitch-text" data-text="REQ\\UIEM_TERM">
            REQ\\UIEM_TERM
          </h1>
          <div className="flex-1" />
          <div className="text-xs text-[#0ff]/50">v.1.0_CYBER</div>
        </div>

        {/* Boot Sequence Log */}
        <div className="min-h-[200px] mb-8 space-y-2 text-sm md:text-base">
          {bootSequence.map((line, i) => (
            <div key={i} className="text-[#0ff] opacity-90">
              <span className="text-[#0088ff]">&gt;</span> {line}
            </div>
          ))}
          {!isUnlocking && <div className="text-[#0ff]"><span className="text-[#0088ff]">&gt;</span> <span className="terminal-cursor" /></div>}
        </div>

        {/* Unlock Action */}
        <div className={`flex justify-center transition-opacity duration-1000 ${isReady ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <button
            onClick={handleUnlock}
            disabled={!isReady || isUnlocking}
            className="group relative px-8 py-3 bg-transparent border-2 border-[#0ff] text-[#0ff] font-bold uppercase tracking-widest overflow-hidden hover:bg-[#0ff]/10 hover:shadow-[0_0_20px_rgba(0,255,255,0.5)] transition-all duration-300 ring-offset-black focus:outline-none focus:ring-2 focus:ring-[#0ff] focus:ring-offset-2"
          >
            <div className="absolute inset-0 w-full h-full bg-[#0ff] -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] opacity-20 transform skew-x-12" />
            [ INITIATE ACCESS ]
          </button>
        </div>
      </div>
    </div>
  );
}
