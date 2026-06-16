import React, { useState } from 'react';
import { getDataService } from '../../services';

const initCharState = {
  name: '',
  race: '',
  status: '',
  age: '',
  faction: '',
  lore: '',
  bonds: '',
  personal_notes: '',
  image_url: ''
};

interface UseCharacterManagerProps {
  selectedCampaign: any;
  crud: any;
  returnToJournalEntryId: number | null;
  setReturnToJournalEntryId: React.Dispatch<React.SetStateAction<number | null>>;
  setActiveTab: React.Dispatch<React.SetStateAction<any>>;
  setShowEntryModal: React.Dispatch<React.SetStateAction<boolean>>;
  setConfirmDialog: React.Dispatch<React.SetStateAction<any>>;
  showCharModal: boolean;
  setShowCharModal: (show: boolean) => void;
  showCharViewModal: boolean;
  setShowCharViewModal: (show: boolean) => void;
}

export function useCharacterManager({
  selectedCampaign,
  crud,
  returnToJournalEntryId,
  setReturnToJournalEntryId,
  setActiveTab,
  setShowEntryModal,
  setConfirmDialog,
  showCharModal,
  setShowCharModal,
  showCharViewModal,
  setShowCharViewModal
}: UseCharacterManagerProps) {
  const [selectedCharForView, setSelectedCharForView] = useState<any>(null);
  const [editingCharId, setEditingCharId] = useState<number | null>(null);
  const [newChar, setNewChar] = useState(initCharState);

  const handleCreateChar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChar.name.trim() || !selectedCampaign) return;
    try {
      const data = { ...newChar, campaign_id: selectedCampaign.id };
      if (editingCharId !== null) {
        await getDataService().updateCharacter(editingCharId, data);
        crud.editCharacter(editingCharId, data);
      } else {
        const id = await getDataService().createCharacter(data);
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

  const handleViewChar = (char: any) => {
    setSelectedCharForView(char);
    setShowCharViewModal(true);
  };

  const handleCloseCharViewModal = () => {
    setShowCharViewModal(false);
    setSelectedCharForView(null);
    if (returnToJournalEntryId !== null) {
      setActiveTab('journal');
      setShowEntryModal(true);
      setReturnToJournalEntryId(null);
    }
  };

  const handleEditCharFromView = (char: any) => {
    setShowCharViewModal(false);
    handleEditChar(char);
  };

  const handleDeleteChar = async (id: number) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Character',
      message: 'Are you sure you want to delete this character? This action cannot be undone.',
      onConfirm: async () => {
        try {
          await getDataService().deleteCharacter(id);
          crud.removeCharacter(id);
          setConfirmDialog((prev: any) => ({ ...prev, isOpen: false }));
        } catch (error) {
          console.error('Error deleting character:', error);
        }
      },
      onCancel: () => setConfirmDialog((prev: any) => ({ ...prev, isOpen: false }))
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

  return {
    showCharModal,
    setShowCharModal,
    showCharViewModal,
    setShowCharViewModal,
    selectedCharForView,
    setSelectedCharForView,
    editingCharId,
    setEditingCharId,
    newChar,
    setNewChar,
    handleCreateChar,
    handleEditChar,
    handleViewChar,
    handleCloseCharViewModal,
    handleEditCharFromView,
    handleDeleteChar,
    handleCloseCharModal,
    openNewCharModal
  };
}
