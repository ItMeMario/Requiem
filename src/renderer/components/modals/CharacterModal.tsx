import React from 'react';
import { createPortal } from 'react-dom';
import { User, X, Plus, Trash2, FileText, Eye, Download } from 'lucide-react';
import { InputField } from '../InputField';
import { TextAreaField } from '../TextAreaField';
import { compressBase64Image } from '../../utils/imageCompressor';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { useAuth } from '../../context/AuthContext';

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
  const { user } = useAuth();
  const [activePreviewImage, setActivePreviewImage] = React.useState<string | null>(null);

  if (!showCharModal) return null;

  const handleAddAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (file.size > 1048576) {
        alert(`O arquivo "${file.name}" excede o limite de 1MB.`);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = async () => {
        let fileUrl = reader.result as string;
        if (file.type.startsWith('image/')) {
          fileUrl = await compressBase64Image(fileUrl);
        }
        const newAttachment = {
          id: Date.now().toString() + Math.random().toString(36).substring(2, 7),
          name: file.name,
          type: file.type,
          url: fileUrl,
          size: file.size
        };
        setNewChar((prev: any) => ({
          ...prev,
          attachments: [...(prev.attachments || []), newAttachment]
        }));
      };

      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleDownloadPortrait = async () => {
    try {
      if (!newChar.image_url) return;
      const name = `${(newChar.name || 'character').toLowerCase().replace(/\s+/g, '_')}_portrait.png`;
      if (Capacitor.isNativePlatform()) {
        const base64Parts = newChar.image_url.split(',');
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
        a.href = newChar.image_url;
        a.download = name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error downloading portrait:', error);
      alert('Erro ao baixar retrato');
    }
  };

  return createPortal(
    <>
      <div className="fixed inset-0 bg-surface-overlay backdrop-blur-sm flex items-center justify-center z-[9999] p-0 sm:p-4">
      <div className="bg-surface-card sm:border border-border-default sm:rounded-xl p-4 sm:p-6 w-full max-w-2xl shadow-2xl relative h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto custom-scrollbar flex flex-col">
        <button onClick={handleCloseCharModal} className="absolute top-4 right-4 text-muted hover:text-heading"><X size={20} /></button>
        <h3 className="text-xl font-bold text-heading mb-6 flex items-center gap-2"><User className="text-accent-text"/> {editingCharId ? 'Edit Character' : 'New Character'}</h3>
        <form onSubmit={handleCreateChar} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField label="Name *" value={newChar.name} onChange={(e:any) => setNewChar({...newChar, name: e.target.value})} />
            <InputField label="Race (Raça)" value={newChar.race} onChange={(e:any) => setNewChar({...newChar, race: e.target.value})} />
            <InputField label="Status" value={newChar.status} onChange={(e:any) => setNewChar({...newChar, status: e.target.value})} />
            <InputField label="Age (Idade)" value={newChar.age} onChange={(e:any) => setNewChar({...newChar, age: e.target.value})} />
            <InputField label="Faction (Facção)" value={newChar.faction} onChange={(e:any) => setNewChar({...newChar, faction: e.target.value})} />
            {user && (
              <div className="flex items-center space-x-2 pb-2 h-full sm:pt-6">
                <input 
                  type="checkbox" 
                  id="char-shared-checkbox"
                  checked={newChar.shared !== false}
                  onChange={(e) => setNewChar({...newChar, shared: e.target.checked})}
                  className="w-4 h-4 rounded text-accent border-border-default focus:ring-accent bg-surface-elevated cursor-pointer"
                />
                <label htmlFor="char-shared-checkbox" className="text-sm font-medium text-secondary cursor-pointer">
                  Compartilhar com o grupo (Personagem)
                </label>
              </div>
            )}
            <div className="flex flex-col space-y-1">
              <label className="text-sm font-medium text-secondary">Image (Imagem)</label>
              <div className="flex items-start gap-3">
                {newChar.image_url && (
                  <div className="relative group w-12 h-12 rounded border border-border-subtle bg-surface-hover overflow-hidden shrink-0">
                    <img 
                      src={newChar.image_url} 
                      className="w-full h-full object-cover cursor-zoom-in" 
                      alt="Thumbnail" 
                      onClick={() => setActivePreviewImage(newChar.image_url)}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center justify-center gap-1">
                      <button 
                        type="button" 
                        onClick={() => setActivePreviewImage(newChar.image_url)}
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
                          setNewChar({...newChar, image_url: compressed});
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="block w-full text-sm text-secondary file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-surface-hover file:text-heading hover:file:bg-surface-elevated2 transition-colors cursor-pointer"
                  />
                  {newChar.image_url && (
                    <button 
                      type="button" 
                      onClick={() => setNewChar({...newChar, image_url: ''})}
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
          <TextAreaField label="Lore" value={newChar.lore} onChange={(e:any) => setNewChar({...newChar, lore: e.target.value})} />
          <TextAreaField label="Bonds (Vínculos)" value={newChar.bonds} onChange={(e:any) => setNewChar({...newChar, bonds: e.target.value})} />
          <TextAreaField label="Personal Notes (Notas pessoais)" value={newChar.personal_notes} onChange={(e:any) => setNewChar({...newChar, personal_notes: e.target.value})} />
          
          {/* Attachments Section */}
          <div className="mt-4 border-t border-border-default pt-4">
            <label className="text-sm font-medium text-secondary block mb-2">Anexos (Imagens, PDFs, fichas, etc.)</label>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
              {(newChar.attachments || []).map((att: any) => (
                <div key={att.id} className="flex items-center justify-between p-2 bg-surface-hover rounded-lg border border-border-subtle text-sm">
                  <div className="flex items-center gap-2 truncate pr-2">
                    {att.type.startsWith('image/') ? (
                      <img src={att.url} className="w-8 h-8 object-cover rounded" alt="" />
                    ) : (
                      <FileText size={20} className="text-accent-text shrink-0" />
                    )}
                    <div className="truncate">
                      <p className="text-heading font-medium truncate" title={att.name}>{att.name}</p>
                      <p className="text-xs text-muted">{(att.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setNewChar((prev: any) => ({
                        ...prev,
                        attachments: prev.attachments.filter((a: any) => a.id !== att.id)
                      }));
                    }}
                    className="p-1 text-danger hover:bg-danger/10 rounded transition-colors shrink-0"
                    title="Remover Anexo"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="char-attachments-upload" className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-hover hover:bg-surface-elevated2 border border-border-hover text-secondary hover:text-heading rounded text-sm font-medium transition-colors cursor-pointer">
                <Plus size={16} />
                <span>Adicionar Anexo</span>
              </label>
              <input 
                type="file" 
                id="char-attachments-upload" 
                multiple 
                onChange={handleAddAttachment} 
                className="hidden" 
              />
              <span className="text-xs text-muted">Max 1MB por arquivo</span>
            </div>
          </div>

          <div className="pt-4 flex justify-end sticky bottom-0 bg-surface-card py-2 border-t border-border-default mt-4">
            <button type="button" onClick={handleCloseCharModal} className="px-4 py-2 text-muted hover:text-heading transition-colors mr-2">Cancel</button>
            <button type="submit" disabled={!newChar.name.trim()} className="px-5 py-2 bg-accent hover:bg-accent-hover text-heading font-medium rounded transition-colors disabled:opacity-50">Save Character</button>
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
