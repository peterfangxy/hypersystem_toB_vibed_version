
import React, { useState, useEffect, useRef } from 'react';
import { 
  Layers, 
  DollarSign, 
  Trophy, 
  Armchair, 
  Check, 
  ChevronDown, 
  Cpu, 
  Table, 
  Sparkles, 
  MonitorPlay
} from 'lucide-react';
import { Tournament, PayoutModel, TournamentStatus, PokerTable, TournamentStructure, PayoutStructure, ClockConfig } from '../../types';
import * as DataService from '../../services/dataService';
import { THEME } from '../../theme';
import { Modal } from '../ui/Modal';
import NumberInput from '../ui/NumberInput';
import { useLanguage } from '../../contexts/LanguageContext';
import ClockDisplay from '../clock/ClockDisplay';

interface TournamentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (tournament: Tournament) => void;
  initialData?: Tournament;
  isTemplateMode?: boolean;
}

const TournamentForm: React.FC<TournamentFormProps> = ({ isOpen, onClose, onSubmit, initialData, isTemplateMode = false }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<Partial<Tournament>>({
    name: '',
    startDate: new Date().toISOString().split('T')[0],
    startTime: '19:00',
    estimatedDurationMinutes: 240,
    buyIn: 100,
    fee: 10,
    maxPlayers: 50,
    rebuyLimit: 1,
    lastRebuyLevel: 6,
    startingChips: 10000,
    startingBlinds: '100/200',
    blindLevelMinutes: 20,
    blindIncreasePercent: 20,
    payoutModel: PayoutModel.FIXED,
    status: 'Scheduled',
    description: '',
    tableIds: [],
    structureId: '',
    payoutStructureId: '',
    clockConfigId: ''
  });

  const [availableTables, setAvailableTables] = useState<PokerTable[]>([]);
  const [structures, setStructures] = useState<TournamentStructure[]>([]);
  const [payoutStructures, setPayoutStructures] = useState<PayoutStructure[]>([]);
  const [clockConfigs, setClockConfigs] = useState<ClockConfig[]>([]);
  const [templates, setTemplates] = useState<Tournament[]>([]);
  
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const isReadOnly = !isTemplateMode && initialData && (initialData.status === 'Completed' || initialData.status === 'Cancelled');

  // Preview Scaling Refs
  const previewRef = useRef<HTMLDivElement>(null);
  const [previewScale, setPreviewScale] = useState(1);

  useEffect(() => {
    if (isOpen) {
      setAvailableTables(DataService.getTables());
      setStructures(DataService.getTournamentStructures());
      setPayoutStructures(DataService.getPayoutStructures());
      setClockConfigs(DataService.getClockConfigs());
      setTemplates(DataService.getTournamentTemplates());

      if (initialData) {
        setFormData(initialData);
      } else {
        const today = new Date().toISOString().split('T')[0];
        setFormData({
          name: '',
          startDate: today,
          startTime: '19:00',
          estimatedDurationMinutes: 240,
          buyIn: 100,
          fee: 10,
          maxPlayers: 50,
          rebuyLimit: 1,
          lastRebuyLevel: 6,
          startingChips: 10000,
          startingBlinds: '100/200',
          blindLevelMinutes: 20,
          blindIncreasePercent: 20,
          payoutModel: PayoutModel.FIXED,
          status: 'Scheduled',
          description: '',
          tableIds: [],
          structureId: '',
          payoutStructureId: '',
          clockConfigId: DataService.getClockConfigs().find(c => c.isDefault)?.id || ''
        });
      }
    }
  }, [initialData, isOpen, isTemplateMode]);

  useEffect(() => {
      // Calculate preview scale based on container width
      const updateScale = () => {
          if (previewRef.current) {
              const width = previewRef.current.offsetWidth;
              // Assuming 1280px is the standard "design" width for the clock editor canvas
              setPreviewScale(width / 1280); 
          }
      };
      
      if (isOpen) {
          setTimeout(updateScale, 100);
          window.addEventListener('resize', updateScale);
      }
      return () => window.removeEventListener('resize', updateScale);
  }, [isOpen]);

  useEffect(() => {
      if (isOpen) {
          setIsPreviewLoading(true);
          const timer = setTimeout(() => setIsPreviewLoading(false), 600);
          return () => clearTimeout(timer);
      }
  }, [
      formData.clockConfigId, 
      formData.structureId, 
      formData.startingChips, 
      formData.startingBlinds,
      formData.name,
      formData.description,
      formData.maxPlayers,
      isOpen
  ]);

  const toggleTable = (tableId: string) => {
    if (isReadOnly) return;
    const currentIds = formData.tableIds || [];
    let newIds;
    if (currentIds.includes(tableId)) {
        newIds = currentIds.filter(id => id !== tableId);
    } else {
        newIds = [...currentIds, tableId];
    }
    setFormData({ ...formData, tableIds: newIds });
  };

  const handleStructureChange = (structId: string) => {
      if (!structId) {
          setFormData(prev => ({ ...prev, structureId: '' }));
          return;
      }
      const struct = structures.find(s => s.id === structId);
      if (struct) {
          const firstLevel = struct.items.find(i => i.type === 'Level');
          const blindsStr = firstLevel ? `${firstLevel.smallBlind}/${firstLevel.bigBlind}` : '100/200';
          const defaultDuration = firstLevel ? firstLevel.duration : 20;
          
          setFormData(prev => ({
              ...prev,
              structureId: structId,
              startingChips: struct.startingChips,
              blindLevelMinutes: defaultDuration,
              startingBlinds: blindsStr,
              rebuyLimit: struct.rebuyLimit,
              lastRebuyLevel: struct.lastRebuyLevel
          }));
      }
  };

  const handlePayoutStructureChange = (structId: string) => {
      if (!structId) {
           setFormData(prev => ({ ...prev, payoutStructureId: '' }));
           return;
      }
      const struct = payoutStructures.find(s => s.id === structId);
      if (struct) {
           setFormData(prev => ({
               ...prev,
               payoutStructureId: structId,
               payoutModel: struct.name.includes('ICM') ? PayoutModel.ICM : 
                            struct.name.includes('Chip EV') ? PayoutModel.CHIP_EV : 
                            PayoutModel.FIXED
           }));
      }
  };

  const handleApplyTemplate = (templateId: string) => {
      const template = templates.find(t => t.id === templateId);
      if (!template) return;

      setFormData(prev => ({
          ...prev,
          name: template.name,
          estimatedDurationMinutes: template.estimatedDurationMinutes,
          buyIn: template.buyIn,
          fee: template.fee,
          maxPlayers: template.maxPlayers,
          startingChips: template.startingChips,
          startingBlinds: template.startingBlinds,
          blindLevelMinutes: template.blindLevelMinutes,
          blindIncreasePercent: template.blindIncreasePercent,
          rebuyLimit: template.rebuyLimit,
          lastRebuyLevel: template.lastRebuyLevel,
          payoutModel: template.payoutModel,
          description: template.description || '',
          structureId: template.structureId,
          payoutStructureId: template.payoutStructureId,
          clockConfigId: template.clockConfigId,
          tableIds: template.tableIds || []
      }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTournament: Tournament = {
      id: initialData?.id || crypto.randomUUID(),
      createdAt: initialData?.createdAt || new Date().toISOString(),
      endTime: undefined, 
      ...formData as Tournament
    };
    onSubmit(newTournament);
    onClose();
  };

  const selectedStruct = structures.find(s => s.id === formData.structureId);
  const levels = selectedStruct?.items.filter(i => i.type === 'Level') || [];
  const level1 = levels[0];

  const getModalTitle = () => {
    if (initialData) {
        const mainTitle = isReadOnly ? 'Tournament Details (Read Only)' : (isTemplateMode ? t('tournaments.form.titleEditTemplate') : t('tournaments.form.titleEdit'));
        return (
            <div>
                <h2 className="text-xl font-bold text-white">{mainTitle}</h2>
                {!isTemplateMode && initialData.id && (
                    <p className="text-xs text-gray-500 font-mono mt-1 uppercase tracking-wider">ID: {initialData.id}</p>
                )}
            </div>
        );
    }
    return isTemplateMode ? t('tournaments.form.titleNewTemplate') : t('tournaments.form.titleNew');
  };

  const getClockData = () => {
      // Find Next Level from Structure
      let currentLevel = { sb: 100, bb: 200, ante: 0 };
      let nextLevel = { sb: 200, bb: 400, ante: 0 }; 

      if (selectedStruct && selectedStruct.items) {
          const lvls = selectedStruct.items.filter(i => i.type === 'Level');
          if (lvls.length > 0) {
              const l = lvls[0];
              currentLevel = { 
                  sb: l.smallBlind || 0, 
                  bb: l.bigBlind || 0, 
                  ante: l.ante || 0 
              };
          }
          if (lvls.length > 1) {
              const l = lvls[1];
              nextLevel = { 
                  sb: l.smallBlind || 0, 
                  bb: l.bigBlind || 0, 
                  ante: l.ante || 0 
              };
          }
      } else if (formData.startingBlinds) {
          // Fallback if no structure selected, try to parse Blinds string
          const parts = formData.startingBlinds.split('/');
          if (parts.length === 2) {
              currentLevel.sb = parseInt(parts[0]) || 100;
              currentLevel.bb = parseInt(parts[1]) || 200;
              // Assuming 0 ante if manually entered without structure
              currentLevel.ante = 0; 
          }
      }

      // Dynamic Mock Data
      const maxP = formData.maxPlayers || 50;
      const currentEntries = 0; 
      
      const startingChips = formData.startingChips || 10000;
      const buyIn = formData.buyIn || 100;

      return {
          tournament_name: formData.name || 'Tournament Name',
          tournament_desc: formData.description || 'Event Description',
          timer: '12:34',
          blind_countdown: '12:34',
          blind_level: `${currentLevel.sb}/${currentLevel.bb}`,
          next_blinds: `${nextLevel.sb}/${nextLevel.bb}`,
          ante: currentLevel.ante > 0 ? currentLevel.ante.toLocaleString() : '0',
          next_ante: nextLevel.ante > 0 ? nextLevel.ante.toLocaleString() : '0',
          starting_chips: startingChips.toLocaleString(),
          rebuy_limit: formData.rebuyLimit ? `${formData.rebuyLimit}` : 'Freezeout',
          
          players_count: `${currentEntries} / ${maxP}`,
          entries_count: `${currentEntries}`,
          total_chips: (currentEntries * startingChips).toLocaleString(),
          avg_stack: startingChips.toLocaleString(),
          payout_total: `$${(currentEntries * buyIn).toLocaleString()}`,
          
          next_break: '15m',
          current_time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}),
          current_date: new Date().toLocaleDateString(),
          start_time: formData.startTime || '19:00',
          start_date: formData.startDate || new Date().toLocaleDateString(),
          est_end_time: '23:00'
      };
  };

  const selectedClockConfig = clockConfigs.find(c => c.id === formData.clockConfigId);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={getModalTitle()}
      size="2xl"
    >
      <form onSubmit={handleSubmit} className="p-6 overflow-y-auto">
        
        {!isTemplateMode && !initialData && templates.length > 0 && (
            <div className="mb-8 bg-[#1A1A1A] border border-[#333] p-4 rounded-xl flex items-center justify-between group hover:border-brand-green/30 transition-colors shadow-lg shadow-black/20">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-green/10 flex items-center justify-center text-brand-green border border-brand-green/20">
                        <Sparkles size={20} />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-white">{t('tournaments.form.quickStart')}</h4>
                        <p className="text-xs text-gray-400">{t('tournaments.form.importTemplate')}</p>
                    </div>
                </div>
                <div className="relative">
                    <select
                        className="bg-[#111] border border-[#333] text-white text-sm rounded-lg pl-3 pr-8 py-2 outline-none focus:border-brand-green transition-all appearance-none cursor-pointer hover:bg-[#222]"
                        onChange={(e) => handleApplyTemplate(e.target.value)}
                        defaultValue=""
                    >
                        <option value="" disabled>{t('tournaments.form.selectTemplate')}</option>
                        {templates.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                    </select>
                     <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={14} />
                </div>
            </div>
        )}

        <fieldset disabled={isReadOnly} className="space-y-8 border-none p-0 m-0 min-w-0 group-disabled:opacity-70">
            {/* General Info */}
            <div className="space-y-4">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <Layers size={14} /> {t('tournaments.form.generalInfo')}
                </h3>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-300">
                      {isTemplateMode ? t('tournaments.form.templateName') : t('tournaments.form.name')}
                  </label>
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className={`w-full ${THEME.input} rounded-xl px-4 py-3 outline-none transition-all placeholder:text-gray-600 disabled:opacity-60 disabled:cursor-not-allowed`}
                    placeholder={isTemplateMode ? "e.g. Weekly Deepstack Template" : "e.g. Saturday Night Fever"}
                  />
                </div>
                
                <div className="grid grid-cols-4 gap-4">
                    {!isTemplateMode && (
                        <>
                            <div className="col-span-1 space-y-1">
                                <label className="text-sm font-medium text-gray-300">{t('tournaments.form.date')}</label>
                                <input 
                                    required
                                    type="date" 
                                    value={formData.startDate}
                                    onChange={e => setFormData({...formData, startDate: e.target.value})}
                                    className={`w-full ${THEME.input} rounded-xl px-4 py-3 outline-none transition-all [color-scheme:dark] disabled:opacity-60 disabled:cursor-not-allowed`}
                                />
                            </div>
                            <div className="col-span-1 space-y-1">
                                <label className="text-sm font-medium text-gray-300">{t('tournaments.form.time')}</label>
                                <input 
                                    required
                                    type="time" 
                                    value={formData.startTime}
                                    onChange={e => setFormData({...formData, startTime: e.target.value})}
                                    className={`w-full ${THEME.input} rounded-xl px-4 py-3 outline-none transition-all [color-scheme:dark] disabled:opacity-60 disabled:cursor-not-allowed`}
                                />
                            </div>
                        </>
                    )}
                    
                    <div className={`${isTemplateMode ? 'col-span-4' : 'col-span-1'} space-y-1`}>
                        <label className="text-sm font-medium text-gray-300">{t('tournaments.form.estDuration')}</label>
                        <NumberInput
                            value={formData.estimatedDurationMinutes}
                            onChange={(val) => setFormData({...formData, estimatedDurationMinutes: val})}
                            min={30}
                            step={30}
                            suffix="min"
                            disabled={isReadOnly}
                            size="lg"
                        />
                    </div>
                    
                    {!isTemplateMode && (
                        <div className="col-span-1 space-y-1">
                            <label className="text-sm font-medium text-gray-300">{t('tournaments.form.status')}</label>
                            <select 
                                value={formData.status}
                                onChange={e => setFormData({...formData, status: e.target.value as TournamentStatus})}
                                className={`w-full ${THEME.input} rounded-xl px-4 py-3 outline-none appearance-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed`}
                            >
                                <option value="Scheduled">Scheduled</option>
                                <option value="Registration">Registration</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                        </div>
                    )}
                </div>
                
                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-300">{t('tournaments.form.description')}</label>
                    <textarea 
                        rows={2}
                        value={formData.description}
                        onChange={e => setFormData({...formData, description: e.target.value})}
                        className={`w-full ${THEME.input} rounded-xl px-4 py-3 outline-none resize-none disabled:opacity-60 disabled:cursor-not-allowed`}
                        placeholder="Event details..."
                    />
                </div>
            </div>

            {/* Structure & Payout Selection */}
            <div className="space-y-6 pt-2 border-t border-[#222]">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2 mt-4">
                <Trophy size={14} /> {t('tournaments.form.structurePayouts')}
                </h3>
                
                <div className="grid grid-cols-2 gap-6">
                    {/* Structure Selector */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">{t('tournaments.form.structure')}</label>
                        <div className="relative">
                            <select
                                value={formData.structureId || ''}
                                onChange={(e) => handleStructureChange(e.target.value)}
                                className={`w-full ${THEME.input} rounded-xl pl-4 pr-10 py-3 outline-none appearance-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed text-sm`}
                            >
                                <option value="">{t('tournaments.form.selectStructure')}</option>
                                {structures.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
                        </div>
                        
                        {selectedStruct && (
                            <div className="bg-[#1A1A1A] border border-[#333] rounded-xl p-3 flex flex-col justify-between text-xs animate-in fade-in slide-in-from-top-2 gap-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Chips:</span>
                                    <span className="font-mono text-brand-green">{selectedStruct.startingChips.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Blinds:</span>
                                    <span className="text-white">{level1 ? `${level1.smallBlind}/${level1.bigBlind}` : 'N/A'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Rebuys:</span>
                                    <span className="text-white">{selectedStruct.rebuyLimit === 0 ? 'Freezeout' : `${selectedStruct.rebuyLimit} Limit`}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Payout Selector */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">{t('tournaments.form.payoutModel')}</label>
                        <div className="relative">
                            <select
                                value={formData.payoutStructureId || ''}
                                onChange={(e) => handlePayoutStructureChange(e.target.value)}
                                className={`w-full ${THEME.input} rounded-xl pl-4 pr-10 py-3 outline-none appearance-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed text-sm`}
                            >
                                <option value="">{t('tournaments.form.selectPayout')}</option>
                                {payoutStructures.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
                        </div>

                        {formData.payoutStructureId && (
                            <div className="bg-[#1A1A1A] border border-[#333] rounded-xl p-3 text-sm animate-in fade-in slide-in-from-top-2">
                                {(() => {
                                    const p = payoutStructures.find(ps => ps.id === formData.payoutStructureId);
                                    if (!p) return null;
                                    return (
                                        <div className="flex items-start gap-3">
                                            <div className="mt-1 text-brand-green">
                                                {p.type === 'Algorithm' ? <Cpu size={16} /> : <Table size={16} />}
                                            </div>
                                            <div>
                                                <div className="font-bold text-white text-xs uppercase">{p.type}</div>
                                                <div className="text-gray-400 text-xs mt-0.5 line-clamp-2">{p.description || 'No description'}</div>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-[#1A1A1A] border border-[#333] rounded-xl p-4">
                    <div className="flex justify-between items-center mb-4">
                        <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                            <MonitorPlay size={16} className="text-brand-green"/>
                            {t('tournaments.form.clockLayout')}
                        </label>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Left: Selector */}
                        <div className="md:col-span-1 space-y-2">
                             <label className="text-xs text-gray-500 font-bold uppercase">{t('tournaments.form.selectTheme')}</label>
                             <div className="relative">
                                <select
                                    value={formData.clockConfigId || ''}
                                    onChange={(e) => setFormData({...formData, clockConfigId: e.target.value})}
                                    className={`w-full ${THEME.input} rounded-xl pl-4 pr-10 py-3 outline-none appearance-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed text-sm`}
                                >
                                    <option value="">Select a layout...</option>
                                    {clockConfigs.map(c => (
                                        <option key={c.id} value={c.id}>{c.name} {c.isDefault ? '(Default)' : ''}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
                            </div>
                            
                            {selectedClockConfig?.description && (
                                <div className="mt-4 p-3 bg-[#222] rounded-xl border border-[#333]">
                                    <p className="text-xs text-gray-400 leading-relaxed">{selectedClockConfig.description}</p>
                                </div>
                            )}
                        </div>

                        {/* Right: Visual Preview */}
                        <div className="md:col-span-2">
                             <label className="text-xs text-gray-500 font-bold uppercase mb-2 block">{t('tournaments.form.preview')}</label>
                             <div 
                                ref={previewRef}
                                className="aspect-video w-full rounded-lg border border-[#333] overflow-hidden relative shadow-inner bg-black"
                             >
                                 {selectedClockConfig ? (
                                     <ClockDisplay 
                                        config={selectedClockConfig} 
                                        data={getClockData()} 
                                        scale={previewScale} 
                                     />
                                 ) : (
                                     <div className="w-full h-full flex flex-col items-center justify-center text-gray-600 bg-[#111]">
                                        <MonitorPlay size={32} className="opacity-20 mb-2" />
                                        <span className="text-xs">No layout selected</span>
                                    </div>
                                 )}
                             </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Financials (Inputs) using NumberInput */}
            <div className="space-y-4 pt-2 border-t border-[#222]">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2 mt-4">
                <DollarSign size={14} /> {t('tournaments.form.financials')}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-300">{t('tournaments.form.buyIn')}</label>
                            <NumberInput 
                                value={formData.buyIn}
                                onChange={(val) => setFormData({...formData, buyIn: val})}
                                min={0}
                                prefix="$"
                                size="lg"
                                disabled={isReadOnly}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-300">{t('tournaments.form.fee')}</label>
                            <NumberInput 
                                value={formData.fee}
                                onChange={(val) => setFormData({...formData, fee: val})}
                                min={0}
                                prefix="$"
                                size="lg"
                                disabled={isReadOnly}
                            />
                        </div>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-300">{t('tournaments.form.maxPlayers')}</label>
                        <NumberInput 
                            value={formData.maxPlayers}
                            onChange={(val) => setFormData({...formData, maxPlayers: val})}
                            min={2}
                            step={1}
                            enableScroll={true}
                            size="lg"
                            disabled={isReadOnly}
                        />
                    </div>
                </div>
            </div>

            {/* Table Assignment - HIDDEN IN TEMPLATE MODE */}
            {!isTemplateMode && (
                <div className="space-y-4 pt-2 border-t border-[#222]">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2 mt-4">
                        <Armchair size={14} /> {t('tournaments.form.assignTables')}
                    </h3>
                    {availableTables.length === 0 ? (
                        <p className="text-sm text-gray-500 italic">No tables created yet. Go to Tables view to add some.</p>
                    ) : (
                        <div className="grid grid-cols-3 gap-3">
                            {availableTables.map(table => {
                                const isSelected = formData.tableIds?.includes(table.id);
                                return (
                                    <button
                                        type="button"
                                        key={table.id}
                                        disabled={isReadOnly}
                                        onClick={() => toggleTable(table.id)}
                                        className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                                            isSelected 
                                            ? 'bg-brand-green/20 border-brand-green text-white' 
                                            : 'bg-[#1A1A1A] border-[#333] text-gray-400 hover:border-gray-500 hover:text-gray-300'
                                        } ${isReadOnly ? 'opacity-60 cursor-not-allowed hover:border-[#333] hover:text-gray-400' : ''}`}
                                    >
                                        <div className="flex flex-col items-start">
                                            <span className={`text-sm font-bold ${isSelected ? 'text-brand-green' : ''}`}>{table.name}</span>
                                            <span className="text-xs opacity-70">{table.capacity} {t('tables.seats')}</span>
                                        </div>
                                        {isSelected && <Check size={16} className="text-brand-green" />}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </fieldset>

        {!isReadOnly ? (
             <div className="pt-4">
                <button 
                    type="submit" 
                    className={`w-full ${THEME.buttonPrimary} font-bold text-lg py-4 rounded-xl transition-transform active:scale-[0.98]`}
                >
                    {initialData ? t('tournaments.form.saveChanges') : (isTemplateMode ? t('tournaments.form.createTemplate') : t('tournaments.form.create'))}
                </button>
            </div>
        ) : (
            <div className="pt-4 flex justify-end">
                <span className="text-gray-500 text-sm italic flex items-center gap-2">
                    {t('tournaments.form.readOnly').replace('{status}', initialData?.status?.toLowerCase() || '')}
                </span>
            </div>
        )}
      </form>
    </Modal>
  );
};

export default TournamentForm;
