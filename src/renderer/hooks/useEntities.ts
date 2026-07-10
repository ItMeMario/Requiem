import { useState, useEffect, useCallback } from 'react';
import { getDataService } from '../services';

export const useEntities = (campaignId: number | null) => {
  const [characters, setCharacters] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [entries, setEntries] = useState<any[]>([]);
  const service = getDataService();

  useEffect(() => {
    if (campaignId === null) {
      setCharacters([]);
      setLocations([]);
      setEntries([]);
      return;
    }

    // Subscribe to Characters
    const unsubChars = service.subscribeCharacters
      ? service.subscribeCharacters(campaignId, setCharacters)
      : (() => {
          let active = true;
          service.getCharacters(campaignId).then(data => { if (active) setCharacters(data); });
          return () => { active = false; };
        })();

    // Subscribe to Locations
    const unsubLocs = service.subscribeLocations
      ? service.subscribeLocations(campaignId, setLocations)
      : (() => {
          let active = true;
          service.getLocations(campaignId).then(data => { if (active) setLocations(data); });
          return () => { active = false; };
        })();

    // Subscribe to Entries
    const unsubEntries = service.subscribeEntries
      ? service.subscribeEntries(campaignId, setEntries)
      : (() => {
          let active = true;
          service.getEntries(campaignId).then(data => { if (active) setEntries(data); });
          return () => { active = false; };
        })();

    return () => {
      unsubChars();
      unsubLocs();
      unsubEntries();
    };
  }, [campaignId]);

  const loadEntities = useCallback(async (id: number) => {
    // Sincronização em tempo real cuida disso de forma declarativa.
  }, []);

  // CRUD Character
  const addCharacter = (char: any) => {
    if (!service.subscribeCharacters) {
      setCharacters(prev => [...prev, char]);
    }
  };
  const editCharacter = (id: number, char: any) => {
    if (!service.subscribeCharacters) {
      setCharacters(prev => prev.map(c => c.id === id ? { ...char, id } : c));
    }
  };
  const removeCharacter = (id: number) => {
    if (!service.subscribeCharacters) {
      setCharacters(prev => prev.filter(c => c.id !== id));
    }
  };

  // CRUD Location
  const addLocation = (loc: any) => {
    if (!service.subscribeLocations) {
      setLocations(prev => [...prev, loc]);
    }
  };
  const editLocation = (id: number, loc: any) => {
    if (!service.subscribeLocations) {
      setLocations(prev => prev.map(l => l.id === id ? { ...loc, id } : l));
    }
  };
  const removeLocation = (id: number) => {
    if (!service.subscribeLocations) {
      setLocations(prev => prev.filter(l => l.id !== id));
    }
  };

  // CRUD Entry
  const addEntry = (entry: any) => {
    if (!service.subscribeEntries) {
      setEntries(prev => [entry, ...prev]);
    }
  };
  const editEntry = (id: number, entry: any) => {
    if (!service.subscribeEntries) {
      setEntries(prev => prev.map(e => e.id === id ? { ...entry, id } : e));
    }
  };
  const removeEntry = (id: number) => {
    if (!service.subscribeEntries) {
      setEntries(prev => prev.filter(e => e.id !== id));
    }
  };

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
