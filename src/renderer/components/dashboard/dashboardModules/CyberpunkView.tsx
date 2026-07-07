import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CampaignCard } from './CampaignCard';

interface CyberpunkViewProps {
  isMobile: boolean;
  items: any[];
  currentPage: number;
  totalPages: number;
  isTransitioning: boolean;
  direction: 'next' | 'prev' | null;
  goToPrevPage: () => void;
  goToNextPage: () => void;
  cyberLogs: string[];
  theme: string;
  handleSelectCampaign: (camp: any) => void;
  handleDeleteCampaign: (id: number, name: string) => void;
  handleEditCampaign: (e: React.MouseEvent, camp: any) => void;
  setShowCreateModal: (show: boolean) => void;
  setNewCampaign: (camp: any) => void;
}

export function CyberpunkView({
  isMobile,
  items,
  currentPage,
  totalPages,
  isTransitioning,
  direction,
  goToPrevPage,
  goToNextPage,
  cyberLogs,
  theme,
  handleSelectCampaign,
  handleDeleteCampaign,
  handleEditCampaign,
  setShowCreateModal,
  setNewCampaign
}: CyberpunkViewProps) {
  let leftItem = null;
  let rightItem = null;

  if (!isMobile) {
    leftItem = items[currentPage * 2];
    rightItem = items[currentPage * 2 + 1];
  } else {
    leftItem = items[currentPage];
  }

  const renderCard = (cardItem: any) => (
    <CampaignCard
      theme={theme}
      item={cardItem}
      handleSelectCampaign={handleSelectCampaign}
      handleDeleteCampaign={handleDeleteCampaign}
      handleEditCampaign={handleEditCampaign}
      setShowCreateModal={setShowCreateModal}
      setNewCampaign={setNewCampaign}
    />
  );

  return (
    <div className="w-full">
      {/* Main Cyberpunk Console Content */}
      {isMobile ? (
        /* Mobile Paging Layout (1 Card with Glitch & Overlay) */
        <div className="relative w-full min-h-[14rem] px-2 py-4 overflow-hidden">
          <div className={`w-full max-w-[400px] mx-auto ${
            isTransitioning ? (direction === 'next' ? 'cyber-glitch-out' : 'cyber-glitch-in') : ''
          }`}>
            {renderCard(leftItem)}
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
                {renderCard(leftItem)}
              </div>
            </div>
            
            {/* Right Column */}
            <div className="w-full flex justify-start pl-12">
              <div className="w-full max-w-[400px]">
                {renderCard(rightItem)}
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
  );
}
