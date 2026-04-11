import React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { InputField } from '../InputField';

interface CreateCampaignModalProps {
  showCreateModal: boolean;
  setShowCreateModal: (show: boolean) => void;
  newCampaign: any;
  setNewCampaign: (comp: any) => void;
  handleCreateCampaign: (e: React.FormEvent) => void;
}

export const CreateCampaignModal: React.FC<CreateCampaignModalProps> = ({ 
  showCreateModal, setShowCreateModal, newCampaign, setNewCampaign, handleCreateCampaign 
}) => {
  if (!showCreateModal) return null;

  return createPortal(
    <div className="fixed inset-0 bg-surface-overlay backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-surface-card border border-border-default rounded-xl p-6 w-full max-w-md shadow-2xl relative">
        <button onClick={() => setShowCreateModal(false)} className="absolute top-4 right-4 text-muted hover:text-heading"><X size={20} /></button>
        <h3 className="text-xl font-bold text-heading mb-6">New Campaign</h3>
        <form onSubmit={handleCreateCampaign} className="space-y-4">
          <InputField label="Name *" value={newCampaign.name} onChange={(e:any) => setNewCampaign({...newCampaign, name: e.target.value})} placeholder="The Lost Mines..." />
          <InputField label="Genre" value={newCampaign.genre} onChange={(e:any) => setNewCampaign({...newCampaign, genre: e.target.value})} placeholder="High Fantasy" />
          <InputField label="System" value={newCampaign.system} onChange={(e:any) => setNewCampaign({...newCampaign, system: e.target.value})} placeholder="D&D 5e" />
          <div className="pt-4 flex justify-end">
            <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-muted hover:text-heading transition-colors mr-2">Cancel</button>
            <button type="submit" disabled={!newCampaign.name.trim()} className="px-5 py-2 bg-accent hover:bg-accent-hover text-heading font-medium rounded transition-colors disabled:opacity-50">Create</button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
