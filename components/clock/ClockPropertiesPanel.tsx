
import React from 'react';
import { 
  Move, 
  Type, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  ChevronsUp, 
  ChevronsDown, 
  Palette, 
  Copy
} from 'lucide-react';
import { ClockField, ClockFieldType } from '../../types';
import { THEME } from '../../theme';
import NumberInput from '../ui/NumberInput';
import { useLanguage } from '../../contexts/LanguageContext';

interface ClockPropertiesPanelProps {
  selectedField: ClockField | null;
  onUpdate: (id: string, updates: Partial<ClockField>) => void;
  onDuplicate: (field: ClockField) => void;
  onRemove: (id: string) => void;
  onMoveLayer: (id: string, direction: 'up' | 'down' | 'front' | 'back') => void;
}

const ClockPropertiesPanel: React.FC<ClockPropertiesPanelProps> = ({
  selectedField,
  onUpdate,
  onDuplicate,
  onRemove,
  onMoveLayer
}) => {
  const { t } = useLanguage();

  if (!selectedField) {
      return (
        <div className="w-80 bg-[#111] border-l border-[#222] flex flex-col shrink-0 z-20 h-full">
            <div className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-[#222]">
                {t('clocks.editor.properties')}
            </div>
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-gray-600">
                <div className="w-12 h-12 bg-[#1A1A1A] rounded-full flex items-center justify-center mb-3"><Move size={24} className="opacity-50" /></div>
                <p className="text-xs">{t('clocks.editor.selectToEdit')}</p>
            </div>
        </div>
      );
  }

  const isShapeOrLine = (type: ClockFieldType) => type.startsWith('shape_') || type === 'line';

  return (
    <div className="w-80 bg-[#111] border-l border-[#222] flex flex-col shrink-0 z-20 h-full">
        <div className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-[#222]">
            {t('clocks.editor.properties')}
        </div>
        
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
            
            {(selectedField.type === 'custom_text' || (selectedField.showLabel && !isShapeOrLine(selectedField.type))) && (
                <div className="space-y-2">
                    <label className="text-xs text-gray-400 font-bold">{selectedField.type === 'custom_text' ? t('clocks.editor.content') : t('clocks.editor.labelText')}</label>
                    <input 
                        type="text" 
                        value={selectedField.type === 'custom_text' ? (selectedField.customText || '') : (selectedField.labelText || '')} 
                        onChange={(e) => onUpdate(selectedField.id, selectedField.type === 'custom_text' ? { customText: e.target.value } : { labelText: e.target.value })} 
                        className={`w-full ${THEME.input} rounded-lg px-3 py-2`} 
                    />
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
                                onChange={(val) => onUpdate(selectedField.id, { fontSize: val })}
                                min={1}
                                enableScroll
                                size="sm"
                            />
                        </div>
                    )}
                    <div className={isShapeOrLine(selectedField.type) ? 'col-span-2' : 'col-span-1'}>
                        <label className="text-[10px] text-gray-500 block mb-1">{isShapeOrLine(selectedField.type) ? t('clocks.editor.fillColor') : t('clocks.editor.fontColor')}</label>
                        <div className="flex gap-2">
                            <input 
                                type="color" 
                                value={selectedField.color} 
                                onChange={(e) => onUpdate(selectedField.id, { color: e.target.value })} 
                                className="h-9 w-full rounded cursor-pointer border border-[#333] bg-[#1A1A1A] p-0.5" 
                            />
                        </div>
                    </div>
                </div>

                {/* Dimensions for Shapes */}
                {isShapeOrLine(selectedField.type) && (
                    <div className="grid grid-cols-2 gap-4 pt-2">
                            <div>
                            <label className="text-[10px] text-gray-500 block mb-1">{t('clocks.editor.width')}</label>
                            <NumberInput value={selectedField.width} onChange={(val) => onUpdate(selectedField.id, { width: val })} min={1} enableScroll size="sm" />
                        </div>
                        <div>
                            <label className="text-[10px] text-gray-500 block mb-1">{t('clocks.editor.height')}</label>
                            <NumberInput value={selectedField.height} onChange={(val) => onUpdate(selectedField.id, { height: val })} min={1} enableScroll size="sm" />
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
                        <NumberInput value={Math.round(selectedField.x)} onChange={(val) => onUpdate(selectedField.id, { x: val })} size="sm" enableScroll step={1} />
                    </div>
                    <div>
                        <label className="text-[10px] text-gray-500 block mb-1">Y (%)</label>
                        <NumberInput value={Math.round(selectedField.y)} onChange={(val) => onUpdate(selectedField.id, { y: val })} size="sm" enableScroll step={1} />
                    </div>
                </div>
                </div>

                {/* Layer Ordering Controls */}
                <div className="pt-4 border-t border-[#222]">
                    <label className="text-xs text-gray-400 font-bold flex items-center gap-2 mb-2">{t('clocks.editor.displayOrder')}</label>
                    <div className="grid grid-cols-4 gap-2">
                    <button onClick={() => onMoveLayer(selectedField.id, 'back')} className="p-2 bg-[#1A1A1A] hover:bg-[#222] rounded border border-[#333] hover:border-gray-500 text-gray-400 hover:text-white" title="Send to Back"><ChevronsDown size={16} className="mx-auto" /></button>
                    <button onClick={() => onMoveLayer(selectedField.id, 'down')} className="p-2 bg-[#1A1A1A] hover:bg-[#222] rounded border border-[#333] hover:border-gray-500 text-gray-400 hover:text-white" title="Send Backward"><ArrowDown size={16} className="mx-auto" /></button>
                    <button onClick={() => onMoveLayer(selectedField.id, 'up')} className="p-2 bg-[#1A1A1A] hover:bg-[#222] rounded border border-[#333] hover:border-gray-500 text-gray-400 hover:text-white" title="Bring Forward"><ArrowUp size={16} className="mx-auto" /></button>
                    <button onClick={() => onMoveLayer(selectedField.id, 'front')} className="p-2 bg-[#1A1A1A] hover:bg-[#222] rounded border border-[#333] hover:border-gray-500 text-gray-400 hover:text-white" title="Bring to Front"><ChevronsUp size={16} className="mx-auto" /></button>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-8 mt-auto space-y-3">
                    <button onClick={() => onDuplicate(selectedField)} className="w-full py-3 bg-[#1A1A1A] hover:bg-[#222] text-gray-300 border border-[#333] hover:border-gray-500 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"><Copy size={18} /> {t('clocks.editor.duplicate')}</button>
                    <button onClick={() => onRemove(selectedField.id)} className="w-full py-3 bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"><Trash2 size={18} /> {t('clocks.editor.remove')}</button>
                </div>
        </div>
    </div>
  );
};

export default ClockPropertiesPanel;
