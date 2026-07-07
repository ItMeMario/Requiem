import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CampaignCard } from './CampaignCard';

function toRoman(num: number): string {
  const roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
  return roman[num - 1] || num.toString();
}

function VampireGateOverlay() {
  return (
    <div className="vampire-gate-overlay">
      {/* Left sliding door with gothic arch details */}
      <div className="vampire-gate-door vampire-gate-door-left">
        <svg className="absolute right-0 top-0 h-full w-24 text-[#3d1515] opacity-25" viewBox="0 0 100 500" preserveAspectRatio="none">
          <path d="M100,0 C60,50 20,150 20,250 L20,500 L100,500" fill="none" stroke="currentColor" strokeWidth="3" />
          <path d="M100,50 C75,90 40,170 40,250 L40,500" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="5,5" />
          <path d="M20,150 Q40,160 100,170 M20,200 Q40,210 100,220 M20,250 Q40,260 100,270" fill="none" stroke="currentColor" strokeWidth="1" />
        </svg>
      </div>

      {/* Right sliding door with gothic arch details */}
      <div className="vampire-gate-door vampire-gate-door-right">
        <svg className="absolute left-0 top-0 h-full w-24 text-[#3d1515] opacity-25" viewBox="0 0 100 500" preserveAspectRatio="none">
          <path d="M0,0 C40,50 80,150 80,250 L80,500 L0,500" fill="none" stroke="currentColor" strokeWidth="3" />
          <path d="M0,50 C25,90 60,170 60,250 L60,500" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="5,5" />
          <path d="M80,150 Q60,160 0,170 M80,200 Q60,210 0,220 M80,250 Q60,260 0,270" fill="none" stroke="currentColor" strokeWidth="1" />
        </svg>
      </div>

      {/* Glowing Red Vampire Ankh Crest in the center */}
      <div className="vampire-gate-crest-container">
        <div className="w-24 h-24 rounded-full bg-[#140808] border-4 border-[#5c1a1a] shadow-[0_0_20px_rgba(139,0,0,0.8)] flex items-center justify-center relative">
          <div className="absolute inset-1 rounded-full border border-[#8b0000]/40 pointer-events-none" />
          <svg width="48" height="48" viewBox="0 0 100 100" className="text-[#ff3333] drop-shadow-[0_0_8px_#ff3333]">
            <path 
              d="M50,15 C40,15 32,23 32,33 C32,45 42,53 47,56 L47,68 L35,68 L35,74 L47,74 L47,90 L53,90 L53,74 L65,74 L65,68 L53,68 L53,56 C58,53 68,45 68,33 C68,23 60,15 50,15 Z M50,21 C56,21 62,26 62,33 C62,40 54,47 50,50 C46,47 38,40 38,33 C38,26 44,21 50,21 Z" 
              fill="currentColor" 
            />
          </svg>
        </div>
      </div>

      {/* Crimson flash overlay when gates meet */}
      <div className="vampire-gate-flash" />
    </div>
  );
}

interface VampireViewProps {
  isMobile: boolean;
  items: any[];
  currentPage: number;
  totalPages: number;
  isTransitioning: boolean;
  goToPrevPage: () => void;
  goToNextPage: () => void;
  theme: string;
  handleSelectCampaign: (camp: any) => void;
  handleDeleteCampaign: (id: number, name: string) => void;
  handleEditCampaign: (e: React.MouseEvent, camp: any) => void;
  setShowCreateModal: (show: boolean) => void;
  setNewCampaign: (camp: any) => void;
}

export function VampireView({
  isMobile,
  items,
  currentPage,
  totalPages,
  isTransitioning,
  goToPrevPage,
  goToNextPage,
  theme,
  handleSelectCampaign,
  handleDeleteCampaign,
  handleEditCampaign,
  setShowCreateModal,
  setNewCampaign
}: VampireViewProps) {
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
      {/* Main Vampire Gate Content */}
      {isMobile ? (
        /* Mobile Paging Layout (1 Card with Gate Transition) */
        <div className="relative w-full min-h-[14rem] px-2 py-4 overflow-hidden">
          <div className={`w-full max-w-[400px] mx-auto ${
            isTransitioning ? 'vampire-page-transition' : ''
          }`}>
            {renderCard(leftItem)}
          </div>
          
          {isTransitioning && <VampireGateOverlay />}
        </div>
      ) : (
        /* Desktop/Tablet Paging Layout (2 Cards with Gate Transition) */
        <div className="relative w-full min-h-[14rem] overflow-hidden">
          <div className={`grid grid-cols-2 gap-x-24 gap-y-12 w-full ${
            isTransitioning ? 'vampire-page-transition' : ''
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

          {/* Sliding Tomb Gates Overlay */}
          {isTransitioning && <VampireGateOverlay />}
        </div>
      )}

      {/* Vampire Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-12 px-4 md:px-8 font-serif text-[#8b0000]">
          <button
            disabled={currentPage === 0 || isTransitioning}
            onClick={goToPrevPage}
            className="vamp-pagination-btn flex items-center justify-center p-3 rounded-full disabled:opacity-30 disabled:hover:border-transparent transition-all text-[#8b0000] select-none"
            title="Previous Bloodline"
            style={{ minWidth: '44px', minHeight: '44px' }}
          >
            <ChevronLeft size={24} strokeWidth={2.5} />
            <span className="hidden sm:inline ml-1 uppercase tracking-wider text-xs md:text-sm font-semibold">☽ Prev ☾</span>
          </button>
          
          <div className="text-center font-bold tracking-widest uppercase text-xs md:text-sm select-none text-[#ff3333]">
            ☽ Page {toRoman(currentPage + 1)} / {toRoman(totalPages)} ☾
          </div>
          
          <button
            disabled={currentPage >= totalPages - 1 || isTransitioning}
            onClick={goToNextPage}
            className="vamp-pagination-btn flex items-center justify-center p-3 rounded-full disabled:opacity-30 disabled:hover:border-transparent transition-all text-[#8b0000] select-none"
            title="Next Bloodline"
            style={{ minWidth: '44px', minHeight: '44px' }}
          >
            <span className="hidden sm:inline mr-1 uppercase tracking-wider text-xs md:text-sm font-semibold">☽ Next ☾</span>
            <ChevronRight size={24} strokeWidth={2.5} />
          </button>
        </div>
      )}
    </div>
  );
}
