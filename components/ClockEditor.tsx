
import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Save, 
  Move, 
  Type, 
  Clock, 
  Users, 
  Coins, 
  Layers, 
  Trash2, 
  Plus, 
  X, 
  Square, 
  Circle, 
  Triangle, 
  Minus, 
  ArrowUp, 
  ArrowDown, 
  ChevronsUp, 
  ChevronsDown, 
  Palette, 
  GripVertical, 
  Calendar, 
  Timer, 
  Copy,
  Download,
  Upload,
  Check,
  AlertCircle
} from 'lucide-react';
import { ClockConfig, ClockField, ClockFieldType } from '../types';
import { THEME } from '../theme';
import NumberInput from './ui/NumberInput';
import { useLanguage } from '../contexts/LanguageContext';
import { Modal } from './ui/Modal';

interface ClockEditorProps {
  initialConfig?: ClockConfig;
  onSave: (config: ClockConfig) => void;
  onClose: () => void;
}

const MOCK_PREVIEW_DATA: Record<string, string> = {
    tournament_name: "Sunday Special",
    tournament_desc: "$10k Guaranteed",
    timer: "18:42",
    blind_countdown: "18:42",
    blind_level: "1,000 / 2,000",
    next_blinds: "1,500 / 3,000",
    ante: "2,000",
    next_ante: "3,000",
    starting_chips: "25,000",
    rebuy_limit: "1 Rebuy",
    players_count: "45 / 120",
    entries_count: "142",
    total_chips: "3,550,000",
    avg_stack: "78,888",
    payout_total: "$12,500",
    next_break: "1h 15m",
    current_time: "08:30 PM",
    current_date: new Date().toLocaleDateString(),
    start_time: "06:00 PM",
    start_date: new Date().toLocaleDateString(),
    est_end_time: "01:30 AM",
};

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
  const [isAddWidgetOpen, setIsAddWidgetOpen] = useState(false);
  const [draggedFieldId, setDraggedFieldId] = useState<string | null>(null);
  const [clipboard, setClipboard] = useState<ClockField | null>(null);
  
  const [showGrid, setShowGrid] = useState(false);
  const [enableSnap, setEnableSnap] = useState(false);
  
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{
      startX: number; 
      startY: number; 
      initialFieldX: number; 
      initialFieldY: number; 
  } | null>(null);
  
  const canvasRef = useRef<HTMLDivElement>(null);

  // Import/Export State
  const [isIOModalOpen, setIsIOModalOpen] = useState(false);
  const [ioMode, setIoMode] = useState<'import' | 'export'>('export');
  const [ioJson, setIoJson] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const availableFields = [
    { type: 'tournament_name', label: t('clocks.widgets.tournament_name'), icon: Type },
    { type: 'tournament_desc', label: t('clocks.widgets.tournament_desc'), icon: Type },
    { type: 'timer', label: t('clocks.widgets.timer'), icon: Clock },
    { type: 'blind_countdown', label: t('clocks.widgets.blind_countdown'), icon: Timer },
    { type: 'blind_level', label: t('clocks.widgets.blind_level'), icon: Layers },
    { type: 'next_blinds', label: t('clocks.widgets.next_blinds'), icon: Layers },
    { type: 'ante', label: t('clocks.widgets.ante'), icon: Layers },
    { type: 'next_ante', label: t('clocks.widgets.next_ante'), icon: Layers },
    { type: 'starting_chips', label: t('clocks.widgets.starting_chips'), icon: Coins },
    { type: 'rebuy_limit', label: t('clocks.widgets.rebuy_limit'), icon: Coins },
    { type: 'players_count', label: t('clocks.widgets.players_count'), icon: Users },
    { type: 'entries_count', label: t('clocks.widgets.entries_count'), icon: Users },
    { type: 'total_chips', label: t('clocks.widgets.total_chips'), icon: Coins },
    { type: 'avg_stack', label: t('clocks.widgets.avg_stack'), icon: Coins },
    { type: 'payout_total', label: t('clocks.widgets.payout_total'), icon: Coins },
    { type: 'next_break', label: t('clocks.widgets.next_break'), icon: Clock },
    { type: 'current_time', label: t('clocks.widgets.current_time'), icon: Clock },
    { type: 'current_date', label: t('clocks.widgets.current_date'), icon: Calendar },
    { type: 'start_time', label: t('clocks.widgets.start_time'), icon: Clock },
    { type: 'start_date', label: t('clocks.widgets.start_date'), icon: Calendar },
    { type: 'est_end_time', label: t('clocks.widgets.est_end_time'), icon: Clock },
    { type: 'custom_text', label: t('clocks.widgets.custom_text'), icon: Type },
    { type: 'line', label: t('clocks.widgets.line'), icon: Minus },
    { type: 'shape_rect', label: t('clocks.widgets.shape_rect'), icon: Square },
    { type: 'shape_circle', label: t('clocks.widgets.shape_circle'), icon: Circle },
    { type: 'shape_triangle', label: t('clocks.widgets.shape_triangle'), icon: Triangle },
  ] as const;

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

  const addField = (type: ClockFieldType) => {
      const isShape = type.startsWith('shape_');
      const isLine = type === 'line';
      const isText = !isShape && !isLine;

      const newField: ClockField = {
          id: crypto.randomUUID(),
          type,
          label: availableFields.find(f => f.type === type)?.label || 'Unknown',
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
          width: isLine ? 300 : isShape ? 100 : undefined,
          height: isLine ? 4 : isShape ? 100 : undefined,
          borderColor: '#ffffff',
          borderWidth: 0
      };
      
      setConfig(prev => ({ ...prev, fields: [...prev.fields, newField] }));
      setSelectedFieldId(newField.id);
      setIsAddWidgetOpen(false);
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

  const handleMouseDown = (e: React.MouseEvent, fieldId: string) => {
      e.stopPropagation();
      const field = config.fields.find(f => f.id === fieldId);
      if (!field) return;
      setSelectedFieldId(fieldId);
      setIsAddWidgetOpen(false);
      setIsDragging(true);
      dragStartRef.current = { 
          startX: e.clientX, 
          startY: e.clientY,
          initialFieldX: field.x,
          initialFieldY: field.y
      };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
      if (!isDragging || !selectedFieldId || !dragStartRef.current || !canvasRef.current) return;
      
      const rect = canvasRef.current.getBoundingClientRect();
      const deltaXPx = e.clientX - dragStartRef.current.startX;
      const deltaYPx = e.clientY - dragStartRef.current.startY;
      const deltaXPercent = (deltaXPx / rect.width) * 100;
      const deltaYPercent = (deltaYPx / rect.height) * 100;

      let newX = dragStartRef.current.initialFieldX + deltaXPercent;
      let newY = dragStartRef.current.initialFieldY + deltaYPercent;

      if (enableSnap) {
          const SNAP_INTERVAL = 5;
          const SNAP_THRESHOLD = 1.5;
          const nearestGridX = Math.round(newX / SNAP_INTERVAL) * SNAP_INTERVAL;
          const nearestGridY = Math.round(newY / SNAP_INTERVAL) * SNAP_INTERVAL;
          if (Math.abs(newX - nearestGridX) < SNAP_THRESHOLD) newX = nearestGridX;
          if (Math.abs(newY - nearestGridY) < SNAP_THRESHOLD) newY = nearestGridY;
      }

      updateField(selectedFieldId, { x: newX, y: newY });
  };

  const handleMouseUp = () => {
      setIsDragging(false);
      dragStartRef.current = null;
  };

  // Import/Export Handlers
  const handleOpenExport = () => {
      // Clean up for export if needed, here we just stringify
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
          
          // Preserve current ID to ensure we are updating the current record, 
          // but take everything else from the imported JSON.
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

  const selectedField = config.fields.find(f => f.id === selectedFieldId);

  const isShapeOrLine = (type: ClockFieldType) => type.startsWith('shape_') || type === 'line';
  
  const renderWidgetContent = (field: ClockField) => {
      // Shapes
      if (field.type === 'shape_rect') {
          return (
              <div style={{
                  width: `${field.width}px`,
                  height: `${field.height}px`,
                  backgroundColor: field.color,
                  borderWidth: `${field.borderWidth || 0}px`,
                  borderColor: field.borderColor,
                  borderStyle: 'solid'
              }} />
          );
      }
      if (field.type === 'shape_circle') {
          return (
              <div style={{
                  width: `${field.width}px`,
                  height: `${field.height}px`,
                  backgroundColor: field.color,
                  borderRadius: '50%',
                  borderWidth: `${field.borderWidth || 0}px`,
                  borderColor: field.borderColor,
                  borderStyle: 'solid'
              }} />
          );
      }
      if (field.type === 'shape_triangle') {
          return (
              <svg width={field.width} height={field.height} viewBox="0 0 100 100" preserveAspectRatio="none">
                  <polygon points="50,0 100,100 0,100" fill={field.color} stroke={field.borderColor} strokeWidth={field.borderWidth ? (field.borderWidth * (100 / (field.width || 100))) : 0} />
              </svg>
          );
      }
      if (field.type === 'line') {
          return (
              <div style={{
                  width: `${field.width}px`,
                  height: `${field.height}px`,
                  backgroundColor: field.color,
                  borderRadius: '999px'
              }} />
          );
      }
      
      // Text - Use Mock Preview Data
      const textValue = field.type === 'custom_text' 
        ? (field.customText || 'Custom Text') 
        : (MOCK_PREVIEW_DATA[field.type] || field.type);

      return (
        <div style={{
            fontSize: `${field.fontSize}px`,
            fontWeight: field.fontWeight,
            color: field.color,
            textAlign: field.align,
            whiteSpace: 'nowrap'
        }}>
            {field.showLabel && field.labelText && <div className="text-[0.4em] opacity-70 tracking-widest mb-[0.1em]">{field.labelText}</div>}
            {textValue}
        </div>
      );
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#000] flex flex-col text-white" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
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
            {/* Left: Layers & Widget Library */}
            <div className="w-72 bg-[#111] border-r border-[#222] flex flex-col shrink-0 relative z-10">
                <div className="p-5 border-b border-[#222] space-y-5">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">{t('clocks.editor.description')}</label>
                        <textarea
                            value={config.description || ''}
                            onChange={(e) => setConfig({...config, description: e.target.value})}
                            className={`w-full ${THEME.input} rounded-lg px-3 py-2 text-xs resize-none h-20 bg-[#1A1A1A]`}
                            placeholder="Notes about this layout..."
                        />
                    </div>
                </div>

                <div className="flex-1 flex flex-col min-h-0 relative">
                    {/* Add Widget Button Panel */}
                    {!isAddWidgetOpen && (
                        <div className="p-4 border-b border-[#222]">
                            <button 
                                onClick={() => setIsAddWidgetOpen(true)}
                                className="w-full py-2 bg-[#222] hover:bg-brand-green hover:text-black border border-[#333] hover:border-brand-green/50 text-gray-300 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
                            >
                                <Plus size={16} /> {t('clocks.editor.addWidget')}
                            </button>
                        </div>
                    )}

                    {isAddWidgetOpen ? (
                        /* Widget Library View */
                        <div className="absolute inset-0 bg-[#111] z-20 flex flex-col animate-in slide-in-from-left-4">
                            <div className="p-4 border-b border-[#222] flex items-center justify-between bg-[#151515]">
                                <span className="font-bold text-sm text-gray-300">Widget Library</span>
                                <button onClick={() => setIsAddWidgetOpen(false)} className="text-gray-500 hover:text-white p-1 rounded hover:bg-[#222]"><X size={16}/></button>
                            </div>
                            <div className="overflow-y-auto p-2 space-y-1 flex-1">
                                {availableFields.map(field => (
                                    <button 
                                        key={field.type} 
                                        onClick={() => addField(field.type)} 
                                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#222] text-left transition-all border border-transparent hover:border-[#333] group"
                                    >
                                        <div className="p-2 bg-[#1A1A1A] rounded-lg text-gray-400 group-hover:text-brand-green group-hover:bg-[#111]">
                                            <field.icon size={16} />
                                        </div>
                                        <span className="text-sm font-medium text-gray-300 group-hover:text-white">{field.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        /* Active Layers List */
                        <div className="flex-1 overflow-y-auto p-2 space-y-1">
                            {[...config.fields].reverse().map((field) => {
                                const def = availableFields.find(f => f.type === field.type);
                                return (
                                    <div 
                                        key={field.id}
                                        draggable
                                        onDragStart={(e) => { setDraggedFieldId(field.id); e.dataTransfer.effectAllowed = 'move'; }}
                                        onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
                                        onDrop={(e) => { e.preventDefault(); if (!draggedFieldId || draggedFieldId === field.id) return; handleReorder(draggedFieldId, field.id); }}
                                        onClick={() => setSelectedFieldId(field.id)}
                                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all group relative ${
                                            selectedFieldId === field.id ? 'bg-brand-green/10 border-brand-green/30 text-white' : 'bg-[#1A1A1A] border-transparent hover:border-[#333] text-gray-400 hover:text-white'
                                        }`}
                                    >
                                        <div className="cursor-grab text-gray-600 hover:text-gray-300"><GripVertical size={14} /></div>
                                        <div className="flex items-center gap-3 overflow-hidden flex-1">
                                            {def?.icon ? <def.icon size={16} className="shrink-0"/> : <Clock size={16} className="shrink-0"/>}
                                            <span className="text-sm font-medium truncate">{def?.label || 'Unknown'}</span>
                                        </div>
                                        <button onClick={(e) => { e.stopPropagation(); removeField(field.id); }} className="p-1.5 text-gray-600 hover:text-red-500 hover:bg-[#333] rounded opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={14} /></button>
                                    </div>
                                );
                            })}
                            {config.fields.length === 0 && (
                                <div className="text-center py-10 text-gray-600 text-xs">
                                    No widgets added yet.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Canvas */}
            <div className="flex-1 bg-[#000] relative overflow-hidden flex items-center justify-center p-8 select-none" onClick={() => setIsAddWidgetOpen(false)}>
                {/* ... Canvas rendering same as before ... */}
                <div 
                    ref={canvasRef}
                    className="aspect-video w-full max-w-6xl shadow-2xl relative border border-[#333] overflow-hidden"
                    style={{ backgroundColor: config.backgroundColor, backgroundImage: showGrid ? 'linear-gradient(to right, #333 1px, transparent 1px), linear-gradient(to bottom, #333 1px, transparent 1px)' : 'none', backgroundSize: '5% 5%' }}
                    onClick={() => setSelectedFieldId(null)}
                >
                    {config.fields.map(field => (
                        <div
                            key={field.id}
                            onMouseDown={(e) => handleMouseDown(e, field.id)}
                            onClick={(e) => e.stopPropagation()}
                            className={`absolute cursor-move hover:outline hover:outline-1 hover:outline-brand-green/50 ${selectedFieldId === field.id ? 'outline outline-2 outline-brand-green z-10' : ''}`}
                            style={{ left: `${field.x}%`, top: `${field.y}%`, transform: 'translate(-50%, -50%)', zIndex: config.fields.findIndex(f => f.id === field.id) }}
                        >
                           {renderWidgetContent(field)}
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Panel using NumberInput */}
            <div className="w-80 bg-[#111] border-l border-[#222] flex flex-col shrink-0 z-20">
                <div className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-[#222]">
                    {t('clocks.editor.properties')}
                </div>
                
                {selectedField ? (
                    <div className="p-6 space-y-6 overflow-y-auto flex-1">
                        
                        {(selectedField.type === 'custom_text' || (selectedField.showLabel && !isShapeOrLine(selectedField.type))) && (
                            <div className="space-y-2">
                                <label className="text-xs text-gray-400 font-bold">{selectedField.type === 'custom_text' ? t('clocks.editor.content') : t('clocks.editor.labelText')}</label>
                                <input type="text" value={selectedField.type === 'custom_text' ? (selectedField.customText || '') : (selectedField.labelText || '')} onChange={(e) => updateField(selectedField.id, selectedField.type === 'custom_text' ? { customText: e.target.value } : { labelText: e.target.value })} className={`w-full ${THEME.input} rounded-lg px-3 py-2`} />
                            </div>
                        )}

                        <div className="space-y-4">
                            <label className="text-xs text-gray-400 font-bold flex items-center gap-2">
                                {isShapeOrLine(selectedField.type) ? <Palette size={14}/> : <Type size={14}/>} 
                                {isShapeOrLine(selectedField.type) ? t('clocks.editor.appearance') : t('clocks.editor.typography')}
                            </label>
                            
                            <div className="grid grid-cols-2 gap-4">
                                {!isShapeOrLine(selectedField.type) && (
                                    <div>
                                        <label className="text-[10px] text-gray-500 block mb-1">{t('clocks.editor.size')}</label>
                                        <NumberInput
                                            value={selectedField.fontSize}
                                            onChange={(val) => updateField(selectedField.id, { fontSize: val })}
                                            min={1}
                                            enableScroll
                                            size="sm"
                                        />
                                    </div>
                                )}
                                <div className={isShapeOrLine(selectedField.type) ? 'col-span-2' : 'col-span-1'}>
                                    <label className="text-[10px] text-gray-500 block mb-1">{isShapeOrLine(selectedField.type) ? t('clocks.editor.fillColor') : t('clocks.editor.fontColor')}</label>
                                    <div className="flex gap-2">
                                        <input type="color" value={selectedField.color} onChange={(e) => updateField(selectedField.id, { color: e.target.value })} className="h-9 w-full rounded cursor-pointer border border-[#333] bg-[#1A1A1A] p-0.5" />
                                    </div>
                                </div>
                            </div>

                            {/* Dimensions */}
                            {isShapeOrLine(selectedField.type) && (
                                <div className="grid grid-cols-2 gap-4 pt-2">
                                     <div>
                                        <label className="text-[10px] text-gray-500 block mb-1">{t('clocks.editor.width')}</label>
                                        <NumberInput value={selectedField.width} onChange={(val) => updateField(selectedField.id, { width: val })} min={1} enableScroll size="sm" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-gray-500 block mb-1">{t('clocks.editor.height')}</label>
                                        <NumberInput value={selectedField.height} onChange={(val) => updateField(selectedField.id, { height: val })} min={1} enableScroll size="sm" />
                                    </div>
                                </div>
                            )}
                        </div>

                         {/* Position */}
                         <div className="space-y-4 pt-4 border-t border-[#222]">
                            <label className="text-xs text-gray-400 font-bold flex items-center gap-2"><Move size={14} /> {t('clocks.editor.position')}</label>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] text-gray-500 block mb-1">X (%)</label>
                                    <NumberInput value={Math.round(selectedField.x)} onChange={(val) => updateField(selectedField.id, { x: val })} size="sm" enableScroll step={1} />
                                </div>
                                <div>
                                    <label className="text-[10px] text-gray-500 block mb-1">Y (%)</label>
                                    <NumberInput value={Math.round(selectedField.y)} onChange={(val) => updateField(selectedField.id, { y: val })} size="sm" enableScroll step={1} />
                                </div>
                            </div>
                         </div>

                         {/* Layer Ordering Controls */}
                         <div className="pt-4 border-t border-[#222]">
                             <label className="text-xs text-gray-400 font-bold flex items-center gap-2 mb-2">{t('clocks.editor.displayOrder')}</label>
                             <div className="grid grid-cols-4 gap-2">
                                <button onClick={() => moveLayer(selectedField.id, 'back')} className="p-2 bg-[#1A1A1A] hover:bg-[#222] rounded border border-[#333] hover:border-gray-500 text-gray-400 hover:text-white" title="Send to Back"><ChevronsDown size={16} className="mx-auto" /></button>
                                <button onClick={() => moveLayer(selectedField.id, 'down')} className="p-2 bg-[#1A1A1A] hover:bg-[#222] rounded border border-[#333] hover:border-gray-500 text-gray-400 hover:text-white" title="Send Backward"><ArrowDown size={16} className="mx-auto" /></button>
                                <button onClick={() => moveLayer(selectedField.id, 'up')} className="p-2 bg-[#1A1A1A] hover:bg-[#222] rounded border border-[#333] hover:border-gray-500 text-gray-400 hover:text-white" title="Bring Forward"><ArrowUp size={16} className="mx-auto" /></button>
                                <button onClick={() => moveLayer(selectedField.id, 'front')} className="p-2 bg-[#1A1A1A] hover:bg-[#222] rounded border border-[#333] hover:border-gray-500 text-gray-400 hover:text-white" title="Bring to Front"><ChevronsUp size={16} className="mx-auto" /></button>
                             </div>
                         </div>

                         {/* ... Layering buttons ... */}
                         <div className="pt-8 mt-auto space-y-3">
                             <button onClick={() => duplicateField(selectedField)} className="w-full py-3 bg-[#1A1A1A] hover:bg-[#222] text-gray-300 border border-[#333] hover:border-gray-500 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"><Copy size={18} /> {t('clocks.editor.duplicate')}</button>
                             <button onClick={() => removeField(selectedField.id)} className="w-full py-3 bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"><Trash2 size={18} /> {t('clocks.editor.remove')}</button>
                         </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-gray-600">
                        <div className="w-12 h-12 bg-[#1A1A1A] rounded-full flex items-center justify-center mb-3"><Move size={24} className="opacity-50" /></div>
                        <p className="text-xs">{t('clocks.editor.selectToEdit')}</p>
                    </div>
                )}
            </div>
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
