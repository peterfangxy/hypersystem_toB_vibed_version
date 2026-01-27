
import React, { useMemo } from 'react';
import { 
  Edit2, 
  Copy,
  Plus,
  Search
} from 'lucide-react';
import { Tournament, TournamentStructure, PayoutStructure } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { THEME } from '../../theme';
import { Table, Column } from '../../components/ui/Table';
import { useTableData } from '../../hooks/useTableData';
import DeleteWithConfirmation from '../../components/ui/DeleteWithConfirmation';
import { ControlBar } from '../../components/ui/PageLayout';

interface TemplateListProps {
    templates: Tournament[];
    structures: TournamentStructure[];
    payouts: PayoutStructure[];
    searchQuery: string;
    onSearchChange: (query: string) => void;
    onCreate: () => void;
    onEdit: (t: Tournament) => void;
    onDelete: (id: string) => void;
}

const TemplateList: React.FC<TemplateListProps> = ({
    templates,
    structures,
    payouts,
    searchQuery,
    onSearchChange,
    onCreate,
    onEdit,
    onDelete
}) => {
    const { t } = useLanguage();

    const {
        data: filteredTemplates,
        sortConfig,
        handleSort
    } = useTableData<Tournament>({
        data: templates,
        initialSort: { key: 'name', direction: 'asc' },
        searchQuery: searchQuery,
        searchKeys: ['name']
    });

    const getStructureName = (id?: string) => {
        if (!id) return null;
        return structures.find(s => s.id === id)?.name;
    };
  
    const getPayoutName = (id?: string) => {
        if (!id) return null;
        return payouts.find(p => p.id === id)?.name;
    };

    const columns: Column<Tournament>[] = useMemo(() => [
        {
            key: 'name',
            label: t('tournaments.table.templateName'),
            sortable: true,
            className: 'pl-4',
            cellClassName: 'text-base font-bold text-white',
            render: (t) => t.name
        },
        {
            key: 'estimatedDurationMinutes',
            label: t('tournaments.table.duration'),
            sortable: true,
            cellClassName: 'text-sm font-medium text-gray-300',
            render: (t) => `${Math.floor(t.estimatedDurationMinutes / 60)}h ${t.estimatedDurationMinutes % 60 > 0 ? `${t.estimatedDurationMinutes % 60}m` : ''}`
        },
        {
            key: 'buyIn',
            label: t('tournaments.table.buyIn'),
            sortable: true,
            cellClassName: 'text-sm font-bold text-brand-green',
            render: (t) => <span>${t.buyIn} <span className="text-gray-500 text-xs font-normal">+ ${t.fee}</span></span>
        },
        {
            key: 'structureId',
            label: t('tournaments.table.structure'),
            render: (t) => getStructureName(t.structureId) ? (
                <span className="text-sm font-medium text-white">{getStructureName(t.structureId)}</span>
            ) : (
                <span className="text-sm font-medium text-gray-500 italic">Custom</span>
            )
        },
        {
            key: 'rebuyLimit',
            label: t('tournaments.table.rebuys'),
            sortable: true,
            headerClassName: 'text-center',
            cellClassName: 'text-center text-sm font-medium text-gray-300',
            render: (t) => (
                <span className={t.rebuyLimit >= 99 ? 'text-brand-green font-bold' : ''}>
                    {t.rebuyLimit === 0 ? '0' : (t.rebuyLimit >= 99 ? 'Unlimited' : `${t.rebuyLimit}`)}
                </span>
            )
        },
        {
            key: 'payoutStructureId',
            label: t('tournaments.table.payoutModel'),
            render: (t) => getPayoutName(t.payoutStructureId) ? (
                <span className="text-sm text-white">{getPayoutName(t.payoutStructureId)}</span>
            ) : (
                <span className="text-sm text-gray-500">{t.payoutModel}</span>
            )
        },
        {
            key: 'maxPlayers',
            label: t('tournaments.form.maxPlayers'),
            sortable: true,
            headerClassName: 'text-center',
            cellClassName: 'text-center text-sm font-medium text-gray-300',
            render: (t) => <span className="text-white">{t.maxPlayers}</span>
        },
        {
            key: 'actions',
            label: t('common.actions'),
            className: 'pr-4 text-right',
            render: (template) => (
                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => onEdit(template)}
                      className="p-1.5 text-gray-500 hover:text-white hover:bg-[#333] rounded-full transition-colors"
                      title={t('common.edit')}
                    >
                        <Edit2 size={16} />
                    </button>
                    <DeleteWithConfirmation 
                        onConfirm={() => onDelete(template.id)}
                        itemName={template.name}
                        title="Delete Template?"
                        className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-[#333] rounded-full transition-colors"
                    />
                </div>
            )
        }
    ], [t, structures, payouts]);

    return (
        <>
            <div className="absolute top-0 right-0 -mt-20"> 
               <button 
                  onClick={onCreate}
                  className={`${THEME.buttonPrimary} px-6 py-3 rounded-full font-semibold shadow-lg shadow-green-500/20 flex items-center gap-2 transition-transform hover:scale-105 active:scale-95 whitespace-nowrap`}
              >
                  <Plus size={20} strokeWidth={2.5} />
                  {t('tournaments.btn.createTemplate')}
              </button>
            </div>

            <ControlBar>
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input 
                        type="text"
                        placeholder={t('tournaments.filter.searchTemplates')}
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className={`w-full ${THEME.card} border ${THEME.border} rounded-xl pl-11 pr-4 py-2.5 text-white placeholder:text-gray-600 focus:ring-1 focus:ring-brand-green outline-none transition-all`}
                    />
                </div>
            </ControlBar>

            <Table 
                data={filteredTemplates}
                columns={columns}
                keyExtractor={(t) => t.id}
                sortConfig={sortConfig}
                onSort={handleSort}
                emptyState={
                    <div className="flex flex-col items-center justify-center py-8">
                        <div className="w-16 h-16 rounded-full bg-[#111] flex items-center justify-center mx-auto mb-4 border border-[#333]">
                            <Copy size={32} className="opacity-50" />
                        </div>
                        <h3 className="text-lg font-medium mb-2">{t('tournaments.table.emptyTemplates')}</h3>
                    </div>
                }
            />
        </>
    );
};

export default TemplateList;
