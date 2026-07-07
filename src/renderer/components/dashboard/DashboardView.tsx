import React from 'react';
import { Play, Plus, Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { getThemeLabels } from '../../utils/themeLabels';
import { DashboardHeader } from './DashboardHeader';
import { AuthControls } from '../AuthControls';

function toRoman(num: number): string {
  const roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
  return roman[num - 1] || num.toString();
}

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


interface DashboardViewProps {
  theme: string;
  campaigns: any[];
  lastOpenedCampaign: any;
  handleSelectCampaign: (camp: any) => void;
  handleDeleteCampaign: (id: number, name: string) => void;
  handleEditCampaign: (e: React.MouseEvent, camp: any) => void;
  setShowCreateModal: (show: boolean) => void;
  setNewCampaign: (camp: any) => void;
}

export function DashboardView({
  theme,
  campaigns,
  lastOpenedCampaign,
  handleSelectCampaign,
  handleDeleteCampaign,
  handleEditCampaign,
  setShowCreateModal,
  setNewCampaign
}: DashboardViewProps) {
  // Mobile detection for page size adjustments
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);
  const [currentPage, setCurrentPage] = React.useState(0);
  const [isTransitioning, setIsTransitioning] = React.useState(false);
  const [direction, setDirection] = React.useState<'next' | 'prev' | null>(null);
  const [cyberLogs, setCyberLogs] = React.useState<string[]>([]);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  React.useEffect(() => {
    if (theme === 'cyberpunk' && isTransitioning) {
      const logs = [
        'INIT_SEQUENCE_LOAD: CAMPAIGN_INDEX',
        `CONNECTING TO SECURE SECTOR_0x${Math.floor(Math.random()*16777215).toString(16).toUpperCase()}`,
        'PROTOCOL: RSA_4096_GCM_DECRYPT',
        'SYS_MEM_ALLOC: 4096B [STATUS: OK]',
        'DECRYPTING ACCESS KEYS...',
        'AUTHORIZATION: ACCESS GRANTED',
        'COMPILING DATA ENTRIES...',
        'RECONSTRUCTING CHRONICLES MAIN NODE',
        'LOG: DATA STREAM STABILIZED'
      ];
      setCyberLogs(logs);
    }
  }, [isTransitioning, theme]);

  const items = React.useMemo(() => [
    { type: 'create' },
    ...campaigns.map(camp => ({ type: 'campaign', data: camp }))
  ], [campaigns]);

  const pageSize = ((theme === 'medieval' || theme === 'cyberpunk') && isMobile) ? 1 : 2;
  const totalPages = Math.ceil(items.length / pageSize);

  // Keep page index within valid bounds when resizing or campaigns are deleted
  React.useEffect(() => {
    if (currentPage >= totalPages && totalPages > 0) {
      setCurrentPage(totalPages - 1);
    }
  }, [totalPages, currentPage]);

  const goToNextPage = () => {
    if (currentPage < totalPages - 1 && !isTransitioning) {
      setDirection('next');
      setIsTransitioning(true);
      
      const transitionDuration = isMobile ? 600 : 800; // Matches animation duration in CSS
      setTimeout(() => {
        setCurrentPage(prev => prev + 1);
        setIsTransitioning(false);
        setDirection(null);
      }, transitionDuration);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 0 && !isTransitioning) {
      setDirection('prev');
      setIsTransitioning(true);
      
      const transitionDuration = isMobile ? 600 : 800; // Matches animation duration in CSS
      setTimeout(() => {
        setCurrentPage(prev => prev - 1);
        setIsTransitioning(false);
        setDirection(null);
      }, transitionDuration);
    }
  };

  // Render a blank parchment page for the back of flipping cards
  const renderBlankPage = () => {
    return (
      <div className="h-48 w-full rounded p-6 bg-[#f4eacc] border-[#5c3a21] border relative overflow-hidden shadow-md">
        <div className="absolute inset-0 bg-[#d4a373] mix-blend-multiply opacity-20 pointer-events-none" />
        <div className="absolute inset-2 border border-[#3e2723]/30 pointer-events-none rounded" />
      </div>
    );
  };

  // Select campaign card rendering helper
  const renderItem = (item: any) => {
    if (!item) return <div className="h-48 invisible" />; // Placeholder to keep layout height
    
    if (item.type === 'create') {
      if (theme === 'cyberpunk') {
        return (
          <button 
            onClick={() => {
              setNewCampaign({ name: '', genre: '', system: '' });
              setShowCreateModal(true);
            }}
            className="h-48 rounded-xl cyber-smoked-glass flex flex-col items-center justify-center text-[#0ff] hover:text-white hover:shadow-[0_0_30px_rgba(0,255,255,0.4)] transition-all group overflow-hidden relative w-full"
          >
            <div className="micro-circuit-pattern" />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <div className="absolute w-36 h-36 border border-[#0ff]/10 rounded-full animate-[spin_20s_linear_infinite]" />
              <div className="absolute w-24 h-24 border-[2px] border-dashed border-[#0ff]/30 rounded-full animate-[spin_10s_linear_infinite_reverse]" />
              <div className="absolute w-12 h-12 bg-[#02050a] border border-[#0ff] rounded-full shadow-[0_0_15px_rgba(0,255,255,0.6)] flex items-center justify-center group-hover:scale-110 group-hover:border-[#b400ff] transition-all duration-300">
                <div className="w-3 h-3 bg-[#0ff] group-hover:bg-[#b400ff] rounded-sm animate-pulse" />
                <div className="absolute inset-0 rounded-full border border-[#0ff]/50 animate-ping" style={{ animationDuration: '3s' }} />
              </div>
            </div>
            <span className="mt-28 text-sm font-bold tracking-widest z-20 bg-[#02050a]/80 backdrop-blur-md px-6 py-1.5 rounded-sm border border-[#0ff]/50 shadow-[0_0_10px_rgba(0,255,255,0.3)] group-hover:bg-[#0ff]/10 group-hover:border-[#0ff] transition-all">START NEW CAMPAIGN</span>
          </button>
        );
      }
      
      return (
        <button 
          onClick={() => {
            setNewCampaign({ name: '', genre: '', system: '' });
            setShowCreateModal(true);
          }}
          className="h-48 relative bg-[#f4eacc] border transition-all text-[#3e2723] flex flex-col items-center justify-center hover:-translate-y-1 hover:shadow-lg cursor-pointer group w-full"
          style={{
            boxShadow: 'inset 0 0 0 2px #f4eacc, inset 0 0 0 4px rgba(139, 69, 19, 0.4)',
            border: '1px solid rgba(139, 69, 19, 0.6)'
          }}
        >
          <div className="absolute inset-1 border-[1.5px] border-double border-[#8b4513]/40 pointer-events-none group-hover:border-[#8b4513]/80 transition-colors" />
          <div className="absolute top-0 left-0 w-4 h-4 border-l border-t border-[#8b4513] m-2 pointer-events-none" />
          <div className="absolute top-0 right-0 w-4 h-4 border-r border-t border-[#8b4513] m-2 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-l border-b border-[#8b4513] m-2 pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-r border-b border-[#8b4513] m-2 pointer-events-none" />
          <Plus size={36} strokeWidth={2.5} className="mb-2 text-[#8b4513]/70 group-hover:text-[#8b4513] transition-colors" />
          <span className="text-xl font-semibold tracking-wide font-serif border-b border-transparent group-hover:border-[#8b4513] transition-colors">Start New Campaign</span>
        </button>
      );
    }

    const camp = item.data;
    if (theme === 'cyberpunk') {
      return (
        <div
          onClick={() => handleSelectCampaign(camp)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') handleSelectCampaign(camp);
          }}
          className="h-48 text-left rounded-xl p-6 flex flex-col justify-between transition-all group cursor-pointer cyber-smoked-glass hover:border-[#0ff]/80 hover:shadow-[0_0_20px_rgba(0,255,255,0.3)] relative overflow-hidden w-full"
        >
          <div className="micro-circuit-pattern" />
          
          {/* Actions Container */}
          <div className="absolute top-4 right-4 z-20 transition-opacity opacity-100 sm:opacity-0 sm:group-hover:opacity-100 flex gap-1">
            <button
              onClick={(e) => handleEditCampaign(e, camp)}
              className="p-1.5 rounded-md transition-colors text-[#0ff] hover:bg-[#0ff]/20"
              title="Edit Campaign"
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteCampaign(camp.id, camp.name);
              }}
              className="p-1.5 rounded-md transition-colors text-[#ff003c] hover:bg-[#ff003c]/20"
              title="Delete Campaign"
            >
              <Trash2 size={16} />
            </button>
          </div>

          <div className="relative pointer-events-none z-10 flex-1 flex flex-col justify-center">
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-[#0ff] text-2xl select-none flex items-center justify-center">☽☉☾</span>
              <h3 className="text-xl font-bold truncate pr-8 text-[#0ff] tracking-wider">{camp.name}</h3>
            </div>
            
            {camp.genre && (
              <span className="inline-block mt-2 px-3 py-1 text-[11px] rounded uppercase tracking-wider font-bold self-start cyber-glowing-pill text-cyan-glitch">
                {camp.genre}
              </span>
            )}
          </div>
          
          <div className="absolute bottom-4 left-6 text-[10px] text-[#0ff]/40 font-mono">v.1.{camp.id} | RAD DX</div>
          
          <div className="relative flex items-end text-sm mt-auto pointer-events-none z-10 justify-between pt-4 border-t border-[#0ff]/30 text-[#0ff]/70">
            <span className="cyber-glowing-pill px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest mt-1">
              {camp.system || 'Unknown System'}
            </span>
            <span className="font-semibold px-4 py-1.5 rounded transition-colors cyber-enter-btn text-xs tracking-widest">
              ENTER &rarr;
            </span>
          </div>
        </div>
      );
    }

    return (
      <div
        onClick={() => handleSelectCampaign(camp)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') handleSelectCampaign(camp);
        }}
        className="h-48 text-center rounded p-6 flex flex-col justify-between transition-all group cursor-pointer relative overflow-hidden wood-plank shadow-[2px_4px_10px_rgba(0,0,0,0.15)] hover:-translate-y-1 hover:shadow-[4px_8px_15px_rgba(0,0,0,0.25)] border-[#5c3a21] border w-full"
      >
        <div className="absolute inset-0 bg-[#d4a373] mix-blend-multiply opacity-20 pointer-events-none" />
        <div className="absolute inset-2 border border-[#3e2723]/30 pointer-events-none rounded" />
        
        {/* Actions Container */}
        <div className="absolute top-3 right-3 z-20 transition-opacity opacity-100 sm:opacity-0 sm:group-hover:opacity-100 flex gap-1">
          <button
            onClick={(e) => handleEditCampaign(e, camp)}
            className="p-1.5 rounded-md transition-colors text-[#3e2723]/60 hover:text-[#3e2723] hover:bg-[#8b4513]/10"
            title="Edit Campaign"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteCampaign(camp.id, camp.name);
            }}
            className="p-1.5 rounded-md transition-colors text-[#3e2723]/60 hover:text-red-700 hover:bg-red-500/10"
            title="Delete Campaign"
          >
            <Trash2 size={16} />
          </button>
        </div>

        <div className="relative pointer-events-none z-10 flex-1 flex flex-col justify-center">
          <h3 className="text-2xl font-bold font-serif text-[#3e2723] leading-tight mb-4" style={{ textShadow: '0 1px 1px rgba(255,255,255,0.3)' }}>
            {camp.name}
          </h3>
        </div>
        
        <div className="relative flex items-end text-sm mt-auto pointer-events-none z-10 justify-center py-1 px-4 border-t border-b border-[#5c3a21]/20 font-bold uppercase tracking-widest text-[11px] text-[#5c3a21]">
          <div className="flex items-center space-x-2">
            <span>{camp.genre || 'FANTASY'}</span>
            <span className="opacity-50">|</span>
            <span>{camp.system || 'SYSTEM'}</span>
          </div>
        </div>
      </div>
    );
  };

  // Determine items to display on left, right, and flipping pages
  let leftItem = null;
  let rightItem = null;
  let frontItem = null;
  let backItem = null;

  if (theme === 'medieval' || theme === 'cyberpunk') {
    if (!isMobile) {
      if (isTransitioning) {
        if (direction === 'next') {
          // Turning forward:
          leftItem = items[currentPage * 2];
          rightItem = items[(currentPage + 1) * 2 + 1];
          frontItem = items[currentPage * 2 + 1];
          backItem = items[(currentPage + 1) * 2];
        } else if (direction === 'prev') {
          // Turning backward:
          leftItem = items[(currentPage - 1) * 2];
          rightItem = items[currentPage * 2 + 1];
          frontItem = items[currentPage * 2];
          backItem = items[(currentPage - 1) * 2 + 1];
        }
      } else {
        // Normal side-by-side display
        leftItem = items[currentPage * 2];
        rightItem = items[currentPage * 2 + 1];
      }
    } else {
      // Mobile single item display
      leftItem = items[currentPage];
    }
  }

  return (
    <main className={`flex-1 flex flex-col overflow-y-auto w-full relative ${theme === 'medieval' ? 'text-primary' : theme === 'cyberpunk' ? 'bg-transparent' : theme === 'vampire' ? 'bg-transparent' : 'bg-surface-app'}`}>
      <div className="hidden sm:block absolute top-4 right-4 md:right-8 z-[60]">
        <AuthControls />
      </div>
      <header className={`px-4 md:px-8 py-4 md:py-6 border-b flex items-center justify-between z-10 ${theme === 'medieval' ? 'relative' : 'sticky top-0'} ${theme === 'cyberpunk' ? 'cyber-metallic-panel border-[#0ff]/50 shadow-[0_4px_20px_rgba(0,255,255,0.15)]' : theme === 'vampire' ? 'bg-[#08080b]/90 backdrop-blur-md border-[#1f1f2e] shadow-[0_4px_20px_rgba(0,0,0,0.4)]' : theme === 'medieval' ? 'border-[#d9c596]/40' : 'bg-surface-app border-border-default'}`}>
        <DashboardHeader theme={theme} />
      </header>

      <div className="p-4 md:p-8 max-w-6xl mx-auto w-full xl:px-12">
        {/* Featured Resume Banner */}
        {lastOpenedCampaign && (
          <div 
            onClick={() => handleSelectCampaign(lastOpenedCampaign)}
            className={`w-full mb-12 rounded-xl group cursor-pointer relative overflow-hidden transition-all duration-300 ${
              theme === 'cyberpunk' 
                ? 'h-32 cyber-smoked-glass hover:shadow-[0_0_30px_rgba(0,255,255,0.3)] flex items-center' 
                : theme === 'medieval'
                ? 'h-32 bg-[#e8d8b0] border-2 border-[#8b4513]/60 hover:border-[#8b4513] shadow-[inset_0_2px_10px_rgba(139,69,19,0.2),0_5px_15px_rgba(0,0,0,0.3)] flex items-center relative'
                : theme === 'vampire'
                ? 'h-32 bg-[#0d0d12] border border-[#1f1f2e] hover:border-[#500000] hover:shadow-[0_5px_25px_rgba(80,0,0,0.5)] flex items-center relative'
                : 'h-32 bg-surface-elevated border border-border-subtle hover:border-accent shadow-md flex items-center'
            }`}
          >
            {theme === 'cyberpunk' && (
              <>
                 <div className="micro-circuit-pattern" />
                 <div className="absolute top-0 right-0 w-48 h-full bg-gradient-to-l from-[#0ff]/5 to-transparent pointer-events-none" />
              </>
            )}
            {theme === 'medieval' && (
              <>
                 <div className="absolute inset-0 opacity-40 mix-blend-multiply pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, transparent 20%, #8b4513 120%)' }} />
                 <div className="absolute inset-2 border border-[#8b4513] border-dashed opacity-30 pointer-events-none rounded" />
              </>
            )}
            {theme === 'vampire' && (
              <>
                 <div className="absolute inset-0 opacity-30 pointer-events-none mix-blend-overlay bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIi8+CjxwYXRoIGQ9Ik0wIDBMMCA0TDQgNEw0IDBaIiBmaWxsPSIjMDAwIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')]"/>
                 <div className="absolute top-0 right-0 w-48 h-full bg-gradient-to-l from-[#500000]/30 to-transparent pointer-events-none" />
              </>
            )}

            <div className="px-8 flex-1 flex justify-between items-center relative z-10 w-full h-full">
              <div className="flex items-center space-x-6">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-lg ${
                   theme === 'cyberpunk' ? 'neon-ring-pulse bg-[#02050a] border-2 border-[#0ff] shadow-[0_0_15px_rgba(0,255,255,0.4)] z-10' :
                   theme === 'medieval' ? 'bg-[#8b4513] border border-[#5c2e0b]' :
                   theme === 'vampire' ? 'bg-[#0a0a0f] border-2 border-[#3d3d4a] group-hover:border-[#ff3333]' :
                   'bg-accent/10 border border-accent'
                }`}>
                  <Play size={28} className={`${
                     theme === 'cyberpunk' ? 'text-[#0ff] group-hover:drop-shadow-[0_0_8px_rgba(0,255,255,1)] ml-1' :
                     theme === 'medieval' ? 'text-[#f4eacc] ml-1' :
                     theme === 'vampire' ? 'text-[#a0a0b0] group-hover:text-[#ff3333] ml-1 transition-colors' :
                     'text-accent-text ml-1'
                  }`} />
                </div>
                <div>
                  <h3 className={`text-sm uppercase tracking-widest font-bold mb-1 ${
                     theme === 'cyberpunk' ? 'text-[#0ff]/70' :
                     theme === 'medieval' ? 'text-[#8b4513]/70 font-serif' :
                     theme === 'vampire' ? 'text-[#606070] font-serif' :
                     'text-muted'
                  }`}>
                     RESUME JOURNEY
                  </h3>
                  <h2 className={`text-2xl md:text-3xl font-bold truncate ${
                     theme === 'cyberpunk' ? 'text-[#0ff] tracking-wider drop-shadow-[0_0_5px_rgba(0,255,255,0.5)] z-10' :
                     theme === 'medieval' ? 'text-[#3e2723] font-serif tracking-wide' :
                     theme === 'vampire' ? 'text-[#d1d1d6] font-serif tracking-widest group-hover:text-[#ff3333] transition-colors' :
                     'text-heading'
                  }`}>
                    {lastOpenedCampaign.name}
                  </h2>
                </div>
              </div>
              
              <div className={`hidden md:flex flex-col items-end ${
                   theme === 'cyberpunk' ? 'text-[#0ff]/50' :
                   theme === 'medieval' ? 'text-[#8b4513]/60 font-serif' :
                   theme === 'vampire' ? 'text-[#555566] font-serif' :
                   'text-muted'
              }`}>
                {lastOpenedCampaign.system && <span className="text-sm font-semibold tracking-wider uppercase mb-1">{lastOpenedCampaign.system}</span>}
                {lastOpenedCampaign.genre && <span className="text-xs font-semibold">{lastOpenedCampaign.genre}</span>}
              </div>
            </div>
          </div>
        )}

        <DashboardDivider theme={theme} />

        {/* Campaign List / Cards Grid */}
        {theme === 'medieval' ? (
          <div className="w-full">
            {/* Main Book Paged Content */}
            {isMobile ? (
              /* Mobile Paging Layout (1 Card at a time with 3D Flip) */
              <div className="relative mobile-book-container w-full min-h-[14rem] px-2 py-4">
                {/* Static Card Underneath */}
                <div className="w-full max-w-[400px] mx-auto">
                  {renderItem(
                    isTransitioning
                      ? (direction === 'next' ? items[currentPage + 1] : items[currentPage])
                      : items[currentPage]
                  )}
                </div>

                {/* Flipping Card (only active during transition) */}
                {isTransitioning && (
                  <div className={`absolute inset-0 px-2 py-4 w-full max-w-[400px] mx-auto mobile-page-flipping ${
                    direction === 'next' ? 'flip-out' : 'flip-in'
                  }`}>
                    {/* Front Side */}
                    <div className="book-page-flipping-front">
                      {renderItem(direction === 'next' ? items[currentPage] : items[currentPage - 1])}
                    </div>
                    {/* Back Side */}
                    <div className="book-page-flipping-back">
                      {renderBlankPage()}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Desktop/Tablet Paging Layout (2 Cards at a time, side-by-side with 3D Flip) */
              <div className="relative book-pages-container w-full min-h-[14rem]">
                <div className="grid grid-cols-2 gap-x-24 gap-y-12 w-full">
                  {/* Left Page Column */}
                  <div className="w-full flex justify-end pr-12">
                    <div className="w-full max-w-[400px]">
                      {renderItem(leftItem)}
                    </div>
                  </div>
                  
                  {/* Right Page Column */}
                  <div className="w-full flex justify-start pl-12">
                    <div className="w-full max-w-[400px]">
                      {renderItem(rightItem)}
                    </div>
                  </div>
                </div>

                {/* Flipping Page Overlay (only active during transition) */}
                {isTransitioning && (
                  <div className={`book-page-flipping ${direction === 'next' ? 'to-left' : 'to-right'}`}>
                    <div className={`book-page-flipping-front w-full flex ${
                      direction === 'next' 
                        ? 'justify-start pl-12' 
                        : 'justify-end pr-12'
                    }`}>
                      <div className="w-full max-w-[400px]">
                        {renderItem(frontItem)}
                      </div>
                    </div>
                    <div className={`book-page-flipping-back w-full flex ${
                      direction === 'next' 
                        ? 'justify-end pr-12' 
                        : 'justify-start pl-12'
                    }`}>
                      <div className="w-full max-w-[400px]">
                        {renderItem(backItem)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Book Pagination Footer */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-12 px-4 md:px-8 font-serif text-[#8b4513]">
                <button
                  disabled={currentPage === 0 || isTransitioning}
                  onClick={goToPrevPage}
                  className="flex items-center justify-center p-3 rounded-full hover:bg-[#8b4513]/10 disabled:opacity-30 disabled:hover:border-transparent transition-all text-[#8b4513] select-none"
                  title="Previous Page"
                  style={{ minWidth: '44px', minHeight: '44px' }}
                >
                  <ChevronLeft size={24} strokeWidth={2.5} />
                  <span className="hidden sm:inline ml-1 uppercase tracking-wider text-xs md:text-sm font-semibold">Previous Page</span>
                </button>
                
                <div className="text-center font-bold tracking-widest uppercase text-xs md:text-sm select-none">
                  ❧ Page {toRoman(currentPage + 1)} / {toRoman(totalPages)} ☙
                </div>
                
                <button
                  disabled={currentPage >= totalPages - 1 || isTransitioning}
                  onClick={goToNextPage}
                  className="flex items-center justify-center p-3 rounded-full hover:bg-[#8b4513]/10 disabled:opacity-30 disabled:hover:border-transparent transition-all text-[#8b4513] select-none"
                  title="Next Page"
                  style={{ minWidth: '44px', minHeight: '44px' }}
                >
                  <span className="hidden sm:inline mr-1 uppercase tracking-wider text-xs md:text-sm font-semibold">Next Page</span>
                  <ChevronRight size={24} strokeWidth={2.5} />
                </button>
              </div>
            )}
          </div>
        ) : theme === 'cyberpunk' ? (
          <div className="w-full">
            {/* Main Cyberpunk Console Content */}
            {isMobile ? (
              /* Mobile Paging Layout (1 Card with Glitch & Overlay) */
              <div className="relative w-full min-h-[14rem] px-2 py-4 overflow-hidden">
                <div className={`w-full max-w-[400px] mx-auto ${
                  isTransitioning ? (direction === 'next' ? 'cyber-glitch-out' : 'cyber-glitch-in') : ''
                }`}>
                  {renderItem(leftItem)}
                </div>
                
                {isTransitioning && (
                  <div className="cyber-terminal-overlay w-full max-w-[400px] mx-auto">
                    <div className="cyber-code-scroll text-[#0ff] font-mono text-xs select-none">
                      {cyberLogs.map((log, i) => (
                        <div key={i} className="truncate">
                          &gt; {log}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Desktop/Tablet Paging Layout (2 Cards with Glitch & Overlay) */
              <div className="relative w-full min-h-[14rem] overflow-hidden">
                <div className={`grid grid-cols-2 gap-x-24 gap-y-12 w-full ${
                  isTransitioning ? (direction === 'next' ? 'cyber-glitch-out' : 'cyber-glitch-in') : ''
                }`}>
                  {/* Left Column */}
                  <div className="w-full flex justify-end pr-12">
                    <div className="w-full max-w-[400px]">
                      {renderItem(leftItem)}
                    </div>
                  </div>
                  
                  {/* Right Column */}
                  <div className="w-full flex justify-start pl-12">
                    <div className="w-full max-w-[400px]">
                      {renderItem(rightItem)}
                    </div>
                  </div>
                </div>

                {/* Scrolling Terminal Code Stream Overlay */}
                {isTransitioning && (
                  <div className="cyber-terminal-overlay">
                    <div className="cyber-code-scroll text-[#0ff] font-mono text-xs select-none">
                      {cyberLogs.map((log, i) => (
                        <div key={i} className="truncate">
                          &gt; {log}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Cyberpunk Pagination Footer */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-12 px-4 md:px-8 font-mono text-[#0ff]">
                <button
                  disabled={currentPage === 0 || isTransitioning}
                  onClick={goToPrevPage}
                  className="cyber-pagination-btn flex items-center justify-center p-3 rounded-sm disabled:opacity-30 disabled:hover:border-[#0ff]/30 transition-all uppercase tracking-wider text-xs font-semibold select-none"
                  title="Previous Sector"
                  style={{ minWidth: '44px', minHeight: '44px' }}
                >
                  <ChevronLeft size={20} strokeWidth={2.5} />
                  <span className="hidden sm:inline ml-1">[PREV_DIR]</span>
                </button>
                
                <div className="text-center font-bold tracking-widest uppercase text-xs md:text-sm select-none">
                  SEC_{(currentPage + 1).toString().padStart(2, '0')} // SEC_{totalPages.toString().padStart(2, '0')}
                </div>
                
                <button
                  disabled={currentPage >= totalPages - 1 || isTransitioning}
                  onClick={goToNextPage}
                  className="cyber-pagination-btn flex items-center justify-center p-3 rounded-sm disabled:opacity-30 disabled:hover:border-[#0ff]/30 transition-all uppercase tracking-wider text-xs font-semibold select-none"
                  title="Next Sector"
                  style={{ minWidth: '44px', minHeight: '44px' }}
                >
                  <span className="hidden sm:inline mr-1">[NEXT_DIR]</span>
                  <ChevronRight size={20} strokeWidth={2.5} />
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Original Grid Layout for default and vampire themes */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-x-24 md:gap-y-12">
            {theme === 'vampire' ? (
              <button 
                onClick={() => {
                  setNewCampaign({ name: '', genre: '', system: '' });
                  setShowCreateModal(true);
                }}
                className="h-48 rounded-xl bg-[#0d0d12] border border-[#1f1f2e] flex flex-col items-center justify-center text-[#555566] hover:text-[#d1d1d6] hover:border-[#3d3d4a] hover:shadow-[0_0_20px_rgba(0,0,0,0.6)] transition-all group relative overflow-hidden"
              >
                <Plus size={48} strokeWidth={1.5} className="mb-4 group-hover:scale-110 transition-transform drop-shadow-[0_0_8px_rgba(255,0,0,0.5)] z-10" />
                <span className="text-sm font-bold tracking-widest font-serif z-10">FORGE BLOODLINE</span>
              </button>
            ) : (
              <button 
                onClick={() => {
                  setNewCampaign({ name: '', genre: '', system: '' });
                  setShowCreateModal(true);
                }}
                className="h-48 rounded-xl border-2 border-dashed border-border-default flex flex-col items-center justify-center text-muted hover:text-accent-text hover:border-accent hover:bg-surface-hover transition-all group"
              >
                <Plus size={36} className="mb-4 text-accent2-text group-hover:text-accent-text transition-colors" />
                <span className="text-lg font-semibold border-b border-transparent group-hover:border-accent-text transition-colors">Start New Campaign</span>
              </button>
            )}

            {campaigns.map(camp => {
              const isVamp = theme === 'vampire';

              return (
                <div
                  key={camp.id}
                  onClick={() => handleSelectCampaign(camp)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') handleSelectCampaign(camp);
                  }}
                  className={
                    isVamp
                      ? 'h-48 text-left rounded-xl p-6 flex flex-col justify-between transition-all group cursor-pointer relative overflow-hidden bg-[#0d0d12] border border-[#1f1f2e] hover:-translate-y-1 hover:shadow-[0_10px_25px_rgba(0,0,0,0.6)] hover:border-[#3d3d4a]'
                      : 'h-48 text-left rounded-xl p-6 flex flex-col justify-between transition-all group cursor-pointer bg-surface-elevated border border-border-subtle hover:shadow-lg hover:border-accent hover:-translate-y-1 relative overflow-hidden'
                  }
                >
                  {!isVamp && <div className="absolute inset-0 bg-gradient-to-br from-transparent to-surface-hover opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />}
                  
                  {/* Actions Container */}
                  <div className="absolute top-4 right-4 z-20 transition-opacity opacity-100 sm:opacity-0 sm:group-hover:opacity-100 flex gap-1">
                    <button
                      onClick={(e) => handleEditCampaign(e, camp)}
                      className={`p-1.5 rounded-md transition-colors ${
                        isVamp ? 'text-[#555566] hover:text-[#d1d1d6] hover:bg-[#ffffff]/10' : 
                        'text-muted hover:text-accent-text hover:bg-surface-hover'
                      }`}
                      title="Edit Campaign"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCampaign(camp.id, camp.name);
                      }}
                      className={`p-1.5 rounded-md transition-colors ${
                        isVamp ? 'text-[#555566] hover:text-[#ff3333] hover:bg-[#ff0000]/10' : 
                        'text-muted hover:text-red-500 hover:bg-red-500/10'
                      }`}
                      title="Delete Campaign"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="relative pointer-events-none z-10 flex-1 flex flex-col justify-center">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className={`${isVamp ? 'text-[#8b0000]' : 'text-accent-text'} text-2xl select-none flex items-center justify-center`}>☽☉☾</span>
                      <h3 className={`text-xl font-bold truncate pr-8 ${isVamp ? 'text-[#ff3333] font-serif tracking-widest' : 'text-heading'}`}>{camp.name}</h3>
                    </div>
                    
                    {camp.genre && <span className={`inline-block mt-2 px-3 py-1 text-[11px] rounded uppercase tracking-wider font-bold self-start ${isVamp ? 'bg-[#1f1f2e]/60 text-[#a0a0b0] border border-[#2a2a35]' : 'bg-surface-deep text-secondary'}`}>{camp.genre}</span>}
                  </div>
                  
                  <div className={`relative flex items-end text-sm mt-auto pointer-events-none z-10 ${
                    isVamp ? 'justify-between pt-4 border-t border-[#1f1f2e] text-[#606070]' : 
                    'justify-between pt-4 border-t border-border-subtle text-faint'
                  }`}>
                    <span className={isVamp ? 'px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest mt-1 text-[#606070]' : ''}>{camp.system || 'Unknown System'}</span>
                    <span className={`font-semibold px-4 py-1.5 rounded transition-colors ${isVamp ? 'text-[#8b0000] tracking-widest text-xs hover:text-[#ff3333]' : 'group-hover:text-accent-text'}`}>
                      {isVamp ? 'ENTER' : 'Enter'} &rarr;
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
