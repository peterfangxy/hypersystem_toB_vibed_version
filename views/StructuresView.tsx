
import React, { useState, useEffect } from 'react';
import { Layers, DollarSign, Plus, Clock, Hash, Coins, Edit2, Trash2, Cpu, Table, ArrowRight, Calculator, Repeat } from 'lucide-react';
import { Routes, Route, Navigate, NavLink, useLocation } from 'react-router-dom';
import { THEME } from '../theme';
import { TournamentStructure, PayoutStructure } from '../types';
import * as DataService from '../services/dataService';
import StructureForm from '../components/StructureForm';
import PayoutModelForm from '../components/PayoutModelForm';
import { useLanguage } from '../contexts/LanguageContext';
import { PageHeader, TabContainer } from '../components/ui/PageLayout';

const StructuresView = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const isPayoutsTab = location.pathname.includes('/payouts');
  
  // Structures State
  const [structures, setStructures] = useState<TournamentStructure[]>([]);
  const [isStructFormOpen, setIsStructFormOpen] = useState(false);
  const [editingStructure, setEditingStructure] = useState<TournamentStructure | undefined>(undefined);

  // Payouts State
  const [payouts, setPayouts] = useState<PayoutStructure[]>([]);
  const [isPayoutFormOpen, setIsPayoutFormOpen] = useState(false);
  const [editingPayout, setEditingPayout] = useState<PayoutStructure | undefined>(undefined);

  useEffect(() => {
    setStructures(DataService.getTournamentStructures());
    setPayouts(DataService.getPayoutStructures());
  }, []);

  // --- Structure Handlers ---
  const handleStructSave = (structure: TournamentStructure) => {
    DataService.saveTournamentStructure(structure);
    setStructures(DataService.getTournamentStructures());
    setIsStructFormOpen(false);
    setEditingStructure(undefined);
  };

  const handleStructDelete = (id: string) => {
    if (window.confirm(t('common.delete') + '?')) {
        DataService.deleteTournamentStructure(id);
        setStructures(DataService.getTournamentStructures());
    }
  };

  const openStructCreate = () => {
    setEditingStructure(undefined);
    setIsStructFormOpen(true);
  };

  // --- Payout Handlers ---
  const handlePayoutSave = (payout: PayoutStructure) => {
      DataService.savePayoutStructure(payout);
      setPayouts(DataService.getPayoutStructures());
      setIsPayoutFormOpen(false);
      setEditingPayout(undefined);
  };

  const handlePayoutDelete = (id: string) => {
      if (window.confirm(t('common.delete') + '?')) {
          DataService.deletePayoutStructure(id);
          setPayouts(DataService.getPayoutStructures());
      }
  };

  const openPayoutCreate = () => {
      setEditingPayout(undefined);
      setIsPayoutFormOpen(true);
  };

  const calculateLength = (s: TournamentStructure) => {
    const totalMin = s.items.reduce((sum, item) => sum + item.duration, 0);
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    return `${h}h ${m}m`;
  };

  const getFirstLevel = (s: TournamentStructure) => {
      // Robustly find the first actual level by sorting by level index
      const levels = s.items.filter(i => i.type === 'Level');
      if (levels.length === 0) return undefined;
      return levels.sort((a, b) => (a.level || 0) - (b.level || 0))[0];
  }

  // --- Sub-components ---
  const BlindsList = () => (
    <div className="h-full flex flex-col">
    {structures.length === 0 ? (
       <div className="flex flex-col items-center justify-center py-20 text-gray-500 h-full">
           <div className="w-16 h-16 rounded-full bg-[#111] flex items-center justify-center mx-auto mb-4 border border-[#333]">
           <Layers size={32} className="opacity-50" />
           </div>
           <h3 className="text-lg font-medium mb-2">{t('structures.blindsTable.empty')}</h3>
           <button onClick={openStructCreate} className="text-brand-green hover:underline">{t('structures.blindsTable.createFirst')}</button>
       </div>
    ) : (
       <div className="overflow-y-auto h-full animate-in fade-in slide-in-from-bottom-2">
           <table className="w-full text-left border-collapse">
           <thead>
               <tr className="border-b border-[#262626] text-xs uppercase text-gray-500 font-bold tracking-wider">
                   <th className="px-4 py-3 pl-6 sticky top-0 bg-[#1A1A1A] z-10 whitespace-nowrap">{t('structures.blindsTable.name')}</th>
                   <th className="px-4 py-3 sticky top-0 bg-[#1A1A1A] z-10 whitespace-nowrap">{t('structures.blindsTable.chips')}</th>
                   <th className="px-4 py-3 sticky top-0 bg-[#1A1A1A] z-10 whitespace-nowrap">{t('structures.blindsTable.blinds')}</th>
                   <th className="px-4 py-3 sticky top-0 bg-[#1A1A1A] z-10 whitespace-nowrap">{t('structures.blindsTable.levels')}</th>
                   <th className="px-4 py-3 sticky top-0 bg-[#1A1A1A] z-10 whitespace-nowrap">{t('structures.blindsTable.rebuys')}</th>
                   <th className="px-4 py-3 sticky top-0 bg-[#1A1A1A] z-10 whitespace-nowrap">{t('structures.blindsTable.length')}</th>
                   <th className="px-4 py-3 pr-6 text-right sticky top-0 bg-[#1A1A1A] z-10 whitespace-nowrap">{t('common.actions')}</th>
               </tr>
           </thead>
           <tbody className="divide-y divide-[#262626]">
               {structures.map(structure => {
                   const firstLevel = getFirstLevel(structure);
                   const levels = structure.items.filter(i => i.type === 'Level');

                   return (
                       <tr key={structure.id} className="hover:bg-[#222] transition-colors group">
                           <td className="px-4 py-3 pl-6">
                               <div className="font-bold text-white text-base">{structure.name}</div>
                           </td>
                           <td className="px-4 py-3">
                               <div className="flex items-center gap-2 text-brand-green font-mono font-medium text-sm">
                                   <Coins size={16} />
                                   {structure.startingChips.toLocaleString()}
                               </div>
                           </td>
                           <td className="px-4 py-3">
                               {firstLevel && (
                                   <div className="font-mono text-gray-300 font-medium text-sm">
                                       {Number(firstLevel.smallBlind).toLocaleString()}/{Number(firstLevel.bigBlind).toLocaleString()}
                                       {(firstLevel.ante || 0) > 0 ? (
                                           <span className="text-gray-500 ml-1">({Number(firstLevel.ante).toLocaleString()})</span>
                                       ) : null}
                                   </div>
                               )}
                           </td>
                           <td className="px-4 py-3">
                               <div className="flex items-center gap-2 text-gray-300 font-medium text-sm">
                                   <Hash size={16} className="text-gray-500" />
                                   {levels.length} {t('structures.blindsTable.levels')}
                               </div>
                           </td>
                           <td className="px-4 py-3">
                               <div className="flex items-center gap-2 text-gray-300 font-medium text-sm">
                                   <Repeat size={16} className="text-gray-500" />
                                   {structure.rebuyLimit === 0 ? 'Freezeout' : `${structure.rebuyLimit} Limit`}
                               </div>
                           </td>
                           <td className="px-4 py-3">
                               <div className="flex items-center gap-2 text-white font-bold text-base">
                                   <Clock size={16} className="text-brand-green" />
                                   {calculateLength(structure)}
                               </div>
                           </td>
                           <td className="px-4 py-3 pr-6 text-right">
                               <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                   <button 
                                       onClick={() => {
                                           setEditingStructure(structure);
                                           setIsStructFormOpen(true);
                                       }}
                                       className="p-1.5 text-gray-500 hover:text-white hover:bg-[#333] rounded-full transition-colors"
                                       title={t('common.edit')}
                                   >
                                       <Edit2 size={16} />
                                   </button>
                                   <button 
                                       onClick={() => handleStructDelete(structure.id)}
                                       className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-[#333] rounded-full transition-colors"
                                       title={t('common.delete')}
                                   >
                                       <Trash2 size={16} />
                                   </button>
                               </div>
                           </td>
                       </tr>
                   );
               })}
           </tbody>
           </table>
       </div>
    )}
    </div>
  );

  const PayoutsList = () => (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-2 overflow-y-auto">
         {/* 1. Algorithms Section */}
         <div className="p-6 border-b border-[#222]">
             <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                 <Cpu size={14} /> {t('structures.payouts.algorithms')}
             </h3>
             <div className="grid grid-cols-2 gap-4">
                 {payouts.filter(p => p.type === 'Algorithm').map(algo => (
                     <div key={algo.id} className="bg-[#1A1A1A] p-4 rounded-xl border border-[#262626] flex items-start gap-4">
                         <div className="w-10 h-10 rounded-full bg-[#222] flex items-center justify-center text-brand-green">
                             <Calculator size={20} />
                         </div>
                         <div className="flex-1">
                             <div className="flex justify-between items-center mb-1">
                                 <h4 className="font-bold text-white text-base">{algo.name}</h4>
                                 <span className="text-[10px] font-bold bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded uppercase tracking-wider border border-blue-500/20">Active</span>
                             </div>
                             <p className="text-sm text-gray-500 leading-relaxed">{algo.description}</p>
                         </div>
                     </div>
                 ))}
             </div>
         </div>

         {/* 2. Custom Matrices Section */}
         <div className="flex-1">
             <div className="p-6 pb-2 sticky top-0 bg-[#171717] z-10">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                    <Table size={14} /> {t('structures.payouts.matrices')}
                </h3>
             </div>
             
             <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="text-xs uppercase text-gray-500 font-bold tracking-wider">
                            <th className="px-6 py-3 whitespace-nowrap">{t('structures.payouts.table.name')}</th>
                            <th className="px-6 py-3 whitespace-nowrap">{t('structures.payouts.table.rules')}</th>
                            <th className="px-6 py-3 whitespace-nowrap">{t('structures.payouts.table.range')}</th>
                            <th className="px-6 py-3 text-right whitespace-nowrap">{t('common.actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#262626]">
                        {payouts.filter(p => p.type === 'Custom Matrix').map(matrix => (
                            <tr key={matrix.id} className="hover:bg-[#222] transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="font-bold text-white text-base">{matrix.name}</div>
                                    <div className="text-xs text-gray-500 mt-1">{matrix.description}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="inline-flex items-center gap-2 bg-[#1A1A1A] border border-[#333] px-2 py-1 rounded-lg text-sm text-gray-300">
                                        <Table size={14} className="text-gray-500"/>
                                        {matrix.rules?.length || 0} {t('structures.payouts.table.ranges')}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    {matrix.rules && matrix.rules.length > 0 ? (
                                        <div className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                            <span>{matrix.rules[0].minPlayers}</span>
                                            <ArrowRight size={12} className="text-gray-600"/>
                                            <span>{matrix.rules[matrix.rules.length - 1].maxPlayers} Players</span>
                                        </div>
                                    ) : (
                                        <span className="text-sm text-gray-600 italic">{t('structures.payouts.table.noRules')}</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => {
                                                setEditingPayout(matrix);
                                                setIsPayoutFormOpen(true);
                                            }}
                                            className="p-1.5 text-gray-500 hover:text-white hover:bg-[#333] rounded-full transition-colors"
                                            title={t('common.edit')}
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        {!matrix.isSystemDefault && (
                                            <button 
                                                onClick={() => handlePayoutDelete(matrix.id)}
                                                className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-[#333] rounded-full transition-colors"
                                                title={t('common.delete')}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {payouts.filter(p => p.type === 'Custom Matrix').length === 0 && (
                    <div className="text-center py-10 text-gray-600">
                        {t('structures.payouts.table.empty')}
                    </div>
                )}
             </div>
         </div>
     </div>
  );

  return (
    <div className="h-full flex flex-col w-full">
      <PageHeader
        title={t('structures.title')}
        subtitle={t('structures.subtitle')}
        actions={
            !isPayoutsTab ? (
                <button 
                    onClick={openStructCreate}
                    className={`${THEME.buttonPrimary} px-6 py-3 rounded-full font-semibold shadow-lg shadow-green-500/20 flex items-center gap-2 transition-transform hover:scale-105 active:scale-95 whitespace-nowrap`}
                >
                    <Plus size={20} strokeWidth={2.5} />
                    {t('structures.btn.createStructure')}
                </button>
            ) : (
                <button 
                    onClick={openPayoutCreate}
                    className={`${THEME.buttonPrimary} px-6 py-3 rounded-full font-semibold shadow-lg shadow-green-500/20 flex items-center gap-2 transition-transform hover:scale-105 active:scale-95 whitespace-nowrap`}
                >
                    <Plus size={20} strokeWidth={2.5} />
                    {t('structures.btn.createMatrix')}
                </button>
            )
        }
      />

      {/* Tabs Navigation */}
      <TabContainer>
        <NavLink
          to="blinds"
          className={({isActive}) => `pb-2.5 px-2 text-sm font-bold uppercase tracking-wider transition-all relative ${
            isActive 
              ? 'text-white' 
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
             {({isActive}) => (
                <>
                    <div className="flex items-center gap-2">
                        <Layers size={18} />
                        {t('structures.tabs.blinds')}
                    </div>
                    {isActive && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-green shadow-[0_0_10px_rgba(6,193,103,0.5)]" />
                    )}
                </>
             )}
        </NavLink>

        <NavLink
          to="payouts"
          className={({isActive}) => `pb-2.5 px-2 text-sm font-bold uppercase tracking-wider transition-all relative ${
            isActive 
              ? 'text-white' 
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
             {({isActive}) => (
                <>
                    <div className="flex items-center gap-2">
                        <DollarSign size={18} />
                        {t('structures.tabs.payouts')}
                    </div>
                    {isActive && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-green shadow-[0_0_10px_rgba(6,193,103,0.5)]" />
                    )}
                </>
             )}
        </NavLink>
      </TabContainer>

      {/* Content Area */}
      <div className={`${THEME.card} border ${THEME.border} rounded-3xl overflow-hidden shadow-xl flex-1 min-h-0 mb-3`}>
         <Routes>
             <Route path="blinds" element={<BlindsList />} />
             <Route path="payouts" element={<PayoutsList />} />
             <Route index element={<Navigate to="blinds" replace />} />
         </Routes>
      </div>

      <StructureForm 
        isOpen={isStructFormOpen}
        onClose={() => setIsStructFormOpen(false)}
        onSubmit={handleStructSave}
        initialData={editingStructure}
      />
      
      <PayoutModelForm
        isOpen={isPayoutFormOpen}
        onClose={() => setIsPayoutFormOpen(false)}
        onSubmit={handlePayoutSave}
        initialData={editingPayout}
      />
    </div>
  );
};

export default StructuresView;
