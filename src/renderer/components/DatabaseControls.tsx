import React, { useState } from 'react';
import { Download, Upload } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export function DatabaseControls() {
  const { theme } = useTheme();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const isCyber = theme === 'cyberpunk';
  const containerClass = `fixed bottom-4 right-4 z-[100] flex gap-1.5 p-1.5 ${isCyber ? 'bg-transparent' : 'bg-black/60 backdrop-blur-md rounded-xl border border-white/10 shadow-2xl'}`;
  
  const buttonClass = `flex items-center justify-center transition-all w-10 h-10 ${isCyber ? 'rounded-br-lg rounded-tl-lg bg-[#050c18] border border-[#0ff]/30 text-[#0ff]/60 hover:text-[#0ff] hover:border-[#0ff]/70 hover:bg-[#0ff]/20' : 'rounded-lg bg-[#1a1a1a] text-gray-400 border border-[#333] shadow-md hover:bg-[#2a2a2a] hover:text-gray-100 hover:border-gray-500'}`;

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const success = await (window as any).api.exportDatabase();
      if (success) {
        alert("Database backup exported successfully!");
      }
    } catch (e) {
      console.error(e);
      alert("Error exporting database.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async () => {
    if (confirm("Importing a backup will replace your current database and the application will restart. Are you sure you want to continue?")) {
      try {
        setIsImporting(true);
        const success = await (window as any).api.importDatabase();
        if (!success) {
          setIsImporting(false);
        }
      } catch (e) {
        console.error(e);
        alert("Error importing database.");
        setIsImporting(false);
      }
    }
  };

  return (
    <div className={containerClass}>
      <button
        onClick={handleExport}
        disabled={isExporting}
        className={buttonClass}
        title="Export Database (Backup)"
      >
        <Download size={16} className={isExporting ? 'animate-bounce' : ''} />
      </button>
      <button
        onClick={handleImport}
        disabled={isImporting}
        className={buttonClass}
        title="Import Database (Restore)"
      >
        <Upload size={16} className={isImporting ? 'animate-bounce' : ''} />
      </button>
    </div>
  );
}
