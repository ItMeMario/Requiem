import React from 'react';

export function VampireBg() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Immersed in Blood Animation */}
      <div className="blood-ocean">
        <div className="blood-wave blood-wave-3" />
        <div className="blood-wave blood-wave-2" />
        <div className="blood-wave" />
        <div className="blood-particles" />
      </div>

      <div className="bat-container">
        <div className="bat" style={{ left: '20%' }} />
        <div className="bat bat-delayed" style={{ left: '50%' }} />
        <div className="bat bat-delayed-2" style={{ left: '80%' }} />
      </div>
      
      {/* Ambient Lighting */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#cc0000] opacity-20 blur-[150px] rounded-full mix-blend-screen" />
      <div className="absolute bottom-[-10%] right-[-20%] w-[50%] h-[50%] bg-[#ff0000] opacity-10 blur-[120px] rounded-full mix-blend-screen" />
      
      <div className="vampire-fog" />
    </div>
  );
}
