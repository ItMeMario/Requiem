import React from 'react';

interface DashboardDividerProps {
  theme: string;
}

export function DashboardDivider({ theme }: DashboardDividerProps) {
  if (theme === 'medieval') {
    return (
      <div className="flex items-center justify-center my-8 w-full select-none">
        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#8b4513]/40 to-transparent" />
        <span className="mx-4 text-[#8b4513]/60 text-lg font-serif">❧ ⚜ ☙</span>
        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#8b4513]/40 to-transparent" />
      </div>
    );
  }
  
  if (theme === 'cyberpunk') {
    return (
      <div className="flex items-center justify-center my-10 w-full select-none relative overflow-hidden h-6">
        <div className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#0ff]/50 to-transparent" />
        <div className="absolute left-1/2 -translate-x-1/2 bg-[#02050a] px-4 py-0.5 border border-[#0ff]/30 text-[#0ff] text-[10px] font-mono tracking-[0.2em] uppercase">
          SECURE_NODE // DATA_SETS
        </div>
      </div>
    );
  }
  
  if (theme === 'vampire') {
    return (
      <div className="flex items-center justify-center my-10 w-full select-none">
        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#8b0000]/60 to-transparent" />
        <span className="mx-4 text-[#8b0000] text-xl tracking-widest font-serif">☽ ☥ ☾</span>
        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#8b0000]/60 to-transparent" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center my-8 w-full select-none">
      <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-border-subtle to-transparent" />
      <span className="mx-4 text-muted text-sm uppercase tracking-wider font-semibold">Campaigns</span>
      <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-border-subtle to-transparent" />
    </div>
  );
}
