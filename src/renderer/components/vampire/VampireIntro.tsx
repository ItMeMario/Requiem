import React, { useState, useEffect } from 'react';
import '../../vampire.css';

interface VampireIntroProps {
  onOpen: () => void;
}

export function VampireIntro({ onOpen }: VampireIntroProps) {
  const [phase, setPhase] = useState<'idle' | 'opening' | 'revealing' | 'done'>('idle');

  const handleClick = () => {
    if (phase !== 'idle') return;
    setPhase('opening');
  };

  useEffect(() => {
    if (phase === 'opening') {
      // Lid fully opens over ~2s, then start the reveal
      const revealTimer = setTimeout(() => setPhase('revealing'), 2200);
      return () => clearTimeout(revealTimer);
    }
    if (phase === 'revealing') {
      // The whole scene zooms into the coffin interior, fading out
      const doneTimer = setTimeout(() => {
        setPhase('done');
        onOpen();
      }, 1800);
      return () => clearTimeout(doneTimer);
    }
  }, [phase, onOpen]);

  // Once done, render nothing
  if (phase === 'done') return null;

  const isOpening = phase === 'opening' || phase === 'revealing';
  const isRevealing = phase === 'revealing';

  return (
    <div
      className={`coffin-intro-overlay ${isRevealing ? 'coffin-intro-reveal' : ''}`}
    >
      {/* Blood-red ambient background */}
      <div className="coffin-intro-ambient" />

      {/* Fog layers */}
      <div className="vampire-fog opacity-80" />
      <div className="vampire-fog" style={{ animationDelay: '-7.5s', transform: 'scale(1.2)' }} />

      {/* Rising mist when coffin opens */}
      <div className={`coffin-mist ${isOpening ? 'coffin-mist-active' : ''}`} />
      <div className={`coffin-mist coffin-mist-2 ${isOpening ? 'coffin-mist-active' : ''}`} />

      {/* ── The Coffin ── */}
      <div
        className={`coffin-body ${!isOpening ? 'coffin-shake' : ''}`}
        onClick={handleClick}
        title="Click to awaken..."
      >
        {/* Pulsating red aura behind coffin */}
        <div className={`coffin-aura ${isOpening ? 'coffin-aura-burst' : ''}`} />

        {/* Light spilling out when lid opens */}
        <div className={`coffin-light-spill ${isOpening ? 'coffin-light-spill-active' : ''}`} />

        {/* ── Coffin Interior (revealed when lid opens) ── */}
        <div className="coffin-interior">
          <div className="coffin-interior-velvet" />
          <div className="coffin-interior-frame">
            <div className="coffin-interior-darkness" />
            <div className="coffin-interior-glow" />
          </div>
        </div>

        {/* ── Coffin Lid (opens with 3D hinge from top) ── */}
        <div className={`coffin-lid ${isOpening ? 'coffin-lid-open' : ''}`}>
          {/* Wood texture overlay */}
          <div className="coffin-lid-texture" />

          {/* Detailed Rosary SVG */}
          <svg width="140" height="260" viewBox="0 0 100 200" className="coffin-rosary">
            {/* The loop of beads */}
            <path d="M 50 25 C 85 25 95 85 50 120 C 5 85 15 25 50 25 Z" fill="none" stroke="#5a0000" strokeWidth="2.5" strokeDasharray="3 3.5" />
            <circle cx="28" cy="55" r="3.5" fill="#a00000" />
            <circle cx="72" cy="55" r="3.5" fill="#a00000" />
            <circle cx="15" cy="85" r="3.5" fill="#a00000" />
            <circle cx="85" cy="85" r="3.5" fill="#a00000" />
            {/* Junction centerpiece */}
            <circle cx="50" cy="120" r="5" fill="#6a0000" />
            <circle cx="50" cy="120" r="2" fill="#220000" />
            {/* Chain down to cross */}
            <line x1="50" y1="125" x2="50" y2="150" stroke="#5a0000" strokeWidth="2.5" strokeDasharray="3 3.5" />
            {/* Gothic Cross */}
            <path d="M 46 150 L 54 150 L 52 195 L 48 195 Z" fill="#800000" />
            <path d="M 30 165 L 70 165 L 68 171 L 32 171 Z" fill="#800000" />
            <circle cx="50" cy="150" r="3" fill="#b00000" />
            <circle cx="50" cy="195" r="3" fill="#b00000" />
            <circle cx="30" cy="168" r="3" fill="#b00000" />
            <circle cx="70" cy="168" r="3" fill="#b00000" />
            {/* Blood Ruby */}
            <circle cx="50" cy="168" r="4.5" fill="#ff0000" className="animate-pulse" style={{ filter: 'blur(0.5px)' }} />
            <circle cx="50" cy="168" r="2" fill="#fff" opacity="0.8" />
          </svg>

          <div className={`coffin-awaken-text ${isOpening ? 'coffin-text-fade' : ''}`}>
            Awaken
          </div>
        </div>
      </div>
    </div>
  );
}
