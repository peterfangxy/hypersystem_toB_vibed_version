import React, { useState, useEffect } from 'react';
import { Plus, Trash2, AlertCircle, CheckCircle2, Table, LayoutList } from 'lucide-react';
import { PayoutStructure, PayoutRule } from '../types';
import { THEME } from '../theme';
import { Modal } from './Modal';

interface PayoutModelFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payout: PayoutStructure) => void;
  initialData?: PayoutStructure;
}

const PayoutModelForm: React.FC<PayoutModelFormProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [rules, setRules] = useState<PayoutRule[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData && initialData.type === 'Custom Matrix') {
        setName(initialData.name);
        setDescription(initialData.description || '');
        setRules(initialData.rules || []);
      } else {
        setName('');
        setDescription('');
        // Default start rule
        setRules([{ minPlayers: 2, maxPlayers: 10, placesPaid: 2, percentages: [65, 35] }]);
      }
    }
  }, [isOpen, initialData]);

  // Validation Logic
  useEffect(() => {
    validateRules(rules);
  }, [rules]);

  const validateRules = (currentRules: PayoutRule[]) => {
    if (currentRules.length === 0) {
        setValidationError(null);
        return;
    }

    // 1. Check Distribution Sums
    if (currentRules.some(r => r.percentages.reduce((a, b) => a + b, 0) !== 100)) {
        setValidationError("Ensure all distributions sum to 100%");
        return;
    }

    // 2. Check Min/Max Validity
    if (currentRules.some(r => r.minPlayers > r.maxPlayers)) {
        setValidationError("Min players cannot be greater than Max players");
        return;
    }

    // 3. Check Descending Payouts (Higher ranks must get >= Lower ranks)
    for (const rule of currentRules) {
        for (let i = 0; i < rule.percentages.length - 1; i++) {
            if (rule.percentages[i] < rule.percentages[i+1]) {
                setValidationError(`Invalid distribution (${rule.minPlayers}-${rule.maxPlayers} players): A lower rank cannot pay more than a higher rank`);
                return;
            }
        }
    }

    // 4. Check for Gaps and Overlaps
    // Sort by minPlayers to check sequence
    const sorted = [...currentRules].sort((a, b) => a.minPlayers - b.minPlayers);
    
    for (let i = 0; i < sorted.length - 1; i++) {
        const current = sorted[i];
        const next = sorted[i+1];
        
        if (current.maxPlayers >= next.minPlayers) {
            setValidationError(`Overlap detected: Range ${current.minPlayers}-${current.maxPlayers} overlaps with ${next.minPlayers}-${next.maxPlayers}`);
            return;
        }
        
        if (current.maxPlayers + 1 !== next.minPlayers) {
             setValidationError(`Gap detected: Missing range between ${current.maxPlayers} and ${next.minPlayers}`);
             return;
        }
    }

    setValidationError(null);
  };

  const handleAddRule = () => {
    // Find the highest maxPlayers currently in the list to determine start of next range
    let highestMax = 1;
    if (rules.length > 0) {
        highestMax = Math.max(...rules.map(r => r.maxPlayers));
    }

    const newMin = highestMax + 1;
    const newMax = newMin + 9;
    
    setRules([
      ...rules,
      { minPlayers: newMin, maxPlayers: newMax, placesPaid: 1, percentages: [100] }
    ]);
  };

  const handleRemoveRule = (index: number) => {
    const newRules = [...rules];
    newRules.splice(index, 1);
    setRules(newRules);
  };

  const updateRule = (index: number, field: keyof PayoutRule, value: number) => {
    const newRules = [...rules];
    const rule = { ...newRules[index], [field]: value };
    
    // --- Constraint Logic ---

    // 1. If modifying Max Players, ensure Places Paid doesn't exceed it
    if (field === 'maxPlayers') {
        const maxLimit = Math.min(20, value); // Cap at 20 or the new maxPlayers
        if (rule.placesPaid > maxLimit) {
            rule.placesPaid = maxLimit;
            // Trim percentages
            rule.percentages = rule.percentages.slice(0, rule.placesPaid);
        }
    }

    // 2. If modifying Places Paid, enforce caps
    if (field === 'placesPaid') {
        const globalCap = 20;
        const rangeCap = rule.maxPlayers;
        const effectiveCap = Math.min(globalCap, rangeCap);

        let newValue = value;
        if (newValue > effectiveCap) newValue = effectiveCap;
        if (newValue < 1) newValue = 1;
        
        rule.placesPaid = newValue;

        // Resize percentages array
        const diff = newValue - rule.percentages.length;
        if (diff > 0) {
            // Add zeros
            rule.percentages = [...rule.percentages, ...Array(diff).fill(0)];
        } else if (diff < 0) {
            // Trim
            rule.percentages = rule.percentages.slice(0, newValue);
        }
    }
    
    newRules[index] = rule;
    setRules(newRules);
  };

  const updatePercentage = (ruleIndex: number, pctIndex: number, value: number) => {
      const newRules = [...rules];
      newRules[ruleIndex].percentages[pctIndex] = value;
      setRules(newRules);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const structure: PayoutStructure = {
      id: initialData?.id || crypto.randomUUID(),
      name,
      description,
      type: 'Custom Matrix',
      rules: [...rules].sort((a, b) => a.minPlayers - b.minPlayers) // Ensure saved order
    };
    onSubmit(structure);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Payout Matrix' : 'Create Payout Matrix'}
      size="3xl"
    >
      <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
             {/* Info Section */}
             <div className="p-6 bg-[#1A1A1A] border-b border-[#222] grid grid-cols-2 gap-6">
                 <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-300">Matrix Name</label>
                    <input 
                        required
                        type="text" 
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className={`w-full ${THEME.input} rounded-xl px-4 py-3 outline-none transition-all placeholder:text-gray-600`}
                        placeholder="e.g. Standard Top 15%"
                    />
                 </div>
                 <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-300">Description (Optional)</label>
                    <input 
                        type="text" 
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        className={`w-full ${THEME.input} rounded-xl px-4 py-3 outline-none transition-all placeholder:text-gray-600`}
                        placeholder="Short description of this model"
                    />
                 </div>
             </div>

             {/* Rules Builder */}
             <div className="flex-1 overflow-y-auto p-6 bg-[#111]">
                 <div className="flex justify-between items-center mb-4">
                     <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                         <Table size={16} /> Payout Rules
                     </h3>
                     <button 
                        type="button"
                        onClick={handleAddRule}
                        className="text-sm font-bold text-brand-green flex items-center gap-1 hover:underline"
                     >
                         <Plus size={16} /> Add Range
                     </button>
                 </div>

                 <div className="space-y-4">
                     {rules.map((rule, idx) => {
                         const totalPct = rule.percentages.reduce((a, b) => a + b, 0);
                         const isBalanced = totalPct === 100;
                         const maxPlaces = Math.min(20, rule.maxPlayers); // Cap at 20 or Max Players
                         
                         return (
                             <div key={idx} className={`p-4 rounded-xl border ${isBalanced ? 'border-[#333]' : 'border-red-900/50 bg-red-900/5'} bg-[#1A1A1A] relative group`}>
                                 <div className="grid grid-cols-12 gap-6 items-start">
                                     
                                     {/* Player Range */}
                                     <div className="col-span-3 space-y-2">
                                         <label className="text-xs font-bold text-gray-500 uppercase">Total Players (Range)</label>
                                         <div className="flex items-center gap-2">
                                             <input 
                                                type="number"
                                                min="2"
                                                value={rule.minPlayers}
                                                onChange={(e) => updateRule(idx, 'minPlayers', parseInt(e.target.value) || 0)}
                                                className={`w-full ${THEME.input} rounded-lg px-3 py-2 text-sm text-center`}
                                             />
                                             <span className="text-gray-500">-</span>
                                             <input 
                                                type="number"
                                                min={rule.minPlayers}
                                                value={rule.maxPlayers}
                                                onChange={(e) => updateRule(idx, 'maxPlayers', parseInt(e.target.value) || 0)}
                                                className={`w-full ${THEME.input} rounded-lg px-3 py-2 text-sm text-center`}
                                             />
                                         </div>
                                     </div>

                                     {/* Places Paid */}
                                     <div className="col-span-2 space-y-2">
                                         <label className="text-xs font-bold text-gray-500 uppercase">Top Places Paid</label>
                                         <div className="relative">
                                            <input 
                                                type="number"
                                                min="1"
                                                max={maxPlaces}
                                                value={rule.placesPaid}
                                                onChange={(e) => updateRule(idx, 'placesPaid', parseInt(e.target.value) || 1)}
                                                className={`w-full ${THEME.input} rounded-lg px-3 py-2 text-center text-brand-green font-bold`}
                                            />
                                            {maxPlaces < rule.maxPlayers && maxPlaces === 20 && (
                                                <span className="absolute -bottom-4 left-0 w-full text-[9px] text-gray-500 text-center">Max 20</span>
                                            )}
                                         </div>
                                     </div>

                                     {/* Percentages */}
                                     <div className="col-span-7 space-y-2">
                                         <div className="flex justify-between">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Distribution (%)</label>
                                            <span className={`text-xs font-bold ${isBalanced ? 'text-green-500' : 'text-red-500'}`}>
                                                Total: {totalPct}%
                                            </span>
                                         </div>
                                         <div className="flex flex-wrap gap-2">
                                             {rule.percentages.map((pct, pIdx) => (
                                                 <div key={pIdx} className="relative w-16">
                                                     <input 
                                                        type="number"
                                                        value={pct}
                                                        onChange={(e) => updatePercentage(idx, pIdx, parseFloat(e.target.value) || 0)}
                                                        className={`w-full ${THEME.input} rounded-lg px-2 py-2 text-sm text-center ${!isBalanced ? 'border-red-500/50' : ''}`}
                                                     />
                                                     <span className="absolute -top-2 -right-1 text-[9px] text-gray-500 bg-[#1A1A1A] px-1">{pIdx + 1}st</span>
                                                 </div>
                                             ))}
                                         </div>
                                     </div>
                                 </div>
                                 
                                 <button 
                                    type="button"
                                    onClick={() => handleRemoveRule(idx)}
                                    className="absolute top-4 right-4 text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                 >
                                     <Trash2 size={16} />
                                 </button>
                             </div>
                         );
                     })}
                     
                     {rules.length === 0 && (
                         <div className="text-center py-10 text-gray-500 border border-dashed border-[#333] rounded-xl">
                             <LayoutList size={32} className="mx-auto mb-2 opacity-50"/>
                             <p>No rules defined. Add a player range to start.</p>
                         </div>
                     )}
                 </div>
             </div>

            {/* Footer */}
            <div className="p-6 border-t border-[#222] bg-[#171717] flex justify-between items-center">
                 <div className="flex items-center gap-2 text-sm">
                    {validationError ? (
                        <span className="text-red-400 flex items-center gap-1.5 animate-pulse">
                            <AlertCircle size={16} />
                            {validationError}
                        </span>
                    ) : (
                         <span className="text-green-500/80 flex items-center gap-1.5">
                            <CheckCircle2 size={16} />
                            Matrix is valid
                        </span>
                    )}
                 </div>

                <div className="flex gap-3">
                    <button 
                        type="button" 
                        onClick={onClose}
                        className={`${THEME.buttonSecondary} px-6 py-3 rounded-xl font-bold`}
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit"
                        disabled={!!validationError}
                        className={`${THEME.buttonPrimary} px-8 py-3 rounded-xl font-bold text-lg shadow-lg shadow-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {initialData ? 'Save Matrix' : 'Create Matrix'}
                    </button>
                </div>
            </div>

        </form>
    </Modal>
  );
};

export default PayoutModelForm;