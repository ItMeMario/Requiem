import React, { useState, useRef } from 'react';
import { Download, Upload } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { getDataService } from '../services';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

export function DatabaseControls() {
  const { theme } = useTheme();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isCyber = theme === 'cyberpunk';
  const containerClass = `fixed bottom-4 right-4 z-[100] flex gap-1.5 p-1.5 ${isCyber ? 'bg-transparent' : 'bg-black/60 backdrop-blur-md rounded-xl border border-white/10 shadow-2xl'}`;
  
  const buttonClass = `flex items-center justify-center transition-all w-10 h-10 ${isCyber ? 'rounded-br-lg rounded-tl-lg bg-[#050c18] border border-[#0ff]/30 text-[#0ff]/60 hover:text-[#0ff] hover:border-[#0ff]/70 hover:bg-[#0ff]/20' : 'rounded-lg bg-[#1a1a1a] text-gray-400 border border-[#333] shadow-md hover:bg-[#2a2a2a] hover:text-gray-100 hover:border-gray-500'}`;

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const result = await getDataService().exportDatabase();
      if (typeof result === 'boolean') {
        if (result) alert("Database backup exported successfully!");
        setIsExporting(false);
      } else if (result instanceof Uint8Array) {
        if (Capacitor.isNativePlatform()) {
          const blob = new Blob([result.buffer as ArrayBuffer], { type: 'application/x-sqlite3' });
          const reader = new FileReader();
          
          const base64data = await new Promise<string>((resolve, reject) => {
            reader.readAsDataURL(blob);
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
          });
          
          const base64 = base64data.split(',')[1];
          const fileName = `requiem_backup_${new Date().toISOString().split('T')[0]}.db`;
          
          const writeResult = await Filesystem.writeFile({
            path: fileName,
            data: base64,
            directory: Directory.Cache
          });
          
          await Share.share({
            title: 'Requiem Database Backup',
            text: 'Backup file for Requiem Campaign Manager',
            url: writeResult.uri,
            dialogTitle: 'Save or Share Database Backup',
          });
          
          alert("Database backup exported successfully!");
          setIsExporting(false);
        } else {
          const blob = new Blob([result.buffer as ArrayBuffer], { type: 'application/x-sqlite3' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `requiem_backup_${new Date().toISOString().split('T')[0]}.db`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          alert("Database backup exported successfully!");
          setIsExporting(false);
        }
      }
    } catch (e) {
      console.error(e);
      alert("Error exporting database.");
      setIsExporting(false);
    }
  };

  const handleImportClick = () => {
    if (typeof window !== 'undefined' && (window as any).api) {
      handleElectronImport();
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleElectronImport = async () => {
    if (confirm("Importing a backup will replace your current database and the application will restart. Are you sure you want to continue?")) {
      try {
        setIsImporting(true);
        const success = await getDataService().importDatabase();
        if (!success) setIsImporting(false);
      } catch (e) {
        console.error(e);
        alert("Error importing database.");
        setIsImporting(false);
      }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (confirm("Importing a backup will replace your current database. Are you sure you want to continue?")) {
      try {
        setIsImporting(true);
        const buffer = await file.arrayBuffer();
        const data = new Uint8Array(buffer);
        const success = await getDataService().importDatabase(data);
        if (success) {
           alert("Database imported successfully. Please reload the page.");
           window.location.reload();
        } else {
           setIsImporting(false);
        }
      } catch (err) {
        console.error(err);
        alert("Error importing database.");
        setIsImporting(false);
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className={containerClass}>
      <input 
        type="file" 
        accept=".db,.sqlite" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        style={{ display: 'none' }} 
      />
      <button
        onClick={handleExport}
        disabled={isExporting}
        className={buttonClass}
        title="Export Database (Backup)"
      >
        <Download size={16} className={isExporting ? 'animate-bounce' : ''} />
      </button>
      <button
        onClick={handleImportClick}
        disabled={isImporting}
        className={buttonClass}
        title="Import Database (Restore)"
      >
        <Upload size={16} className={isImporting ? 'animate-bounce' : ''} />
      </button>
    </div>
  );
}
