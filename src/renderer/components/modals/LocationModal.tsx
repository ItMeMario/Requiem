import React from 'react';
import { createPortal } from 'react-dom';
import { Map as MapIcon, X, Eye, Download } from 'lucide-react';
import { InputField } from '../InputField';
import { TextAreaField } from '../TextAreaField';
import { compressBase64Image } from '../../utils/imageCompressor';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { useAuth } from '../../context/AuthContext';

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
  const { user } = useAuth();
  const [activePreviewImage, setActivePreviewImage] = React.useState<string | null>(null);

  if (!showLocModal) return null;

  const handleDownloadPortrait = async () => {
    try {
      if (!newLoc.image_url) return;
      const name = `${(newLoc.name || 'location').toLowerCase().replace(/\s+/g, '_')}_location.png`;
      if (Capacitor.isNativePlatform()) {
        const base64Parts = newLoc.image_url.split(',');
        const base64Data = base64Parts[1] || base64Parts[0];
        const writeResult = await Filesystem.writeFile({
          path: name,
          data: base64Data,
          directory: Directory.Cache
        });
        await Share.share({
          title: name,
          url: writeResult.uri,
          dialogTitle: `Open/Share ${name}`,
        });
      } else {
        const a = document.createElement('a');
        a.href = newLoc.image_url;
        a.download = name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error downloading location image:', error);
      alert('Erro ao baixar imagem');
    }
  };

  return createPortal(
    <>
      <div className="fixed inset-0 bg-surface-overlay backdrop-blur-sm flex items-center justify-center z-[9999] p-0 sm:p-4">
        <div className="bg-surface-card sm:border border-border-default sm:rounded-xl w-full max-w-2xl shadow-2xl relative h-full sm:h-auto sm:max-h-[90vh] flex flex-col overflow-hidden">
          <button onClick={handleCloseLocModal} className="absolute top-4 right-4 text-muted hover:text-heading z-10"><X size={20} /></button>
          <div className="p-4 sm:p-6 pb-0 shrink-0">
            <h3 className="text-xl font-bold text-heading flex items-center gap-2"><MapIcon className="text-accent2-text"/> {editingLocId ? 'Edit Location' : 'New Location'}</h3>
          </div>
          <form onSubmit={handleCreateLoc} className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField label="Name *" value={newLoc.name} onChange={(e:any) => setNewLoc({...newLoc, name: e.target.value})} />
            <InputField label="Region (Região)" value={newLoc.region} onChange={(e:any) => setNewLoc({...newLoc, region: e.target.value})} />
            <InputField label="Type (Tipo)" value={newLoc.type} onChange={(e:any) => setNewLoc({...newLoc, type: e.target.value})} />
            {user && (
              <div className="flex items-center space-x-2 pb-2 h-full sm:pt-6">
                <input 
                  type="checkbox" 
                  id="loc-shared-checkbox"
                  checked={newLoc.shared !== false}
                  onChange={(e) => setNewLoc({...newLoc, shared: e.target.checked})}
                  className="w-4 h-4 rounded text-accent border-border-default focus:ring-accent bg-surface-elevated cursor-pointer"
                />
                <label htmlFor="loc-shared-checkbox" className="text-sm font-medium text-secondary cursor-pointer">
                  Compartilhar com o grupo (Lugar)
                </label>
              </div>
            )}
            <div className="flex flex-col space-y-1">
              <label className="text-sm font-medium text-secondary">Image (Imagem)</label>
              <div className="flex items-start gap-3">
                {newLoc.image_url && (
                  <div className="relative group w-12 h-12 rounded border border-border-subtle bg-surface-hover overflow-hidden shrink-0">
                    <img 
                      src={newLoc.image_url} 
                      className="w-full h-full object-cover cursor-zoom-in" 
                      alt="Thumbnail" 
                      onClick={() => setActivePreviewImage(newLoc.image_url)}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center justify-center gap-1">
                      <button 
                        type="button" 
                        onClick={() => setActivePreviewImage(newLoc.image_url)}
                        className="p-0.5 bg-surface-card hover:bg-surface-hover rounded text-heading transition-colors"
                        title="Visualizar"
                      >
                        <Eye size={12} />
                      </button>
                      <button 
                        type="button" 
                        onClick={handleDownloadPortrait}
                        className="p-0.5 bg-surface-card hover:bg-surface-hover rounded text-heading transition-colors"
                        title="Baixar"
                      >
                        <Download size={12} />
                      </button>
                    </div>
                  </div>
                )}
                <div className="flex-1 flex items-center gap-2">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = async () => {
                          const compressed = await compressBase64Image(reader.result as string);
                          setNewLoc({...newLoc, image_url: compressed});
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="block w-full text-sm text-secondary file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-surface-hover file:text-heading hover:file:bg-surface-elevated2 transition-colors cursor-pointer"
                  />
                  {newLoc.image_url && (
                    <button 
                      type="button" 
                      onClick={() => setNewLoc({...newLoc, image_url: ''})}
                      className="p-2 text-danger hover:bg-danger/10 rounded transition-colors"
                      title="Remove Image"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
          <TextAreaField label="Description (Descrição)" value={newLoc.description} onChange={(e:any) => setNewLoc({...newLoc, description: e.target.value})} />
          <TextAreaField label="Lore" value={newLoc.lore} onChange={(e:any) => setNewLoc({...newLoc, lore: e.target.value})} />
          <TextAreaField label="Present NPCs (NPCs Presentes)" value={newLoc.present_npcs} onChange={(e:any) => setNewLoc({...newLoc, present_npcs: e.target.value})} />
          <TextAreaField label="Atmosphere (Ambientação)" value={newLoc.atmosphere} onChange={(e:any) => setNewLoc({...newLoc, atmosphere: e.target.value})} />
            </div>

            <div className="p-4 sm:p-6 pt-4 flex justify-end bg-surface-card border-t border-border-default shrink-0">
              <button type="button" onClick={handleCloseLocModal} className="px-4 py-2 text-muted hover:text-heading transition-colors mr-2">Cancel</button>
              <button type="submit" disabled={!newLoc.name.trim()} className="px-5 py-2 bg-accent2 hover:bg-accent2-hover text-heading font-medium rounded transition-colors disabled:opacity-50">Save Location</button>
            </div>
          </form>
        </div>
      </div>

    {activePreviewImage && (
      <div 
        className="fixed inset-0 bg-black/95 z-[10000] flex items-center justify-center p-4 cursor-zoom-out"
        onClick={() => setActivePreviewImage(null)}
      >
        <div className="absolute top-4 right-4 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <button 
            className="text-white/70 hover:text-white bg-black/50 p-2 rounded-full hover:bg-black/80 transition-colors flex items-center justify-center"
            onClick={handleDownloadPortrait}
            title="Baixar imagem"
          >
            <Download size={20} />
          </button>
          <button 
            className="text-white/70 hover:text-white bg-black/50 p-2 rounded-full hover:bg-black/80 transition-colors"
            onClick={() => setActivePreviewImage(null)}
          >
            <X size={24} />
          </button>
        </div>
        <img 
          src={activePreviewImage} 
          className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" 
          alt="Preview"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    )}
    </>,
    document.body
  );
};
