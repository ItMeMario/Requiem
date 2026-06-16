import React from 'react';
import { Play, Plus, Edit2, Trash2 } from 'lucide-react';
import { getThemeLabels } from '../../utils/themeLabels';
import { DashboardHeader } from './DashboardHeader';
import { AuthControls } from '../AuthControls';

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

        {/* Campaign List / Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-x-24 md:gap-y-12">
          {/* Start New Campaign button depending on theme */}
          {theme === 'cyberpunk' ? (
            <button 
              onClick={() => {
                setNewCampaign({ name: '', genre: '', system: '' });
                setShowCreateModal(true);
              }}
              className="h-48 rounded-xl cyber-smoked-glass flex flex-col items-center justify-center text-[#0ff] hover:text-white hover:shadow-[0_0_30px_rgba(0,255,255,0.4)] transition-all group overflow-hidden relative"
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
          ) : theme === 'vampire' ? (
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
          ) : theme === 'medieval' ? (
            <button 
              onClick={() => {
                setNewCampaign({ name: '', genre: '', system: '' });
                setShowCreateModal(true);
              }}
              className="h-48 relative bg-[#f4eacc] border transition-all text-[#3e2723] flex flex-col items-center justify-center hover:-translate-y-1 hover:shadow-lg cursor-pointer group"
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
            const isCyber = theme === 'cyberpunk';
            const isMed = theme === 'medieval';
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
                  isCyber 
                    ? 'h-48 text-left rounded-xl p-6 flex flex-col justify-between transition-all group cursor-pointer cyber-smoked-glass hover:border-[#0ff]/80 hover:shadow-[0_0_20px_rgba(0,255,255,0.3)]' 
                    : isMed
                    ? 'h-48 text-center rounded p-6 flex flex-col justify-between transition-all group cursor-pointer relative overflow-hidden wood-plank shadow-[2px_4px_10px_rgba(0,0,0,0.15)] hover:-translate-y-1 hover:shadow-[4px_8px_15px_rgba(0,0,0,0.25)] border-[#5c3a21] border'
                    : isVamp
                    ? 'h-48 text-left rounded-xl p-6 flex flex-col justify-between transition-all group cursor-pointer relative overflow-hidden bg-[#0d0d12] border border-[#1f1f2e] hover:-translate-y-1 hover:shadow-[0_10px_25px_rgba(0,0,0,0.6)] hover:border-[#3d3d4a]'
                    : 'h-48 text-left rounded-xl p-6 flex flex-col justify-between transition-all group cursor-pointer bg-surface-elevated border border-border-subtle hover:shadow-lg hover:border-accent hover:-translate-y-1 relative overflow-hidden'
                }
              >
                {!isCyber && !isMed && !isVamp && <div className="absolute inset-0 bg-gradient-to-br from-transparent to-surface-hover opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />}
                {isCyber && <div className="micro-circuit-pattern" />}
                {isMed && (
                  <>
                    <div className="absolute inset-0 bg-[#d4a373] mix-blend-multiply opacity-20 pointer-events-none" />
                    <div className="absolute inset-2 border border-[#3e2723]/30 pointer-events-none rounded" />
                  </>
                )}
                
                {/* Actions Container */}
                <div className={`absolute ${isMed ? 'top-3 right-3' : 'top-4 right-4'} z-20 transition-opacity opacity-0 group-hover:opacity-100 flex gap-1`}>
                  <button
                    onClick={(e) => handleEditCampaign(e, camp)}
                    className={`p-1.5 rounded-md transition-colors ${
                      isCyber ? 'text-[#0ff] hover:bg-[#0ff]/20' : 
                      isVamp ? 'text-[#555566] hover:text-[#d1d1d6] hover:bg-[#ffffff]/10' : 
                      isMed ? 'text-[#3e2723]/60 hover:text-[#3e2723] hover:bg-[#8b4513]/10' : 
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
                      isCyber ? 'text-[#ff003c] hover:bg-[#ff003c]/20' : 
                      isVamp ? 'text-[#555566] hover:text-[#ff3333] hover:bg-[#ff0000]/10' : 
                      isMed ? 'text-[#3e2723]/60 hover:text-red-700 hover:bg-red-500/10' : 
                      'text-muted hover:text-red-500 hover:bg-red-500/10'
                    }`}
                    title="Delete Campaign"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="relative pointer-events-none z-10 flex-1 flex flex-col justify-center">
                  {!isMed && (
                    <div className="flex items-center space-x-3 mb-2">
                      <span className={`${isCyber ? 'text-[#0ff]' : isVamp ? 'text-[#8b0000]' : 'text-accent-text'} text-2xl select-none flex items-center justify-center`}>☽☉☾</span>
                      <h3 className={`text-xl font-bold truncate pr-8 ${isCyber ? 'text-[#0ff] tracking-wider' : isVamp ? 'text-[#ff3333] font-serif tracking-widest' : 'text-heading'}`}>{camp.name}</h3>
                    </div>
                  )}
                  {isMed && (
                    <h3 className="text-2xl font-bold font-serif text-[#3e2723] leading-tight mb-4" style={{ textShadow: '0 1px 1px rgba(255,255,255,0.3)' }}>
                      {camp.name}
                    </h3>
                  )}
                  
                  {!isMed && camp.genre && <span className={`inline-block mt-2 px-3 py-1 text-[11px] rounded uppercase tracking-wider font-bold self-start ${isCyber ? 'cyber-glowing-pill text-cyan-glitch' : isVamp ? 'bg-[#1f1f2e]/60 text-[#a0a0b0] border border-[#2a2a35]' : 'bg-surface-deep text-secondary'}`}>{camp.genre}</span>}
                </div>
                
                {isCyber && <div className="absolute bottom-4 left-6 text-[10px] text-[#0ff]/40 font-mono">v.1.{camp.id} | RAD DX</div>}
                
                <div className={`relative flex items-end text-sm mt-auto pointer-events-none z-10 ${
                  isCyber ? 'justify-between pt-4 border-t border-[#0ff]/30 text-[#0ff]/70' : 
                  isVamp ? 'justify-between pt-4 border-t border-[#1f1f2e] text-[#606070]' : 
                  isMed ? 'justify-center py-1 px-4 border-t border-b border-[#5c3a21]/20 font-bold uppercase tracking-widest text-[11px] text-[#5c3a21]' : 
                  'justify-between pt-4 border-t border-border-subtle text-faint'
                }`}>
                  {isMed ? (
                    <div className="flex items-center space-x-2">
                      <span>{camp.genre || 'FANTASY'}</span>
                      <span className="opacity-50">|</span>
                      <span>{camp.system || 'SYSTEM'}</span>
                    </div>
                  ) : (
                    <>
                      <span className={isCyber ? 'cyber-glowing-pill px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest mt-1' : isVamp ? 'px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest mt-1 text-[#606070]' : ''}>{camp.system || 'Unknown System'}</span>
                      <span className={`font-semibold px-4 py-1.5 rounded transition-colors ${isCyber ? 'cyber-enter-btn text-xs tracking-widest' : isVamp ? 'text-[#8b0000] tracking-widest text-xs hover:text-[#ff3333]' : 'group-hover:text-accent-text'}`}>
                        {(isCyber || isVamp) ? 'ENTER' : 'Enter'} &rarr;
                      </span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
