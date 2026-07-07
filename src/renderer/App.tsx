import React, { useState, useEffect } from 'react';

import { useCampaigns } from './hooks/useCampaigns';
import { useEntities } from './hooks/useEntities';
import { useTheme } from './context/ThemeContext';
import { useAuth } from './context/AuthContext';
import { getDataService } from './services';
import { useIntroGate } from './hooks/useIntroGate';

// Custom Hooks for Modular Management
import { useAppNavigation } from './hooks/navigation/useAppNavigation';
import { useCampaignManager } from './hooks/campaign/useCampaignManager';
import { useCharacterManager } from './hooks/character/useCharacterManager';
import { useLocationManager } from './hooks/location/useLocationManager';
import { useEntryManager } from './hooks/entry/useEntryManager';

// Modular Presentation Components
import { SettingsPanel } from './components/SettingsPanel';
import { ThemeLayout } from './components/layout/ThemeLayout';
import { DashboardView } from './components/dashboard/DashboardView';
import { ActiveCampaignView } from './components/campaign/ActiveCampaignView';

// Modals & Intros
import { CreateCampaignModal } from './components/modals/CreateCampaignModal';
import { CharacterModal } from './components/modals/CharacterModal';
import { LocationModal } from './components/modals/LocationModal';
import { EntryModal } from './components/modals/EntryModal';
import { CharacterViewModal } from './components/modals/CharacterViewModal';
import { LocationViewModal } from './components/modals/LocationViewModal';
import { MedievalIntro } from './themes/medieval/MedievalIntro';
import { CyberpunkIntro } from './themes/cyberpunk/CyberpunkIntro';
import { VampireIntro } from './themes/vampire/VampireIntro';
import { ConfirmDialog } from './resources/ConfirmDialog';
import { CampaignCollaboratorsModal } from './components/modals/CampaignCollaboratorsModal';

