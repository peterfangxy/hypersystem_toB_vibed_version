
import React, { useState, useEffect } from 'react';
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
  MonitorPlay,
  Loader2
} from 'lucide-react';
import { Tournament, PayoutModel, TournamentStatus, PokerTable, TournamentStructure, PayoutStructure, ClockConfig } from '../types';
import * as DataService from '../services/dataService';
import { THEME } from '../theme';
import { Modal } from './Modal';

interface TournamentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (tournament: Tournament) => void;
  initialData?: Tournament;
  isTemplateMode?: boolean;
}

const TournamentForm: React.FC<TournamentFormProps> = ({ isOpen, onClose, onSubmit, initialData, isTemplateMode = false }) => {
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
  
  // Preview loading state
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  // Check if form should be read-only
  const isReadOnly = !isTemplateMode && initialData && (initialData.status === 'Completed' || initialData.status === 'Cancelled');

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
          // Defaults that will be overwritten by structure selection usually
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

  // Effect to trigger loading animation on relevant changes
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
          // Snapshot values for display consistency in legacy views
          // Use first level for snapshot data
          const firstLevel = struct.items.find(i => i.type === 'Level');
          const blindsStr = firstLevel ? `${firstLevel.smallBlind}/${firstLevel.bigBlind}` : '100/200';
          const defaultDuration = firstLevel ? firstLevel.duration : 20;
          
          setFormData(prev => ({
              ...prev,
              structureId: structId,
              startingChips: struct.startingChips,
              blindLevelMinutes: defaultDuration, // Fallback/Reference duration
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
               // If it's a known algorithm, update the legacy enum for compatibility
               payoutModel: struct.name.includes('ICM') ? PayoutModel.ICM : 
                            struct.name.includes('Chip EV') ? PayoutModel.CHIP_EV : 
                            PayoutModel.FIXED
           }));
      }
  };

  const handleApplyTemplate = (templateId: string) => {
      const template = templates.find(t => t.id === templateId);
      if (!template) return;

      // Merge template fields into current form data
      // We explicitly preserve Date, Time, Status from the current form (or defaults)
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
          // Optional: Import table assignments if the template has them? 
          // Usually templates are structure-focused, but let's allow it.
          tableIds: template.tableIds || []
      }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTournament: Tournament = {
      id: initialData?.id || crypto.randomUUID(),
      endTime: undefined, 
      ...formData as Tournament
    };
    onSubmit(newTournament);
    onClose();
  };

  const selectedStruct = structures.find(s => s.id === formData.structureId);
  // Get levels for preview logic
  const levels = selectedStruct?.items.filter(i => i.type === 'Level') || [];
  const level1 = levels[0];
  const level2 = levels[1];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? (isReadOnly ? 'Tournament Details (Read Only)' : isTemplateMode ? 'Edit Template' : 'Edit Tournament') : (isTemplateMode ? 'New Template' : 'New Tournament')}
      size="2xl"
    >
      <form onSubmit={handleSubmit} className="p-6 overflow-y-auto">
        
        {/* Import Template Section - Only visible when creating a new Tournament */}
        {!isTemplateMode && !initialData && templates.length > 0 && (
            <div className="mb-8 bg-[#1A1A1A] border border-[#333] p-4 rounded-xl flex items-center justify-between group hover:border-brand-green/30 transition-colors shadow-lg shadow-black/20">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-green/10 flex items-center justify-center text-brand-green border border-brand-green/20">
                        <Sparkles size={20} />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-white">Quick Start</h4>
                        <p className="text-xs text-gray-400">Import settings from a template</p>
                    </div>
                </div>
                <div className="relative">
                    <select
                        className="bg-[#111] border border-[#333] text-white text-sm rounded-lg pl-3 pr-8 py-2 outline-none focus:border-brand-green transition-all appearance-none cursor-pointer hover:bg-[#222]"
                        onChange={(e) => handleApplyTemplate(e.target.value)}
                        defaultValue=""
                    >
                        <option value="" disabled>Select a template...</option>
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
                <Layers size={14} /> General Information
                </h3>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-300">
                      {isTemplateMode ? 'Template Name' : 'Tournament Name'}
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
                                <label className="text-sm font-medium text-gray-300">Date</label>
                                <input 
                                    required
                                    type="date" 
                                    value={formData.startDate}
                                    onChange={e => setFormData({...formData, startDate: e.target.value})}
                                    className={`w-full ${THEME.input} rounded-xl px-4 py-3 outline-none transition-all [color-scheme:dark] disabled:opacity-60 disabled:cursor-not-allowed`}
                                />
                            </div>
                            <div className="col-span-1 space-y-1">
                                <label className="text-sm font-medium text-gray-300">Time</label>
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
                        <label className="text-sm font-medium text-gray-300">Est. Duration (Min)</label>
                        <input 
                            required
                            type="number"
                            min="30"
                            step="30"
                            value={formData.estimatedDurationMinutes}
                            onChange={e => setFormData({...formData, estimatedDurationMinutes: parseInt(e.target.value)})}
                            className={`w-full ${THEME.input} rounded-xl px-4 py-3 outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed`}
                        />
                    </div>
                    
                    {!isTemplateMode && (
                        <div className="col-span-1 space-y-1">
                            <label className="text-sm font-medium text-gray-300">Status</label>
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
                    <label className="text-sm font-medium text-gray-300">Description</label>
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
                <Trophy size={14} /> Structure & Payouts
                </h3>
                
                <div className="grid grid-cols-2 gap-6">
                    {/* Tournament Structure Selector */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Tournament Structure</label>
                        <div className="relative">
                            <select
                                value={formData.structureId || ''}
                                onChange={(e) => handleStructureChange(e.target.value)}
                                className={`w-full ${THEME.input} rounded-xl pl-4 pr-10 py-3 outline-none appearance-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed text-sm`}
                            >
                                <option value="">Select a structure...</option>
                                {structures.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
                        </div>
                        
                        {/* Preview Card */}
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

                    {/* Payout Model Selector */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Payout Model</label>
                        <div className="relative">
                            <select
                                value={formData.payoutStructureId || ''}
                                onChange={(e) => handlePayoutStructureChange(e.target.value)}
                                className={`w-full ${THEME.input} rounded-xl pl-4 pr-10 py-3 outline-none appearance-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed text-sm`}
                            >
                                <option value="">Select a payout model...</option>
                                {payoutStructures.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
                        </div>

                        {/* Preview info for Payout */}
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

                {/* Clock Config Selector Section */}
                <div className="bg-[#1A1A1A] border border-[#333] rounded-xl p-4">
                    <div className="flex justify-between items-center mb-4">
                        <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                            <MonitorPlay size={16} className="text-brand-green"/>
                            Tournament Clock Layout
                        </label>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Left: Selector */}
                        <div className="md:col-span-1 space-y-2">
                             <label className="text-xs text-gray-500 font-bold uppercase">Select Theme</label>
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
                            
                            {/* Clock Info Description */}
                            {formData.clockConfigId && (
                                <div className="text-xs text-gray-500 mt-2 p-3 bg-[#222] rounded-lg border border-[#333] italic">
                                    {(() => {
                                        const c = clockConfigs.find(config => config.id === formData.clockConfigId);
                                        return c?.description ? c.description : `${c?.fields.length || 0} active widgets configured.`;
                                    })()}
                                </div>
                            )}
                        </div>

                        {/* Right: Visual Preview */}
                        <div className="md:col-span-2">
                             <label className="text-xs text-gray-500 font-bold uppercase mb-2 block">Live Preview</label>
                             {formData.clockConfigId ? (
                                 <div className="aspect-video w-full rounded-lg border border-[#333] overflow-hidden relative shadow-inner" style={{backgroundColor: clockConfigs.find(c => c.id === formData.clockConfigId)?.backgroundColor || '#000'}}>
                                     
                                     {/* Loading Overlay */}
                                     {isPreviewLoading && (
                                         <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200">
                                             <Loader2 className="text-brand-green animate-spin" size={32} />
                                         </div>
                                     )}

                                     {/* Mini render of clock fields */}
                                     {(() => {
                                         const c = clockConfigs.find(config => config.id === formData.clockConfigId);
                                         if (!c) return null;
                                         
                                         return (
                                             <div className="w-full h-full relative transform scale-[0.5] origin-top-left" style={{ width: '200%', height: '200%' }}>
                                                 {c.fields.map(field => {
                                                     // Rendering logic from ClockEditor for preview
                                                     // We map field types to real form data
                                                     let displayValue = '---';
                                                     
                                                     // Data Mappings
                                                     if (field.type === 'tournament_name') displayValue = formData.name || 'Tournament Name';
                                                     else if (field.type === 'tournament_desc') displayValue = formData.description || '';
                                                     else if (field.type === 'timer') displayValue = '20:00';
                                                     else if (field.type === 'blind_countdown') displayValue = '20:00';
                                                     
                                                     // --- BLINDS & ANTES MAPPING ---
                                                     else if (field.type === 'blind_level') {
                                                         displayValue = level1 ? `${level1.smallBlind}/${level1.bigBlind}` : (formData.startingBlinds || '100/200');
                                                     }
                                                     else if (field.type === 'ante') {
                                                         displayValue = level1 ? (level1.ante || 0).toString() : '0';
                                                     }
                                                     else if (field.type === 'next_blinds') {
                                                         displayValue = level2 ? `${level2.smallBlind}/${level2.bigBlind}` : '---';
                                                     }
                                                     else if (field.type === 'next_ante') {
                                                         displayValue = level2 ? (level2.ante || 0).toString() : '---';
                                                     }
                                                     // ------------------------------

                                                     else if (field.type === 'players_count') displayValue = `0 / ${formData.maxPlayers || 50}`;
                                                     else if (field.type === 'entries_count') displayValue = '0';
                                                     else if (field.type === 'total_chips') displayValue = '0'; // Would be entries * startingChips
                                                     else if (field.type === 'avg_stack') displayValue = (formData.startingChips || 0).toLocaleString(); // Initially same as starting chips
                                                     else if (field.type === 'starting_chips') displayValue = (formData.startingChips || 0).toLocaleString();
                                                     else if (field.type === 'rebuy_limit') displayValue = formData.rebuyLimit === 0 ? 'Freezeout' : `${formData.rebuyLimit} Limit`;
                                                     else if (field.type === 'payout_total') displayValue = `$0`;
                                                     else if (field.type === 'start_time') displayValue = formData.startTime || '19:00';
                                                     else if (field.type === 'start_date') displayValue = formData.startDate ? new Date(formData.startDate).toLocaleDateString() : 'Today';
                                                     else if (field.type === 'current_time') displayValue = '12:00';
                                                     
                                                     // Basic style application
                                                     const style: React.CSSProperties = {
                                                         position: 'absolute',
                                                         left: `${field.x}%`,
                                                         top: `${field.y}%`,
                                                         transform: 'translate(-50%, -50%)',
                                                         color: field.color,
                                                         fontSize: `${field.fontSize}px`,
                                                         fontWeight: field.fontWeight,
                                                         textAlign: field.align,
                                                         whiteSpace: 'nowrap'
                                                     };
                                                     
                                                     return (
                                                         <div key={field.id} style={style}>
                                                             {field.showLabel && field.labelText && <div className="text-[0.4em] opacity-70 mb-[0.1em]">{field.labelText}</div>}
                                                             {field.type.startsWith('shape_') ? (
                                                                 <div style={{
                                                                     width: field.width, 
                                                                     height: field.height, 
                                                                     backgroundColor: field.color,
                                                                     border: `${field.borderWidth}px solid ${field.borderColor}`,
                                                                     borderRadius: field.type.includes('circle') ? '50%' : '0'
                                                                 }}/>
                                                             ) : (
                                                                 field.type === 'custom_text' ? field.customText : 
                                                                 field.type === 'line' ? (
                                                                     <div style={{
                                                                         width: field.width,
                                                                         height: field.height,
                                                                         backgroundColor: field.color,
                                                                         borderRadius: '999px'
                                                                     }} />
                                                                 ) :
                                                                 displayValue
                                                             )}
                                                         </div>
                                                     )
                                                 })}
                                             </div>
                                         )
                                     })()}
                                 </div>
                             ) : (
                                 <div className="aspect-video w-full rounded-lg border border-dashed border-[#333] bg-[#111] flex items-center justify-center text-gray-600 text-xs">
                                     No layout selected
                                 </div>
                             )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Financials (Inputs) */}
            <div className="space-y-4 pt-2 border-t border-[#222]">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2 mt-4">
                <DollarSign size={14} /> Financials & Capacity
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-300">Buy-In ($)</label>
                            <input 
                            required
                            type="number" 
                            min="0"
                            value={formData.buyIn}
                            onChange={e => setFormData({...formData, buyIn: parseInt(e.target.value)})}
                            className={`w-full ${THEME.input} rounded-xl px-4 py-3 outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed`}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-300">Rake/Fee ($)</label>
                            <input 
                            required
                            type="number" 
                            min="0"
                            value={formData.fee}
                            onChange={e => setFormData({...formData, fee: parseInt(e.target.value)})}
                            className={`w-full ${THEME.input} rounded-xl px-4 py-3 outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed`}
                            />
                        </div>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-300">Max Players</label>
                        <input 
                        required
                        type="number" 
                        min="2"
                        value={formData.maxPlayers}
                        onChange={e => setFormData({...formData, maxPlayers: parseInt(e.target.value)})}
                        className={`w-full ${THEME.input} rounded-xl px-4 py-3 outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed`}
                        />
                    </div>
                </div>
            </div>

            {/* Table Assignment - HIDDEN IN TEMPLATE MODE */}
            {!isTemplateMode && (
                <div className="space-y-4 pt-2 border-t border-[#222]">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2 mt-4">
                        <Armchair size={14} /> Assign Tables (Optional)
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
                                            <span className="text-xs opacity-70">{table.capacity} Seats</span>
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
                    {initialData ? 'Save Changes' : (isTemplateMode ? 'Create Template' : 'Create Tournament')}
                </button>
            </div>
        ) : (
            <div className="pt-4 flex justify-end">
                <span className="text-gray-500 text-sm italic flex items-center gap-2">
                    This tournament is {initialData?.status?.toLowerCase()} and cannot be edited.
                </span>
            </div>
        )}
      </form>
    </Modal>
  );
};

export default TournamentForm;
