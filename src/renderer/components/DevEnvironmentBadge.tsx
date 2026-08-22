import React, { useState } from 'react';
import { ShieldAlert, Database, Info, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export function DevEnvironmentBadge() {
  const { envInfo } = useAuth();
  const { theme } = useTheme();
  const [showTooltip, setShowTooltip] = useState(false);

  // If not in development mode, don't show the DEV warning badge
  if (!envInfo.isDev && !import.meta.env.DEV) {
    return null;
  }

  const isCyber = theme === 'cyberpunk';
  const isMed = theme === 'medieval';
  const isVamp = theme === 'vampire';

  // Theme-tailored styles for the badge
  const badgeClass = isCyber
    ? "bg-amber-950/40 border border-amber-500/60 text-amber-400 font-mono shadow-[0_0_12px_rgba(245,158,11,0.25)] hover:border-amber-400"
    : isVamp
    ? "bg-[#200e0e] border border-[#a83232] text-[#f87171] font-serif shadow-[0_0_12px_rgba(168,50,50,0.3)] hover:border-[#ef4444]"
    : isMed
    ? "bg-[#382818] border border-[#d97706] text-[#fde68a] font-serif shadow-[inset_0_0_6px_rgba(0,0,0,0.6)] hover:border-[#f59e0b]"
    : "bg-amber-500/15 border border-amber-500/40 text-amber-400 font-sans shadow-sm hover:border-amber-400";

  const modalClass = isCyber
    ? "cyber-metallic-panel border-amber-500/60 text-amber-300 font-mono shadow-[0_0_30px_rgba(245,158,11,0.35)]"
    : isVamp
    ? "bg-[#120a0a] border border-[#a83232]/80 text-[#e0d0d0] font-serif shadow-[0_0_30px_rgba(80,0,0,0.7)]"
    : isMed
    ? "wood-plank border-2 border-[#8b4513] text-[#f4eacc] font-serif shadow-2xl"
    : "bg-surface-elevated border border-border-default text-heading rounded-xl shadow-2xl";

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={() => setShowTooltip(!showTooltip)}
        className={`flex items-center space-x-1.5 px-2.5 py-1 text-[11px] font-bold rounded-full transition-all cursor-pointer select-none tracking-wide ${badgeClass}`}
        title="Ambiente de Desenvolvimento Ativo (Clique para detalhes)"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
        </span>
        <span className="uppercase font-semibold">DEV</span>
        <span className="hidden md:inline opacity-80 text-[10px]">({envInfo.projectId})</span>
      </button>

      {/* Detail Modal / Tooltip */}
      {showTooltip && (
        <div className="fixed inset-0 z-[2500] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4" onClick={() => setShowTooltip(false)}>
          <div 
            className={`max-w-md w-full p-6 relative rounded-lg ${modalClass}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setShowTooltip(false)}
              className="absolute top-4 right-4 text-muted hover:text-heading transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <ShieldAlert size={24} />
              </div>
              <div>
                <h3 className="text-base font-bold flex items-center space-x-2">
                  <span>Modo de Desenvolvimento</span>
                </h3>
                <p className="text-xs opacity-75">Ambiente seguro e isolado</p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs mb-5">
              <div className="flex justify-between items-center py-1.5 border-b border-white/10">
                <span className="opacity-70">Projeto Firebase:</span>
                <span className="font-mono font-semibold text-amber-400">{envInfo.projectId}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-white/10">
                <span className="opacity-70">Banco SQLite Local:</span>
                <span className="font-mono text-[11px] opacity-90">./dev-data/requiem.db</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-white/10">
                <span className="opacity-70">Status do Banco de Produção:</span>
                <span className="font-semibold text-emerald-400">100% Protegido (Isolado)</span>
              </div>
            </div>

            <div className="p-3 rounded bg-amber-500/10 border border-amber-500/20 text-[11px] leading-relaxed opacity-90 flex items-start space-x-2">
              <Info size={16} className="shrink-0 mt-0.5 text-amber-400" />
              <span>
                Todas as campanhas, personagens e anotações criadas nesta sessão serão gravadas exclusivamente no Firebase de testes (<strong>requiem-dev</strong>) ou no SQLite de testes local.
              </span>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setShowTooltip(false)}
                className="px-4 py-1.5 text-xs font-semibold rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-all cursor-pointer"
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
