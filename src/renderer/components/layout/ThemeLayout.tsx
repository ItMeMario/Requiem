import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { CyberpunkBg } from '../../themes/cyberpunk/cyberpunkAssets/CyberpunkBg';
import { MedievalBg } from '../../themes/medieval/medievalAssets/MedievalBg';
import { VampireBg } from '../../themes/vampire/vampireAssets/VampireBg';

interface ThemeLayoutProps {
  children: React.ReactNode;
  lastOpenedCampaign?: any;
  handleSelectCampaign?: (camp: any) => void;
}

export function ThemeLayout({ children }: ThemeLayoutProps) {
  const { theme } = useTheme();

  if (theme !== 'medieval' && theme !== 'cyberpunk' && theme !== 'vampire') {
    return (
      <div className="flex flex-col h-screen w-full overflow-hidden bg-surface-app text-primary font-sans relative">
        {children}
      </div>
    );
  }

  const getClaspSymbol = () => {
    switch (theme) {
      case 'cyberpunk': return '[SYS]';
      case 'vampire': return '☽☉☾';
      case 'medieval': return '☽☉☾';
      default: return '';
    }
  };

  return (
    <div className={`layout-root layout-${theme}`} data-theme={theme}>
      {theme === 'cyberpunk' && <CyberpunkBg />}
      {theme === 'medieval' && <MedievalBg />}
      {theme === 'vampire' && <VampireBg />}

      <div className={`layout-overlays ${theme === 'vampire' ? 'gothic-castle-frame' : ''}`}>
        <div className={`layout-overlay-1 ${theme === 'cyberpunk' ? 'crt-scanlines' : theme === 'vampire' ? 'castle-ceiling' : ''}`}>
           {theme === 'vampire' && <div className="castle-arch" />}
        </div>
        <div className={`layout-overlay-2 ${theme === 'cyberpunk' ? 'cyber-grid' : theme === 'vampire' ? 'castle-pillar pillar-left' : ''}`} />
        <div className={`layout-overlay-3 ${theme === 'vampire' ? 'castle-pillar pillar-right' : ''}`} />
        <div className="layout-overlay-4">
           {theme === 'vampire' && (
             <>
               <div className="hidden md:block absolute top-0 bottom-0 left-[-80px] w-20 castle-wall-side shadow-[inset_-20px_0_40px_rgba(0,0,0,0.9)] z-10" />
               <div className="hidden md:block absolute top-0 bottom-0 right-[-80px] w-20 castle-wall-side shadow-[inset_20px_0_40px_rgba(0,0,0,0.9)] z-10" />
               <div className="hidden md:block absolute bottom-[-40px] left-[-80px] right-[-80px] h-16 castle-wall-floor shadow-[inset_0_20px_40px_rgba(0,0,0,0.9)] z-10" />
             </>
           )}
        </div>
      </div>

      <div className="layout-main-frame">
        <div className="layout-frame-bg" />

        <div className="layout-header">
           <div className={`layout-header-bg ${theme === 'cyberpunk' ? 'cyber-glitch-bg' : ''}`} />
           <div className="layout-header-title" data-text="REQUIEM">
             REQUIEM
           </div>

           <div className={`layout-clasp ${theme === 'cyberpunk' ? 'neon-ring-pulse' : ''}`}>
               <div className="layout-clasp-inner">
                   <div className="layout-clasp-core">
                      <span className={`layout-clasp-symbol ${theme === 'cyberpunk' ? 'cyber-glitch' : ''}`} data-text={getClaspSymbol()}>
                        {getClaspSymbol()}
                      </span>
                   </div>
               </div>
           </div>
        </div>

        <div className="layout-frame-decorations">
          <div className="layout-decoration-1" />
          <div className="layout-decoration-2" />
          <div className="layout-decoration-3" />
          <div className="layout-decoration-4" />
        </div>

        <div className="layout-content-wrapper">
          <div className="layout-content-bg" />
          <div className="layout-scroll-area custom-scrollbar terminal-content-wrapper">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
