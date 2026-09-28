import React from 'react';
import { User, Plus, Edit2, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface CharacterListProps {
  characters: any[];
  handleEditChar: (char: any) => void;
  handleDeleteChar: (id: number) => void;
  openNewCharModal: () => void;
  handleViewChar: (char: any) => void;
  selectedCampaign?: any;
}

export const CharacterList: React.FC<CharacterListProps> = ({ 
  characters, handleEditChar, handleDeleteChar, openNewCharModal, handleViewChar, selectedCampaign 
}) => {
  const { user } = useAuth();

  const canEdit = (char: any) => {
    return !user || !selectedCampaign || char.authorId === user.uid || selectedCampaign.ownerId === user.uid || (Array.isArray(char.assignedTo) && char.assignedTo.includes(user.uid));
  };

  const canDelete = (char: any) => {
    return !user || !selectedCampaign || char.authorId === user.uid || selectedCampaign.ownerId === user.uid;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-secondary">Characters</h3>
        <button 
          onClick={openNewCharModal}
          className="flex items-center space-x-2 px-4 py-2 bg-surface-hover hover:opacity-80 rounded text-sm text-heading transition-colors border border-border-hover"
        >
          <Plus size={16} />
          <span>Add Character</span>
        </button>
      </div>
      
      {characters.length === 0 ? (
        <div className="text-center py-12 text-faint italic bg-surface-elevated2 rounded-lg border border-border-subtle">
          No characters added yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {characters.map(char => (
            <div 
              key={char.id} 
              onClick={() => handleViewChar(char)}
              className="bg-surface-card border border-border-default rounded-lg overflow-hidden hover:border-border-hover transition-colors group relative cursor-pointer"
            >
              <div className="absolute top-2 right-2 flex space-x-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity z-10">
                {canEdit(char) && (
                  <button onClick={(e) => { e.stopPropagation(); handleEditChar(char); }} className="p-2 bg-surface-card/80 hover:bg-accent rounded text-secondary hover:text-heading backdrop-blur-sm transition-colors shadow-sm">
                    <Edit2 size={16} />
                  </button>
                )}
                {canDelete(char) && (
                  <button onClick={(e) => { e.stopPropagation(); handleDeleteChar(char.id); }} className="p-2 bg-surface-card/80 hover:bg-danger rounded text-secondary hover:text-heading backdrop-blur-sm transition-colors shadow-sm">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              {char.image_url ? (
                <div className="h-48 w-full bg-surface-hover overflow-hidden relative">
                  <img src={char.image_url} alt={char.name} className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-card via-transparent to-transparent" />
                </div>
              ) : (
                <div className="h-40 w-full bg-surface-hover/50 flex items-center justify-center relative">
                  <User size={48} className="text-icon" />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-card via-transparent to-transparent" />
                </div>
              )}
              <div className={`p-4 ${char.image_url ? 'relative -mt-12' : ''}`}>
                <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                  <h4 className={`text-lg font-bold ${char.image_url ? 'text-heading drop-shadow-md' : 'text-primary'}`}>{char.name}</h4>
                  {user && Array.isArray(char.assignedTo) && char.assignedTo.includes(user.uid) && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      Atribuído a você
                    </span>
                  )}
                  {user && selectedCampaign?.ownerId === user.uid && Array.isArray(char.assignedTo) && char.assignedTo.length > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      Atribuído ({char.assignedTo.length})
                    </span>
                  )}
                </div>
                <div className="text-sm text-accent-text mb-2 font-medium">{char.race} {char.status && `• ${char.status}`}</div>
                <div className="space-y-1 text-sm text-muted">
                  {char.faction && <div><span className="text-faint">Faction:</span> {char.faction}</div>}
                  {char.age && <div><span className="text-faint">Age:</span> {char.age}</div>}
                </div>
                {char.lore && (
                  <p className="mt-3 text-sm text-secondary line-clamp-2">
                    {char.lore}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
