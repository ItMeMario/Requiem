import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-surface-overlay backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-surface-card border border-border-default rounded-xl p-6 w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <button 
          onClick={onCancel} 
          className="absolute top-4 right-4 text-muted hover:text-heading transition-colors"
        >
          <X size={20} />
        </button>
        
        <div className="flex items-start space-x-4 mb-6">
          <div className="p-3 bg-red-500/10 rounded-full flex-shrink-0">
            <AlertTriangle size={24} className="text-red-500" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-heading">{title}</h3>
            <p className="text-muted mt-2 text-sm leading-relaxed whitespace-pre-wrap">{message}</p>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 pt-2">
          <button 
            onClick={onCancel} 
            className="px-4 py-2 text-muted hover:text-heading transition-colors font-medium"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm} 
            className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded transition-colors shadow-lg shadow-red-900/20"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};
