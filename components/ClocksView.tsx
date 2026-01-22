
import React, { useState, useEffect } from 'react';
import { Plus, MonitorPlay, Trash2, Edit2, Play } from 'lucide-react';
import { ClockConfig } from '../types';
import * as DataService from '../services/dataService';
import { THEME } from '../theme';
import ClockEditor from './ClockEditor';
import { useLanguage } from '../contexts/LanguageContext';

const ClocksView = () => {
  const { t } = useLanguage();
  const [clocks, setClocks] = useState<ClockConfig[]>([]);
  const [editingClock, setEditingClock] = useState<ClockConfig | undefined>(undefined);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  useEffect(() => {
    setClocks(DataService.getClockConfigs());
  }, []);

  const handleCreate = () => {
    setEditingClock(undefined);
    setIsEditorOpen(true);
  };

  const handleEdit = (clock: ClockConfig) => {
    setEditingClock(clock);
    setIsEditorOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm(t('common.delete') + "?")) {
      DataService.deleteClockConfig(id);
      setClocks(DataService.getClockConfigs());
    }
  };

  const handleSave = (config: ClockConfig) => {
    DataService.saveClockConfig(config);
    setClocks(DataService.getClockConfigs());
    setIsEditorOpen(false);
  };

  if (isEditorOpen) {
      return <ClockEditor 
        initialConfig={editingClock} 
        onSave={handleSave} 
        onClose={() => setIsEditorOpen(false)} 
      />;
  }

  return (
    <div className="h-full flex flex-col w-full">
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-4xl font-bold text-white mb-2">{t('clocks.title')}</h2>
          <p className="text-gray-400">{t('clocks.subtitle')}</p>
        </div>
        <button 
          onClick={handleCreate}
          className={`${THEME.buttonPrimary} px-6 py-3 rounded-full font-semibold shadow-lg shadow-green-500/20 flex items-center gap-2 transition-transform hover:scale-105 active:scale-95`}
        >
          <Plus size={20} strokeWidth={2.5} />
          {t('clocks.btn.new')}
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clocks.map((clock) => (
            <div key={clock.id} className={`${THEME.card} border ${THEME.border} rounded-3xl overflow-hidden group hover:border-brand-green/30 transition-all shadow-lg`}>
                {/* Preview Thumbnail (Mockup) */}
                <div 
                    className="aspect-video w-full relative p-4 flex flex-col items-center justify-center text-center select-none"
                    style={{ backgroundColor: clock.backgroundColor || '#222' }}
                >
                    <div className="text-white opacity-80 scale-75 transform-gpu pointer-events-none">
                         <div className="text-2xl font-bold mb-2">12:34</div>
                         <div className="text-xs uppercase opacity-70">BLINDS 100/200</div>
                    </div>
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
                        <button 
                             onClick={() => handleEdit(clock)}
                             className="p-3 bg-white text-black rounded-full hover:scale-110 transition-transform font-bold"
                             title={t('common.edit')}
                        >
                            <Edit2 size={20} />
                        </button>
                    </div>
                </div>

                <div className="p-5 flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-bold text-white">{clock.name}</h3>
                        <p className="text-xs text-gray-500">{clock.fields.length} {t('clocks.card.activeWidgets')}</p>
                    </div>
                    <button 
                        onClick={() => handleDelete(clock.id)}
                        className="text-gray-600 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-[#222]"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>
        ))}

        {/* Empty State Card */}
        <button 
          onClick={handleCreate}
          className="border-2 border-dashed border-[#222] rounded-3xl p-6 flex flex-col items-center justify-center text-gray-600 hover:border-brand-green/50 hover:text-brand-green/80 transition-all min-h-[250px] aspect-video"
        >
          <div className="w-14 h-14 rounded-full bg-[#111] flex items-center justify-center mb-4">
            <MonitorPlay size={28} />
          </div>
          <span className="font-bold text-lg">{t('clocks.empty.title')}</span>
          <span className="text-sm mt-1 opacity-70">{t('clocks.empty.subtitle')}</span>
        </button>
      </div>
    </div>
  );
};

export default ClocksView;
