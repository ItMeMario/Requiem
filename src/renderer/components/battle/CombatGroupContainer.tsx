import React from 'react';
import { Users, Swords, Skull, Zap, Shield, Sparkles } from 'lucide-react';
import { CombatGroup, Combatant } from '../../types/battle';
import { CombatantCard } from './CombatantCard';

interface CombatGroupContainerProps {
  group: CombatGroup;
  isGroupActive: boolean;
  activeCombatantId: string | null;
  onSelectActiveCombatant: (id: string) => void;
  onAdjustHp: (id: string, delta: number) => void;
  onSetHp?: (id: string, currentHp: number) => void;
  onToggleCondition: (id: string, conditionId: string) => void;
  onRollInitiative: (id: string) => void;
  onUpdateInitiative: (id: string, val: number) => void;
  onRemove: (id: string) => void;
  onDuplicate?: (id: string) => void;
  theme: string;
}

export const CombatGroupContainer: React.FC<CombatGroupContainerProps> = ({
  group,
  isGroupActive,
  activeCombatantId,
  onSelectActiveCombatant,
  onAdjustHp,
  onToggleCondition,
  onRollInitiative,
  onUpdateInitiative,
  onRemove,
  onDuplicate,
  theme
}) => {
  const isPlayerGroup = group.type === 'player';
  const isShared = group.isSharedTurn;

  // Se não for turno compartilhado (combatente isolado)
  if (!isShared) {
    const singleCombatant = group.combatants[0];
    const isActiveTurn = isGroupActive && activeCombatantId === singleCombatant.id;

    return (
      <div className="w-full">
        <CombatantCard
          combatant={singleCombatant}
          isActiveTurn={isActiveTurn}
          isCurrentGroup={isGroupActive}
          onAdjustHp={onAdjustHp}
          onToggleCondition={onToggleCondition}
          onRollInitiative={onRollInitiative}
          onUpdateInitiative={onUpdateInitiative}
          onRemove={onRemove}
          onDuplicate={onDuplicate}
          onSelectActive={onSelectActiveCombatant}
          theme={theme}
        />
      </div>
    );
  }

  // Turno Compartilhado / Grupo de Ação
  return (
    <div className={`rounded-2xl border transition-all duration-300 p-3 sm:p-4 space-y-3 ${
      isGroupActive 
        ? isPlayerGroup
          ? 'bg-blue-950/20 border-blue-500/60 shadow-[0_0_25px_rgba(59,130,246,0.15)] ring-1 ring-blue-500/40'
          : 'bg-rose-950/20 border-rose-500/60 shadow-[0_0_25px_rgba(244,63,94,0.15)] ring-1 ring-rose-500/40'
        : 'bg-surface-elevated/40 border-border-default/60'
    }`}>
      {/* Header do Grupo de Ação Compartilhada */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-1 border-b border-border-subtle/50">
        <div className="flex items-center space-x-2.5">
          <div className={`p-1.5 rounded-lg border flex items-center justify-center ${
            isPlayerGroup 
              ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' 
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}>
            {isPlayerGroup ? <Users size={16} /> : <Swords size={16} />}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs font-bold uppercase tracking-wider ${isPlayerGroup ? 'text-blue-300' : 'text-rose-300'}`}>
                Turno em Grupo • {group.combatants.length} {isPlayerGroup ? 'Jogadores' : 'Inimigos'} Agindo Juntos
              </span>
              {isGroupActive && (
                <span className="flex items-center gap-1 text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-accent text-white shadow-sm animate-pulse">
                  <Zap size={10} />
                  Fase Ativa
                </span>
              )}
            </div>
            <p className="text-[11px] text-muted">
              Sem adversários intercalados • Iniciativas entre {group.initiativeRange.max} e {group.initiativeRange.min}
            </p>
          </div>
        </div>

        {/* Seletor rápido de quem do grupo está agindo */}
        <div className="flex items-center space-x-1.5 self-end sm:self-auto overflow-x-auto max-w-full">
          <span className="text-[10px] text-muted uppercase font-semibold mr-1">Agindo:</span>
          {group.combatants.map(c => {
            const isSelected = activeCombatantId === c.id;
            return (
              <button
                key={c.id}
                onClick={() => onSelectActiveCombatant(c.id)}
                className={`px-2 py-0.5 rounded text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  isSelected 
                    ? isPlayerGroup
                      ? 'bg-blue-500 text-white font-bold shadow-sm'
                      : 'bg-rose-600 text-white font-bold shadow-sm'
                    : 'bg-surface-hover text-secondary hover:text-heading border border-border-subtle'
                }`}
              >
                {c.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid de Cards dos membros do grupo */}
      <div className="grid grid-cols-1 gap-3">
        {group.combatants.map(combatant => {
          const isActiveTurn = isGroupActive && activeCombatantId === combatant.id;
          return (
            <CombatantCard
              key={combatant.id}
              combatant={combatant}
              isActiveTurn={isActiveTurn}
              isCurrentGroup={isGroupActive}
              onAdjustHp={onAdjustHp}
              onToggleCondition={onToggleCondition}
              onRollInitiative={onRollInitiative}
              onUpdateInitiative={onUpdateInitiative}
              onRemove={onRemove}
              onDuplicate={onDuplicate}
              onSelectActive={onSelectActiveCombatant}
              theme={theme}
            />
          );
        })}
      </div>
    </div>
  );
};
