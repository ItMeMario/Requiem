import React, { useState, useRef, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Book, X, Edit2, Users, Map as MapIcon, Link as LinkIcon } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { InputField } from '../InputField';
import { parseMentions } from '../../utils/mentionParser';

interface EntryModalProps {
  showEntryModal: boolean;
  setShowEntryModal: (show: boolean) => void;
  isViewingEntry: boolean;
  setIsViewingEntry: (viewing: boolean) => void;
  editingEntryId: number | null;
  entries: any[];
  newEntry: any;
  setNewEntry: (entry: any) => void;
  handleCreateEntry: (e: React.FormEvent) => void;
  handleDeleteEntry: (id: number) => void;
  handleMentionClick: (e: React.MouseEvent) => void;
  characters: any[];
  locations: any[];
}

export const EntryModal: React.FC<EntryModalProps> = ({ 
  showEntryModal, setShowEntryModal, isViewingEntry, setIsViewingEntry, editingEntryId, 
  entries, newEntry, setNewEntry, handleCreateEntry, handleDeleteEntry, handleMentionClick, 
  characters, locations 
}) => {
  const quillRef = useRef<any>(null);
  const [contextMenu, setContextMenu] = useState<{show: boolean, x: number, y: number, text: string, index: number, length: number} | null>(null);

  useEffect(() => {
    const handleClick = () => {
      if (contextMenu) setContextMenu(null);
    };
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [contextMenu]);

  const makeLinkHandler = function(this: any) {
    const quill = this.quill || this;
    const range = quill.getSelection();
    if (range && range.length > 0) {
      const text = quill.getText(range.index, range.length);
      quill.deleteText(range.index, range.length);
      quill.insertText(range.index, `{${text}}`);
      quill.setSelection(range.index + text.length + 2, 0);
    }
  };

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        ['blockquote'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        ['link', 'makeLink'],
        ['clean']
      ],
      handlers: {
        makeLink: makeLinkHandler
      }
    },
    keyboard: {
      bindings: {
        makeLink: {
          key: 'L',
          shortKey: true,
          handler: function(this: any, range: any) {
            makeLinkHandler.call(this);
            return false;
          }
        }
      }
    }
  }), []);

  const handleContextMenu = (e: React.MouseEvent) => {
    if (!quillRef.current) return;
    const editor = quillRef.current.getEditor();
    const selection = editor.getSelection();
    
    if (selection && selection.length > 0) {
      e.preventDefault();
      const text = editor.getText(selection.index, selection.length);
      setContextMenu({
        show: true,
        x: e.clientX,
        y: e.clientY,
        text,
        index: selection.index,
        length: selection.length
      });
    } else {
      setContextMenu(null);
    }
  };

  const createLinkFromMenu = () => {
    if (!contextMenu || !quillRef.current) return;
    const editor = quillRef.current.getEditor();
    editor.deleteText(contextMenu.index, contextMenu.length);
    editor.insertText(contextMenu.index, `{${contextMenu.text}}`);
    setContextMenu(null);
  };

  if (!showEntryModal) return null;

  return createPortal(
    <div className="fixed inset-0 bg-surface-overlay backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-surface-card border border-border-default rounded-xl w-full max-w-6xl shadow-2xl relative h-[90vh] flex flex-col overflow-hidden">
        <button onClick={() => setShowEntryModal(false)} className="absolute top-4 right-4 text-muted hover:text-heading z-20"><X size={20} /></button>
        <div className="p-6 border-b border-border-default flex-shrink-0 flex items-center justify-between pr-12">
          <h3 className="text-xl font-bold text-heading flex items-center gap-2">
            <Book className="text-accent-text"/> 
            {isViewingEntry ? 'View Journal Entry' : (editingEntryId ? 'Edit Journal Entry' : 'New Journal Entry')}
          </h3>
          {isViewingEntry && (
            <div className="flex space-x-2">
              <button onClick={() => setIsViewingEntry(false)} className="px-4 py-2 bg-accent hover:bg-accent-hover rounded text-heading text-sm font-medium transition-colors flex items-center gap-2">
                <Edit2 size={16} /> Edit Entry
              </button>
              <button onClick={() => handleDeleteEntry(editingEntryId!)} className="px-4 py-2 bg-danger-muted-bg hover:bg-danger-muted-hover text-danger-text border border-danger-border rounded text-sm font-medium transition-colors">
                Delete
              </button>
            </div>
          )}
        </div>
        
        <div className="flex-1 flex overflow-hidden">
          {/* Left Column: Editor / Viewer */}
          <div className="flex-1 flex flex-col p-6 overflow-y-auto custom-scrollbar border-r border-border-default bg-surface-app">
            {isViewingEntry ? (
              <div className="flex-1 flex flex-col space-y-6 max-w-4xl mx-auto w-full">
                <div className="border-b border-border-default pb-6">
                  <h1 className="text-4xl font-bold text-primary">{newEntry.title}</h1>
                  <div className="text-accent-text mt-2 text-sm">{entries.find(e => e.id === editingEntryId)?.creation_date ? new Date(entries.find(e => e.id === editingEntryId).creation_date).toLocaleString() : ''}</div>
                </div>
                <div 
                  className="quill-content text-lg text-secondary"
                  onClick={handleMentionClick}
                  dangerouslySetInnerHTML={{ __html: parseMentions(newEntry.content, characters, locations) }}
                />
              </div>
            ) : (
              <form id="entry-form" onSubmit={handleCreateEntry} className="flex-1 flex flex-col space-y-4">
                <InputField label="Title *" value={newEntry.title} onChange={(e:any) => setNewEntry({...newEntry, title: e.target.value})} placeholder="Day 1: The Journey Begins..." />
                
                <div className="flex-1 flex flex-col min-h-[400px]">
                  <label className="block text-sm text-muted mb-1">Content <span className="text-xs text-faint ml-2">(Tip: Select text and press Ctrl+L or right-click to link!)</span></label>
                  <div 
                    className="flex-1 rounded-lg overflow-hidden flex flex-col relative" 
                    style={{ background: 'var(--quill-editor-bg)', color: 'var(--quill-editor-text)' }}
                    onContextMenu={handleContextMenu}
                  >
                    <style>{`
                      .ql-snow .ql-toolbar button.ql-makeLink {
                        width: auto;
                        padding: 0 5px;
                        font-weight: bold;
                        font-family: monospace;
                        font-size: 14px;
                        color: var(--quill-editor-text);
                      }
                      .ql-snow .ql-toolbar button.ql-makeLink::before {
                        content: '{ }';
                      }
                      .ql-snow .ql-toolbar button.ql-makeLink:hover {
                        color: #06c;
                      }
                    `}</style>
                    <ReactQuill 
                      ref={quillRef}
                      theme="snow"
                      value={newEntry.content}
                      onChange={(val) => setNewEntry({...newEntry, content: val})}
                      modules={modules}
                      className="flex-1 h-full flex flex-col [&_.ql-container]:flex-1 [&_.ql-editor]:h-full"
                    />
                    
                    {contextMenu && contextMenu.show && (
                      <div 
                        className="fixed z-[10000] bg-surface-card border border-border-default rounded-md shadow-lg py-1 w-48"
                        style={{ top: contextMenu.y, left: contextMenu.x }}
                      >
                        <button 
                          className="w-full text-left px-4 py-2 text-sm text-secondary hover:bg-surface-hover hover:text-heading flex items-center gap-2"
                          onClick={(e) => {
                            e.preventDefault();
                            createLinkFromMenu();
                          }}
                        >
                          <LinkIcon size={14} />
                          Link Text
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </form>
            )}
          </div>

          {/* Right Column: References Sidebar */}
          <div className="w-80 bg-surface-card flex flex-col overflow-hidden">
            <div className="p-4 border-b border-border-default bg-surface-card/80 sticky top-0 z-10 backdrop-blur">
              <h4 className="font-semibold text-secondary">References</h4>
              <p className="text-xs text-muted mt-1 mb-2">Check characters and locations while writing.</p>
              <p className="text-xs text-faint">
                <strong className="text-accent-text">Tip:</strong> Select text and click {'{ }'}, use <kbd className="bg-surface-app px-1 rounded border border-border-default">Ctrl+L</kbd>, or right-click to link it.
              </p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-6">
              <div>
                <h5 className="text-sm font-bold text-accent-text uppercase tracking-wider flex items-center gap-2 border-b border-border-default pb-2 mb-3">
                  <Users size={14} /> Characters
                </h5>
                {characters.length === 0 ? (
                  <div className="text-xs text-faint italic">No characters yet.</div>
                ) : (
                  <ul className="space-y-2">
                    {characters.map(c => (
                      <li key={c.id} className="text-sm">
                        <span className="font-medium text-secondary">{c.name}</span>
                        {c.race && <span className="text-xs text-faint ml-1"> ({c.race})</span>}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              
              <div>
                <h5 className="text-sm font-bold text-accent2-text uppercase tracking-wider flex items-center gap-2 border-b border-border-default pb-2 mb-3">
                  <MapIcon size={14} /> Locations
                </h5>
                {locations.length === 0 ? (
                  <div className="text-xs text-faint italic">No locations yet.</div>
                ) : (
                  <ul className="space-y-2">
                    {locations.map(l => (
                      <li key={l.id} className="text-sm">
                        <span className="font-medium text-secondary">{l.name}</span>
                        {l.type && <span className="text-xs text-faint ml-1"> ({l.type})</span>}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>

        {!isViewingEntry && (
          <div className="p-4 border-t border-border-default flex justify-end bg-surface-card flex-shrink-0">
            <button type="button" onClick={() => setShowEntryModal(false)} className="px-4 py-2 text-muted hover:text-heading transition-colors mr-2">Cancel</button>
            <button type="submit" form="entry-form" disabled={!newEntry.title.trim()} className="px-5 py-2 bg-gradient-to-r from-accent-grad-from to-accent-grad-to hover:opacity-90 text-heading font-medium rounded transition-colors disabled:opacity-50">Save Entry</button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
