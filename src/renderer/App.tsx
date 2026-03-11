import React, { useEffect, useState } from 'react';
import { Database, Folder, Users, Map as MapIcon, Plus, X, User, Image as ImageIcon, Edit2, Trash2, Book } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const InputField = ({ label, value, onChange, placeholder = '' }: any) => (
  <div>
    <label className="block text-sm text-gray-400 mb-1">{label}</label>
    <input 
      type="text" 
      value={value}
      onChange={onChange}
      className="w-full bg-gray-950 border border-gray-800 text-white rounded p-2 focus:outline-none focus:border-purple-500"
      placeholder={placeholder}
    />
  </div>
);

const TextAreaField = ({ label, value, onChange, placeholder = '' }: any) => (
  <div>
    <label className="block text-sm text-gray-400 mb-1">{label}</label>
    <textarea 
      value={value}
      onChange={onChange}
      className="w-full bg-gray-950 border border-gray-800 text-white rounded p-2 focus:outline-none focus:border-purple-500 min-h-[80px]"
      placeholder={placeholder}
    />
  </div>
);

function App() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCampaign, setNewCampaign] = useState({ name: '', genre: '', system: '' });

  const [selectedCampaign, setSelectedCampaign] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'characters' | 'locations' | 'journal'>('characters');

  const [characters, setCharacters] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [entries, setEntries] = useState<any[]>([]);

  const [showCharModal, setShowCharModal] = useState(false);
  const [showLocModal, setShowLocModal] = useState(false);
  const [showEntryModal, setShowEntryModal] = useState(false);

  // Editing state
  const [editingCharId, setEditingCharId] = useState<number | null>(null);
  const [editingLocId, setEditingLocId] = useState<number | null>(null);
  const [editingEntryId, setEditingEntryId] = useState<number | null>(null);

  // Forms
  const initCharState = { name: '', race: '', status: '', age: '', faction: '', lore: '', bonds: '', personal_notes: '', image_url: '' };
  const initLocState = { name: '', region: '', type: '', description: '', lore: '', present_npcs: '', atmosphere: '', image_url: '' };
  const initEntryState = { title: '', content: '' };

  const [newChar, setNewChar] = useState(initCharState);
  const [newLoc, setNewLoc] = useState(initLocState);
  const [newEntry, setNewEntry] = useState(initEntryState);

  useEffect(() => {
    if ((window as any).api) {
      const fetchCampaigns = async () => {
        try {
          const data = await (window as any).api.getCampaigns();
          setCampaigns(data);
        } catch (error) {
          console.error('Error fetching campaigns:', error);
        }
      };
      fetchCampaigns();
    }
  }, []);

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaign.name.trim()) return;
    try {
      if ((window as any).api) {
        const id = await (window as any).api.createCampaign(newCampaign);
        const camp = { id, ...newCampaign };
        setCampaigns([...campaigns, camp]);
        setShowCreateModal(false);
        setNewCampaign({ name: '', genre: '', system: '' });
        handleSelectCampaign(camp);
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
    }
  };

  const handleSelectCampaign = async (camp: any) => {
    setSelectedCampaign(camp);
    if ((window as any).api) {
      const chars = await (window as any).api.getCharacters(camp.id);
      setCharacters(chars);
      const locs = await (window as any).api.getLocations(camp.id);
      setLocations(locs);
      const ents = await (window as any).api.getEntries(camp.id);
      setEntries(ents);
    }
  };

  const handleCreateChar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChar.name.trim() || !selectedCampaign) return;
    try {
      const data = { ...newChar, campaign_id: selectedCampaign.id };
      if (editingCharId !== null) {
        await (window as any).api.updateCharacter(editingCharId, data);
        setCharacters(characters.map(c => c.id === editingCharId ? { ...data, id: editingCharId } : c));
      } else {
        const id = await (window as any).api.createCharacter(data);
        setCharacters([...characters, { id, ...data }]);
      }
      setShowCharModal(false);
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
        setCharacters(characters.filter(c => c.id !== id));
      } catch (error) {
        console.error('Error deleting character:', error);
      }
    }
  };

  const handleCreateLoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLoc.name.trim() || !selectedCampaign) return;
    try {
      const data = { ...newLoc, campaign_id: selectedCampaign.id };
      if (editingLocId !== null) {
        await (window as any).api.updateLocation(editingLocId, data);
        setLocations(locations.map(l => l.id === editingLocId ? { ...data, id: editingLocId } : l));
      } else {
        const id = await (window as any).api.createLocation(data);
        setLocations([...locations, { id, ...data }]);
      }
      setShowLocModal(false);
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
        setLocations(locations.filter(l => l.id !== id));
      } catch (error) {
        console.error('Error deleting location:', error);
      }
    }
  };

  const handleCreateEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntry.title.trim() || !selectedCampaign) return;
    try {
      const isEditing = editingEntryId !== null;
      const data = {
        campaign_id: selectedCampaign.id,
        title: newEntry.title,
        content: newEntry.content,
        creation_date: isEditing ? entries.find(e => e.id === editingEntryId)?.creation_date : new Date().toISOString()
      };
      
      if (isEditing) {
        await (window as any).api.updateEntry(editingEntryId, data);
        setEntries(entries.map(e => e.id === editingEntryId ? { ...data, id: editingEntryId } : e));
      } else {
        const id = await (window as any).api.createEntry(data);
        setEntries([{ id, ...data }, ...entries]);
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
    setShowEntryModal(true);
  };

  const handleDeleteEntry = async (id: number) => {
    if (confirm('Are you sure you want to delete this entry?')) {
      try {
        await (window as any).api.deleteEntry(id);
        setEntries(entries.filter(e => e.id !== id));
      } catch (error) {
        console.error('Error deleting entry:', error);
      }
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-950 text-gray-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col z-10">
        <div className="p-4 border-b border-gray-800 flex items-center space-x-2">
          <Database className="text-purple-500" />
          <h1 className="text-xl font-bold tracking-wider">REQUIEM</h1>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          <div className="text-xs uppercase text-gray-500 font-semibold mb-2 tracking-wider">Campaigns</div>
          {campaigns.length === 0 ? (
            <div className="text-sm text-gray-400 italic">No campaigns yet.</div>
          ) : (
            campaigns.map(camp => (
              <button 
                key={camp.id} 
                onClick={() => handleSelectCampaign(camp)}
                className={`w-full text-left flex items-center space-x-2 p-2 rounded transition-colors ${selectedCampaign?.id === camp.id ? 'bg-purple-900/50 text-white' : 'hover:bg-gray-800 text-gray-300'}`}
              >
                <Folder size={18} className={selectedCampaign?.id === camp.id ? "text-purple-400" : "text-blue-400"} />
                <span className="truncate">{camp.name}</span>
              </button>
            ))
          )}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button 
            onClick={() => setShowCreateModal(true)}
            className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded p-2 transition-all shadow-lg"
          >
            <Plus size={18} />
            <span>New Campaign</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col bg-[#0a0a0c] overflow-hidden relative">
        {!selectedCampaign ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="text-center space-y-6 max-w-lg">
              <div className="flex justify-center space-x-4 text-purple-500 mb-8 animate-pulse">
                <Users size={48} />
                <MapIcon size={48} />
                <Folder size={48} />
              </div>
              <h2 className="text-4xl font-bold tracking-tight text-white mb-4 drop-shadow-lg">Welcome to Requiem</h2>
              <p className="text-gray-400 text-lg leading-relaxed">
                Your ultimate desktop tool for managing tabletop RPG campaigns, characters, locations, and lore entries.
              </p>
              <div className="pt-8">
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg shadow-[0_0_15px_rgba(147,51,234,0.5)] transition-all transform hover:scale-105 active:scale-95"
                >
                  Create Your First Campaign
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col h-full z-0">
            {/* Header */}
            <header className="px-8 py-6 border-b border-gray-800/50 bg-gray-900/30 backdrop-blur-sm">
              <h2 className="text-3xl font-bold text-white tracking-wide">{selectedCampaign.name}</h2>
              <div className="flex space-x-4 text-sm text-gray-400 mt-2">
                {selectedCampaign.genre && <span>Genre: <span className="text-gray-300">{selectedCampaign.genre}</span></span>}
                {selectedCampaign.system && <span>System: <span className="text-gray-300">{selectedCampaign.system}</span></span>}
              </div>
            </header>

            {/* Tabs */}
            <div className="flex px-8 border-b border-gray-800/50 bg-gray-900/20">
              <button 
                onClick={() => setActiveTab('characters')}
                className={`flex items-center space-x-2 py-3 px-4 border-b-2 transition-colors ${activeTab === 'characters' ? 'border-purple-500 text-purple-400' : 'border-transparent text-gray-400 hover:text-white'}`}
              >
                <Users size={18} />
                <span>Characters</span>
              </button>
              <button 
                onClick={() => setActiveTab('locations')}
                className={`flex items-center space-x-2 py-3 px-4 border-b-2 transition-colors ${activeTab === 'locations' ? 'border-purple-500 text-purple-400' : 'border-transparent text-gray-400 hover:text-white'}`}
              >
                <MapIcon size={18} />
                <span>Locations</span>
              </button>
              <button 
                onClick={() => setActiveTab('journal')}
                className={`flex items-center space-x-2 py-3 px-4 border-b-2 transition-colors ${activeTab === 'journal' ? 'border-purple-500 text-purple-400' : 'border-transparent text-gray-400 hover:text-white'}`}
              >
                <Book size={18} />
                <span>Journal</span>
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-8">
              {activeTab === 'characters' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-gray-200">Characters</h3>
                    <button 
                      onClick={() => {
                        setEditingCharId(null);
                        setNewChar(initCharState);
                        setShowCharModal(true);
                      }}
                      className="flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm text-white transition-colors border border-gray-700"
                    >
                      <Plus size={16} />
                      <span>Add Character</span>
                    </button>
                  </div>
                  
                  {characters.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 italic bg-gray-900/20 rounded-lg border border-gray-800/50">
                      No characters added yet.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {characters.map(char => (
                        <div key={char.id} className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden hover:border-gray-700 transition-colors group relative">
                          <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            <button onClick={() => handleEditChar(char)} className="p-1.5 bg-gray-900/80 hover:bg-purple-600 rounded text-gray-300 hover:text-white backdrop-blur-sm transition-colors">
                              <Edit2 size={16} />
                            </button>
                            <button onClick={() => handleDeleteChar(char.id)} className="p-1.5 bg-gray-900/80 hover:bg-red-600 rounded text-gray-300 hover:text-white backdrop-blur-sm transition-colors">
                              <Trash2 size={16} />
                            </button>
                          </div>
                          {char.image_url ? (
                            <div className="h-48 w-full bg-gray-800 overflow-hidden relative">
                              <img src={char.image_url} alt={char.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
                            </div>
                          ) : (
                            <div className="h-40 w-full bg-gray-800/50 flex items-center justify-center relative">
                              <User size={48} className="text-gray-700" />
                              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
                            </div>
                          )}
                          <div className={`p-4 ${char.image_url ? 'relative -mt-12' : ''}`}>
                            <h4 className={`text-lg font-bold ${char.image_url ? 'text-white drop-shadow-md' : 'text-gray-100'}`}>{char.name}</h4>
                            <div className="text-sm text-purple-400 mb-2 font-medium">{char.race} {char.status && `• ${char.status}`}</div>
                            <div className="space-y-1 text-sm text-gray-400">
                              {char.faction && <div><span className="text-gray-500">Faction:</span> {char.faction}</div>}
                              {char.age && <div><span className="text-gray-500">Age:</span> {char.age}</div>}
                            </div>
                            {char.lore && (
                              <p className="mt-3 text-sm text-gray-300 line-clamp-2">
                                {char.lore}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'locations' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-gray-200">Locations</h3>
                    <button 
                      onClick={() => {
                        setEditingLocId(null);
                        setNewLoc(initLocState);
                        setShowLocModal(true);
                      }}
                      className="flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm text-white transition-colors border border-gray-700"
                    >
                      <Plus size={16} />
                      <span>Add Location</span>
                    </button>
                  </div>
                  
                  {locations.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 italic bg-gray-900/20 rounded-lg border border-gray-800/50">
                      No locations added yet.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {locations.map(loc => (
                        <div key={loc.id} className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden flex flex-col sm:flex-row hover:border-gray-700 transition-colors group relative">
                          <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            <button onClick={() => handleEditLoc(loc)} className="p-1.5 bg-gray-900/80 hover:bg-blue-600 rounded text-gray-300 hover:text-white backdrop-blur-sm transition-colors">
                              <Edit2 size={16} />
                            </button>
                            <button onClick={() => handleDeleteLoc(loc.id)} className="p-1.5 bg-gray-900/80 hover:bg-red-600 rounded text-gray-300 hover:text-white backdrop-blur-sm transition-colors">
                              <Trash2 size={16} />
                            </button>
                          </div>
                          <div className="sm:w-1/3 h-48 sm:h-auto bg-gray-800/50 relative">
                            {loc.image_url ? (
                              <img src={loc.image_url} alt={loc.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <MapIcon size={32} className="text-gray-700" />
                              </div>
                            )}
                          </div>
                          <div className="p-5 sm:w-2/3 flex flex-col">
                            <h4 className="text-xl font-bold text-blue-100">{loc.name}</h4>
                            <div className="text-sm text-blue-400 mb-3">{loc.region} {loc.type && `• ${loc.type}`}</div>
                            {loc.description && (
                              <p className="text-sm text-gray-300 flex-1 line-clamp-3 mb-2">{loc.description}</p>
                            )}
                            {(loc.atmosphere || loc.present_npcs) && (
                              <div className="mt-auto text-xs text-gray-500 space-y-1">
                                {loc.atmosphere && <div><span className="font-semibold text-gray-400">Atmosphere:</span> {loc.atmosphere}</div>}
                                {loc.present_npcs && <div><span className="font-semibold text-gray-400">NPCs:</span> {loc.present_npcs}</div>}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'journal' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-gray-200">Journal Entries</h3>
                    <button 
                      onClick={() => {
                        setEditingEntryId(null);
                        setNewEntry(initEntryState);
                        setShowEntryModal(true);
                      }}
                      className="flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm text-white transition-colors border border-gray-700"
                    >
                      <Plus size={16} />
                      <span>New Entry</span>
                    </button>
                  </div>
                  
                  {entries.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 italic bg-gray-900/20 rounded-lg border border-gray-800/50">
                      No diary entries written yet. Begin your adventure.
                    </div>
                  ) : (
                    <div className="flex flex-col space-y-4">
                      {entries.map(entry => (
                        <div key={entry.id} className="bg-gray-900 border border-gray-800 rounded-lg p-5 hover:border-gray-700 transition-colors group relative">
                          <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            <button onClick={() => handleEditEntry(entry)} className="p-1.5 bg-gray-800 hover:bg-purple-600 rounded text-gray-300 hover:text-white transition-colors">
                              <Edit2 size={16} />
                            </button>
                            <button onClick={() => handleDeleteEntry(entry.id)} className="p-1.5 bg-gray-800 hover:bg-red-600 rounded text-gray-300 hover:text-white transition-colors">
                              <Trash2 size={16} />
                            </button>
                          </div>
                          <h4 className="text-xl font-bold text-gray-100 mb-1">{entry.title}</h4>
                          <div className="text-xs text-purple-400 mb-4">{new Date(entry.creation_date).toLocaleString()}</div>
                          <div 
                            className="text-gray-300 quill-content line-clamp-3 overflow-hidden"
                            dangerouslySetInnerHTML={{ __html: entry.content }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* CREATE CAMPAIGN MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-md shadow-2xl relative">
            <button onClick={() => setShowCreateModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={20} /></button>
            <h3 className="text-xl font-bold text-white mb-6">New Campaign</h3>
            <form onSubmit={handleCreateCampaign} className="space-y-4">
              <InputField label="Name *" value={newCampaign.name} onChange={(e:any) => setNewCampaign({...newCampaign, name: e.target.value})} placeholder="The Lost Mines..." />
              <InputField label="Genre" value={newCampaign.genre} onChange={(e:any) => setNewCampaign({...newCampaign, genre: e.target.value})} placeholder="High Fantasy" />
              <InputField label="System" value={newCampaign.system} onChange={(e:any) => setNewCampaign({...newCampaign, system: e.target.value})} placeholder="D&D 5e" />
              <div className="pt-4 flex justify-end">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-gray-400 hover:text-white transition-colors mr-2">Cancel</button>
                <button type="submit" disabled={!newCampaign.name.trim()} className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded transition-colors disabled:opacity-50">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE CHARACTER MODAL */}
      {showCharModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
            <button onClick={() => setShowCharModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={20} /></button>
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><User className="text-purple-400"/> {editingCharId ? 'Edit Character' : 'New Character'}</h3>
            <form onSubmit={handleCreateChar} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Name *" value={newChar.name} onChange={(e:any) => setNewChar({...newChar, name: e.target.value})} />
                <InputField label="Race (Raça)" value={newChar.race} onChange={(e:any) => setNewChar({...newChar, race: e.target.value})} />
                <InputField label="Status" value={newChar.status} onChange={(e:any) => setNewChar({...newChar, status: e.target.value})} />
                <InputField label="Age (Idade)" value={newChar.age} onChange={(e:any) => setNewChar({...newChar, age: e.target.value})} />
                <InputField label="Faction (Facção)" value={newChar.faction} onChange={(e:any) => setNewChar({...newChar, faction: e.target.value})} />
                <InputField label="Image URL (Imagem)" value={newChar.image_url} onChange={(e:any) => setNewChar({...newChar, image_url: e.target.value})} placeholder="https://..." />
              </div>
              <TextAreaField label="Lore" value={newChar.lore} onChange={(e:any) => setNewChar({...newChar, lore: e.target.value})} />
              <TextAreaField label="Bonds (Vínculos)" value={newChar.bonds} onChange={(e:any) => setNewChar({...newChar, bonds: e.target.value})} />
              <TextAreaField label="Personal Notes (Notas pessoais)" value={newChar.personal_notes} onChange={(e:any) => setNewChar({...newChar, personal_notes: e.target.value})} />
              <div className="pt-4 flex justify-end sticky bottom-0 bg-gray-900 py-2 border-t border-gray-800 mt-4">
                <button type="button" onClick={() => setShowCharModal(false)} className="px-4 py-2 text-gray-400 hover:text-white transition-colors mr-2">Cancel</button>
                <button type="submit" disabled={!newChar.name.trim()} className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded transition-colors disabled:opacity-50">Save Character</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE LOCATION MODAL */}
      {showLocModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
            <button onClick={() => setShowLocModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={20} /></button>
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><MapIcon className="text-blue-400"/> {editingLocId ? 'Edit Location' : 'New Location'}</h3>
            <form onSubmit={handleCreateLoc} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Name *" value={newLoc.name} onChange={(e:any) => setNewLoc({...newLoc, name: e.target.value})} />
                <InputField label="Region (Região)" value={newLoc.region} onChange={(e:any) => setNewLoc({...newLoc, region: e.target.value})} />
                <InputField label="Type (Tipo)" value={newLoc.type} onChange={(e:any) => setNewLoc({...newLoc, type: e.target.value})} />
                <InputField label="Image URL (Imagem)" value={newLoc.image_url} onChange={(e:any) => setNewLoc({...newLoc, image_url: e.target.value})} placeholder="https://..." />
              </div>
              <TextAreaField label="Description (Descrição)" value={newLoc.description} onChange={(e:any) => setNewLoc({...newLoc, description: e.target.value})} />
              <TextAreaField label="Lore" value={newLoc.lore} onChange={(e:any) => setNewLoc({...newLoc, lore: e.target.value})} />
              <TextAreaField label="Present NPCs (NPCs Presentes)" value={newLoc.present_npcs} onChange={(e:any) => setNewLoc({...newLoc, present_npcs: e.target.value})} />
              <TextAreaField label="Atmosphere (Ambientação)" value={newLoc.atmosphere} onChange={(e:any) => setNewLoc({...newLoc, atmosphere: e.target.value})} />
              <div className="pt-4 flex justify-end sticky bottom-0 bg-gray-900 py-2 border-t border-gray-800 mt-4">
                <button type="button" onClick={() => setShowLocModal(false)} className="px-4 py-2 text-gray-400 hover:text-white transition-colors mr-2">Cancel</button>
                <button type="submit" disabled={!newLoc.name.trim()} className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded transition-colors disabled:opacity-50">Save Location</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE ENTRY MODAL */}
      {showEntryModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-6xl shadow-2xl relative h-[90vh] flex flex-col overflow-hidden">
            <button onClick={() => setShowEntryModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white z-20"><X size={20} /></button>
            <div className="p-6 border-b border-gray-800 flex-shrink-0">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Book className="text-purple-400"/> {editingEntryId ? 'Edit Journal Entry' : 'New Journal Entry'}
              </h3>
            </div>
            
            <div className="flex-1 flex overflow-hidden">
              {/* Left Column: Editor */}
              <div className="flex-1 flex flex-col p-6 overflow-y-auto custom-scrollbar border-r border-gray-800 bg-[#0a0a0c]">
                <form id="entry-form" onSubmit={handleCreateEntry} className="flex-1 flex flex-col space-y-4">
                  <InputField label="Title *" value={newEntry.title} onChange={(e:any) => setNewEntry({...newEntry, title: e.target.value})} placeholder="Day 1: The Journey Begins..." />
                  
                  <div className="flex-1 flex flex-col min-h-[400px]">
                    <label className="block text-sm text-gray-400 mb-1">Content</label>
                    <div className="flex-1 bg-white text-black rounded-lg overflow-hidden flex flex-col">
                      <ReactQuill 
                        theme="snow"
                        value={newEntry.content}
                        onChange={(val) => setNewEntry({...newEntry, content: val})}
                        className="flex-1 h-full flex flex-col [&_.ql-container]:flex-1 [&_.ql-editor]:h-full"
                      />
                    </div>
                  </div>
                </form>
              </div>

              {/* Right Column: References Sidebar */}
              <div className="w-80 bg-gray-900 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-gray-800 bg-gray-900/80 sticky top-0 z-10 backdrop-blur">
                  <h4 className="font-semibold text-gray-200">References</h4>
                  <p className="text-xs text-gray-400 mt-1">Check characters and locations while writing.</p>
                </div>
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-6">
                  <div>
                    <h5 className="text-sm font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2 border-b border-gray-800 pb-2 mb-3">
                      <Users size={14} /> Characters
                    </h5>
                    {characters.length === 0 ? (
                      <div className="text-xs text-gray-500 italic">No characters yet.</div>
                    ) : (
                      <ul className="space-y-2">
                        {characters.map(c => (
                          <li key={c.id} className="text-sm">
                            <span className="font-medium text-gray-300">{c.name}</span>
                            {c.race && <span className="text-xs text-gray-500 ml-1"> ({c.race})</span>}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  
                  <div>
                    <h5 className="text-sm font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2 border-b border-gray-800 pb-2 mb-3">
                      <MapIcon size={14} /> Locations
                    </h5>
                    {locations.length === 0 ? (
                      <div className="text-xs text-gray-500 italic">No locations yet.</div>
                    ) : (
                      <ul className="space-y-2">
                        {locations.map(l => (
                          <li key={l.id} className="text-sm">
                            <span className="font-medium text-gray-300">{l.name}</span>
                            {l.type && <span className="text-xs text-gray-500 ml-1"> ({l.type})</span>}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-800 flex justify-end bg-gray-900 flex-shrink-0">
              <button type="button" onClick={() => setShowEntryModal(false)} className="px-4 py-2 text-gray-400 hover:text-white transition-colors mr-2">Cancel</button>
              <button type="submit" form="entry-form" disabled={!newEntry.title.trim()} className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium rounded transition-colors disabled:opacity-50">Save Entry</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
