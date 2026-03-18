import React from 'react';
import { User, Plus, Edit2, Trash2 } from 'lucide-react';

interface CharacterListProps {
  characters: any[];
  handleEditChar: (char: any) => void;
  handleDeleteChar: (id: number) => void;
  openNewCharModal: () => void;
}

export const CharacterList: React.FC<CharacterListProps> = ({ characters, handleEditChar, handleDeleteChar, openNewCharModal }) => {
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
            <div key={char.id} className="bg-surface-card border border-border-default rounded-lg overflow-hidden hover:border-border-hover transition-colors group relative">
              <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button onClick={() => handleEditChar(char)} className="p-1.5 bg-surface-card/80 hover:bg-accent rounded text-secondary hover:text-heading backdrop-blur-sm transition-colors">
                  <Edit2 size={16} />
                </button>
                <button onClick={() => handleDeleteChar(char.id)} className="p-1.5 bg-surface-card/80 hover:bg-danger rounded text-secondary hover:text-heading backdrop-blur-sm transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
              {char.image_url ? (
                <div className="h-48 w-full bg-surface-hover overflow-hidden relative">
                  <img src={char.image_url} alt={char.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-card via-transparent to-transparent" />
                </div>
              ) : (
                <div className="h-40 w-full bg-surface-hover/50 flex items-center justify-center relative">
                  <User size={48} className="text-icon" />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-card via-transparent to-transparent" />
                </div>
              )}
              <div className={`p-4 ${char.image_url ? 'relative -mt-12' : ''}`}>
                <h4 className={`text-lg font-bold ${char.image_url ? 'text-heading drop-shadow-md' : 'text-primary'}`}>{char.name}</h4>
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
