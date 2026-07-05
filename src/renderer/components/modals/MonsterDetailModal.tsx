import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Shield, Heart, Swords, Eye, Download } from 'lucide-react';
import DOMPurify from 'dompurify';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

// Type definition for Monster
interface Monster {
  name: string;
  meta: string;
  "Armor Class": string;
  "Hit Points": string;
  Speed: string;
  STR: string;
  STR_mod: string;
  DEX: string;
  DEX_mod: string;
  CON: string;
  CON_mod: string;
  INT: string;
  INT_mod: string;
  WIS: string;
  WIS_mod: string;
  CHA: string;
  CHA_mod: string;
  "Saving Throws"?: string;
  Skills?: string;
  Senses?: string;
  Languages?: string;
  Challenge: string;
  Traits?: string;
  Actions?: string;
  "Legendary Actions"?: string;
  Reactions?: string;
  "Damage Resistances"?: string;
  "Damage Vulnerabilities"?: string;
  "Damage Immunities"?: string;
  "Condition Immunities"?: string;
  img_url?: string;
}

interface MonsterDetailModalProps {
  showModal: boolean;
  handleClose: () => void;
  monster: Monster | null;
  theme: string;
}

export const MonsterDetailModal: React.FC<MonsterDetailModalProps> = ({
  showModal,
  handleClose,
  monster,
  theme,
}) => {
  const [activePreviewImage, setActivePreviewImage] = useState<string | null>(null);

  if (!showModal || !monster) return null;

  const handleDownloadAttachment = async (url: string, name: string) => {
    try {
      if (Capacitor.isNativePlatform()) {
        const base64Parts = url.split(',');
        const base64Data = base64Parts[1] || base64Parts[0];
        const writeResult = await Filesystem.writeFile({
          path: name,
          data: base64Data,
          directory: Directory.Cache
        });
        await Share.share({
          title: name,
          url: writeResult.uri,
          dialogTitle: `Open/Share ${name}`,
        });
      } else {
        const a = document.createElement('a');
        a.href = url;
        a.download = name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error downloading image:', error);
      alert('Erro ao baixar imagem');
    }
  };

  const handleDownloadPortrait = async () => {
    if (!monster.img_url) return;
    try {
      const fileName = `${monster.name.toLowerCase().replace(/\s+/g, '_')}_portrait.jpg`;
      await handleDownloadAttachment(monster.img_url, fileName);
    } catch (error) {
      console.error('Error downloading portrait:', error);
      alert('Erro ao baixar retrato');
    }
  };

  // Safe HTML sanitization
  const renderHTMLContent = (content: string) => {
    return { __html: DOMPurify.sanitize(content) };
  };

  // Ability modifiers formatting helper
  const renderAbility = (label: string, value: string, modifier: string) => {
    const formattedMod = modifier.startsWith('(') ? modifier : `(${modifier})`;
    return (
      <div className="flex flex-col items-center p-2 rounded bg-black/5 border border-border-subtle hover:bg-black/10 transition-colors">
        <span className="text-[10px] uppercase font-bold tracking-wider opacity-60">{label}</span>
        <span className="text-sm sm:text-base font-extrabold text-primary">{value}</span>
        <span className="text-xs font-semibold text-accent-text">{formattedMod}</span>
      </div>
    );
  };

  // Get themed container and text colors
  const getThemeClasses = () => {
    switch (theme) {
      case 'medieval':
        return {
          overlay: 'bg-[#1b120f]/80 backdrop-blur-sm',
          card: 'bg-[#fdf5db] border-4 border-t-8 border-b-8 border-[#b71c1c] border-x-[#b8860b] text-[#3e2723] rounded-sm font-serif',
          header: 'border-b border-[#3e2723]/30 pb-2 mb-2',
          title: 'text-[#8b0000] font-bold text-3xl font-serif tracking-wide',
          meta: 'text-[#5d4037] italic text-sm font-sans',
          statDivider: 'h-[3px] my-3 border-none bg-gradient-to-r from-[#b71c1c] via-[#b8860b] to-[#b71c1c]',
          sectionHeader: 'text-[#8b0000] font-bold text-lg border-b border-[#3e2723]/20 pb-1 mb-2 tracking-wide font-serif',
          statText: 'text-[#3e2723] font-sans text-sm',
          statLabel: 'text-[#8b0000] font-bold',
          htmlClass: '[&_strong]:text-[#8b0000] [&_strong]:font-bold [&_em]:italic [&_p]:mb-3 [&_p]:text-sm [&_p]:leading-relaxed font-sans',
          abilityBg: 'bg-[#f5e9c9] border-[#b8860b]/40',
          closeBtn: 'text-[#3e2723] hover:bg-[#3e2723]/10 hover:text-[#8b0000] bg-[#f5e9c9] border border-[#b8860b]/40',
        };
      case 'cyberpunk':
        return {
          overlay: 'bg-black/90 backdrop-blur-md',
          card: 'bg-[#0a0f1d]/95 border-2 border-[#00ffcc] text-[#00ffcc] shadow-[0_0_20px_rgba(0,255,204,0.25)] rounded-none font-mono',
          header: 'border-b-2 border-dashed border-[#00ffcc]/40 pb-3 mb-3',
          title: 'text-[#ff0055] font-extrabold text-3xl tracking-widest uppercase cyber-glitch',
          meta: 'text-yellow-400 text-xs uppercase tracking-wider',
          statDivider: 'h-[1px] my-4 bg-transparent border-t-2 border-dashed border-[#00ffcc]/30',
          sectionHeader: 'text-yellow-400 font-extrabold text-base uppercase border-b-2 border-yellow-400/30 pb-1 mb-2 tracking-widest',
          statText: 'text-primary text-xs leading-relaxed',
          statLabel: 'text-[#ff0055] font-bold uppercase',
          htmlClass: '[&_strong]:text-yellow-400 [&_strong]:font-bold [&_em]:italic [&_p]:mb-3 [&_p]:text-xs [&_p]:leading-relaxed font-mono',
          abilityBg: 'bg-black/40 border-[#00ffcc]/30',
          closeBtn: 'text-[#00ffcc] hover:bg-[#00ffcc]/20 border border-[#00ffcc]',
        };
      case 'vampire':
        return {
          overlay: 'bg-[#050002]/90 backdrop-blur-lg',
          card: 'bg-[#0c0507] border-2 border-[#b71c1c] text-[#e1d5d5] shadow-[0_0_25px_rgba(183,28,28,0.4)] rounded-lg font-serif',
          header: 'border-b border-[#b71c1c]/40 pb-3 mb-3',
          title: 'text-[#e63946] font-semibold text-3xl italic tracking-wide font-serif',
          meta: 'text-[#a1887f] italic text-sm font-serif',
          statDivider: 'h-[1px] my-3 border-none bg-gradient-to-r from-transparent via-[#b71c1c] to-transparent',
          sectionHeader: 'text-[#e63946] font-semibold text-lg border-b border-[#b71c1c]/30 pb-1 mb-2 tracking-wide font-serif',
          statText: 'text-[#e1d5d5] text-sm font-sans',
          statLabel: 'text-[#e63946] font-semibold',
          htmlClass: '[&_strong]:text-[#e63946] [&_strong]:font-semibold [&_em]:italic [&_p]:mb-3 [&_p]:text-sm [&_p]:leading-relaxed font-sans',
          abilityBg: 'bg-[#1b0a0e] border-[#b71c1c]/30',
          closeBtn: 'text-[#e1d5d5] hover:bg-[#b71c1c]/20 hover:text-white border border-[#b71c1c]',
        };
      default:
        return {
          overlay: 'bg-surface-overlay backdrop-blur-sm',
          card: 'bg-surface-card border border-border-default rounded-xl text-primary font-sans',
          header: 'border-b border-border-default pb-4 mb-4',
          title: 'text-heading font-extrabold text-2xl tracking-wide',
          meta: 'text-accent-text text-sm font-medium',
          statDivider: 'h-[1px] my-4 border-none bg-border-subtle',
          sectionHeader: 'text-heading font-bold text-base border-b border-border-subtle pb-1.5 mb-3 tracking-wide',
          statText: 'text-secondary text-sm',
          statLabel: 'text-accent-text font-semibold',
          htmlClass: '[&_strong]:text-accent-text [&_strong]:font-bold [&_em]:italic [&_p]:mb-3 [&_p]:text-sm [&_p]:leading-relaxed',
          abilityBg: 'bg-surface-hover/40 border-border-subtle',
          closeBtn: 'text-heading hover:bg-surface-hover border border-border-hover',
        };
    }
  };

  const style = getThemeClasses();

  return createPortal(
    <>
      <div className={`fixed inset-0 ${style.overlay} flex items-center justify-center z-[9999] p-0 sm:p-4`}>
        <div className={`w-full max-w-5xl shadow-2xl relative h-full sm:h-auto sm:max-h-[92vh] overflow-hidden flex flex-col p-4 sm:p-6 ${style.card}`}>
          
          {/* Header */}
          <div className={`flex justify-between items-center shrink-0 ${style.header}`}>
            <div>
              <h3 className={style.title}>{monster.name}</h3>
              <p className={style.meta}>{monster.meta}</p>
            </div>
            <button
              onClick={handleClose}
              className={`p-1.5 transition-colors rounded-full ${style.closeBtn}`}
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              
              {/* Left Column: Image (if present) */}
              {monster.img_url && (
                <div className="md:col-span-2 flex flex-col space-y-4">
                  <div className="w-full aspect-[4/5] bg-black/10 rounded-lg overflow-hidden border border-border-subtle relative group shadow-md">
                    <img
                      src={monster.img_url}
                      alt={monster.name}
                      className="w-full h-full object-cover object-center cursor-zoom-in"
                      onClick={() => setActivePreviewImage(monster.img_url || null)}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => setActivePreviewImage(monster.img_url || null)}
                        className="p-3 bg-surface-card hover:bg-surface-hover rounded-full text-heading transition-colors shadow-lg"
                        title="Zoom Image"
                      >
                        <Eye size={20} />
                      </button>
                      <button
                        type="button"
                        onClick={handleDownloadPortrait}
                        className="p-3 bg-surface-card hover:bg-surface-hover rounded-full text-heading transition-colors shadow-lg"
                        title="Download Image"
                      >
                        <Download size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Right Column: Detailed D&D 5e Stat Block */}
              <div className={monster.img_url ? "md:col-span-3 space-y-4" : "md:col-span-5 space-y-4"}>
                
                {/* AC, HP, Speed */}
                <div className="space-y-1.5">
                  <div className={style.statText}>
                    <span className={style.statLabel}>Armor Class:</span> {monster["Armor Class"]}
                  </div>
                  <div className={style.statText}>
                    <span className={style.statLabel}>Hit Points:</span> {monster["Hit Points"]}
                  </div>
                  <div className={style.statText}>
                    <span className={style.statLabel}>Speed:</span> {monster.Speed}
                  </div>
                </div>

                <div className={style.statDivider} />

                {/* 6 Ability Scores Table */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {renderAbility('STR', monster.STR, monster.STR_mod)}
                  {renderAbility('DEX', monster.DEX, monster.DEX_mod)}
                  {renderAbility('CON', monster.CON, monster.CON_mod)}
                  {renderAbility('INT', monster.INT, monster.INT_mod)}
                  {renderAbility('WIS', monster.WIS, monster.WIS_mod)}
                  {renderAbility('CHA', monster.CHA, monster.CHA_mod)}
                </div>

                <div className={style.statDivider} />

                {/* Additional Stats */}
                <div className="space-y-1.5">
                  {monster["Saving Throws"] && (
                    <div className={style.statText}>
                      <span className={style.statLabel}>Saving Throws:</span> {monster["Saving Throws"]}
                    </div>
                  )}
                  {monster.Skills && (
                    <div className={style.statText}>
                      <span className={style.statLabel}>Skills:</span> {monster.Skills}
                    </div>
                  )}
                  {monster["Damage Vulnerabilities"] && (
                    <div className={style.statText}>
                      <span className={style.statLabel}>Damage Vulnerabilities:</span> {monster["Damage Vulnerabilities"]}
                    </div>
                  )}
                  {monster["Damage Resistances"] && (
                    <div className={style.statText}>
                      <span className={style.statLabel}>Damage Resistances:</span> {monster["Damage Resistances"]}
                    </div>
                  )}
                  {monster["Damage Immunities"] && (
                    <div className={style.statText}>
                      <span className={style.statLabel}>Damage Immunities:</span> {monster["Damage Immunities"]}
                    </div>
                  )}
                  {monster["Condition Immunities"] && (
                    <div className={style.statText}>
                      <span className={style.statLabel}>Condition Immunities:</span> {monster["Condition Immunities"]}
                    </div>
                  )}
                  {monster.Senses && (
                    <div className={style.statText}>
                      <span className={style.statLabel}>Senses:</span> {monster.Senses}
                    </div>
                  )}
                  {monster.Languages && (
                    <div className={style.statText}>
                      <span className={style.statLabel}>Languages:</span> {monster.Languages}
                    </div>
                  )}
                  <div className={style.statText}>
                    <span className={style.statLabel}>Challenge:</span> {monster.Challenge}
                  </div>
                </div>

                <div className={style.statDivider} />

                {/* Traits */}
                {monster.Traits && monster.Traits.trim() !== "" && (
                  <div>
                    <div dangerouslySetInnerHTML={renderHTMLContent(monster.Traits)} className={style.htmlClass} />
                  </div>
                )}

                {/* Actions */}
                {monster.Actions && monster.Actions.trim() !== "" && (
                  <div className="mt-4">
                    <h4 className={style.sectionHeader}>Actions</h4>
                    <div dangerouslySetInnerHTML={renderHTMLContent(monster.Actions)} className={style.htmlClass} />
                  </div>
                )}

                {/* Legendary Actions */}
                {monster["Legendary Actions"] && monster["Legendary Actions"].trim() !== "" && (
                  <div className="mt-4">
                    <h4 className={style.sectionHeader}>Legendary Actions</h4>
                    <div dangerouslySetInnerHTML={renderHTMLContent(monster["Legendary Actions"])} className={style.htmlClass} />
                  </div>
                )}

                {/* Reactions */}
                {monster.Reactions && monster.Reactions.trim() !== "" && (
                  <div className="mt-4">
                    <h4 className={style.sectionHeader}>Reactions</h4>
                    <div dangerouslySetInnerHTML={renderHTMLContent(monster.Reactions)} className={style.htmlClass} />
                  </div>
                )}
                
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 flex justify-end border-t border-border-subtle shrink-0">
            <button
              onClick={handleClose}
              className={`px-5 py-2 font-bold transition-all ${
                theme === 'cyberpunk'
                  ? 'bg-transparent text-[#00ffcc] hover:bg-[#00ffcc]/20 border border-[#00ffcc]'
                  : theme === 'medieval'
                  ? 'bg-[#f5e9c9] border border-[#b8860b] text-[#3e2723] hover:opacity-90'
                  : theme === 'vampire'
                  ? 'bg-[#1b0a0e] border border-[#b71c1c] text-[#e63946] hover:bg-[#b71c1c]/20'
                  : 'bg-surface-hover hover:opacity-80 border border-border-hover text-heading'
              }`}
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Lightbox Preview */}
      {activePreviewImage && (
        <div 
          className="fixed inset-0 bg-black/95 z-[10000] flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setActivePreviewImage(null)}
        >
          <div className="absolute top-4 right-4 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <button 
              className="text-white/70 hover:text-white bg-black/50 p-2 rounded-full hover:bg-black/80 transition-colors flex items-center justify-center"
              onClick={handleDownloadPortrait}
              title="Download image"
            >
              <Download size={20} />
            </button>
            <button 
              className="text-white/70 hover:text-white bg-black/50 p-2 rounded-full hover:bg-black/80 transition-colors"
              onClick={() => setActivePreviewImage(null)}
            >
              <X size={24} />
            </button>
          </div>
          <img 
            src={activePreviewImage} 
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" 
            alt="Preview"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </> ,
    document.body
  );
};
