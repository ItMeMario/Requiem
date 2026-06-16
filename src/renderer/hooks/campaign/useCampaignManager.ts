import React, { useState } from 'react';
import { storage } from '../../utils/storage';

interface UseCampaignManagerProps {
  campaigns: any[];
  createCampaign: (data: any) => Promise<any>;
  updateCampaign: (id: number, data: any) => Promise<any>;
  deleteCampaign: (id: number) => Promise<any>;
  setSelectedCampaign: (camp: any) => void;
  loadEntities: (id: number) => Promise<void>;
  setConfirmDialog: React.Dispatch<React.SetStateAction<any>>;
  showCreateModal: boolean;
  setShowCreateModal: (show: boolean) => void;
}

export function useCampaignManager({
  campaigns,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  setSelectedCampaign,
  loadEntities,
  setConfirmDialog,
  showCreateModal,
  setShowCreateModal
}: UseCampaignManagerProps) {
  const [newCampaign, setNewCampaign] = useState({ name: '', genre: '', system: '' });

  const lastOpenedIdStr = storage.getItem('lastOpenedCampaignId');
  const lastOpenedId = lastOpenedIdStr ? parseInt(lastOpenedIdStr, 10) : null;
  const lastOpenedCampaign = campaigns.find(c => c.id === lastOpenedId) || (campaigns.length > 0 ? campaigns[campaigns.length - 1] : null);

  const handleSelectCampaign = async (camp: any) => {
    storage.setItem('lastOpenedCampaignId', camp.id.toString());
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
          setConfirmDialog((prev: any) => ({ ...prev, isOpen: false }));
        } catch (error) {
          console.error('Error deleting campaign:', error);
        }
      },
      onCancel: () => setConfirmDialog((prev: any) => ({ ...prev, isOpen: false }))
    });
  };

  const handleCreateCampaignWrapper = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaign.name.trim()) return;
    try {
      if ((newCampaign as any).id) {
        await updateCampaign((newCampaign as any).id, newCampaign);
        setShowCreateModal(false);
        setNewCampaign({ name: '', genre: '', system: '' });
      } else {
        const camp = await createCampaign(newCampaign);
        setShowCreateModal(false);
        setNewCampaign({ name: '', genre: '', system: '' });
        if (camp) handleSelectCampaign(camp);
      }
    } catch (error) {
      console.error('Failed to save campaign:', error);
      alert('Houve um erro ao salvar a campanha. Verifique o console para mais detalhes.');
    }
  };

  const handleEditCampaign = (e: React.MouseEvent, camp: any) => {
    e.stopPropagation();
    setNewCampaign(camp);
    setShowCreateModal(true);
  };

  return {
    showCreateModal,
    setShowCreateModal,
    newCampaign,
    setNewCampaign,
    lastOpenedCampaign,
    handleSelectCampaign,
    handleDeleteCampaign,
    handleCreateCampaignWrapper,
    handleEditCampaign
  };
}
