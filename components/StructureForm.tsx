
import React, { useState, useEffect } from 'react';
import { Layers, Clock, Coins, PlayCircle, Coffee, Repeat, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
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
  const [rebuyLimit, setRebuyLimit] = useState(1);
  const [lastRebuyLevel, setLastRebuyLevel] = useState(6);
  const [items, setItems] = useState<StructureItem[]>([]);

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
        setRebuyLimit(1);
        setLastRebuyLevel(6);
        setItems([
             { type: 'Level', level: 1, duration: 20, smallBlind: 100, bigBlind: 200, ante: 0 },
             { type: 'Level', level: 2, duration: 20, smallBlind: 200, bigBlind: 400, ante: 0 },
             { type: 'Level', level: 3, duration: 20, smallBlind: 300, bigBlind: 600, ante: 600 },
             { type: 'Break', duration: 10 },
             { type: 'Level', level: 4, duration: 20, smallBlind: 400, bigBlind: 800, ante: 800 },
        ]);
      }
    }
  }, [isOpen, initialData]);

  const handleAddLevel = () => {
    const lastLevel = [...items].reverse().find(i => i.type === 'Level');
    const newLevelNum = lastLevel && lastLevel.level ? lastLevel.level + 1 : 1;
    const prevSB = lastLevel?.smallBlind || 100;
    const prevBB = lastLevel?.bigBlind || 200;
    const prevAnte = lastLevel?.ante || 0;
    const prevDuration = lastLevel?.duration || 20;

    setItems([...items, {
        type: 'Level',
        level: newLevelNum,
        duration: prevDuration,
        smallBlind: prevSB * 2,
        bigBlind: prevBB * 2,
        ante: prevAnte * 2
    }]);
  };

  const handleAddBreak = () => {
      setItems([...items, {
          type: 'Break',
          duration: 10
      }]);
  };

  const handleRemoveItem = (index: number) => {
      const newItems = [...items];
      newItems.splice(index, 1);
      recalculateLevelNumbers(newItems);
      setItems(newItems);
  };

  const handleItemChange = (index: number, field: keyof StructureItem, value: number) => {
      const newItems = [...items];
      newItems[index] = { ...newItems[index], [field]: value };
      setItems(newItems);
  };

  const recalculateLevelNumbers = (itemList: StructureItem[]) => {
      let levelCounter = 1;
      itemList.forEach(item => {
          if (item.type === 'Level') {
              item.level = levelCounter++;
          }
      });
  };

  const calculateTotalDuration = () => {
    const totalTime = items.reduce((sum, item) => sum + item.duration, 0);
    const hours = Math.floor(totalTime / 60);
    const minutes = totalTime % 60;
    return `${hours}h ${minutes}m`;
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? t('structures.form.editTitle') : t('structures.form.createTitle')}
      size="3xl"
    >
      <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden h-[80vh]">
          <div className="flex flex-1 overflow-hidden">
              {/* Left Panel: Settings */}
              <div className="w-1/3 p-6 border-r border-[#222] overflow-y-auto space-y-6 bg-[#1A1A1A]">
                  <div className="space-y-4">
                      <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-300">{t('structures.form.name')}</label>
                          <input 
                              required
                              type="text" 
                              value={name}
                              onChange={e => setName(e.target.value)}
                              className={`w-full ${THEME.input} rounded-xl px-4 py-3 outline-none transition-all placeholder:text-gray-600`}
                              placeholder="e.g. Turbo Deepstack"
                          />
                      </div>

                      <div className="pt-2 border-t border-[#333]">
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                              <Coins size={14} /> {t('structures.form.chips')}
                            </h4>
                            <div className="space-y-1">
                                  <label className="text-sm font-medium text-gray-300">{t('structures.form.startChips')}</label>
                                  <NumberInput 
                                      value={startingChips}
                                      onChange={setStartingChips}
                                      min={0}
                                      step={100}
                                      size="md"
                                  />
                            </div>
                      </div>

                      <div className="pt-2 border-t border-[#333]">
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                              <Repeat size={14} /> {t('structures.form.rebuys')}
                            </h4>
                            <div className="space-y-3">
                              <div className="space-y-1">
                                  <label className="text-sm font-medium text-gray-300">{t('structures.form.rebuyLimit')}</label>
                                  <NumberInput 
                                      value={rebuyLimit}
                                      onChange={setRebuyLimit}
                                      min={0}
                                      size="md"
                                  />
                                   <p className="text-[9px] text-gray-500">{t('structures.form.freezeout')}</p>
                              </div>
                              <div className="space-y-1">
                                  <label className="text-sm font-medium text-gray-300">{t('structures.form.lastRebuyLevel')}</label>
                                  <NumberInput 
                                      value={lastRebuyLevel}
                                      onChange={setLastRebuyLevel}
                                      min={0}
                                      size="md"
                                  />
                              </div>
                            </div>
                      </div>

                      <div className="p-4 bg-[#222] rounded-xl border border-[#333]">
                          <div className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-1">{t('structures.form.estLength')}</div>
                          <div className="text-2xl font-bold text-brand-green flex items-center gap-2">
                              <PlayCircle size={20} />
                              {calculateTotalDuration()}
                          </div>
                      </div>
                  </div>
              </div>

              {/* Right Panel: Schedule Builder */}
              <div className="w-2/3 flex flex-col bg-[#111]">
                  <div className="p-4 bg-[#171717] border-b border-[#222] grid grid-cols-12 gap-4 text-xs font-bold text-gray-500 uppercase tracking-wider items-center">
                      <div className="col-span-1 text-center">{t('structures.form.schedule.headerSeq')}</div>
                      <div className="col-span-2">{t('structures.form.schedule.headerDur')}</div>
                      <div className="col-span-2">{t('structures.form.schedule.headerSmall')}</div>
                      <div className="col-span-2">{t('structures.form.schedule.headerBig')}</div>
                      <div className="col-span-2">{t('structures.form.schedule.headerAnte')}</div>
                      <div className="col-span-3 text-right">{t('structures.form.schedule.headerActions')}</div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4 space-y-2">
                      {items.map((item, idx) => (
                          <div key={idx} className={`grid grid-cols-12 gap-4 items-center group p-2 rounded-lg border ${item.type === 'Break' ? 'bg-[#1A1A1A] border-dashed border-[#333]' : 'border-transparent hover:bg-[#1A1A1A] hover:border-[#333]'}`}>
                              
                              <div className="col-span-1 flex justify-center">
                                  {item.type === 'Break' ? (
                                     <div className="w-6 h-6 rounded bg-[#222] flex items-center justify-center text-gray-500" title="Break">
                                         <Coffee size={12} />
                                     </div>
                                  ) : (
                                     <div className="text-gray-400 font-bold text-sm">
                                         {item.level}
                                     </div>
                                  )}
                              </div>

                              <div className="col-span-2 relative">
                                  <NumberInput
                                      value={item.duration}
                                      onChange={(val) => handleItemChange(idx, 'duration', val)}
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
                                            onChange={(val) => handleItemChange(idx, 'smallBlind', val)}
                                            size="sm"
                                            variant="transparent"
                                            className="border border-[#333] rounded-lg bg-[#222]"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <NumberInput 
                                            value={item.bigBlind}
                                            onChange={(val) => handleItemChange(idx, 'bigBlind', val)}
                                            size="sm"
                                            variant="transparent"
                                            className="border border-[#333] rounded-lg bg-[#222]"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <NumberInput 
                                            value={item.ante}
                                            onChange={(val) => handleItemChange(idx, 'ante', val)}
                                            size="sm"
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

          <div className="p-6 border-t border-[#222] bg-[#171717] flex justify-end gap-3">
              <button 
                  type="button" 
                  onClick={onClose}
                  className={`${THEME.buttonSecondary} px-6 py-3 rounded-xl font-bold`}
              >
                  {t('common.cancel')}
              </button>
              <button 
                  type="submit" 
                  className={`${THEME.buttonPrimary} px-8 py-3 rounded-xl font-bold text-lg shadow-lg shadow-green-500/20`}
              >
                  {initialData ? t('structures.form.save') : t('structures.form.create')}
              </button>
          </div>
      </form>
    </Modal>
  );
};

export default StructureForm;
