
import React, { useState, useEffect } from 'react';
import { 
    Plus, Trash2, AlertCircle, CheckCircle2, Table, LayoutList, 
    Cpu, Layers, Save, Upload, Download, Copy
} from 'lucide-react';
import { PayoutStructure, PayoutRule, PayoutType, PayoutAllocation } from '../types';
import { THEME } from '../theme';
import { Modal } from './ui/Modal';
import { useLanguage } from '../contexts/LanguageContext';
import { validatePayoutRules } from '../utils/payoutUtils';
import NumberInput from './ui/NumberInput';

interface PayoutModelFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payout: PayoutStructure) => void;
  initialData?: PayoutStructure;
  initialType?: PayoutType; // Kept for legacy compatibility but used to seed first alloc
}

const COLORS = ['#06C167', '#3b82f6', '#eab308', '#ec4899', '#8b5cf6'];

const PayoutModelForm: React.FC<PayoutModelFormProps> = ({ isOpen, onClose, onSubmit, initialData, initialType }) => {
  const { t } = useLanguage();
  
  // Model Level State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [allocations, setAllocations] = useState<PayoutAllocation[]>([]);
  
  // UI State
  const [selectedAllocId, setSelectedAllocId] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Import/Export State
  const [isIOModalOpen, setIsIOModalOpen] = useState(false);
  const [ioMode, setIoMode] = useState<'import' | 'export'>('export');
  const [ioJson, setIoJson] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name);
        setDescription(initialData.description || '');
        setAllocations(JSON.parse(JSON.stringify(initialData.allocations || []))); // Deep copy
        if (initialData.allocations?.length > 0) {
            setSelectedAllocId(initialData.allocations[0].id);
        }
      } else {
        setName('');
        setDescription('');
        // Initialize with one default allocation based on selection or Custom
        const startType = initialType || 'Custom';
        const defaultAlloc: PayoutAllocation = {
            id: crypto.randomUUID(),
            name: 'Split 1',
            percent: 100,
            type: startType,
            color: COLORS[0],
            rules: (startType === 'Custom' || startType === 'ICM') ? [{ minPlayers: 2, maxPlayers: 10, placesPaid: 2, percentages: [65, 35] }] : []
        };
        setAllocations([defaultAlloc]);
        setSelectedAllocId(defaultAlloc.id);
      }
    }
  }, [isOpen, initialData, initialType]);

  // Derived State
  const selectedAllocation = allocations.find(a => a.id === selectedAllocId);
  const totalPercent = allocations.reduce((sum, a) => sum + (a.percent || 0), 0);
  const isTotalValid = Math.abs(totalPercent - 100) < 0.1; // Float tolerance

  // Validation Logic
  useEffect(() => {
      let error: string | null = null;
      if (!name) error = "Name is required";
      else if (!isTotalValid) error = `Total: ${Math.round(totalPercent)}% (Must be 100%)`;
      else {
          // Check internal rules of all Custom/ICM allocations
          for (const alloc of allocations) {
              if ((alloc.type === 'Custom' || alloc.type === 'ICM') && alloc.rules) {
                  const res = validatePayoutRules(alloc.rules, t);
                  if (!res.isValid) {
                      error = `${alloc.name}: ${res.error}`;
                      break;
                  }
              }
          }
      }
      setValidationError(error);
  }, [name, allocations, totalPercent, t]);

  // --- Handlers ---

  const handleAddAllocation = () => {
      if (allocations.length >= 5) return;
      const remaining = Math.max(0, 100 - totalPercent);
      const newAlloc: PayoutAllocation = {
          id: crypto.randomUUID(),
          name: `Split ${allocations.length + 1}`,
          percent: remaining,
          type: 'Custom',
          color: COLORS[allocations.length % COLORS.length],
          rules: [{ minPlayers: 2, maxPlayers: 10, placesPaid: 1, percentages: [100] }]
      };
      setAllocations([...allocations, newAlloc]);
      setSelectedAllocId(newAlloc.id);
  };

  const handleRemoveAllocation = (id: string) => {
      if (allocations.length <= 1) return;
      const newAllocs = allocations.filter(a => a.id !== id);
      setAllocations(newAllocs);
      if (selectedAllocId === id) {
          setSelectedAllocId(newAllocs[0].id);
      }
  };

  const updateAllocation = (id: string, updates: Partial<PayoutAllocation>) => {
      setAllocations(allocations.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const updateRules = (allocId: string, newRules: PayoutRule[]) => {
      updateAllocation(allocId, { rules: newRules });
  };

  // --- Rule Editor Helpers (Targeting selectedAllocation) ---
  const handleAddRule = () => {
      if (!selectedAllocation || !selectedAllocation.rules) return;
      const rules = selectedAllocation.rules;
      let highestMax = 1;
      if (rules.length > 0) {
          highestMax = Math.max(...rules.map(r => r.maxPlayers));
      }
      const newMin = highestMax + 1;
      const newMax = newMin + 9;
      
      updateRules(selectedAllocation.id, [
          ...rules,
          { minPlayers: newMin, maxPlayers: newMax, placesPaid: 1, percentages: [100] }
      ]);
  };

  const updateRuleRow = (ruleIdx: number, field: keyof PayoutRule, value: number | undefined) => {
      if (!selectedAllocation || !selectedAllocation.rules) return;
      
      const safeValue = value ?? 0;
      const newRules = [...selectedAllocation.rules];
      const rule = { ...newRules[ruleIdx], [field]: safeValue };
      
      // Smart Defaults logic
      if (field === 'maxPlayers') {
          const maxLimit = Math.min(10000, safeValue); 
          if (rule.placesPaid > maxLimit) {
              rule.placesPaid = maxLimit;
              rule.percentages = rule.percentages.slice(0, rule.placesPaid);
          }
      }
      if (field === 'placesPaid') {
          let newValue = safeValue;
          const rangeCap = rule.maxPlayers;
          
          // Cap places paid at 50 to prevent UI issues
          if (newValue > 50) newValue = 50;
          
          if (newValue > rangeCap) newValue = rangeCap;
          if (newValue < 1) newValue = 1;
          rule.placesPaid = newValue;
          const diff = newValue - rule.percentages.length;
          if (diff > 0) rule.percentages = [...rule.percentages, ...Array(diff).fill(0)];
          else if (diff < 0) rule.percentages = rule.percentages.slice(0, newValue);
      }

      newRules[ruleIdx] = rule;
      updateRules(selectedAllocation.id, newRules);
  };

  const updatePercentage = (ruleIdx: number, pctIdx: number, value: number | undefined) => {
      if (!selectedAllocation || !selectedAllocation.rules) return;
      const safeValue = value ?? 0;
      const newRules = [...selectedAllocation.rules];
      newRules[ruleIdx].percentages[pctIdx] = safeValue;
      updateRules(selectedAllocation.id, newRules);
  };

  const handleRemoveRule = (ruleIdx: number) => {
      if (!selectedAllocation || !selectedAllocation.rules) return;
      const newRules = [...selectedAllocation.rules];
      newRules.splice(ruleIdx, 1);
      updateRules(selectedAllocation.id, newRules);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const structure: PayoutStructure = {
      id: initialData?.id || crypto.randomUUID(),
      name,
      description,
      allocations
    };
    onSubmit(structure);
    onClose();
  };

  // --- Import/Export Logic ---
  const handleOpenExport = () => {
      const exportData: PayoutStructure = {
          id: initialData?.id || crypto.randomUUID(),
          name,
          description,
          allocations
      };
      setIoJson(JSON.stringify(exportData, null, 2));
      setIoMode('export');
      setCopySuccess(false);
      setIsIOModalOpen(true);
  };

  const handleOpenImport = () => {
      setIoJson('');
      setImportError(null);
      setIoMode('import');
      setIsIOModalOpen(true);
  };

  const handleCopyJson = () => {
      navigator.clipboard.writeText(ioJson);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleConfirmImport = () => {
      try {
          const parsed = JSON.parse(ioJson);
          if (!parsed.allocations || !Array.isArray(parsed.allocations)) {
              throw new Error("Invalid format: missing 'allocations' array.");
          }
          
          setName(parsed.name || '');
          setDescription(parsed.description || '');
          setAllocations(parsed.allocations);
          
          if (parsed.allocations.length > 0) {
              setSelectedAllocId(parsed.allocations[0].id);
          }
          setIsIOModalOpen(false);
      } catch (e) {
          setImportError((e as Error).message);
      }
  };

  const modalHeaderTitle = (
      <div className="flex items-center justify-between w-full">
          <span className="text-xl font-bold text-white">
            {initialData ? 'Edit Payout Model' : 'New Payout Model'}
          </span>
          
          <div className="flex items-center gap-4">
             {/* Validation Status */}
             <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                {validationError ? (
                    <div className="flex items-center gap-2 text-red-400 text-xs font-bold bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20">
                        <AlertCircle size={14} />
                        <span className="max-w-[400px] truncate" title={validationError}>{validationError}</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 text-green-500 text-xs font-bold bg-green-500/10 px-3 py-1.5 rounded-lg border border-green-500/20">
                        <CheckCircle2 size={14} />
                        Valid
                    </div>
                )}
             </div>

             {/* Import/Export Buttons */}
             <div className="flex items-center gap-1 bg-[#222] p-1 rounded-lg border border-[#333]">
                <button 
                    type="button"
                    onClick={handleOpenImport} 
                    className="p-1.5 text-gray-400 hover:text-white hover:bg-[#333] rounded-md transition-colors" 
                    title="Import JSON"
                >
                    <Upload size={14} />
                </button>
                <div className="w-px h-3 bg-[#333]"></div>
                <button 
                    type="button"
                    onClick={handleOpenExport} 
                    className="p-1.5 text-gray-400 hover:text-white hover:bg-[#333] rounded-md transition-colors" 
                    title="Export JSON"
                >
                    <Download size={14} />
                </button>
             </div>
          </div>
      </div>
  );

  return (
    <>
        <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={modalHeaderTitle}
        size="4xl"
        >
        <form onSubmit={handleSubmit} className="flex flex-col h-[85vh] overflow-hidden">
                
                {/* 1. Custom Toolbar (Cleaned up) */}
                <div className="p-4 bg-[#151515] border-b border-[#222] shrink-0 flex items-center justify-between gap-4">
                    
                    <div className="flex-1 flex gap-4 items-center">
                        <div className="space-y-1 w-1/3">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">{t('structures.payoutForm.name')}</label>
                            <input 
                                required
                                type="text" 
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className={`w-full bg-[#111] border border-[#333] rounded-lg px-3 py-1.5 text-white font-bold outline-none focus:border-brand-green transition-colors`}
                                placeholder="e.g. Standard Top 15%"
                            />
                        </div>
                        <div className="space-y-1 flex-1">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">{t('structures.payoutForm.desc')}</label>
                            <input 
                                type="text" 
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                className={`w-full bg-[#111] border border-[#333] rounded-lg px-3 py-1.5 text-gray-300 text-sm outline-none focus:border-brand-green/50 transition-colors`}
                                placeholder="Description..."
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 pl-4 border-l border-[#222]">
                        <button 
                            type="submit"
                            disabled={!!validationError}
                            className={`${THEME.buttonPrimary} px-6 py-2 rounded-lg font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm`}
                        >
                            <Save size={16} />
                            {t('structures.payoutForm.save')}
                        </button>
                    </div>
                </div>

                {/* 2. Main Content Area */}
                <div className="flex-1 flex overflow-hidden">
                    
                    {/* Left: Allocation List */}
                    <div className="w-72 bg-[#1A1A1A] border-r border-[#222] flex flex-col p-3 shrink-0">
                        <div className="flex justify-between items-center mb-3 px-1">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Splits</h3>
                            <button 
                                type="button"
                                onClick={handleAddAllocation}
                                disabled={allocations.length >= 5}
                                className="text-[10px] font-bold text-brand-green bg-[#222] px-2 py-1 rounded border border-[#333] hover:border-brand-green flex items-center gap-1 transition-all disabled:opacity-50"
                            >
                                <Plus size={12} /> Add
                            </button>
                        </div>
                        
                        <div className="space-y-2 overflow-y-auto flex-1">
                            {allocations.map((alloc, idx) => (
                                <div 
                                    key={alloc.id}
                                    onClick={() => setSelectedAllocId(alloc.id)}
                                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3 relative ${
                                        selectedAllocId === alloc.id 
                                        ? 'bg-[#222] border-brand-green text-white shadow-md' 
                                        : 'bg-[#151515] border-[#333] text-gray-400 hover:border-gray-500'
                                    }`}
                                >
                                    <div className="flex flex-col gap-1 w-16 shrink-0" onClick={(e) => e.stopPropagation()}>
                                        <NumberInput 
                                            value={alloc.percent}
                                            onChange={(val) => updateAllocation(alloc.id, { percent: val || 0 })}
                                            min={0}
                                            max={100}
                                            suffix="%"
                                            size="sm"
                                            className="bg-[#111] border-[#333]"
                                            align="center"
                                            enableScroll={false}
                                        />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="text-[10px] font-bold uppercase tracking-wider opacity-70 mb-0.5">
                                            {alloc.type === 'Custom' ? 'Direct' : alloc.type}
                                        </div>
                                        <input 
                                            type="text"
                                            value={alloc.name}
                                            onChange={(e) => updateAllocation(alloc.id, { name: e.target.value })}
                                            className="w-full bg-transparent text-sm font-bold outline-none truncate placeholder:text-gray-600"
                                            placeholder="Name"
                                            onClick={(e) => e.stopPropagation()} // Focus input, don't trigger select
                                        />
                                    </div>
                                    
                                    {allocations.length > 1 && (
                                        <button 
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); handleRemoveAllocation(alloc.id); }}
                                            className="p-1.5 text-gray-600 hover:text-red-500 hover:bg-[#111] rounded-lg transition-colors"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Allocation Editor */}
                    <div className="flex-1 bg-[#111] flex flex-col min-w-0">
                        {selectedAllocation ? (
                            <div className="flex flex-col h-full">
                                {/* Config Header - Just Type Selector */}
                                <div className="p-3 border-b border-[#222] bg-[#151515] flex items-center justify-between shrink-0">
                                    <div className="flex items-center gap-2">
                                        <Layers size={16} className="text-brand-green" />
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Method</span>
                                    </div>
                                    <div className="flex bg-[#111] p-1 rounded-lg border border-[#333]">
                                        {['Custom', 'ICM', 'ChipEV'].map(t => (
                                            <button 
                                                key={t}
                                                type="button"
                                                onClick={() => {
                                                    // Initialize rules if switching to Matrix-based types
                                                    const updates: Partial<PayoutAllocation> = { type: t as PayoutType };
                                                    if ((t === 'Custom' || t === 'ICM') && (!selectedAllocation.rules || selectedAllocation.rules.length === 0)) {
                                                        updates.rules = [{ minPlayers: 2, maxPlayers: 10, placesPaid: 2, percentages: [65, 35] }];
                                                    }
                                                    updateAllocation(selectedAllocation.id, updates);
                                                }}
                                                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                                                    selectedAllocation.type === t
                                                    ? 'bg-brand-green/20 text-brand-green shadow-sm'
                                                    : 'text-gray-500 hover:text-white hover:bg-[#222]'
                                                }`}
                                            >
                                                {t === 'Custom' ? 'Direct' : t}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Specific Logic Editor */}
                                <div className="flex-1 overflow-y-auto p-6">
                                    {selectedAllocation.type === 'Custom' || selectedAllocation.type === 'ICM' ? (
                                        <>
                                            <div className="flex justify-between items-center mb-6">
                                                <div className="flex flex-col">
                                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                                        <Table size={16} className="text-gray-500" /> 
                                                        {selectedAllocation.type === 'ICM' ? 'ICM Target Payouts' : 'Direct Payouts'}
                                                    </h3>
                                                </div>
                                                <button 
                                                    type="button"
                                                    onClick={handleAddRule}
                                                    className="px-3 py-1.5 bg-[#222] hover:bg-[#333] text-brand-green border border-brand-green/20 hover:border-brand-green/50 rounded-lg text-xs font-bold flex items-center gap-2 transition-all"
                                                >
                                                    <Plus size={14} /> Add Range
                                                </button>
                                            </div>

                                            <div className="space-y-4">
                                                {(selectedAllocation.rules || []).map((rule, idx) => {
                                                    const totalPct = rule.percentages.reduce((a, b) => a + b, 0);
                                                    const isBalanced = Math.abs(totalPct - 100) < 0.1;
                                                    const isPlacesPaidCapped = rule.placesPaid > 50;
                                                    
                                                    return (
                                                        <div key={idx} className={`p-4 rounded-xl border ${isBalanced ? 'border-[#333]' : 'border-red-900/50 bg-red-900/5'} bg-[#1A1A1A] relative group`}>
                                                            <div className="grid grid-cols-12 gap-4 items-start">
                                                                {/* Range */}
                                                                <div className="col-span-3 space-y-1">
                                                                    <label className="text-[10px] font-bold text-gray-500 uppercase">Players</label>
                                                                    <div className="flex items-center gap-2">
                                                                        <NumberInput 
                                                                            value={rule.minPlayers}
                                                                            onChange={(val) => updateRuleRow(idx, 'minPlayers', val)}
                                                                            min={2}
                                                                            size="sm"
                                                                            align="center"
                                                                            className="w-full border border-[#333] rounded-lg bg-[#222]"
                                                                            variant="transparent"
                                                                            enableScroll={false}
                                                                        />
                                                                        <span className="text-gray-500">-</span>
                                                                        <NumberInput 
                                                                            value={rule.maxPlayers}
                                                                            onChange={(val) => updateRuleRow(idx, 'maxPlayers', val)}
                                                                            min={rule.minPlayers}
                                                                            size="sm"
                                                                            align="center"
                                                                            className="w-full border border-[#333] rounded-lg bg-[#222]"
                                                                            variant="transparent"
                                                                            enableScroll={false}
                                                                        />
                                                                    </div>
                                                                </div>

                                                                {/* Places */}
                                                                <div className="col-span-2 space-y-1">
                                                                    <label className="text-[10px] font-bold text-gray-500 uppercase">Places Paid</label>
                                                                    <NumberInput 
                                                                        value={rule.placesPaid}
                                                                        onChange={(val) => updateRuleRow(idx, 'placesPaid', val)}
                                                                        min={1}
                                                                        max={50} // Cap at 50
                                                                        size="sm"
                                                                        align="center"
                                                                        className="w-full border border-[#333] rounded-lg bg-[#222] text-brand-green font-bold"
                                                                        variant="transparent"
                                                                        enableScroll={false}
                                                                    />
                                                                </div>

                                                                {/* Percentages */}
                                                                <div className="col-span-7 space-y-1">
                                                                    <div className="flex justify-between pr-8">
                                                                        <label className="text-[10px] font-bold text-gray-500 uppercase">Distribution %</label>
                                                                        <span className={`text-[10px] font-bold ${isBalanced ? 'text-green-500' : 'text-red-500'}`}>
                                                                            Total: {Math.round(totalPct)}%
                                                                        </span>
                                                                    </div>
                                                                    
                                                                    {isPlacesPaidCapped ? (
                                                                        <div className="text-[10px] text-gray-500 italic py-2">
                                                                            Distribution configuration hidden for &gt; 50 places to maintain performance.
                                                                        </div>
                                                                    ) : (
                                                                        <div className="flex flex-wrap gap-2">
                                                                            {rule.percentages.map((pct, pIdx) => (
                                                                                <div key={pIdx} className="relative w-16">
                                                                                    <NumberInput 
                                                                                        value={pct}
                                                                                        onChange={(val) => updatePercentage(idx, pIdx, val)}
                                                                                        size="sm"
                                                                                        align="center"
                                                                                        className={`w-full border rounded-lg bg-[#222] ${!isBalanced ? 'border-red-500/50' : 'border-[#333]'}`}
                                                                                        variant="transparent"
                                                                                        enableScroll={false}
                                                                                        allowEmpty={true}
                                                                                    />
                                                                                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] text-gray-500 bg-[#1A1A1A] px-1 pointer-events-none">{pIdx + 1}st</span>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <button 
                                                                type="button"
                                                                onClick={() => handleRemoveRule(idx)}
                                                                className="absolute top-1/2 right-2 -translate-y-1/2 text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-2 hover:bg-[#111] rounded-lg"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    );
                                                })}
                                                {(!selectedAllocation.rules || selectedAllocation.rules.length === 0) && (
                                                    <div className="text-center py-10 text-gray-500 border border-dashed border-[#333] rounded-xl">
                                                        <LayoutList size={32} className="mx-auto mb-2 opacity-50"/>
                                                        <p>{t('structures.payoutForm.noRules')}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-50 pb-20">
                                            <Cpu size={48} />
                                            <div className="max-w-sm">
                                                <h4 className="text-lg font-bold text-white mb-2">Chip EV Engine</h4>
                                                <p className="text-sm text-gray-400">
                                                    Payouts for this portion ({selectedAllocation.percent}%) are calculated based on raw chip percentage. 
                                                    <br/>(e.g. 50% of chips = 50% of this split)
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-500">
                                Select a split to configure
                            </div>
                        )}
                    </div>
                </div>
            </form>
        </Modal>

        {/* Import/Export Modal */}
        <Modal
            isOpen={isIOModalOpen}
            onClose={() => setIsIOModalOpen(false)}
            title={ioMode === 'export' ? "Export Payout Model" : "Import Payout Model"}
            size="xl"
            zIndex={200}
        >
            <div className="p-6 flex flex-col h-[500px]">
                {ioMode === 'export' && (
                    <div className="mb-4 text-sm text-gray-400">
                        Copy this JSON to save your payout model or share it with others.
                    </div>
                )}
                {ioMode === 'import' && (
                    <div className="mb-4 text-sm text-gray-400">
                        Paste a valid JSON configuration below to load it into the editor.
                    </div>
                )}
                
                <textarea 
                    value={ioJson}
                    onChange={(e) => { setIoJson(e.target.value); setImportError(null); }}
                    readOnly={ioMode === 'export'}
                    className={`flex-1 bg-[#111] border rounded-xl p-4 font-mono text-xs text-gray-300 outline-none resize-none mb-4 ${importError ? 'border-red-500' : 'border-[#333] focus:border-brand-green'}`}
                    placeholder={ioMode === 'import' ? 'Paste JSON here...' : ''}
                />

                {importError && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-xs">
                        <AlertCircle size={16} />
                        {importError}
                    </div>
                )}

                <div className="flex justify-end gap-3">
                    <button 
                        type="button"
                        onClick={() => setIsIOModalOpen(false)}
                        className="px-4 py-2 rounded-xl text-sm font-bold text-gray-400 hover:text-white hover:bg-[#222] transition-colors"
                    >
                        Cancel
                    </button>
                    
                    {ioMode === 'export' ? (
                        <button 
                            type="button"
                            onClick={handleCopyJson}
                            className={`px-6 py-2 rounded-xl font-bold flex items-center gap-2 transition-all ${copySuccess ? 'bg-green-500 text-white' : THEME.buttonPrimary}`}
                        >
                            {copySuccess ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                            {copySuccess ? "Copied!" : "Copy to Clipboard"}
                        </button>
                    ) : (
                        <button 
                            type="button"
                            onClick={handleConfirmImport}
                            className={`${THEME.buttonPrimary} px-6 py-2 rounded-xl font-bold flex items-center gap-2`}
                        >
                            <Upload size={18} /> Import
                        </button>
                    )}
                </div>
            </div>
        </Modal>
    </>
  );
};

export default PayoutModelForm;
