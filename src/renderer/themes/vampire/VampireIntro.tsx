import React, { useState, useEffect } from 'react';
import './vampire.css';

interface VampireIntroProps {
  onOpen: () => void;
}

export function VampireIntro({ onOpen }: VampireIntroProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    if (isOpen) return;
    setIsOpen(true);
    // Exact 1.5s duration synchronized with other themes
    setTimeout(() => {
      onOpen();
    }, 1500);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        handleClick();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <div
      className={`coffin-intro-overlay ${isOpen ? 'coffin-intro-opening' : ''}`}
      onClick={handleClick}
    >
      {/* Blood-red ambient background with moon */}
      <div className="coffin-intro-ambient" />
      <div className="vampire-blood-moon" />

      {/* Floating crimson embers */}
      <div className="vampire-ember" style={{ width: 4, height: 4, left: '25%', top: '60%', animationDelay: '0s' }} />
      <div className="vampire-ember" style={{ width: 6, height: 6, left: '70%', top: '50%', animationDelay: '1.2s' }} />
      <div className="vampire-ember" style={{ width: 3, height: 3, left: '40%', top: '75%', animationDelay: '2.4s' }} />
      <div className="vampire-ember" style={{ width: 5, height: 5, left: '80%', top: '65%', animationDelay: '0.8s' }} />
      <div className="vampire-ember" style={{ width: 4, height: 4, left: '18%', top: '45%', animationDelay: '1.8s' }} />

      {/* Drifting fog layers */}
      <div className="vampire-fog opacity-70" />
      <div className="vampire-fog" style={{ animationDelay: '-7.5s', transform: 'scale(1.2)', opacity: 0.5 }} />

      {/* ── The 3D Gothic Coffin ── */}
      <div
        className={`coffin-body ${isOpen ? 'is-open' : ''}`}
        title="Click to awaken..."
      >
        {/* Pulsating red aura behind coffin */}
        <div className="coffin-aura" />

        {/* ── Coffin Interior Box (Base that stays still) ── */}
        <div className="coffin-interior-box coffin-clip">
          {/* Deep scarlet tufted quilted velvet */}
          <div className="coffin-velvet">
            <div className="coffin-velvet-tufting" />
          </div>

          {/* Awakening vampire crimson slit-eyes (SVG with predatory slant & slit pupils) */}
          <svg
            className="coffin-eyes"
            viewBox="0 0 90 30"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Left Eye Crimson Gradient */}
              <radialGradient id="vampEyeGradLeft" cx="24" cy="14" r="12" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#ff4455" />
                <stop offset="50%" stopColor="#ff0015" />
                <stop offset="85%" stopColor="#990005" />
                <stop offset="100%" stopColor="#300000" />
              </radialGradient>
              {/* Right Eye Crimson Gradient */}
              <radialGradient id="vampEyeGradRight" cx="66" cy="14" r="12" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#ff4455" />
                <stop offset="50%" stopColor="#ff0015" />
                <stop offset="85%" stopColor="#990005" />
                <stop offset="100%" stopColor="#300000" />
              </radialGradient>
            </defs>

            {/* Left Eye: Outer corner at (8,11), Inner corner at (38,17) - Predatory Slant */}
            <g className="vamp-eye-left">
              <path
                d="M 8 11 Q 23 6 38 17 Q 23 22 8 11 Z"
                fill="url(#vampEyeGradLeft)"
                stroke="#1a0002"
                strokeWidth="1"
              />
              {/* Slit Pupil */}
              <path
                d="M 23 8 Q 21.5 14 23 20 Q 24.5 14 23 8 Z"
                fill="#050002"
              />
              {/* Eye Glint */}
              <circle cx="21" cy="12" r="1.3" fill="#ffffff" opacity="0.9" />
              {/* Upper Eyelid Shadow */}
              <path
                d="M 7 11 Q 23 5 39 17"
                stroke="#000000"
                strokeWidth="1.8"
                fill="none"
                opacity="0.9"
              />
            </g>

            {/* Right Eye: Inner corner at (52,17), Outer corner at (82,11) - Predatory Slant */}
            <g className="vamp-eye-right">
              <path
                d="M 52 17 Q 67 6 82 11 Q 67 22 52 17 Z"
                fill="url(#vampEyeGradRight)"
                stroke="#1a0002"
                strokeWidth="1"
              />
              {/* Slit Pupil */}
              <path
                d="M 67 8 Q 65.5 14 67 20 Q 68.5 14 67 8 Z"
                fill="#050002"
              />
              {/* Eye Glint */}
              <circle cx="65" cy="12" r="1.3" fill="#ffffff" opacity="0.9" />
              {/* Upper Eyelid Shadow */}
              <path
                d="M 51 17 Q 67 5 83 11"
                stroke="#000000"
                strokeWidth="1.8"
                fill="none"
                opacity="0.9"
              />
            </g>
          </svg>

          {/* Gothic ancient runic sigil in velvet */}
          <svg width="100" height="100" viewBox="0 0 100 100" className="coffin-interior-sigil">
            <circle cx="50" cy="50" r="42" fill="none" stroke="#7a0000" strokeWidth="1.5" strokeDasharray="4 2" />
            <circle cx="50" cy="50" r="30" fill="none" stroke="#500000" strokeWidth="1" />
            <polygon points="50,15 80,75 20,75" fill="none" stroke="#600000" strokeWidth="1.5" />
            <polygon points="50,85 80,25 20,25" fill="none" stroke="#600000" strokeWidth="1.5" />
            <circle cx="50" cy="50" r="6" fill="#8b0000" />
          </svg>

          {/* Red mist spilling out */}
          <div className="coffin-spill-mist" />
        </div>

        {/* ── Coffin Lid (3D Side-Hinged Swings Open in 1.5s) ── */}
        <div className="coffin-lid coffin-clip">
          {/* Gothic Beveled Edge Frame */}
          <div className="coffin-lid-bevel coffin-clip" />

          {/* Metal Corner Rivets */}
          <div className="coffin-rivet" style={{ top: '6%', left: '30%' }} />
          <div className="coffin-rivet" style={{ top: '6%', right: '30%' }} />
          <div className="coffin-rivet" style={{ top: '20%', left: '10%' }} />
          <div className="coffin-rivet" style={{ top: '20%', right: '10%' }} />
          <div className="coffin-rivet" style={{ bottom: '8%', left: '26%' }} />
          <div className="coffin-rivet" style={{ bottom: '8%', right: '26%' }} />

          {/* Gothic Rosary & Medallion */}
          <svg width="150" height="260" viewBox="0 0 100 200" className="coffin-medallion">
            {/* Rosary Chain */}
            <path
              d="M 50 25 C 82 25 92 80 50 115 C 8 80 18 25 50 25 Z"
              fill="none"
              stroke="#5a0005"
              strokeWidth="2.5"
              strokeDasharray="2.5 3.5"
            />
            {/* Rosary Accent Beads */}
            <circle cx="28" cy="52" r="3.5" fill="#8a0000" stroke="#330000" strokeWidth="1" />
            <circle cx="72" cy="52" r="3.5" fill="#8a0000" stroke="#330000" strokeWidth="1" />
            <circle cx="16" cy="80" r="3.5" fill="#8a0000" stroke="#330000" strokeWidth="1" />
            <circle cx="84" cy="80" r="3.5" fill="#8a0000" stroke="#330000" strokeWidth="1" />

            {/* Junction centerpiece */}
            <circle cx="50" cy="115" r="6" fill="#4a0000" stroke="#8a0000" strokeWidth="1.5" />
            <circle cx="50" cy="115" r="2.5" fill="#150000" />

            {/* Drop chain */}
            <line x1="50" y1="121" x2="50" y2="142" stroke="#5a0005" strokeWidth="2.5" strokeDasharray="2.5 3" />

            {/* Gothic Cross Body */}
            <path
              d="M 46 142 L 54 142 L 53 186 L 47 186 Z"
              fill="url(#gothicCrossGrad)"
              stroke="#260000"
              strokeWidth="1"
            />
            <path
              d="M 30 156 L 70 156 L 68 162 L 32 162 Z"
              fill="url(#gothicCrossGrad)"
              stroke="#260000"
              strokeWidth="1"
            />

            {/* Cross Corner Ornaments */}
            <circle cx="50" cy="142" r="3" fill="#990000" />
            <circle cx="50" cy="186" r="3" fill="#990000" />
            <circle cx="31" cy="159" r="3" fill="#990000" />
            <circle cx="69" cy="159" r="3" fill="#990000" />

            {/* Central Blood Ruby Gemstone */}
            <circle cx="50" cy="159" r="5.5" fill="#ff0015" className="coffin-blood-ruby" />
            <circle cx="48.5" cy="157.5" r="1.8" fill="#ffffff" opacity="0.85" />

            <defs>
              <linearGradient id="gothicCrossGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#800a12" />
                <stop offset="50%" stopColor="#450005" />
                <stop offset="100%" stopColor="#1a0002" />
              </linearGradient>
            </defs>
          </svg>

          {/* Awaken Prompt */}
          <div className="coffin-prompt">
            CLICK TO AWAKEN
          </div>
        </div>

        {/* ── Flurry of Bats on Unseal ── */}
        <div className="bat-burst-container">
          <svg className="bat-burst-item bat-1" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23 11.5c-2.5 1-4.5 1.5-6.5 0-1 1-2.5 2-4.5 2s-3.5-1-4.5-2c-2 1.5-4 1-6.5 0 1-1.5 2.5-3 4-3 0 0-2-3-4-2.5 3.5-.5 5 1.5 5 1.5.5-1.5 1.5-3.5 3-5 1.5 1.5 2.5 3.5 3 5 0 0 1.5-2 5-1.5-2-.5-4 2.5-4 2.5 1.5 0 3 1.5 4 3z" />
          </svg>
          <svg className="bat-burst-item bat-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23 11.5c-2.5 1-4.5 1.5-6.5 0-1 1-2.5 2-4.5 2s-3.5-1-4.5-2c-2 1.5-4 1-6.5 0 1-1.5 2.5-3 4-3 0 0-2-3-4-2.5 3.5-.5 5 1.5 5 1.5.5-1.5 1.5-3.5 3-5 1.5 1.5 2.5 3.5 3 5 0 0 1.5-2 5-1.5-2-.5-4 2.5-4 2.5 1.5 0 3 1.5 4 3z" />
          </svg>
          <svg className="bat-burst-item bat-3" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23 11.5c-2.5 1-4.5 1.5-6.5 0-1 1-2.5 2-4.5 2s-3.5-1-4.5-2c-2 1.5-4 1-6.5 0 1-1.5 2.5-3 4-3 0 0-2-3-4-2.5 3.5-.5 5 1.5 5 1.5.5-1.5 1.5-3.5 3-5 1.5 1.5 2.5 3.5 3 5 0 0 1.5-2 5-1.5-2-.5-4 2.5-4 2.5 1.5 0 3 1.5 4 3z" />
          </svg>
          <svg className="bat-burst-item bat-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23 11.5c-2.5 1-4.5 1.5-6.5 0-1 1-2.5 2-4.5 2s-3.5-1-4.5-2c-2 1.5-4 1-6.5 0 1-1.5 2.5-3 4-3 0 0-2-3-4-2.5 3.5-.5 5 1.5 5 1.5.5-1.5 1.5-3.5 3-5 1.5 1.5 2.5 3.5 3 5 0 0 1.5-2 5-1.5-2-.5-4 2.5-4 2.5 1.5 0 3 1.5 4 3z" />
          </svg>
          <svg className="bat-burst-item bat-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23 11.5c-2.5 1-4.5 1.5-6.5 0-1 1-2.5 2-4.5 2s-3.5-1-4.5-2c-2 1.5-4 1-6.5 0 1-1.5 2.5-3 4-3 0 0-2-3-4-2.5 3.5-.5 5 1.5 5 1.5.5-1.5 1.5-3.5 3-5 1.5 1.5 2.5 3.5 3 5 0 0 1.5-2 5-1.5-2-.5-4 2.5-4 2.5 1.5 0 3 1.5 4 3z" />
          </svg>
        </div>
      </div>
    </div>
  );
}
