
import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Save, 
  Download, 
  Upload,
  Check,
  AlertCircle,
  Copy
} from 'lucide-react';
import { ClockConfig, ClockField, ClockFieldType } from '../../types';
import { THEME } from '../../theme';
import { useLanguage } from '../../contexts/LanguageContext';
import { Modal } from '../ui/Modal';
import { useCanvasInteraction } from '../../hooks/useCanvasInteraction';

import ClockLayersPanel from './ClockLayersPanel';
import ClockPropertiesPanel from './ClockPropertiesPanel';
import ClockCanvas from './ClockCanvas';

interface ClockEditorProps {
  initialConfig?: ClockConfig;
  onSave: (config: ClockConfig) => void;
  onClose: () => void;
}

const ClockEditor: React.FC<ClockEditorProps> = ({ initialConfig, onSave, onClose }) => {
  const { t } = useLanguage();
  const [config, setConfig] = useState<ClockConfig>({
      id: crypto.randomUUID(),
      name: 'New Clock Layout',
      description: '',
      backgroundColor: '#111111',
      fontColor: '#FFFFFF',
      fields: []
  });
  
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [clipboard, setClipboard] = useState<ClockField | null>(null);
  
  const [showGrid, setShowGrid] = useState(false);
  const [enableSnap, setEnableSnap] = useState(false);
  
  const canvasRef = useRef<HTMLDivElement>(null);

  // Import/Export State
  const [isIOModalOpen, setIsIOModalOpen] = useState(false);
  const [ioMode, setIoMode] = useState<'import' | 'export'>('export');
  const [ioJson, setIoJson] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  // --- Hook: Canvas Interaction ---
  const handlePositionUpdate = (id: string, pos: { x: number; y: number }) => {
      setConfig(prev => ({
          ...prev,
          fields: prev.fields.map(f => f.id === id ? { ...f, ...pos } : f)
      }));
  };

  const { isDragging, startDrag, handleMouseMove, endDrag } = useCanvasInteraction(
      canvasRef, 
      handlePositionUpdate, 
      { enableSnap }
  );

  // --- Effects ---

  useEffect(() => {
      if (initialConfig) {
          setConfig(initialConfig);
      }
  }, [initialConfig]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName || '')) return;

        if (e.key === 'Delete' || e.key === 'Backspace') {
            if (selectedFieldId) {
                removeField(selectedFieldId);
            }
            return;
        }

        if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
            if (selectedFieldId) {
                const field = config.fields.find(f => f.id === selectedFieldId);
                if (field) {
                    e.preventDefault();
                    setClipboard(field);
                }
            }
        }

        if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
            if (clipboard) {
                e.preventDefault();
                duplicateField(clipboard);
            }
        }
        
        // Arrow keys for fine tuning
        if (selectedFieldId && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            e.preventDefault();
            const field = config.fields.find(f => f.id === selectedFieldId);
            if (!field) return;
            const delta = e.shiftKey ? 1 : 0.1; // 1% or 0.1% move
            let { x, y } = field;
            if (e.key === 'ArrowLeft') x -= delta;
            if (e.key === 'ArrowRight') x += delta;
            if (e.key === 'ArrowUp') y -= delta;
            if (e.key === 'ArrowDown') y += delta;
            updateField(selectedFieldId, { x, y });
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedFieldId, config.fields, clipboard]);

  // --- Actions ---

  const handleConfigUpdate = (updates: Partial<ClockConfig>) => {
      setConfig(prev => ({ ...prev, ...updates }));
  };

  const addField = (type: ClockFieldType) => {
      const isShape = type.startsWith('shape_');
      const isLine = type === 'line';
      const isImage = type === 'image';
      const isText = !isShape && !isLine && !isImage;

      const newField: ClockField = {
          id: crypto.randomUUID(),
          type,
          label: type, // This will be resolved by UI components
          x: 50,
          y: 50,
          fontSize: (type === 'timer' || type === 'blind_countdown') ? 120 : 32,
          fontWeight: (type === 'timer' || type === 'blind_countdown' || type === 'blind_level') ? 'bold' : 'normal',
          color: isShape || isLine ? '#333333' : (config.fontColor || '#FFFFFF'), 
          align: 'center',
          showLabel: isText,
          labelText: type === 'blind_level' ? 'BLINDS' : 
                     type === 'ante' ? 'ANTE' : 
                     type === 'next_ante' ? 'NEXT ANTE' :
                     type === 'avg_stack' ? 'AVG STACK' : 
                     type === 'next_blinds' ? 'NEXT BLINDS' :
                     type === 'est_end_time' ? 'EST END' :
                     type === 'starting_chips' ? 'STARTING CHIPS' :
                     type === 'rebuy_limit' ? 'REBUYS' :
                     undefined,
          width: isLine ? 300 : isShape ? 100 : isImage ? 200 : undefined,
          height: isLine ? 4 : isShape ? 100 : isImage ? 200 : undefined,
          borderColor: '#ffffff',
          borderWidth: 0,
          imageUrl: isImage ? '' : undefined
      };
      
      setConfig(prev => ({ ...prev, fields: [...prev.fields, newField] }));
      setSelectedFieldId(newField.id);
  };

  const duplicateField = (field: ClockField) => {
      const newField = {
          ...field,
          id: crypto.randomUUID(),
          x: Math.min(field.x + 2, 98), 
          y: Math.min(field.y + 2, 98)
      };
      
      setConfig(prev => ({
          ...prev,
          fields: [...prev.fields, newField]
      }));
      setSelectedFieldId(newField.id);
  };

  const removeField = (id: string) => {
      setConfig(prev => ({ ...prev, fields: prev.fields.filter(f => f.id !== id) }));
      if (selectedFieldId === id) setSelectedFieldId(null);
  };

  const updateField = (id: string, updates: Partial<ClockField>) => {
      setConfig(prev => ({
          ...prev,
          fields: prev.fields.map(f => f.id === id ? { ...f, ...updates } : f)
      }));
  };

  const handleReorder = (draggedId: string, targetId: string) => {
      if (draggedId === targetId) return;
      const newFields = [...config.fields];
      const draggedIndex = newFields.findIndex(f => f.id === draggedId);
      const targetIndex = newFields.findIndex(f => f.id === targetId);
      if (draggedIndex === -1 || targetIndex === -1) return;
      const [draggedItem] = newFields.splice(draggedIndex, 1);
      newFields.splice(targetIndex, 0, draggedItem);
      setConfig({ ...config, fields: newFields });
  };

  const moveLayer = (id: string, direction: 'up' | 'down' | 'front' | 'back') => {
      const index = config.fields.findIndex(f => f.id === id);
      if (index === -1) return;
      const newFields = [...config.fields];
      
      if (direction === 'front') {
          const [item] = newFields.splice(index, 1);
          newFields.push(item);
      } else if (direction === 'back') {
          const [item] = newFields.splice(index, 1);
          newFields.unshift(item);
      } else if (direction === 'up') {
          if (index < newFields.length - 1) {
              [newFields[index], newFields[index + 1]] = [newFields[index + 1], newFields[index]];
          }
      } else if (direction === 'down') {
          if (index > 0) {
              [newFields[index], newFields[index - 1]] = [newFields[index - 1], newFields[index]];
          }
      }
      setConfig({ ...config, fields: newFields });
  };

  const handleCanvasMouseDown = (e: React.MouseEvent, fieldId: string) => {
      const field = config.fields.find(f => f.id === fieldId);
      if (field) {
          setSelectedFieldId(fieldId);
          startDrag(e, fieldId, field.x, field.y);
      }
  };

  // Import/Export Handlers
  const handleOpenExport = () => {
      setIoJson(JSON.stringify(config, null, 2));
      setIoMode('export');
      setCopySuccess(false);
      setIsIOModalOpen(true);
  };

  const handleOpenImport = () => {
      setIoJson('');
      setImportError(null);
      setIoMode('import');
      setIsIOModalOpen(true);
  };

  const handleCopyJson = () => {
      navigator.clipboard.writeText(ioJson);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleConfirmImport = () => {
      try {
          const parsed = JSON.parse(ioJson);
          if (!parsed.fields || !Array.isArray(parsed.fields)) {
              throw new Error("Invalid format: missing 'fields' array.");
          }
          const importedConfig: ClockConfig = {
              ...parsed,
              id: config.id, 
              name: parsed.name + ' (Imported)',
          };
          setConfig(importedConfig);
          setIsIOModalOpen(false);
      } catch (e) {
          setImportError((e as Error).message);
      }
  };

  const selectedField = config.fields.find(f => f.id === selectedFieldId) || null;

  return (
    <div className="fixed inset-0 z-50 bg-[#000] flex flex-col text-white" onMouseMove={handleMouseMove} onMouseUp={endDrag}>
        {/* Header */}
        <div className="h-16 border-b border-[#222] bg-[#111] flex items-center justify-between px-6 shrink-0 z-20 relative">
             <div className="flex items-center gap-4">
                 <button onClick={onClose} className="p-2 hover:bg-[#222] rounded-full text-gray-400 hover:text-white transition-colors">
                     <ArrowLeft size={20} />
                 </button>
                 <div className="h-6 w-px bg-[#333]"></div>
                 <input 
                    type="text" 
                    value={config.name}
                    onChange={(e) => setConfig({...config, name: e.target.value})}
                    className="bg-transparent text-lg font-bold outline-none placeholder:text-gray-600 w-64"
                    placeholder={t('clocks.editor.headerName')}
                 />
             </div>
             
             {/* Grid/Snap Controls (Centered) */}
             <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2">
                 <button 
                    onClick={() => setShowGrid(!showGrid)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors ${showGrid ? 'bg-brand-green/20 text-brand-green border-brand-green/30' : 'bg-[#1A1A1A] border-[#333] text-gray-500'}`}
                 >
                     {t('clocks.editor.grid')}
                 </button>
                 <button 
                    onClick={() => setEnableSnap(!enableSnap)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors ${enableSnap ? 'bg-brand-green/20 text-brand-green border-brand-green/30' : 'bg-[#1A1A1A] border-[#333] text-gray-500'}`}
                 >
                     {t('clocks.editor.snap')}
                 </button>
             </div>
             
             <div className="flex items-center gap-3">
                 <div className="flex items-center gap-1 mr-4 bg-[#1A1A1A] p-1 rounded-lg border border-[#333]">
                    <button onClick={handleOpenImport} className="p-2 text-gray-400 hover:text-white hover:bg-[#333] rounded-md transition-colors" title="Import JSON">
                        <Upload size={18} />
                    </button>
                    <div className="w-px h-4 bg-[#333]"></div>
                    <button onClick={handleOpenExport} className="p-2 text-gray-400 hover:text-white hover:bg-[#333] rounded-md transition-colors" title="Export JSON">
                        <Download size={18} />
                    </button>
                 </div>

                 <button 
                    onClick={() => onSave(config)}
                    className={`${THEME.buttonPrimary} px-6 py-2 rounded-full font-bold flex items-center gap-2`}
                 >
                     <Save size={18} /> {t('clocks.editor.save')}
                 </button>
             </div>
        </div>

        <div className="flex flex-1 overflow-hidden relative">
            
            {/* Left: Layers & Library */}
            <ClockLayersPanel 
                config={config}
                selectedFieldId={selectedFieldId}
                onSelect={setSelectedFieldId}
                onRemove={removeField}
                onAdd={addField}
                onReorder={handleReorder}
                onUpdateConfig={handleConfigUpdate}
            />

            {/* Canvas */}
            <div className="flex-1 bg-[#000] relative overflow-hidden flex items-center justify-center p-8 select-none">
                <ClockCanvas 
                    ref={canvasRef}
                    config={config}
                    selectedFieldId={selectedFieldId}
                    showGrid={showGrid}
                    onMouseDown={handleCanvasMouseDown}
                    onBackgroundClick={() => setSelectedFieldId(null)}
                />
            </div>

            {/* Right: Properties */}
            <ClockPropertiesPanel 
                config={config}
                onUpdateConfig={handleConfigUpdate}
                selectedField={selectedField}
                onUpdate={updateField}
                onDuplicate={duplicateField}
                onRemove={removeField}
                onMoveLayer={moveLayer}
            />
        </div>

        {/* Import/Export Modal */}
        <Modal
            isOpen={isIOModalOpen}
            onClose={() => setIsIOModalOpen(false)}
            title={ioMode === 'export' ? "Export Configuration" : "Import Configuration"}
            size="xl"
        >
            <div className="p-6 flex flex-col h-[500px]">
                {ioMode === 'export' && (
                    <div className="mb-4 text-sm text-gray-400">
                        Copy this JSON to save your layout or share it with others.
                    </div>
                )}
                {ioMode === 'import' && (
                    <div className="mb-4 text-sm text-gray-400">
                        Paste a valid JSON configuration below to load it into the editor.
                    </div>
                )}
                
                <textarea 
                    value={ioJson}
                    onChange={(e) => { setIoJson(e.target.value); setImportError(null); }}
                    readOnly={ioMode === 'export'}
                    className={`flex-1 bg-[#111] border rounded-xl p-4 font-mono text-xs text-gray-300 outline-none resize-none mb-4 ${importError ? 'border-red-500' : 'border-[#333] focus:border-brand-green'}`}
                    placeholder={ioMode === 'import' ? 'Paste JSON here...' : ''}
                />

                {importError && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-xs">
                        <AlertCircle size={16} />
                        {importError}
                    </div>
                )}

                <div className="flex justify-end gap-3">
                    <button 
                        onClick={() => setIsIOModalOpen(false)}
                        className="px-4 py-2 rounded-xl text-sm font-bold text-gray-400 hover:text-white hover:bg-[#222] transition-colors"
                    >
                        Cancel
                    </button>
                    
                    {ioMode === 'export' ? (
                        <button 
                            onClick={handleCopyJson}
                            className={`px-6 py-2 rounded-xl font-bold flex items-center gap-2 transition-all ${copySuccess ? 'bg-green-500 text-white' : THEME.buttonPrimary}`}
                        >
                            {copySuccess ? <Check size={18} /> : <Copy size={18} />}
                            {copySuccess ? "Copied!" : "Copy to Clipboard"}
                        </button>
                    ) : (
                        <button 
                            onClick={handleConfirmImport}
                            className={`${THEME.buttonPrimary} px-6 py-2 rounded-xl font-bold flex items-center gap-2`}
                        >
                            <Upload size={18} /> Import
                        </button>
                    )}
                </div>
            </div>
        </Modal>
    </div>
  );
};

export default ClockEditor;
