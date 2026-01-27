
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
  Copy,
  Layout,
  Bold,
  Italic,
  Underline,
  ArrowLeftRight
} from 'lucide-react';
import { ClockField, ClockFieldType, ClockConfig } from '../../types';
import { THEME } from '../../theme';
import NumberInput from '../ui/NumberInput';
import { useLanguage } from '../../contexts/LanguageContext';

interface ClockPropertiesPanelProps {
  config: ClockConfig;
  onUpdateConfig: (updates: Partial<ClockConfig>) => void;
  selectedField: ClockField | null;
  onUpdate: (id: string, updates: Partial<ClockField>) => void;
  onDuplicate: (field: ClockField) => void;
  onRemove: (id: string) => void;
  onMoveLayer: (id: string, direction: 'up' | 'down' | 'front' | 'back') => void;
}

const ClockPropertiesPanel: React.FC<ClockPropertiesPanelProps> = ({
  config,
  onUpdateConfig,
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
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
                {/* Global Settings */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Layout size={16} /> {t('clocks.editor.canvasSettings')}
                    </h3>
                    
                    <div>
                        <label className="text-[10px] text-gray-500 block mb-1">{t('clocks.editor.background')}</label>
                        <div className="flex gap-2">
                            <input 
                                type="color" 
                                value={config.backgroundColor} 
                                onChange={(e) => onUpdateConfig({ backgroundColor: e.target.value })} 
                                className="h-9 w-9 rounded cursor-pointer border border-[#333] bg-[#1A1A1A] p-0.5 shrink-0" 
                            />
                            <input 
                                type="text"
                                value={config.backgroundColor}
                                onChange={(e) => onUpdateConfig({ backgroundColor: e.target.value })}
                                className={`${THEME.input} w-full rounded-lg px-3 py-2 text-xs font-mono`}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] text-gray-500 block mb-1">{t('clocks.editor.textColor')}</label>
                        <div className="flex gap-2">
                            <input 
                                type="color" 
                                value={config.fontColor || '#FFFFFF'} 
                                onChange={(e) => onUpdateConfig({ fontColor: e.target.value })} 
                                className="h-9 w-9 rounded cursor-pointer border border-[#333] bg-[#1A1A1A] p-0.5 shrink-0" 
                            />
                            <input 
                                type="text"
                                value={config.fontColor || '#FFFFFF'}
                                onChange={(e) => onUpdateConfig({ fontColor: e.target.value })}
                                className={`${THEME.input} w-full rounded-lg px-3 py-2 text-xs font-mono`}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
      );
  }

  const isShapeOrLine = (type: ClockFieldType) => type.startsWith('shape_') || type === 'line';
  const isImage = (type: ClockFieldType) => type === 'image';
  const isCustomText = selectedField.type === 'custom_text';
  // Allow dimensions for Shapes, Images, OR Custom Text (if ticker is enabled or user wants fixed width)
  const hasDimensions = isShapeOrLine(selectedField.type) || isImage(selectedField.type) || isCustomText;

  // Helper to format float to 1 decimal place for display
  const toPrecise = (num: number) => Number(num.toFixed(1));

  return (
    <div className="w-80 bg-[#111] border-l border-[#222] flex flex-col shrink-0 z-20 h-full">
        <div className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-[#222]">
            {t('clocks.editor.properties')}
        </div>
        
        <div 
            key={selectedField.id} 
            className="p-6 space-y-6 overflow-y-auto flex-1 animate-in fade-in duration-200"
        >
            
            {/* Component Name Indicator */}
            <div className="mb-2">
                <span className="text-[10px] text-gray-500 font-bold uppercase block mb-1">{t('clocks.editor.selectedComponent')}</span>
                <div className="text-sm font-bold text-brand-green bg-[#1A1A1A] p-2 rounded border border-[#333]">
                    {t(`clocks.widgets.${selectedField.type}`) || selectedField.type}
                </div>
            </div>

            {/* Custom Text Content */}
            {(isCustomText || (selectedField.showLabel && !isShapeOrLine(selectedField.type) && !isImage(selectedField.type))) && (
                <div className="space-y-2">
                    <label className="text-xs text-gray-400 font-bold">{isCustomText ? t('clocks.editor.content') : t('clocks.editor.labelText')}</label>
                    <input 
                        type="text" 
                        value={isCustomText ? (selectedField.customText || '') : (selectedField.labelText || '')} 
                        onChange={(e) => onUpdate(selectedField.id, isCustomText ? { customText: e.target.value } : { labelText: e.target.value })} 
                        className={`w-full ${THEME.input} rounded-lg px-3 py-2`} 
                    />
                </div>
            )}

            {/* Ticker Toggle for Custom Text */}
            {isCustomText && (
                <div className="flex items-center justify-between p-3 bg-[#1A1A1A] rounded-xl border border-[#333]">
                    <div className="flex items-center gap-2">
                        <ArrowLeftRight size={16} className={selectedField.isTicker ? "text-brand-green" : "text-gray-500"} />
                        <span className="text-xs font-bold text-gray-300">News Ticker Mode</span>
                    </div>
                    <div 
                        onClick={() => onUpdate(selectedField.id, { isTicker: !selectedField.isTicker, width: selectedField.isTicker ? undefined : (selectedField.width || 300) })}
                        className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${selectedField.isTicker ? 'bg-brand-green' : 'bg-[#333]'}`}
                    >
                        <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${selectedField.isTicker ? 'left-6' : 'left-1'}`} />
                    </div>
                </div>
            )}

            {isImage(selectedField.type) && (
                <div className="space-y-2">
                    <label className="text-xs text-gray-400 font-bold">Image URL</label>
                    <input 
                        type="text" 
                        value={selectedField.imageUrl || ''} 
                        onChange={(e) => onUpdate(selectedField.id, { imageUrl: e.target.value })} 
                        className={`w-full ${THEME.input} rounded-lg px-3 py-2`}
                        placeholder="https://example.com/logo.png" 
                    />
                </div>
            )}

            <div className="space-y-4">
                <label className="text-xs text-gray-400 font-bold flex items-center gap-2">
                    {isShapeOrLine(selectedField.type) ? <Palette size={14}/> : <Type size={14}/>} 
                    {isShapeOrLine(selectedField.type) || isImage(selectedField.type) ? t('clocks.editor.appearance') : t('clocks.editor.typography')}
                </label>
                
                {/* Font Styles (Bold, Italic, Underline) - Text Only */}
                {!isShapeOrLine(selectedField.type) && !isImage(selectedField.type) && (
                    <div className="flex gap-2">
                        <button 
                            onClick={() => onUpdate(selectedField.id, { fontWeight: selectedField.fontWeight === 'bold' ? 'normal' : 'bold' })}
                            className={`flex-1 p-2 rounded-lg border transition-colors flex justify-center ${selectedField.fontWeight === 'bold' ? 'bg-brand-green text-black border-brand-green' : 'bg-[#1A1A1A] text-gray-400 border-[#333] hover:text-white'}`}
                            title="Bold"
                        >
                            <Bold size={16} strokeWidth={3} />
                        </button>
                        <button 
                            onClick={() => onUpdate(selectedField.id, { fontStyle: selectedField.fontStyle === 'italic' ? 'normal' : 'italic' })}
                            className={`flex-1 p-2 rounded-lg border transition-colors flex justify-center ${selectedField.fontStyle === 'italic' ? 'bg-brand-green text-black border-brand-green' : 'bg-[#1A1A1A] text-gray-400 border-[#333] hover:text-white'}`}
                            title="Italic"
                        >
                            <Italic size={16} />
                        </button>
                        <button 
                            onClick={() => onUpdate(selectedField.id, { textDecoration: selectedField.textDecoration === 'underline' ? 'none' : 'underline' })}
                            className={`flex-1 p-2 rounded-lg border transition-colors flex justify-center ${selectedField.textDecoration === 'underline' ? 'bg-brand-green text-black border-brand-green' : 'bg-[#1A1A1A] text-gray-400 border-[#333] hover:text-white'}`}
                            title="Underline"
                        >
                            <Underline size={16} />
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    {!isShapeOrLine(selectedField.type) && !isImage(selectedField.type) && (
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
                    {!isImage(selectedField.type) && (
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
                    )}
                </div>

                {/* Dimensions for Shapes & Images & Ticker Text */}
                {hasDimensions && (
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
                        <NumberInput 
                            value={toPrecise(selectedField.x)} 
                            onChange={(val) => onUpdate(selectedField.id, { x: val })} 
                            size="sm" 
                            enableScroll 
                            step={0.1} 
                        />
                    </div>
                    <div>
                        <label className="text-[10px] text-gray-500 block mb-1">Y (%)</label>
                        <NumberInput 
                            value={toPrecise(selectedField.y)} 
                            onChange={(val) => onUpdate(selectedField.id, { y: val })} 
                            size="sm" 
                            enableScroll 
                            step={0.1} 
                        />
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