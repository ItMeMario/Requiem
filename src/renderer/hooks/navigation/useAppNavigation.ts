import { useState } from 'react';

export function useAppNavigation() {
  const [activeTab, setActiveTab] = useState<'characters' | 'locations' | 'journal' | 'monsters'>('characters');
  const [returnToJournalEntryId, setReturnToJournalEntryId] = useState<number | null>(null);

  // Modals Visibility
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCharModal, setShowCharModal] = useState(false);
  const [showLocModal, setShowLocModal] = useState(false);
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [isViewingEntry, setIsViewingEntry] = useState(false);
  const [showCharViewModal, setShowCharViewModal] = useState(false);
  const [showLocViewModal, setShowLocViewModal] = useState(false);

  return {
    activeTab,
    setActiveTab,
    returnToJournalEntryId,
    setReturnToJournalEntryId,
    
    showCreateModal,
    setShowCreateModal,
    showCharModal,
    setShowCharModal,
    showLocModal,
    setShowLocModal,
    showEntryModal,
    setShowEntryModal,
    isViewingEntry,
    setIsViewingEntry,
    showCharViewModal,
    setShowCharViewModal,
    showLocViewModal,
    setShowLocViewModal
  };
}
