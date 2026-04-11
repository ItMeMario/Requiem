import React from 'react';
import { createPortal } from 'react-dom';
import { User, X } from 'lucide-react';
import { InputField } from '../InputField';
import { TextAreaField } from '../TextAreaField';

interface CharacterModalProps {
  showCharModal: boolean;
  handleCloseCharModal: () => void;
  editingCharId: number | null;
  newChar: any;
  setNewChar: (char: any) => void;
  handleCreateChar: (e: React.FormEvent) => void;
}

export const CharacterModal: React.FC<CharacterModalProps> = ({ 
  showCharModal, handleCloseCharModal, editingCharId, newChar, setNewChar, handleCreateChar 
}) => {
  if (!showCharModal) return null;

  return createPortal(
    <div className="fixed inset-0 bg-surface-overlay backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-surface-card border border-border-default rounded-xl p-6 w-full max-w-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
        <button onClick={handleCloseCharModal} className="absolute top-4 right-4 text-muted hover:text-heading"><X size={20} /></button>
        <h3 className="text-xl font-bold text-heading mb-6 flex items-center gap-2"><User className="text-accent-text"/> {editingCharId ? 'Edit Character' : 'New Character'}</h3>
        <form onSubmit={handleCreateChar} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Name *" value={newChar.name} onChange={(e:any) => setNewChar({...newChar, name: e.target.value})} />
            <InputField label="Race (Raça)" value={newChar.race} onChange={(e:any) => setNewChar({...newChar, race: e.target.value})} />
            <InputField label="Status" value={newChar.status} onChange={(e:any) => setNewChar({...newChar, status: e.target.value})} />
            <InputField label="Age (Idade)" value={newChar.age} onChange={(e:any) => setNewChar({...newChar, age: e.target.value})} />
            <InputField label="Faction (Facção)" value={newChar.faction} onChange={(e:any) => setNewChar({...newChar, faction: e.target.value})} />
            <InputField label="Image URL (Imagem)" value={newChar.image_url} onChange={(e:any) => setNewChar({...newChar, image_url: e.target.value})} placeholder="https://..." />
          </div>
          <TextAreaField label="Lore" value={newChar.lore} onChange={(e:any) => setNewChar({...newChar, lore: e.target.value})} />
          <TextAreaField label="Bonds (Vínculos)" value={newChar.bonds} onChange={(e:any) => setNewChar({...newChar, bonds: e.target.value})} />
          <TextAreaField label="Personal Notes (Notas pessoais)" value={newChar.personal_notes} onChange={(e:any) => setNewChar({...newChar, personal_notes: e.target.value})} />
          <div className="pt-4 flex justify-end sticky bottom-0 bg-surface-card py-2 border-t border-border-default mt-4">
            <button type="button" onClick={handleCloseCharModal} className="px-4 py-2 text-muted hover:text-heading transition-colors mr-2">Cancel</button>
            <button type="submit" disabled={!newChar.name.trim()} className="px-5 py-2 bg-accent hover:bg-accent-hover text-heading font-medium rounded transition-colors disabled:opacity-50">Save Character</button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
