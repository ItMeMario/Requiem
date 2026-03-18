import React, { useState } from 'react';
import { Users, Map as MapIcon, Folder, Book } from 'lucide-react';

import { useCampaigns } from './hooks/useCampaigns';
import { useEntities } from './hooks/useEntities';

import { Sidebar } from './components/Sidebar';
import { CharacterList } from './components/characters/CharacterList';
import { LocationList } from './components/locations/LocationList';
import { JournalList } from './components/journal/JournalList';

import { CreateCampaignModal } from './components/modals/CreateCampaignModal';
import { CharacterModal } from './components/modals/CharacterModal';
import { LocationModal } from './components/modals/LocationModal';
import { EntryModal } from './components/modals/EntryModal';
import { DiaryEntry } from './components/DiaryEntry';

const initCharState = { name: '', race: '', status: '', age: '', faction: '', lore: '', bonds: '', personal_notes: '', image_url: '' };
const initLocState = { name: '', region: '', type: '', description: '', lore: '', present_npcs: '', atmosphere: '', image_url: '' };
const initEntryState = { title: '', content: '' };

function App() {
  const { campaigns, selectedCampaign, setSelectedCampaign, createCampaign } = useCampaigns();
  const { characters, locations, entries, loadEntities, crud } = useEntities();

  const [hasOpenedDiary, setHasOpenedDiary] = useState(false);
  const [activeTab, setActiveTab] = useState<'characters' | 'locations' | 'journal'>('characters');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCampaign, setNewCampaign] = useState({ name: '', genre: '', system: '' });

  const [showCharModal, setShowCharModal] = useState(false);
  const [showLocModal, setShowLocModal] = useState(false);
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [isViewingEntry, setIsViewingEntry] = useState(false);

  const [editingCharId, setEditingCharId] = useState<number | null>(null);
  const [editingLocId, setEditingLocId] = useState<number | null>(null);
  const [editingEntryId, setEditingEntryId] = useState<number | null>(null);
  const [returnToJournalEntryId, setReturnToJournalEntryId] = useState<number | null>(null);

  const [newChar, setNewChar] = useState(initCharState);
  const [newLoc, setNewLoc] = useState(initLocState);
  const [newEntry, setNewEntry] = useState(initEntryState);

  const handleSelectCampaign = async (camp: any) => {
    setSelectedCampaign(camp);
    await loadEntities(camp.id);
  };

  const handleCreateCampaignWrapper = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaign.name.trim()) return;
    const camp = await createCampaign(newCampaign);
    setShowCreateModal(false);
    setNewCampaign({ name: '', genre: '', system: '' });
    if (camp) handleSelectCampaign(camp);
  };

  // --- Character Handlers ---
  const handleCreateChar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChar.name.trim() || !selectedCampaign) return;
    try {
      const data = { ...newChar, campaign_id: selectedCampaign.id };
      if (editingCharId !== null) {
        await (window as any).api.updateCharacter(editingCharId, data);
        crud.editCharacter(editingCharId, data);
      } else {
        const id = await (window as any).api.createCharacter(data);
        crud.addCharacter({ id, ...data });
      }
      handleCloseCharModal();
      setEditingCharId(null);
      setNewChar(initCharState);
    } catch (error) {
      console.error('Error saving character:', error);
    }
  };

  const handleEditChar = (char: any) => {
    setEditingCharId(char.id);
    setNewChar(char);
    setShowCharModal(true);
  };

  const handleDeleteChar = async (id: number) => {
    if (confirm('Are you sure you want to delete this character?')) {
      try {
        await (window as any).api.deleteCharacter(id);
        crud.removeCharacter(id);
      } catch (error) {
        console.error('Error deleting character:', error);
      }
    }
  };

  const handleCloseCharModal = () => {
    setShowCharModal(false);
    if (returnToJournalEntryId !== null) {
      setActiveTab('journal');
      setShowEntryModal(true);
      setReturnToJournalEntryId(null);
    }
  };

  const openNewCharModal = () => {
    setEditingCharId(null);
    setNewChar(initCharState);
    setShowCharModal(true);
  };

  // --- Location Handlers ---
  const handleCreateLoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLoc.name.trim() || !selectedCampaign) return;
    try {
      const data = { ...newLoc, campaign_id: selectedCampaign.id };
      if (editingLocId !== null) {
        await (window as any).api.updateLocation(editingLocId, data);
        crud.editLocation(editingLocId, data);
      } else {
        const id = await (window as any).api.createLocation(data);
        crud.addLocation({ id, ...data });
      }
      handleCloseLocModal();
      setEditingLocId(null);
      setNewLoc(initLocState);
    } catch (error) {
      console.error('Error saving location:', error);
    }
  };

  const handleEditLoc = (loc: any) => {
    setEditingLocId(loc.id);
    setNewLoc(loc);
    setShowLocModal(true);
  };

  const handleDeleteLoc = async (id: number) => {
    if (confirm('Are you sure you want to delete this location?')) {
      try {
        await (window as any).api.deleteLocation(id);
        crud.removeLocation(id);
      } catch (error) {
        console.error('Error deleting location:', error);
      }
    }
  };

  const handleCloseLocModal = () => {
    setShowLocModal(false);
    if (returnToJournalEntryId !== null) {
      setActiveTab('journal');
      setShowEntryModal(true);
      setReturnToJournalEntryId(null);
    }
  };

  const openNewLocModal = () => {
    setEditingLocId(null);
    setNewLoc(initLocState);
    setShowLocModal(true);
  };

  // --- Entry Handlers ---
  const handleCreateEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntry.title.trim() || !selectedCampaign) return;
    try {
      const isEditing = editingEntryId !== null;
      const data = {
        campaign_id: selectedCampaign.id,
        title: newEntry.title,
        content: newEntry.content,
        creation_date: isEditing ? entries.find(evt => evt.id === editingEntryId)?.creation_date : new Date().toISOString()
      };
      
      if (isEditing) {
        await (window as any).api.updateEntry(editingEntryId, data);
        crud.editEntry(editingEntryId, data);
      } else {
        const id = await (window as any).api.createEntry(data);
        crud.addEntry({ id, ...data });
      }
      setShowEntryModal(false);
      setEditingEntryId(null);
      setNewEntry(initEntryState);
    } catch (error) {
      console.error('Error saving entry:', error);
    }
  };

  const handleEditEntry = (entry: any) => {
    setEditingEntryId(entry.id);
    setNewEntry({ title: entry.title, content: entry.content });
    setIsViewingEntry(false);
    setShowEntryModal(true);
  };
  
  const handleViewEntry = (entry: any) => {
    setEditingEntryId(entry.id);
    setNewEntry({ title: entry.title, content: entry.content });
    setIsViewingEntry(true);
    setShowEntryModal(true);
  };

  const handleDeleteEntry = async (id: number) => {
    if (confirm('Are you sure you want to delete this entry?')) {
      try {
        await (window as any).api.deleteEntry(id);
        crud.removeEntry(id);
        if (editingEntryId === id) {
          setShowEntryModal(false);
        }
      } catch (error) {
        console.error('Error deleting entry:', error);
      }
    }
  };

  const openNewEntryModal = () => {
    setEditingEntryId(null);
    setNewEntry(initEntryState);
    setIsViewingEntry(false);
    setShowEntryModal(true);
  };

  // --- External Navigation (Mentions) ---
  const handleMentionClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains('entity-mention')) {
      const type = target.getAttribute('data-type');
      const id = Number(target.getAttribute('data-id'));
      
      if (type === 'character') {
        const char = characters.find(c => c.id === id);
        if (char) {
          setReturnToJournalEntryId(editingEntryId);
          setShowEntryModal(false);
          setActiveTab('characters');
          handleEditChar(char);
        }
      } else if (type === 'location') {
        const loc = locations.find(l => l.id === id);
        if (loc) {
          setReturnToJournalEntryId(editingEntryId);
          setShowEntryModal(false);
          setActiveTab('locations');
          handleEditLoc(loc);
        }
      }
    }
  };

  if (!hasOpenedDiary) {
    return <DiaryEntry onOpen={() => setHasOpenedDiary(true)} />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-surface-app text-primary font-sans">
      <Sidebar 
        campaigns={campaigns} 
        handleSelectCampaign={handleSelectCampaign} 
        selectedCampaign={selectedCampaign} 
        setShowCreateModal={setShowCreateModal} 
      />

      <main className="flex-1 flex flex-col bg-surface-app overflow-hidden relative">
        {!selectedCampaign ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="text-center space-y-6 max-w-lg">
              <div className="flex justify-center space-x-4 text-accent-text mb-8 animate-pulse">
                <Users size={48} />
                <MapIcon size={48} />
                <Folder size={48} />
              </div>
              <h2 className="text-4xl font-bold tracking-tight text-heading mb-4 drop-shadow-lg">Welcome to Requiem</h2>
              <p className="text-muted text-lg leading-relaxed">
                Your ultimate desktop tool for managing tabletop RPG campaigns, characters, locations, and lore entries.
              </p>
              <div className="pt-8">
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="px-8 py-3 bg-accent hover:bg-accent-hover text-heading font-semibold rounded-lg shadow-[0_0_15px_var(--accent-glow)] transition-all transform hover:scale-105 active:scale-95"
                >
                  Create Your First Campaign
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col h-full z-0">
            {/* Header */}
            <header className="px-8 py-6 border-b border-border-subtle bg-surface-elevated backdrop-blur-sm">
              <h2 className="text-3xl font-bold text-heading tracking-wide">{selectedCampaign.name}</h2>
              <div className="flex space-x-4 text-sm text-muted mt-2">
                {selectedCampaign.genre && <span>Genre: <span className="text-secondary">{selectedCampaign.genre}</span></span>}
                {selectedCampaign.system && <span>System: <span className="text-secondary">{selectedCampaign.system}</span></span>}
              </div>
            </header>

            {/* Tabs */}
            <div className="flex px-8 border-b border-border-subtle bg-surface-elevated2">
              <button 
                onClick={() => setActiveTab('characters')}
                className={`flex items-center space-x-2 py-3 px-4 border-b-2 transition-colors ${activeTab === 'characters' ? 'border-accent text-accent-text' : 'border-transparent text-muted hover:text-heading'}`}
              >
                <Users size={18} />
                <span>Characters</span>
              </button>
              <button 
                onClick={() => setActiveTab('locations')}
                className={`flex items-center space-x-2 py-3 px-4 border-b-2 transition-colors ${activeTab === 'locations' ? 'border-accent text-accent-text' : 'border-transparent text-muted hover:text-heading'}`}
              >
                <MapIcon size={18} />
                <span>Locations</span>
              </button>
              <button 
                onClick={() => setActiveTab('journal')}
                className={`flex items-center space-x-2 py-3 px-4 border-b-2 transition-colors ${activeTab === 'journal' ? 'border-accent text-accent-text' : 'border-transparent text-muted hover:text-heading'}`}
              >
                <Book size={18} />
                <span>Journal</span>
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-8">
              {activeTab === 'characters' && (
                <CharacterList 
                  characters={characters} 
                  handleDeleteChar={handleDeleteChar} 
                  handleEditChar={handleEditChar} 
                  openNewCharModal={openNewCharModal} 
                />
              )}
              {activeTab === 'locations' && (
                <LocationList 
                  locations={locations} 
                  handleDeleteLoc={handleDeleteLoc} 
                  handleEditLoc={handleEditLoc} 
                  openNewLocModal={openNewLocModal} 
                />
              )}
              {activeTab === 'journal' && (
                <JournalList 
                  entries={entries} 
                  characters={characters} 
                  locations={locations} 
                  handleDeleteEntry={handleDeleteEntry} 
                  handleEditEntry={handleEditEntry} 
                  handleViewEntry={handleViewEntry} 
                  openNewEntryModal={openNewEntryModal} 
                />
              )}
            </div>
          </div>
        )}
      </main>

      <CreateCampaignModal 
        showCreateModal={showCreateModal} 
        setShowCreateModal={setShowCreateModal} 
        newCampaign={newCampaign} 
        setNewCampaign={setNewCampaign} 
        handleCreateCampaign={handleCreateCampaignWrapper} 
      />

      <CharacterModal 
        showCharModal={showCharModal} 
        handleCloseCharModal={handleCloseCharModal} 
        editingCharId={editingCharId} 
        newChar={newChar} 
        setNewChar={setNewChar} 
        handleCreateChar={handleCreateChar} 
      />

      <LocationModal 
        showLocModal={showLocModal} 
        handleCloseLocModal={handleCloseLocModal} 
        editingLocId={editingLocId} 
        newLoc={newLoc} 
        setNewLoc={setNewLoc} 
        handleCreateLoc={handleCreateLoc} 
      />

      <EntryModal 
        showEntryModal={showEntryModal} 
        setShowEntryModal={setShowEntryModal} 
        isViewingEntry={isViewingEntry} 
        setIsViewingEntry={setIsViewingEntry} 
        editingEntryId={editingEntryId} 
        entries={entries} 
        newEntry={newEntry} 
        setNewEntry={setNewEntry} 
        handleCreateEntry={handleCreateEntry} 
        handleDeleteEntry={handleDeleteEntry} 
        handleMentionClick={handleMentionClick} 
        characters={characters} 
        locations={locations} 
      />

    </div>
  );
}

export default App;
