import React from 'react';

export function VampireBg() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 vein-background bg-[#110000]">
      {/* Vena Cava Organic Walls */}
      <div className="vein-wall-left" />
      <div className="vein-wall-right" />
      
      {/* Blood Flow Animation */}
      <div className="blood-flow">
         {/* Blood Bubbles */}
         <div className="blood-bubble bubble-1" />
         <div className="blood-bubble bubble-2" />
         <div className="blood-bubble bubble-3" />
         <div className="blood-bubble bubble-4" />
         <div className="blood-bubble bubble-5" />
         <div className="blood-bubble bubble-6" />
         <div className="blood-bubble bubble-7" />
         <div className="blood-bubble bubble-8" />
         {/* Red Blood Cells */}
         <div className="blood-cell cell-1" />
         <div className="blood-cell cell-2" />
         <div className="blood-cell cell-3" />
      </div>

      {/* Ambient Lighting / Glows */}
      <div className="absolute top-1/4 left-1/4 w-[50%] h-[50%] bg-[#ff0000] opacity-[0.05] blur-[100px] rounded-full mix-blend-screen pulse-vein-glow" />
    </div>
  );
}
