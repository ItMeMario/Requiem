import React from 'react';
import { Plus, Play, Trash2 } from 'lucide-react';
import { ThemeSwitcher } from '../ThemeSwitcher';
import { getThemeLabels } from '../../utils/themeLabels';

interface MedievalDashboardProps {
  campaigns: any[];
  lastOpenedCampaign: any;
  handleSelectCampaign: (camp: any) => void;
  handleDeleteCampaign: (id: number, name: string) => void;
  setShowCreateModal: (show: boolean) => void;
}

export function MedievalDashboard({
  campaigns,
  lastOpenedCampaign,
  handleSelectCampaign,
  handleDeleteCampaign,
  setShowCreateModal
}: MedievalDashboardProps) {
  return (
    <main className="flex w-full h-full text-primary relative">
      <div className="flex w-full h-full p-4 md:p-8 relative gap-12 z-10">
        
        {/* LEFT PAGE - LORE & CREATION */}
        <div className="flex-1 flex flex-col items-center justify-center border-r-[3px] border-dashed border-[#d9c596]/40 pr-8 relative">
          
          <div className="max-w-md w-full text-center mb-10">
            <h2 className="text-5xl font-bold text-[#3e2723] mb-4" style={{ fontFamily: '"Georgia", "Times New Roman", serif', letterSpacing: '0.05em' }}>
              Your Lore
            </h2>
            <p className="text-lg text-[#4e342e] mb-10 leading-relaxed max-w-sm mx-auto">
              Select a campaign or create a new one to begin your journey.
            </p>

            <button 
              onClick={() => setShowCreateModal(true)}
              className="w-full h-32 relative bg-[#f4eacc] border transition-all text-[#3e2723] flex flex-col items-center justify-center hover:-translate-y-1 hover:shadow-lg cursor-pointer"
              style={{
                boxShadow: 'inset 0 0 0 2px #f4eacc, inset 0 0 0 4px rgba(139, 69, 19, 0.4)',
                border: '1px solid rgba(139, 69, 19, 0.6)'
              }}
            >
              <div className="absolute inset-1 border-[1.5px] border-double border-[#8b4513]/40 pointer-events-none" />
              <div className="absolute top-0 left-0 w-4 h-4 border-l border-t border-[#8b4513] m-2 pointer-events-none" />
              <div className="absolute top-0 right-0 w-4 h-4 border-r border-t border-[#8b4513] m-2 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-l border-b border-[#8b4513] m-2 pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-r border-b border-[#8b4513] m-2 pointer-events-none" />
              
              <Plus size={36} strokeWidth={2.5} className="mb-2" />
              <span className="text-xl font-semibold tracking-wide font-serif">Start New Campaign</span>
            </button>
          </div>

          <div className="absolute bottom-4 left-4">
             <ThemeSwitcher size="md" />
          </div>
          
          {lastOpenedCampaign && (
            <button
              onClick={() => handleSelectCampaign(lastOpenedCampaign)}
              className="absolute top-4 left-4 flex items-center space-x-2 px-4 py-2 rounded-md bg-[#e8d8b0] border border-border-subtle hover:border-accent text-primary hover:text-accent-text transition-all shadow-sm"
              title="Resume Last Campaign"
            >
              <Play size={16} className="text-[#8b4513]" />
              <span className="font-semibold whitespace-nowrap text-sm">Resume: {lastOpenedCampaign.name}</span>
            </button>
          )}

        </div>


        {/* RIGHT PAGE - EXISTING CAMPAIGNS */}
        <div className="flex-1 flex flex-col pl-4 relative h-full overflow-y-auto custom-scrollbar pt-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
            {campaigns.map(camp => (
              <div
                key={camp.id}
                onClick={() => handleSelectCampaign(camp)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') handleSelectCampaign(camp);
                }}
                className="h-56 relative rounded flex flex-col group cursor-pointer overflow-hidden wood-plank text-center shadow-[2px_4px_10px_rgba(0,0,0,0.15)] transition-all hover:-translate-y-1 hover:shadow-[4px_8px_15px_rgba(0,0,0,0.25)]"
                style={{
                  border: '1px solid #5c3a21',
                }}
              >
                {/* Wood Texture Overlay (done in CSS classes usually, but we can do a quick inline overlay) */}
                <div className="absolute inset-0 bg-[#d4a373] mix-blend-multiply opacity-20 pointer-events-none" />
                <div className="absolute inset-2 border border-[#3e2723]/30 pointer-events-none rounded" />

                {/* Delete Button */}
                <div className="absolute top-3 right-3 z-20 transition-opacity opacity-0 group-hover:opacity-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCampaign(camp.id, camp.name);
                    }}
                    className="p-1.5 rounded-md text-[#3e2723]/60 hover:text-red-700 hover:bg-red-500/10 transition-colors"
                    title="Delete Campaign"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="flex-1 flex flex-col justify-center items-center p-6 relative z-10">
                  <h3 className="text-2xl font-bold font-serif text-[#3e2723] leading-tight mb-4" style={{ textShadow: '0 1px 1px rgba(255,255,255,0.3)' }}>
                    {camp.name}
                  </h3>

                  <div className="flex items-center space-x-2 text-[11px] font-bold text-[#5c3a21] uppercase tracking-widest border-t border-b border-[#5c3a21]/20 py-1 px-4 mt-auto w-full justify-center">
                    <span>{camp.genre || 'FANTASY'}</span>
                    <span className="opacity-50">|</span>
                    <span>{camp.system || 'SYSTEM'}</span>
                  </div>
                  
                  <button className="mt-4 px-6 py-1.5 bg-[#f4eacc] text-[#3e2723] font-serif border border-[#8b4513]/40 rounded hover:bg-[#e8d8b0] transition-colors shadow-sm font-semibold flex items-center shadow-[inset_0_1px_2px_rgba(255,255,255,0.5)]">
                    Enter &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </main>
  );
}
