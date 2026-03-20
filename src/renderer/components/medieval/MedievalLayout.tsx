import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Play } from 'lucide-react';

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
    <div className="flex h-screen w-full bg-black items-center justify-center p-4 md:p-12 relative overflow-hidden">
      {/* Background ambient lighting/candles (simulated with CSS gradients) */}
      <div className="absolute inset-0 bg-[#120a05] z-0">
        {/* Left candle glow */}
        <div className="absolute bottom-20 left-10 w-64 h-64 bg-[#ff9900] rounded-full mix-blend-screen filter blur-[100px] opacity-20" />
        {/* Right candle glow */}
        <div className="absolute bottom-40 right-10 w-80 h-80 bg-[#ffaa00] rounded-full mix-blend-screen filter blur-[120px] opacity-15" />
      </div>
      
      {/* The Book Container */}
      <div className="relative w-full max-w-7xl h-full flex rounded-xl shadow-[0_20px_80px_rgba(0,0,0,0.9)] bg-[#4a2e1b] z-10" style={{ border: '2px solid #2a180b' }}>
        
        {/* Leather texture & stitching */}
        <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
           <div className="absolute inset-0 bg-[#3d2414] mix-blend-multiply opacity-60" style={{ backgroundImage: 'radial-gradient(circle, transparent 20%, #1a0f08 120%)' }} />
           {/* Stitching */}
           <div className="absolute inset-2 md:inset-3 border-2 border-[#8b5a33] border-dashed rounded-lg opacity-40" />
        </div>

        {/* Top Horizontal Strap */}
        <div className="absolute top-8 left-[-4px] right-[-4px] h-24 bg-[#4a2b18] shadow-[0_10px_20px_rgba(0,0,0,0.6)] z-30 flex items-center justify-between rounded-sm" style={{ borderTop: '4px solid #331d10', borderBottom: '4px solid #24130a' }}>
           {/* Strap Leather texture */}
           <div className="absolute inset-0 bg-black/20 pointer-events-none" />
           <div className="absolute inset-y-1 left-1 right-1 border-y border-[#754727] border-dashed opacity-30 pointer-events-none" />
           
           <div className="text-[#c8a97e] text-4xl md:text-5xl lg:text-6xl font-serif tracking-widest pl-8 md:pl-20 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] z-10" style={{ fontFamily: '"Georgia", "Times New Roman", serif', textShadow: '1px 2px 3px rgba(0,0,0,0.9), -1px -1px 1px rgba(255,255,255,0.1)' }}>
             REQUIEM
           </div>
        </div>

        {/* Central Metal Clasp */}
        <div className="absolute top-[16px] left-1/2 -translate-x-1/2 w-28 h-28 bg-[#2c1a10] rounded-full shadow-[0_8px_16px_rgba(0,0,0,0.8)] z-40 flex items-center justify-center border-4 border-[#1a0f08] transition-transform hover:scale-105 cursor-pointer">
            <div className="w-20 h-20 bg-gradient-to-br from-[#d9c596] via-[#a68a56] to-[#6b5633] rounded-full flex items-center justify-center shadow-[inset_0_2px_8px_rgba(255,255,255,0.5),0_2px_10px_rgba(0,0,0,0.8)] border border-[#ffe0ad]">
                <div className="w-14 h-14 rounded-full border-2 border-[#8b6e41] flex items-center justify-center" style={{ background: 'radial-gradient(circle, #e8d4a2, #ba9c61)' }}>
                   {/* Moon Clasp Icon */}
                   <div className="w-8 h-8 rounded-full shadow-[inset_4px_0_0_0_#6b5633]" style={{ transform: 'rotate(-20deg)' }}></div>
                </div>
            </div>
        </div>

        {/* Bookmark */}
        <div className="absolute top-[40%] right-[-30px] w-12 h-20 bg-[#f4eacc] rounded-r shadow-[5px_5px_15px_rgba(0,0,0,0.5)] z-0 flex items-center justify-end pr-2" style={{ border: '1px solid #d9c596', borderLeft: 'none' }}>
           {/* Ribbon effect bottom (triangle cutout) */}
           <div className="absolute bottom-[-10px] left-0 w-full h-10 bg-[#f4eacc] border-b border-[#d9c596] shadow-[5px_5px_15px_rgba(0,0,0,0.5)]" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 60%, 0 100%)' }}></div>
           <Play size={18} className="text-[#8b4513] opacity-40 z-10" />
        </div>

        {/* Inner Pages Container */}
        <div className="absolute top-[120px] bottom-6 left-4 right-4 md:left-8 md:right-8 bg-[#f4eacc] rounded shadow-[inset_0_0_40px_rgba(139,69,19,0.15),0_5px_15px_rgba(0,0,0,0.5)] text-primary font-sans z-20 flex overflow-hidden">
          
          {/* Page Textures (Parchment look) */}
          <div className="absolute inset-0 opacity-40 pointer-events-none mix-blend-multiply" style={{ backgroundImage: 'radial-gradient(#d9c596 1px, transparent 1px)', backgroundSize: '10px 10px' }} />
          <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIi8+CjxwYXRoIGQ9Ik0wIDBMMCA0TDQgNEw0IDBaIiBmaWxsPSIjMDAwIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] mix-blend-multiply" />
          
          {/* Central spine/gutter styling */}
          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-16 bg-gradient-to-r from-transparent via-[#c4b087] to-transparent opacity-60 pointer-events-none z-50 mix-blend-multiply shadow-[inset_0_0_20px_rgba(0,0,0,0.2)]" />
          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-2 bg-gradient-to-r from-black/10 via-black/40 to-black/10 pointer-events-none z-50" />
          
          {/* Edges of the pages */}
          <div className="absolute top-0 bottom-0 left-0 w-2 bg-gradient-to-r from-black/20 to-transparent pointer-events-none z-50" />
          <div className="absolute top-0 bottom-0 right-0 w-2 bg-gradient-to-l from-black/20 to-transparent pointer-events-none z-50" />
          
          <div className="flex-1 flex flex-col w-full h-full relative z-10 pl-2 pr-2">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
