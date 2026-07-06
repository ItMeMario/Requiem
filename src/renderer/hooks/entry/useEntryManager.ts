import React, { useState } from 'react';
import { getDataService } from '../../services';

const initEntryState = { title: '', content: '' };

interface UseEntryManagerProps {
  selectedCampaign: any;
  entries: any[];
  characters: any[];
  locations: any[];
  crud: any;
  setReturnToJournalEntryId: React.Dispatch<React.SetStateAction<number | null>>;
  setActiveTab: React.Dispatch<React.SetStateAction<any>>;
  handleViewChar: (char: any) => void;
  handleViewLoc: (loc: any) => void;
  setConfirmDialog: React.Dispatch<React.SetStateAction<any>>;
  showEntryModal: boolean;
  setShowEntryModal: (show: boolean) => void;
  isViewingEntry: boolean;
  setIsViewingEntry: (viewing: boolean) => void;
}

export function useEntryManager({
  selectedCampaign,
  entries,
  characters,
  locations,
  crud,
  setReturnToJournalEntryId,
  setActiveTab,
  handleViewChar,
  handleViewLoc,
  setConfirmDialog,
  showEntryModal,
  setShowEntryModal,
  isViewingEntry,
  setIsViewingEntry
}: UseEntryManagerProps) {
  const [editingEntryId, setEditingEntryId] = useState<number | null>(null);
  const [newEntry, setNewEntry] = useState(initEntryState);

  const handleCreateEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntry.title.trim() || !selectedCampaign) return;
    try {
      const isEditing = editingEntryId !== null;
      const data = {
        campaign_id: selectedCampaign.id,
        title: newEntry.title,
        content: newEntry.content,
        shared: (newEntry as any).shared === true,
        creation_date: isEditing
          ? entries.find(evt => evt.id === editingEntryId)?.creation_date
          : new Date().toISOString()
      };

      if (isEditing) {
        await getDataService().updateEntry(editingEntryId, data);
        crud.editEntry(editingEntryId, data);
      } else {
        const id = await getDataService().createEntry(data);
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
    setNewEntry({ 
      title: entry.title, 
      content: entry.content,
      shared: entry.shared === true,
      authorId: entry.authorId || null,
      authorName: entry.authorName || null
    } as any);
    setIsViewingEntry(false);
    setShowEntryModal(true);
  };

  const handleViewEntry = (entry: any) => {
    setEditingEntryId(entry.id);
    setNewEntry({ 
      title: entry.title, 
      content: entry.content,
      shared: entry.shared === true,
      authorId: entry.authorId || null,
      authorName: entry.authorName || null
    } as any);
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
          await getDataService().deleteEntry(id);
          crud.removeEntry(id);
          if (editingEntryId === id) {
            setShowEntryModal(false);
          }
          setConfirmDialog((prev: any) => ({ ...prev, isOpen: false }));
        } catch (error) {
          console.error('Error deleting entry:', error);
        }
      },
      onCancel: () => setConfirmDialog((prev: any) => ({ ...prev, isOpen: false }))
    });
  };

  const openNewEntryModal = () => {
    setEditingEntryId(null);
    setNewEntry({ title: '', content: '', shared: false } as any);
    setIsViewingEntry(false);
    setShowEntryModal(true);
  };

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
          handleViewChar(char);
        }
      } else if (type === 'location') {
        const loc = locations.find(l => l.id === id);
        if (loc) {
          setReturnToJournalEntryId(editingEntryId);
          setShowEntryModal(false);
          setActiveTab('locations');
          handleViewLoc(loc);
        }
      }
    }
  };

  return {
    showEntryModal,
    setShowEntryModal,
    isViewingEntry,
    setIsViewingEntry,
    editingEntryId,
    setEditingEntryId,
    newEntry,
    setNewEntry,
    handleCreateEntry,
    handleEditEntry,
    handleViewEntry,
    handleDeleteEntry,
    openNewEntryModal,
    handleMentionClick
  };
}
