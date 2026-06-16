import React from 'react';
import { ArrowLeft, Users, Map as MapIcon, Book } from 'lucide-react';
import { getThemeLabels } from '../../utils/themeLabels';
import { AuthControls } from '../AuthControls';
import { CharacterList } from '../characters/CharacterList';
import { LocationList } from '../locations/LocationList';
import { JournalList } from '../journal/JournalList';

interface ActiveCampaignViewProps {
  theme: string;
  selectedCampaign: any;
  setSelectedCampaign: (camp: any) => void;
  activeTab: 'characters' | 'locations' | 'journal';
  setActiveTab: (tab: 'characters' | 'locations' | 'journal') => void;
  characters: any[];
  locations: any[];
  entries: any[];
  handleDeleteChar: (id: number) => void;
  handleEditChar: (char: any) => void;
  openNewCharModal: () => void;
  handleViewChar: (char: any) => void;
  handleDeleteLoc: (id: number) => void;
  handleEditLoc: (loc: any) => void;
  openNewLocModal: () => void;
  handleViewLoc: (loc: any) => void;
  handleDeleteEntry: (id: number) => void;
  handleEditEntry: (entry: any) => void;
  handleViewEntry: (entry: any) => void;
  openNewEntryModal: () => void;
}

export function ActiveCampaignView({
  theme,
  selectedCampaign,
  setSelectedCampaign,
  activeTab,
  setActiveTab,
  characters,
  locations,
  entries,
  handleDeleteChar,
  handleEditChar,
  openNewCharModal,
  handleViewChar,
  handleDeleteLoc,
  handleEditLoc,
  openNewLocModal,
  handleViewLoc,
  handleDeleteEntry,
  handleEditEntry,
  handleViewEntry,
  openNewEntryModal
}: ActiveCampaignViewProps) {
  return (
    <main className={`flex-1 flex flex-col h-full z-0 w-full overflow-hidden ${theme === 'cyberpunk' ? 'bg-transparent' : theme === 'vampire' ? 'bg-transparent' : 'bg-surface-app'}`}>
      {/* Header */}
      <header className="px-4 md:px-8 py-3 md:py-4 border-b border-border-subtle bg-surface-elevated flex items-center justify-between shrink-0">
        <div className="flex flex-row items-center gap-2 sm:gap-4 sm:space-x-6 w-full sm:w-auto min-w-0">
          <button 
            onClick={() => setSelectedCampaign(null)}
            className="text-muted hover:text-heading flex items-center space-x-1 sm:space-x-2 transition-colors shrink-0 sm:pr-6 sm:border-r border-border-subtle"
          >
            <ArrowLeft size={20} />
            <span className="hidden sm:inline">{getThemeLabels(theme).dashboardName}</span>
          </button>
          <div className="min-w-0 overflow-hidden">
            <h2 className="text-xl sm:text-2xl font-bold text-heading tracking-wide flex items-center space-x-2 truncate">
              <span className="text-accent-text text-lg sm:text-xl mr-1 sm:mr-2 select-none shrink-0">☽☉☾</span> 
              <span className="truncate">{selectedCampaign.name}</span>
            </h2>
            <div className="flex space-x-2 sm:space-x-4 text-[10px] sm:text-xs text-muted mt-1 truncate">
              {selectedCampaign.genre && <span className="truncate">Genre: <span className="text-secondary">{selectedCampaign.genre}</span></span>}
              {selectedCampaign.system && <span className="truncate">System: <span className="text-secondary">{selectedCampaign.system}</span></span>}
            </div>
          </div>
        </div>
        <div className="hidden sm:block">
          <AuthControls />
        </div>
      </header>

      {/* Tabs */}
      <div className="flex px-4 md:px-8 border-b border-border-subtle bg-surface-elevated2 overflow-x-auto custom-scrollbar shrink-0">
        <button 
          onClick={() => setActiveTab('characters')}
          className={`flex shrink-0 items-center space-x-2 py-3 px-4 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'characters' ? 'border-accent text-accent-text' : 'border-transparent text-muted hover:text-heading'}`}
        >
          <Users size={18} />
          <span className="sm:inline">Characters</span>
        </button>
        <button 
          onClick={() => setActiveTab('locations')}
          className={`flex shrink-0 items-center space-x-2 py-3 px-4 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'locations' ? 'border-accent text-accent-text' : 'border-transparent text-muted hover:text-heading'}`}
        >
          <MapIcon size={18} />
          <span className="sm:inline">Locations</span>
        </button>
        <button 
          onClick={() => setActiveTab('journal')}
          className={`flex shrink-0 items-center space-x-2 py-3 px-4 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'journal' ? 'border-accent text-accent-text' : 'border-transparent text-muted hover:text-heading'}`}
        >
          <Book size={18} />
          <span className="sm:inline">Journal</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        {activeTab === 'characters' && (
          <CharacterList 
            characters={characters} 
            handleDeleteChar={handleDeleteChar} 
            handleEditChar={handleEditChar} 
            openNewCharModal={openNewCharModal} 
            handleViewChar={handleViewChar}
          />
        )}
        {activeTab === 'locations' && (
          <LocationList 
            locations={locations} 
            handleDeleteLoc={handleDeleteLoc} 
            handleEditLoc={handleEditLoc} 
            openNewLocModal={openNewLocModal} 
            handleViewLoc={handleViewLoc}
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
  );
}
