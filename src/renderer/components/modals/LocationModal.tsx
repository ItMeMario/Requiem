import React from 'react';
import { Map as MapIcon, X } from 'lucide-react';
import { InputField } from '../InputField';
import { TextAreaField } from '../TextAreaField';

interface LocationModalProps {
  showLocModal: boolean;
  handleCloseLocModal: () => void;
  editingLocId: number | null;
  newLoc: any;
  setNewLoc: (loc: any) => void;
  handleCreateLoc: (e: React.FormEvent) => void;
}

export const LocationModal: React.FC<LocationModalProps> = ({ 
  showLocModal, handleCloseLocModal, editingLocId, newLoc, setNewLoc, handleCreateLoc 
}) => {
  if (!showLocModal) return null;

  return (
    <div className="fixed inset-0 bg-surface-overlay backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-surface-card border border-border-default rounded-xl p-6 w-full max-w-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
        <button onClick={handleCloseLocModal} className="absolute top-4 right-4 text-muted hover:text-heading"><X size={20} /></button>
        <h3 className="text-xl font-bold text-heading mb-6 flex items-center gap-2"><MapIcon className="text-accent2-text"/> {editingLocId ? 'Edit Location' : 'New Location'}</h3>
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
          <div className="pt-4 flex justify-end sticky bottom-0 bg-surface-card py-2 border-t border-border-default mt-4">
            <button type="button" onClick={handleCloseLocModal} className="px-4 py-2 text-muted hover:text-heading transition-colors mr-2">Cancel</button>
            <button type="submit" disabled={!newLoc.name.trim()} className="px-5 py-2 bg-accent2 hover:bg-accent2-hover text-heading font-medium rounded transition-colors disabled:opacity-50">Save Location</button>
          </div>
        </form>
      </div>
    </div>
  );
};
