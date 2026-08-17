import React, { useState } from 'react';
import { 
  Shield, 
  Heart, 
  Dices, 
  Trash2, 
  Copy, 
  User, 
  Skull, 
  Plus, 
  Minus, 
  Sparkles,
  ChevronDown,
  X,
  Zap,
  Activity
} from 'lucide-react';
import { Combatant, DEFAULT_CONDITIONS } from '../../types/battle';

interface CombatantCardProps {
  combatant: Combatant;
  isActiveTurn: boolean;
  isCurrentGroup: boolean;
  onAdjustHp: (id: string, delta: number) => void;
  onSetHp?: (id: string, currentHp: number) => void;
  onToggleCondition: (id: string, conditionId: string) => void;
  onRollInitiative: (id: string) => void;
  onUpdateInitiative: (id: string, val: number) => void;
  onRemove: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onSelectActive?: (id: string) => void;
  theme: string;
}

export const CombatantCard: React.FC<CombatantCardProps> = ({
  combatant,
  isActiveTurn,
  isCurrentGroup,
  onAdjustHp,
  onToggleCondition,
  onRollInitiative,
  onUpdateInitiative,
  onRemove,
  onDuplicate,
  onSelectActive,
  theme
}) => {
  const [showConditionsMenu, setShowConditionsMenu] = useState(false);
  const [customHpDelta, setCustomHpDelta] = useState<string>('');
  const [isEditingInit, setIsEditingInit] = useState(false);
  const [initInput, setInitInput] = useState(combatant.initiative.toString());

  const isPlayer = combatant.type === 'player';
  const isDead = combatant.currentHp <= 0;
  const hpPercent = combatant.maxHp > 0 
    ? Math.max(0, Math.min(100, Math.round((combatant.currentHp / combatant.maxHp) * 100)))
    : 0;

  // Cor da barra de vida
  const getHpColor = () => {
    if (isDead) return 'bg-neutral-600';
    if (hpPercent > 50) return 'bg-emerald-500';
    if (hpPercent > 25) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const handleApplyCustomHp = (isDamage: boolean) => {
    const val = parseInt(customHpDelta, 10);
    if (!isNaN(val) && val > 0) {
      onAdjustHp(combatant.id, isDamage ? -val : val);
      setCustomHpDelta('');
    }
  };

  const handleSaveInit = () => {
    const val = parseInt(initInput, 10);
    if (!isNaN(val)) {
      onUpdateInitiative(combatant.id, val);
    }
    setIsEditingInit(false);
  };

  return (
    <div 
      onClick={() => onSelectActive && onSelectActive(combatant.id)}
      className={`relative rounded-xl border transition-all duration-300 overflow-hidden ${
        isActiveTurn 
          ? 'ring-2 ring-accent border-accent shadow-[0_0_20px_rgba(220,38,38,0.25)] bg-surface-card scale-[1.01]' 
          : isCurrentGroup
          ? 'border-accent/40 bg-surface-card/90'
          : 'border-border-default hover:border-border-hover bg-surface-card/70'
      } ${isDead ? 'opacity-60 grayscale-[0.3]' : ''}`}
    >
      {/* Banner de Turno Ativo */}
      {isActiveTurn && (
        <div className="bg-gradient-to-r from-accent to-accent-hover text-white text-[11px] font-bold px-3 py-0.5 flex items-center justify-between tracking-wider uppercase select-none">
          <span className="flex items-center gap-1">
            <Zap size={12} className="animate-bounce" />
            Vez Ativa (Turno Atual)
          </span>
          <span className="text-[10px] opacity-80 font-mono">Iniciativa: {combatant.initiative}</span>
        </div>
      )}

      <div className="p-4 space-y-3">
        {/* Header do Card: Avatar, Nome, Tipo e Controles rápidos */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            {/* Avatar / Ícone */}
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border overflow-hidden ${
              isPlayer 
                ? 'bg-blue-950/40 border-blue-500/40 text-blue-400' 
                : 'bg-rose-950/40 border-rose-500/40 text-rose-400'
            }`}>
              {combatant.avatarUrl ? (
                <img src={combatant.avatarUrl} alt={combatant.name} className="w-full h-full object-cover" />
              ) : isPlayer ? (
                <User size={20} />
              ) : (
                <Skull size={20} />
              )}
            </div>

            {/* Nome & Subtítulo */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className={`font-bold text-base truncate ${isPlayer ? 'text-heading' : 'text-rose-100'}`}>
                  {combatant.name}
                </h4>
                <span className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full border ${
                  isPlayer 
                    ? 'bg-blue-500/10 border-blue-500/30 text-blue-300' 
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}>
                  {isPlayer ? 'Jogador' : 'Inimigo'}
                </span>
                {isDead && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-800 border border-neutral-600 text-neutral-400">
                    Derrotado
                  </span>
                )}
              </div>
              {combatant.notes && (
                <p className="text-xs text-muted truncate mt-0.5">{combatant.notes}</p>
              )}
            </div>
          </div>

          {/* Badges de Atributos: AC e Iniciativa */}
          <div className="flex items-center space-x-2 shrink-0">
            {/* AC (Armor Class) */}
            {combatant.armorClass !== undefined && (
              <div 
                title="Armour Class (AC)"
                className="flex items-center space-x-1 px-2.5 py-1 bg-surface-elevated border border-border-default rounded-lg text-xs font-bold text-heading shadow-sm"
              >
                <Shield size={14} className="text-accent-text" />
                <span>{combatant.armorClass}</span>
                <span className="text-[10px] text-muted font-normal">AC</span>
              </div>
            )}

            {/* Iniciativa */}
            <div 
              title="Iniciativa (Clique para editar ou rolar)"
              className="flex items-center space-x-1 px-2.5 py-1 bg-surface-elevated border border-border-default rounded-lg text-xs font-mono font-bold text-heading shadow-sm"
            >
              <Dices size={14} className="text-secondary" />
              {isEditingInit ? (
                <input
                  type="number"
                  value={initInput}
                  onChange={(e) => setInitInput(e.target.value)}
                  onBlur={handleSaveInit}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveInit()}
                  autoFocus
                  className="w-10 bg-surface-input border border-accent rounded text-center text-xs text-heading px-1 py-0.5 outline-none"
                />
              ) : (
                <span 
                  onClick={(e) => { e.stopPropagation(); setIsEditingInit(true); setInitInput(combatant.initiative.toString()); }}
                  className="cursor-pointer hover:underline"
                >
                  {combatant.initiative}
                </span>
              )}
              <button 
                onClick={(e) => { e.stopPropagation(); onRollInitiative(combatant.id); }}
                title="Rolar d20 de iniciativa"
                className="hover:text-accent transition-colors p-0.5 rounded cursor-pointer"
              >
                <Dices size={12} />
              </button>
            </div>

            {/* Botões de Ação: Duplicar e Remover */}
            <div className="flex items-center space-x-1 pl-1">
              {!isPlayer && onDuplicate && (
                <button
                  onClick={(e) => { e.stopPropagation(); onDuplicate(combatant.id); }}
                  title="Duplicar Inimigo"
                  className="p-1.5 text-muted hover:text-heading hover:bg-surface-hover rounded-md transition-colors cursor-pointer"
                >
                  <Copy size={14} />
                </button>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); onRemove(combatant.id); }}
                title="Remover Combatente"
                className="p-1.5 text-muted hover:text-danger hover:bg-danger/10 rounded-md transition-colors cursor-pointer"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Barra de Vida & Controles de HP */}
        <div className="space-y-1.5 bg-surface-elevated/40 p-2.5 rounded-lg border border-border-subtle">
          <div className="flex justify-between items-center text-xs">
            <div className="flex items-center space-x-1.5 text-secondary font-medium">
              <Heart size={14} className={isDead ? 'text-neutral-500' : 'text-rose-500 fill-rose-500/30'} />
              <span>Pontos de Vida (HP):</span>
            </div>
            <div className="font-mono font-bold">
              <span className={isDead ? 'text-neutral-500' : combatant.currentHp <= (combatant.maxHp * 0.25) ? 'text-rose-400' : 'text-heading'}>
                {combatant.currentHp}
              </span>
              <span className="text-muted font-normal"> / {combatant.maxHp} PV</span>
              <span className="text-[10px] text-muted ml-1.5 font-normal">({hpPercent}%)</span>
            </div>
          </div>

          {/* Barra Visual */}
          <div className="w-full h-2.5 bg-surface-deep rounded-full overflow-hidden border border-border-subtle p-0.5">
            <div 
              className={`h-full rounded-full transition-all duration-300 ${getHpColor()}`}
              style={{ width: `${hpPercent}%` }}
            />
          </div>

          {/* Botões Rápidos de Dano e Cura */}
          <div className="flex items-center justify-between gap-1 pt-1 flex-wrap">
            {/* Dano rápido */}
            <div className="flex items-center space-x-1">
              <span className="text-[10px] text-rose-400 font-semibold uppercase mr-0.5">Dano:</span>
              <button
                onClick={(e) => { e.stopPropagation(); onAdjustHp(combatant.id, -5); }}
                className="px-2 py-0.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 hover:border-rose-500/50 text-rose-300 rounded text-xs font-mono font-bold transition-colors cursor-pointer"
              >
                -5
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onAdjustHp(combatant.id, -1); }}
                className="px-2 py-0.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 hover:border-rose-500/50 text-rose-300 rounded text-xs font-mono font-bold transition-colors cursor-pointer"
              >
                -1
              </button>
            </div>

            {/* Input customizado de dano/cura */}
            <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
              <input
                type="number"
                placeholder="Qtd"
                value={customHpDelta}
                onChange={(e) => setCustomHpDelta(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleApplyCustomHp(true);
                }}
                className="w-12 bg-surface-input border border-border-subtle focus:border-accent rounded text-center text-xs text-heading px-1 py-0.5 outline-none font-mono"
              />
              <button
                onClick={() => handleApplyCustomHp(true)}
                title="Aplicar Dano"
                disabled={!customHpDelta}
                className="px-1.5 py-0.5 bg-rose-900/40 hover:bg-rose-900/80 border border-rose-600/40 text-rose-200 rounded text-xs disabled:opacity-30 cursor-pointer"
              >
                Dano
              </button>
              <button
                onClick={() => handleApplyCustomHp(false)}
                title="Aplicar Cura"
                disabled={!customHpDelta}
                className="px-1.5 py-0.5 bg-emerald-900/40 hover:bg-emerald-900/80 border border-emerald-600/40 text-emerald-200 rounded text-xs disabled:opacity-30 cursor-pointer"
              >
                Cura
              </button>
            </div>

            {/* Cura rápida */}
            <div className="flex items-center space-x-1">
              <span className="text-[10px] text-emerald-400 font-semibold uppercase mr-0.5">Cura:</span>
              <button
                onClick={(e) => { e.stopPropagation(); onAdjustHp(combatant.id, 1); }}
                className="px-2 py-0.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 hover:border-emerald-500/50 text-emerald-300 rounded text-xs font-mono font-bold transition-colors cursor-pointer"
              >
                +1
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onAdjustHp(combatant.id, 5); }}
                className="px-2 py-0.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 hover:border-emerald-500/50 text-emerald-300 rounded text-xs font-mono font-bold transition-colors cursor-pointer"
              >
                +5
              </button>
            </div>
          </div>
        </div>

        {/* Condições / Status Badges */}
        <div className="pt-1">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 flex-wrap">
              {combatant.conditions.map(condId => {
                const def = DEFAULT_CONDITIONS.find(c => c.id === condId);
                const name = def ? def.name : condId;
                const colorClass = def ? def.color : 'bg-surface-hover text-heading border-border-default';
                return (
                  <span
                    key={condId}
                    className={`text-[11px] font-medium px-2 py-0.5 rounded-md border flex items-center space-x-1 ${colorClass}`}
                  >
                    <span>{name}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); onToggleCondition(combatant.id, condId); }}
                      className="hover:opacity-80 p-0.5 rounded-full cursor-pointer"
                    >
                      <X size={10} />
                    </button>
                  </span>
                );
              })}

              {/* Botão para adicionar condição */}
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => setShowConditionsMenu(!showConditionsMenu)}
                  className="text-[11px] font-medium px-2 py-0.5 rounded-md border border-dashed border-border-hover hover:border-accent text-secondary hover:text-heading bg-surface-elevated flex items-center space-x-1 transition-colors cursor-pointer"
                >
                  <Plus size={11} />
                  <span>Condição</span>
                </button>

                {/* Menu Dropdown de Condições */}
                {showConditionsMenu && (
                  <div className="absolute left-0 bottom-full mb-1 z-30 w-56 max-h-60 overflow-y-auto bg-surface-card border border-border-hover rounded-lg shadow-xl p-2 custom-scrollbar">
                    <div className="text-[10px] uppercase font-bold text-muted px-2 py-1 border-b border-border-subtle mb-1">
                      Adicionar / Remover Condições
                    </div>
                    <div className="space-y-1">
                      {DEFAULT_CONDITIONS.map(cond => {
                        const isSelected = combatant.conditions.includes(cond.id);
                        return (
                          <button
                            key={cond.id}
                            onClick={() => {
                              onToggleCondition(combatant.id, cond.id);
                              setShowConditionsMenu(false);
                            }}
                            className={`w-full text-left px-2 py-1 rounded text-xs flex items-center justify-between transition-colors cursor-pointer ${
                              isSelected 
                                ? 'bg-accent/20 text-accent-text font-bold' 
                                : 'text-primary hover:bg-surface-hover'
                            }`}
                          >
                            <span>{cond.name}</span>
                            {isSelected && <span className="text-[10px]">✓</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
