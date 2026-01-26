
import React, { useState, useEffect } from 'react';
import { 
    Plus, Trash2, AlertCircle, CheckCircle2, Table, LayoutList, 
    Cpu, Layers, Save, Upload, Download, Pencil
} from 'lucide-react';
import { PayoutStructure, PayoutRule, PayoutType, PayoutAllocation } from '../types';
import { THEME } from '../theme';
import { Modal } from './ui/Modal';
import { useLanguage } from '../contexts/LanguageContext';
import { validatePayoutRules } from '../utils/payoutUtils';
import NumberInput from './ui/NumberInput';
import { JsonIOModal } from './ui/JsonIOModal';

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
            rules: (startType === 'Custom' || startType === 'ICM') ? [{ minPlayers: 0, maxPlayers: 99999, placesPaid: 3, percentages: [50, 30, 20] }] : []
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
                      // Removed colon to avoid double colons (e.g. "Bonus Total: ...")
                      error = `${alloc.name} ${res.error}`;
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
          rules: [{ minPlayers: 0, maxPlayers: 99999, placesPaid: 3, percentages: [50, 30, 20] }]
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

  // --- Single Rule Editor Helpers (Targeting selectedAllocation) ---
  
  // Gets the single active rule or creates a default one
  const getActiveRule = (): PayoutRule => {
      if (selectedAllocation?.rules && selectedAllocation.rules.length > 0) {
          return selectedAllocation.rules[0];
      }
      return { minPlayers: 0, maxPlayers: 99999, placesPaid: 3, percentages: [50, 30, 20] };
  };

  const updateActiveRule = (field: keyof PayoutRule, value: number | undefined) => {
      if (!selectedAllocation) return;
      
      const safeValue = value ?? 0;
      const rule = { ...getActiveRule(), [field]: safeValue };
      
      // Ensure range is always wide
      rule.minPlayers = 0;
      rule.maxPlayers = 99999;

      if (field === 'placesPaid') {
          let newValue = safeValue;
          
          // Cap places paid at 50 to prevent UI issues
          if (newValue > 50) newValue = 50;
          if (newValue < 1) newValue = 1;
          
          rule.placesPaid = newValue;
          const diff = newValue - rule.percentages.length;
          if (diff > 0) rule.percentages = [...rule.percentages, ...Array(diff).fill(0)];
          else if (diff < 0) rule.percentages = rule.percentages.slice(0, newValue);
      }

      updateRules(selectedAllocation.id, [rule]);
  };

  const updatePercentage = (pctIdx: number, value: number | undefined) => {
      if (!selectedAllocation) return;
      const safeValue = value ?? 0;
      const rule = { ...getActiveRule() };
      rule.percentages[pctIdx] = safeValue;
      updateRules(selectedAllocation.id, [rule]);
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
      setIoMode('export');
      setIsIOModalOpen(true);
  };

  const handleOpenImport = () => {
      setIoMode('import');
      setIsIOModalOpen(true);
  };

  const handleImportData = (parsed: any) => {
      setName(parsed.name || '');
      setDescription(parsed.description || '');
      setAllocations(parsed.allocations);
      
      if (parsed.allocations.length > 0) {
          setSelectedAllocId(parsed.allocations[0].id);
      }
  };

  const validateImport = (data: any): string | null => {
      if (!data.allocations || !Array.isArray(data.allocations)) {
          return "Invalid format: missing 'allocations' array.";
      }
      return null;
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

  const exportData: PayoutStructure = {
      id: initialData?.id || crypto.randomUUID(),
      name,
      description,
      allocations
  };

  // Helper for single rule rendering
  const activeRule = selectedAllocation && (selectedAllocation.type === 'Custom' || selectedAllocation.type === 'ICM') ? getActiveRule() : null;
  const totalPct = activeRule ? activeRule.percentages.reduce((a, b) => a + b, 0) : 0;
  const isBalanced = Math.abs(totalPct - 100) < 0.1;

  return (
    <>
        <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={modalHeaderTitle}
        size="4xl"
        >
        <form onSubmit={handleSubmit} className="flex flex-col h-[85vh] overflow-hidden">
                
                {/* 1. Custom Toolbar */}
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
                                        : 'bg-[#151515] border-[#333] text-gray-400 hover:border-gray-500 hover:text-white'
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
                                        <div className="text-sm font-bold truncate">
                                            {alloc.name}
                                        </div>
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
                                {/* Consolidated Header: Name, Method, Places Paid */}
                                <div className="p-5 border-b border-[#222] bg-[#151515] shrink-0">
                                    <div className="flex items-center justify-between gap-6">
                                        
                                        {/* Name Input */}
                                        <div className="flex-1">
                                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                                <Pencil size={12} /> Allocation Name
                                            </label>
                                            <input 
                                                type="text" 
                                                value={selectedAllocation.name}
                                                onChange={(e) => updateAllocation(selectedAllocation.id, { name: e.target.value })}
                                                className="bg-transparent text-2xl font-bold text-white outline-none w-full placeholder:text-gray-600 border-b border-transparent focus:border-brand-green/50 pb-1 transition-all"
                                                placeholder="e.g. Main Pot"
                                            />
                                        </div>

                                        {/* Controls Group */}
                                        <div className="flex items-end gap-4">
                                            {/* Method Switcher */}
                                            <div>
                                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">
                                                    Method
                                                </label>
                                                <div className="flex bg-[#111] p-1 rounded-lg border border-[#333]">
                                                    {['Custom', 'ICM', 'ChipEV'].map(t => (
                                                        <button 
                                                            key={t}
                                                            type="button"
                                                            onClick={() => {
                                                                // Initialize rules if switching to Matrix-based types
                                                                const updates: Partial<PayoutAllocation> = { type: t as PayoutType };
                                                                if ((t === 'Custom' || t === 'ICM') && (!selectedAllocation.rules || selectedAllocation.rules.length === 0)) {
                                                                    updates.rules = [{ minPlayers: 0, maxPlayers: 99999, placesPaid: 3, percentages: [50, 30, 20] }];
                                                                }
                                                                updateAllocation(selectedAllocation.id, updates);
                                                            }}
                                                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
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

                                            {/* Places Paid Input (Conditional) */}
                                            {(selectedAllocation.type === 'Custom' || selectedAllocation.type === 'ICM') && activeRule && (
                                                <div>
                                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">
                                                        Places Paid
                                                    </label>
                                                    <div className="w-24">
                                                        <NumberInput 
                                                            value={activeRule.placesPaid}
                                                            onChange={(val) => updateActiveRule('placesPaid', val)}
                                                            min={1}
                                                            max={50} 
                                                            size="md"
                                                            align="center"
                                                            className="w-full border border-[#333] rounded-xl bg-[#1A1A1A] text-brand-green font-bold"
                                                            variant="filled"
                                                            enableScroll={false}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Specific Logic Editor (Grid) */}
                                <div className="flex-1 overflow-y-auto p-6 bg-[#111]">
                                    {(selectedAllocation.type === 'Custom' || selectedAllocation.type === 'ICM') && activeRule ? (
                                        <div>
                                            {activeRule.placesPaid > 50 ? (
                                                <div className="text-sm text-gray-500 italic py-10 text-center border border-dashed border-[#333] rounded-xl">
                                                    Distribution configuration hidden for &gt; 50 places to maintain performance.
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                                    {activeRule.percentages.map((pct, pIdx) => (
                                                        <div key={pIdx} className="relative group">
                                                            <div className="absolute -top-2.5 left-3 text-[9px] font-bold text-gray-500 bg-[#111] px-1.5 z-10">
                                                                {pIdx + 1}{['st','nd','rd'][pIdx] || 'th'}
                                                            </div>
                                                            <NumberInput 
                                                                value={pct}
                                                                onChange={(val) => updatePercentage(pIdx, val)}
                                                                size="lg"
                                                                align="center"
                                                                suffix="%"
                                                                className={`w-full border rounded-xl bg-[#1A1A1A] font-bold text-lg ${!isBalanced ? 'border-red-500/30' : 'border-[#333] group-hover:border-gray-500'} focus-within:border-brand-green focus-within:bg-[#222] transition-all`}
                                                                variant="filled"
                                                                enableScroll={false}
                                                                allowEmpty={true}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
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

        {/* Use the Reusable JsonIOModal */}
        <JsonIOModal 
            isOpen={isIOModalOpen}
            onClose={() => setIsIOModalOpen(false)}
            mode={ioMode}
            exportData={ioMode === 'export' ? exportData : undefined}
            onImport={handleImportData}
            validate={validateImport}
            title={ioMode === 'export' ? "Export Payout Model" : "Import Payout Model"}
        />
    </>
  );
};

export default PayoutModelForm;
