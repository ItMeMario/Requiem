import { useState, useCallback } from 'react';

export const useEntities = () => {
  const [characters, setCharacters] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [entries, setEntries] = useState<any[]>([]);

  const loadEntities = useCallback(async (campaignId: number) => {
    if ((window as any).api) {
      try {
        const chars = await (window as any).api.getCharacters(campaignId);
        setCharacters(chars);
        const locs = await (window as any).api.getLocations(campaignId);
        setLocations(locs);
        const ents = await (window as any).api.getEntries(campaignId);
        setEntries(ents);
      } catch (error) {
         console.error('Error loading entities for campaign:', error);
      }
    }
  }, []);

  // CRUD Character
  const addCharacter = (char: any) => setCharacters(prev => [...prev, char]);
  const editCharacter = (id: number, char: any) => setCharacters(prev => prev.map(c => c.id === id ? { ...char, id } : c));
  const removeCharacter = (id: number) => setCharacters(prev => prev.filter(c => c.id !== id));

  // CRUD Location
  const addLocation = (loc: any) => setLocations(prev => [...prev, loc]);
  const editLocation = (id: number, loc: any) => setLocations(prev => prev.map(l => l.id === id ? { ...loc, id } : l));
  const removeLocation = (id: number) => setLocations(prev => prev.filter(l => l.id !== id));

  // CRUD Entry
  const addEntry = (entry: any) => setEntries(prev => [entry, ...prev]);
  const editEntry = (id: number, entry: any) => setEntries(prev => prev.map(e => e.id === id ? { ...entry, id } : e));
  const removeEntry = (id: number) => setEntries(prev => prev.filter(e => e.id !== id));

  return {
    characters,
    locations,
    entries,
    loadEntities,
    crud: {
      addCharacter, editCharacter, removeCharacter,
      addLocation, editLocation, removeLocation,
      addEntry, editEntry, removeEntry
    }
  };
};