function App() {
  const { user, isConfigured } = useAuth();
  const { campaigns, selectedCampaign, setSelectedCampaign, createCampaign, updateCampaign, deleteCampaign } = useCampaigns(user);
  const { characters, locations, entries, loadEntities, crud } = useEntities(selectedCampaign?.id || null);
  const { theme } = useTheme();

  useEffect(() => {
    setSelectedCampaign(null);
  }, [user, setSelectedCampaign]);

  const { showIntro, dismissIntro } = useIntroGate();

  const [dbError, setDbError] = useState<string | null>(null);
  
  useEffect(() => {
    // Check DB initialization after a short delay
    const timer = setTimeout(() => {
      const svc = getDataService() as any;
      if (svc.initError) {
        setDbError(svc.initError);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    onCancel: () => {}
  });

  // Navigation and Modal Visibility States
  const nav = useAppNavigation();

  // Domain Managers
  const campaignMgr = useCampaignManager({
    campaigns,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    setSelectedCampaign,
    loadEntities,
    setConfirmDialog,
    showCreateModal: nav.showCreateModal,
    setShowCreateModal: nav.setShowCreateModal
  });

  const charMgr = useCharacterManager({
    selectedCampaign,
    crud,
    returnToJournalEntryId: nav.returnToJournalEntryId,
    setReturnToJournalEntryId: nav.setReturnToJournalEntryId,
    setActiveTab: nav.setActiveTab,
    setShowEntryModal: nav.setShowEntryModal,
    setConfirmDialog,
    showCharModal: nav.showCharModal,
    setShowCharModal: nav.setShowCharModal,
    showCharViewModal: nav.showCharViewModal,
    setShowCharViewModal: nav.setShowCharViewModal
  });

  const locMgr = useLocationManager({
    selectedCampaign,
    locations,
    crud,
    returnToJournalEntryId: nav.returnToJournalEntryId,
    setReturnToJournalEntryId: nav.setReturnToJournalEntryId,
    setActiveTab: nav.setActiveTab,
    setShowEntryModal: nav.setShowEntryModal,
    setConfirmDialog,
    showLocModal: nav.showLocModal,
    setShowLocModal: nav.setShowLocModal,
    showLocViewModal: nav.showLocViewModal,
    setShowLocViewModal: nav.setShowLocViewModal
  });

  const entryMgr = useEntryManager({
    selectedCampaign,
    entries,
    characters,
    locations,
    crud,
    setReturnToJournalEntryId: nav.setReturnToJournalEntryId,
    setActiveTab: nav.setActiveTab,
    handleViewChar: charMgr.handleViewChar,
    handleViewLoc: locMgr.handleViewLoc,
    setConfirmDialog,
    showEntryModal: nav.showEntryModal,
    setShowEntryModal: nav.setShowEntryModal,
    isViewingEntry: nav.isViewingEntry,
    setIsViewingEntry: nav.setIsViewingEntry
  });

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
      lastOpenedCampaign: !selectedCampaign ? campaignMgr.lastOpenedCampaign : null,
      handleSelectCampaign: campaignMgr.handleSelectCampaign
    };
    return <ThemeLayout {...layoutProps}>{children}</ThemeLayout>;
  };

  return (
    <>
      <SettingsPanel />
      {dbError && (
        <div className="fixed top-0 left-0 right-0 z-[10000] bg-red-900 text-white p-3 text-xs font-mono break-all">
          <strong>DB Error:</strong> {dbError}
        </div>
      )}
      {renderLayout(
        <>
          {!selectedCampaign ? (
            <DashboardView
              theme={theme}
              campaigns={campaigns}
              lastOpenedCampaign={campaignMgr.lastOpenedCampaign}
              handleSelectCampaign={campaignMgr.handleSelectCampaign}
              handleDeleteCampaign={campaignMgr.handleDeleteCampaign}
              handleEditCampaign={campaignMgr.handleEditCampaign}
              setShowCreateModal={nav.setShowCreateModal}
              setNewCampaign={campaignMgr.setNewCampaign}
            />
          ) : (
            <ActiveCampaignView
              theme={theme}
              selectedCampaign={selectedCampaign}
              setSelectedCampaign={setSelectedCampaign}
              activeTab={nav.activeTab}
              setActiveTab={nav.setActiveTab}
              characters={characters}
              locations={locations}
              entries={entries}
              handleDeleteChar={charMgr.handleDeleteChar}
              handleEditChar={charMgr.handleEditChar}
              openNewCharModal={charMgr.openNewCharModal}
              handleViewChar={charMgr.handleViewChar}
              handleDeleteLoc={locMgr.handleDeleteLoc}
              handleEditLoc={locMgr.handleEditLoc}
              openNewLocModal={locMgr.openNewLocModal}
              handleViewLoc={locMgr.handleViewLoc}
              handleDeleteEntry={entryMgr.handleDeleteEntry}
              handleEditEntry={entryMgr.handleEditEntry}
              handleViewEntry={entryMgr.handleViewEntry}
              openNewEntryModal={entryMgr.openNewEntryModal}
              setShowCollaboratorsModal={nav.setShowCollaboratorsModal}
            />
          )}
        </>
      )}

      <CreateCampaignModal 
        showCreateModal={nav.showCreateModal} 
        setShowCreateModal={nav.setShowCreateModal} 
        newCampaign={campaignMgr.newCampaign} 
        setNewCampaign={campaignMgr.setNewCampaign} 
        handleCreateCampaign={campaignMgr.handleCreateCampaignWrapper} 
      />

      <CharacterModal 
        showCharModal={nav.showCharModal} 
        handleCloseCharModal={charMgr.handleCloseCharModal} 
        editingCharId={charMgr.editingCharId} 
        newChar={charMgr.newChar} 
        setNewChar={charMgr.setNewChar} 
        handleCreateChar={charMgr.handleCreateChar} 
        selectedCampaign={selectedCampaign}
      />

      <LocationModal 
        showLocModal={nav.showLocModal} 
        handleCloseLocModal={locMgr.handleCloseLocModal} 
        editingLocId={locMgr.editingLocId} 
        newLoc={locMgr.newLoc} 
        setNewLoc={locMgr.setNewLoc} 
        handleCreateLoc={locMgr.handleCreateLoc} 
        selectedCampaign={selectedCampaign}
      />

      <EntryModal 
        showEntryModal={nav.showEntryModal} 
        setShowEntryModal={nav.setShowEntryModal} 
        isViewingEntry={nav.isViewingEntry} 
        setIsViewingEntry={nav.setIsViewingEntry} 
        editingEntryId={entryMgr.editingEntryId} 
        entries={entries} 
        newEntry={entryMgr.newEntry} 
        setNewEntry={entryMgr.setNewEntry} 
        handleCreateEntry={entryMgr.handleCreateEntry} 
        handleDeleteEntry={entryMgr.handleDeleteEntry} 
        handleMentionClick={entryMgr.handleMentionClick} 
        characters={characters} 
        locations={locations} 
        selectedCampaign={selectedCampaign}
      />
      <CharacterViewModal 
        showCharViewModal={nav.showCharViewModal}
        handleCloseCharViewModal={charMgr.handleCloseCharViewModal}
        char={charMgr.selectedCharForView}
        handleEditChar={charMgr.handleEditCharFromView}
        handleDeleteAttachment={charMgr.handleDeleteAttachment}
        selectedCampaign={selectedCampaign}
      />
      <LocationViewModal 
        showLocViewModal={nav.showLocViewModal}
        handleCloseLocViewModal={locMgr.handleCloseLocViewModal}
        loc={locMgr.selectedLocForView}
        handleEditLoc={locMgr.handleEditLocFromView}
        selectedCampaign={selectedCampaign}
      />
      <ConfirmDialog {...confirmDialog} />
      <CampaignCollaboratorsModal 
        showCollaboratorsModal={nav.showCollaboratorsModal}
        setShowCollaboratorsModal={nav.setShowCollaboratorsModal}
        campaign={selectedCampaign}
        theme={theme}
        onCollaboratorsUpdated={(newCollaborators) => {
          if (selectedCampaign) {
            setSelectedCampaign({ ...selectedCampaign, collaborators: newCollaborators });
          }
        }}
      />
    </>
  );
}

export default App;
