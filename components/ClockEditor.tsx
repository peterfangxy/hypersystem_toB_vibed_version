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
  X
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
    { type: 'timer', label: 'Main Timer', icon: Clock },
    { type: 'blind_level', label: 'Current Blinds', icon: Layers },
    { type: 'next_blinds', label: 'Next Blinds', icon: Layers },
    { type: 'ante', label: 'Ante', icon: Layers },
    { type: 'players_count', label: 'Players Count', icon: Users },
    { type: 'entries_count', label: 'Total Entries', icon: Users },
    { type: 'total_chips', label: 'Total Chips', icon: Coins },
    { type: 'avg_stack', label: 'Avg Stack', icon: Coins },
    { type: 'next_break', label: 'Next Break', icon: Clock },
    { type: 'current_time', label: 'Real Time', icon: Clock },
    { type: 'custom_text', label: 'Custom Text', icon: Type },
];

const ClockEditor: React.FC<ClockEditorProps> = ({ initialConfig, onSave, onClose }) => {
  const [config, setConfig] = useState<ClockConfig>({
      id: crypto.randomUUID(),
      name: 'New Clock Layout',
      backgroundColor: '#111111',
      fontColor: '#FFFFFF',
      fields: []
  });
  
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [isAddWidgetOpen, setIsAddWidgetOpen] = useState(false);
  
  // Dragging state
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{x: number, y: number} | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      if (initialConfig) {
          setConfig(initialConfig);
      }
  }, [initialConfig]);

  const addField = (type: ClockFieldType) => {
      const newField: ClockField = {
          id: crypto.randomUUID(),
          type,
          label: AVAILABLE_FIELDS.find(f => f.type === type)?.label || 'Unknown',
          x: 50,
          y: 50,
          fontSize: type === 'timer' ? 120 : 32,
          fontWeight: type === 'timer' || type === 'blind_level' ? 'bold' : 'normal',
          color: config.fontColor || '#FFFFFF', // Use global default
          align: 'center',
          showLabel: true,
          labelText: type === 'blind_level' ? 'BLINDS' : type === 'ante' ? 'ANTE' : type === 'avg_stack' ? 'AVG STACK' : undefined
      };
      
      setConfig(prev => ({ ...prev, fields: [...prev.fields, newField] }));
      setSelectedFieldId(newField.id);
      setIsAddWidgetOpen(false);
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

  // --- Drag Logic ---
  const handleMouseDown = (e: React.MouseEvent, fieldId: string) => {
      e.stopPropagation();
      setSelectedFieldId(fieldId);
      setIsAddWidgetOpen(false); // Close drawer if open
      setIsDragging(true);
      dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
      if (!isDragging || !selectedFieldId || !dragStartRef.current || !canvasRef.current) return;
      
      const deltaX = e.clientX - dragStartRef.current.x;
      const deltaY = e.clientY - dragStartRef.current.y;
      
      const rect = canvasRef.current.getBoundingClientRect();
      
      // Convert px delta to percentage delta
      const deltaXPercent = (deltaX / rect.width) * 100;
      const deltaYPercent = (deltaY / rect.height) * 100;

      const field = config.fields.find(f => f.id === selectedFieldId);
      if (field) {
          updateField(selectedFieldId, {
              x: field.x + deltaXPercent,
              y: field.y + deltaYPercent
          });
      }

      dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
      setIsDragging(false);
      dragStartRef.current = null;
  };

  const selectedField = config.fields.find(f => f.id === selectedFieldId);

  // --- Mock Data for Preview ---
  const getMockValue = (type: ClockFieldType) => {
      switch(type) {
          case 'tournament_name': return 'Sunday Special';
          case 'timer': return '15:00';
          case 'blind_level': return '100 / 200';
          case 'next_blinds': return '200 / 400';
          case 'ante': return '200';
          case 'players_count': return '45 / 100';
          case 'entries_count': return '62';
          case 'total_chips': return '1,240,000';
          case 'avg_stack': return '27,555';
          case 'next_break': return '01:45:00';
          case 'current_time': return new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
          case 'custom_text': return 'Text';
          default: return '---';
      }
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
                            config.fields.slice().reverse().map((field, idx) => { // Reverse to show top layer first visually
                                const def = AVAILABLE_FIELDS.find(f => f.type === field.type);
                                return (
                                    <div 
                                        key={field.id}
                                        onClick={() => setSelectedFieldId(field.id)}
                                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all group ${
                                            selectedFieldId === field.id 
                                            ? 'bg-brand-green/10 border-brand-green/30 text-white' 
                                            : 'bg-[#1A1A1A] border-transparent hover:border-[#333] text-gray-400 hover:text-white'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3 overflow-hidden">
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
                <div 
                    ref={canvasRef}
                    className="aspect-video w-full max-w-6xl shadow-2xl relative border border-[#333]"
                    style={{ backgroundColor: config.backgroundColor }}
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
                                fontSize: `${field.fontSize}px`,
                                fontWeight: field.fontWeight,
                                color: field.color,
                                textAlign: field.align,
                                whiteSpace: 'nowrap'
                            }}
                        >
                            {field.showLabel && field.labelText && (
                                <div className="text-[0.4em] opacity-70 uppercase tracking-widest mb-[0.1em]">
                                    {field.labelText}
                                </div>
                            )}
                            {field.type === 'custom_text' ? (field.customText || 'Text') : getMockValue(field.type)}
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
                        {(selectedField.type === 'custom_text' || selectedField.showLabel) && (
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

                        {/* Visibility Toggle for Labels */}
                        {selectedField.type !== 'custom_text' && (
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

                        {/* Typography */}
                        <div className="space-y-4">
                            <label className="text-xs text-gray-400 font-bold flex items-center gap-2">
                                <Type size={14} /> Typography
                            </label>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] text-gray-500 block mb-1">Size (px)</label>
                                    <input 
                                        type="number" 
                                        value={selectedField.fontSize}
                                        onChange={(e) => updateField(selectedField.id, { fontSize: parseInt(e.target.value) })}
                                        className={`w-full ${THEME.input} rounded-lg px-3 py-2`}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] text-gray-500 block mb-1">Color</label>
                                    <div className="flex gap-2">
                                        <input 
                                            type="color" 
                                            value={selectedField.color}
                                            onChange={(e) => updateField(selectedField.id, { color: e.target.value })}
                                            className="h-9 w-9 rounded cursor-pointer border-none bg-transparent"
                                        />
                                    </div>
                                </div>
                            </div>
                            
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

                         <div className="pt-8 mt-auto">
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