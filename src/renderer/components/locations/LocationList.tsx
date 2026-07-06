import React from 'react';
import { Map as MapIcon, Plus, Edit2, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface LocationListProps {
  locations: any[];
  handleEditLoc: (loc: any) => void;
  handleDeleteLoc: (id: number) => void;
  openNewLocModal: () => void;
  handleViewLoc: (loc: any) => void;
  selectedCampaign?: any;
}

export const LocationList: React.FC<LocationListProps> = ({ 
  locations, handleEditLoc, handleDeleteLoc, openNewLocModal, handleViewLoc, selectedCampaign 
}) => {
  const { user } = useAuth();

  const canEditOrDelete = (loc: any) => {
    return !user || !selectedCampaign || loc.authorId === user.uid || selectedCampaign.ownerId === user.uid;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-secondary">Locations</h3>
        <button 
          onClick={openNewLocModal}
          className="flex items-center space-x-2 px-4 py-2 bg-surface-hover hover:opacity-80 rounded text-sm text-heading transition-colors border border-border-hover"
        >
          <Plus size={16} />
          <span>Add Location</span>
        </button>
      </div>
      
      {locations.length === 0 ? (
        <div className="text-center py-12 text-faint italic bg-surface-elevated2 rounded-lg border border-border-subtle">
          No locations added yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {locations.map(loc => (
            <div 
              key={loc.id} 
              onClick={() => handleViewLoc(loc)}
              className="bg-surface-card border border-border-default rounded-lg overflow-hidden flex flex-col sm:flex-row hover:border-border-hover transition-colors group relative cursor-pointer"
            >
              <div className="absolute top-2 right-2 flex space-x-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity z-10">
                {canEditOrDelete(loc) && (
                  <>
                    <button onClick={(e) => { e.stopPropagation(); handleEditLoc(loc); }} className="p-2 bg-surface-card/80 hover:bg-accent2 rounded text-secondary hover:text-heading backdrop-blur-sm transition-colors shadow-sm">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteLoc(loc.id); }} className="p-2 bg-surface-card/80 hover:bg-danger rounded text-secondary hover:text-heading backdrop-blur-sm transition-colors shadow-sm">
                      <Trash2 size={16} />
                    </button>
                  </>
                )}
              </div>
              <div className="sm:w-1/3 h-48 sm:h-auto bg-surface-hover/50 relative">
                {loc.image_url ? (
                  <img src={loc.image_url} alt={loc.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <MapIcon size={32} className="text-icon" />
                  </div>
                )}
              </div>
              <div className="p-5 sm:w-2/3 flex flex-col">
                <h4 className="text-xl font-bold text-accent2-heading">{loc.name}</h4>
                <div className="text-sm text-accent2-text mb-3">{loc.region} {loc.type && `• ${loc.type}`}</div>
                {loc.description && (
                  <p className="text-sm text-secondary flex-1 line-clamp-3 mb-2">{loc.description}</p>
                )}
                {(loc.atmosphere || loc.present_npcs) && (
                  <div className="mt-auto text-xs text-faint space-y-1">
                    {loc.atmosphere && <div><span className="font-semibold text-muted">Atmosphere:</span> {loc.atmosphere}</div>}
                    {loc.present_npcs && <div><span className="font-semibold text-muted">NPCs:</span> {loc.present_npcs}</div>}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
