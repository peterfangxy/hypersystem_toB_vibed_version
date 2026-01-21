
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
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Eye,
  EyeOff,
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
  Grid,
  Magnet,
  Calendar,
  Timer,
  Copy,
  CheckCircle2,
  Repeat
} from 'lucide-react';
import { ClockConfig, ClockField, ClockFieldType } from '../types';
import { THEME } from '../theme';

interface ClockEditorProps {
  initialConfig?: ClockConfig;
  onSave: (config: ClockConfig) => void;
  onClose: () => void;
}

const AVAILABLE_FIELDS: { type: ClockFieldType; label: string; icon: any }[] = [
    { type: 'tournament_name', label: 'Tournament Name', icon: Type },
    { type: 'tournament_desc', label: 'Description', icon: Type },
    { type: 'timer', label: 'Main Timer', icon: Clock },
    { type: 'blind_countdown', label: 'Level Countdown', icon: Timer },
    { type: 'blind_level', label: 'Current Blinds', icon: Layers },
    { type: 'next_blinds', label: 'Next Blinds', icon: Layers },
    { type: 'ante', label: 'Ante', icon: Layers },
    { type: 'next_ante', label: 'Next Ante', icon: Layers },
    { type: 'starting_chips', label: 'Starting Chips', icon: Coins },
    { type: 'rebuy_limit', label: 'Rebuy Limit', icon: Repeat },
    { type: 'players_count', label: 'Players Count', icon: Users },
    { type: 'entries_count', label: 'Total Entries', icon: Users },
    { type: 'total_chips', label: 'Total Chips', icon: Coins },
    { type: 'avg_stack', label: 'Avg Stack', icon: Coins },
    { type: 'payout_total', label: 'Total Payout', icon: Coins },
    { type: 'next_break', label: 'Next Break', icon: Clock },
    { type: 'current_time', label: 'Real Time', icon: Clock },
    { type: 'current_date', label: 'Current Date', icon: Calendar },
    { type: 'start_time', label: 'Start Time', icon: Clock },
    { type: 'start_date', label: 'Start Date', icon: Calendar },
    { type: 'est_end_time', label: 'Est. End Time', icon: Clock },
    { type: 'custom_text', label: 'Custom Text', icon: Type },
    // Widgets
    { type: 'line', label: 'Line / Divider', icon: Minus },
    { type: 'shape_rect', label: 'Rectangle', icon: Square },
    { type: 'shape_circle', label: 'Circle', icon: Circle },
    { type: 'shape_triangle', label: 'Triangle', icon: Triangle },
];

