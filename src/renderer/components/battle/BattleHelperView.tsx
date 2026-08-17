import React from 'react';
import { Swords, Plus, Shield, Heart, Play, Users, Skull, RotateCcw } from 'lucide-react';

interface BattleHelperViewProps {
  theme: string;
  selectedCampaign: any;
  characters: any[];
}

export const BattleHelperView: React.FC<BattleHelperViewProps> = ({
  theme,
  selectedCampaign,
  characters
}) => {
  return (
    <div className="space-y-6">
      {/* Header / Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface-elevated2 p-4 rounded-lg border border-border-subtle">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-accent/20 border border-accent/40 rounded-lg text-accent-text">
            <Swords size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-heading">Battle Helper</h3>
            <p className="text-xs text-muted">Gerenciador tático de iniciativa e turnos</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            disabled
            className="flex items-center space-x-2 px-3 py-2 bg-surface-hover opacity-50 rounded text-sm text-heading border border-border-hover cursor-not-allowed"
          >
            <Plus size={16} />
            <span>Adicionar Combatente</span>
          </button>
          <button
            disabled
            className="flex items-center space-x-2 px-4 py-2 bg-accent/30 opacity-50 text-accent-text border border-accent/50 rounded text-sm font-medium cursor-not-allowed"
          >
            <Play size={16} />
            <span>Iniciar Combate</span>
          </button>
        </div>
      </div>

      {/* Empty State / Stage Overview */}
      <div className="text-center py-16 px-4 bg-surface-elevated2 rounded-lg border border-border-subtle flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center text-accent-text mb-2">
          <Swords size={32} />
        </div>
        <h4 className="text-lg font-bold text-heading">Pronto para a Batalha</h4>
        <p className="text-sm text-secondary max-w-md">
          A aba <strong>Battle Helper</strong> foi configurada com sucesso na navegação. Na próxima etapa, implementaremos os combatentes (jogadores e monstros), controle de vida, AC e a fila dinâmica de iniciativa com turnos agrupados.
        </p>
      </div>
    </div>
  );
};
