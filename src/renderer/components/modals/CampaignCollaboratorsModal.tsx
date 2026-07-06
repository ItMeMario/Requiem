import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Users, Trash2, Plus, Loader2 } from 'lucide-react';
import { getDataService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import { ConfirmDialog } from '../../resources/ConfirmDialog';

interface CampaignCollaboratorsModalProps {
  showCollaboratorsModal: boolean;
  setShowCollaboratorsModal: (show: boolean) => void;
  campaign: any;
  theme: string;
  onCollaboratorsUpdated: (newCollaborators: string[]) => void;
}

export const CampaignCollaboratorsModal: React.FC<CampaignCollaboratorsModalProps> = ({
  showCollaboratorsModal,
  setShowCollaboratorsModal,
  campaign,
  theme,
  onCollaboratorsUpdated
}) => {
  const { user } = useAuth();
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [addingEmail, setAddingEmail] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    onCancel: () => {}
  });

  const isCyber = theme === 'cyberpunk';
  const isMed = theme === 'medieval';
  const isVamp = theme === 'vampire';

  useEffect(() => {
    if (showCollaboratorsModal && campaign?.id) {
      loadCollaborators();
    }
    // Reset states
    setAddingEmail('');
    setErrorMsg(null);
  }, [showCollaboratorsModal, campaign]);

  const loadCollaborators = async () => {
    setLoadingList(true);
    setErrorMsg(null);
    try {
      const list = await getDataService().getCollaborators(campaign.id);
      setCollaborators(list);
    } catch (err) {
      console.error('Failed to load collaborators:', err);
      setErrorMsg('Erro ao carregar lista de colaboradores.');
    } finally {
      setLoadingList(false);
    }
  };

  const handleAddCollaborator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addingEmail.trim() || !campaign?.id) return;
    setIsAdding(true);
    setErrorMsg(null);
    try {
      await getDataService().addCollaborator(campaign.id, addingEmail);
      // Success: reload list
      setAddingEmail('');
      await loadCollaborators();
      
      // Update parent state
      const updatedCampaign = await getDataService().getCampaign(campaign.id);
      onCollaboratorsUpdated(updatedCampaign.collaborators || []);
    } catch (err: any) {
      console.error('Failed to add collaborator:', err);
      setErrorMsg(err.message || 'Erro ao adicionar jogador.');
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveCollaborator = (uid: string) => {
    if (!campaign?.id) return;
    setConfirmDialog({
      isOpen: true,
      title: 'Remover Colaborador',
      message: 'Tem certeza que deseja remover este jogador como colaborador?',
      onConfirm: async () => {
        setConfirmDialog((prev: any) => ({ ...prev, isOpen: false }));
        setErrorMsg(null);
        try {
          await getDataService().removeCollaborator(campaign.id, uid);
          await loadCollaborators();
          
          // Update parent state
          const updatedCampaign = await getDataService().getCampaign(campaign.id);
          onCollaboratorsUpdated(updatedCampaign.collaborators || []);
        } catch (err: any) {
          console.error('Failed to remove collaborator:', err);
          setErrorMsg('Erro ao remover jogador.');
        }
      },
      onCancel: () => setConfirmDialog((prev: any) => ({ ...prev, isOpen: false }))
    });
  };

  if (!showCollaboratorsModal || !campaign) return null;

  // Theming classes
  const modalOverlayClass = "fixed inset-0 bg-surface-overlay backdrop-blur-sm flex items-center justify-center z-[9999] p-4";
  
  const cardClass = isCyber
    ? "cyber-metallic-panel border-[#0ff]/50 shadow-[0_0_30px_rgba(0,255,255,0.3)] w-full max-w-lg p-6 relative max-h-[90vh] flex flex-col font-mono"
    : isMed
    ? "wood-plank border-2 border-[#8b4513] w-full max-w-lg p-6 relative max-h-[90vh] flex flex-col font-serif"
    : isVamp
    ? "bg-[#0d0d12] border border-[#ff3333]/40 shadow-[0_0_40px_rgba(80,0,0,0.6)] w-full max-w-lg p-6 relative max-h-[90vh] flex flex-col font-serif"
    : "bg-surface-card border border-border-default rounded-xl w-full max-w-lg p-6 relative max-h-[90vh] flex flex-col shadow-2xl";

  const textHeaderClass = isCyber
    ? "text-xl font-bold text-[#0ff] tracking-widest uppercase flex items-center gap-2"
    : isVamp
    ? "text-xl font-bold text-[#e0e0e0] flex items-center gap-2"
    : isMed
    ? "text-xl font-bold text-[#f4eacc] flex items-center gap-2"
    : "text-xl font-bold text-heading flex items-center gap-2";

  const closeButtonClass = isCyber
    ? "absolute top-4 right-4 text-[#0ff] hover:text-white"
    : isMed
    ? "absolute top-4 right-4 text-[#d9c596] hover:text-[#f4eacc]"
    : isVamp
    ? "absolute top-4 right-4 text-[#a0a0b0] hover:text-[#ff3333]"
    : "absolute top-4 right-4 text-muted hover:text-heading";

  const inputClass = isCyber
    ? "flex-1 bg-black/40 border border-[#0ff]/30 text-[#0ff] px-3 py-2 text-sm focus:outline-none focus:border-[#0ff]"
    : isMed
    ? "flex-1 bg-[#2b1806]/40 border border-[#5c2e0b] text-[#f4eacc] placeholder-[#f4eacc]/50 px-3 py-2 text-sm focus:outline-none focus:border-[#8b4513]"
    : isVamp
    ? "flex-1 bg-[#15151c] border border-[#3d3d4a] text-[#d1d1d6] placeholder-[#8e8e93] px-3 py-2 text-sm focus:outline-none focus:border-[#ff3333]"
    : "flex-1 bg-surface-elevated border border-border-subtle text-heading placeholder-muted px-3 py-2 text-sm rounded focus:outline-none focus:border-accent";

  const buttonAddClass = isCyber
    ? "px-4 py-2 border border-[#0ff] bg-[#0ff]/20 text-[#0ff] hover:bg-[#0ff]/40 flex items-center gap-1.5 transition-all text-xs font-bold uppercase tracking-wider"
    : isMed
    ? "px-4 py-2 bg-[#8b4513] text-[#f4eacc] border border-[#5c2e0b] hover:bg-[#a0522d] flex items-center gap-1.5 transition-all text-sm font-medium"
    : isVamp
    ? "px-4 py-2 bg-[#500000] text-[#e0e0e0] border border-[#8b0000] hover:bg-[#8b0000] flex items-center gap-1.5 transition-all text-sm font-medium"
    : "px-4 py-2 bg-accent text-accent-text hover:bg-accent-hover rounded flex items-center gap-1.5 transition-all text-sm font-medium";

  return createPortal(
    <>
      <div className={modalOverlayClass}>
      <div className={cardClass}>
        <button onClick={() => setShowCollaboratorsModal(false)} className={closeButtonClass}>
          <X size={20} />
        </button>

        <div className="flex items-center gap-2 mb-6 border-b border-border-subtle pb-4 flex-shrink-0">
          <Users className={isCyber ? "text-[#0ff]" : isVamp ? "text-[#ff3333]" : "text-accent-text"} size={22} />
          <h3 className={textHeaderClass}>Compartilhar Campanha</h3>
        </div>

        {/* Add Collaborator Form */}
        <form onSubmit={handleAddCollaborator} className="mb-6 flex-shrink-0">
          <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${isCyber ? "text-[#0ff]/70" : isVamp ? "text-[#a0a0b0]" : isMed ? "text-[#d9c596]" : "text-muted"}`}>
            Convidar Jogador por E-mail
          </label>
          <div className="flex gap-2">
            <input
              type="email"
              required
              className={inputClass}
              placeholder="exemplo@gmail.com"
              value={addingEmail}
              onChange={(e) => setAddingEmail(e.target.value)}
              disabled={isAdding}
            />
            <button type="submit" disabled={isAdding || !addingEmail.trim()} className={buttonAddClass}>
              {isAdding ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  <Plus size={16} />
                  <span>Convidar</span>
                </>
              )}
            </button>
          </div>
          {errorMsg && (
            <p className="text-red-500 text-xs mt-2 font-medium">{errorMsg}</p>
          )}
        </form>

        {/* Collaborators List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar min-h-[200px]">
          <h4 className={`text-xs font-bold uppercase tracking-wider mb-3 ${isCyber ? "text-[#0ff]/70" : isVamp ? "text-[#a0a0b0]" : isMed ? "text-[#d9c596]" : "text-muted"}`}>
            Membros Atuais
          </h4>
          
          {loadingList ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 size={24} className={`animate-spin ${isCyber ? "text-[#0ff]" : isVamp ? "text-[#ff3333]" : "text-accent-text"}`} />
              <span className="text-xs text-muted mt-2">Carregando lista...</span>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Campaign Owner (always show first) */}
              <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg border border-border-subtle/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-xs font-bold text-accent-text">
                    M
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${isCyber ? "text-white" : "text-heading"}`}>Mestre da Campanha</p>
                    <p className="text-xs text-muted">Dono</p>
                  </div>
                </div>
                <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${isCyber ? "bg-[#0ff]/20 text-[#0ff] border border-[#0ff]/40" : isVamp ? "bg-[#ff3333]/20 text-[#ff3333]" : isMed ? "bg-[#8b4513] text-[#f4eacc]" : "bg-accent/20 text-accent-text"}`}>
                  Dono
                </span>
              </div>

              {/* Collaborators */}
              {collaborators.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-border-subtle rounded-lg">
                  <p className="text-xs text-muted italic">Nenhum jogador convidado ainda.</p>
                </div>
              ) : (
                collaborators.map((c) => (
                  <div key={c.uid} className="flex items-center justify-between p-3 bg-surface-hover/30 rounded-lg border border-border-subtle/5">
                    <div className="flex items-center gap-3 truncate pr-2">
                      {c.photoURL ? (
                        <img src={c.photoURL} alt="" className="w-8 h-8 rounded-full" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-surface-elevated flex items-center justify-center text-xs font-bold text-secondary border border-border-subtle">
                          {c.displayName?.charAt(0) || c.email?.charAt(0) || 'U'}
                        </div>
                      )}
                      <div className="truncate">
                        <p className={`text-sm font-semibold truncate ${isCyber ? "text-white" : "text-heading"}`}>{c.displayName || 'Sem Nome'}</p>
                        <p className="text-xs text-muted truncate" title={c.email}>{c.email}</p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleRemoveCollaborator(c.uid)}
                      className="p-1.5 text-muted hover:text-red-500 hover:bg-red-500/10 rounded transition-colors shrink-0"
                      title="Remover Colaborador"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
      </div>
      <ConfirmDialog {...confirmDialog} />
    </>,
    document.body
  );
};
