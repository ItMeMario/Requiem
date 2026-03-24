import React from 'react';
import { Play } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ResumeButtonProps {
  lastOpenedCampaign: any;
  handleSelectCampaign: (camp: any) => void;
}

export function ResumeButton({ lastOpenedCampaign, handleSelectCampaign }: ResumeButtonProps) {
  const { theme } = useTheme();
  
  if (!lastOpenedCampaign) return null;

  const isCyber = theme === 'cyberpunk';
  const isMed = theme === 'medieval';

  let btnClass = "absolute top-6 left-6 z-[100] flex items-center space-x-2 px-4 py-2 rounded-lg transition-all shadow-md ";
  
  if (isCyber) {
    btnClass += "cyber-carbon-card border border-[#0ff]/50 text-[#0ff] hover:shadow-[0_0_15px_rgba(0,255,255,0.4)]";
  } else if (isMed) {
    btnClass += "bg-[#e8d8b0] border border-[#8b4513]/40 hover:border-[#8b4513] text-[#3e2723] shadow-[inset_0_1px_2px_rgba(255,255,255,0.5)]";
  } else {
    btnClass += "bg-surface-elevated border border-border-subtle hover:border-accent text-muted hover:text-accent-text";
  }

  return (
    <button
      onClick={() => handleSelectCampaign(lastOpenedCampaign)}
      className={btnClass}
      title="Resume Last Campaign"
    >
      <Play size={16} className={isCyber ? "" : isMed ? "text-[#8b4513]" : "text-accent2-text"} />
      <span className="font-semibold whitespace-nowrap text-sm">Resume: {lastOpenedCampaign.name}</span>
    </button>
  );
}
