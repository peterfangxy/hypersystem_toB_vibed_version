
import React, { useState } from 'react';
import { 
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
  GripVertical, 
  Calendar, 
  Timer, 
  MonitorPlay
} from 'lucide-react';
import { ClockConfig, ClockFieldType } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { THEME } from '../../theme';

interface ClockLayersPanelProps {
  config: ClockConfig;
  selectedFieldId: string | null;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  onAdd: (type: ClockFieldType) => void;
  onReorder: (draggedId: string, targetId: string) => void;
  onUpdateConfig: (updates: Partial<ClockConfig>) => void;
}

const ClockLayersPanel: React.FC<ClockLayersPanelProps> = ({
  config,
  selectedFieldId,
  onSelect,
  onRemove,
  onAdd,
  onReorder,
  onUpdateConfig
}) => {
  const { t } = useLanguage();
  const [isAddWidgetOpen, setIsAddWidgetOpen] = useState(false);
  const [draggedFieldId, setDraggedFieldId] = useState<string | null>(null);

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

  const handleAdd = (type: ClockFieldType) => {
      onAdd(type);
      setIsAddWidgetOpen(false);
  };

  return (
    <div className="w-72 bg-[#111] border-r border-[#222] flex flex-col shrink-0 relative z-10 h-full">
        {/* Settings Header */}
        <div className="p-5 border-b border-[#222] space-y-5">
            <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">{t('clocks.editor.description')}</label>
                <textarea
                    value={config.description || ''}
                    onChange={(e) => onUpdateConfig({ description: e.target.value })}
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
                                onClick={() => handleAdd(field.type)} 
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
                                onDrop={(e) => { e.preventDefault(); if (!draggedFieldId || draggedFieldId === field.id) return; onReorder(draggedFieldId, field.id); }}
                                onClick={() => onSelect(field.id)}
                                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all group relative ${
                                    selectedFieldId === field.id ? 'bg-brand-green/10 border-brand-green/30 text-white' : 'bg-[#1A1A1A] border-transparent hover:border-[#333] text-gray-400 hover:text-white'
                                }`}
                            >
                                <div className="cursor-grab text-gray-600 hover:text-gray-300"><GripVertical size={14} /></div>
                                <div className="flex items-center gap-3 overflow-hidden flex-1">
                                    {def?.icon ? <def.icon size={16} className="shrink-0"/> : <MonitorPlay size={16} className="shrink-0"/>}
                                    <span className="text-sm font-medium truncate">{def?.label || 'Unknown'}</span>
                                </div>
                                <button onClick={(e) => { e.stopPropagation(); onRemove(field.id); }} className="p-1.5 text-gray-600 hover:text-red-500 hover:bg-[#333] rounded opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={14} /></button>
                            </div>
                        );
                    })}
                    {config.fields.length === 0 && (
                        <div className="text-center py-10 text-gray-600 text-xs">
                            {t('clocks.editor.emptyWidgets')}
                        </div>
                    )}
                </div>
            )}
        </div>
    </div>
  );
};

export default ClockLayersPanel;
