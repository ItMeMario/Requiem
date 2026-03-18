import React from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { parseMentions } from '../../utils/mentionParser';

interface JournalListProps {
  entries: any[];
  characters: any[];
  locations: any[];
  handleViewEntry: (entry: any) => void;
  handleEditEntry: (entry: any) => void;
  handleDeleteEntry: (id: number) => void;
  openNewEntryModal: () => void;
}

export const JournalList: React.FC<JournalListProps> = ({ 
  entries, characters, locations, handleViewEntry, handleEditEntry, handleDeleteEntry, openNewEntryModal 
}) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-secondary">Journal Entries</h3>
        <button 
          onClick={openNewEntryModal}
          className="flex items-center space-x-2 px-4 py-2 bg-surface-hover hover:opacity-80 rounded text-sm text-heading transition-colors border border-border-hover"
        >
          <Plus size={16} />
          <span>New Entry</span>
        </button>
      </div>
      
      {entries.length === 0 ? (
        <div className="text-center py-12 text-faint italic bg-surface-elevated2 rounded-lg border border-border-subtle">
          No diary entries written yet. Begin your adventure.
        </div>
      ) : (
        <div className="flex flex-col space-y-4">
          {entries.map(entry => (
            <div key={entry.id} onClick={() => handleViewEntry(entry)} className="bg-surface-card border border-border-default rounded-lg p-5 hover:border-border-hover transition-colors group relative cursor-pointer">
              <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button onClick={(e) => { e.stopPropagation(); handleEditEntry(entry); }} className="p-1.5 bg-surface-hover hover:bg-accent rounded text-secondary hover:text-heading transition-colors">
                  <Edit2 size={16} />
                </button>
                <button onClick={(e) => { e.stopPropagation(); handleDeleteEntry(entry.id); }} className="p-1.5 bg-surface-hover hover:bg-danger rounded text-secondary hover:text-heading transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
              <h4 className="text-xl font-bold text-primary mb-1">{entry.title}</h4>
              <div className="text-xs text-accent-text mb-4">{new Date(entry.creation_date).toLocaleString()}</div>
              <div 
                className="text-secondary quill-content line-clamp-3 overflow-hidden pointer-events-none"
                dangerouslySetInnerHTML={{ __html: parseMentions(entry.content, characters, locations) }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
