import React, { useState } from 'react';
import { Users, Map as MapIcon, Book, Plus, ArrowLeft, Trash2, Play } from 'lucide-react';

import { useCampaigns } from './hooks/useCampaigns';
import { useEntities } from './hooks/useEntities';
import { useTheme } from './context/ThemeContext';

import { ThemeSwitcher } from './components/ThemeSwitcher';
import { DatabaseControls } from './components/DatabaseControls';
import { MedievalLayout } from './themes/medieval/MedievalLayout';
import { CyberpunkLayout } from './themes/cyberpunk/CyberpunkLayout';
import { VampireLayout } from './themes/vampire/VampireLayout';
import { useIntroGate } from './hooks/useIntroGate';
import { getThemeLabels } from './utils/themeLabels';

import { CharacterList } from './components/characters/CharacterList';
import { LocationList } from './components/locations/LocationList';
import { JournalList } from './components/journal/JournalList';

import { CreateCampaignModal } from './components/modals/CreateCampaignModal';
import { CharacterModal } from './components/modals/CharacterModal';
import { LocationModal } from './components/modals/LocationModal';
import { EntryModal } from './components/modals/EntryModal';
import { MedievalIntro } from './themes/medieval/MedievalIntro';
import { CyberpunkIntro } from './themes/cyberpunk/CyberpunkIntro';
import { VampireIntro } from './themes/vampire/VampireIntro';
import { ConfirmDialog } from './resources/ConfirmDialog';

const initCharState = { name: '', race: '', status: '', age: '', faction: '', lore: '', bonds: '', personal_notes: '', image_url: '' };
const initLocState = { name: '', region: '', type: '', description: '', lore: '', present_npcs: '', atmosphere: '', image_url: '' };
const initEntryState = { title: '', content: '' };

