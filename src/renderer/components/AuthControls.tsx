import React, { useState, useEffect } from 'react';
import { LogIn, LogOut, CloudUpload, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { WebDataService } from '../services/webDataService';
import { ElectronDataService } from '../services/electronDataService';
import { FirebaseDataService } from '../services/firebaseDataService';

export function AuthControls() {
  const { user, login, logout, loading, isConfigured } = useAuth();
  const { theme } = useTheme();
  
  const [showMigrationPrompt, setShowMigrationPrompt] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [localCampaignCount, setLocalCampaignCount] = useState(0);

  const isCyber = theme === 'cyberpunk';
  const isMed = theme === 'medieval';
  const isVamp = theme === 'vampire';

  useEffect(() => {
    // Only check for migration if user is logged in
    if (!user) return;

    const migrationKey = `migrated_${user.uid}`;
    if (localStorage.getItem(migrationKey)) {
      return; // Already migrated or dismissed
    }

    const checkLocalData = async () => {
      try {
        const localService = (typeof window !== 'undefined' && (window as any).api) 
          ? new ElectronDataService() 
          : new WebDataService();
        
        const campaigns = await localService.getCampaigns();
        if (campaigns && campaigns.length > 0) {
          setLocalCampaignCount(campaigns.length);
          setShowMigrationPrompt(true);
        }
      } catch (err) {
        console.error('[AuthControls] Failed to check local data for migration:', err);
      }
    };

    checkLocalData();
  }, [user]);

  const handleMigrate = async () => {
    if (!user) return;
    setIsMigrating(true);
    try {
      const localService = (typeof window !== 'undefined' && (window as any).api) 
        ? new ElectronDataService() 
        : new WebDataService();
      
      const firebaseService = new FirebaseDataService();
      
      const localCampaigns = await localService.getCampaigns();
      
      for (const camp of localCampaigns) {
        // 1. Create Campaign in Firebase
        const newCampId = await firebaseService.createCampaign({
          name: camp.name,
          genre: camp.genre,
          system: camp.system
        });

        // 2. Migrate Characters
        const chars = await localService.getCharacters(camp.id!);
        for (const c of chars) {
          const { id, ...charData } = c;
          await firebaseService.createCharacter({ ...charData, campaign_id: newCampId });
        }

        // 3. Migrate Locations
        const locs = await localService.getLocations(camp.id!);
        for (const l of locs) {
          const { id, ...locData } = l;
          await firebaseService.createLocation({ ...locData, campaign_id: newCampId });
        }

        // 4. Migrate Entries
        const entries = await localService.getEntries(camp.id!);
        for (const e of entries) {
          const { id, ...entryData } = e;
          await firebaseService.createEntry({ ...entryData, campaign_id: newCampId });
        }
      }

      // Mark as migrated
      localStorage.setItem(`migrated_${user.uid}`, 'true');
      setShowMigrationPrompt(false);
      
      alert('Migration successful! Your campaigns are now in the cloud. Please reload the page to see them.');
      window.location.reload();
      
    } catch (err) {
      console.error('[AuthControls] Migration error:', err);
      alert('An error occurred during migration. Please try again.');
    } finally {
      setIsMigrating(false);
    }
  };

  const dismissMigration = () => {
    if (user) {
      localStorage.setItem(`migrated_${user.uid}`, 'dismissed');
      setShowMigrationPrompt(false);
    }
  };

  // Base styling depending on the theme
  const buttonStyle = isCyber 
    ? "flex items-center space-x-2 px-3 py-1.5 text-xs cyber-metallic-panel text-[#0ff] hover:bg-[#0ff]/20 hover:shadow-[0_0_10px_rgba(0,255,255,0.4)] transition-all font-mono uppercase tracking-wider"
    : isVamp
    ? "flex items-center space-x-2 px-3 py-1.5 text-sm bg-[#1a1a24] border border-[#3d3d4a] text-[#a0a0b0] hover:text-[#ff3333] hover:border-[#ff3333]/50 transition-colors font-serif"
    : isMed
    ? "flex items-center space-x-2 px-3 py-1.5 text-sm wood-plank border border-[#5c2e0b] text-[#f4eacc] hover:shadow-[inset_0_0_10px_rgba(0,0,0,0.5)] transition-all font-serif"
    : "flex items-center space-x-2 px-3 py-1.5 text-sm bg-surface-elevated border border-border-subtle text-heading hover:border-accent hover:text-accent-text transition-colors rounded-md";

  if (!isConfigured) {
    return null; // Don't show anything if Firebase is not configured via .env
  }

  return (
    <div className="flex items-center space-x-4">
      {/* Migration Prompt Overlay */}
      {showMigrationPrompt && (
        <div className="fixed inset-0 z-[2000] bg-black/80 flex items-center justify-center p-4">
          <div className={`max-w-md w-full p-6 ${isCyber ? 'cyber-metallic-panel border-[#0ff]/50 shadow-[0_0_30px_rgba(0,255,255,0.3)]' : isMed ? 'wood-plank border-2 border-[#8b4513]' : isVamp ? 'bg-[#0d0d12] border border-[#ff3333]/40 shadow-[0_0_40px_rgba(80,0,0,0.6)]' : 'bg-surface-app border border-border-default rounded-xl shadow-2xl'}`}>
            <div className="flex items-center space-x-3 mb-4">
              <CloudUpload className={isCyber ? 'text-[#0ff]' : isVamp ? 'text-[#ff3333]' : isMed ? 'text-[#d9c596]' : 'text-accent-text'} size={28} />
              <h2 className={`text-xl font-bold ${isCyber ? 'text-[#0ff] font-mono' : isVamp ? 'text-[#e0e0e0] font-serif' : isMed ? 'text-[#f4eacc] font-serif' : 'text-heading'}`}>Cloud Sync Available</h2>
            </div>
            <p className={`mb-6 text-sm ${isCyber ? 'text-[#0ff]/70 font-mono' : isVamp ? 'text-[#a0a0b0]' : isMed ? 'text-[#e8d8b0]' : 'text-muted'}`}>
              We found <strong>{localCampaignCount}</strong> local campaigns. Would you like to upload them to your cloud account so they are accessible on all your devices?
            </p>
            <div className="flex justify-end space-x-3">
              <button 
                onClick={dismissMigration}
                disabled={isMigrating}
                className={`px-4 py-2 text-sm ${isCyber ? 'text-red-400 hover:bg-red-400/10 font-mono' : isVamp ? 'text-[#555566] hover:text-[#d1d1d6]' : isMed ? 'text-[#d9c596]/60 hover:text-[#d9c596]' : 'text-muted hover:text-heading'} transition-colors`}
              >
                No, skip
              </button>
              <button 
                onClick={handleMigrate}
                disabled={isMigrating}
                className={`px-4 py-2 text-sm flex items-center space-x-2 ${isCyber ? 'bg-[#0ff]/20 text-[#0ff] border border-[#0ff] font-mono hover:bg-[#0ff]/40 shadow-[0_0_10px_rgba(0,255,255,0.4)]' : isVamp ? 'bg-[#500000] text-[#e0e0e0] border border-[#8b0000] hover:bg-[#8b0000]' : isMed ? 'bg-[#8b4513] text-[#f4eacc] border border-[#5c2e0b] hover:bg-[#a0522d]' : 'bg-accent text-accent-text rounded-md font-medium hover:bg-accent/80'} transition-all`}
              >
                {isMigrating ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Syncing...</span>
                  </>
                ) : (
                  <>
                    <CloudUpload size={16} />
                    <span>Sync to Cloud</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Header Controls */}
      {loading ? (
        <div className="flex items-center justify-center w-8 h-8">
          <Loader2 size={18} className="animate-spin text-muted" />
        </div>
      ) : user ? (
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-black/20 px-2 py-1 rounded-full border border-white/5">
            {user.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="w-6 h-6 rounded-full" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center text-[10px] font-bold text-accent-text">
                {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
              </div>
            )}
            <span className={`text-xs font-medium pr-1 hidden sm:inline-block ${isCyber ? 'text-[#0ff] font-mono' : isVamp ? 'text-[#d1d1d6] font-serif' : 'text-heading'}`}>
              {user.displayName || user.email}
            </span>
          </div>
          <button onClick={logout} className={buttonStyle} title="Logout">
            <LogOut size={16} />
            <span className="hidden sm:inline-block">Logout</span>
          </button>
        </div>
      ) : (
        <button onClick={login} className={buttonStyle} title="Login to Sync">
          <LogIn size={16} />
          <span>Login</span>
        </button>
      )}
    </div>
  );
}
