import React, { useState } from 'react';
import { 
  Swords, 
  Plus, 
  Play, 
  Square, 
  RotateCcw, 
  Dices, 
  Users, 
  Skull, 
  Trash2, 
  ChevronRight, 
  ChevronLeft, 
  Shield, 
  Heart, 
  History, 
  Zap, 
  AlertCircle,
  Clock,
  Sparkles,
  Bookmark,
  FolderOpen,
  HardDrive
} from 'lucide-react';
import { useBattleHelper } from '../../hooks/battle/useBattleHelper';
import { CombatGroupContainer } from './CombatGroupContainer';
import { AddCombatantModal } from './AddCombatantModal';
import { SavedEncountersModal } from './SavedEncountersModal';

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
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSavedEncountersModalOpen, setIsSavedEncountersModalOpen] = useState(false);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);

  const battle = useBattleHelper({ campaignId: selectedCampaign?.id || null });

  const isCyber = theme === 'cyberpunk';
  const isMed = theme === 'medieval';
  const isVamp = theme === 'vampire';

  // Estilo do botão de ação primária por tema
  const primaryButtonClass = isCyber
    ? 'bg-[#00ffff] hover:bg-[#00d8d8] text-black font-mono font-bold shadow-[0_0_15px_rgba(0,255,255,0.4)] border border-[#00ffff]'
    : isVamp
    ? 'bg-[#8b0000] hover:bg-[#b00000] text-white font-serif font-bold shadow-[0_0_15px_rgba(255,51,51,0.3)] border border-[#ff3333]/40'
    : isMed
    ? 'bg-[#8b4513] hover:bg-[#a0522d] text-[#f4eacc] font-serif font-bold shadow-md border border-[#5c2e0b]'
    : 'bg-accent hover:bg-accent-hover text-white font-bold shadow-md';

  // Estilos de container temático
  const containerThemeClass = isCyber 
    ? 'font-mono text-cyan-300' 
    : isVamp 
    ? 'font-serif text-rose-100' 
    : isMed 
    ? 'font-serif text-[#3e2723]' 
    : '';

  const headerThemeClass = isCyber
    ? 'cyber-metallic-panel border-[#0ff]/30 shadow-[0_0_20px_rgba(0,255,255,0.15)] text-[#0ff]'
    : isVamp
    ? 'bg-[#121118]/90 border-[#ff3333]/30 shadow-[0_0_25px_rgba(255,51,51,0.15)] text-[#f4eacc]'
    : isMed
    ? 'parchment bg-[#f7eed4] border-[#8b4513]/40 shadow-md text-[#3e2723]'
    : 'bg-surface-elevated2 border-border-default';

  return (
    <div className={`space-y-6 max-w-7xl mx-auto pb-12 ${containerThemeClass}`}>
      {/* BARRA PRINCIPAL DE CONTROLE TÁTICO */}
      <div className={`p-4 md:p-5 rounded-2xl border shadow-lg transition-all ${
        battle.isActive
          ? isCyber
            ? 'cyber-metallic-panel border-[#0ff] shadow-[0_0_30px_rgba(0,255,255,0.3)] ring-1 ring-[#0ff]/50'
            : isVamp
            ? 'bg-[#18111b]/95 border-[#ff3333] shadow-[0_0_30px_rgba(255,51,51,0.25)] ring-1 ring-[#ff3333]/40'
            : isMed
            ? 'parchment bg-[#f7eed4] border-[#b71c1c] shadow-[0_0_30px_rgba(183,28,28,0.2)] ring-1 ring-[#b71c1c]/40 text-[#3e2723]'
            : 'bg-surface-card/95 border-accent shadow-[0_0_30px_rgba(220,38,38,0.15)] ring-1 ring-accent/30'
          : headerThemeClass
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Status do Combate & Rodada */}
          <div className="flex items-center space-x-3.5">
            <div className={`p-3 rounded-xl border flex items-center justify-center transition-all ${
              battle.isActive 
                ? isCyber
                  ? 'bg-[#0ff]/20 border-[#0ff] text-[#0ff] animate-pulse shadow-[0_0_15px_rgba(0,255,255,0.5)]'
                  : isVamp
                  ? 'bg-rose-950/60 border-rose-600 text-rose-300 animate-pulse shadow-[0_0_15px_rgba(220,38,38,0.5)]'
                  : 'bg-accent/20 border-accent text-accent-text animate-pulse shadow-md' 
                : 'bg-surface-elevated border-border-subtle text-muted'
            }`}>
              <Swords size={26} />
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-xl md:text-2xl font-bold text-heading tracking-wide">
                  Battle Helper
                </h3>
                {battle.isActive ? (
                  <span className={`px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm ${
                    isCyber ? 'bg-[#0ff]/20 text-[#0ff] border border-[#0ff]/50' : isVamp ? 'bg-rose-900/60 text-rose-200 border border-rose-600/50' : 'bg-accent text-white'
                  }`}>
                    <span className="w-2 h-2 rounded-full bg-current animate-ping" />
                    Combate Ativo • Rodada {battle.round}
                  </span>
                ) : (
                  <span className="px-3 py-0.5 rounded-full text-xs font-medium bg-surface-elevated border border-border-subtle text-muted flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Fase de Preparação
                  </span>
                )}

                {/* Indicador de persistência local */}
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-muted opacity-80" title="Todas as alterações são salvas automaticamente no armazenamento local deste dispositivo">
                  <HardDrive size={12} className="text-emerald-400" />
                  <span>Persistência Local Ativa</span>
                </span>
              </div>
              <p className="text-xs text-muted mt-0.5">
                {battle.isActive 
                  ? `Gerenciando iniciativas da Rodada ${battle.round}. Siga a fila de turnos abaixo.`
                  : 'Monte os combatentes, insira as iniciativas roladas na mesa e inicie o combate.'}
              </p>
            </div>
          </div>

          {/* Botões de Ação do Topo */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Se o combate estiver ativo: Controles de Turno */}
            {battle.isActive ? (
              <>
                <button
                  onClick={battle.prevTurn}
                  title="Turno Anterior"
                  className="px-3 py-2 bg-surface-elevated hover:bg-surface-hover border border-border-subtle text-secondary hover:text-heading rounded-lg text-sm font-medium transition-colors flex items-center space-x-1 cursor-pointer"
                >
                  <ChevronLeft size={16} />
                  <span className="hidden sm:inline">Anterior</span>
                </button>

                <button
                  onClick={battle.nextTurn}
                  title="Avançar para o Próximo Turno da Fila"
                  className={`px-4 py-2 text-sm rounded-lg transition-all shadow-md flex items-center space-x-1.5 cursor-pointer hover:scale-105 active:scale-95 ${primaryButtonClass}`}
                >
                  <span>Próximo Turno</span>
                  <ChevronRight size={18} />
                </button>

                <button
                  onClick={battle.endCombat}
                  title="Finalizar Combate"
                  className="px-3 py-2 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-600/40 text-rose-300 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1 cursor-pointer"
                >
                  <Square size={14} />
                  <span className="hidden sm:inline">Finalizar</span>
                </button>
              </>
            ) : (
              /* Se estiver em preparação: Iniciar Combate */
              <button
                onClick={battle.startCombat}
                disabled={battle.combatants.length === 0}
                className={`px-4 py-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm rounded-lg transition-all shadow-md flex items-center space-x-1.5 cursor-pointer hover:scale-105 active:scale-95 ${primaryButtonClass}`}
              >
                <Play size={16} className="fill-current" />
                <span>Iniciar Combate</span>
              </button>
            )}

            {/* Adicionar combatente */}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-3 py-2 bg-surface-elevated hover:bg-surface-hover border border-border-hover text-heading rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 cursor-pointer"
            >
              <Plus size={16} />
              <span>Adicionar</span>
            </button>

            {/* Biblioteca de Encontros Salvos */}
            <button
              onClick={() => setIsSavedEncountersModalOpen(true)}
              title="Biblioteca de Encontros Salvos e Backup JSON"
              className="px-3 py-2 bg-surface-elevated hover:bg-surface-hover border border-border-hover text-heading rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 cursor-pointer"
            >
              <Bookmark size={16} className={isCyber ? 'text-[#0ff]' : isVamp ? 'text-rose-400' : isMed ? 'text-[#8b4513]' : 'text-accent-text'} />
              <span>Encontros</span>
              {battle.savedEncounters.length > 0 && (
                <span className={`px-1.5 py-0.2 text-[10px] font-bold rounded-full ${
                  isCyber ? 'bg-[#0ff]/20 text-[#0ff]' : isVamp ? 'bg-rose-900/60 text-rose-200' : 'bg-accent/20 text-accent-text'
                }`}>
                  {battle.savedEncounters.length}
                </span>
              )}
            </button>

            {/* Histórico Toggle */}
            <button
              onClick={() => setShowHistoryPanel(!showHistoryPanel)}
              title="Registro de Ações da Batalha"
              className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                showHistoryPanel 
                  ? isCyber
                    ? 'bg-[#0ff]/20 border-[#0ff] text-[#0ff]'
                    : isVamp
                    ? 'bg-rose-900/40 border-rose-600/50 text-rose-300'
                    : 'bg-accent/20 border-accent text-accent-text' 
                  : 'bg-surface-elevated hover:bg-surface-hover border-border-subtle text-muted hover:text-heading'
              }`}
            >
              <History size={18} />
            </button>

            {/* Limpar Fila */}
            {battle.combatants.length > 0 && !battle.isActive && (
              <button
                onClick={battle.clearAll}
                title="Limpar todos os combatentes da arena"
                className="p-2 text-muted hover:text-danger hover:bg-danger/10 border border-border-subtle rounded-lg transition-colors cursor-pointer"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>

        {/* CARDS DE RESUMO TÁTICO (STATS) */}
        {battle.combatants.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 mt-4 border-t border-border-subtle/60">
            {/* Aliados */}
            <div className="bg-surface-elevated/50 p-2.5 rounded-xl border border-border-subtle flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400">
                <Users size={16} />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-muted">Aliados Vivos</span>
                <p className="text-sm font-bold text-heading">
                  {battle.stats.aliveAllies} <span className="text-xs text-muted font-normal">/ {battle.stats.totalAllies}</span>
                </p>
              </div>
            </div>

            {/* Inimigos */}
            <div className="bg-surface-elevated/50 p-2.5 rounded-xl border border-border-subtle flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400">
                <Skull size={16} />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-muted">Inimigos Vivos</span>
                <p className="text-sm font-bold text-heading">
                  {battle.stats.aliveEnemies} <span className="text-xs text-muted font-normal">/ {battle.stats.totalEnemies}</span>
                </p>
              </div>
            </div>

            {/* Vez Atual */}
            <div className="bg-surface-elevated/50 p-2.5 rounded-xl border border-border-subtle flex items-center space-x-3 col-span-2 sm:col-span-2">
              <div className="p-2 rounded-lg bg-accent/10 border border-accent/30 text-accent-text">
                <Zap size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] uppercase font-bold text-muted">
                  {battle.isActive ? 'Vez Atual (Na Fila)' : 'Líder de Iniciativa'}
                </span>
                <p className="text-sm font-bold text-heading truncate">
                  {battle.activeCombatant ? (
                    <span className={battle.activeCombatant.type === 'player' ? 'text-blue-300' : 'text-rose-300'}>
                      {battle.activeCombatant.name} (Init: {battle.activeCombatant.initiative})
                    </span>
                  ) : (
                    <span className="text-muted italic">Nenhum combatente ativo</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* PAINEL LATERAL DE HISTÓRICO EXPANSÍVEL */}
      {showHistoryPanel && (
        <div className="bg-surface-card border border-border-default rounded-2xl p-4 space-y-3 animate-fade-in shadow-lg">
          <div className="flex justify-between items-center pb-2 border-b border-border-subtle">
            <div className="flex items-center space-x-2 text-sm font-bold text-heading">
              <History size={16} className="text-accent-text" />
              <span>Registro de Batalha (Logs Recentes)</span>
            </div>
            <button
              onClick={() => setShowHistoryPanel(false)}
              className="text-muted hover:text-heading text-xs cursor-pointer"
            >
              Fechar
            </button>
          </div>

          <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-1.5 pr-1">
            {battle.history.length === 0 ? (
              <p className="text-xs text-muted italic text-center py-4">Nenhum evento registrado ainda.</p>
            ) : (
              battle.history.map(item => (
                <div key={item.id} className="text-xs py-1 px-2 rounded bg-surface-elevated/60 flex items-start space-x-2">
                  <span className="text-[10px] text-muted font-mono shrink-0 pt-0.5">{item.timestamp}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-surface-card border border-border-subtle text-secondary shrink-0">
                    R{item.round}
                  </span>
                  <span className={`flex-1 ${
                    item.type === 'damage' ? 'text-rose-300' : item.type === 'heal' ? 'text-emerald-300' : item.type === 'round' ? 'text-accent-text font-bold' : 'text-primary'
                  }`}>
                    {item.message}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* FILA DE COMBATE / INITIATIVE QUEUE */}
      {battle.combatants.length === 0 ? (
        /* EMPTY STATE */
        <div className="text-center py-16 px-6 bg-surface-elevated2/60 rounded-2xl border border-dashed border-border-default flex flex-col items-center justify-center space-y-4">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
            isCyber 
              ? 'bg-[#0ff]/10 border border-[#0ff]/30 text-[#0ff] shadow-[0_0_20px_rgba(0,255,255,0.2)]' 
              : isVamp 
              ? 'bg-rose-950/40 border border-rose-600/30 text-rose-400 shadow-md' 
              : isMed 
              ? 'bg-[#8b4513]/10 border border-[#8b4513]/30 text-[#8b4513]' 
              : 'bg-accent/10 border border-accent/30 text-accent-text'
          }`}>
            <Swords size={32} />
          </div>

          <div className="max-w-md space-y-1.5">
            <h4 className="text-lg font-bold text-heading">Nenhum combatente na arena</h4>
            <p className="text-xs text-secondary leading-relaxed">
              Adicione jogadores e monstros para montar a ordem de iniciativa ou carregue um encontro salvo da sua biblioteca.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className={`px-4 py-2 text-sm rounded-xl transition-all flex items-center space-x-2 cursor-pointer hover:scale-105 active:scale-95 ${primaryButtonClass}`}
            >
              <Plus size={16} />
              <span>Adicionar Combatente</span>
            </button>

            {battle.savedEncounters.length > 0 && (
              <button
                onClick={() => setIsSavedEncountersModalOpen(true)}
                className="px-4 py-2 bg-surface-elevated hover:bg-surface-hover border border-border-hover text-heading rounded-xl text-sm font-medium transition-colors flex items-center space-x-2 cursor-pointer"
              >
                <FolderOpen size={16} className={isCyber ? "text-[#0ff]" : isVamp ? "text-rose-400" : isMed ? "text-[#8b4513]" : "text-accent-text"} />
                <span>Carregar Encontro Salvo ({battle.savedEncounters.length})</span>
              </button>
            )}

            {characters.length > 0 && (
              <button
                onClick={() => battle.importCharacters(characters)}
                className="px-4 py-2 bg-surface-elevated hover:bg-surface-hover border border-border-hover text-heading rounded-xl text-sm font-medium transition-colors flex items-center space-x-2 cursor-pointer"
              >
                <Users size={16} className={isCyber ? "text-[#0ff]" : "text-blue-400"} />
                <span>Importar Todos Jogadores ({characters.length})</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        /* LISTA DA FILA DE INICIATIVA */
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h4 className="text-sm font-bold text-secondary uppercase tracking-wider flex items-center gap-2">
              <Dices size={16} className="text-accent-text" />
              <span>Fila de Iniciativa ({battle.groups.length} Bloco{battle.groups.length > 1 ? 's' : ''} • {battle.combatants.length} Combatente{battle.combatants.length > 1 ? 's' : ''})</span>
            </h4>
            <span className="text-xs text-muted">
              Ordenado da maior iniciativa para a menor
            </span>
          </div>

          <div className="space-y-3.5">
            {battle.groups.map((group, groupIdx) => {
              const isGroupActive = battle.isActive && battle.currentGroupIndex === groupIdx;
              return (
                <CombatGroupContainer
                  key={group.groupId}
                  group={group}
                  isGroupActive={isGroupActive}
                  activeCombatantId={battle.activeCombatantId}
                  onSelectActiveCombatant={battle.setActiveCombatantId}
                  onAdjustHp={battle.adjustHp}
                  onUpdateCombatant={battle.updateCombatant}
                  onToggleCondition={battle.toggleCondition}
                  onRollInitiative={battle.rollInitiative}
                  onUpdateInitiative={(id, val) => battle.updateCombatant(id, { initiative: val })}
                  onRemove={battle.removeCombatant}
                  onDuplicate={battle.duplicateCombatant}
                  theme={theme}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL DE ADIÇÃO DE COMBATENTE */}
      <AddCombatantModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddCombatant={battle.addCombatant}
        onImportCharacters={battle.importCharacters}
        onImportMonster={battle.importMonster}
        availableCharacters={characters}
        theme={theme}
      />

      {/* MODAL DE ENCONTROS SALVOS & BACKUP */}
      <SavedEncountersModal
        isOpen={isSavedEncountersModalOpen}
        onClose={() => setIsSavedEncountersModalOpen(false)}
        savedEncounters={battle.savedEncounters}
        currentCombatants={battle.combatants}
        currentRound={battle.round}
        onSaveCurrentAsEncounter={battle.saveCurrentAsEncounter}
        onLoadEncounter={battle.loadEncounter}
        onDeleteEncounter={battle.deleteEncounter}
        onExportBattleJson={battle.exportBattleAsJson}
        onImportBattleJson={battle.importBattleFromJson}
        theme={theme}
      />
    </div>
  );
};
