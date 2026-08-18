import React, { useState, useMemo } from 'react';
import { 
  X, 
  Users, 
  Skull, 
  Shield, 
  Heart, 
  Dices, 
  Search, 
  Plus, 
  Check, 
  Sparkles,
  BookOpen
} from 'lucide-react';
import { Combatant } from '../../types/battle';
import { rollD20, parseAcString, parseHpString } from '../../utils/battleUtils';

// Carrega XMLs do Bestiário dinamicamente
const xmlModules = import.meta.glob('../../../monsters/*.xml', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

interface ParsedMonster {
  name: string;
  cr: string;
  ac: string;
  hp: string;
  dexMod: number;
  type: string;
}

const parseAllMonstersFromXml = (): ParsedMonster[] => {
  const list: ParsedMonster[] = [];
  const seen = new Set<string>();

  try {
    const parser = new DOMParser();
    for (const path in xmlModules) {
      const xmlStr = xmlModules[path];
      const doc = parser.parseFromString(xmlStr, 'text/xml');
      const monsterEls = doc.getElementsByTagName('monster');

      for (let i = 0; i < monsterEls.length; i++) {
        const el = monsterEls[i];
        const name = el.getElementsByTagName('name')[0]?.textContent || '';
        if (!name || seen.has(name.toLowerCase())) continue;
        seen.add(name.toLowerCase());

        const cr = el.getElementsByTagName('cr')[0]?.textContent || '';
        const ac = el.getElementsByTagName('ac')[0]?.textContent || '10';
        const hp = el.getElementsByTagName('hp')[0]?.textContent || '10';
        const type = el.getElementsByTagName('type')[0]?.textContent || 'Monster';
        const dex = el.getElementsByTagName('dex')[0]?.textContent || '10';
        const dexNum = parseInt(dex, 10) || 10;
        const dexMod = Math.floor((dexNum - 10) / 2);

        list.push({ name, cr, ac, hp, dexMod, type });
      }
    }
  } catch (e) {
    console.warn('[Requiem Battle] Error parsing bestiary XMLs for modal:', e);
  }

  return list.sort((a, b) => a.name.localeCompare(b.name));
};

interface AddCombatantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCombatant: (data: Omit<Combatant, 'id'>) => void;
  onImportCharacters: (chars: any[]) => void;
  onImportMonster: (monster: any, count: number) => void;
  availableCharacters: any[];
  theme: string;
}

