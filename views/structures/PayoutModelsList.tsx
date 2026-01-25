
import React, { useState, useEffect, useMemo } from 'react';
import { Cpu, Calculator, Table as TableIcon, ArrowRight, Edit2, Plus } from 'lucide-react';
import { THEME } from '../../theme';
import { PayoutStructure } from '../../types';
import * as DataService from '../../services/dataService';
import PayoutModelForm from '../../components/PayoutModelForm';
import { useLanguage } from '../../contexts/LanguageContext';
import { Table, Column } from '../../components/ui/Table';
import { useTableData } from '../../hooks/useTableData';
import DeleteWithConfirmation from '../../components/ui/DeleteWithConfirmation';

const PayoutModelsList = () => {
    const { t } = useLanguage();
    const [payouts, setPayouts] = useState<PayoutStructure[]>([]);
    const [isPayoutFormOpen, setIsPayoutFormOpen] = useState(false);
    const [editingPayout, setEditingPayout] = useState<PayoutStructure | undefined>(undefined);

    useEffect(() => {
        setPayouts(DataService.getPayoutStructures());
    }, []);

    const handlePayoutSave = (payout: PayoutStructure) => {
        DataService.savePayoutStructure(payout);
        setPayouts(DataService.getPayoutStructures());
        setIsPayoutFormOpen(false);
        setEditingPayout(undefined);
    };

    const handlePayoutDelete = (id: string) => {
        DataService.deletePayoutStructure(id);
        setPayouts(DataService.getPayoutStructures());
    };

    const openPayoutCreate = () => {
        setEditingPayout(undefined);
        setIsPayoutFormOpen(true);
    };

    // --- Table Logic for Custom Matrices ---
    const customMatrices = useMemo(() => payouts.filter(p => p.type === 'Custom Matrix'), [payouts]);
    
    const {
        data: filteredPayouts,
        sortConfig: payoutSortConfig,
        handleSort: handlePayoutSort
    } = useTableData<PayoutStructure>({
        data: customMatrices,
        initialSort: { key: 'name', direction: 'asc' },
        searchKeys: ['name', 'description']
    });

    const payoutColumns: Column<PayoutStructure>[] = useMemo(() => [
        {
            key: 'name',
            label: t('structures.payouts.table.name'),
            sortable: true,
            className: 'pl-6 w-[25%]',
            render: (matrix) => (
                <div>
                    <div className="font-bold text-white text-base">{matrix.name}</div>
                    <div className="text-xs text-gray-500 mt-1 line-clamp-1">{matrix.description}</div>
                </div>
            )
        },
        {
            key: 'rules',
            label: t('structures.payouts.table.rules'),
            className: 'w-[15%]',
            render: (matrix) => (
                <div className="inline-flex items-center gap-2 bg-[#1A1A1A] border border-[#333] px-2 py-1 rounded-lg text-sm text-gray-300">
                    <TableIcon size={14} className="text-gray-500"/>
                    {matrix.rules?.length || 0} {t('structures.payouts.table.ranges')}
                </div>
            )
        },
        {
            key: 'range',
            label: t('structures.payouts.table.range'),
            render: (matrix) => {
                if (matrix.rules && matrix.rules.length > 0) {
                    return (
                      <div className="text-sm font-medium text-gray-300 flex items-center gap-2">
                          <span>{matrix.rules[0].minPlayers}</span>
                          <ArrowRight size={12} className="text-gray-600"/>
                          <span>{matrix.rules[matrix.rules.length - 1].maxPlayers} Players</span>
                      </div>
                    );
                }
                return <span className="text-sm text-gray-600 italic">{t('structures.payouts.table.noRules')}</span>;
            }
        },
        {
            key: 'actions',
            label: t('common.actions'),
            className: 'text-right pr-6 w-[10%]',
            render: (matrix) => (
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
                    <DeleteWithConfirmation 
                        disabled={!!matrix.isSystemDefault}
                        onConfirm={() => handlePayoutDelete(matrix.id)}
                        itemName={matrix.name}
                        title="Delete Payout Model?"
                    />
                </div>
            )
        }
    ], [t]);

    return (
      <>
        <div className="absolute top-0 right-0 -mt-20"> 
            <button 
                onClick={openPayoutCreate}
                className={`${THEME.buttonPrimary} px-6 py-3 rounded-full font-semibold shadow-lg shadow-green-500/20 flex items-center gap-2 transition-transform hover:scale-105 active:scale-95 whitespace-nowrap`}
            >
                <Plus size={20} strokeWidth={2.5} />
                {t('structures.btn.createMatrix')}
            </button>
        </div>

        <div className={`${THEME.card} border ${THEME.border} rounded-3xl overflow-hidden shadow-xl flex-1 min-h-0 mb-3 animate-in fade-in slide-in-from-bottom-2 flex flex-col`}>
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
             <div className="flex-1 flex flex-col min-h-0">
                 <div className="p-6 pb-2">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                        <TableIcon size={14} /> {t('structures.payouts.matrices')}
                    </h3>
                 </div>
                 
                 <Table 
                    data={filteredPayouts}
                    columns={payoutColumns}
                    keyExtractor={(p) => p.id}
                    sortConfig={payoutSortConfig}
                    onSort={handlePayoutSort}
                    className="mx-6 mb-6"
                    emptyState={
                        <div className="text-center py-10 text-gray-600">
                            {t('structures.payouts.table.empty')}
                        </div>
                    }
                 />
             </div>
         </div>

         <PayoutModelForm
            isOpen={isPayoutFormOpen}
            onClose={() => setIsPayoutFormOpen(false)}
            onSubmit={handlePayoutSave}
            initialData={editingPayout}
         />
      </>
    );
};

export default PayoutModelsList;