const ClockEditor: React.FC<ClockEditorProps> = ({ initialConfig, onSave, onClose }) => {
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
  
  // Editor Settings
  const [showGrid, setShowGrid] = useState(false);
  const [enableSnap, setEnableSnap] = useState(false);
  
  // Dragging state (Canvas)
  const [isDragging, setIsDragging] = useState(false);
  // Store initial values to calculate delta accurately and support snapping
  const dragStartRef = useRef<{
      startX: number; 
      startY: number; 
      initialFieldX: number; 
      initialFieldY: number; 
  } | null>(null);
  
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      if (initialConfig) {
          setConfig(initialConfig);
      }
  }, [initialConfig]);

  // --- Keyboard Shortcuts (Copy/Paste/Delete) ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        // Ignore if typing in input
        if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName || '')) return;

        // Delete / Backspace
        if (e.key === 'Delete' || e.key === 'Backspace') {
            if (selectedFieldId) {
                removeField(selectedFieldId);
            }
            return;
        }

        // Copy (Ctrl+C / Cmd+C)
        if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
            if (selectedFieldId) {
                const field = config.fields.find(f => f.id === selectedFieldId);
                if (field) {
                    e.preventDefault();
                    setClipboard(field);
                }
            }
        }

        // Paste (Ctrl+V / Cmd+V)
        if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
            if (clipboard) {
                e.preventDefault();
                duplicateField(clipboard);
            }
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
          label: AVAILABLE_FIELDS.find(f => f.type === type)?.label || 'Unknown',
          x: 50,
          y: 50,
          // Defaults
          fontSize: (type === 'timer' || type === 'blind_countdown') ? 120 : 32,
          fontWeight: (type === 'timer' || type === 'blind_countdown' || type === 'blind_level') ? 'bold' : 'normal',
          color: isShape || isLine ? '#333333' : (config.fontColor || '#FFFFFF'), // Fill color for shapes
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
          // Shape defaults
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
          x: Math.min(field.x + 2, 98), // Offset position slightly
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

  // --- Layering Logic ---
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

  // --- Drag Logic ---
  const handleMouseDown = (e: React.MouseEvent, fieldId: string) => {
      e.stopPropagation();
      const field = config.fields.find(f => f.id === fieldId);
      if (!field) return;

      setSelectedFieldId(fieldId);
      setIsAddWidgetOpen(false); // Close drawer if open
      setIsDragging(true);
      
      // Store initial state for delta calculation
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
      
      // Calculate delta in pixels
      const deltaXPx = e.clientX - dragStartRef.current.startX;
      const deltaYPx = e.clientY - dragStartRef.current.startY;
      
      // Convert delta to percentage relative to canvas size
      const deltaXPercent = (deltaXPx / rect.width) * 100;
      const deltaYPercent = (deltaYPx / rect.height) * 100;

      // Calculate new raw position based on initial position
      let newX = dragStartRef.current.initialFieldX + deltaXPercent;
      let newY = dragStartRef.current.initialFieldY + deltaYPercent;

      // Apply Snapping if enabled
      if (enableSnap) {
          const SNAP_INTERVAL = 5; // Snap every 5%
          const SNAP_THRESHOLD = 1.5; // Snap range

          const nearestGridX = Math.round(newX / SNAP_INTERVAL) * SNAP_INTERVAL;
          const nearestGridY = Math.round(newY / SNAP_INTERVAL) * SNAP_INTERVAL;

          if (Math.abs(newX - nearestGridX) < SNAP_THRESHOLD) {
              newX = nearestGridX;
          }
          if (Math.abs(newY - nearestGridY) < SNAP_THRESHOLD) {
              newY = nearestGridY;
          }
      }

      updateField(selectedFieldId, {
          x: newX,
          y: newY
      });
  };

  const handleMouseUp = () => {
      setIsDragging(false);
      dragStartRef.current = null;
  };

  const selectedField = config.fields.find(f => f.id === selectedFieldId);

  // --- Renderers ---
  const getMockValue = (type: ClockFieldType) => {
      switch(type) {
          case 'tournament_name': return 'Sunday Special';
          case 'tournament_desc': return 'Deepstack Championship - Flight A';
          case 'timer': return '15:00';
          case 'blind_countdown': return '12:45';
          case 'blind_level': return '100 / 200';
          case 'next_blinds': return '200 / 400';
          case 'ante': return '200';
          case 'next_ante': return '400';
          case 'starting_chips': return '10,000';
          case 'rebuy_limit': return '1 Limit';
          case 'players_count': return '45 / 100';
          case 'entries_count': return '62';
          case 'total_chips': return '1,240,000';
          case 'avg_stack': return '27,555';
          case 'payout_total': return '$15,000';
          case 'next_break': return '01:45:00';
          case 'current_time': return new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
          case 'current_date': return new Date().toLocaleDateString();
          case 'start_time': return '18:00';
          case 'start_date': return new Date().toLocaleDateString();
          case 'est_end_time': return '23:30';
          case 'custom_text': return 'Text';
          default: return '---';
      }
  };

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
                  <polygon 
                      points="50,0 100,100 0,100" 
                      fill={field.color} 
                      stroke={field.borderColor} 
                      strokeWidth={field.borderWidth ? (field.borderWidth * (100 / (field.width || 100))) : 0} 
                  />
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

      // Text Widgets
      return (
        <div style={{
            fontSize: `${field.fontSize}px`,
            fontWeight: field.fontWeight,
            color: field.color,
            textAlign: field.align,
            whiteSpace: 'nowrap'
        }}>
            {field.showLabel && field.labelText && (
                <div className="text-[0.4em] opacity-70 tracking-widest mb-[0.1em]">
                    {field.labelText}
                </div>
            )}
            {field.type === 'custom_text' ? (field.customText || 'Text') : getMockValue(field.type)}
        </div>
      );
  };

  const isShapeOrLine = (type: ClockFieldType) => {
      return type.startsWith('shape_') || type === 'line';
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#000] flex flex-col text-white" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
        
        {/* Header Bar */}
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
                    placeholder="Clock Name"
                 />
             </div>
             <button 
                onClick={() => onSave(config)}
                className={`${THEME.buttonPrimary} px-6 py-2 rounded-full font-bold flex items-center gap-2`}
             >
                 <Save size={18} /> Save Clock
             </button>
        </div>

        <div className="flex flex-1 overflow-hidden relative">
            
            {/* Left: Global Settings & Widget List */}
            <div className="w-72 bg-[#111] border-r border-[#222] flex flex-col shrink-0 relative z-10">
                
                {/* Global Settings Group */}
                <div className="p-5 border-b border-[#222] space-y-5">
                    
                    {/* Description Input */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Description</label>
                        <textarea
                            value={config.description || ''}
                            onChange={(e) => setConfig({...config, description: e.target.value})}
                            className={`w-full ${THEME.input} rounded-lg px-3 py-2 text-xs resize-none h-20 bg-[#1A1A1A]`}
                            placeholder="Notes about this layout..."
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Background</label>
                        <div className="flex gap-2">
                            <input 
                                type="color" 
                                value={config.backgroundColor}
                                onChange={(e) => setConfig({...config, backgroundColor: e.target.value})}
                                className="w-9 h-9 rounded-lg cursor-pointer bg-transparent border-none p-0"
                            />
                            <div className="flex-1 bg-[#1A1A1A] border border-[#333] rounded-lg px-3 flex items-center text-xs font-mono text-gray-400">
                                {config.backgroundColor}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Default Text Color</label>
                        <div className="flex gap-2">
                            <input 
                                type="color" 
                                value={config.fontColor || '#FFFFFF'}
                                onChange={(e) => setConfig({...config, fontColor: e.target.value})}
                                className="w-9 h-9 rounded-lg cursor-pointer bg-transparent border-none p-0"
                            />
                            <div className="flex-1 bg-[#1A1A1A] border border-[#333] rounded-lg px-3 flex items-center text-xs font-mono text-gray-400">
                                {config.fontColor || '#FFFFFF'}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Default Layout</label>
                        <button 
                            onClick={() => setConfig({...config, isDefault: !config.isDefault})}
                            className={`w-10 h-6 rounded-full flex items-center transition-all px-1 ${config.isDefault ? 'bg-brand-green justify-end' : 'bg-[#333] justify-start'}`}
                        >
                            <div className="w-4 h-4 rounded-full bg-white shadow-sm"></div>
                        </button>
                    </div>
                </div>

                {/* Widgets List Header & CTA */}
                <div className="flex-1 flex flex-col min-h-0">
                    <div className="p-4 flex items-center justify-between border-b border-[#222] bg-[#151515]">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Widgets</span>
                        <span className="text-xs font-mono text-gray-600 bg-[#222] px-1.5 py-0.5 rounded">{config.fields.length}</span>
                    </div>
                    
                    {/* Add Widget Button */}
                    <div className="p-4 border-b border-[#222]">
                        <button 
                            onClick={() => setIsAddWidgetOpen(true)}
                            className="w-full py-2 bg-[#222] hover:bg-brand-green hover:text-black border border-[#333] hover:border-brand-green/50 text-gray-300 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
                        >
                            <Plus size={16} /> Add Widget
                        </button>
                    </div>

                    {/* Active Widgets List */}
                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {config.fields.length === 0 ? (
                            <div className="text-center py-8 text-gray-600 text-xs italic">
                                No widgets added.<br/>Click "Add Widget" to start.
                            </div>
                        ) : (
                            // Render list in reverse order visually so "top" of list is "front" layer
                            [...config.fields].reverse().map((field) => {
                                const def = AVAILABLE_FIELDS.find(f => f.type === field.type);
                                return (
                                    <div 
                                        key={field.id}
                                        draggable
                                        onDragStart={(e) => {
                                            setDraggedFieldId(field.id);
                                            e.dataTransfer.effectAllowed = 'move';
                                        }}
                                        onDragOver={(e) => {
                                            e.preventDefault();
                                            e.dataTransfer.dropEffect = 'move';
                                        }}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            if (!draggedFieldId || draggedFieldId === field.id) return;
                                            handleReorder(draggedFieldId, field.id);
                                        }}
                                        onClick={() => setSelectedFieldId(field.id)}
                                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all group relative ${
                                            selectedFieldId === field.id 
                                            ? 'bg-brand-green/10 border-brand-green/30 text-white' 
                                            : 'bg-[#1A1A1A] border-transparent hover:border-[#333] text-gray-400 hover:text-white'
                                        } ${draggedFieldId === field.id ? 'opacity-50 border-dashed border-gray-500' : ''}`}
                                    >
                                        <div className="cursor-grab text-gray-600 hover:text-gray-300">
                                            <GripVertical size={14} />
                                        </div>
                                        <div className="flex items-center gap-3 overflow-hidden flex-1">
                                            {def?.icon ? <def.icon size={16} className="shrink-0"/> : <Clock size={16} className="shrink-0"/>}
                                            <span className="text-sm font-medium truncate">{def?.label || 'Unknown'}</span>
                                        </div>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); removeField(field.id); }}
                                            className="p-1.5 text-gray-600 hover:text-red-500 hover:bg-[#333] rounded opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* Add Widget Overlay/Drawer */}
            {isAddWidgetOpen && (
                <div className="absolute top-0 left-72 bottom-0 w-64 bg-[#1A1A1A] border-r border-[#333] shadow-2xl z-30 animate-in slide-in-from-left-4 duration-200 flex flex-col">
                    <div className="p-4 border-b border-[#333] flex justify-between items-center">
                        <span className="font-bold text-sm text-white">Select Widget</span>
                        <button onClick={() => setIsAddWidgetOpen(false)} className="text-gray-500 hover:text-white">
                            <X size={16} />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {AVAILABLE_FIELDS.map(item => (
                            <button
                                key={item.type}
                                onClick={() => addField(item.type)}
                                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-[#222] hover:text-brand-green transition-colors text-gray-300 text-sm font-medium text-left"
                            >
                                <item.icon size={18} className="text-gray-500" />
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Center: Canvas Stage */}
            <div className="flex-1 bg-[#000] relative overflow-hidden flex items-center justify-center p-8 select-none" onClick={() => setIsAddWidgetOpen(false)}>
                
                {/* Canvas Controls Toolbar */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-[#1A1A1A] border border-[#333] p-1.5 rounded-xl shadow-xl z-40">
                    <button
                        onClick={() => setShowGrid(!showGrid)}
                        className={`p-2 rounded-lg flex items-center gap-2 text-xs font-bold transition-colors ${showGrid ? 'bg-brand-green text-black' : 'text-gray-400 hover:text-white hover:bg-[#333]'}`}
                        title="Toggle Grid"
                    >
                        <Grid size={16} />
                        Grid
                    </button>
                    <div className="w-px h-4 bg-[#333]"></div>
                    <button
                        onClick={() => setEnableSnap(!enableSnap)}
                        className={`p-2 rounded-lg flex items-center gap-2 text-xs font-bold transition-colors ${enableSnap ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white hover:bg-[#333]'}`}
                        title="Toggle Snap to Grid"
                    >
                        <Magnet size={16} />
                        Snap
                    </button>
                </div>

                <div 
                    ref={canvasRef}
                    className="aspect-video w-full max-w-6xl shadow-2xl relative border border-[#333] overflow-hidden"
                    style={{ 
                        backgroundColor: config.backgroundColor,
                        backgroundImage: showGrid ? 'linear-gradient(to right, #333 1px, transparent 1px), linear-gradient(to bottom, #333 1px, transparent 1px)' : 'none',
                        backgroundSize: '5% 5%'
                    }}
                    onClick={() => setSelectedFieldId(null)}
                >
                    {config.fields.map(field => (
                        <div
                            key={field.id}
                            onMouseDown={(e) => handleMouseDown(e, field.id)}
                            onClick={(e) => e.stopPropagation()}
                            className={`absolute cursor-move hover:outline hover:outline-1 hover:outline-brand-green/50 ${selectedFieldId === field.id ? 'outline outline-2 outline-brand-green z-10' : ''}`}
                            style={{
                                left: `${field.x}%`,
                                top: `${field.y}%`,
                                transform: 'translate(-50%, -50%)', // Center anchor
                                zIndex: config.fields.findIndex(f => f.id === field.id) // Use array index as Z-Index
                            }}
                        >
                           {renderWidgetContent(field)}
                        </div>
                    ))}
                </div>
                
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#111] px-4 py-2 rounded-full border border-[#333] text-xs text-gray-500">
                    Canvas Resolution Reference: 1920 x 1080 (16:9)
                </div>
            </div>

            {/* Right: Properties Panel */}
            <div className="w-80 bg-[#111] border-l border-[#222] flex flex-col shrink-0 z-20">
                <div className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-[#222]">
                    Properties
                </div>
                
                {selectedField ? (
                    <div className="p-6 space-y-6 overflow-y-auto flex-1">
                        
                        {/* Custom Text / Label Inputs */}
                        {(selectedField.type === 'custom_text' || (selectedField.showLabel && !isShapeOrLine(selectedField.type))) && (
                            <div className="space-y-2">
                                <label className="text-xs text-gray-400 font-bold">
                                    {selectedField.type === 'custom_text' ? 'Content' : 'Label Text'}
                                </label>
                                <input 
                                    type="text" 
                                    value={selectedField.type === 'custom_text' ? (selectedField.customText || '') : (selectedField.labelText || '')}
                                    onChange={(e) => updateField(selectedField.id, selectedField.type === 'custom_text' ? { customText: e.target.value } : { labelText: e.target.value })}
                                    className={`w-full ${THEME.input} rounded-lg px-3 py-2`}
                                />
                            </div>
                        )}

                        {/* ... (Rest of properties panel remains the same) */}
                        {/* Visibility Toggle for Labels (Text Only) */}
                        {!isShapeOrLine(selectedField.type) && selectedField.type !== 'custom_text' && (
                             <div className="flex items-center justify-between p-3 bg-[#1A1A1A] rounded-xl border border-[#333]">
                                <span className="text-sm font-medium text-gray-300">Show Label</span>
                                <button 
                                    onClick={() => updateField(selectedField.id, { showLabel: !selectedField.showLabel })}
                                    className={`p-1.5 rounded-lg transition-colors ${selectedField.showLabel ? 'bg-brand-green/20 text-brand-green' : 'bg-[#222] text-gray-500'}`}
                                >
                                    {selectedField.showLabel ? <Eye size={18} /> : <EyeOff size={18} />}
                                </button>
                             </div>
                        )}

                        {/* Typography OR Shape Appearance */}
                        <div className="space-y-4">
                            <label className="text-xs text-gray-400 font-bold flex items-center gap-2">
                                {isShapeOrLine(selectedField.type) ? <Palette size={14}/> : <Type size={14}/>} 
                                {isShapeOrLine(selectedField.type) ? 'Appearance' : 'Typography'}
                            </label>
                            
                            <div className="grid grid-cols-2 gap-4">
                                {!isShapeOrLine(selectedField.type) && (
                                    <div>
                                        <label className="text-[10px] text-gray-500 block mb-1">Size (px)</label>
                                        <input 
                                            type="number" 
                                            value={selectedField.fontSize}
                                            onChange={(e) => updateField(selectedField.id, { fontSize: parseInt(e.target.value) })}
                                            className={`w-full ${THEME.input} rounded-lg px-3 py-2`}
                                        />
                                    </div>
                                )}
                                
                                <div className={isShapeOrLine(selectedField.type) ? 'col-span-2' : 'col-span-1'}>
                                    <label className="text-[10px] text-gray-500 block mb-1">
                                        {isShapeOrLine(selectedField.type) ? 'Fill Color' : 'Font Color'}
                                    </label>
                                    <div className="flex gap-2">
                                        <input 
                                            type="color" 
                                            value={selectedField.color}
                                            onChange={(e) => updateField(selectedField.id, { color: e.target.value })}
                                            className="h-9 w-full rounded cursor-pointer border border-[#333] bg-[#1A1A1A] p-0.5"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Border Controls for Shapes */}
                            {isShapeOrLine(selectedField.type) && selectedField.type !== 'line' && (
                                <div className="grid grid-cols-2 gap-4 pt-2">
                                    <div>
                                        <label className="text-[10px] text-gray-500 block mb-1">Border Color</label>
                                        <input 
                                            type="color" 
                                            value={selectedField.borderColor || '#ffffff'}
                                            onChange={(e) => updateField(selectedField.id, { borderColor: e.target.value })}
                                            className="h-9 w-full rounded cursor-pointer border border-[#333] bg-[#1A1A1A] p-0.5"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-gray-500 block mb-1">Border Width</label>
                                        <input 
                                            type="number"
                                            min="0" 
                                            value={selectedField.borderWidth || 0}
                                            onChange={(e) => updateField(selectedField.id, { borderWidth: parseInt(e.target.value) })}
                                            className={`w-full ${THEME.input} rounded-lg px-3 py-2`}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Dimensions for Shapes/Lines */}
                            {isShapeOrLine(selectedField.type) && (
                                <div className="grid grid-cols-2 gap-4 pt-2">
                                     <div>
                                        <label className="text-[10px] text-gray-500 block mb-1">Width (px)</label>
                                        <input 
                                            type="number"
                                            min="1" 
                                            value={selectedField.width || 100}
                                            onChange={(e) => updateField(selectedField.id, { width: parseInt(e.target.value) })}
                                            className={`w-full ${THEME.input} rounded-lg px-3 py-2`}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-gray-500 block mb-1">Height (px)</label>
                                        <input 
                                            type="number"
                                            min="1" 
                                            value={selectedField.height || 100}
                                            onChange={(e) => updateField(selectedField.id, { height: parseInt(e.target.value) })}
                                            className={`w-full ${THEME.input} rounded-lg px-3 py-2`}
                                        />
                                    </div>
                                </div>
                            )}
                            
                            {!isShapeOrLine(selectedField.type) && (
                                <>
                                    <div className="flex gap-2 bg-[#1A1A1A] p-1 rounded-lg border border-[#333]">
                                        <button 
                                            onClick={() => updateField(selectedField.id, { align: 'left' })}
                                            className={`flex-1 p-2 rounded flex justify-center ${selectedField.align === 'left' ? 'bg-[#333] text-white' : 'text-gray-500 hover:text-white'}`}
                                        >
                                            <AlignLeft size={16} />
                                        </button>
                                        <button 
                                            onClick={() => updateField(selectedField.id, { align: 'center' })}
                                            className={`flex-1 p-2 rounded flex justify-center ${selectedField.align === 'center' ? 'bg-[#333] text-white' : 'text-gray-500 hover:text-white'}`}
                                        >
                                            <AlignCenter size={16} />
                                        </button>
                                        <button 
                                            onClick={() => updateField(selectedField.id, { align: 'right' })}
                                            className={`flex-1 p-2 rounded flex justify-center ${selectedField.align === 'right' ? 'bg-[#333] text-white' : 'text-gray-500 hover:text-white'}`}
                                        >
                                            <AlignRight size={16} />
                                        </button>
                                    </div>

                                    <button 
                                        onClick={() => updateField(selectedField.id, { fontWeight: selectedField.fontWeight === 'bold' ? 'normal' : 'bold' })}
                                        className={`w-full p-2 rounded flex items-center justify-center gap-2 border ${selectedField.fontWeight === 'bold' ? 'bg-brand-green/10 text-brand-green border-brand-green/30' : 'bg-[#1A1A1A] border-[#333] text-gray-400'}`}
                                    >
                                        <Bold size={16} /> Bold
                                    </button>
                                </>
                            )}
                        </div>

                         {/* Position Manual Adjust */}
                         <div className="space-y-4 pt-4 border-t border-[#222]">
                            <label className="text-xs text-gray-400 font-bold flex items-center gap-2">
                                <Move size={14} /> Position (%)
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] text-gray-500 block mb-1">X</label>
                                    <input 
                                        type="number" 
                                        value={Math.round(selectedField.x)}
                                        onChange={(e) => updateField(selectedField.id, { x: parseInt(e.target.value) })}
                                        className={`w-full ${THEME.input} rounded-lg px-3 py-2`}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] text-gray-500 block mb-1">Y</label>
                                    <input 
                                        type="number" 
                                        value={Math.round(selectedField.y)}
                                        onChange={(e) => updateField(selectedField.id, { y: parseInt(e.target.value) })}
                                        className={`w-full ${THEME.input} rounded-lg px-3 py-2`}
                                    />
                                </div>
                            </div>
                         </div>

                         {/* Layering / Display Order */}
                         <div className="space-y-4 pt-4 border-t border-[#222]">
                            <label className="text-xs text-gray-400 font-bold flex items-center gap-2">
                                <Layers size={14} /> Display Order
                            </label>
                            <div className="grid grid-cols-4 gap-2">
                                <button 
                                    onClick={() => moveLayer(selectedField.id, 'back')}
                                    className="p-2 bg-[#1A1A1A] hover:bg-[#333] rounded-lg border border-[#333] text-gray-400 hover:text-white flex justify-center"
                                    title="Send to Back"
                                >
                                    <ChevronsDown size={16} />
                                </button>
                                <button 
                                    onClick={() => moveLayer(selectedField.id, 'down')}
                                    className="p-2 bg-[#1A1A1A] hover:bg-[#333] rounded-lg border border-[#333] text-gray-400 hover:text-white flex justify-center"
                                    title="Move Backward"
                                >
                                    <ArrowDown size={16} />
                                </button>
                                <button 
                                    onClick={() => moveLayer(selectedField.id, 'up')}
                                    className="p-2 bg-[#1A1A1A] hover:bg-[#333] rounded-lg border border-[#333] text-gray-400 hover:text-white flex justify-center"
                                    title="Move Forward"
                                >
                                    <ArrowUp size={16} />
                                </button>
                                <button 
                                    onClick={() => moveLayer(selectedField.id, 'front')}
                                    className="p-2 bg-[#1A1A1A] hover:bg-[#333] rounded-lg border border-[#333] text-gray-400 hover:text-white flex justify-center"
                                    title="Bring to Front"
                                >
                                    <ChevronsUp size={16} />
                                </button>
                            </div>
                         </div>

                         <div className="pt-8 mt-auto space-y-3">
                             {/* Duplicate Button */}
                             <button 
                                onClick={() => duplicateField(selectedField)}
                                className="w-full py-3 bg-[#1A1A1A] hover:bg-[#222] text-gray-300 border border-[#333] hover:border-gray-500 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                             >
                                 <Copy size={18} /> Duplicate Widget
                             </button>

                             <button 
                                onClick={() => removeField(selectedField.id)}
                                className="w-full py-3 bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                             >
                                 <Trash2 size={18} /> Remove Widget
                             </button>
                         </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-600 p-8 text-center">
                        <Move size={48} className="opacity-20 mb-4" />
                        <p className="text-sm">Select a widget on the canvas to edit its properties.</p>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default ClockEditor;
