import React from 'react';
import { createPortal } from 'react-dom';
import { User, X, Edit2 } from 'lucide-react';

interface CharacterViewModalProps {
  showCharViewModal: boolean;
  handleCloseCharViewModal: () => void;
  char: any;
  handleEditChar: (char: any) => void;
}

export const CharacterViewModal: React.FC<CharacterViewModalProps> = ({
  showCharViewModal,
  handleCloseCharViewModal,
  char,
  handleEditChar,
}) => {
  if (!showCharViewModal || !char) return null;

  return createPortal(
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
                    className="w-full h-full object-cover object-top"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
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
                <h1 className="text-3xl font-extrabold text-primary tracking-wide mb-1">
                  {char.name}
                </h1>
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
    </div>,
    document.body
  );
};
