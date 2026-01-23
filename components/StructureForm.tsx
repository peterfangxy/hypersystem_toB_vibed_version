import React, { useState, useEffect } from 'react';
import { 
  Save, 
  Trash2, 
  Plus, 
  Coffee, 
  Clock, 
  Hash, 
  Coins, 
  Repeat,
  AlertCircle,
  GripVertical
} from 'lucide-react';
import { TournamentStructure, StructureItem } from '../types';
import { THEME } from '../theme';
import { Modal } from './ui/Modal';
import NumberInput from './ui/NumberInput';
import { useLanguage } from '../contexts/LanguageContext';

interface StructureFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (structure: TournamentStructure) => void;
  initialData?: TournamentStructure;
}

const StructureForm: React.FC<StructureFormProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [startingChips, setStartingChips] = useState(10000);
  const [rebuyLimit, setRebuyLimit] = useState(0);
  const [lastRebuyLevel, setLastRebuyLevel] = useState(0);
  const [items, setItems] = useState<StructureItem[]>([]);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name);
        setStartingChips(initialData.startingChips);
        setRebuyLimit(initialData.rebuyLimit);
        setLastRebuyLevel(initialData.lastRebuyLevel);
        setItems(initialData.items || []);
      } else {
        setName('');
        setStartingChips(10000);
        setRebuyLimit(0);
        setLastRebuyLevel(0);
        setItems([]);
      }
    }
  }, [isOpen, initialData]);

  const handleAddLevel = () => {
    const levels = items.filter(i => i.type === 'Level');
    const lastLevel = levels.length > 0 ? levels[levels.length - 1] : null;
    
    let newSb = 100, newBb = 200, newAnte = 0;
    if (lastLevel) {
       newSb = (lastLevel.smallBlind || 0); 
       newBb = (lastLevel.bigBlind || 0);
       newAnte = (lastLevel.ante || 0);
    }

    const newItem: StructureItem = {
      type: 'Level',
      duration: lastLevel?.duration || 20,
      level: levels.length + 1,
      smallBlind: newSb,
      bigBlind: newBb,
      ante: newAnte
    };
    setItems([...items, newItem]);
  };

  const handleAddBreak = () => {
      const newItem: StructureItem = {
          type: 'Break',
          duration: 15
      };
      setItems([...items, newItem]);
  };

  const handleRemoveItem = (index: number) => {
      const newItems = [...items];
      newItems.splice(index, 1);
      reindexLevels(newItems);
  };

  const reindexLevels = (currentItems: StructureItem[]) => {
      let levelCounter = 1;
      const reIndexed = currentItems.map(item => {
          if (item.type === 'Level') {
              return { ...item, level: levelCounter++ };
          }
          return item;
      });
      setItems(reIndexed);
  };

  const handleItemChange = (index: number, field: keyof StructureItem, value: number) => {
      const newItems = [...items];
      newItems[index] = { ...newItems[index], [field]: value };
      setItems(newItems);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
      setDraggedIdx(index);
      e.dataTransfer.effectAllowed = 'move';
      // Make the drag ghost transparent or specific if needed, browser default is usually ok
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
      e.preventDefault(); // Allow drop
      if (draggedIdx === null) return;
      if (draggedIdx !== index) {
          // Optional: You could implement live swapping here for visual feedback
          // But for simplicity, we'll do it on drop to avoid jitter
      }
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
      e.preventDefault();
      if (draggedIdx === null || draggedIdx === index) return;

      const newItems = [...items];
      const [draggedItem] = newItems.splice(draggedIdx, 1);
      newItems.splice(index, 0, draggedItem);
      
      reindexLevels(newItems);
      setDraggedIdx(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const structure: TournamentStructure = {
      id: initialData?.id || crypto.randomUUID(),
      name,
      startingChips,
      rebuyLimit,
      lastRebuyLevel,
      items
    };
    onSubmit(structure);
    onClose();
  };

  const totalDuration = items.reduce((sum, item) => sum + item.duration, 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? t('structures.form.editTitle') : t('structures.form.createTitle')}
      size="3xl"
    >
      <form onSubmit={handleSubmit} className="flex flex-col h-[80vh] overflow-hidden">
         <div className="flex flex-1 overflow-hidden">
             
             {/* Left Panel: Settings */}
             <div className="w-80 bg-[#1A1A1A] border-r border-[#222] flex flex-col p-6 space-y-6 shrink-0 overflow-y-auto">
                 <div className="space-y-4">
                     <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('structures.form.name')}</h3>
                     <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-300">{t('structures.form.name')}</label>
                        <input 
                            required
                            type="text" 
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className={`w-full ${THEME.input} rounded-xl px-4 py-3 outline-none`}
                            placeholder="e.g. Turbo Deepstack"
                        />
                     </div>
                 </div>

                 <div className="pt-4 border-t border-[#222] space-y-4">
                     <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                        <Coins size={14} /> {t('structures.form.chips')}
                     </h3>
                     <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-300">{t('structures.form.startChips')}</label>
                        <NumberInput 
                            value={startingChips}
                            onChange={(val) => setStartingChips(val || 0)}
                            min={0}
                            step={100}
                        />
                     </div>
                 </div>

                 <div className="pt-4 border-t border-[#222] space-y-4">
                     <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                        <Repeat size={14} /> {t('structures.form.rebuys')}
                     </h3>
                     <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-300">{t('structures.form.rebuyLimit')}</label>
                        <NumberInput 
                            value={rebuyLimit}
                            onChange={(val) => setRebuyLimit(val || 0)}
                            min={0}
                        />
                        <p className="text-[10px] text-gray-500">{t('structures.form.freezeout')}</p>
                     </div>
                     <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-300">{t('structures.form.lastRebuyLevel')}</label>
                        <NumberInput 
                            value={lastRebuyLevel}
                            onChange={(val) => setLastRebuyLevel(val || 0)}
                            min={0}
                        />
                     </div>
                 </div>

                 <div className="pt-4 border-t border-[#222]">
                     <div className="bg-[#222] rounded-xl p-4 border border-[#333]">
                         <div className="text-xs text-gray-500 font-bold uppercase mb-1">{t('structures.form.estLength')}</div>
                         <div className="text-2xl font-mono font-bold text-white flex items-center gap-2">
                             <Clock size={20} className="text-brand-green" />
                             {Math.floor(totalDuration / 60)}h {totalDuration % 60}m
                         </div>
                     </div>
                 </div>
             </div>

             {/* Right Panel: Schedule Builder */}
             <div className="flex-1 flex flex-col bg-[#111]">
                 <div className="flex-1 overflow-y-auto px-4 py-4 relative">
                  {/* Sticky Header */}
                  <div className="sticky top-0 z-10 grid grid-cols-12 gap-2 p-2 bg-[#111] border-b border-[#222] text-xs font-bold text-gray-500 uppercase tracking-wider items-center mb-2 shadow-sm">
                      <div className="col-span-1 text-center">{t('structures.form.schedule.headerSeq')}</div>
                      <div className="col-span-2 text-center">{t('structures.form.schedule.headerDur')}</div>
                      <div className="col-span-2 text-center">{t('structures.form.schedule.headerSmall')}</div>
                      <div className="col-span-2 text-center">{t('structures.form.schedule.headerBig')}</div>
                      <div className="col-span-2 text-center">{t('structures.form.schedule.headerAnte')}</div>
                      <div className="col-span-3 text-right">{t('structures.form.schedule.headerActions')}</div>
                  </div>
                  
                  <div className="space-y-2">
                      {items.map((item, idx) => (
                          <div 
                            key={idx} 
                            draggable
                            onDragStart={(e) => handleDragStart(e, idx)}
                            onDragOver={(e) => handleDragOver(e, idx)}
                            onDrop={(e) => handleDrop(e, idx)}
                            className={`grid grid-cols-12 gap-2 items-center group p-2 rounded-lg border transition-all cursor-default ${
                                draggedIdx === idx ? 'opacity-50 border-dashed border-gray-500 bg-[#222]' : 
                                item.type === 'Break' ? 'bg-[#1A1A1A] border-dashed border-[#333]' : 'border-transparent hover:bg-[#1A1A1A] hover:border-[#333]'
                            }`}
                          >
                              
                              <div className="col-span-1 flex items-center justify-center gap-1 group-hover:text-gray-300">
                                  <div className="cursor-grab active:cursor-grabbing text-gray-700 hover:text-gray-400 transition-colors" title="Drag to reorder">
                                      <GripVertical size={14} />
                                  </div>
                                  {item.type === 'Break' ? (
                                     <div className="w-6 h-6 rounded bg-[#222] flex items-center justify-center text-gray-500" title="Break">
                                         <Coffee size={12} />
                                     </div>
                                  ) : (
                                     <div className="text-gray-400 font-bold text-sm w-5 text-center">
                                         {item.level}
                                     </div>
                                  )}
                              </div>

                              <div className="col-span-2 relative">
                                  <NumberInput
                                      value={item.duration}
                                      onChange={(val) => handleItemChange(idx, 'duration', val || 1)}
                                      min={1}
                                      enableScroll={true}
                                      size="sm"
                                      align="center"
                                      variant="transparent"
                                      className="border border-[#333] rounded-lg bg-[#222]"
                                  />
                              </div>

                              {item.type === 'Level' ? (
                                  <>
                                    <div className="col-span-2">
                                        <NumberInput 
                                            value={item.smallBlind}
                                            onChange={(val) => handleItemChange(idx, 'smallBlind', val || 0)}
                                            size="sm"
                                            align="center"
                                            variant="transparent"
                                            className="border border-[#333] rounded-lg bg-[#222]"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <NumberInput 
                                            value={item.bigBlind}
                                            onChange={(val) => handleItemChange(idx, 'bigBlind', val || 0)}
                                            size="sm"
                                            align="center"
                                            variant="transparent"
                                            className="border border-[#333] rounded-lg bg-[#222]"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <NumberInput 
                                            value={item.ante}
                                            onChange={(val) => handleItemChange(idx, 'ante', val || 0)}
                                            size="sm"
                                            align="center"
                                            variant="transparent"
                                            className="border border-[#333] rounded-lg bg-[#222]"
                                            placeholder="0"
                                        />
                                    </div>
                                  </>
                              ) : (
                                  <div className="col-span-6 flex items-center justify-center text-xs font-bold uppercase tracking-widest text-gray-600">
                                      --- Break ---
                                  </div>
                              )}

                              <div className="col-span-3 flex justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                  <button 
                                      type="button"
                                      onClick={() => handleRemoveItem(idx)}
                                      className="p-1.5 text-gray-500 hover:text-red-500 rounded hover:bg-[#333] transition-colors"
                                  >
                                      <Trash2 size={14} />
                                  </button>
                              </div>
                          </div>
                      ))}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-[#222]">
                      <button 
                         type="button"
                         onClick={handleAddLevel}
                         className="flex items-center justify-center gap-2 py-3 bg-[#222] hover:bg-[#2A2A2A] text-brand-green font-bold rounded-xl transition-colors border border-dashed border-[#333] hover:border-brand-green/30"
                      >
                          <Plus size={16} /> {t('structures.form.schedule.addLevel')}
                      </button>
                      <button 
                         type="button"
                         onClick={handleAddBreak}
                         className="flex items-center justify-center gap-2 py-3 bg-[#222] hover:bg-[#2A2A2A] text-gray-300 font-bold rounded-xl transition-colors border border-dashed border-[#333] hover:border-gray-500"
                      >
                          <Coffee size={16} /> {t('structures.form.schedule.addBreak')}
                      </button>
                  </div>
              </div>
             </div>
         </div>

         {/* Footer */}
         <div className="p-4 border-t border-[#222] bg-[#151515] flex justify-end gap-3 shrink-0">
             <button 
                 type="button"
                 onClick={onClose}
                 className={`${THEME.buttonSecondary} px-6 py-3 rounded-xl font-bold`}
             >
                 {t('common.cancel')}
             </button>
             <button 
                 type="submit"
                 disabled={!name || items.length === 0}
                 className={`${THEME.buttonPrimary} px-8 py-3 rounded-xl font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
             >
                 <Save size={18} />
                 {initialData ? t('structures.form.save') : t('structures.form.create')}
             </button>
         </div>
      </form>
    </Modal>
  );
};

export default StructureForm;