import React from 'react';
import { Play } from 'lucide-react';
import { DashboardHeader } from './DashboardHeader';
import { AuthControls } from '../AuthControls';
import { DashboardDivider } from './dashboardModules/DashboardDivider';
import { MedievalView } from './dashboardModules/MedievalView';
import { CyberpunkView } from './dashboardModules/CyberpunkView';
import { VampireView } from './dashboardModules/VampireView';
import { DefaultView } from './dashboardModules/DefaultView';

interface DashboardViewProps {
  theme: string;
  campaigns: any[];
  lastOpenedCampaign: any;
  handleSelectCampaign: (camp: any) => void;
  handleDeleteCampaign: (id: number, name: string) => void;
  handleEditCampaign: (e: React.MouseEvent, camp: any) => void;
  setShowCreateModal: (show: boolean) => void;
  setNewCampaign: (camp: any) => void;
}

export function DashboardView({
  theme,
  campaigns,
  lastOpenedCampaign,
  handleSelectCampaign,
  handleDeleteCampaign,
  handleEditCampaign,
  setShowCreateModal,
  setNewCampaign
}: DashboardViewProps) {
  // Mobile detection for page size adjustments
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);
  const [currentPage, setCurrentPage] = React.useState(0);
  const [isTransitioning, setIsTransitioning] = React.useState(false);
  const [direction, setDirection] = React.useState<'next' | 'prev' | null>(null);
  const [cyberLogs, setCyberLogs] = React.useState<string[]>([]);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  React.useEffect(() => {
    if (theme === 'cyberpunk' && isTransitioning) {
      const logs = [
        'INIT_SEQUENCE_LOAD: CAMPAIGN_INDEX',
        `CONNECTING TO SECURE SECTOR_0x${Math.floor(Math.random()*16777215).toString(16).toUpperCase()}`,
        'PROTOCOL: RSA_4096_GCM_DECRYPT',
        'SYS_MEM_ALLOC: 4096B [STATUS: OK]',
        'DECRYPTING ACCESS KEYS...',
        'AUTHORIZATION: ACCESS GRANTED',
        'COMPILING DATA ENTRIES...',
        'RECONSTRUCTING CHRONICLES MAIN NODE',
        'LOG: DATA STREAM STABILIZED'
      ];
      setCyberLogs(logs);
    }
  }, [isTransitioning, theme]);

  const items = React.useMemo(() => [
    { type: 'create' },
    ...campaigns.map(camp => ({ type: 'campaign', data: camp }))
  ], [campaigns]);

  const pageSize = ((theme === 'medieval' || theme === 'cyberpunk' || theme === 'vampire') && isMobile) ? 1 : 2;
  const totalPages = Math.ceil(items.length / pageSize);

  // Keep page index within valid bounds when resizing or campaigns are deleted
  React.useEffect(() => {
    if (currentPage >= totalPages && totalPages > 0) {
      setCurrentPage(totalPages - 1);
    }
  }, [totalPages, currentPage]);

  const goToNextPage = () => {
    if (currentPage < totalPages - 1 && !isTransitioning) {
      setDirection('next');
      setIsTransitioning(true);
      
      const transitionDuration = isMobile ? 600 : 800; // Matches animation duration in CSS
      if (theme === 'vampire') {
        setTimeout(() => {
          setCurrentPage(prev => prev + 1);
        }, transitionDuration / 2);
        
        setTimeout(() => {
          setIsTransitioning(false);
          setDirection(null);
        }, transitionDuration);
      } else {
        setTimeout(() => {
          setCurrentPage(prev => prev + 1);
          setIsTransitioning(false);
          setDirection(null);
        }, transitionDuration);
      }
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 0 && !isTransitioning) {
      setDirection('prev');
      setIsTransitioning(true);
      
      const transitionDuration = isMobile ? 600 : 800; // Matches animation duration in CSS
      if (theme === 'vampire') {
        setTimeout(() => {
          setCurrentPage(prev => prev - 1);
        }, transitionDuration / 2);
        
        setTimeout(() => {
          setIsTransitioning(false);
          setDirection(null);
        }, transitionDuration);
      } else {
        setTimeout(() => {
          setCurrentPage(prev => prev - 1);
          setIsTransitioning(false);
          setDirection(null);
        }, transitionDuration);
      }
    }
  };

  return (
    <main className={`flex-1 flex flex-col overflow-y-auto w-full relative ${theme === 'medieval' ? 'text-primary' : theme === 'cyberpunk' ? 'bg-transparent' : theme === 'vampire' ? 'bg-transparent' : 'bg-surface-app'}`}>
      <div className="hidden sm:block absolute top-4 right-4 md:right-8 z-[60]">
        <AuthControls />
      </div>
      <header className={`px-4 md:px-8 py-4 md:py-6 border-b flex items-center justify-between z-10 ${theme === 'medieval' ? 'relative' : 'sticky top-0'} ${theme === 'cyberpunk' ? 'cyber-metallic-panel border-[#0ff]/50 shadow-[0_4px_20px_rgba(0,255,255,0.15)]' : theme === 'vampire' ? 'bg-[#08080b]/90 backdrop-blur-md border-[#1f1f2e] shadow-[0_4px_20px_rgba(0,0,0,0.4)]' : theme === 'medieval' ? 'border-[#d9c596]/40' : 'bg-surface-app border-border-default'}`}>
        <DashboardHeader theme={theme} />
      </header>

      <div className="p-4 md:p-8 max-w-6xl mx-auto w-full xl:px-12">
        {/* Featured Resume Banner */}
        {lastOpenedCampaign && (
          <div 
            onClick={() => handleSelectCampaign(lastOpenedCampaign)}
            className={`w-full mb-12 rounded-xl group cursor-pointer relative overflow-hidden transition-all duration-300 ${
              theme === 'cyberpunk' 
                ? 'h-32 cyber-smoked-glass hover:shadow-[0_0_30px_rgba(0,255,255,0.3)] flex items-center' 
                : theme === 'medieval'
                ? 'h-32 bg-[#e8d8b0] border-2 border-[#8b4513]/60 hover:border-[#8b4513] shadow-[inset_0_2px_10px_rgba(139,69,19,0.2),0_5px_15px_rgba(0,0,0,0.3)] flex items-center relative'
                : theme === 'vampire'
                ? 'h-32 bg-[#0d0d12] border border-[#1f1f2e] hover:border-[#500000] hover:shadow-[0_5px_25px_rgba(80,0,0,0.5)] flex items-center relative'
                : 'h-32 bg-surface-elevated border border-border-subtle hover:border-accent shadow-md flex items-center'
            }`}
          >
            {theme === 'cyberpunk' && (
              <>
                 <div className="micro-circuit-pattern" />
                 <div className="absolute top-0 right-0 w-48 h-full bg-gradient-to-l from-[#0ff]/5 to-transparent pointer-events-none" />
              </>
            )}
            {theme === 'medieval' && (
              <>
                 <div className="absolute inset-0 opacity-40 mix-blend-multiply pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, transparent 20%, #8b4513 120%)' }} />
                 <div className="absolute inset-2 border border-[#8b4513] border-dashed opacity-30 pointer-events-none rounded" />
              </>
            )}
            {theme === 'vampire' && (
              <>
                 <div className="absolute inset-0 opacity-30 pointer-events-none mix-blend-overlay bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIi8+CjxwYXRoIGQ9Ik0wIDBMMCA0TDQgNEw0IDBaIiBmaWxsPSIjMDAwIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')]"/>
                 <div className="absolute top-0 right-0 w-48 h-full bg-gradient-to-l from-[#500000]/30 to-transparent pointer-events-none" />
              </>
            )}

            <div className="px-8 flex-1 flex justify-between items-center relative z-10 w-full h-full">
              <div className="flex items-center space-x-6">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-lg ${
                   theme === 'cyberpunk' ? 'neon-ring-pulse bg-[#02050a] border-2 border-[#0ff] shadow-[0_0_15px_rgba(0,255,255,0.4)] z-10' :
                   theme === 'medieval' ? 'bg-[#8b4513] border border-[#5c2e0b]' :
                   theme === 'vampire' ? 'bg-[#0a0a0f] border-2 border-[#3d3d4a] group-hover:border-[#ff3333]' :
                   'bg-accent/10 border border-accent'
                }`}>
                  <Play size={28} className={`${
                     theme === 'cyberpunk' ? 'text-[#0ff] group-hover:drop-shadow-[0_0_8px_rgba(0,255,255,1)] ml-1' :
                     theme === 'medieval' ? 'text-[#f4eacc] ml-1' :
                     theme === 'vampire' ? 'text-[#a0a0b0] group-hover:text-[#ff3333] ml-1 transition-colors' :
                     'text-accent-text ml-1'
                  }`} />
                </div>
                <div>
                  <h3 className={`text-sm uppercase tracking-widest font-bold mb-1 ${
                     theme === 'cyberpunk' ? 'text-[#0ff]/70' :
                     theme === 'medieval' ? 'text-[#8b4513]/70 font-serif' :
                     theme === 'vampire' ? 'text-[#606070] font-serif' :
                     'text-muted'
                  }`}>
                     RESUME JOURNEY
                  </h3>
                  <h2 className={`text-2xl md:text-3xl font-bold truncate ${
                     theme === 'cyberpunk' ? 'text-[#0ff] tracking-wider drop-shadow-[0_0_5px_rgba(0,255,255,0.5)] z-10' :
                     theme === 'medieval' ? 'text-[#3e2723] font-serif tracking-wide' :
                     theme === 'vampire' ? 'text-[#d1d1d6] font-serif tracking-widest group-hover:text-[#ff3333] transition-colors' :
                     'text-heading'
                  }`}>
                    {lastOpenedCampaign.name}
                  </h2>
                </div>
              </div>
              
              <div className={`hidden md:flex flex-col items-end ${
                   theme === 'cyberpunk' ? 'text-[#0ff]/50' :
                   theme === 'medieval' ? 'text-[#8b4513]/60 font-serif' :
                   theme === 'vampire' ? 'text-[#555566] font-serif' :
                   'text-muted'
              }`}>
                {lastOpenedCampaign.system && <span className="text-sm font-semibold tracking-wider uppercase mb-1">{lastOpenedCampaign.system}</span>}
                {lastOpenedCampaign.genre && <span className="text-xs font-semibold">{lastOpenedCampaign.genre}</span>}
              </div>
            </div>
          </div>
        )}

        <DashboardDivider theme={theme} />

        {/* Campaign List / Cards Grid */}
        {theme === 'medieval' ? (
          <MedievalView
            isMobile={isMobile}
            items={items}
            currentPage={currentPage}
            totalPages={totalPages}
            isTransitioning={isTransitioning}
            direction={direction}
            goToPrevPage={goToPrevPage}
            goToNextPage={goToNextPage}
            theme={theme}
            handleSelectCampaign={handleSelectCampaign}
            handleDeleteCampaign={handleDeleteCampaign}
            handleEditCampaign={handleEditCampaign}
            setShowCreateModal={setShowCreateModal}
            setNewCampaign={setNewCampaign}
          />
        ) : theme === 'cyberpunk' ? (
          <CyberpunkView
            isMobile={isMobile}
            items={items}
            currentPage={currentPage}
            totalPages={totalPages}
            isTransitioning={isTransitioning}
            direction={direction}
            goToPrevPage={goToPrevPage}
            goToNextPage={goToNextPage}
            cyberLogs={cyberLogs}
            theme={theme}
            handleSelectCampaign={handleSelectCampaign}
            handleDeleteCampaign={handleDeleteCampaign}
            handleEditCampaign={handleEditCampaign}
            setShowCreateModal={setShowCreateModal}
            setNewCampaign={setNewCampaign}
          />
        ) : theme === 'vampire' ? (
          <VampireView
            isMobile={isMobile}
            items={items}
            currentPage={currentPage}
            totalPages={totalPages}
            isTransitioning={isTransitioning}
            goToPrevPage={goToPrevPage}
            goToNextPage={goToNextPage}
            theme={theme}
            handleSelectCampaign={handleSelectCampaign}
            handleDeleteCampaign={handleDeleteCampaign}
            handleEditCampaign={handleEditCampaign}
            setShowCreateModal={setShowCreateModal}
            setNewCampaign={setNewCampaign}
          />
        ) : (
          <DefaultView
            campaigns={campaigns}
            theme={theme}
            handleSelectCampaign={handleSelectCampaign}
            handleDeleteCampaign={handleDeleteCampaign}
            handleEditCampaign={handleEditCampaign}
            setShowCreateModal={setShowCreateModal}
            setNewCampaign={setNewCampaign}
          />
        )}
      </div>
    </main>
  );
}
