import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CampaignCard } from './CampaignCard';

function toRoman(num: number): string {
  const roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
  return roman[num - 1] || num.toString();
}

function BlankPage() {
  return (
    <div className="h-48 w-full rounded p-6 bg-[#f4eacc] border-[#5c3a21] border relative overflow-hidden shadow-md">
      <div className="absolute inset-0 bg-[#d4a373] mix-blend-multiply opacity-20 pointer-events-none" />
      <div className="absolute inset-2 border border-[#3e2723]/30 pointer-events-none rounded" />
    </div>
  );
}

interface MedievalViewProps {
  isMobile: boolean;
  items: any[];
  currentPage: number;
  totalPages: number;
  isTransitioning: boolean;
  direction: 'next' | 'prev' | null;
  goToPrevPage: () => void;
  goToNextPage: () => void;
  theme: string;
  handleSelectCampaign: (camp: any) => void;
  handleDeleteCampaign: (id: number, name: string) => void;
  handleEditCampaign: (e: React.MouseEvent, camp: any) => void;
  setShowCreateModal: (show: boolean) => void;
  setNewCampaign: (camp: any) => void;
}

export function MedievalView({
  isMobile,
  items,
  currentPage,
  totalPages,
  isTransitioning,
  direction,
  goToPrevPage,
  goToNextPage,
  theme,
  handleSelectCampaign,
  handleDeleteCampaign,
  handleEditCampaign,
  setShowCreateModal,
  setNewCampaign
}: MedievalViewProps) {
  // Determine items to display on left, right, and flipping pages
  let leftItem = null;
  let rightItem = null;
  let frontItem = null;
  let backItem = null;

  if (!isMobile) {
    if (isTransitioning) {
      if (direction === 'next') {
        leftItem = items[currentPage * 2];
        rightItem = items[(currentPage + 1) * 2 + 1];
        frontItem = items[currentPage * 2 + 1];
        backItem = items[(currentPage + 1) * 2];
      } else if (direction === 'prev') {
        leftItem = items[(currentPage - 1) * 2];
        rightItem = items[currentPage * 2 + 1];
        frontItem = items[currentPage * 2];
        backItem = items[(currentPage - 1) * 2 + 1];
      }
    } else {
      leftItem = items[currentPage * 2];
      rightItem = items[currentPage * 2 + 1];
    }
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
      {/* Main Book Paged Content */}
      {isMobile ? (
        /* Mobile Paging Layout (1 Card at a time with 3D Flip) */
        <div className="relative mobile-book-container w-full min-h-[14rem] px-2 py-4">
          {/* Static Card Underneath */}
          <div className="w-full max-w-[400px] mx-auto">
            {renderCard(
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
                {renderCard(direction === 'next' ? items[currentPage] : items[currentPage - 1])}
              </div>
              {/* Back Side */}
              <div className="book-page-flipping-back">
                <BlankPage />
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
                {renderCard(leftItem)}
              </div>
            </div>
            
            {/* Right Page Column */}
            <div className="w-full flex justify-start pl-12">
              <div className="w-full max-w-[400px]">
                {renderCard(rightItem)}
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
                  {renderCard(frontItem)}
                </div>
              </div>
              <div className={`book-page-flipping-back w-full flex ${
                direction === 'next' 
                  ? 'justify-end pr-12' 
                  : 'justify-start pl-12'
              }`}>
                <div className="w-full max-w-[400px]">
                  {renderCard(backItem)}
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
  );
}
