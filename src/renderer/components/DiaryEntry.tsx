import React, { useState } from 'react';
import { Key } from 'lucide-react';

interface DiaryEntryProps {
  onOpen: () => void;
}

export function DiaryEntry({ onOpen }: DiaryEntryProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    if (isOpen) return;
    setIsOpen(true);
    // Give time for the 3D flipping animation to play before hiding the diary entirely.
    setTimeout(() => {
      onOpen();
    }, 1500);
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#0d0704] overflow-hidden perspective-diary">
      <div 
        className={`diary-book ${isOpen ? 'is-open' : ''} group relative`} 
      >
        {/* Back Cover - the back part that stays still when opening */}
        <div 
          className="diary-back-cover absolute inset-0 border border-[#0d0704] rounded-r-2xl shadow-[15px_15px_30px_rgba(0,0,0,0.9)] flex items-center justify-center overflow-hidden"
          style={{ background: 'linear-gradient(to bottom right, #3b2314, #1a0e08)' }}
        >
          {/* Back cover ambient texture */}
          <div className="absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#54331d] via-[#1a0e08] to-black" />
          <div className="w-full h-full border-2 border-[#1a0e08] m-1 rounded-r-xl border-dashed opacity-50"></div>
        </div>

        {/* Pages under the cover */}
        <div className="diary-pages absolute right-2 top-2 bottom-2 bg-[#d7c49b] rounded-r-lg border-r border-[#8b6f43] shadow-inner"></div>

        {/* First inner page that stays still */}
        <div className="diary-inner-page absolute inset-2 bg-[#f4ebd0] rounded-r-lg flex flex-col items-center justify-center border-r border-[#c2aa79] shadow-[inset_0_0_50px_rgba(139,111,67,0.2)] opacity-0 transition-opacity duration-1000 delay-300">
          <h1 className="text-4xl text-[#3b2314] font-bold font-serif italic mb-4">Requiem</h1>
          <p className="text-[#5c3a21] text-lg text-center px-8">The chronicles await your quill.</p>
        </div>

        {/* The Front Cover that rotates open */}
        <div 
          className="diary-front-cover absolute inset-0 rounded-r-2xl shadow-2xl flex flex-col items-center justify-center transition-transform duration-[1500ms] ease-in-out origin-left z-10 overflow-visible cursor-pointer" 
          style={{ background: 'linear-gradient(to bottom right, #4a2e1b, #321c0f, #120804)' }}
          onClick={handleClick}
        >
          {/* Leather texture overlay using radial shadow */}
          <div className="absolute inset-0 opacity-50 bg-[radial-gradient(circle_at_20%_30%,_transparent_0%,_rgba(0,0,0,0.8)_100%)] rounded-r-2xl pointer-events-none" />
          
          {/* Back edge shadow simulating binding groove */}
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black/80 via-black/40 to-transparent pointer-events-none rounded-l-2xl" />

          {/* Stitched Border */}
          <div className="absolute inset-3 border-[3px] border-[#a87a41] border-dashed rounded-r-xl opacity-30 shadow-[0_0_2px_#000]" />
          <div className="absolute inset-5 border border-[#1a0e08] rounded-r-lg opacity-40" />
          
          {/* Additional decorative styling elements reminiscent of leather patchwork */}
          <div className="absolute top-0 right-0 w-32 h-40 bg-gradient-to-bl from-[#2c1810] to-transparent opacity-50 rounded-bl-[80px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-[#0a0502] to-transparent opacity-50 rounded-tr-[120px] pointer-events-none border-t border-r border-white/5" />
          
          <h1 className="text-6xl font-bold font-serif text-[#c59a5c] tracking-widest mt-8 z-10 transition-all duration-300 drop-shadow-[0_2px_4px_rgba(0,0,0,1)] [text-shadow:0_1px_1px_rgba(255,255,255,0.2),0_-1px_1px_rgba(0,0,0,0.8)]">
            REQUIEM
          </h1>
          
          <p className="text-[#8c6b3e] text-[13px] uppercase tracking-[0.35em] mt-6 font-bold opacity-80 z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">
            Your own journal
          </p>
          
          <div className="flex-1"></div>

          {/* Wrap-around Leather Strap & Lock */}
          <div 
            className="absolute -right-2 top-1/2 -translate-y-1/2 z-20 flex items-center transition-transform duration-300 group-hover:scale-105"
          >
            {/* The Strap */}
            <div className="h-20 w-32 bg-gradient-to-l from-[#1e1008] to-[#3a2215] rounded-l-lg shadow-[-6px_8px_15px_rgba(0,0,0,0.8)] border-y border-l border-[#0a0502] flex items-center justify-between pr-2 pl-4">
              
              {/* Rivets */}
              <div className="flex flex-col gap-8">
                <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-[#c99b5a] to-[#4c3315] shadow-[inset_0_-1px_2px_rgba(0,0,0,0.9),_0_1px_2px_rgba(255,255,255,0.1)] border border-[#1a0904]" />
                <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-[#c99b5a] to-[#4c3315] shadow-[inset_0_-1px_2px_rgba(0,0,0,0.9),_0_1px_2px_rgba(255,255,255,0.1)] border border-[#1a0904]" />
              </div>

              {/* Lock Base - Rustic Square */}
              <div className="relative group/clasp">
                <div 
                  className="w-16 h-14 rounded-lg shadow-[0_6px_10px_rgba(0,0,0,0.9)] border-[3px] border-[#29170e] flex items-center justify-center relative z-10"
                  style={{ background: 'linear-gradient(to bottom right, #805b32, #463116)' }}
                >
                  {/* Inner indented area */}
                  <div className="w-10 h-10 rounded-md border border-[#29170e] flex items-center justify-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]" style={{ background: '#3d2b14' }}>
                    {/* Realistic Keyhole */}
                    <div className="flex flex-col items-center justify-center drop-shadow-[0_1px_1px_rgba(255,255,255,0.15)]">
                      <div className="w-3.5 h-3.5 rounded-full bg-[#0d0704] shadow-inner" />
                      <div className="w-4 h-4 bg-[#0d0704] -mt-[3px] rounded-b-sm" style={{ clipPath: 'polygon(25% 0, 75% 0, 100% 100%, 0 100%)' }} />
                    </div>
                  </div>
                </div>
                
                {/* Hanging Vintage Key */}
                <div className="absolute top-[85%] left-1/2 -translate-x-1/2 flex flex-col items-center transition-transform duration-700 ease-in-out group-hover/clasp:rotate-[25deg] origin-top z-0">
                  <div className="w-1.5 h-8 bg-gradient-to-b from-[#3a2712] to-[#8b6f43] border-x border-[#0a0502] shadow-[2px_0_4px_rgba(0,0,0,0.8)]" />
                  <Key className="text-[#a68245] fill-[#382613] drop-shadow-[0_4px_4px_rgba(0,0,0,1)] -mt-1 scale-125" size={24} />
                </div>
              </div>
            </div>
            {/* Click to Unseal Label */}
            <div className="absolute -bottom-14 w-[120%] -left-4 text-center whitespace-nowrap text-[#a87a41] font-bold text-[10px] tracking-widest animate-pulse opacity-90 drop-shadow-[0_2px_4px_rgba(0,0,0,1)] pointer-events-none">
              CLICK TO UNSEAL
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
