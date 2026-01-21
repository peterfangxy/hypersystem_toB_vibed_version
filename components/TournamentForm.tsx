
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
  MonitorPlay
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
  // Get first level for preview
  const previewLevel = selectedStruct?.items.find(i => i.type === 'Level');

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
            <div className="space-y-4 pt-2 border-t border-[#222]">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2 mt-4">
                <Trophy size={14} /> Structure & Payouts
                </h3>
                
                <div className="grid grid-cols-3 gap-4">
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
                                    <span className="text-white">{previewLevel ? `${previewLevel.smallBlind}/${previewLevel.bigBlind}` : 'N/A'}</span>
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

                    {/* Clock Config Selector */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Clock Layout</label>
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

                        {/* Preview info for Clock */}
                        {formData.clockConfigId && (
                            <div className="bg-[#1A1A1A] border border-[#333] rounded-xl p-3 text-sm animate-in fade-in slide-in-from-top-2">
                                {(() => {
                                    const c = clockConfigs.find(config => config.id === formData.clockConfigId);
                                    if (!c) return null;
                                    return (
                                        <div className="flex items-start gap-3">
                                            <div className="mt-1 text-blue-400">
                                                <MonitorPlay size={16} />
                                            </div>
                                            <div className="w-full">
                                                <div className="font-bold text-white text-xs uppercase truncate">{c.name}</div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <div 
                                                        className="w-3 h-3 rounded-full border border-gray-600" 
                                                        style={{ backgroundColor: c.backgroundColor }}
                                                        title="Background Color"
                                                    />
                                                    <div className="text-gray-400 text-[10px]">{c.fields.length} Widgets</div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                        )}
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
