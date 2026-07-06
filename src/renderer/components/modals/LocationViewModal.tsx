import React from 'react';
import { createPortal } from 'react-dom';
import { Map as MapIcon, X, Edit2, Download, Eye } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { useAuth } from '../../context/AuthContext';

interface LocationViewModalProps {
  showLocViewModal: boolean;
  handleCloseLocViewModal: () => void;
  loc: any;
  handleEditLoc: (loc: any) => void;
}

export const LocationViewModal: React.FC<LocationViewModalProps> = ({
  showLocViewModal,
  handleCloseLocViewModal,
  loc,
  handleEditLoc,
}) => {
  const { user } = useAuth();
  const [activePreviewImage, setActivePreviewImage] = React.useState<string | null>(null);

  if (!showLocViewModal || !loc) return null;

  const handleDownloadPortrait = async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        const base64Parts = loc.image_url.split(',');
        const base64Data = base64Parts[1] || base64Parts[0];
        const name = `${loc.name.toLowerCase().replace(/\s+/g, '_')}_location.png`;
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
        a.href = loc.image_url;
        a.download = `${loc.name.toLowerCase().replace(/\s+/g, '_')}_location.png`;
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
      <div className="bg-surface-card sm:border border-border-default sm:rounded-xl p-4 sm:p-6 w-full max-w-4xl shadow-2xl relative h-full sm:h-auto sm:max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-border-default mb-4 shrink-0">
          <h3 className="text-xl font-bold text-heading flex items-center gap-2">
            <MapIcon className="text-accent2-text" /> Location Details
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleEditLoc(loc)}
              className="px-3 py-1.5 bg-surface-hover hover:opacity-90 rounded text-secondary hover:text-heading transition-colors border border-border-hover flex items-center space-x-1.5 text-sm font-medium"
            >
              <Edit2 size={14} />
              <span>Edit</span>
            </button>
            <button
              onClick={handleCloseLocViewModal}
              className="p-1.5 text-muted hover:text-heading transition-colors rounded-full hover:bg-surface-hover"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {/* Left Column: Image */}
            <div className="md:col-span-2 flex flex-col">
              {loc.image_url ? (
                <div className="w-full aspect-[4/3] md:aspect-[3/4] max-h-[350px] md:max-h-[480px] bg-surface-hover rounded-lg overflow-hidden border border-border-subtle shadow-md relative group">
                  <img
                    src={loc.image_url}
                    alt={loc.name}
                    className="w-full h-full object-cover cursor-zoom-in"
                    onClick={() => setActivePreviewImage(loc.image_url)}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => setActivePreviewImage(loc.image_url)}
                      className="p-3 bg-surface-card hover:bg-surface-hover rounded-full text-heading transition-colors shadow-lg"
                      title="Visualizar Imagem"
                    >
                      <Eye size={20} />
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadPortrait}
                      className="p-3 bg-surface-card hover:bg-surface-hover rounded-full text-heading transition-colors shadow-lg"
                      title="Baixar Imagem"
                    >
                      <Download size={20} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="w-full aspect-[4/3] md:aspect-[3/4] max-h-[250px] md:max-h-[480px] bg-surface-hover/30 rounded-lg border-2 border-dashed border-border-subtle flex flex-col items-center justify-center text-faint py-12">
                  <MapIcon size={64} className="text-icon mb-2 opacity-50" />
                  <span className="text-sm font-medium italic">No Image</span>
                </div>
              )}
            </div>

            {/* Right Column: Location Information */}
            <div className="md:col-span-3 space-y-6">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-3xl font-extrabold text-accent2-heading tracking-wide">
                    {loc.name}
                  </h1>
                  {user && (
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${
                      loc.shared === true
                        ? 'bg-green-500/10 text-green-400 border-green-500/30'
                        : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                    }`}>
                      {loc.shared === true ? 'Grupo' : 'Pessoal'}
                    </span>
                  )}
                </div>
                {loc.authorName && (
                  <p className="text-xs text-accent-text mb-2">
                    Criado por: <span className="font-semibold">{loc.authorName}</span>
                  </p>
                )}
                <div className="flex flex-wrap gap-2 mt-2">
                  {loc.region && (
                    <span className="px-3 py-1 bg-surface-hover text-secondary text-xs font-semibold rounded-full border border-border-subtle">
                      Region: {loc.region}
                    </span>
                  )}
                  {loc.type && (
                    <span className="px-3 py-1 bg-surface-hover text-secondary text-xs font-semibold rounded-full border border-border-subtle">
                      Type: {loc.type}
                    </span>
                  )}
                </div>
              </div>

              {/* Fields */}
              <div className="space-y-4">
                {loc.description && (
                  <div className="space-y-1.5">
                    <h4 className="text-xs uppercase font-bold text-accent2-heading tracking-wider">
                      Description
                    </h4>
                    <p className="text-sm text-secondary whitespace-pre-wrap leading-relaxed bg-surface-hover/20 p-4 rounded-lg border border-border-subtle">
                      {loc.description}
                    </p>
                  </div>
                )}

                {loc.atmosphere && (
                  <div className="space-y-1.5">
                    <h4 className="text-xs uppercase font-bold text-accent2-heading tracking-wider">
                      Atmosphere / Mood
                    </h4>
                    <p className="text-sm text-secondary whitespace-pre-wrap leading-relaxed bg-surface-hover/20 p-4 rounded-lg border border-border-subtle">
                      {loc.atmosphere}
                    </p>
                  </div>
                )}

                {loc.present_npcs && (
                  <div className="space-y-1.5">
                    <h4 className="text-xs uppercase font-bold text-accent2-heading tracking-wider">
                      Present NPCs
                    </h4>
                    <p className="text-sm text-secondary whitespace-pre-wrap leading-relaxed bg-surface-hover/20 p-4 rounded-lg border border-border-subtle">
                      {loc.present_npcs}
                    </p>
                  </div>
                )}

                {loc.lore && (
                  <div className="space-y-1.5">
                    <h4 className="text-xs uppercase font-bold text-accent2-heading tracking-wider">
                      Lore / History
                    </h4>
                    <p className="text-sm text-secondary whitespace-pre-wrap leading-relaxed bg-surface-hover/20 p-4 rounded-lg border border-border-subtle">
                      {loc.lore}
                    </p>
                  </div>
                )}
                
                {!loc.description && !loc.atmosphere && !loc.present_npcs && !loc.lore && (
                  <div className="text-sm italic text-faint py-4">
                    No detailed description, atmosphere, NPCs, or lore recorded for this location yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 flex justify-end border-t border-border-default mt-4 shrink-0">
          <button
            onClick={handleCloseLocViewModal}
            className="px-5 py-2 bg-surface-hover hover:opacity-80 border border-border-hover text-heading font-medium rounded transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
    
    {/* Lightbox Preview */}
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