function App() {
  const { campaigns, selectedCampaign, setSelectedCampaign, createCampaign, deleteCampaign } = useCampaigns();
  const { characters, locations, entries, loadEntities, crud } = useEntities();
  const { theme, setTheme } = useTheme();

  const { showIntro, dismissIntro } = useIntroGate();
  
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

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    onCancel: () => {}
  });

  const lastOpenedIdStr = localStorage.getItem('lastOpenedCampaignId');
  const lastOpenedId = lastOpenedIdStr ? parseInt(lastOpenedIdStr, 10) : null;
  const lastOpenedCampaign = campaigns.find(c => c.id === lastOpenedId) || (campaigns.length > 0 ? campaigns[campaigns.length - 1] : null);

  const handleSelectCampaign = async (camp: any) => {
    localStorage.setItem('lastOpenedCampaignId', camp.id.toString());
    setSelectedCampaign(camp);
    await loadEntities(camp.id);
  };

  const handleDeleteCampaign = async (id: number, name: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Confirm Deletion',
      message: `Você tem certeza que deseja excluir a campanha "${name}"?\nEsta ação é irreversível e excluirá todo o conteúdo associado.`,
      onConfirm: async () => {
        try {
          await deleteCampaign(id);
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        } catch (error) {
          console.error('Error deleting campaign:', error);
        }
      },
      onCancel: () => setConfirmDialog(prev => ({ ...prev, isOpen: false }))
    });
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
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Character',
      message: 'Are you sure you want to delete this character? This action cannot be undone.',
      onConfirm: async () => {
        try {
          await (window as any).api.deleteCharacter(id);
          crud.removeCharacter(id);
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        } catch (error) {
          console.error('Error deleting character:', error);
        }
      },
      onCancel: () => setConfirmDialog(prev => ({ ...prev, isOpen: false }))
    });
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
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Location',
      message: 'Are you sure you want to delete this location? This action cannot be undone.',
      onConfirm: async () => {
        try {
          await (window as any).api.deleteLocation(id);
          crud.removeLocation(id);
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        } catch (error) {
          console.error('Error deleting location:', error);
        }
      },
      onCancel: () => setConfirmDialog(prev => ({ ...prev, isOpen: false }))
    });
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
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Entry',
      message: 'Are you sure you want to delete this journal entry? This action cannot be undone.',
      onConfirm: async () => {
        try {
          await (window as any).api.deleteEntry(id);
          crud.removeEntry(id);
          if (editingEntryId === id) {
            setShowEntryModal(false);
          }
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        } catch (error) {
          console.error('Error deleting entry:', error);
        }
      },
      onCancel: () => setConfirmDialog(prev => ({ ...prev, isOpen: false }))
    });
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

  if (showIntro) {
    const IntroComponent = {
      medieval: MedievalIntro,
      cyberpunk: CyberpunkIntro,
      vampire: VampireIntro,
    }[theme as 'medieval' | 'cyberpunk' | 'vampire'];
    return <IntroComponent onOpen={dismissIntro} />;
  }

  const renderLayout = (children: React.ReactNode) => {
    const layoutProps = {
      lastOpenedCampaign: !selectedCampaign ? lastOpenedCampaign : null,
      handleSelectCampaign
    };
    if (theme === 'medieval') return <MedievalLayout {...layoutProps}>{children}</MedievalLayout>;
    if (theme === 'cyberpunk') return <CyberpunkLayout {...layoutProps}>{children}</CyberpunkLayout>;
    if (theme === 'vampire') return <VampireLayout {...layoutProps}>{children}</VampireLayout>;
    return (
      <div className="flex flex-col h-screen w-full overflow-hidden bg-surface-app text-primary font-sans relative">
        {children}
      </div>
    );
  };

  return (
    <>
      <ThemeSwitcher size="md" />
      <DatabaseControls />
      {renderLayout(
        <>
          {!selectedCampaign ? (
        <main className={`flex-1 flex flex-col overflow-y-auto w-full relative ${theme === 'medieval' ? 'text-primary' : theme === 'cyberpunk' ? 'bg-transparent' : theme === 'vampire' ? 'bg-transparent' : 'bg-surface-app'}`}>
          <header className={`px-8 py-6 border-b flex items-center justify-between z-10 ${theme === 'medieval' ? 'relative' : 'sticky top-0'} ${theme === 'cyberpunk' ? 'cyber-metallic-panel border-[#0ff]/50 shadow-[0_4px_20px_rgba(0,255,255,0.15)]' : theme === 'vampire' ? 'bg-[#08080b]/90 backdrop-blur-md border-[#1f1f2e] shadow-[0_4px_20px_rgba(0,0,0,0.4)]' : theme === 'medieval' ? 'border-[#d9c596]/40' : 'bg-surface-app border-border-default'}`}>
            {theme === 'medieval' ? (
              <div className="flex w-full items-center justify-center relative py-4">
                 <div className="flex flex-col w-full relative max-w-2xl mx-auto">
                    <div className="flex items-center justify-center mb-6">
                       <div className="flex-1 border-b-[3px] border-double border-[#8b4513]/40 mr-6 shadow-[0_1px_0_rgba(255,255,255,0.4)] relative">
                         <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full border border-[#8b4513]/60 bg-[#d9c596]"></div>
                       </div>
                       <Book size={32} className="text-[#8b4513] drop-shadow-[0_1px_1px_rgba(255,255,255,0.7)]" strokeWidth={1.5} />
                       <div className="flex-1 border-b-[3px] border-double border-[#8b4513]/40 ml-6 shadow-[0_1px_0_rgba(255,255,255,0.4)] relative">
                         <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full border border-[#8b4513]/60 bg-[#d9c596]"></div>
                       </div>
                    </div>
                    <div className="text-center">
                       <h2 className="text-4xl text-[#3e2723] mb-3 tracking-widest font-bold" style={{ fontFamily: '"Georgia", "Times New Roman", serif', textShadow: '1px 1px 0px rgba(255,255,255,0.8)' }}>
                          {getThemeLabels(theme).dashboardTitle}
                       </h2>
                       <p className="text-[#5c3a21] italic font-serif text-[17px] opacity-90 drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)]">
                          Select a campaign or create a new one to begin your journey...
                       </p>
                    </div>
                 </div>
              </div>
            ) : theme === 'vampire' ? (
              <div className="flex w-full items-center justify-center relative py-4">
                 <div className="flex flex-col w-full relative max-w-2xl mx-auto">
                    <div className="flex items-center justify-center mb-6">
                       <div className="flex-1 border-b border-solid border-[#8b0000]/40 mr-6 shadow-[0_1px_8px_rgba(255,0,0,0.4)] relative">
                         <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#8b0000] shadow-[0_0_5px_rgba(255,0,0,0.8)]"></div>
                       </div>
                       <span className="text-3xl text-[#8b0000] drop-shadow-[0_0_15px_rgba(255,0,0,0.8)] mx-2 tracking-[0.3em] font-serif select-none" style={{ textShadow: '0 0 10px rgba(255,0,0,0.8), 0 2px 4px rgba(0,0,0,1)' }}>☽☉☾</span>
                       <div className="flex-1 border-b border-solid border-[#8b0000]/40 ml-6 shadow-[0_1px_8px_rgba(255,0,0,0.4)] relative">
                         <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#8b0000] shadow-[0_0_5px_rgba(255,0,0,0.8)]"></div>
                       </div>
                    </div>
                    <div className="text-center">
                       <h2 className="text-4xl text-[#e0e0e0] mb-3 tracking-[0.2em] font-bold" style={{ fontFamily: '"Georgia", "Times New Roman", serif', textShadow: '0 0 15px rgba(255,0,0,0.6), 0 2px 4px rgba(0,0,0,0.9)' }}>
                          {getThemeLabels(theme).dashboardTitle}
                       </h2>
                       <p className="text-[#a0a0b0] italic font-serif text-[17px] opacity-80 drop-shadow-[0_1px_2px_rgba(0,0,0,1)]">
                          Select a bloodline or weave a new tale to begin your journey...
                       </p>
                    </div>
                 </div>
              </div>
            ) : theme === 'cyberpunk' ? (
              <div className="flex w-full items-center justify-center relative py-4">
                 <div className="flex flex-col w-full relative max-w-3xl mx-auto">
                    <div className="flex items-center justify-center mb-6 relative">
                       <div className="flex-1 flex items-center justify-end mr-6 opacity-80">
                         <div className="text-[10px] text-[#0ff]/50 tracking-[0.3em] mr-4 font-mono">SYS.OP: OPTIMAL</div>
                         <div className="h-[2px] w-full max-w-[120px] bg-gradient-to-l from-[#0ff] to-transparent shadow-[0_0_8px_#0ff]"></div>
                       </div>

                       <div className="relative flex items-center justify-center">
                         <span className="text-3xl text-[#0ff] drop-shadow-[0_0_10px_rgba(0,255,255,1)] mx-2 tracking-widest font-mono select-none text-cyan-glitch" data-text="[SYS]">
                           [SYS]
                         </span>
                         <div className="absolute -inset-2 border border-[#0ff]/30 rounded-sm animate-pulse pointer-events-none shadow-[inset_0_0_10px_rgba(0,255,255,0.2)]"></div>
                         <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-[#0ff] animate-ping"></div>
                       </div>

                       <div className="flex-1 flex items-center justify-start ml-6 opacity-80">
                         <div className="h-[2px] w-full max-w-[120px] bg-gradient-to-r from-[#0ff] to-transparent shadow-[0_0_8px_#0ff] mr-4"></div>
                         <div className="eeg-waveform">
                            {Array.from({ length: 12 }).map((_, i) => (
                              <div key={i} className="eeg-bar" style={{ animationDelay: `${i * 0.1}s` }} />
                            ))}
                         </div>
                       </div>
                    </div>
                    
                    <div className="text-center relative">
                       <h2 className="text-4xl text-[#0ff] mb-3 tracking-[0.3em] font-bold font-mono text-cyan-glitch uppercase" data-text={getThemeLabels(theme).dashboardTitle} style={{ textShadow: '0 0 10px rgba(0,255,255,0.6)' }}>
                          {getThemeLabels(theme).dashboardTitle}
                       </h2>
                       <div className="text-[#0ff]/70 font-mono text-[13px] tracking-[0.15em] uppercase flex items-center justify-center">
                          <span className="text-[#b400ff] mr-2 animate-pulse font-bold text-lg leading-none">&gt;</span> 
                          <span>Initialize neural link or establish new sequence_</span>
                       </div>
                    </div>
                    
                    <div className="absolute bottom-2 right-[-20px] flex flex-col items-end text-[#0ff]/40 text-[10px] font-mono tracking-widest pointer-events-none hidden lg:flex">
                      <span>NET.SEC: <span className="text-[#0ff] font-bold drop-shadow-[0_0_2px_#0ff]">SECURE</span></span>
                      <span>MEM.CAP: <span className="text-[#b400ff] font-bold drop-shadow-[0_0_2px_#b400ff]">84%</span></span>
                    </div>
                 </div>
              </div>
            ) : (
              <div className="flex w-full items-center justify-between">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center space-x-3 mb-1">
                    <span className="text-3xl tracking-widest select-none flex items-center justify-center text-accent-text" data-text="☽☉☾">☽☉☾</span>
                    <h1 className="text-2xl font-bold tracking-wider">REQUIEM</h1>
                  </div>
                  <h2 className="text-xl font-bold text-heading">
                    {getThemeLabels(theme).dashboardTitle}
                  </h2>
                  <p className="text-sm text-muted">Select a campaign or create a new one to begin your journey.</p>
                </div>
              </div>
            )}
          </header>

          <div className="p-8 max-w-6xl mx-auto w-full xl:px-12">
            
            {/* New Resume Campaign Featured Banner */}
            {lastOpenedCampaign && (
              <div 
                onClick={() => handleSelectCampaign(lastOpenedCampaign)}
                className={`w-full mb-12 rounded-xl group cursor-pointer relative overflow-hidden transition-all duration-300 ${
                  theme === 'cyberpunk' 
                    ? 'h-32 cyber-smoked-glass hover:shadow-[0_0_30px_rgba(0,255,255,0.3)] flex items-center' 
                    : theme === 'medieval'
                    ? 'h-32 bg-[#e8d8b0] border-2 border-[#8b4513]/60 hover:border-[#8b4513] shadow-[inset_0_2px_10px_rgba(139,69,19,0.2),0_5px_15px_rgba(0,0,0,0.3)] flex items-center relative'
                    : theme === 'vampire'
                    ? 'h-32 bg-[#0d0d12] border border-[#1f1f2e] hover:border-[#500000] hover:shadow-[0_5px_25px_rgba(80,0,0,0.5)] flex items-center relative'
                    : 'h-32 bg-surface-elevated border border-border-subtle hover:border-accent shadow-md flex items-center'
                }`}
              >
                {/* Theme-specific Background details */}
                {theme === 'cyberpunk' && (
                  <>
                     <div className="micro-circuit-pattern" />
                     <div className="absolute top-0 right-0 w-48 h-full bg-gradient-to-l from-[#0ff]/5 to-transparent pointer-events-none" />
                  </>
                )}
                {theme === 'medieval' && (
                  <>
                     <div className="absolute inset-0 opacity-40 mix-blend-multiply pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, transparent 20%, #8b4513 120%)' }} />
                     <div className="absolute inset-2 border border-[#8b4513] border-dashed opacity-30 pointer-events-none rounded" />
                  </>
                )}
                {theme === 'vampire' && (
                  <>
                     <div className="absolute inset-0 opacity-30 pointer-events-none mix-blend-overlay bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIi8+CjxwYXRoIGQ9Ik0wIDBMMCA0TDQgNEw0IDBaIiBmaWxsPSIjMDAwIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')]"/>
                     <div className="absolute top-0 right-0 w-48 h-full bg-gradient-to-l from-[#500000]/30 to-transparent pointer-events-none" />
                  </>
                )}

                {/* Content */}
                <div className="px-8 flex-1 flex justify-between items-center relative z-10 w-full h-full">
                  <div className="flex items-center space-x-6">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-lg ${
                       theme === 'cyberpunk' ? 'neon-ring-pulse bg-[#02050a] border-2 border-[#0ff] shadow-[0_0_15px_rgba(0,255,255,0.4)] z-10' :
                       theme === 'medieval' ? 'bg-[#8b4513] border border-[#5c2e0b]' :
                       theme === 'vampire' ? 'bg-[#0a0a0f] border-2 border-[#3d3d4a] group-hover:border-[#ff3333]' :
                       'bg-accent/10 border border-accent'
                    }`}>
                      <Play size={28} className={`${
                         theme === 'cyberpunk' ? 'text-[#0ff] group-hover:drop-shadow-[0_0_8px_rgba(0,255,255,1)] ml-1' :
                         theme === 'medieval' ? 'text-[#f4eacc] ml-1' :
                         theme === 'vampire' ? 'text-[#a0a0b0] group-hover:text-[#ff3333] ml-1 transition-colors' :
                         'text-accent-text ml-1'
                      }`} />
                    </div>
                    <div>
                      <h3 className={`text-sm uppercase tracking-widest font-bold mb-1 ${
                         theme === 'cyberpunk' ? 'text-[#0ff]/70' :
                         theme === 'medieval' ? 'text-[#8b4513]/70 font-serif' :
                         theme === 'vampire' ? 'text-[#606070] font-serif' :
                         'text-muted'
                      }`}>
                         RESUME JOURNEY
                      </h3>
                      <h2 className={`text-2xl md:text-3xl font-bold truncate ${
                         theme === 'cyberpunk' ? 'text-[#0ff] tracking-wider drop-shadow-[0_0_5px_rgba(0,255,255,0.5)] z-10' :
                         theme === 'medieval' ? 'text-[#3e2723] font-serif tracking-wide' :
                         theme === 'vampire' ? 'text-[#d1d1d6] font-serif tracking-widest group-hover:text-[#ff3333] transition-colors' :
                         'text-heading'
                      }`}>
                        {lastOpenedCampaign.name}
                      </h2>
                    </div>
                  </div>
                  
                  {/* Additional info or aesthetics on the right side */}
                  <div className={`hidden md:flex flex-col items-end ${
                       theme === 'cyberpunk' ? 'text-[#0ff]/50' :
                       theme === 'medieval' ? 'text-[#8b4513]/60 font-serif' :
                       theme === 'vampire' ? 'text-[#555566] font-serif' :
                       'text-muted'
                  }`}>
                    {lastOpenedCampaign.system && <span className="text-sm font-semibold tracking-wider uppercase mb-1">{lastOpenedCampaign.system}</span>}
                    {lastOpenedCampaign.genre && <span className="text-xs font-semibold">{lastOpenedCampaign.genre}</span>}
                  </div>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-x-24 md:gap-y-12">
              {/* Cards Grid */}
              {theme === 'cyberpunk' ? (
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="h-48 rounded-xl cyber-smoked-glass flex flex-col items-center justify-center text-[#0ff] hover:text-white hover:shadow-[0_0_30px_rgba(0,255,255,0.4)] transition-all group overflow-hidden relative"
                >
                  <div className="micro-circuit-pattern" />
                  
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    <div className="absolute w-36 h-36 border border-[#0ff]/10 rounded-full animate-[spin_20s_linear_infinite]" />
                    <div className="absolute w-24 h-24 border-[2px] border-dashed border-[#0ff]/30 rounded-full animate-[spin_10s_linear_infinite_reverse]" />
                    <div className="absolute w-12 h-12 bg-[#02050a] border border-[#0ff] rounded-full shadow-[0_0_15px_rgba(0,255,255,0.6)] flex items-center justify-center group-hover:scale-110 group-hover:border-[#b400ff] transition-all duration-300">
                      <div className="w-3 h-3 bg-[#0ff] group-hover:bg-[#b400ff] rounded-sm animate-pulse" />
                      <div className="absolute inset-0 rounded-full border border-[#0ff]/50 animate-ping" style={{ animationDuration: '3s' }} />
                    </div>
                  </div>

                  <span className="mt-28 text-sm font-bold tracking-widest z-20 bg-[#02050a]/80 backdrop-blur-md px-6 py-1.5 rounded-sm border border-[#0ff]/50 shadow-[0_0_10px_rgba(0,255,255,0.3)] group-hover:bg-[#0ff]/10 group-hover:border-[#0ff] transition-all">START NEW CAMPAIGN</span>
                </button>
              ) : theme === 'vampire' ? (
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="h-48 rounded-xl bg-[#0d0d12] border border-[#1f1f2e] flex flex-col items-center justify-center text-[#555566] hover:text-[#d1d1d6] hover:border-[#3d3d4a] hover:shadow-[0_0_20px_rgba(0,0,0,0.6)] transition-all group relative overflow-hidden"
                >
                  <Plus size={48} strokeWidth={1.5} className="mb-4 group-hover:scale-110 transition-transform drop-shadow-[0_0_8px_rgba(255,0,0,0.5)] z-10" />
                  <span className="text-sm font-bold tracking-widest font-serif z-10">FORGE BLOODLINE</span>
                </button>
              ) : theme === 'medieval' ? (
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="h-48 relative bg-[#f4eacc] border transition-all text-[#3e2723] flex flex-col items-center justify-center hover:-translate-y-1 hover:shadow-lg cursor-pointer group"
                  style={{
                    boxShadow: 'inset 0 0 0 2px #f4eacc, inset 0 0 0 4px rgba(139, 69, 19, 0.4)',
                    border: '1px solid rgba(139, 69, 19, 0.6)'
                  }}
                >
                  <div className="absolute inset-1 border-[1.5px] border-double border-[#8b4513]/40 pointer-events-none group-hover:border-[#8b4513]/80 transition-colors" />
                  <div className="absolute top-0 left-0 w-4 h-4 border-l border-t border-[#8b4513] m-2 pointer-events-none" />
                  <div className="absolute top-0 right-0 w-4 h-4 border-r border-t border-[#8b4513] m-2 pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-l border-b border-[#8b4513] m-2 pointer-events-none" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-r border-b border-[#8b4513] m-2 pointer-events-none" />
                  
                  <Plus size={36} strokeWidth={2.5} className="mb-2 text-[#8b4513]/70 group-hover:text-[#8b4513] transition-colors" />
                  <span className="text-xl font-semibold tracking-wide font-serif border-b border-transparent group-hover:border-[#8b4513] transition-colors">Start New Campaign</span>
                </button>
              ) : (
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="h-48 rounded-xl border-2 border-dashed border-border-default flex flex-col items-center justify-center text-muted hover:text-accent-text hover:border-accent hover:bg-surface-hover transition-all group"
                >
                  <Plus size={36} className="mb-4 text-accent2-text group-hover:text-accent-text transition-colors" />
                  <span className="text-lg font-semibold border-b border-transparent group-hover:border-accent-text transition-colors">Start New Campaign</span>
                </button>
              )}

              {campaigns.map(camp => {
                const isCyber = theme === 'cyberpunk';
                const isMed = theme === 'medieval';
                const isVamp = theme === 'vampire';

                return (
                  <div
                    key={camp.id}
                    onClick={() => handleSelectCampaign(camp)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') handleSelectCampaign(camp);
                    }}
                    className={
                      isCyber 
                        ? 'h-48 text-left rounded-xl p-6 flex flex-col justify-between transition-all group cursor-pointer cyber-smoked-glass hover:border-[#0ff]/80 hover:shadow-[0_0_20px_rgba(0,255,255,0.3)]' 
                        : isMed
                        ? 'h-48 text-center rounded p-6 flex flex-col justify-between transition-all group cursor-pointer relative overflow-hidden wood-plank shadow-[2px_4px_10px_rgba(0,0,0,0.15)] hover:-translate-y-1 hover:shadow-[4px_8px_15px_rgba(0,0,0,0.25)] border-[#5c3a21] border'
                        : isVamp
                        ? 'h-48 text-left rounded-xl p-6 flex flex-col justify-between transition-all group cursor-pointer relative overflow-hidden bg-[#0d0d12] border border-[#1f1f2e] hover:-translate-y-1 hover:shadow-[0_10px_25px_rgba(0,0,0,0.6)] hover:border-[#3d3d4a]'
                        : 'h-48 text-left rounded-xl p-6 flex flex-col justify-between transition-all group cursor-pointer bg-surface-elevated border border-border-subtle hover:shadow-lg hover:border-accent hover:-translate-y-1 relative overflow-hidden'
                    }
                  >
                    {!isCyber && !isMed && !isVamp && <div className="absolute inset-0 bg-gradient-to-br from-transparent to-surface-hover opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />}
                    {isCyber && <div className="micro-circuit-pattern" />}
                    {isMed && (
                      <>
                        <div className="absolute inset-0 bg-[#d4a373] mix-blend-multiply opacity-20 pointer-events-none" />
                        <div className="absolute inset-2 border border-[#3e2723]/30 pointer-events-none rounded" />
                      </>
                    )}
                    
                    {/* Delete Button */}
                    <div className={`absolute ${isMed ? 'top-3 right-3' : 'top-4 right-4'} z-20 transition-opacity opacity-0 group-hover:opacity-100`}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCampaign(camp.id, camp.name);
                        }}
                        className={`p-1.5 rounded-md transition-colors ${
                          isCyber ? 'text-[#ff003c] hover:bg-[#ff003c]/20' : 
                          isVamp ? 'text-[#555566] hover:text-[#ff3333] hover:bg-[#ff0000]/10' : 
                          isMed ? 'text-[#3e2723]/60 hover:text-red-700 hover:bg-red-500/10' : 
                          'text-muted hover:text-red-500 hover:bg-red-500/10'
                        }`}
                        title="Delete Campaign"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="relative pointer-events-none z-10 flex-1 flex flex-col justify-center">
                      {!isMed && (
                        <div className="flex items-center space-x-3 mb-2">
                          <span className={`${isCyber ? 'text-[#0ff]' : isVamp ? 'text-[#8b0000]' : 'text-accent-text'} text-2xl select-none flex items-center justify-center`}>☽☉☾</span>
                          <h3 className={`text-xl font-bold truncate pr-8 ${isCyber ? 'text-[#0ff] tracking-wider' : isVamp ? 'text-[#ff3333] font-serif tracking-widest' : 'text-heading'}`}>{camp.name}</h3>
                        </div>
                      )}
                      {isMed && (
                        <h3 className="text-2xl font-bold font-serif text-[#3e2723] leading-tight mb-4" style={{ textShadow: '0 1px 1px rgba(255,255,255,0.3)' }}>
                          {camp.name}
                        </h3>
                      )}
                      
                      {!isMed && camp.genre && <span className={`inline-block mt-2 px-3 py-1 text-[11px] rounded uppercase tracking-wider font-bold self-start ${isCyber ? 'cyber-glowing-pill text-cyan-glitch' : isVamp ? 'bg-[#1f1f2e]/60 text-[#a0a0b0] border border-[#2a2a35]' : 'bg-surface-deep text-secondary'}`}>{camp.genre}</span>}
                    </div>
                    
                    {isCyber && <div className="absolute bottom-4 left-6 text-[10px] text-[#0ff]/40 font-mono">v.1.{camp.id} | RAD DX</div>}
                    
                    <div className={`relative flex items-end text-sm mt-auto pointer-events-none z-10 ${
                      isCyber ? 'justify-between pt-4 border-t border-[#0ff]/30 text-[#0ff]/70' : 
                      isVamp ? 'justify-between pt-4 border-t border-[#1f1f2e] text-[#606070]' : 
                      isMed ? 'justify-center py-1 px-4 border-t border-b border-[#5c3a21]/20 font-bold uppercase tracking-widest text-[11px] text-[#5c3a21]' : 
                      'justify-between pt-4 border-t border-border-subtle text-faint'
                    }`}>
                      {isMed ? (
                        <div className="flex items-center space-x-2">
                          <span>{camp.genre || 'FANTASY'}</span>
                          <span className="opacity-50">|</span>
                          <span>{camp.system || 'SYSTEM'}</span>
                        </div>
                      ) : (
                        <>
                          <span className={isCyber ? 'cyber-glowing-pill px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest mt-1' : isVamp ? 'px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest mt-1 text-[#606070]' : ''}>{camp.system || 'Unknown System'}</span>
                          <span className={`font-semibold px-4 py-1.5 rounded transition-colors ${isCyber ? 'cyber-enter-btn text-xs tracking-widest' : isVamp ? 'text-[#8b0000] tracking-widest text-xs hover:text-[#ff3333]' : 'group-hover:text-accent-text'}`}>
                            {(isCyber || isVamp) ? 'ENTER' : 'Enter'} &rarr;
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      ) : (
        <main className={`flex-1 flex flex-col h-full z-0 w-full overflow-hidden ${theme === 'cyberpunk' ? 'bg-transparent' : theme === 'vampire' ? 'bg-transparent' : 'bg-surface-app'}`}>
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
      <ConfirmDialog {...confirmDialog} />

        </>
      )}
    </>
  );
}

export default App;
