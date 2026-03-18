import React from 'react';
import { Database, Folder, Plus, Sun, Moon, Sword } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface SidebarProps {
  campaigns: any[];
  selectedCampaign: any;
  handleSelectCampaign: (camp: any) => void;
  setShowCreateModal: (show: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ campaigns, selectedCampaign, handleSelectCampaign, setShowCreateModal }) => {
  const { theme, setTheme } = useTheme();

  return (
    <aside className="w-64 bg-surface-sidebar border-r border-border-default flex flex-col z-10">
      <div className="p-4 border-b border-border-default flex items-center space-x-2">
        <Database className="text-accent-text" />
        <h1 className="text-xl font-bold tracking-wider">REQUIEM</h1>
      </div>
      
      <nav className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
        <div className="text-xs uppercase text-faint font-semibold mb-2 tracking-wider">Campaigns</div>
        {campaigns.length === 0 ? (
          <div className="text-sm text-muted italic">No campaigns yet.</div>
        ) : (
          campaigns.map(camp => (
            <button 
              key={camp.id} 
              onClick={() => handleSelectCampaign(camp)}
              className={`w-full text-left flex items-center space-x-2 p-2 rounded transition-colors ${selectedCampaign?.id === camp.id ? 'bg-surface-active text-heading' : 'hover:bg-surface-hover text-secondary'}`}
            >
              <Folder size={18} className={selectedCampaign?.id === camp.id ? "text-accent-text" : "text-accent2-text"} />
              <span className="truncate">{camp.name}</span>
            </button>
          ))
        )}
      </nav>

      <div className="p-4 border-t border-border-default space-y-4">
        <div className="flex p-1 bg-surface-deep rounded border border-border-subtle">
          <button
            onClick={() => setTheme('light')}
            className={`flex-1 flex justify-center py-1.5 rounded transition-colors ${theme === 'light' ? 'bg-surface-hover text-yellow-500 shadow-sm' : 'text-faint hover:text-secondary'}`}
            title="Light Mode"
          ><Sun size={16} /></button>
          <button
            onClick={() => setTheme('dark')}
            className={`flex-1 flex justify-center py-1.5 rounded transition-colors ${theme === 'dark' ? 'bg-surface-hover text-accent-text shadow-sm' : 'text-faint hover:text-secondary'}`}
            title="Dark Mode"
          ><Moon size={16} /></button>
          <button
            onClick={() => setTheme('medieval')}
            className={`flex-1 flex justify-center py-1.5 rounded transition-colors ${theme === 'medieval' ? 'bg-surface-hover text-amber-500 shadow-sm' : 'text-faint hover:text-secondary'}`}
            title="Medieval Mode"
          ><Sword size={16} /></button>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-accent-grad-from to-accent-grad-to hover:opacity-90 text-heading rounded p-2 transition-all shadow-lg"
        >
          <Plus size={18} />
          <span>New Campaign</span>
        </button>
      </div>
    </aside>
  );
};
