import React, { useState } from 'react';
import { Users, Map as MapIcon, Book, Sun, Moon, Sword, Plus, ArrowLeft, Trash2, Play } from 'lucide-react';

import { useCampaigns } from './hooks/useCampaigns';
import { useEntities } from './hooks/useEntities';
import { useTheme } from './context/ThemeContext';

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
  const { campaigns, selectedCampaign, setSelectedCampaign, createCampaign, deleteCampaign } = useCampaigns();
  const { characters, locations, entries, loadEntities, crud } = useEntities();
  const { theme, setTheme } = useTheme();

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

  const lastOpenedIdStr = localStorage.getItem('lastOpenedCampaignId');
  const lastOpenedId = lastOpenedIdStr ? parseInt(lastOpenedIdStr, 10) : null;
  const lastOpenedCampaign = campaigns.find(c => c.id === lastOpenedId) || (campaigns.length > 0 ? campaigns[campaigns.length - 1] : null);

  const handleSelectCampaign = async (camp: any) => {
    localStorage.setItem('lastOpenedCampaignId', camp.id.toString());
    setSelectedCampaign(camp);
    await loadEntities(camp.id);
  };

  const handleDeleteCampaign = async (id: number, name: string) => {
    if (window.confirm(`Você tem certeza que deseja excluir a campanha "${name}"? Esta ação é irreversível e excluirá todo o conteúdo associado.`)) {
      try {
        await deleteCampaign(id);
      } catch (error) {
        console.error('Error deleting campaign:', error);
      }
    }
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
    <div 
      className="flex h-screen w-full p-1 sm:p-3 md:p-6 lg:p-10 overflow-hidden relative" 
      style={{ background: 'linear-gradient(to bottom right, #3b2314, #1a0e08)' }}
    >
      {/* Background ambient corner shadow */}
      <div className="absolute inset-0 shadow-[inset_0_0_120px_rgba(0,0,0,0.9)] pointer-events-none" />
      {/* Decorative Leather Stitching */}
      <div className="absolute inset-[3px] sm:inset-2 md:inset-4 lg:inset-8 border-2 border-[#a87a41] border-dashed rounded-lg opacity-30 pointer-events-none shadow-[0_0_2px_#000]" />
      
      {/* Open Journal "Pages" Container */}
      <div className="flex w-full h-full bg-surface-app text-primary font-sans overflow-hidden relative rounded-r-xl rounded-l-md shadow-[10px_10px_40px_rgba(0,0,0,0.8)] border border-[#8c6b3e]/30 z-10">
        {/* Spine/Binding shadow on the left edge */}
        <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-black/60 via-black/20 to-transparent pointer-events-none z-[60]" />
        
        <div className="flex-1 flex flex-col w-full h-full relative">
          {!selectedCampaign ? (
        <main className="flex-1 flex flex-col bg-surface-app overflow-y-auto w-full">
          <header className="px-8 py-6 border-b border-border-default flex items-center justify-between bg-surface-app z-10 sticky top-0">
            <div className="flex items-center space-x-3">
              <span className="text-accent-text text-3xl tracking-widest select-none flex items-center justify-center">☽☉☾</span>
              <h1 className="text-2xl font-bold tracking-wider">REQUIEM</h1>
            </div>
            
            <div className="flex p-1 bg-surface-deep rounded border border-border-subtle">
              <button
                onClick={() => setTheme('light')}
                className={`w-10 h-8 flex items-center justify-center rounded transition-colors ${theme === 'light' ? 'bg-surface-hover text-yellow-500 shadow-sm' : 'text-faint hover:text-secondary'}`}
                title="Light Mode"
              ><Sun size={16} /></button>
              <button
                onClick={() => setTheme('dark')}
                className={`w-10 h-8 flex items-center justify-center rounded transition-colors ${theme === 'dark' ? 'bg-surface-hover text-accent-text shadow-sm' : 'text-faint hover:text-secondary'}`}
                title="Dark Mode"
              ><Moon size={16} /></button>
              <button
                onClick={() => setTheme('medieval')}
                className={`w-10 h-8 flex items-center justify-center rounded transition-colors ${theme === 'medieval' ? 'bg-surface-hover text-amber-500 shadow-sm' : 'text-faint hover:text-secondary'}`}
                title="Medieval Mode"
              ><Sword size={16} /></button>
            </div>
          </header>

          <div className="p-8 max-w-7xl mx-auto w-full">
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold text-heading">
                  {theme === 'medieval' ? 'Your Lore' : 'Campaign Dashboard'}
                </h2>
                <p className="text-muted mt-2">Select a campaign or create a new one to begin your journey.</p>
              </div>
              {lastOpenedCampaign && (
                <button
                  onClick={() => handleSelectCampaign(lastOpenedCampaign)}
                  className="flex items-center space-x-2 px-5 py-2.5 rounded-lg bg-surface-elevated border border-border-subtle hover:border-accent text-muted hover:text-accent-text transition-all shadow-sm"
                  title="Resume Last Campaign"
                >
                  <Play size={18} className="text-accent2-text" />
                  <span className="font-semibold whitespace-nowrap">Resume: {lastOpenedCampaign.name}</span>
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Cards Grid */}
              <button 
                onClick={() => setShowCreateModal(true)}
                className="h-48 rounded-xl border-2 border-dashed border-border-default flex flex-col items-center justify-center text-muted hover:text-accent-text hover:border-accent hover:bg-surface-hover transition-all group"
              >
                <Plus size={36} className="mb-4 text-accent2-text group-hover:text-accent-text transition-colors" />
                <span className="text-lg font-semibold border-b border-transparent group-hover:border-accent-text transition-colors">Start New Campaign</span>
              </button>

              {campaigns.map(camp => (
                <div
                  key={camp.id}
                  onClick={() => handleSelectCampaign(camp)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleSelectCampaign(camp);
                    }
                  }}
                  className="h-48 text-left rounded-xl bg-surface-elevated border border-border-subtle p-6 flex flex-col justify-between hover:shadow-lg hover:border-accent transition-all hover:-translate-y-1 relative overflow-hidden group cursor-pointer"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent to-surface-hover opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  
                  {/* Delete Button */}
                  <div className="absolute top-4 right-4 z-10 transition-opacity opacity-0 group-hover:opacity-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCampaign(camp.id, camp.name);
                      }}
                      className="p-1.5 text-muted hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                      title="Excluir Campanha"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="relative pointer-events-none">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-accent-text text-2xl select-none flex items-center justify-center">☽☉☾</span>
                      <h3 className="text-xl font-bold text-heading truncate pr-8">{camp.name}</h3>
                    </div>
                    {camp.genre && <span className="inline-block mt-2 px-2 py-1 bg-surface-deep text-xs text-secondary rounded uppercase tracking-wide">{camp.genre}</span>}
                  </div>
                  
                  <div className="relative flex justify-between items-end text-sm text-faint border-t border-border-subtle pt-4 mt-auto pointer-events-none">
                    <span>{camp.system || 'Unknown System'}</span>
                    <span className="group-hover:text-accent-text transition-colors font-semibold">Enter &rarr;</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      ) : (
        <main className="flex-1 flex flex-col h-full z-0 w-full overflow-hidden bg-surface-app">
          {/* Header */}
          <header className="px-8 py-4 border-b border-border-subtle bg-surface-elevated flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <button 
                onClick={() => setSelectedCampaign(null)}
                className="text-muted hover:text-heading flex items-center space-x-2 transition-colors pr-6 border-r border-border-subtle"
              >
                <ArrowLeft size={20} />
                <span>Dashboard</span>
              </button>
              <div>
                <h2 className="text-2xl font-bold text-heading tracking-wide flex items-center space-x-2"><span className="text-accent-text text-xl mr-2 select-none">☽☉☾</span> {selectedCampaign.name}</h2>
                <div className="flex space-x-4 text-xs text-muted mt-1">
                  {selectedCampaign.genre && <span>Genre: <span className="text-secondary">{selectedCampaign.genre}</span></span>}
                  {selectedCampaign.system && <span>System: <span className="text-secondary">{selectedCampaign.system}</span></span>}
                </div>
              </div>
            </div>
            
            <div className="flex p-0.5 bg-surface-deep rounded border border-border-subtle scale-90 origin-right">
              <button
                onClick={() => setTheme('light')}
                className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${theme === 'light' ? 'bg-surface-hover text-yellow-500 shadow-sm' : 'text-faint hover:text-secondary'}`}
                title="Light Mode"
              ><Sun size={14} /></button>
              <button
                onClick={() => setTheme('dark')}
                className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${theme === 'dark' ? 'bg-surface-hover text-accent-text shadow-sm' : 'text-faint hover:text-secondary'}`}
                title="Dark Mode"
              ><Moon size={14} /></button>
              <button
                onClick={() => setTheme('medieval')}
                className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${theme === 'medieval' ? 'bg-surface-hover text-amber-500 shadow-sm' : 'text-faint hover:text-secondary'}`}
                title="Medieval Mode"
              ><Sword size={14} /></button>
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
        </main>
      )}

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
      </div>
    </div>
  );
}

export default App;
