import React, { useState } from 'react';
import { getDataService } from '../../services';

const initLocState = {
  name: '',
  region: '',
  type: '',
  description: '',
  lore: '',
  present_npcs: '',
  atmosphere: '',
  image_url: '',
  shared: true
};

interface UseLocationManagerProps {
  selectedCampaign: any;
  locations: any[];
  crud: any;
  returnToJournalEntryId: number | null;
  setReturnToJournalEntryId: React.Dispatch<React.SetStateAction<number | null>>;
  setActiveTab: React.Dispatch<React.SetStateAction<any>>;
  setShowEntryModal: React.Dispatch<React.SetStateAction<boolean>>;
  setConfirmDialog: React.Dispatch<React.SetStateAction<any>>;
  showLocModal: boolean;
  setShowLocModal: (show: boolean) => void;
  showLocViewModal: boolean;
  setShowLocViewModal: (show: boolean) => void;
}

export function useLocationManager({
  selectedCampaign,
  locations,
  crud,
  returnToJournalEntryId,
  setReturnToJournalEntryId,
  setActiveTab,
  setShowEntryModal,
  setConfirmDialog,
  showLocModal,
  setShowLocModal,
  showLocViewModal,
  setShowLocViewModal
}: UseLocationManagerProps) {
  const [selectedLocForView, setSelectedLocForView] = useState<any>(null);
  const [editingLocId, setEditingLocId] = useState<number | null>(null);
  const [newLoc, setNewLoc] = useState(initLocState);

  const handleCreateLoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLoc.name.trim() || !selectedCampaign) return;
    try {
      const data = { ...newLoc, campaign_id: selectedCampaign.id };
      if (editingLocId !== null) {
        await getDataService().updateLocation(editingLocId, data);
        crud.editLocation(editingLocId, data);
      } else {
        const id = await getDataService().createLocation(data);
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

  const handleViewLoc = (loc: any) => {
    setSelectedLocForView(loc);
    setShowLocViewModal(true);
  };

  const handleCloseLocViewModal = () => {
    setShowLocViewModal(false);
    setSelectedLocForView(null);
    if (returnToJournalEntryId !== null) {
      setActiveTab('journal');
      setShowEntryModal(true);
      setReturnToJournalEntryId(null);
    }
  };

  const handleEditLocFromView = (loc: any) => {
    setShowLocViewModal(false);
    handleEditLoc(loc);
  };

  const handleDeleteLoc = async (id: number) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Location',
      message: 'Are you sure you want to delete this location? This action cannot be undone.',
      onConfirm: async () => {
        try {
          await getDataService().deleteLocation(id);
          crud.removeLocation(id);
          setConfirmDialog((prev: any) => ({ ...prev, isOpen: false }));
        } catch (error) {
          console.error('Error deleting location:', error);
        }
      },
      onCancel: () => setConfirmDialog((prev: any) => ({ ...prev, isOpen: false }))
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

  return {
    showLocModal,
    setShowLocModal,
    showLocViewModal,
    setShowLocViewModal,
    selectedLocForView,
    setSelectedLocForView,
    editingLocId,
    setEditingLocId,
    newLoc,
    setNewLoc,
    handleCreateLoc,
    handleEditLoc,
    handleViewLoc,
    handleCloseLocViewModal,
    handleEditLocFromView,
    handleDeleteLoc,
    handleCloseLocModal,
    openNewLocModal
  };
}
