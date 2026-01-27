
import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  MonitorPlay, 
  Edit2
} from 'lucide-react';
import { ClockConfig } from '../../types';
import * as DataService from '../../services/dataService';
import { THEME } from '../../theme';
import ClockEditor from '../../components/clock/ClockEditor';
import ClockDisplay from '../../components/clock/ClockDisplay';
import { useLanguage } from '../../contexts/LanguageContext';
import DeleteWithConfirmation from '../../components/ui/DeleteWithConfirmation';

const ClockLayouts = () => {
    const { t } = useLanguage();
    const [clocks, setClocks] = useState<ClockConfig[]>([]);
    const [editingClock, setEditingClock] = useState<ClockConfig | undefined>(undefined);
    const [isEditorOpen, setIsEditorOpen] = useState(false);

    // Refs for grid scaling
    const gridItemRef = useRef<HTMLDivElement>(null);
    const [gridScale, setGridScale] = useState(0.3);

    useEffect(() => {
        setClocks(DataService.getClockConfigs());
    }, [isEditorOpen]);

    useEffect(() => {
        const updateScale = () => {
            if (gridItemRef.current) {
                // Calculate scale based on container width vs base 1280
                const width = gridItemRef.current.offsetWidth;
                setGridScale(width / 1280);
            }
        };
        setTimeout(updateScale, 100);
        window.addEventListener('resize', updateScale);
        return () => window.removeEventListener('resize', updateScale);
    }, [clocks]);

    const handleCreate = () => {
        setEditingClock(undefined);
        setIsEditorOpen(true);
    };

    const handleEdit = (clock: ClockConfig) => {
        setEditingClock(clock);
        setIsEditorOpen(true);
    };

    const handleDelete = (id: string) => {
        DataService.deleteClockConfig(id);
        setClocks(DataService.getClockConfigs());
    };

    const handleSave = (config: ClockConfig) => {
        DataService.saveClockConfig(config);
        setIsEditorOpen(false);
    };

    const mockData = {
        tournament_name: "Mock Tournament",
        tournament_desc: "Daily Deepstack",
        timer: "20:00",
        blind_countdown: "20:00",
        blind_level: "100/200",
        next_blinds: "200/400",
        ante: "200",
        next_ante: "400",
        players_count: "45 / 100",
        entries_count: "45",
        total_chips: "900,000",
        avg_stack: "20,000",
        payout_total: "$4,500",
        next_break: "1h 40m",
        starting_chips: "20,000",
        rebuy_limit: "1 Rebuy",
        current_time: "12:00 PM",
        current_date: "10/24/2023",
        start_time: "11:00 AM",
        start_date: "10/24/2023",
        est_end_time: "06:00 PM"
    };

    if (isEditorOpen) {
        return <ClockEditor 
            initialConfig={editingClock} 
            onSave={handleSave} 
            onClose={() => setIsEditorOpen(false)} 
        />;
    }

    return (
        <>
          <div className="absolute top-0 right-0 -mt-20"> 
               <button 
                  onClick={handleCreate}
                  className={`${THEME.buttonPrimary} px-6 py-3 rounded-full font-semibold shadow-lg shadow-green-500/20 flex items-center gap-2 transition-transform hover:scale-105 active:scale-95`}
              >
                  <Plus size={20} strokeWidth={2.5} />
                  {t('clocks.btn.new')}
              </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2 mt-4">
              {clocks.map((clock, index) => (
                  <div key={clock.id} className={`${THEME.card} border ${THEME.border} rounded-3xl overflow-hidden group hover:border-brand-green/30 transition-all shadow-lg`}>
                      <div 
                          ref={index === 0 ? gridItemRef : null} // Measure first item
                          className="aspect-video w-full relative bg-[#000] overflow-hidden"
                      >
                          {/* Preview Render */}
                          <ClockDisplay 
                             config={clock}
                             data={mockData}
                             scale={gridScale}
                          />

                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm z-10">
                              <button 
                                  onClick={() => handleEdit(clock)}
                                  className="p-3 bg-white text-black rounded-full hover:scale-110 transition-transform font-bold"
                                  title={t('common.edit')}
                              >
                                  <Edit2 size={20} />
                              </button>
                          </div>
                      </div>
                      <div className="p-5 flex justify-between items-center relative z-20 bg-[#171717]">
                          <div>
                              <h3 className="text-lg font-bold text-white">{clock.name}</h3>
                              <p className="text-xs text-gray-500">{clock.fields.length} {t('clocks.card.activeWidgets')}</p>
                          </div>
                          <DeleteWithConfirmation 
                              onConfirm={() => handleDelete(clock.id)}
                              itemName={clock.name}
                              title={t('clocks.deleteTitle')}
                              className="text-gray-600 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-[#222]"
                          />
                      </div>
                  </div>
              ))}
              
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
        </>
    );
};

export default ClockLayouts;