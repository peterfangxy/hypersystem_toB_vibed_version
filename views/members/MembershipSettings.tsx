
import React, { useState, useEffect } from 'react';
import { 
  Crown, 
  ChevronUp, 
  ChevronDown, 
  Edit2, 
  Trash2, 
  Plus 
} from 'lucide-react';
import { TierDefinition } from '../../types';
import * as DataService from '../../services/dataService';
import TierForm from '../../components/TierForm';
import { useLanguage } from '../../contexts/LanguageContext';
import { THEME } from '../../theme';

const MembershipSettings = () => {
    const { t } = useLanguage();
    const [tiers, setTiers] = useState<TierDefinition[]>([]);
    const [isTierFormOpen, setIsTierFormOpen] = useState(false);
    const [editingTier, setEditingTier] = useState<TierDefinition | undefined>(undefined);

    useEffect(() => {
        loadTiers();
    }, []);

    const loadTiers = () => {
        setTiers(DataService.getTierDefinitions());
    };

    const handleEdit = (tier: TierDefinition) => {
        setEditingTier(tier);
        setIsTierFormOpen(true);
    };

    const handleSave = (tier: TierDefinition) => {
        DataService.saveTierDefinition(tier);
        loadTiers();
        setIsTierFormOpen(false);
        setEditingTier(undefined);
    };

    const handleDelete = (id: string) => {
        if(window.confirm(t('members.settings.tierCard.deleteConfirm'))) {
            DataService.deleteTierDefinition(id);
            loadTiers();
        }
    };

    const handleMove = (index: number, direction: 'up' | 'down') => {
        const newTiers = [...tiers];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        
        if (swapIndex >= 0 && swapIndex < newTiers.length) {
            // Swap array elements
            [newTiers[index], newTiers[swapIndex]] = [newTiers[swapIndex], newTiers[index]];
            
            // Re-assign order based on new array index
            const orderedTiers = newTiers.map((t, idx) => ({ ...t, order: idx + 1 }));
            
            DataService.saveAllTierDefinitions(orderedTiers);
            setTiers(orderedTiers);
        }
    };

    const openCreate = () => {
        setEditingTier(undefined);
        setIsTierFormOpen(true);
    };

    return (
        <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-2 overflow-y-auto pb-8">
            <div className="absolute top-0 right-0 -mt-20"> 
               <button 
                  onClick={openCreate}
                  className={`${THEME.buttonPrimary} px-6 py-3 rounded-full font-semibold shadow-lg shadow-green-500/20 flex items-center gap-2 transition-transform hover:scale-105 active:scale-95 whitespace-nowrap`}
              >
                  <Plus size={20} strokeWidth={2.5} />
                  {t('members.settings.addTier')}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-4">
                {tiers.map((tier, index) => (
                    <div key={tier.id} className="group relative">
                        {/* Physical Card Look */}
                        <div className="bg-[#111] rounded-2xl overflow-hidden border border-[#333] shadow-lg flex flex-col h-full hover:border-brand-green/30 transition-all">
                            
                            {/* Card Header (Colored) */}
                            <div 
                                className="h-24 relative p-4 flex items-center justify-between"
                                style={{ 
                                    background: `linear-gradient(135deg, ${tier.color}20, ${tier.color}05)`,
                                    borderBottom: `1px solid ${tier.color}30`
                                }}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-black/20 flex items-center justify-center backdrop-blur-sm border border-white/5">
                                        <Crown size={24} style={{ color: tier.color }} fill="currentColor" className="opacity-90 drop-shadow-md" />
                                    </div>
                                    <h4 className="text-xl font-bold text-white tracking-widest uppercase" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                                        {tier.name}
                                    </h4>
                                </div>
                                
                                {/* Ordering Controls */}
                                <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded-lg p-1 backdrop-blur-sm">
                                    <button 
                                        onClick={() => handleMove(index, 'up')}
                                        disabled={index === 0}
                                        className="p-0.5 hover:text-white text-gray-400 disabled:opacity-30"
                                    >
                                        <ChevronUp size={14} />
                                    </button>
                                    <button 
                                        onClick={() => handleMove(index, 'down')}
                                        disabled={index === tiers.length - 1}
                                        className="p-0.5 hover:text-white text-gray-400 disabled:opacity-30"
                                    >
                                        <ChevronDown size={14} />
                                    </button>
                                </div>
                            </div>

                            {/* Body */}
                            <div className="p-5 flex-1 flex flex-col gap-4">
                                <div>
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">{t('members.settings.tierCard.requirements')}</span>
                                    <p className="text-sm font-medium text-gray-200">{tier.requirements || 'None'}</p>
                                </div>
                                
                                <div className="flex-1">
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">{t('members.settings.tierCard.benefits')}</span>
                                    {tier.benefits ? (
                                        <ul className="text-xs text-gray-400 space-y-1 leading-relaxed">
                                            {tier.benefits.split('\n').map((line, i) => (
                                                <li key={i} className="flex items-start gap-2">
                                                    <span className="mt-1 w-1 h-1 rounded-full bg-brand-green/50 shrink-0"/> 
                                                    {line}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <span className="text-xs text-gray-600 italic">{t('members.settings.tierCard.noBenefits')}</span>
                                    )}
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="p-4 border-t border-[#222] bg-[#151515] flex justify-between items-center">
                                <span className="text-xs text-gray-600 font-mono">ID: {tier.id}</span>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => handleEdit(tier)}
                                        className="p-2 hover:bg-[#222] rounded-lg text-gray-400 hover:text-white transition-colors"
                                        title={t('common.edit')}
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    {!['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'].includes(tier.id) && (
                                        <button 
                                            onClick={() => handleDelete(tier.id)}
                                            className="p-2 hover:bg-red-900/20 rounded-lg text-gray-600 hover:text-red-500 transition-colors"
                                            title={t('common.delete')}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                
                {/* Add New Card Placeholder */}
                <button 
                    onClick={openCreate}
                    className="border-2 border-dashed border-[#222] rounded-2xl flex flex-col items-center justify-center p-8 text-gray-600 hover:border-brand-green/30 hover:text-brand-green hover:bg-brand-green/5 transition-all min-h-[300px]"
                >
                    <div className="w-12 h-12 rounded-full bg-[#1A1A1A] flex items-center justify-center mb-4">
                        <Plus size={24} />
                    </div>
                    <span className="font-bold">{t('members.settings.addTier')}</span>
                </button>
            </div>

            <TierForm 
                isOpen={isTierFormOpen}
                onClose={() => setIsTierFormOpen(false)}
                onSubmit={handleSave}
                initialData={editingTier}
                isNew={!editingTier}
            />
        </div>
    );
};

export default MembershipSettings;
