import React from 'react';
export function VampireBg() {
  return (
    <>
      <div className="bat-container">
        <div className="bat" style={{ left: '20%' }} />
        <div className="bat bat-delayed" style={{ left: '50%' }} />
        <div className="bat bat-delayed-2" style={{ left: '80%' }} />
      </div>
      {/* Deep Blood Ambient Lighting */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#8b0000] opacity-10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-20%] w-[50%] h-[50%] bg-[#4a0000] opacity-20 blur-[120px] rounded-full pointer-events-none" />
      <div className="vampire-fog" />
    </>
  );
}
