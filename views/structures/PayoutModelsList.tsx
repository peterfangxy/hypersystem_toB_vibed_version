
import React, { useState, useEffect, useMemo } from 'react';
import { Edit2, Plus, Trash2 } from 'lucide-react';
import { THEME } from '../../theme';
import { PayoutStructure, PayoutType } from '../../types';
import * as DataService from '../../services/dataService';
import PayoutModelForm from '../../components/PayoutModelForm';
import { useLanguage } from '../../contexts/LanguageContext';
import { Table, Column } from '../../components/ui/Table';
import { useTableData } from '../../hooks/useTableData';
import DeleteWithConfirmation from '../../components/ui/DeleteWithConfirmation';

const PayoutModelsList = () => {
    const { t } = useLanguage();
    const [payouts, setPayouts] = useState<PayoutStructure[]>([]);
    
    // UI State
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingPayout, setEditingPayout] = useState<PayoutStructure | undefined>(undefined);

    useEffect(() => {
        setPayouts(DataService.getPayoutStructures());
    }, []);

    const handleSave = (payout: PayoutStructure) => {
        DataService.savePayoutStructure(payout);
        setPayouts(DataService.getPayoutStructures());
        setIsFormOpen(false);
        setEditingPayout(undefined);
    };

    const handleDelete = (id: string) => {
        DataService.deletePayoutStructure(id);
        setPayouts(DataService.getPayoutStructures());
    };

    const openCreateFlow = () => {
        setEditingPayout(undefined);
        setIsFormOpen(true);
    };

    const openEdit = (payout: PayoutStructure) => {
        setEditingPayout(payout);
        setIsFormOpen(true);
    };

    // --- Table Logic ---
    const {
        data: filteredPayouts,
        sortConfig,
        handleSort
    } = useTableData<PayoutStructure>({
        data: payouts,
        initialSort: { key: 'name', direction: 'asc' },
        searchKeys: ['name']
    });

    const columns: Column<PayoutStructure>[] = useMemo(() => [
        {
            key: 'name',
            label: t('structures.payouts.table.name'),
            sortable: true,
            className: 'pl-6 w-[30%]',
            render: (item) => (
                <div className="font-bold text-white text-base">{item.name}</div>
            )
        },
        {
            key: 'allocations',
            label: t('structures.payouts.table.splits'),
            className: 'w-[60%]',
            render: (item) => {
                if (!item.allocations || item.allocations.length === 0) return <span className="text-gray-600 italic">{t('structures.payouts.table.emptySplits')}</span>;
                
                return (
                    <div className="flex flex-wrap gap-2">
                        {item.allocations.map(alloc => (
                            <div key={alloc.id} className="flex items-center gap-1.5 text-[11px] bg-[#1A1A1A] border border-[#333] px-2 py-1 rounded-lg">
                                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: alloc.color || '#666' }} />
                                <span className="text-gray-300 font-bold">{alloc.percent}%</span>
                                <span className="text-gray-500 border-l border-[#333] pl-1.5 ml-0.5">{alloc.name}</span>
                                <span className="text-[9px] text-gray-600 uppercase font-bold tracking-wider ml-1">
                                    {alloc.type === 'Custom' ? t('structures.payoutForm.direct') : alloc.type}
                                </span>
                            </div>
                        ))}
                    </div>
                );
            }
        },
        {
            key: 'actions',
            label: t('common.actions'),
            className: 'text-right pr-6 w-[10%]',
            render: (item) => (
                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                        onClick={() => openEdit(item)}
                        className="p-1.5 text-gray-500 hover:text-white hover:bg-[#333] rounded-full transition-colors"
                        title={t('common.edit')}
                    >
                        <Edit2 size={16} />
                    </button>
                    <DeleteWithConfirmation 
                        disabled={!!item.isSystemDefault}
                        onConfirm={() => handleDelete(item.id)}
                        itemName={item.name}
                        title={t('structures.payouts.deleteTitle')}
                    />
                </div>
            )
        }
    ], [t]);

    return (
      <>
        <div className="absolute top-0 right-0 -mt-20"> 
            <button 
                onClick={openCreateFlow}
                className={`${THEME.buttonPrimary} px-6 py-3 rounded-full font-semibold shadow-lg shadow-green-500/20 flex items-center gap-2 transition-transform hover:scale-105 active:scale-95 whitespace-nowrap`}
            >
                <Plus size={20} strokeWidth={2.5} />
                {t('structures.btn.createModel')}
            </button>
        </div>

        <Table 
            data={filteredPayouts}
            columns={columns}
            keyExtractor={(p) => p.id}
            sortConfig={sortConfig}
            onSort={handleSort}
            className="mb-0 animate-in fade-in slide-in-from-bottom-2"
            emptyState={
                <div className="text-center py-10 text-gray-600">
                    {t('structures.payouts.table.empty')}
                </div>
            }
        />

         <PayoutModelForm
            isOpen={isFormOpen}
            onClose={() => setIsFormOpen(false)}
            onSubmit={handleSave}
            initialData={editingPayout}
         />
      </>
    );
};

export default PayoutModelsList;