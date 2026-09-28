import React, { useState, useEffect } from 'react';
import { Users, Check, Loader2 } from 'lucide-react';
import { getDataService } from '../../services';

interface AssignPlayersSelectProps {
  campaignId: number;
  assignedTo?: string[] | null;
  onChange: (newAssignedTo: string[]) => void;
  disabled?: boolean;
}

export const AssignPlayersSelect: React.FC<AssignPlayersSelectProps> = ({
  campaignId,
  assignedTo = [],
  onChange,
  disabled = false
}) => {
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadCollaborators = async () => {
      if (!campaignId) return;
      setLoading(true);
      try {
        const list = await getDataService().getCollaborators(campaignId);
        if (isMounted) {
          setCollaborators(list || []);
        }
      } catch (err) {
        console.error('Failed to load collaborators for assignment:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadCollaborators();
    return () => {
      isMounted = false;
    };
  }, [campaignId]);

  const currentAssigned = Array.isArray(assignedTo) ? assignedTo : [];

  const togglePlayer = (uid: string) => {
    if (disabled) return;
    if (currentAssigned.includes(uid)) {
      onChange(currentAssigned.filter(id => id !== uid));
    } else {
      onChange([...currentAssigned, uid]);
    }
  };

  const selectedCount = currentAssigned.length;

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-secondary flex items-center gap-2">
          <Users size={16} className="text-accent-text" />
          <span>Atribuir a Jogadores (Permissão de Edição)</span>
        </label>
        {selectedCount > 0 && (
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-accent/15 text-accent-text border border-accent/30">
            {selectedCount} {selectedCount === 1 ? 'jogador' : 'jogadores'}
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-2.5 px-3 text-xs text-muted bg-surface-input rounded border border-border-default">
          <Loader2 size={14} className="animate-spin text-accent-text" />
          <span>Carregando jogadores da campanha...</span>
        </div>
      ) : collaborators.length === 0 ? (
        <div className="py-2.5 px-3 text-xs text-faint italic bg-surface-input rounded border border-border-default">
          Nenhum jogador convidado na campanha ainda. Convide jogadores pelo menu de Colaboradores.
        </div>
      ) : (
        <div className="space-y-1.5 max-h-44 overflow-y-auto custom-scrollbar p-2 bg-surface-input rounded-lg border border-border-default">
          {collaborators.map((c) => {
            const isSelected = currentAssigned.includes(c.uid);
            return (
              <button
                key={c.uid}
                type="button"
                onClick={() => togglePlayer(c.uid)}
                disabled={disabled}
                className={`w-full flex items-center justify-between p-2 rounded text-left transition-all ${
                  isSelected
                    ? 'bg-accent/20 border border-accent/40 text-heading shadow-sm'
                    : 'bg-surface-card/60 hover:bg-surface-hover/80 border border-border-subtle/50 text-secondary'
                } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="flex items-center gap-2.5 truncate pr-2">
                  {c.photoURL ? (
                    <img src={c.photoURL} alt="" className="w-6 h-6 rounded-full shrink-0 object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-accent/30 text-accent-text flex items-center justify-center text-xs font-bold shrink-0">
                      {(c.displayName || c.email || 'J')[0].toUpperCase()}
                    </div>
                  )}
                  <div className="truncate">
                    <p className="text-xs font-semibold truncate leading-tight">
                      {c.displayName || 'Jogador'}
                    </p>
                    {c.email && (
                      <p className="text-[10px] text-muted truncate leading-tight">
                        {c.email}
                      </p>
                    )}
                  </div>
                </div>

                <div className={`w-4 h-4 rounded flex items-center justify-center border transition-colors shrink-0 ${
                  isSelected 
                    ? 'bg-accent border-accent text-white' 
                    : 'border-border-default bg-surface-input'
                }`}>
                  {isSelected && <Check size={12} strokeWidth={3} />}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
