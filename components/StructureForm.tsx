import React, { useState, useEffect } from 'react';
import { Layers, Clock, Coins, PlayCircle, Coffee, Repeat, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { TournamentStructure, StructureItem } from '../types';
import { THEME } from '../theme';
import { Modal } from './Modal';

interface StructureFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (structure: TournamentStructure) => void;
  initialData?: TournamentStructure;
}

const StructureForm: React.FC<StructureFormProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [name, setName] = useState('');
  const [startingChips, setStartingChips] = useState(10000);
  
  // Rebuy Config
  const [rebuyLimit, setRebuyLimit] = useState(1);
  const [lastRebuyLevel, setLastRebuyLevel] = useState(6);

  // Schedule Items
  const [items, setItems] = useState<StructureItem[]>([]);

  // Initialize data
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
        // Default starter items
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
      title={initialData ? 'Edit Structure' : 'Create Structure'}
      size="3xl"
    >
      <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden h-[80vh]">
          <div className="flex flex-1 overflow-hidden">
              {/* Left Panel: Settings */}
              <div className="w-1/3 p-6 border-r border-[#222] overflow-y-auto space-y-6 bg-[#1A1A1A]">
                  <div className="space-y-4">
                      <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-300">Structure Name</label>
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
                              <Coins size={14} /> Chips
                            </h4>
                            <div className="space-y-1">
                                  <label className="text-sm font-medium text-gray-300">Starting Chips</label>
                                  <input 
                                      required
                                      type="number"
                                      min="0"
                                      step="100" 
                                      value={startingChips}
                                      onChange={e => setStartingChips(parseInt(e.target.value) || 0)}
                                      className={`w-full ${THEME.input} rounded-xl px-4 py-2 outline-none transition-all`}
                                  />
                            </div>
                      </div>

                      <div className="pt-2 border-t border-[#333]">
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                              <Repeat size={14} /> Re-buys
                            </h4>
                            <div className="space-y-3">
                              <div className="space-y-1">
                                  <label className="text-sm font-medium text-gray-300">Re-buy Limit</label>
                                  <input 
                                      required
                                      type="number"
                                      min="0"
                                      placeholder="0 = Freezeout"
                                      value={rebuyLimit}
                                      onChange={e => setRebuyLimit(parseInt(e.target.value))}
                                      className={`w-full ${THEME.input} rounded-xl px-4 py-2 outline-none transition-all`}
                                  />
                                   <p className="text-[9px] text-gray-500">0 for Freezeout</p>
                              </div>
                              <div className="space-y-1">
                                  <label className="text-sm font-medium text-gray-300">Last Re-buy Level</label>
                                  <input 
                                      required
                                      type="number"
                                      min="0"
                                      value={lastRebuyLevel}
                                      onChange={e => setLastRebuyLevel(parseInt(e.target.value))}
                                      className={`w-full ${THEME.input} rounded-xl px-4 py-2 outline-none transition-all`}
                                  />
                              </div>
                            </div>
                      </div>

                      <div className="p-4 bg-[#222] rounded-xl border border-[#333]">
                          <div className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-1">Est. Tournament Length</div>
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
                      <div className="col-span-1 text-center">#</div>
                      <div className="col-span-2">Duration</div>
                      <div className="col-span-2">Small</div>
                      <div className="col-span-2">Big</div>
                      <div className="col-span-2">Ante</div>
                      <div className="col-span-3 text-right">Actions</div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4 space-y-2">
                      {items.map((item, idx) => (
                          <div key={idx} className={`grid grid-cols-12 gap-4 items-center group p-2 rounded-lg border ${item.type === 'Break' ? 'bg-[#1A1A1A] border-dashed border-[#333]' : 'border-transparent hover:bg-[#1A1A1A] hover:border-[#333]'}`}>
                              
                              {/* Sequence / Type */}
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

                              {/* Duration */}
                              <div className="col-span-2 relative">
                                  <input 
                                      type="number"
                                      value={item.duration}
                                      onChange={(e) => handleItemChange(idx, 'duration', parseInt(e.target.value) || 0)}
                                      className={`w-full ${THEME.input} rounded-lg px-2 py-1.5 text-sm text-center font-mono`}
                                  />
                                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-600 pointer-events-none">min</span>
                              </div>

                              {item.type === 'Level' ? (
                                  <>
                                    <div className="col-span-2">
                                        <input 
                                            type="number"
                                            value={item.smallBlind}
                                            onChange={(e) => handleItemChange(idx, 'smallBlind', parseInt(e.target.value) || 0)}
                                            className={`w-full ${THEME.input} rounded-lg px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-brand-green/50 font-mono`}
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <input 
                                            type="number"
                                            value={item.bigBlind}
                                            onChange={(e) => handleItemChange(idx, 'bigBlind', parseInt(e.target.value) || 0)}
                                            className={`w-full ${THEME.input} rounded-lg px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-brand-green/50 font-mono`}
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <input 
                                            type="number"
                                            value={item.ante}
                                            onChange={(e) => handleItemChange(idx, 'ante', parseInt(e.target.value) || 0)}
                                            className={`w-full ${THEME.input} rounded-lg px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-brand-green/50 font-mono placeholder:text-gray-700`}
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
                              <Plus size={16} /> Add Level
                          </button>
                          <button 
                             type="button"
                             onClick={handleAddBreak}
                             className="flex items-center justify-center gap-2 py-3 bg-[#222] hover:bg-[#2A2A2A] text-gray-300 font-bold rounded-xl transition-colors border border-dashed border-[#333] hover:border-gray-500"
                          >
                              <Coffee size={16} /> Add Break
                          </button>
                      </div>
                  </div>
              </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-[#222] bg-[#171717] flex justify-end gap-3">
              <button 
                  type="button" 
                  onClick={onClose}
                  className={`${THEME.buttonSecondary} px-6 py-3 rounded-xl font-bold`}
              >
                  Cancel
              </button>
              <button 
                  type="submit" 
                  className={`${THEME.buttonPrimary} px-8 py-3 rounded-xl font-bold text-lg shadow-lg shadow-green-500/20`}
              >
                  {initialData ? 'Save Changes' : 'Create Structure'}
              </button>
          </div>
      </form>
    </Modal>
  );
};

export default StructureForm;