export const AddCombatantModal: React.FC<AddCombatantModalProps> = ({
  isOpen,
  onClose,
  onAddCombatant,
  onImportCharacters,
  availableCharacters,
  theme
}) => {
  const [activeTab, setActiveTab] = useState<'enemy' | 'player' | 'import'>('enemy');

  // Estado para Inimigo
  const [enemyName, setEnemyName] = useState('');
  const [enemyHp, setEnemyHp] = useState('15');
  const [enemyAc, setEnemyAc] = useState('13');
  const [enemyInit, setEnemyInit] = useState('0');
  const [enemyCount, setEnemyCount] = useState('1');
  const [enemyNotes, setEnemyNotes] = useState('');
  const [bestiarySearch, setBestiarySearch] = useState('');
  const [selectedBestiaryMonster, setSelectedBestiaryMonster] = useState<ParsedMonster | null>(null);

  // Estado para Jogador
  const [playerName, setPlayerName] = useState('');
  const [playerHp, setPlayerHp] = useState('25');
  const [playerInit, setPlayerInit] = useState('0');
  const [playerNotes, setPlayerNotes] = useState('');

  // Estado para Importação de Personagens
  const [selectedCharIds, setSelectedCharIds] = useState<number[]>([]);

  // Carrega lista de monstros do bestiário em cache
  const allMonsters = useMemo(() => parseAllMonstersFromXml(), []);

  const filteredMonsters = useMemo(() => {
    if (!bestiarySearch.trim()) return allMonsters.slice(0, 15);
    const q = bestiarySearch.toLowerCase();
    return allMonsters.filter(m => m.name.toLowerCase().includes(q) || m.type.toLowerCase().includes(q)).slice(0, 30);
  }, [allMonsters, bestiarySearch]);

  if (!isOpen) return null;

  // Selecionar monstro do Bestiário
  const handleSelectBestiaryMonster = (monster: ParsedMonster) => {
    setSelectedBestiaryMonster(monster);
    setEnemyName(monster.name);
    setEnemyHp(parseHpString(monster.hp).toString());
    setEnemyAc(parseAcString(monster.ac).toString());
    setEnemyInit('0');
    setEnemyNotes(`CR ${monster.cr || '?'}, ${monster.type}`);
  };

  // Submeter Inimigo
  const handleAddEnemy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enemyName.trim()) return;

    const count = Math.max(1, parseInt(enemyCount, 10) || 1);
    const hp = Math.max(1, parseInt(enemyHp, 10) || 10);
    const ac = Math.max(1, parseInt(enemyAc, 10) || 10);
    const init = parseInt(enemyInit, 10) || 0;

    for (let i = 0; i < count; i++) {
      const name = count > 1 ? `${enemyName.trim()} ${i + 1}` : enemyName.trim();
      onAddCombatant({
        name,
        type: 'enemy',
        currentHp: hp,
        maxHp: hp,
        armorClass: ac,
        initiative: init,
        conditions: [],
        notes: enemyNotes.trim() || undefined
      });
    }

    onClose();
    resetForm();
  };

  // Submeter Jogador
  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) return;

    const hp = Math.max(1, parseInt(playerHp, 10) || 20);
    const init = parseInt(playerInit, 10) || 0;

    onAddCombatant({
      name: playerName.trim(),
      type: 'player',
      currentHp: hp,
      maxHp: hp,
      initiative: init,
      conditions: [],
      notes: playerNotes.trim() || undefined
    });

    onClose();
    resetForm();
  };

  // Submeter Importação de Personagens
  const handleConfirmImportChars = () => {
    if (selectedCharIds.length === 0) return;
    const charsToImport = availableCharacters.filter(c => selectedCharIds.includes(c.id));
    onImportCharacters(charsToImport);
    onClose();
    resetForm();
  };

  const toggleSelectAllChars = () => {
    if (selectedCharIds.length === availableCharacters.length) {
      setSelectedCharIds([]);
    } else {
      setSelectedCharIds(availableCharacters.map(c => c.id));
    }
  };

  const resetForm = () => {
    setEnemyName('');
    setEnemyHp('15');
    setEnemyAc('13');
    setEnemyInit('0');
    setEnemyCount('1');
    setEnemyNotes('');
    setSelectedBestiaryMonster(null);
    setPlayerName('');
    setPlayerHp('25');
    setPlayerInit('0');
    setPlayerNotes('');
    setSelectedCharIds([]);
    setBestiarySearch('');
  };

  const isCyber = theme === 'cyberpunk';
  const isMed = theme === 'medieval';
  const isVamp = theme === 'vampire';

  const modalThemeClass = isCyber
    ? 'font-mono text-cyan-300 bg-[#071018] border-[#0ff]/40 shadow-[0_0_35px_rgba(0,255,255,0.25)]'
    : isVamp
    ? 'font-serif text-[#f4eacc] bg-[#120a15] border-[#ff3333]/40 shadow-[0_0_35px_rgba(255,51,51,0.25)]'
    : isMed
    ? 'font-serif text-[#3e2723] parchment border-[#8b4513]/50 shadow-2xl'
    : 'bg-surface-card border-border-hover';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div 
        onClick={(e) => e.stopPropagation()}
        className={`border rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden ${modalThemeClass}`}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-border-subtle bg-surface-elevated">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${
              isCyber ? 'bg-[#0ff]/20 border border-[#0ff]/40 text-[#0ff]' : isVamp ? 'bg-rose-950/40 border border-rose-600/40 text-rose-300' : 'bg-accent/20 border border-accent/40 text-accent-text'
            }`}>
              <Plus size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-heading">Adicionar Combatente</h3>
              <p className="text-xs text-muted">Insira jogadores ou monstros para a fila de batalha</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-heading p-2 rounded-lg hover:bg-surface-hover transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="flex border-b border-border-subtle bg-surface-elevated2 px-4 md:px-6">
          <button
            onClick={() => setActiveTab('enemy')}
            className={`flex items-center space-x-2 py-3 px-4 border-b-2 font-medium text-sm transition-colors cursor-pointer ${
              activeTab === 'enemy'
                ? 'border-rose-500 text-rose-400 font-bold'
                : 'border-transparent text-muted hover:text-heading'
            }`}
          >
            <Skull size={16} />
            <span>Inimigo / Monstro</span>
          </button>
          <button
            onClick={() => setActiveTab('player')}
            className={`flex items-center space-x-2 py-3 px-4 border-b-2 font-medium text-sm transition-colors cursor-pointer ${
              activeTab === 'player'
                ? 'border-blue-500 text-blue-400 font-bold'
                : 'border-transparent text-muted hover:text-heading'
            }`}
          >
            <Users size={16} />
            <span>Jogador Manual</span>
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`flex items-center space-x-2 py-3 px-4 border-b-2 font-medium text-sm transition-colors cursor-pointer ${
              activeTab === 'import'
                ? 'border-accent text-accent-text font-bold'
                : 'border-transparent text-muted hover:text-heading'
            }`}
          >
            <BookOpen size={16} />
            <span>Importar da Campanha ({availableCharacters.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 md:p-6 overflow-y-auto flex-1 custom-scrollbar space-y-6">
          {/* TAB: INIMIGO */}
          {activeTab === 'enemy' && (
            <div className="space-y-6">
              {/* Seletor Rápido do Bestiário */}
              <div className="space-y-2 bg-surface-elevated/60 p-3.5 rounded-xl border border-border-subtle">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-secondary uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles size={14} className="text-accent-text" />
                    Preencher a partir do Bestiário (Opcional):
                  </label>
                  {selectedBestiaryMonster && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedBestiaryMonster(null);
                        setEnemyName('');
                        setEnemyHp('15');
                        setEnemyAc('13');
                      }}
                      className="text-[11px] text-accent hover:underline cursor-pointer"
                    >
                      Limpar Seleção
                    </button>
                  )}
                </div>

                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    type="text"
                    placeholder="Buscar monstro (ex: Goblin, Dragon, Skeleton, Orc)..."
                    value={bestiarySearch}
                    onChange={(e) => setBestiarySearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-surface-input border border-border-subtle focus:border-accent rounded-lg text-sm text-heading outline-none"
                  />
                </div>

                {/* Lista filtrada de monstros */}
                <div className="max-h-32 overflow-y-auto custom-scrollbar grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                  {filteredMonsters.map(m => (
                    <button
                      key={m.name}
                      type="button"
                      onClick={() => handleSelectBestiaryMonster(m)}
                      className={`text-left p-2 rounded-lg border text-xs transition-colors flex items-center justify-between cursor-pointer ${
                        selectedBestiaryMonster?.name === m.name
                          ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 font-bold'
                          : 'bg-surface-elevated border-border-subtle hover:border-border-hover text-secondary hover:text-heading'
                      }`}
                    >
                      <span className="truncate pr-2">{m.name}</span>
                      <span className="text-[10px] text-muted shrink-0">AC {parseAcString(m.ac)} • {parseHpString(m.hp)} PV</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Formulário do Inimigo */}
              <form onSubmit={handleAddEnemy} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-semibold text-secondary">Nome do Inimigo *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Goblin Arqueiro, Dragão Vermelho"
                      value={enemyName}
                      onChange={(e) => setEnemyName(e.target.value)}
                      className="w-full px-3 py-2 bg-surface-input border border-border-default focus:border-accent rounded-lg text-sm text-heading outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-secondary">Quantidade</label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={enemyCount}
                      onChange={(e) => setEnemyCount(e.target.value)}
                      className="w-full px-3 py-2 bg-surface-input border border-border-default focus:border-accent rounded-lg text-sm text-heading outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Pontos de Vida (HP) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-secondary flex items-center gap-1">
                      <Heart size={14} className="text-rose-500" />
                      Vida Máxima (HP) *
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={enemyHp}
                      onChange={(e) => setEnemyHp(e.target.value)}
                      className="w-full px-3 py-2 bg-surface-input border border-border-default focus:border-accent rounded-lg text-sm text-heading outline-none font-mono"
                    />
                  </div>

                  {/* AC (Armour Class) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-secondary flex items-center gap-1">
                      <Shield size={14} className="text-accent-text" />
                      Armour Class (AC) *
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={enemyAc}
                      onChange={(e) => setEnemyAc(e.target.value)}
                      className="w-full px-3 py-2 bg-surface-input border border-border-default focus:border-accent rounded-lg text-sm text-heading outline-none font-mono"
                    />
                  </div>

                  {/* Iniciativa */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-secondary flex items-center gap-1">
                      <Dices size={14} className="text-secondary" />
                      Iniciativa (da Mesa)
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      value={enemyInit}
                      onChange={(e) => setEnemyInit(e.target.value)}
                      className="w-full px-3 py-2 bg-surface-input border border-border-default focus:border-accent rounded-lg text-sm text-heading outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-secondary">Notas / Descrição (Opcional)</label>
                  <input
                    type="text"
                    placeholder="Ex: Chefe lacaio, possui imunidade a veneno"
                    value={enemyNotes}
                    onChange={(e) => setEnemyNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-input border border-border-default focus:border-accent rounded-lg text-sm text-heading outline-none"
                  />
                </div>

                <div className="pt-3 flex justify-end space-x-3 border-t border-border-subtle">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 bg-surface-elevated hover:bg-surface-hover text-secondary hover:text-heading rounded-lg text-sm transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-sm transition-colors flex items-center space-x-1.5 cursor-pointer shadow-md"
                  >
                    <Plus size={16} />
                    <span>Adicionar Inimigo{parseInt(enemyCount, 10) > 1 ? `s (${enemyCount})` : ''}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB: JOGADOR MANUAL */}
          {activeTab === 'player' && (
            <form onSubmit={handleAddPlayer} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-secondary">Nome do Jogador / Personagem *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Sir Gerald, Lyra da Floresta"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-input border border-border-default focus:border-accent rounded-lg text-sm text-heading outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-secondary flex items-center gap-1">
                    <Heart size={14} className="text-rose-500" />
                    Vida Máxima (HP) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={playerHp}
                    onChange={(e) => setPlayerHp(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-input border border-border-default focus:border-accent rounded-lg text-sm text-heading outline-none font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-secondary flex items-center gap-1">
                    <Dices size={14} className="text-secondary" />
                    Iniciativa (da Mesa)
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={playerInit}
                    onChange={(e) => setPlayerInit(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-input border border-border-default focus:border-accent rounded-lg text-sm text-heading outline-none font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-secondary">Notas / Classe / Raça (Opcional)</label>
                <input
                  type="text"
                  placeholder="Ex: Paladino Nível 4, Humano"
                  value={playerNotes}
                  onChange={(e) => setPlayerNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-input border border-border-default focus:border-accent rounded-lg text-sm text-heading outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-3 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-surface-elevated hover:bg-surface-hover text-secondary hover:text-heading rounded-lg text-sm transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-sm transition-colors flex items-center space-x-1.5 cursor-pointer shadow-md"
                >
                  <Plus size={16} />
                  <span>Adicionar Jogador</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB: IMPORTAR DA CAMPANHA */}
          {activeTab === 'import' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-secondary">
                  Selecione os personagens já criados nesta campanha para importar automaticamente:
                </p>
                {availableCharacters.length > 0 && (
                  <button
                    type="button"
                    onClick={toggleSelectAllChars}
                    className="text-xs text-accent hover:underline font-medium cursor-pointer"
                  >
                    {selectedCharIds.length === availableCharacters.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
                  </button>
                )}
              </div>

              {availableCharacters.length === 0 ? (
                <div className="text-center py-8 text-muted italic bg-surface-elevated/40 rounded-xl border border-border-subtle">
                  Nenhum personagem cadastrado nesta campanha ainda. Adicione personagens na aba "Characters" ou cadastre manualmente.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto custom-scrollbar p-1">
                  {availableCharacters.map(char => {
                    const isSelected = selectedCharIds.includes(char.id);
                    return (
                      <div
                        key={char.id}
                        onClick={() => {
                          setSelectedCharIds(prev => 
                            isSelected ? prev.filter(id => id !== char.id) : [...prev, char.id]
                          );
                        }}
                        className={`p-3 rounded-xl border flex items-center space-x-3 cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-blue-500/15 border-blue-500 shadow-sm'
                            : 'bg-surface-elevated/60 border-border-subtle hover:border-border-hover'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded flex items-center justify-center border shrink-0 ${
                          isSelected ? 'bg-blue-500 border-blue-500 text-white' : 'border-border-default'
                        }`}>
                          {isSelected && <Check size={12} />}
                        </div>

                        {char.image_url ? (
                          <img src={char.image_url} alt={char.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-surface-hover flex items-center justify-center text-muted shrink-0">
                            <Users size={18} />
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <h5 className="font-bold text-sm text-heading truncate">{char.name}</h5>
                          <p className="text-xs text-muted truncate">{char.race || 'Personagem'} {char.status && `• ${char.status}`}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="pt-3 flex justify-end space-x-3 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-surface-elevated hover:bg-surface-hover text-secondary hover:text-heading rounded-lg text-sm transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmImportChars}
                  disabled={selectedCharIds.length === 0}
                  className={`px-5 py-2 disabled:opacity-40 disabled:cursor-not-allowed text-sm rounded-lg transition-colors flex items-center space-x-1.5 cursor-pointer shadow-md ${
                    isCyber
                      ? 'bg-[#00ffff] hover:bg-[#00d8d8] text-black font-mono font-bold shadow-[0_0_15px_rgba(0,255,255,0.3)] border border-[#00ffff]'
                      : isVamp
                      ? 'bg-[#8b0000] hover:bg-[#b00000] text-white font-serif font-bold border border-[#ff3333]/40'
                      : isMed
                      ? 'bg-[#8b4513] hover:bg-[#a0522d] text-[#f4eacc] font-serif font-bold border border-[#5c2e0b]'
                      : 'bg-accent hover:bg-accent-hover text-white font-bold'
                  }`}
                >
                  <Plus size={16} />
                  <span>Importar {selectedCharIds.length > 0 ? `(${selectedCharIds.length})` : ''}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
