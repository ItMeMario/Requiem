import React from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';

interface CampaignCardProps {
  theme: string;
  item: any; // { type: 'create' } or { type: 'campaign', data: any }
  handleSelectCampaign: (camp: any) => void;
  handleDeleteCampaign: (id: number, name: string) => void;
  handleEditCampaign: (e: React.MouseEvent, camp: any) => void;
  setShowCreateModal: (show: boolean) => void;
  setNewCampaign: (camp: any) => void;
}

export function CampaignCard({
  theme,
  item,
  handleSelectCampaign,
  handleDeleteCampaign,
  handleEditCampaign,
  setShowCreateModal,
  setNewCampaign
}: CampaignCardProps) {
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

    if (theme === 'vampire') {
      return (
        <button 
          onClick={() => {
            setNewCampaign({ name: '', genre: '', system: '' });
            setShowCreateModal(true);
          }}
          className="h-48 rounded-xl bg-[#0d0d12] border border-[#1f1f2e] flex flex-col items-center justify-center text-[#555566] hover:text-[#d1d1d6] hover:border-[#3d3d4a] hover:shadow-[0_0_20px_rgba(0,0,0,0.6)] transition-all group relative overflow-hidden w-full"
        >
          <Plus size={48} strokeWidth={1.5} className="mb-4 group-hover:scale-110 transition-transform drop-shadow-[0_0_8px_rgba(255,0,0,0.5)] z-10" />
          <span className="text-sm font-bold tracking-widest font-serif z-10">FORGE BLOODLINE</span>
        </button>
      );
    }
    
    if (theme === 'medieval') {
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

    // Default theme layout
    return (
      <button 
        onClick={() => {
          setNewCampaign({ name: '', genre: '', system: '' });
          setShowCreateModal(true);
        }}
        className="h-48 rounded-xl border-2 border-dashed border-border-default flex flex-col items-center justify-center text-muted hover:text-accent-text hover:border-accent hover:bg-surface-hover transition-all group w-full"
      >
        <Plus size={36} className="mb-4 text-accent2-text group-hover:text-accent-text transition-colors" />
        <span className="text-lg font-semibold border-b border-transparent group-hover:border-accent-text transition-colors">Start New Campaign</span>
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

  if (theme === 'vampire') {
    return (
      <div
        onClick={() => handleSelectCampaign(camp)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') handleSelectCampaign(camp);
        }}
        className="h-48 text-left rounded-xl p-6 flex flex-col justify-between transition-all group cursor-pointer relative overflow-hidden bg-[#0d0d12] border border-[#1f1f2e] hover:-translate-y-1 hover:shadow-[0_10px_25px_rgba(0,0,0,0.6)] hover:border-[#3d3d4a] w-full"
      >
        {/* Actions Container */}
        <div className="absolute top-4 right-4 z-20 transition-opacity opacity-100 sm:opacity-0 sm:group-hover:opacity-100 flex gap-1">
          <button
            onClick={(e) => handleEditCampaign(e, camp)}
            className="p-1.5 rounded-md transition-colors text-[#555566] hover:text-[#d1d1d6] hover:bg-white/10"
            title="Edit Campaign"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteCampaign(camp.id, camp.name);
            }}
            className="p-1.5 rounded-md transition-colors text-[#555566] hover:text-[#ff3333] hover:bg-[#ff0000]/10"
            title="Delete Campaign"
          >
            <Trash2 size={16} />
          </button>
        </div>

        <div className="relative pointer-events-none z-10 flex-1 flex flex-col justify-center">
          <div className="flex items-center space-x-3 mb-2">
            <span className="text-[#8b0000] text-2xl select-none flex items-center justify-center">☽☉☾</span>
            <h3 className="text-xl font-bold truncate pr-8 text-[#ff3333] font-serif tracking-widest">{camp.name}</h3>
          </div>
          
          {camp.genre && (
            <span className="inline-block mt-2 px-3 py-1 text-[11px] rounded uppercase tracking-wider font-bold self-start bg-[#1f1f2e]/60 text-[#a0a0b0] border border-[#2a2a35]">
              {camp.genre}
            </span>
          )}
        </div>
        
        <div className="relative flex items-end text-sm mt-auto pointer-events-none z-10 justify-between pt-4 border-t border-[#1f1f2e] text-[#606070]">
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest mt-1 text-[#606070]">
            {camp.system || 'Unknown System'}
          </span>
          <span className="font-semibold px-4 py-1.5 rounded transition-colors text-[#8b0000] tracking-widest text-xs hover:text-[#ff3333]">
            ENTER &rarr;
          </span>
        </div>
      </div>
    );
  }

  if (theme === 'medieval') {
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
  }

  // Default theme layout
  return (
    <div
      onClick={() => handleSelectCampaign(camp)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') handleSelectCampaign(camp);
      }}
      className="h-48 text-left rounded-xl p-6 flex flex-col justify-between transition-all group cursor-pointer bg-surface-elevated border border-border-subtle hover:shadow-lg hover:border-accent hover:-translate-y-1 relative overflow-hidden w-full"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-surface-hover opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      
      {/* Actions Container */}
      <div className="absolute top-4 right-4 z-20 transition-opacity opacity-100 sm:opacity-0 sm:group-hover:opacity-100 flex gap-1">
        <button
          onClick={(e) => handleEditCampaign(e, camp)}
          className="p-1.5 rounded-md transition-colors text-muted hover:text-accent-text hover:bg-surface-hover"
          title="Edit Campaign"
        >
          <Edit2 size={16} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteCampaign(camp.id, camp.name);
          }}
          className="p-1.5 rounded-md transition-colors text-muted hover:text-red-500 hover:bg-red-500/10"
          title="Delete Campaign"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="relative pointer-events-none z-10 flex-1 flex flex-col justify-center">
        <div className="flex items-center space-x-3 mb-2">
          <span className="text-accent-text text-2xl select-none flex items-center justify-center">☽☉☾</span>
          <h3 className="text-xl font-bold truncate pr-8 text-heading">{camp.name}</h3>
        </div>
        
        {camp.genre && <span className="inline-block mt-2 px-3 py-1 text-[11px] rounded uppercase tracking-wider font-bold self-start bg-surface-deep text-secondary">{camp.genre}</span>}
      </div>
      
      <div className="relative flex items-end text-sm mt-auto pointer-events-none z-10 justify-between pt-4 border-t border-border-subtle text-faint">
        <span>{camp.system || 'Unknown System'}</span>
        <span className="font-semibold px-4 py-1.5 rounded transition-colors group-hover:text-accent-text">
          Enter &rarr;
        </span>
      </div>
    </div>
  );
}
