import React, { useState } from 'react';
import '../../vampire.css';

interface VampireIntroProps {
  onOpen: () => void;
}

export function VampireIntro({ onOpen }: VampireIntroProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    if (isOpen) return;
    setIsOpen(true);
    // Extra time for smooth, elegant transitions
    setTimeout(() => {
      onOpen();
    }, 2800);
  };

  if (isOpen && false) {
     // unused var lint silence
  }

  return (
    <div className={`fixed inset-0 z-[200] flex items-center justify-center bg-black overflow-hidden transition-opacity duration-[3000ms] ease-out ${isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      {/* Background ambient lighting - darker but with intense blood center */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#4a0000_0%,_#000000_65%)] opacity-60" />
      
      {/* Double fog for spookier atmosphere */}
      <div className="vampire-fog opacity-80" />
      <div className="vampire-fog" style={{ animationDelay: '-7.5s', transform: 'scale(1.2)' }} />

      {/* The Coffin Box */}
      <div 
        className={`relative w-[300px] h-[500px] cursor-pointer transition-transform duration-[2500ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${isOpen ? 'scale-[4] blur-sm' : 'coffin-shake'}`}
        onClick={handleClick}
        title="Click to awaken..."
      >
        {/* Strong Red Aura */}
        <div className={`absolute -inset-12 bg-[#ff0000] rounded-[100px] blur-[70px] transition-all duration-[2000ms] ${isOpen ? 'opacity-0' : 'opacity-40 animate-pulse'}`} />

        {/* Coffin Interior/Body */}
        <div className="absolute inset-0 bg-[#020000] border-[6px] border-[#110000] shadow-[0_0_100px_rgba(255,0,0,0.5)] clip-coffin flex items-center justify-center overflow-hidden">
          {/* Velvet padding structure - very dark red */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIi8+CjxwYXRoIGQ9Ik0wIDBMODggTTggMEwwIDgiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIwLjUiLz4KPC9zdmc+')] mix-blend-multiply opacity-30 bg-[#3a0000]" />
          
          <div className="w-[88%] h-[92%] border-[4px] border-[#0a0000] clip-coffin flex items-center justify-center shadow-[inset_0_0_60px_rgba(0,0,0,1)] bg-[#050000]">
             {/* Deep darkness inside */}
             <div className="absolute inset-0 bg-black opacity-90" />
             {/* Center light from inside the coffin */}
             <div className="w-1/2 h-full bg-[radial-gradient(ellipse_at_center,_#5a0000_0%,_transparent_60%)] opacity-20" />
          </div>
        </div>
        
        {/* Coffin Lid (Slides off) */}
        <div className={`absolute inset-0 bg-[#050000] border-x-[10px] border-y-[8px] border-[#1a0000] shadow-[inset_0_0_80px_rgba(0,0,0,1),_0_20px_60px_rgba(0,0,0,0.9)] clip-coffin transform transition-all duration-[2500ms] ease-[cubic-bezier(0.4,0,0.2,1)] z-10 flex items-center justify-center ${isOpen ? 'translate-x-[120%] translate-y-[10%] rotate-[15deg] opacity-0' : 'translate-x-0 translate-y-0 rotate-0'}`}>
          {/* Wood texture / Decoration overlay */}
          <div className="w-[86%] h-[93%] border-2 border-[#4a0000]/40 clip-coffin flex items-center justify-center bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIi8+CjxwYXRoIGQ9Ik0wIDBMODggTTggMEwwIDgiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIwLjUiLz4KPC9zdmc+')] mix-blend-multiply opacity-70 absolute inset-0 m-auto" />
             
          {/* Detailed Rosary SVG */}
          <svg width="140" height="260" viewBox="0 0 100 200" className="relative z-20 drop-shadow-[0_0_12px_rgba(255,0,0,0.8)]">
            {/* The loop of beads (rosary necklace part) */}
            <path d="M 50 25 C 85 25 95 85 50 120 C 5 85 15 25 50 25 Z" fill="none" stroke="#5a0000" strokeWidth="2.5" strokeDasharray="3 3.5" />
            
            {/* Some larger specific beads on the loop */}
            <circle cx="28" cy="55" r="3.5" fill="#a00000" />
            <circle cx="72" cy="55" r="3.5" fill="#a00000" />
            <circle cx="15" cy="85" r="3.5" fill="#a00000" />
            <circle cx="85" cy="85" r="3.5" fill="#a00000" />

            {/* Junction centerpiece */}
            <circle cx="50" cy="120" r="5" fill="#6a0000" />
            <circle cx="50" cy="120" r="2" fill="#220000" />
            
            {/* Chain down to cross */}
            <line x1="50" y1="125" x2="50" y2="150" stroke="#5a0000" strokeWidth="2.5" strokeDasharray="3 3.5" />
            
            {/* The Gothic Cross */}
            {/* Vertical cross beam */}
            <path d="M 46 150 L 54 150 L 52 195 L 48 195 Z" fill="#800000" />
            {/* Horizontal cross beam */}
            <path d="M 30 165 L 70 165 L 68 171 L 32 171 Z" fill="#800000" />
            
            {/* Decorative beads on the cross ends */}
            <circle cx="50" cy="150" r="3" fill="#b00000" />
            <circle cx="50" cy="195" r="3" fill="#b00000" />
            <circle cx="30" cy="168" r="3" fill="#b00000" />
            <circle cx="70" cy="168" r="3" fill="#b00000" />
            
            {/* Center glowing pulsating gem (Blood Ruby) */}
            <circle cx="50" cy="168" r="4.5" fill="#ff0000" className="animate-pulse" style={{ filter: 'blur(0.5px)' }} />
            <circle cx="50" cy="168" r="2" fill="#fff" opacity="0.8" />
          </svg>

          <div className={`absolute bottom-16 text-[#cc0000] font-serif tracking-[0.5em] text-sm font-bold uppercase transition-opacity duration-[1000ms] ${isOpen ? 'opacity-0' : 'animate-pulse'}`} style={{ textShadow: '0 0 20px #ff0000, 0 0 10px #ff0000' }}>
             Awaken
          </div>
        </div>
      </div>
    </div>
  );
}
