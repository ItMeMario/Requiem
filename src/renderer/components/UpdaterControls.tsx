import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Sparkles, RefreshCw, X, AlertTriangle, CheckCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import packageInfo from '../../../package.json';

export function UpdaterControls() {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [hasUpdate, setHasUpdate] = useState(false);
  const [checking, setChecking] = useState(false);
  
  // Status states
  const [status, setStatus] = useState<'idle' | 'checking' | 'update-available' | 'update-not-available' | 'updating' | 'downloaded' | 'error'>('idle');
  const [currentVersion, setCurrentVersion] = useState<string>(packageInfo.version);
  const [latestVersion, setLatestVersion] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const updater = (window as any).api?.updater;

  // Auto-check for updates on mount
  useEffect(() => {
    if (!updater) return;

    const performInitialCheck = async () => {
      setChecking(true);
      try {
        const res = await updater.check();
        setCurrentVersion(res.currentVersion || '');
        setLatestVersion(res.latestVersion || '');
        setHasUpdate(res.available);
        if (res.available) {
          setStatus('update-available');
        } else {
          setStatus('update-not-available');
        }
      } catch (err: any) {
        console.error('Error on auto update check:', err);
      } finally {
        setChecking(false);
      }
    };

    performInitialCheck();
  }, [updater]);

  // Setup IPC listeners when modal is open
  useEffect(() => {
    if (!updater || !isOpen) return;

    const cleanupStatus = updater.onStatus((info: any) => {
      if (info.status) {
        setStatus(info.status);
      }
      if (info.latestVersion) {
        setLatestVersion(info.latestVersion);
      }
    });

    const cleanupProgress = updater.onProgress((percent: number) => {
      setProgress(Math.round(percent));
    });

    const cleanupError = updater.onError((err: string) => {
      setStatus('error');
      setErrorMsg(err);
    });

    return () => {
      cleanupStatus();
      cleanupProgress();
      cleanupError();
    };
  }, [updater, isOpen]);

  if (!updater) return null;

  const isCyber = theme === 'cyberpunk';
  const isMed = theme === 'medieval';
  const isVamp = theme === 'vampire';

  // Theme-specific button classes
  const buttonClass = `flex items-center justify-center transition-all w-10 h-10 relative ${
    isCyber 
      ? 'rounded-br-lg rounded-tl-lg bg-[#050c18] border border-[#0ff]/30 text-[#0ff]/60 hover:text-[#0ff] hover:border-[#0ff]/70 hover:bg-[#0ff]/20' 
      : 'rounded-lg bg-[#1a1a1a] text-gray-400 border border-[#333] shadow-md hover:bg-[#2a2a2a] hover:text-gray-100 hover:border-gray-500'
  }`;

  const badgeClass = `absolute -top-1 -right-1 w-3 h-3 rounded-full ${
    isCyber ? 'bg-[#0ff] shadow-[0_0_8px_#0ff] animate-ping' :
    isVamp ? 'bg-[#ff3333] shadow-[0_0_8px_#ff3333] animate-pulse' :
    'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)] animate-pulse'
  }`;

  const handleCheck = async () => {
    setChecking(true);
    setErrorMsg(null);
    setProgress(0);
    try {
      const res = await updater.check();
      setCurrentVersion(res.currentVersion || '');
      setLatestVersion(res.latestVersion || '');
      setHasUpdate(res.available);
      if (res.available) {
        setStatus('update-available');
      } else {
        setStatus('update-not-available');
      }
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message || String(err));
    } finally {
      setChecking(false);
    }
  };

  const handleUpdate = async () => {
    setErrorMsg(null);
    setProgress(0);
    setStatus('updating');
    try {
      await updater.start();
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message || String(err));
    }
  };

  const handleRestart = () => {
    updater.restart();
  };

  // Render thematic contents
  const renderModalContent = () => {
    if (isCyber) {
      return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg cyber-smoked-glass border border-[#0ff]/50 relative p-6 font-mono text-sm text-[#0ff] shadow-[0_0_30px_rgba(0,255,255,0.2)]">
            {/* Corner decorations */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-[#0ff]" />
            <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-[#0ff]" />
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-[#0ff]" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-[#0ff]" />
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#0ff]/30 pb-3 mb-4">
              <h3 className="text-lg font-bold tracking-[0.2em] text-cyan-glitch uppercase" data-text="SYSTEM UPDATE">
                SYSTEM UPDATE
              </h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-[#0ff]/60 hover:text-[#0ff] transition-colors"
                disabled={status === 'updating'}
              >
                <X size={18} />
              </button>
            </div>

            {/* Version Info */}
            <div className="grid grid-cols-2 gap-4 mb-4 bg-[#050c18] border border-[#0ff]/20 p-3 rounded-sm text-xs">
              <div>
                <span className="text-[#0ff]/50">LOCAL_SYS:</span> v{currentVersion}
              </div>
              <div>
                <span className="text-[#0ff]/50">REMOTE_SRV:</span> {checking ? 'CONNECTING...' : `v${latestVersion || '?'}`}
              </div>
            </div>

            {/* Main Status */}
            <div className="mb-4 min-h-[60px] flex flex-col justify-center">
              {checking && (
                <div className="flex items-center space-x-2 text-[#0ff]">
                  <RefreshCw size={16} className="animate-spin" />
                  <span>CHECKING FOR UPDATE CHANNELS...</span>
                </div>
              )}

              {!checking && status === 'update-not-available' && (
                <div className="text-[#0ff]/80">
                  ⚡ SYSTEM IS OPTIMAL AND FULLY PATCHED. NO UPDATES REQUIRED.
                </div>
              )}

              {!checking && status === 'update-available' && (
                <div className="flex flex-col gap-2">
                  <div className="text-yellow-400 font-bold">
                    ▲ CRITICAL PATCH DETECTED: Version {latestVersion} is available.
                  </div>
                  <button 
                    onClick={handleUpdate}
                    className="w-full py-2 cyber-enter-btn text-xs tracking-widest text-center uppercase"
                  >
                    INITIALIZE PATCH SEQUENCE
                  </button>
                </div>
              )}

              {status === 'updating' && (
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between text-xs">
                    <span>DOWNLOADING MEMORY BUFFER...</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-[#050c18] border border-[#0ff]/30 h-3 p-[1px]">
                    <div 
                      className="bg-[#0ff] h-full shadow-[0_0_8px_#0ff] transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {status === 'downloaded' && (
                <div className="flex flex-col gap-3">
                  <div className="text-green-400 font-bold flex items-center space-x-2">
                    <CheckCircle size={16} />
                    <span>PATCH INJECTED SUCCESSFULLY.</span>
                  </div>
                  <button 
                    onClick={handleRestart}
                    className="w-full py-2 bg-green-500/20 border border-green-500 text-green-400 hover:bg-green-500 hover:text-black font-bold text-xs tracking-widest text-center uppercase transition-all"
                  >
                    REBOOT SYSTEM & APPLY
                  </button>
                </div>
              )}

              {status === 'error' && (
                <div className="flex flex-col gap-2 text-red-500">
                  <div className="font-bold flex items-center space-x-2">
                    <AlertTriangle size={16} />
                    <span>SYS_ERROR: UPDATE ENCOUNTERED AN EXCEPTION</span>
                  </div>
                  <div className="text-xs break-all bg-red-950/20 border border-red-500/30 p-2 font-mono max-h-20 overflow-y-auto">
                    {errorMsg}
                  </div>
                  <button 
                    onClick={handleCheck}
                    className="w-full py-2 border border-red-500/50 hover:bg-red-500/20 text-red-400 text-xs tracking-widest uppercase transition-all"
                  >
                    RE-CONNECT CHANNELS
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    if (isMed) {
      return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#f4eacc] border-[3px] border-[#8b4513] shadow-2xl relative p-6 font-serif text-sm text-[#3e2723] rounded-md">
            {/* Antique corner decorations */}
            <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[#8b4513] m-1" />
            <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-[#8b4513] m-1" />
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-[#8b4513] m-1" />
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[#8b4513] m-1" />
            
            {/* Header */}
            <div className="flex items-center justify-between border-b-[2px] border-double border-[#8b4513]/40 pb-2 mb-4">
              <h3 className="text-lg font-bold tracking-widest text-[#3e2723] uppercase">
                Chronicle Update
              </h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-[#8b4513]/60 hover:text-[#8b4513] transition-colors"
                disabled={status === 'updating'}
              >
                <X size={18} />
              </button>
            </div>

            {/* Version Info */}
            <div className="grid grid-cols-2 gap-4 mb-4 bg-[#e8d8b0] border border-[#8b4513]/30 p-3 rounded font-serif text-xs">
              <div>
                <span className="font-bold">Current Parchment:</span> v{currentVersion}
              </div>
              <div>
                <span className="font-bold">Latest Discovery:</span> {checking ? 'Inquiring...' : `v${latestVersion || '?'}`}
              </div>
            </div>

            {/* Main Status */}
            <div className="mb-4 min-h-[60px] flex flex-col justify-center text-center">
              {checking && (
                <div className="flex items-center justify-center space-x-2 text-[#8b4513]">
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Consulting remote scrolls...</span>
                </div>
              )}

              {!checking && status === 'update-not-available' && (
                <div className="text-[#5c3a21] italic">
                  📜 Thy chronicles are complete. No new pages have been written.
                </div>
              )}

              {!checking && status === 'update-available' && (
                <div className="flex flex-col gap-3">
                  <div className="text-[#8b4513] font-bold text-base">
                    📜 New pages are ready to be bound! (v{latestVersion})
                  </div>
                  <button 
                    onClick={handleUpdate}
                    className="w-full py-2 bg-[#8b4513] text-[#f4eacc] hover:bg-[#5c2e0b] font-bold text-xs tracking-wider border border-[#5c2e0b] shadow transition-colors uppercase"
                  >
                    Bind New Pages
                  </button>
                </div>
              )}

              {status === 'updating' && (
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between text-xs font-bold">
                    <span>Writing ink onto parchment...</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-[#e8d8b0] border border-[#8b4513]/50 h-4 rounded p-[2px]">
                    <div 
                      className="bg-[#8b4513] h-full rounded transition-all duration-300 shadow-[inset_0_1px_3px_rgba(255,255,255,0.2)]"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {status === 'downloaded' && (
                <div className="flex flex-col gap-3">
                  <div className="text-green-800 font-bold flex items-center justify-center space-x-2">
                    <CheckCircle size={16} />
                    <span>The chronicle has been successfully bound.</span>
                  </div>
                  <button 
                    onClick={handleRestart}
                    className="w-full py-2 bg-[#8b4513] text-[#f4eacc] hover:bg-[#5c2e0b] font-bold text-xs tracking-wider border border-[#5c2e0b] shadow transition-colors uppercase"
                  >
                    Open New Chronicle (Restart)
                  </button>
                </div>
              )}

              {status === 'error' && (
                <div className="flex flex-col gap-2 text-red-900">
                  <div className="font-bold flex items-center justify-center space-x-2">
                    <AlertTriangle size={16} />
                    <span>An error blocked the scribe's ink</span>
                  </div>
                  <div className="text-xs bg-[#e8d8b0]/70 border border-red-800/40 p-2 font-serif max-h-20 overflow-y-auto italic">
                    {errorMsg}
                  </div>
                  <button 
                    onClick={handleCheck}
                    className="w-full py-2 bg-red-800 text-white hover:bg-red-900 font-bold text-xs tracking-wider transition-all uppercase"
                  >
                    Seek Scroll Again
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    if (isVamp) {
      return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#0a0a0f] border border-[#ff3333]/30 shadow-[0_0_30px_rgba(255,51,51,0.25)] relative p-6 font-serif text-sm text-[#d1d1d6] rounded-xl">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#ff3333]/20 pb-3 mb-4">
              <h3 className="text-lg font-bold tracking-[0.25em] text-[#ff3333] font-serif uppercase" style={{ textShadow: '0 0 8px rgba(255,51,51,0.5)' }}>
                Bloodline Revelation
              </h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-[#d1d1d6]/60 hover:text-[#ff3333] transition-colors"
                disabled={status === 'updating'}
              >
                <X size={18} />
              </button>
            </div>

            {/* Version Info */}
            <div className="grid grid-cols-2 gap-4 mb-4 bg-[#0d0d12] border border-[#ff3333]/15 p-3 rounded-md text-xs">
              <div>
                <span className="text-gray-500 font-serif">Current Vessel:</span> v{currentVersion}
              </div>
              <div>
                <span className="text-gray-500 font-serif">Deep Secrets:</span> {checking ? 'Awakening...' : `v${latestVersion || '?'}`}
              </div>
            </div>

            {/* Main Status */}
            <div className="mb-4 min-h-[60px] flex flex-col justify-center">
              {checking && (
                <div className="flex items-center space-x-2 text-[#ff3333]">
                  <RefreshCw size={16} className="animate-spin" />
                  <span className="tracking-widest text-xs">AWAKENING COVEN KNOWLEDGE...</span>
                </div>
              )}

              {!checking && status === 'update-not-available' && (
                <div className="text-gray-400 italic">
                  ☾ The blood is pure. Thy coven holds the ultimate truth.
                </div>
              )}

              {!checking && status === 'update-available' && (
                <div className="flex flex-col gap-2">
                  <div className="text-[#ff3333] font-bold text-sm tracking-widest uppercase">
                    ☾ A darker power rises: Version {latestVersion} is ready.
                  </div>
                  <button 
                    onClick={handleUpdate}
                    className="w-full py-2 bg-[#500000] border border-[#ff3333]/50 text-[#ff3333] hover:bg-[#800000] hover:text-white font-serif text-xs tracking-widest text-center uppercase transition-all shadow-[0_0_10px_rgba(255,0,0,0.3)]"
                  >
                    Embrace the Dark Gift
                  </button>
                </div>
              )}

              {status === 'updating' && (
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between text-xs tracking-wider">
                    <span>TRANSMUTING SOULS...</span>
                    <span className="text-[#ff3333] font-bold">{progress}%</span>
                  </div>
                  <div className="w-full bg-[#0a0a0f] border border-[#ff3333]/30 h-2 rounded-full p-[1px]">
                    <div 
                      className="bg-gradient-to-r from-[#500000] to-[#ff3333] h-full rounded-full shadow-[0_0_8px_#ff3333] transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {status === 'downloaded' && (
                <div className="flex flex-col gap-3">
                  <div className="text-[#ff3333] font-bold flex items-center space-x-2 tracking-wider">
                    <CheckCircle size={16} />
                    <span>THE SACRAMENT IS COMPLETE.</span>
                  </div>
                  <button 
                    onClick={handleRestart}
                    className="w-full py-2 bg-[#500000] border border-[#ff3333]/50 text-[#ff3333] hover:bg-[#800000] hover:text-white font-serif text-xs tracking-widest text-center uppercase transition-all shadow-[0_0_10px_rgba(255,0,0,0.3)]"
                  >
                    Rise Anew (Restart)
                  </button>
                </div>
              )}

              {status === 'error' && (
                <div className="flex flex-col gap-2 text-[#ff3333]">
                  <div className="font-bold flex items-center space-x-2 text-sm tracking-wider">
                    <AlertTriangle size={16} />
                    <span>COVEN REVELATION INTERRUPTED</span>
                  </div>
                  <div className="text-xs bg-[#0d0d12] border border-[#ff3333]/20 p-2 font-serif max-h-20 overflow-y-auto text-gray-400">
                    {errorMsg}
                  </div>
                  <button 
                    onClick={handleCheck}
                    className="w-full py-2 border border-[#ff3333]/50 hover:bg-[#ff3333]/15 text-[#ff3333] text-xs tracking-widest uppercase transition-all"
                  >
                    Invoke Ritual Again
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={buttonClass}
        title="Check for Updates"
        disabled={checking}
      >
        <Sparkles size={16} className={checking ? 'animate-spin' : ''} />
        {hasUpdate && <span className={badgeClass} />}
      </button>

      {isOpen && createPortal(renderModalContent(), document.body)}
    </>
  );
}

