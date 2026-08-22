import React, { useState, useMemo, useRef } from 'react';
import { 
  X, 
  Bookmark, 
  Plus, 
  FolderOpen, 
  Download, 
  Upload, 
  Trash2, 
  Users, 
  Skull, 
  Layers, 
  Search, 
  Check, 
  FileText,
  AlertCircle,
  Clock,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Combatant, SavedEncounter } from '../../types/battle';

interface SavedEncountersModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedEncounters: SavedEncounter[];
  currentCombatants: Combatant[];
  currentRound: number;
  onSaveCurrentAsEncounter: (name: string, description?: string) => Promise<SavedEncounter>;
  onLoadEncounter: (encounter: SavedEncounter, mode: 'replace' | 'merge') => void;
  onDeleteEncounter: (encounterId: string) => Promise<void>;
  onExportBattleJson: () => string;
  onImportBattleJson: (jsonStr: string, mode: 'replace' | 'merge') => boolean;
  theme: string;
}

export const SavedEncountersModal: React.FC<SavedEncountersModalProps> = ({
  isOpen,
  onClose,
  savedEncounters,
  currentCombatants,
  currentRound,
  onSaveCurrentAsEncounter,
  onLoadEncounter,
  onDeleteEncounter,
  onExportBattleJson,
  onImportBattleJson,
  theme
}) => {
  const [activeTab, setActiveTab] = useState<'library' | 'save_current' | 'import_export'>('library');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Estado para salvar o combate atual
  const [encounterName, setEncounterName] = useState('');
  const [encounterDesc, setEncounterDesc] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);

  // Estado para importação
  const [importJsonText, setImportJsonText] = useState('');
  const [importMode, setImportMode] = useState<'replace' | 'merge'>('replace');
  const [importStatus, setImportStatus] = useState<{ success?: boolean; message?: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isCyber = theme === 'cyberpunk';
  const isMed = theme === 'medieval';
  const isVamp = theme === 'vampire';

  // Filtra encontros por busca
  const filteredEncounters = useMemo(() => {
    if (!searchQuery.trim()) return savedEncounters;
    const q = searchQuery.toLowerCase();
    return savedEncounters.filter(e => 
      e.name.toLowerCase().includes(q) || 
      (e.description && e.description.toLowerCase().includes(q)) ||
      (e.combatants && e.combatants.some(c => c.name.toLowerCase().includes(q)))
    );
  }, [savedEncounters, searchQuery]);

  if (!isOpen) return null;

  // Ação: Salvar atual
  const handleSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!encounterName.trim() || currentCombatants.length === 0) return;

    setIsSaving(true);
    try {
      await onSaveCurrentAsEncounter(encounterName.trim(), encounterDesc.trim() || undefined);
      setSaveSuccessMsg(true);
      setEncounterName('');
      setEncounterDesc('');
      setTimeout(() => {
        setSaveSuccessMsg(false);
        setActiveTab('library');
      }, 900);
    } catch (err) {
      console.error('[Requiem Battle] Error saving encounter:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Ação: Download de arquivo JSON
  const handleDownloadJson = (encounter?: SavedEncounter) => {
    let jsonContent = '';
    let fileName = 'requiem-batalha.json';

    if (encounter) {
      jsonContent = JSON.stringify({
        _app: 'Requiem',
        _type: 'battle_encounter_export',
        _version: '1.0',
        exportedAt: new Date().toISOString(),
        data: encounter
      }, null, 2);
      fileName = `encontro-${encounter.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.json`;
    } else {
      jsonContent = onExportBattleJson();
      fileName = `arena-batalha-${new Date().toISOString().slice(0, 10)}.json`;
    }

    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Ação: Importar a partir de arquivo local
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setImportJsonText(content);
        executeImport(content, importMode);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const executeImport = (jsonStr: string, mode: 'replace' | 'merge') => {
    setImportStatus(null);
    if (!jsonStr.trim()) {
      setImportStatus({ success: false, message: 'Insira ou selecione um conteúdo JSON válido.' });
      return;
    }

    const ok = onImportBattleJson(jsonStr, mode);
    if (ok) {
      setImportStatus({ success: true, message: `Combate importado com sucesso no modo ${mode === 'replace' ? 'Substituir' : 'Mesclar'}!` });
      setTimeout(() => {
        onClose();
      }, 1200);
    } else {
      setImportStatus({ success: false, message: 'Estrutura JSON inválida ou nenhum combatente reconhecido.' });
    }
  };

  // Classes temáticas do Modal
  const modalThemeClass = isCyber
    ? 'font-mono text-cyan-300 bg-[#071018] border-[#0ff]/40 shadow-[0_0_35px_rgba(0,255,255,0.25)]'
    : isVamp
    ? 'font-serif text-[#f4eacc] bg-[#120a15] border-[#ff3333]/40 shadow-[0_0_35px_rgba(255,51,51,0.25)]'
    : isMed
    ? 'font-serif text-[#3e2723] bg-[#f7eed4] parchment border-2 border-[#8b4513]/60 shadow-2xl'
    : 'bg-surface-card border-border-hover';

  const primaryBtnClass = isCyber
    ? 'bg-[#00ffff] hover:bg-[#00d8d8] text-black font-mono font-bold shadow-[0_0_15px_rgba(0,255,255,0.3)] border border-[#00ffff]'
    : isVamp
    ? 'bg-[#8b0000] hover:bg-[#b00000] text-white font-serif font-bold border border-[#ff3333]/40 shadow-md'
    : isMed
    ? 'bg-[#8b4513] hover:bg-[#a0522d] text-[#f4eacc] font-serif font-bold border border-[#5c2e0b] shadow-md'
    : 'bg-accent hover:bg-accent-hover text-white font-bold shadow-md';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div 
        onClick={(e) => e.stopPropagation()}
        className={`border rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden ${modalThemeClass}`}
      >
        {/* Modal Header */}
        <div className={`flex items-center justify-between p-4 md:p-6 border-b ${
          isMed ? 'border-[#8b4513]/30 bg-[#efe3c3]' : 'border-border-subtle bg-surface-elevated'
        }`}>
          <div className="flex items-center space-x-3">
            <div className={`p-2.5 rounded-xl border ${
              isCyber 
                ? 'bg-[#0ff]/20 border-[#0ff]/40 text-[#0ff] shadow-[0_0_15px_rgba(0,255,255,0.3)]' 
                : isVamp 
                ? 'bg-rose-950/40 border-rose-600/40 text-rose-300' 
                : isMed 
                ? 'bg-[#8b4513]/15 border-[#8b4513]/30 text-[#8b4513]' 
                : 'bg-accent/20 border-accent/40 text-accent-text'
            }`}>
              <Bookmark size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg md:text-xl font-bold text-heading">Biblioteca de Encontros</h3>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-surface-card border border-border-subtle text-muted">
                  Persistência Local
                </span>
              </div>
              <p className="text-xs text-muted">
                Salve presets de combate, carregue encontros pré-montados ou exporte/importe em JSON
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-heading p-2 rounded-lg hover:bg-surface-hover transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className={`flex border-b px-4 md:px-6 overflow-x-auto custom-scrollbar ${
          isMed ? 'border-[#8b4513]/30 bg-[#e9dcbc]' : 'border-border-subtle bg-surface-elevated2'
        }`}>
          <button
            onClick={() => setActiveTab('library')}
            className={`flex items-center space-x-2 py-3 px-4 border-b-2 font-medium text-sm transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'library'
                ? isMed ? 'border-[#8b4513] text-[#8b4513] font-bold' : isCyber ? 'border-[#0ff] text-[#0ff] font-bold' : 'border-accent text-accent-text font-bold'
                : 'border-transparent text-muted hover:text-heading'
            }`}
          >
            <FolderOpen size={16} />
            <span>Encontros Salvos ({savedEncounters.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('save_current')}
            className={`flex items-center space-x-2 py-3 px-4 border-b-2 font-medium text-sm transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'save_current'
                ? isMed ? 'border-[#8b4513] text-[#8b4513] font-bold' : isCyber ? 'border-[#0ff] text-[#0ff] font-bold' : 'border-accent text-accent-text font-bold'
                : 'border-transparent text-muted hover:text-heading'
            }`}
          >
            <Plus size={16} />
            <span>Salvar Combate Atual ({currentCombatants.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('import_export')}
            className={`flex items-center space-x-2 py-3 px-4 border-b-2 font-medium text-sm transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'import_export'
                ? isMed ? 'border-[#8b4513] text-[#8b4513] font-bold' : isCyber ? 'border-[#0ff] text-[#0ff] font-bold' : 'border-accent text-accent-text font-bold'
                : 'border-transparent text-muted hover:text-heading'
            }`}
          >
            <FileText size={16} />
            <span>Backup / JSON</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 md:p-6 overflow-y-auto flex-1 custom-scrollbar space-y-6">
          {/* TAB 1: BIBLIOTECA DE ENCONTROS SALVOS */}
          {activeTab === 'library' && (
            <div className="space-y-4">
              {/* Barra de Busca e Ação Rápida */}
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    type="text"
                    placeholder="Buscar encontro salvo por nome, monstro ou nota..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-surface-input border border-border-subtle focus:border-accent rounded-lg text-sm text-heading outline-none"
                  />
                </div>

                <button
                  onClick={() => setActiveTab('save_current')}
                  disabled={currentCombatants.length === 0}
                  className={`px-3.5 py-2 text-xs rounded-lg transition-all flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${primaryBtnClass}`}
                >
                  <Plus size={14} />
                  <span>Salvar Atual como Preset</span>
                </button>
              </div>

              {/* Lista de Encontros */}
              {savedEncounters.length === 0 ? (
                <div className="text-center py-12 px-4 bg-surface-elevated/40 rounded-2xl border border-dashed border-border-default space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-xl bg-surface-card flex items-center justify-center text-muted">
                    <FolderOpen size={24} />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-heading">Nenhum encontro salvo localmente</h4>
                    <p className="text-xs text-muted max-w-sm mx-auto mt-1">
                      Monte os monstros e combatentes na arena e clique em "Salvar Combate Atual" para criar modelos reutilizáveis.
                    </p>
                  </div>
                  {currentCombatants.length > 0 && (
                    <button
                      onClick={() => setActiveTab('save_current')}
                      className={`mt-2 px-4 py-2 text-xs rounded-lg transition-all ${primaryBtnClass}`}
                    >
                      Salvar {currentCombatants.length} combatentes atuais
                    </button>
                  )}
                </div>
              ) : filteredEncounters.length === 0 ? (
                <div className="text-center py-8 text-xs text-muted italic bg-surface-elevated/30 rounded-xl border border-border-subtle">
                  Nenhum encontro encontrado para a busca "{searchQuery}".
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredEncounters.map((encounter) => {
                    const allies = encounter.combatants.filter(c => c.type === 'player');
                    const enemies = encounter.combatants.filter(c => c.type === 'enemy');
                    const formattedDate = new Date(encounter.updatedAt || encounter.createdAt).toLocaleDateString(undefined, {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    });

                    return (
                      <div
                        key={encounter.id}
                        className={`p-4 rounded-xl border transition-all ${
                          isCyber
                            ? 'bg-[#08121a]/80 border-[#0ff]/20 hover:border-[#0ff]/50'
                            : isVamp
                            ? 'bg-[#150f18]/90 border-[#ff3333]/20 hover:border-[#ff3333]/40'
                            : isMed
                            ? 'bg-[#f4ebd0] border-[#8b4513]/30 hover:border-[#8b4513]'
                            : 'bg-surface-elevated/70 border-border-default hover:border-border-hover'
                        }`}
                      >
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                          {/* Detalhes do Encontro */}
                          <div className="space-y-1.5 min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-bold text-base text-heading truncate">
                                {encounter.name}
                              </h4>
                              <span className="text-[10px] text-muted flex items-center gap-1 font-mono">
                                <Clock size={11} />
                                {formattedDate}
                              </span>
                            </div>

                            {encounter.description && (
                              <p className="text-xs text-secondary leading-relaxed line-clamp-2">
                                {encounter.description}
                              </p>
                            )}

                            {/* Tags de Resumo */}
                            <div className="flex items-center gap-2 pt-1 flex-wrap text-xs">
                              <span className="px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/30 text-blue-300 flex items-center gap-1 font-semibold text-[11px]">
                                <Users size={12} />
                                {allies.length} Aliado{allies.length !== 1 ? 's' : ''}
                              </span>
                              <span className="px-2 py-0.5 rounded-md bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-1 font-semibold text-[11px]">
                                <Skull size={12} />
                                {enemies.length} Inimigo{enemies.length !== 1 ? 's' : ''}
                              </span>
                              <span className="text-[11px] text-muted">
                                Total: {encounter.combatants.length} combatente{encounter.combatants.length !== 1 ? 's' : ''}
                              </span>
                            </div>

                            {/* Amostra dos Monstros / Personagens */}
                            <div className="pt-1.5 flex items-center gap-1.5 flex-wrap">
                              {encounter.combatants.slice(0, 6).map((c, idx) => (
                                <span
                                  key={idx}
                                  className={`text-[10px] px-2 py-0.5 rounded border truncate max-w-[130px] ${
                                    c.type === 'player'
                                      ? 'bg-blue-950/30 border-blue-600/30 text-blue-300'
                                      : 'bg-rose-950/30 border-rose-600/30 text-rose-300'
                                  }`}
                                  title={`${c.name} (AC ${c.armorClass || '?'}, HP ${c.maxHp})`}
                                >
                                  {c.name}
                                </span>
                              ))}
                              {encounter.combatants.length > 6 && (
                                <span className="text-[10px] text-muted">+{encounter.combatants.length - 6} outros</span>
                              )}
                            </div>
                          </div>

                          {/* Botões de Ação do Encontro */}
                          <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-border-subtle/50">
                            {/* Carregar (Substituir) */}
                            <button
                              onClick={() => {
                                onLoadEncounter(encounter, 'replace');
                                onClose();
                              }}
                              title="Substituir combatentes da arena por este encontro"
                              className={`px-3 py-1.5 text-xs rounded-lg transition-all flex items-center space-x-1 cursor-pointer hover:scale-105 active:scale-95 ${primaryBtnClass}`}
                            >
                              <ArrowRight size={13} />
                              <span>Carregar</span>
                            </button>

                            {/* Mesclar */}
                            <button
                              onClick={() => {
                                onLoadEncounter(encounter, 'merge');
                                onClose();
                              }}
                              title="Adicionar combatentes deste encontro à arena atual sem apagar os existentes"
                              className="px-2.5 py-1.5 bg-surface-card hover:bg-surface-hover border border-border-hover text-heading rounded-lg text-xs font-medium transition-colors flex items-center space-x-1 cursor-pointer"
                            >
                              <Layers size={13} />
                              <span className="hidden sm:inline">Mesclar</span>
                            </button>

                            {/* Exportar JSON */}
                            <button
                              onClick={() => handleDownloadJson(encounter)}
                              title="Baixar JSON deste encontro"
                              className="p-1.5 text-muted hover:text-heading hover:bg-surface-hover border border-border-subtle rounded-lg transition-colors cursor-pointer"
                            >
                              <Download size={14} />
                            </button>

                            {/* Excluir */}
                            <button
                              onClick={() => {
                                if (window.confirm(`Deseja excluir o encontro salvo "${encounter.name}"?`)) {
                                  onDeleteEncounter(encounter.id);
                                }
                              }}
                              title="Excluir encontro salvo"
                              className="p-1.5 text-muted hover:text-danger hover:bg-danger/10 border border-border-subtle rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SALVAR COMBATE ATUAL */}
          {activeTab === 'save_current' && (
            <div className="space-y-5">
              {currentCombatants.length === 0 ? (
                <div className="text-center py-10 px-4 bg-surface-elevated/40 rounded-xl border border-dashed border-border-subtle space-y-2">
                  <AlertCircle size={28} className="mx-auto text-muted" />
                  <h4 className="text-sm font-bold text-heading">A arena de combate está vazia</h4>
                  <p className="text-xs text-muted max-w-sm mx-auto">
                    Adicione pelo menos um combatente (jogador ou monstro) na tela principal do Battle Helper antes de salvar como preset.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSaveSubmit} className="space-y-4">
                  {/* Resumo da composição atual */}
                  <div className={`p-4 rounded-xl border ${
                    isMed ? 'bg-[#ede0be]/80 border-[#8b4513]/30' : 'bg-surface-elevated/60 border-border-subtle'
                  } space-y-2.5`}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-secondary uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles size={14} className="text-accent-text" />
                        Composição da Arena Atual:
                      </span>
                      <span className="font-mono text-muted">
                        Rodada Atual: {currentRound}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                      <span className="px-2.5 py-1 rounded-md bg-blue-500/15 border border-blue-500/40 text-blue-300 font-bold">
                        {currentCombatants.filter(c => c.type === 'player').length} Jogadores
                      </span>
                      <span className="px-2.5 py-1 rounded-md bg-rose-500/15 border border-rose-500/40 text-rose-300 font-bold">
                        {currentCombatants.filter(c => c.type === 'enemy').length} Inimigos / Monstros
                      </span>
                      <span className="text-muted font-medium">
                        Total: {currentCombatants.length} combatentes
                      </span>
                    </div>

                    {/* Preview de combatentes */}
                    <div className="max-h-32 overflow-y-auto custom-scrollbar flex flex-wrap gap-1.5 pt-1">
                      {currentCombatants.map((c) => (
                        <span
                          key={c.id}
                          className={`text-xs px-2 py-0.5 rounded border ${
                            c.type === 'player'
                              ? 'bg-blue-950/30 border-blue-500/30 text-blue-300'
                              : 'bg-rose-950/30 border-rose-500/30 text-rose-300'
                          }`}
                        >
                          {c.name} ({c.currentHp}/{c.maxHp} HP)
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Campos do Formulário */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-secondary">
                      Nome do Encontro / Preset *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Emboscada dos Goblins na Estrada do Rei, Covil do Dragão Jovem"
                      value={encounterName}
                      onChange={(e) => setEncounterName(e.target.value)}
                      className="w-full px-3 py-2 bg-surface-input border border-border-default focus:border-accent rounded-lg text-sm text-heading outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-secondary">
                      Descrição / Notas Táticas (Opcional)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Ex: 3 arqueiros posicionados nas árvores com vantagem. O líder goblin entra no turno 2."
                      value={encounterDesc}
                      onChange={(e) => setEncounterDesc(e.target.value)}
                      className="w-full px-3 py-2 bg-surface-input border border-border-default focus:border-accent rounded-lg text-sm text-heading outline-none resize-none"
                    />
                  </div>

                  {saveSuccessMsg && (
                    <div className="p-3 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center space-x-2 animate-fade-in">
                      <Check size={16} />
                      <span>Encontro salvo com sucesso na sua biblioteca local!</span>
                    </div>
                  )}

                  <div className="pt-3 flex justify-end space-x-3 border-t border-border-subtle">
                    <button
                      type="button"
                      onClick={() => setActiveTab('library')}
                      className="px-4 py-2 bg-surface-elevated hover:bg-surface-hover text-secondary hover:text-heading rounded-lg text-sm transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving || !encounterName.trim()}
                      className={`px-5 py-2 disabled:opacity-40 disabled:cursor-not-allowed text-sm rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer ${primaryBtnClass}`}
                    >
                      <Bookmark size={16} />
                      <span>{isSaving ? 'Salvando...' : 'Salvar Encontro Localmente'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 3: IMPORTAR / EXPORTAR JSON */}
          {activeTab === 'import_export' && (
            <div className="space-y-6">
              {/* Seção de Exportação */}
              <div className={`p-4 rounded-xl border ${
                isMed ? 'bg-[#ede0be]/80 border-[#8b4513]/30' : 'bg-surface-elevated/60 border-border-subtle'
              } space-y-3`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-heading flex items-center gap-1.5">
                      <Download size={16} className="text-accent-text" />
                      Exportar Batalha Atual (Backup)
                    </h4>
                    <p className="text-xs text-muted mt-0.5">
                      Baixe um arquivo JSON com o combate e todos os dados atuais da arena.
                    </p>
                  </div>
                  <button
                    onClick={() => handleDownloadJson()}
                    disabled={currentCombatants.length === 0}
                    className={`px-3.5 py-2 text-xs rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${primaryBtnClass}`}
                  >
                    <Download size={14} />
                    <span>Baixar JSON</span>
                  </button>
                </div>
              </div>

              {/* Seção de Importação */}
              <div className={`p-4 rounded-xl border ${
                isMed ? 'bg-[#ede0be]/80 border-[#8b4513]/30' : 'bg-surface-elevated/60 border-border-subtle'
              } space-y-4`}>
                <div>
                  <h4 className="text-sm font-bold text-heading flex items-center gap-1.5">
                    <Upload size={16} className="text-accent-text" />
                    Importar Combate / Encontro a partir de JSON
                  </h4>
                  <p className="text-xs text-muted mt-0.5">
                    Carregue um arquivo JSON gerado pelo Requiem ou cole a estrutura JSON abaixo.
                  </p>
                </div>

                {/* Seleção de Modo de Importação */}
                <div className="flex items-center gap-4 text-xs">
                  <span className="font-semibold text-secondary">Modo de Inserção:</span>
                  <label className="flex items-center space-x-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === 'replace'}
                      onChange={() => setImportMode('replace')}
                      className="accent-accent"
                    />
                    <span className={importMode === 'replace' ? 'font-bold text-heading' : 'text-muted'}>
                      Substituir arena atual
                    </span>
                  </label>
                  <label className="flex items-center space-x-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === 'merge'}
                      onChange={() => setImportMode('merge')}
                      className="accent-accent"
                    />
                    <span className={importMode === 'merge' ? 'font-bold text-heading' : 'text-muted'}>
                      Mesclar com combate atual
                    </span>
                  </label>
                </div>

                {/* Botão de Arquivo Local */}
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,application/json"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="encounter-file-input"
                  />
                  <label
                    htmlFor="encounter-file-input"
                    className="inline-flex items-center space-x-2 px-3.5 py-2 bg-surface-card hover:bg-surface-hover border border-border-hover rounded-lg text-xs font-semibold text-heading transition-colors cursor-pointer"
                  >
                    <Upload size={14} />
                    <span>Selecionar Arquivo .JSON do Computador</span>
                  </label>
                </div>

                {/* Ou colar JSON */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-secondary">Ou cole o texto JSON aqui:</label>
                  <textarea
                    rows={4}
                    placeholder='{"combatants": [{"name": "Goblin", "type": "enemy", "maxHp": 15, "initiative": 12, ...}]}'
                    value={importJsonText}
                    onChange={(e) => setImportJsonText(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-input border border-border-default focus:border-accent rounded-lg text-xs font-mono text-heading outline-none"
                  />
                </div>

                {importStatus && (
                  <div className={`p-3 rounded-lg text-xs font-semibold flex items-center space-x-2 animate-fade-in ${
                    importStatus.success
                      ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                      : 'bg-rose-500/20 border border-rose-500/40 text-rose-300'
                  }`}>
                    {importStatus.success ? <Check size={16} /> : <AlertCircle size={16} />}
                    <span>{importStatus.message}</span>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => executeImport(importJsonText, importMode)}
                    disabled={!importJsonText.trim()}
                    className={`px-5 py-2 disabled:opacity-40 disabled:cursor-not-allowed text-xs rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer ${primaryBtnClass}`}
                  >
                    <Upload size={14} />
                    <span>Processar Importação</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
