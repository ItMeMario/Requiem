import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Shield,
  Heart,
  Swords,
  Globe,
  Dna,
  Users,
  Sparkles,
  Bot,
  Zap,
  Gauge,
  Tag,
  Clock,
  Eye,
  BookOpen
} from 'lucide-react';
import { Sw5eMonster, Sw5eSpecies, Sw5eCategory, Sw5eItem } from '../../types/sw5e';
import { calculateModifier, getSpeciesImageUrl } from '../../services/sw5eService';

export interface StarWarsDetailModalProps {
  showModal: boolean;
  handleClose: () => void;
  item: Sw5eItem | null;
  category: Sw5eCategory | null;
  theme: string;
}

export const StarWarsDetailModal: React.FC<StarWarsDetailModalProps> = ({
  showModal,
  handleClose,
  item,
  category,
  theme
}) => {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [item?.name]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    if (showModal) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showModal, handleClose]);

  if (!showModal || !item || !category) return null;

  // Theming classes matching Requiem's design tokens
  const getThemeClasses = () => {
    switch (theme) {
      case 'medieval':
        return {
          overlay: 'bg-[#1b120f]/80 backdrop-blur-sm',
          card: 'bg-[#fdf5db] border-4 border-t-8 border-b-8 border-[#b71c1c] border-x-[#b8860b] text-[#3e2723] rounded-sm font-serif',
          header: 'border-b border-[#3e2723]/30 pb-3 mb-4',
          title: 'text-[#8b0000] font-bold text-2xl sm:text-3xl font-serif tracking-wide',
          meta: 'text-[#5d4037] italic text-xs sm:text-sm font-sans',
          badge: 'bg-[#f5e9c9] border-[#b8860b]/50 text-[#8b0000]',
          specCard: 'bg-[#f5e9c9]/60 border-[#b8860b]/40',
          specLabel: 'text-[#8b0000] font-bold',
          specValue: 'text-[#3e2723]',
          divider: 'h-[2px] my-4 border-none bg-gradient-to-r from-[#b71c1c] via-[#b8860b] to-[#b71c1c]',
          sectionHeader: 'text-[#8b0000] font-bold text-base uppercase border-b border-[#3e2723]/20 pb-1 mb-2 font-serif',
          abilityBg: 'bg-[#f5e9c9] border-[#b8860b]/40',
          closeBtn: 'text-[#3e2723] hover:bg-[#3e2723]/10 hover:text-[#8b0000] bg-[#f5e9c9] border border-[#b8860b]/40',
        };
      case 'cyberpunk':
        return {
          overlay: 'bg-black/90 backdrop-blur-md',
          card: 'bg-[#0a0f1d]/95 border-2 border-[#00ffcc] text-[#00ffcc] shadow-[0_0_25px_rgba(0,255,204,0.3)] rounded-none font-mono',
          header: 'border-b-2 border-dashed border-[#00ffcc]/40 pb-3 mb-4',
          title: 'text-[#ff0055] font-extrabold text-2xl sm:text-3xl tracking-widest uppercase cyber-glitch',
          meta: 'text-yellow-400 text-xs uppercase tracking-wider',
          badge: 'bg-[#00ffcc]/10 border-[#00ffcc]/50 text-[#00ffcc]',
          specCard: 'bg-black/50 border-[#00ffcc]/30',
          specLabel: 'text-[#ff0055] font-bold uppercase',
          specValue: 'text-[#00ffcc]',
          divider: 'h-[1px] my-4 bg-transparent border-t-2 border-dashed border-[#00ffcc]/30',
          sectionHeader: 'text-yellow-400 font-extrabold text-sm uppercase border-b-2 border-yellow-400/30 pb-1 mb-2 tracking-widest',
          abilityBg: 'bg-black/40 border-[#00ffcc]/30',
          closeBtn: 'text-[#00ffcc] hover:bg-[#00ffcc]/20 border border-[#00ffcc]',
        };
      case 'vampire':
        return {
          overlay: 'bg-[#050002]/90 backdrop-blur-lg',
          card: 'bg-[#0c0507] border-2 border-[#b71c1c] text-[#e1d5d5] shadow-[0_0_25px_rgba(183,28,28,0.4)] rounded-lg font-serif',
          header: 'border-b border-[#b71c1c]/40 pb-3 mb-4',
          title: 'text-[#e63946] font-semibold text-2xl sm:text-3xl italic tracking-wide font-serif',
          meta: 'text-[#a1887f] italic text-xs sm:text-sm font-serif',
          badge: 'bg-[#1b0a0e] border-[#b71c1c]/50 text-[#e63946]',
          specCard: 'bg-[#1b0a0e]/70 border-[#b71c1c]/30',
          specLabel: 'text-[#e63946] font-semibold',
          specValue: 'text-[#e1d5d5]',
          divider: 'h-[1px] my-4 border-none bg-gradient-to-r from-transparent via-[#b71c1c] to-transparent',
          sectionHeader: 'text-[#e63946] font-semibold text-base border-b border-[#b71c1c]/30 pb-1 mb-2 tracking-wide font-serif',
          abilityBg: 'bg-[#1b0a0e] border-[#b71c1c]/30',
          closeBtn: 'text-[#e1d5d5] hover:bg-[#b71c1c]/20 hover:text-white border border-[#b71c1c]',
        };
      default:
        return {
          overlay: 'bg-surface-overlay backdrop-blur-sm',
          card: 'bg-surface-card border border-border-default rounded-xl text-primary font-sans',
          header: 'border-b border-border-default pb-4 mb-4',
          title: 'text-heading font-extrabold text-2xl sm:text-3xl tracking-wide',
          meta: 'text-accent-text text-xs sm:text-sm font-medium',
          badge: 'bg-accent-muted-bg border-accent/40 text-accent-text',
          specCard: 'bg-surface-hover/50 border-border-subtle',
          specLabel: 'text-accent-text font-bold',
          specValue: 'text-primary',
          divider: 'h-[1px] my-4 border-none bg-border-subtle',
          sectionHeader: 'text-heading font-bold text-sm uppercase tracking-wider border-b border-border-subtle pb-1.5 mb-3',
          abilityBg: 'bg-surface-hover/50 border-border-subtle',
          closeBtn: 'text-heading hover:bg-surface-hover border border-border-hover',
        };
    }
  };

  const style = getThemeClasses();

  const renderAbilityBox = (label: string, score: number) => {
    const mod = calculateModifier(score);
    return (
      <div className={`flex flex-col items-center p-2 rounded border ${style.abilityBg}`}>
        <span className="text-[10px] uppercase font-bold tracking-wider opacity-70">{label}</span>
        <span className="text-base sm:text-lg font-extrabold text-primary">{score}</span>
        <span className="text-xs font-semibold text-accent-text">{mod}</span>
      </div>
    );
  };

  const isMonster = category === 'monsters';
  const monster = isMonster ? (item as Sw5eMonster) : null;
  const species = !isMonster ? (item as Sw5eSpecies) : null;

  const speciesImage = species ? getSpeciesImageUrl(species) : null;

  return createPortal(
    <div
      onClick={handleClose}
      className={`fixed inset-0 ${style.overlay} flex items-center justify-center z-[9999] p-2 sm:p-4`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-4xl shadow-2xl relative max-h-[92vh] overflow-hidden flex flex-col p-4 sm:p-6 ${style.card}`}
      >
        {/* Header */}
        <div className={`flex justify-between items-start shrink-0 ${style.header}`}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${style.badge}`}>
                {isMonster ? <Swords size={14} /> : <Dna size={14} />}
                {isMonster ? 'SW5e Monster / NPC' : 'SW5e Playable Species'}
              </span>
              {isMonster && monster?.challengeRating && (
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-surface-elevated/80 border border-border-subtle text-secondary">
                  CR {monster.challengeRating} {monster.experiencePoints ? `(${monster.experiencePoints.toLocaleString()} XP)` : ''}
                </span>
              )}
            </div>
            <h3 className={style.title}>{item.name}</h3>
            <p className={style.meta}>
              {isMonster
                ? `${monster?.size || 'Medium'} ${monster?.types?.join(', ') || 'creature'}${monster?.alignment ? `, ${monster.alignment}` : ''}`
                : `${species?.size || 'Medium'} Species • Homeworld: ${species?.homeworld || 'Unknown'}`}
            </p>
          </div>

          <button
            onClick={handleClose}
            className={`p-1.5 transition-colors rounded-full cursor-pointer ${style.closeBtn}`}
            title="Close dossier"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-6">
          {/* ===================== MONSTER VIEW ===================== */}
          {isMonster && monster && (
            <div className="space-y-5">
              {/* Core Combat Badges */}
              <div className="grid grid-cols-3 gap-3">
                <div className={`p-3 rounded border flex items-center gap-3 ${style.specCard}`}>
                  <Shield size={20} className="text-accent shrink-0" />
                  <div>
                    <div className="text-[10px] uppercase font-bold text-muted">Armor Class</div>
                    <div className="text-base font-extrabold text-primary">
                      {monster.armorClass} {monster.armorType ? `(${monster.armorType})` : ''}
                    </div>
                  </div>
                </div>

                <div className={`p-3 rounded border flex items-center gap-3 ${style.specCard}`}>
                  <Heart size={20} className="text-danger shrink-0" />
                  <div>
                    <div className="text-[10px] uppercase font-bold text-muted">Hit Points</div>
                    <div className="text-base font-extrabold text-primary">
                      {monster.hitPoints} {monster.hitPointRoll ? `(${monster.hitPointRoll})` : ''}
                    </div>
                  </div>
                </div>

                <div className={`p-3 rounded border flex items-center gap-3 ${style.specCard}`}>
                  <Gauge size={20} className="text-accent2 shrink-0" />
                  <div>
                    <div className="text-[10px] uppercase font-bold text-muted">Speed</div>
                    <div className="text-base font-extrabold text-primary">
                      {monster.speed || '30 ft.'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Ability Scores Grid */}
              <div className="grid grid-cols-6 gap-2">
                {renderAbilityBox('STR', monster.strength)}
                {renderAbilityBox('DEX', monster.dexterity)}
                {renderAbilityBox('CON', monster.constitution)}
                {renderAbilityBox('INT', monster.intelligence)}
                {renderAbilityBox('WIS', monster.wisdom)}
                {renderAbilityBox('CHA', monster.charisma)}
              </div>

              <div className={style.divider} />

              {/* Defenses, Skills & Senses */}
              <div className="space-y-1.5 text-xs">
                {monster.savingThrows && monster.savingThrows.length > 0 && (
                  <p>
                    <strong className={style.specLabel}>Saving Throws: </strong>
                    <span className="text-primary">{monster.savingThrows.join(', ')}</span>
                  </p>
                )}
                {monster.skills && monster.skills.length > 0 && (
                  <p>
                    <strong className={style.specLabel}>Skills: </strong>
                    <span className="text-primary">{monster.skills.join(', ')}</span>
                  </p>
                )}
                {monster.damageResistances && monster.damageResistances.length > 0 && (
                  <p>
                    <strong className={style.specLabel}>Damage Resistances: </strong>
                    <span className="text-primary">{monster.damageResistances.join(', ')}</span>
                  </p>
                )}
                {monster.damageImmunities && monster.damageImmunities.length > 0 && (
                  <p>
                    <strong className={style.specLabel}>Damage Immunities: </strong>
                    <span className="text-primary">{monster.damageImmunities.join(', ')}</span>
                  </p>
                )}
                {monster.conditionImmunities && monster.conditionImmunities.length > 0 && (
                  <p>
                    <strong className={style.specLabel}>Condition Immunities: </strong>
                    <span className="text-primary">{monster.conditionImmunities.join(', ')}</span>
                  </p>
                )}
                {monster.senses && monster.senses.length > 0 && (
                  <p>
                    <strong className={style.specLabel}>Senses: </strong>
                    <span className="text-primary">{monster.senses.join(', ')}</span>
                  </p>
                )}
                {monster.languages && monster.languages.length > 0 && (
                  <p>
                    <strong className={style.specLabel}>Languages: </strong>
                    <span className="text-primary">{monster.languages.join(', ')}</span>
                  </p>
                )}
              </div>

              {/* Behaviors: Traits, Actions, Reactions, Legendary Actions */}
              {monster.behaviors && monster.behaviors.length > 0 && (
                <div className="space-y-4 pt-2">
                  {/* Traits */}
                  {monster.behaviors.filter(b => b.monsterBehaviorType === 'Trait').length > 0 && (
                    <div>
                      <h4 className={style.sectionHeader}>Traits &amp; Features</h4>
                      <div className="space-y-2 text-xs leading-relaxed">
                        {monster.behaviors
                          .filter(b => b.monsterBehaviorType === 'Trait')
                          .map((b, i) => (
                            <p key={i}>
                              <strong className={style.specLabel}>{b.name}. </strong>
                              <span className="text-primary">{b.description}</span>
                            </p>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  {monster.behaviors.filter(b => b.monsterBehaviorType === 'Action').length > 0 && (
                    <div>
                      <h4 className={style.sectionHeader}>Actions</h4>
                      <div className="space-y-2 text-xs leading-relaxed">
                        {monster.behaviors
                          .filter(b => b.monsterBehaviorType === 'Action')
                          .map((b, i) => (
                            <p key={i}>
                              <strong className={style.specLabel}>{b.name}. </strong>
                              <span className="text-primary">{b.description}</span>
                            </p>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Reactions */}
                  {monster.behaviors.filter(b => b.monsterBehaviorType === 'Reaction').length > 0 && (
                    <div>
                      <h4 className={style.sectionHeader}>Reactions</h4>
                      <div className="space-y-2 text-xs leading-relaxed">
                        {monster.behaviors
                          .filter(b => b.monsterBehaviorType === 'Reaction')
                          .map((b, i) => (
                            <p key={i}>
                              <strong className={style.specLabel}>{b.name}. </strong>
                              <span className="text-primary">{b.description}</span>
                            </p>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Legendary Actions */}
                  {monster.behaviors.filter(b => b.monsterBehaviorType === 'Legendary').length > 0 && (
                    <div>
                      <h4 className={style.sectionHeader}>Legendary Actions</h4>
                      <div className="space-y-2 text-xs leading-relaxed">
                        {monster.behaviors
                          .filter(b => b.monsterBehaviorType === 'Legendary')
                          .map((b, i) => (
                            <p key={i}>
                              <strong className={style.specLabel}>{b.name}. </strong>
                              <span className="text-primary">{b.description}</span>
                            </p>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ===================== SPECIES VIEW ===================== */}
          {!isMonster && species && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Column: Portrait & Quick Specs */}
              <div className="md:col-span-1 space-y-4">
                <div className="rounded-lg overflow-hidden border border-border-default bg-surface-hover/50 relative shadow-md">
                  {speciesImage && !imgError ? (
                    <img
                      src={speciesImage}
                      alt={species.name}
                      onError={() => setImgError(true)}
                      className="w-full h-72 sm:h-80 object-cover object-top"
                    />
                  ) : (
                    <div className="h-72 sm:h-80 w-full flex flex-col items-center justify-center p-4 text-center">
                      <Dna size={48} className="text-accent opacity-50 mb-2" />
                      <span className="text-xs text-muted uppercase tracking-wider">
                        Species Record
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-2 text-xs">
                  <div className={`p-2.5 rounded border ${style.specCard}`}>
                    <span className="text-[10px] uppercase font-bold text-muted block">Homeworld</span>
                    <span className="font-semibold text-primary">{species.homeworld || 'Unknown'}</span>
                  </div>

                  <div className={`p-2.5 rounded border ${style.specCard}`}>
                    <span className="text-[10px] uppercase font-bold text-muted block">Language</span>
                    <span className="font-semibold text-primary">{species.language || 'Galactic Basic'}</span>
                  </div>

                  <div className={`p-2.5 rounded border ${style.specCard}`}>
                    <span className="text-[10px] uppercase font-bold text-muted block">Size &amp; Stature</span>
                    <span className="font-semibold text-primary">
                      {species.size} • Avg {species.heightAverage || 'Standard'}
                    </span>
                  </div>

                  {species.distinctions && (
                    <div className={`p-2.5 rounded border ${style.specCard}`}>
                      <span className="text-[10px] uppercase font-bold text-muted block">Distinctions</span>
                      <span className="text-primary leading-tight block mt-0.5">{species.distinctions}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Traits & Lore */}
              <div className="md:col-span-2 space-y-5">
                {/* Racial Traits */}
                {species.traits && species.traits.length > 0 && (
                  <div>
                    <h4 className={style.sectionHeader}>Species Traits &amp; Abilities</h4>
                    <div className="space-y-3">
                      {species.traits.map((t, idx) => (
                        <div key={idx} className={`p-3 rounded border ${style.specCard}`}>
                          <h5 className={`text-xs font-bold mb-1 ${style.specLabel}`}>{t.name}</h5>
                          <p className="text-xs text-primary leading-relaxed">{t.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Lore / Flavor text */}
                {species.flavorText && (
                  <div>
                    <h4 className={style.sectionHeader}>Biology &amp; Society</h4>
                    <div className="text-xs text-secondary leading-relaxed space-y-2 bg-surface-hover/30 p-3 rounded border border-border-subtle whitespace-pre-line">
                      {species.flavorText}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
