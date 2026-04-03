import React from 'react';

export function MedievalBg() {
  return (
    <div className="absolute inset-0 bg-[#120a05] z-0 pointer-events-none">
      {/* Left candle glow */}
      <div className="absolute bottom-20 left-10 w-64 h-64 bg-[#ff9900] rounded-full mix-blend-screen filter blur-[100px] opacity-20" />
      {/* Right candle glow */}
      <div className="absolute bottom-40 right-10 w-80 h-80 bg-[#ffaa00] rounded-full mix-blend-screen filter blur-[120px] opacity-15" />
    </div>
  );
}
