import React, { useEffect, useState } from 'react';
import { Database, Folder, Users, Map as MapIcon, Plus } from 'lucide-react';

function App() {
  const [campaigns, setCampaigns] = useState<any[]>([]);

  useEffect(() => {
    // Ensure we are in an electron environment
    if ((window as any).api) {
      const fetchCampaigns = async () => {
        try {
          const data = await (window as any).api.getCampaigns();
          setCampaigns(data);
        } catch (error) {
          console.error('Error fetching campaigns:', error);
        }
      };
      fetchCampaigns();
    }
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-950 text-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-800 flex items-center space-x-2">
          <Database className="text-purple-500" />
          <h1 className="text-xl font-bold tracking-wider">REQUIEM</h1>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          <div className="text-xs uppercase text-gray-500 font-semibold mb-2 tracking-wider">Campaigns</div>
          {campaigns.length === 0 ? (
            <div className="text-sm text-gray-400 italic">No campaigns yet.</div>
          ) : (
            campaigns.map(camp => (
              <button key={camp.id} className="w-full text-left flex items-center space-x-2 p-2 rounded hover:bg-gray-800 transition-colors">
                <Folder size={18} className="text-blue-400" />
                <span className="truncate">{camp.nome}</span>
              </button>
            ))
          )}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button className="w-full flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white rounded p-2 transition-colors">
            <Plus size={18} />
            <span>New Campaign</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-br from-gray-950 to-gray-900">
        <div className="text-center space-y-6 max-w-lg">
          <div className="flex justify-center space-x-4 text-purple-500 mb-8">
            <Users size={48} />
            <MapIcon size={48} />
            <Folder size={48} />
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">Welcome to Requiem</h2>
          <p className="text-gray-400 text-lg">
            Your ultimate desktop tool for managing tabletop RPG campaigns, characters, locations, and lore entries.
          </p>
          <div className="pt-8">
            <button className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg shadow-lg shadow-purple-900/50 transition-all transform hover:scale-105 active:scale-95">
              Create Your First Campaign
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
