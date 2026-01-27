
import React, { useState, useEffect, useMemo } from 'react';
import { Coins, Hash, Repeat, Clock, Edit2, Plus, Layers } from 'lucide-react';
import { THEME } from '../../theme';
import { TournamentStructure } from '../../types';
import * as DataService from '../../services/dataService';
import StructureForm from '../../components/StructureForm';
import { useLanguage } from '../../contexts/LanguageContext';
import { Table, Column } from '../../components/ui/Table';
import { useTableData } from '../../hooks/useTableData';
import DeleteWithConfirmation from '../../components/ui/DeleteWithConfirmation';

const BlindsStructureList = () => {
    const { t } = useLanguage();
    const [structures, setStructures] = useState<TournamentStructure[]>([]);
    const [isStructFormOpen, setIsStructFormOpen] = useState(false);
    const [editingStructure, setEditingStructure] = useState<TournamentStructure | undefined>(undefined);

    useEffect(() => {
        setStructures(DataService.getTournamentStructures());
    }, []);

    const handleStructSave = (structure: TournamentStructure) => {
        DataService.saveTournamentStructure(structure);
        setStructures(DataService.getTournamentStructures());
        setIsStructFormOpen(false);
        setEditingStructure(undefined);
    };

    const handleStructDelete = (id: string) => {
        DataService.deleteTournamentStructure(id);
        setStructures(DataService.getTournamentStructures());
    };

    const openStructCreate = () => {
        setEditingStructure(undefined);
        setIsStructFormOpen(true);
    };

    const calculateLength = (s: TournamentStructure) => {
        const totalMin = s.items.reduce((sum, item) => sum + item.duration, 0);
        const h = Math.floor(totalMin / 60);
        const m = totalMin % 60;
        return `${h}h ${m}m`;
    };

    const getFirstLevel = (s: TournamentStructure) => {
        const levels = s.items.filter(i => i.type === 'Level');
        if (levels.length === 0) return undefined;
        return levels.sort((a, b) => (a.level || 0) - (b.level || 0))[0];
    };

    // --- Table Logic ---
    const {
        data: filteredStructures,
        sortConfig: structSortConfig,
        handleSort: handleStructSort
    } = useTableData<TournamentStructure>({
        data: structures,
        initialSort: { key: 'name', direction: 'asc' },
        searchKeys: ['name'],
        customSort: (a, b, key, direction) => {
            const dir = direction === 'asc' ? 1 : -1;
            
            switch(key) {
                case 'blinds': {
                    const levelA = getFirstLevel(a);
                    const levelB = getFirstLevel(b);
                    const blindA = levelA ? (levelA.smallBlind || 0) : 0;
                    const blindB = levelB ? (levelB.smallBlind || 0) : 0;
                    return (blindA - blindB) * dir;
                }
                case 'levels': {
                    const countA = a.items.filter(i => i.type === 'Level').length;
                    const countB = b.items.filter(i => i.type === 'Level').length;
                    return (countA - countB) * dir;
                }
                case 'length': {
                    const durA = a.items.reduce((sum, item) => sum + item.duration, 0);
                    const durB = b.items.reduce((sum, item) => sum + item.duration, 0);
                    return (durA - durB) * dir;
                }
                default:
                    return null;
            }
        }
    });

    // --- Columns ---
    const blindColumns: Column<TournamentStructure>[] = useMemo(() => [
        { 
            key: 'name', 
            label: t('structures.blindsTable.name'), 
            sortable: true,
            className: 'pl-6 font-bold text-white text-base whitespace-nowrap'
        },
        { 
            key: 'startingChips', 
            label: t('structures.blindsTable.chips'), 
            sortable: true,
            render: (s) => (
                 <div className="flex items-center gap-2 text-brand-green font-mono font-medium text-sm whitespace-nowrap">
                     <Coins size={16} />
                     {s.startingChips.toLocaleString()}
                 </div>
            )
        },
        {
            key: 'blinds',
            label: t('structures.blindsTable.blinds'),
            sortable: true,
            render: (s) => {
                 const firstLevel = getFirstLevel(s);
                 if (!firstLevel) return null;
                 return (
                     <div className="font-mono text-gray-300 font-medium text-sm whitespace-nowrap">
                         {Number(firstLevel.smallBlind).toLocaleString()}/{Number(firstLevel.bigBlind).toLocaleString()}
                         {(firstLevel.ante || 0) > 0 && (
                             <span className="text-gray-500 ml-1">({Number(firstLevel.ante).toLocaleString()})</span>
                         )}
                     </div>
                 );
            }
        },
        {
            key: 'levels',
            label: t('structures.blindsTable.levels'),
            sortable: true,
            render: (s) => (
                 <div className="flex items-center gap-2 text-gray-300 font-medium text-sm whitespace-nowrap">
                     <Hash size={16} className="text-gray-500" />
                     {s.items.filter(i => i.type === 'Level').length} {t('structures.blindsTable.levels')}
                 </div>
            )
        },
        {
            key: 'rebuyLimit',
            label: t('structures.blindsTable.rebuys'),
            sortable: true,
            render: (s) => (
                 <div className="flex items-center gap-2 text-gray-300 font-medium text-sm whitespace-nowrap">
                     <Repeat size={16} className="text-gray-500" />
                     {s.rebuyLimit === 0 ? 'Freezeout' : `${s.rebuyLimit} Limit`}
                 </div>
            )
        },
        {
            key: 'length',
            label: t('structures.blindsTable.length'),
            sortable: true,
            render: (s) => (
                 <div className="flex items-center gap-2 text-white font-bold text-base whitespace-nowrap">
                     <Clock size={16} className="text-brand-green" />
                     {calculateLength(s)}
                 </div>
            )
        },
        {
            key: 'actions',
            label: t('common.actions'),
            className: 'text-right pr-6 whitespace-nowrap',
            render: (s) => (
                 <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button 
                         onClick={() => {
                             setEditingStructure(s);
                             setIsStructFormOpen(true);
                         }}
                         className="p-1.5 text-gray-500 hover:text-white hover:bg-[#333] rounded-full transition-colors"
                         title={t('common.edit')}
                     >
                         <Edit2 size={16} />
                     </button>
                     <DeleteWithConfirmation 
                         onConfirm={() => handleStructDelete(s.id)}
                         itemName={s.name}
                         title="Delete Structure?"
                     />
                 </div>
            )
        }
    ], [t]);

    return (
        <>
            <div className="absolute top-0 right-0 -mt-20"> 
               <button 
                  onClick={openStructCreate}
                  className={`${THEME.buttonPrimary} px-6 py-3 rounded-full font-semibold shadow-lg shadow-green-500/20 flex items-center gap-2 transition-transform hover:scale-105 active:scale-95 whitespace-nowrap`}
              >
                  <Plus size={20} strokeWidth={2.5} />
                  {t('structures.btn.createStructure')}
              </button>
            </div>

            <Table 
                data={filteredStructures}
                columns={blindColumns}
                keyExtractor={(s) => s.id}
                sortConfig={structSortConfig}
                onSort={handleStructSort}
                className="animate-in fade-in slide-in-from-bottom-2"
                emptyState={
                    <div className="flex flex-col items-center justify-center py-8">
                        <div className="w-16 h-16 rounded-full bg-[#111] flex items-center justify-center mx-auto mb-4 border border-[#333]">
                            <Layers size={32} className="opacity-50" />
                        </div>
                        <h3 className="text-lg font-medium mb-2">{t('structures.blindsTable.empty')}</h3>
                        <button onClick={openStructCreate} className="text-brand-green hover:underline">
                            {t('structures.blindsTable.createFirst')}
                        </button>
                    </div>
                }
            />

            <StructureForm 
                isOpen={isStructFormOpen}
                onClose={() => setIsStructFormOpen(false)}
                onSubmit={handleStructSave}
                initialData={editingStructure}
            />
        </>
    );
};

export default BlindsStructureList;
