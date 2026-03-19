import React, { useState } from 'react';

interface DiaryEntryProps {
  onOpen: () => void;
}

export function DiaryEntry({ onOpen }: DiaryEntryProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    if (isOpen) return;
    setIsOpen(true);
    // Give time for the 3D flipping animation to play before hiding the diary entirely.
    // The animation takes around 1.5s, so we wait slightly longer to transition completely.
    setTimeout(() => {
      onOpen();
    }, 1500);
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-surface-deep overflow-hidden perspective-diary">
      <div 
        className={`diary-book ${isOpen ? 'is-open' : ''} cursor-pointer group`} 
        onClick={handleClick}
      >
        {/* Back Cover - the back part that stays still when opening */}
        <div className="diary-back-cover absolute inset-0 bg-surface-sidebar border-4 border-border-default rounded-r-2xl shadow-2xl flex items-center justify-center">
          <div className="w-full h-full border-2 border-border-subtle m-1 rounded-r-xl"></div>
        </div>

        {/* Pages under the cover (optional touch of realism) */}
        <div className="diary-pages absolute right-2 top-2 bottom-2 bg-[#fdf5db] rounded-r-lg border-r border-[#d9c596]"></div>

        {/* First inner page that stays still */}
        <div className="diary-inner-page absolute inset-2 bg-[#fdf5db] rounded-r-xl flex flex-col items-center justify-center shadow-inner opacity-0 transition-opacity duration-1000 delay-300">
          <h1 className="text-4xl text-heading font-bold font-serif italic mb-4">Requiem</h1>
          <p className="text-muted text-lg text-center px-8">The chronicles await your quill.</p>
        </div>

        {/* The Front Cover that rotates open */}
        <div className="diary-front-cover absolute inset-0 bg-surface-sidebar border-4 border-border-default rounded-r-2xl shadow-xl flex flex-col items-center justify-center transition-transform duration-[1500ms] ease-in-out origin-left z-10 group-hover:brightness-110">
          {/* Cover decorative border */}
          <div className="absolute inset-2 border-2 border-accent2 border-dashed rounded-r-xl opacity-60"></div>
          
          <h1 className="text-6xl font-bold font-serif text-accent2-text drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] tracking-widest mt-12">
            REQUIEM
          </h1>
          
          <p className="text-accent2-muted text-sm uppercase tracking-[0.3em] mt-4 font-semibold opacity-80">
            Your own journal
          </p>
          
          <div className="flex-1"></div>

          {/* Golden Seal element */}
          <div className="diary-seal relative mb-16 transition-transform duration-500 hover:scale-110">
            {/* Seal Ribbon */}
            <div className="absolute -z-10 bg-accent w-12 h-32 -top-16 left-1/2 -translate-x-1/2 shadow-lg rounded-b-sm"></div>
            
            {/* Seal Wax / Gold Coin */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-accent2 to-accent2-heading shadow-[0_4px_10px_rgba(0,0,0,0.5)] border-4 border-accent2 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full border border-accent2-muted-bg flex items-center justify-center opacity-80">
                <span className="text-3xl text-[#fff0b3] drop-shadow-md font-serif italic font-bold">R</span>
              </div>
            </div>
            
            <div className="absolute top-full mt-4 text-center w-full whitespace-nowrap text-accent2 font-bold text-sm tracking-widest animate-pulse opacity-70">
              CLICK TO UNSEAL
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
