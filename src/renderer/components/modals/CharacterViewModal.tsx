import React from 'react';
import { createPortal } from 'react-dom';
import { User, X, Edit2, Paperclip, FileText, Download, Eye, Trash2 } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { useAuth } from '../../context/AuthContext';

interface CharacterViewModalProps {
  showCharViewModal: boolean;
  handleCloseCharViewModal: () => void;
  char: any;
  handleEditChar: (char: any) => void;
  handleDeleteAttachment: (charId: number, attachmentId: string) => void;
}

export const CharacterViewModal: React.FC<CharacterViewModalProps> = ({
  showCharViewModal,
  handleCloseCharViewModal,
  char,
  handleEditChar,
  handleDeleteAttachment,
}) => {
  const { user } = useAuth();
  const [activePreviewImage, setActivePreviewImage] = React.useState<string | null>(null);

  if (!showCharViewModal || !char) return null;

  const handleDownloadAttachment = async (attachment: any) => {
    try {
      if (Capacitor.isNativePlatform()) {
        const base64Parts = attachment.url.split(',');
        const base64Data = base64Parts[1] || base64Parts[0];
        const writeResult = await Filesystem.writeFile({
          path: attachment.name,
          data: base64Data,
          directory: Directory.Cache
        });
        await Share.share({
          title: attachment.name,
          url: writeResult.uri,
          dialogTitle: `Open/Share ${attachment.name}`,
        });
      } else {
        const a = document.createElement('a');
        a.href = attachment.url;
        a.download = attachment.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error downloading attachment:', error);
      alert('Erro ao baixar anexo');
    }
  };

  const handleDownloadPortrait = async () => {
    try {
      const portraitAttachment = {
        name: `${char.name.toLowerCase().replace(/\s+/g, '_')}_portrait.png`,
        url: char.image_url
      };
      await handleDownloadAttachment(portraitAttachment);
    } catch (error) {
      console.error('Error downloading portrait:', error);
      alert('Erro ao baixar retrato');
    }
  };

  return createPortal(
    <>
      <div className="fixed inset-0 bg-surface-overlay backdrop-blur-sm flex items-center justify-center z-[9999] p-0 sm:p-4">
      <div className="bg-surface-card sm:border border-border-default sm:rounded-xl p-4 sm:p-6 w-full max-w-4xl shadow-2xl relative h-full sm:h-auto sm:max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-border-default mb-4 shrink-0">
          <h3 className="text-xl font-bold text-heading flex items-center gap-2">
            <User className="text-accent-text" /> Character Details
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleEditChar(char)}
              className="px-3 py-1.5 bg-surface-hover hover:opacity-90 rounded text-secondary hover:text-heading transition-colors border border-border-hover flex items-center space-x-1.5 text-sm font-medium"
            >
              <Edit2 size={14} />
              <span>Edit</span>
            </button>
            <button
              onClick={handleCloseCharViewModal}
              className="p-1.5 text-muted hover:text-heading transition-colors rounded-full hover:bg-surface-hover"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {/* Left Column: Image / Portrait */}
            <div className="md:col-span-2 flex flex-col">
              {char.image_url ? (
                <div className="w-full aspect-[3/4] max-h-[350px] md:max-h-[480px] bg-surface-hover rounded-lg overflow-hidden border border-border-subtle shadow-md relative group">
                  <img
                    src={char.image_url}
                    alt={char.name}
                    className="w-full h-full object-cover object-top cursor-zoom-in"
                    onClick={() => setActivePreviewImage(char.image_url)}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => setActivePreviewImage(char.image_url)}
                      className="p-3 bg-surface-card hover:bg-surface-hover rounded-full text-heading transition-colors shadow-lg"
                      title="Visualizar Retrato"
                    >
                      <Eye size={20} />
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadPortrait}
                      className="p-3 bg-surface-card hover:bg-surface-hover rounded-full text-heading transition-colors shadow-lg"
                      title="Baixar Retrato"
                    >
                      <Download size={20} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="w-full aspect-[3/4] max-h-[250px] md:max-h-[480px] bg-surface-hover/30 rounded-lg border-2 border-dashed border-border-subtle flex flex-col items-center justify-center text-faint py-12">
                  <User size={64} className="text-icon mb-2 opacity-50" />
                  <span className="text-sm font-medium italic">No Portrait</span>
                </div>
              )}
            </div>

            {/* Right Column: Character Information */}
            <div className="md:col-span-3 space-y-6">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-3xl font-extrabold text-primary tracking-wide">
                    {char.name}
                  </h1>
                  {user && (
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${
                      char.shared === true
                        ? 'bg-green-500/10 text-green-400 border-green-500/30'
                        : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                    }`}>
                      {char.shared === true ? 'Grupo' : 'Pessoal'}
                    </span>
                  )}
                </div>
                {char.authorName && (
                  <p className="text-xs text-accent-text mb-2">
                    Criado por: <span className="font-semibold">{char.authorName}</span>
                  </p>
                )}
                <div className="flex flex-wrap gap-2 mt-2">
                  {char.race && (
                    <span className="px-3 py-1 bg-surface-hover text-secondary text-xs font-semibold rounded-full border border-border-subtle">
                      {char.race}
                    </span>
                  )}
                  {char.age && (
                    <span className="px-3 py-1 bg-surface-hover text-secondary text-xs font-semibold rounded-full border border-border-subtle">
                      {char.age} years old
                    </span>
                  )}
                  {char.status && (
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${
                      char.status.toLowerCase() === 'alive' || char.status.toLowerCase() === 'ativo' || char.status.toLowerCase() === 'vivo'
                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                        : char.status.toLowerCase() === 'dead' || char.status.toLowerCase() === 'morto'
                        ? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                        : 'bg-surface-hover text-secondary border-border-subtle'
                    }`}>
                      {char.status}
                    </span>
                  )}
                  {char.faction && (
                    <span className="px-3 py-1 bg-accent-muted-bg text-accent-text text-xs font-semibold rounded-full border border-accent/20">
                      {char.faction}
                    </span>
                  )}
                </div>
              </div>

              {/* Fields */}
              <div className="space-y-4">
                {char.lore && (
                  <div className="space-y-1.5">
                    <h4 className="text-xs uppercase font-bold text-accent-text tracking-wider">
                      Lore / Background
                    </h4>
                    <p className="text-sm text-secondary whitespace-pre-wrap leading-relaxed bg-surface-hover/20 p-4 rounded-lg border border-border-subtle">
                      {char.lore}
                    </p>
                  </div>
                )}

                {char.bonds && (
                  <div className="space-y-1.5">
                    <h4 className="text-xs uppercase font-bold text-accent-text tracking-wider">
                      Bonds / Relationships
                    </h4>
                    <p className="text-sm text-secondary whitespace-pre-wrap leading-relaxed bg-surface-hover/20 p-4 rounded-lg border border-border-subtle">
                      {char.bonds}
                    </p>
                  </div>
                )}

                {char.personal_notes && (
                  <div className="space-y-1.5">
                    <h4 className="text-xs uppercase font-bold text-accent-text tracking-wider">
                      Personal Notes
                    </h4>
                    <p className="text-sm text-secondary whitespace-pre-wrap leading-relaxed bg-surface-hover/20 p-4 rounded-lg border border-border-subtle">
                      {char.personal_notes}
                    </p>
                  </div>
                )}

                {/* Attachments Section */}
                {char.attachments && char.attachments.length > 0 && (
                  <div className="space-y-2 mt-6">
                    <h4 className="text-xs uppercase font-bold text-accent-text tracking-wider flex items-center gap-1.5">
                      <Paperclip size={14} /> Anexos / Arquivos
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {char.attachments.map((att: any) => {
                        const isImage = att.type.startsWith('image/');
                        return (
                          <div key={att.id} className="bg-surface-hover/30 border border-border-subtle rounded-lg p-3 flex flex-col justify-between hover:border-border-hover transition-colors">
                            <div className="flex items-start gap-2.5 mb-3">
                              {isImage ? (
                                <div 
                                  className="w-12 h-12 rounded overflow-hidden border border-border-subtle bg-surface-hover shrink-0 cursor-pointer"
                                  onClick={() => setActivePreviewImage(att.url)}
                                  title="Clique para ver imagem"
                                >
                                  <img src={att.url} className="w-full h-full object-cover" alt="" />
                                </div>
                              ) : (
                                <div className="w-12 h-12 rounded bg-accent-muted-bg border border-accent/20 flex items-center justify-center text-accent-text shrink-0">
                                  <FileText size={24} />
                                </div>
                              )}
                              <div className="min-w-0 flex-1">
                                <p 
                                  className="text-sm font-semibold text-heading truncate cursor-pointer hover:text-accent-text transition-colors" 
                                  title={att.name}
                                  onClick={() => handleDownloadAttachment(att)}
                                >
                                  {att.name}
                                </p>
                                <p className="text-xs text-muted">
                                  {att.size ? `${(att.size / 1024).toFixed(1)} KB` : 'Tamanho desconhecido'}
                                </p>
                              </div>
                            </div>
                             <div className="flex gap-2">
                              <button
                                onClick={() => handleDownloadAttachment(att)}
                                className="flex-1 py-1.5 bg-surface-hover hover:bg-surface-elevated2 border border-border-hover text-secondary hover:text-heading text-xs font-semibold rounded transition-colors flex items-center justify-center gap-1"
                              >
                                <Download size={12} />
                                <span>Baixar</span>
                              </button>
                              {isImage && (
                                <button
                                  onClick={() => setActivePreviewImage(att.url)}
                                  className="px-2.5 py-1.5 bg-surface-hover hover:bg-surface-elevated2 border border-border-hover text-secondary hover:text-heading text-xs font-semibold rounded transition-colors flex items-center justify-center"
                                  title="Ver imagem"
                                >
                                  <Eye size={12} />
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteAttachment(char.id, att.id)}
                                className="px-2.5 py-1.5 bg-surface-hover hover:bg-danger/10 border border-border-hover hover:border-danger/30 text-secondary hover:text-danger text-xs font-semibold rounded transition-colors flex items-center justify-center"
                                title="Deletar anexo"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {!char.lore && !char.bonds && !char.personal_notes && (
                  <div className="text-sm italic text-faint py-4">
                    No detailed history, bonds, or notes recorded for this character yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 flex justify-end border-t border-border-default mt-4 shrink-0">
          <button
            onClick={handleCloseCharViewModal}
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
            onClick={async () => {
              const attachment = char.attachments?.find((a: any) => a.url === activePreviewImage);
              const name = attachment ? attachment.name : `${char.name.toLowerCase().replace(/\s+/g, '_')}_portrait.png`;
              try {
                if (Capacitor.isNativePlatform()) {
                  const base64Parts = activePreviewImage.split(',');
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
                  a.href = activePreviewImage;
                  a.download = name;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                }
              } catch (error) {
                console.error('Error downloading in preview:', error);
                alert('Erro ao baixar imagem');
              }
            }}
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
