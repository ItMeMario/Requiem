import { useState, useEffect, useMemo, useCallback } from 'react';
import { Combatant, CombatGroup, BattleHistoryItem, CombatantType, SavedEncounter } from '../../types/battle';
import { sortCombatants, computeCombatGroups, rollD20, parseAcString, parseHpString } from '../../utils/battleUtils';
import { battleStorageService } from '../../services/battleStorageService';

interface UseBattleHelperProps {
  campaignId: number | null;
}

export function useBattleHelper({ campaignId }: UseBattleHelperProps) {
  const [combatants, setCombatants] = useState<Combatant[]>([]);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [round, setRound] = useState<number>(1);
  const [currentGroupIndex, setCurrentGroupIndex] = useState<number>(0);
  const [activeCombatantId, setActiveCombatantId] = useState<string | null>(null);
  const [history, setHistory] = useState<BattleHistoryItem[]>([]);
  const [savedEncounters, setSavedEncounters] = useState<SavedEncounter[]>([]);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Carrega estado e presets salvos ao montar ou trocar de campanha
  useEffect(() => {
    let isMounted = true;
    setIsLoaded(false);

    const load = async () => {
      try {
        const [state, encounters] = await Promise.all([
          battleStorageService.loadBattleState(campaignId),
          battleStorageService.getSavedEncounters(campaignId)
        ]);

        if (!isMounted) return;

        if (state) {
          setCombatants(state.combatants || []);
          setIsActive(Boolean(state.isActive));
          setRound(typeof state.round === 'number' ? state.round : 1);
          setCurrentGroupIndex(typeof state.currentGroupIndex === 'number' ? state.currentGroupIndex : 0);
          setActiveCombatantId(state.activeCombatantId || null);
          setHistory(state.history || []);
        } else {
          setCombatants([]);
          setIsActive(false);
          setRound(1);
          setCurrentGroupIndex(0);
          setActiveCombatantId(null);
          setHistory([]);
        }

        setSavedEncounters(encounters || []);
      } catch (e) {
        console.error('[Requiem Battle] Failed to load battle state from local storage:', e);
      } finally {
        if (isMounted) {
          setIsLoaded(true);
        }
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [campaignId]);

  // Salva automaticamente o estado com debounce de 400ms após carregamento inicial
  useEffect(() => {
    if (!isLoaded) return;

    const timer = setTimeout(() => {
      const stateToSave = {
        combatants,
        isActive,
        round,
        currentGroupIndex,
        activeCombatantId,
        history
      };

      battleStorageService.saveBattleState(campaignId, stateToSave).catch(err => {
        console.error('[Requiem Battle] Failed to autosave battle state:', err);
      });
    }, 400);

    return () => clearTimeout(timer);
  }, [campaignId, isLoaded, combatants, isActive, round, currentGroupIndex, activeCombatantId, history]);

  // Histórico de Ações
  const addHistoryLog = useCallback((message: string, type: BattleHistoryItem['type'] = 'info') => {
    const item: BattleHistoryItem = {
      id: `hist-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      round,
      message,
      type
    };
    setHistory(prev => [item, ...prev].slice(0, 50)); // Guarda os últimos 50 eventos
  }, [round]);

  // Fila ordenada e Agrupamentos dinâmicos
  const sortedCombatants = useMemo(() => {
    return sortCombatants(combatants);
  }, [combatants]);

  const groups = useMemo(() => {
    return computeCombatGroups(sortedCombatants);
  }, [sortedCombatants]);

  // Grupo e Combatente ativos
  const currentGroup = useMemo(() => {
    if (groups.length === 0) return null;
    const safeIndex = Math.min(Math.max(0, currentGroupIndex), groups.length - 1);
    return groups[safeIndex] || null;
  }, [groups, currentGroupIndex]);

  const activeCombatant = useMemo(() => {
    if (!currentGroup || currentGroup.combatants.length === 0) return null;
    if (activeCombatantId) {
      const found = currentGroup.combatants.find(c => c.id === activeCombatantId);
      if (found) return found;
    }
    return currentGroup.combatants[0];
  }, [currentGroup, activeCombatantId]);

  // Sincroniza activeCombatantId caso mude de grupo
  useEffect(() => {
    if (currentGroup && currentGroup.combatants.length > 0) {
      if (!activeCombatantId || !currentGroup.combatants.some(c => c.id === activeCombatantId)) {
        setActiveCombatantId(currentGroup.combatants[0].id);
      }
    } else {
      setActiveCombatantId(null);
    }
  }, [currentGroup, activeCombatantId]);

  // Resumos estatísticos
  const stats = useMemo(() => {
    const players = combatants.filter(c => c.type === 'player');
    const enemies = combatants.filter(c => c.type === 'enemy');
    return {
      totalAllies: players.length,
      aliveAllies: players.filter(c => c.currentHp > 0).length,
      totalEnemies: enemies.length,
      aliveEnemies: enemies.filter(c => c.currentHp > 0).length,
      totalCombatants: combatants.length
    };
  }, [combatants]);

  // Adicionar combatente individual
  const addCombatant = useCallback((data: Omit<Combatant, 'id'>) => {
    const newCombatant: Combatant = {
      ...data,
      id: `cbt-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      conditions: data.conditions || [],
      initiative: data.initiative || 0,
      currentHp: data.currentHp !== undefined ? data.currentHp : (data.maxHp || 10),
      maxHp: data.maxHp || 10
    };

    setCombatants(prev => [...prev, newCombatant]);
    addHistoryLog(`Combatente "${newCombatant.name}" adicionado (${newCombatant.type === 'player' ? 'Aliado' : 'Inimigo'}).`, 'info');
  }, [addHistoryLog]);

  // Atualizar combatente
  const updateCombatant = useCallback((id: string, updates: Partial<Combatant>) => {
    setCombatants(prev => prev.map(c => {
      if (c.id !== id) return c;
      const updated = { ...c, ...updates };

      // Se maxHp foi atualizado sem currentHp explícito e o combatente estava com vida cheia
      if (updates.maxHp !== undefined && updates.currentHp === undefined && c.currentHp === c.maxHp) {
        updated.currentHp = updates.maxHp;
      }

      // Atualiza status dead de acordo com o HP
      const currentHp = updated.currentHp;
      const isDead = currentHp <= 0;
      let conditions = [...updated.conditions];
      if (isDead && !conditions.includes('dead')) {
        conditions.push('dead');
      } else if (!isDead && conditions.includes('dead')) {
        conditions = conditions.filter(cond => cond !== 'dead');
      }
      updated.conditions = conditions;

      return updated;
    }));
  }, []);

  // Remover combatente
  const removeCombatant = useCallback((id: string) => {
    const target = combatants.find(c => c.id === id);
    setCombatants(prev => prev.filter(c => c.id !== id));
    if (target) {
      addHistoryLog(`Combatente "${target.name}" removido do combate.`, 'info');
    }
  }, [combatants, addHistoryLog]);

  // Duplicar combatente (útil para inimigos / lacaios)
  const duplicateCombatant = useCallback((id: string) => {
    const target = combatants.find(c => c.id === id);
    if (!target) return;

    // Acha nome base e numeração
    const baseName = target.name.replace(/\s+\d+$/, '');
    const existingCount = combatants.filter(c => c.name.startsWith(baseName)).length;
    const newName = `${baseName} ${existingCount + 1}`;

    const duplicated: Combatant = {
      ...target,
      id: `cbt-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      name: newName,
      currentHp: target.maxHp, // Inicia com vida cheia
      conditions: []
    };

    setCombatants(prev => [...prev, duplicated]);
    addHistoryLog(`Inimigo duplicado: "${newName}".`, 'info');
  }, [combatants, addHistoryLog]);

  // Importar personagens da campanha
  const importCharacters = useCallback((charsToImport: any[], defaultHp: number = 20) => {
    const newCombatants: Combatant[] = charsToImport.map(char => {
      const charHp = char.maxHp || char.customHp || char.hp || defaultHp;
      const parsedHp = typeof charHp === 'number' ? charHp : (parseInt(charHp, 10) || defaultHp);
      return {
        id: `cbt-char-${char.id}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        name: char.name,
        type: 'player',
        currentHp: parsedHp,
        maxHp: parsedHp,
        initiative: 0,
        conditions: [],
        sourceCharacterId: char.id,
        avatarUrl: char.image_url || undefined,
        notes: `${char.race || ''} ${char.status || ''}`.trim()
      };
    });

    setCombatants(prev => [...prev, ...newCombatants]);
    addHistoryLog(`${newCombatants.length} personagem(ns) importado(s) da campanha.`, 'info');
  }, [addHistoryLog]);

  // Importar monstro do Bestiário
  const importMonster = useCallback((monster: any, count: number = 1) => {
    const parsedHp = parseHpString(monster['Hit Points']);
    const parsedAc = parseAcString(monster['Armor Class']);
    const dexMod = parseInt(monster.DEX_mod?.replace(/[()+-]/g, '') || '0', 10) || 0;

    const newMonsters: Combatant[] = [];
    for (let i = 0; i < count; i++) {
      const name = count > 1 ? `${monster.name} ${i + 1}` : monster.name;
      newMonsters.push({
        id: `cbt-mon-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 4)}`,
        name,
        type: 'enemy',
        currentHp: parsedHp,
        maxHp: parsedHp,
        armorClass: parsedAc,
        initiative: 0,
        initiativeModifier: dexMod,
        conditions: [],
        sourceMonsterName: monster.name,
        avatarUrl: monster.img_url || undefined,
        notes: `CR ${monster.Challenge || '?'}, AC ${parsedAc}, HP ${parsedHp}`
      });
    }

    setCombatants(prev => [...prev, ...newMonsters]);
    addHistoryLog(`${count}x "${monster.name}" adicionado(s) a partir do Bestiário (AC: ${parsedAc}, HP: ${parsedHp}).`, 'info');
  }, [addHistoryLog]);

  // Controle de Vida (Dano / Cura)
  const adjustHp = useCallback((id: string, delta: number) => {
    setCombatants(prev => prev.map(c => {
      if (c.id !== id) return c;
      const newHp = Math.max(0, Math.min(c.maxHp * 2, c.currentHp + delta));
      const isDead = newHp === 0;
      
      let conditions = [...c.conditions];
      if (isDead && !conditions.includes('dead')) {
        conditions.push('dead');
      } else if (!isDead && conditions.includes('dead')) {
        conditions = conditions.filter(cond => cond !== 'dead');
      }

      const actionText = delta < 0 ? `sofreu ${Math.abs(delta)} de dano` : `recuperou ${delta} HP`;
      addHistoryLog(`${c.name} ${actionText} (${newHp}/${c.maxHp} HP).`, delta < 0 ? 'damage' : 'heal');

      return {
        ...c,
        currentHp: newHp,
        conditions
      };
    }));
  }, [addHistoryLog]);

  // Toggle de Condição/Status
  const toggleCondition = useCallback((id: string, conditionId: string) => {
    setCombatants(prev => prev.map(c => {
      if (c.id !== id) return c;
      const exists = c.conditions.includes(conditionId);
      const conditions = exists
        ? c.conditions.filter(cond => cond !== conditionId)
        : [...c.conditions, conditionId];
      
      addHistoryLog(`${c.name} ${exists ? 'removeu' : 'recebeu'} a condição "${conditionId}".`, 'status');
      return { ...c, conditions };
    }));
  }, [addHistoryLog]);

  // Rolagem de Iniciativa
  const rollInitiative = useCallback((id: string, d20Roll?: number) => {
    setCombatants(prev => prev.map(c => {
      if (c.id !== id) return c;
      const roll = d20Roll !== undefined ? d20Roll : rollD20(c.initiativeModifier || 0);
      addHistoryLog(`${c.name} rolou Iniciativa: ${roll}.`, 'info');
      return { ...c, initiative: roll };
    }));
  }, [addHistoryLog]);

  // Rolar iniciativa para todos os combatentes
  const rollAllInitiatives = useCallback(() => {
    setCombatants(prev => prev.map(c => {
      const roll = rollD20(c.initiativeModifier || 0);
      return { ...c, initiative: roll };
    }));
    addHistoryLog('Iniciativa rolada automaticamente para todos os combatentes.', 'info');
  }, [addHistoryLog]);

  // Controles de Combate (Iniciar, Avançar, Retroceder, Encerrar, Limpar)
  const startCombat = useCallback(() => {
    if (combatants.length === 0) return;
    setIsActive(true);
    setRound(1);
    setCurrentGroupIndex(0);
    if (groups.length > 0 && groups[0].combatants.length > 0) {
      setActiveCombatantId(groups[0].combatants[0].id);
    }
    addHistoryLog('⚔️ Combate iniciado! Rodada 1.', 'round');
  }, [combatants.length, groups, addHistoryLog]);

  const nextTurn = useCallback(() => {
    if (groups.length === 0) return;

    if (currentGroupIndex >= groups.length - 1) {
      // Fim da rodada -> Avança para próxima rodada
      setRound(prev => {
        const nextRound = prev + 1;
        addHistoryLog(`⚔️ Rodada ${nextRound} iniciada!`, 'round');
        return nextRound;
      });
      setCurrentGroupIndex(0);
      if (groups[0] && groups[0].combatants.length > 0) {
        setActiveCombatantId(groups[0].combatants[0].id);
      }
    } else {
      const nextIndex = currentGroupIndex + 1;
      setCurrentGroupIndex(nextIndex);
      const nextGrp = groups[nextIndex];
      if (nextGrp && nextGrp.combatants.length > 0) {
        setActiveCombatantId(nextGrp.combatants[0].id);
        const groupLabel = nextGrp.isSharedTurn ? `(Ação em Grupo: ${nextGrp.combatants.map(c => c.name).join(', ')})` : nextGrp.combatants[0].name;
        addHistoryLog(`Turno avançado para ${nextGrp.type === 'player' ? 'os Aliados' : 'os Inimigos'}: ${groupLabel}.`, 'turn');
      }
    }
  }, [groups, currentGroupIndex, addHistoryLog]);

  const prevTurn = useCallback(() => {
    if (groups.length === 0) return;

    if (currentGroupIndex <= 0) {
      if (round > 1) {
        setRound(prev => prev - 1);
        const lastIndex = groups.length - 1;
        setCurrentGroupIndex(lastIndex);
        if (groups[lastIndex]?.combatants.length > 0) {
          setActiveCombatantId(groups[lastIndex].combatants[0].id);
        }
      }
    } else {
      const prevIndex = currentGroupIndex - 1;
      setCurrentGroupIndex(prevIndex);
      if (groups[prevIndex]?.combatants.length > 0) {
        setActiveCombatantId(groups[prevIndex].combatants[0].id);
      }
    }
  }, [groups, currentGroupIndex, round]);

  const endCombat = useCallback(() => {
    setIsActive(false);
    setRound(1);
    setCurrentGroupIndex(0);
    setActiveCombatantId(null);
    addHistoryLog('🏁 Combate finalizado.', 'info');
  }, [addHistoryLog]);

  const resetCombat = useCallback(() => {
    setIsActive(false);
    setRound(1);
    setCurrentGroupIndex(0);
    setActiveCombatantId(null);
    setCombatants(prev => prev.map(c => ({ ...c, initiative: 0 })));
    addHistoryLog('Combate reiniciado (iniciativas zeradas).', 'info');
  }, [addHistoryLog]);

  const clearAll = useCallback(() => {
    setCombatants([]);
    setIsActive(false);
    setRound(1);
    setCurrentGroupIndex(0);
    setActiveCombatantId(null);
    setHistory([]);
    battleStorageService.clearBattleState(campaignId).catch(e => {
      console.error('[Requiem Battle] Error clearing battle state from storage:', e);
    });
  }, [campaignId]);

  // === GERENCIAMENTO DE ENCONTROS SALVOS / PRESETS LOCAIS ===

  const saveCurrentAsEncounter = useCallback(async (name: string, description?: string) => {
    const saved = await battleStorageService.saveEncounter(campaignId, {
      name: name.trim() || 'Encontro Sem Nome',
      description: description?.trim() || undefined,
      combatants,
      round
    });

    setSavedEncounters(prev => [saved, ...prev.filter(e => e.id !== saved.id)]);
    addHistoryLog(`💾 Encontro "${saved.name}" salvo na biblioteca local.`, 'info');
    return saved;
  }, [campaignId, combatants, round, addHistoryLog]);

  const loadEncounter = useCallback((encounter: SavedEncounter, mode: 'replace' | 'merge' = 'replace') => {
    if (mode === 'replace') {
      setCombatants(encounter.combatants || []);
      setIsActive(false);
      setRound(encounter.round || 1);
      setCurrentGroupIndex(0);
      setActiveCombatantId(null);
      addHistoryLog(`📂 Encontro "${encounter.name}" carregado na arena de combate.`, 'info');
    } else {
      // No modo merge, geramos novos IDs únicos para evitar colisões
      const merged = (encounter.combatants || []).map(c => ({
        ...c,
        id: `cbt-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`
      }));
      setCombatants(prev => [...prev, ...merged]);
      addHistoryLog(`📂 ${merged.length} combatente(s) do encontro "${encounter.name}" adicionados à arena.`, 'info');
    }
  }, [addHistoryLog]);

  const deleteEncounter = useCallback(async (encounterId: string) => {
    await battleStorageService.deleteSavedEncounter(campaignId, encounterId);
    setSavedEncounters(prev => prev.filter(e => e.id !== encounterId));
    addHistoryLog('Encontro salvo removido dos presets locais.', 'info');
  }, [campaignId, addHistoryLog]);

  const exportBattleAsJson = useCallback(() => {
    return battleStorageService.exportToJson({
      combatants,
      isActive,
      round,
      currentGroupIndex,
      activeCombatantId,
      history
    });
  }, [combatants, isActive, round, currentGroupIndex, activeCombatantId, history]);

  const importBattleFromJson = useCallback((jsonStr: string, mode: 'replace' | 'merge' = 'replace') => {
    const imported = battleStorageService.importFromJson(jsonStr);
    if (!imported || !imported.combatants || imported.combatants.length === 0) {
      return false;
    }

    if (mode === 'replace') {
      setCombatants(imported.combatants);
      setIsActive(false);
      setRound(1);
      setCurrentGroupIndex(0);
      setActiveCombatantId(null);
      addHistoryLog(`📥 Combate importado com sucesso (${imported.combatants.length} combatentes).`, 'info');
    } else {
      const merged = imported.combatants.map(c => ({
        ...c,
        id: `cbt-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`
      }));
      setCombatants(prev => [...prev, ...merged]);
      addHistoryLog(`📥 ${merged.length} combatente(s) mesclados a partir do JSON importado.`, 'info');
    }

    return true;
  }, [addHistoryLog]);

  return {
    combatants,
    sortedCombatants,
    groups,
    currentGroup,
    currentGroupIndex,
    activeCombatant,
    activeCombatantId,
    setActiveCombatantId,
    isActive,
    round,
    stats,
    history,
    savedEncounters,
    isLoaded,
    // Ações
    addCombatant,
    updateCombatant,
    removeCombatant,
    duplicateCombatant,
    importCharacters,
    importMonster,
    adjustHp,
    toggleCondition,
    rollInitiative,
    rollAllInitiatives,
    startCombat,
    endCombat,
    resetCombat,
    nextTurn,
    prevTurn,
    clearAll,
    // Encontros Salvos & Backup
    saveCurrentAsEncounter,
    loadEncounter,
    deleteEncounter,
    exportBattleAsJson,
    importBattleFromJson
  };
}
