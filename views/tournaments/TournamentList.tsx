
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Clock, 
  Users, 
  Edit2, 
  ChevronDown, 
  ChevronUp, 
  DoorOpen,
  Play,
  CheckCircle,
  Plus,
  Search
} from 'lucide-react';
import { Tournament, TournamentStatus, TournamentStructure, PayoutStructure } from '../../types';
import * as DataService from '../../services/dataService';
import { useLanguage } from '../../contexts/LanguageContext';
import { THEME } from '../../theme';
import StatusBadge, { StatusVariant } from '../../components/ui/StatusBadge';
import { Table, Column } from '../../components/ui/Table';
import { useTableData } from '../../hooks/useTableData';
import TournamentDetailPanel from '../../components/tournament/TournamentDetailPanel';
import { ControlBar } from '../../components/ui/PageLayout';

interface TournamentListProps {
    tournaments: Tournament[];
    structures: TournamentStructure[];
    payouts: PayoutStructure[];
    registrationCounts: Record<string, number>;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    onCreate: () => void;
    onEdit: (t: Tournament) => void;
    onRefresh: () => void;
}

const TournamentList: React.FC<TournamentListProps> = ({
    tournaments,
    structures,
    payouts,
    registrationCounts,
    searchQuery,
    onSearchChange,
    onCreate,
    onEdit,
    onRefresh
}) => {
    const { t } = useLanguage();
    const [expandedTournamentId, setExpandedTournamentId] = useState<string | null>(null);

    // Auto-scroll to expanded row
    useEffect(() => {
        if (expandedTournamentId) {
            const timer = setTimeout(() => {
                const row = document.getElementById(`tournament-row-${expandedTournamentId}`);
                if (row) {
                    row.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 150); 
            return () => clearTimeout(timer);
        }
    }, [expandedTournamentId]);

    const { 
        data: filteredTournaments, 
        sortConfig, 
        filters, 
        handleSort, 
        handleFilter
    } = useTableData<Tournament>({
        data: tournaments,
        initialSort: { key: 'startDate', direction: 'desc' },
        searchQuery: searchQuery,
        searchKeys: ['name'],
        customSort: (a, b, key, direction) => {
            if (key === 'startDate' && a.startDate && b.startDate && a.startTime && b.startTime) {
                const dir = direction === 'asc' ? 1 : -1;
                const dateA = new Date(`${a.startDate}T${a.startTime}`);
                const dateB = new Date(`${b.startDate}T${b.startTime}`);
                return dateA < dateB ? -1 * dir : 1 * dir;
            }
            return null;
        }
    });

    const handleStatusChange = (e: React.MouseEvent, tournament: Tournament, newStatus: TournamentStatus) => {
        e.stopPropagation();
        const updated = { ...tournament, status: newStatus };
        DataService.saveTournament(updated);
        onRefresh();
    };

    const toggleExpand = (id: string) => {
        setExpandedTournamentId(prev => prev === id ? null : id);
    };

    const getStructureName = (id?: string) => {
        if (!id) return null;
        return structures.find(s => s.id === id)?.name;
    };

    const getStatusVariant = (status?: TournamentStatus): StatusVariant => {
        if (!status) return 'neutral';
        switch(status) {
            case 'Scheduled': return 'info';
            case 'Registration': return 'success';
            case 'In Progress': return 'warning';
            case 'Completed': return 'neutral';
            case 'Cancelled': return 'danger';
            default: return 'neutral';
        }
    };

    const getStatusLabel = (status: string) => {
        switch(status) {
            case 'Scheduled': return t('tournaments.statusOption.scheduled');
            case 'Registration': return t('tournaments.statusOption.registration');
            case 'In Progress': return t('tournaments.statusOption.inProgress');
            case 'Completed': return t('tournaments.statusOption.completed');
            case 'Cancelled': return t('tournaments.statusOption.cancelled');
            default: return status;
        }
    };

    const statusOptions = [
        { label: t('tournaments.statusOption.scheduled'), value: 'Scheduled', color: '#3b82f6' },
        { label: t('tournaments.statusOption.registration'), value: 'Registration', color: '#22c55e' },
        { label: t('tournaments.statusOption.inProgress'), value: 'In Progress', color: '#eab308' },
        { label: t('tournaments.statusOption.completed'), value: 'Completed', color: '#9ca3af' },
        { label: t('tournaments.statusOption.cancelled'), value: 'Cancelled', color: '#ef4444' }
    ];

    const columns: Column<Tournament>[] = useMemo(() => [
        {
            key: 'status',
            label: t('tournaments.table.status'),
            sortable: true,
            filterable: true,
            filterType: 'multi-select',
            filterOptions: statusOptions,
            className: 'pl-4 w-[130px]',
            render: (t) => (
                <StatusBadge variant={getStatusVariant(t.status)} className="min-w-[100px] text-center">
                    {getStatusLabel(t.status || '')}
                </StatusBadge>
            )
        },
        {
            key: 'startDate',
            label: t('tournaments.table.date'),
            sortable: true,
            className: 'text-sm font-medium text-gray-300 whitespace-nowrap',
            render: (t) => t.startDate && new Date(t.startDate).toLocaleDateString(undefined, {
                month: 'short', day: 'numeric', year: 'numeric'
            })
        },
        {
            key: 'startTime',
            label: t('tournaments.table.time'),
            sortable: true,
            className: 'text-sm font-medium text-white whitespace-nowrap',
        },
        {
            key: 'duration',
            label: t('tournaments.table.duration'),
            className: 'text-xs text-gray-400',
            render: (t) => (
                <div className="flex items-center gap-1.5 whitespace-nowrap">
                    <Clock size={14} />
                    {Math.floor(t.estimatedDurationMinutes / 60)}h {t.estimatedDurationMinutes % 60 > 0 ? `${t.estimatedDurationMinutes % 60}m` : ''}
                </div>
            )
        },
        {
            key: 'name',
            label: t('tournaments.table.tournament'),
            sortable: true,
            className: 'max-w-[200px]',
            render: (t) => (
                <div className="text-sm font-bold text-white whitespace-nowrap overflow-hidden text-ellipsis" title={t.name}>
                    {t.name}
                </div>
            )
        },
        {
            key: 'buyIn',
            label: t('tournaments.table.buyIn'),
            sortable: true,
            render: (t) => (
                <div className="text-sm font-bold text-brand-green whitespace-nowrap">
                    ${t.buyIn} <span className="text-gray-500 text-xs font-normal">+ ${t.fee}</span>
                </div>
            )
        },
        {
            key: 'structureId',
            label: t('tournaments.table.structure'),
            className: 'max-w-[140px]',
            render: (t) => getStructureName(t.structureId) ? (
                <div className="text-sm font-medium text-white truncate" title={getStructureName(t.structureId) || ''}>
                    {getStructureName(t.structureId)}
                </div>
            ) : (
                <span className="text-sm font-medium text-gray-500 italic">Custom</span>
            )
        },
        {
            key: 'rebuyLimit',
            label: t('tournaments.table.rebuys'),
            headerClassName: 'text-center',
            cellClassName: 'text-center text-sm font-medium text-gray-300',
            render: (t) => (
                <span className={t.rebuyLimit >= 99 ? 'text-brand-green font-bold' : ''}>
                    {t.rebuyLimit === 0 ? '0' : (t.rebuyLimit >= 99 ? 'Unlimited' : t.rebuyLimit)}
                </span>
            )
        },
        {
            key: 'players',
            label: t('tournaments.table.players'),
            render: (t) => (
                <div className="flex items-center gap-2 whitespace-nowrap">
                    <Users size={16} className="text-gray-500" />
                    <span className="font-bold text-white">
                        {registrationCounts[t.id] || 0}
                        <span className="text-gray-500 font-normal"> / {t.maxPlayers}</span>
                    </span>
                </div>
            )
        },
        {
            key: 'actions',
            label: t('common.actions'),
            className: 'pr-4 text-right',
            render: (tournament) => {
                const isExpanded = expandedTournamentId === tournament.id;
                return (
                  <div className="flex justify-end gap-2 items-center" onClick={(e) => e.stopPropagation()}>
                      {/* Quick State Transitions */}
                      {tournament.status === 'Scheduled' && (
                          <button
                              onClick={(e) => handleStatusChange(e, tournament, 'Registration')}
                              className="p-1.5 text-blue-400 hover:text-white hover:bg-blue-500/20 rounded-lg transition-colors border border-transparent hover:border-blue-500/30 group/btn"
                              title="Open Registration"
                          >
                              <div className="flex items-center gap-2 px-1">
                                  <span className="text-xs font-bold uppercase hidden 2xl:inline">Open Reg</span>
                                  <DoorOpen size={16} />
                              </div>
                          </button>
                      )}
                      
                      {tournament.status === 'Registration' && (
                          <button
                              onClick={(e) => handleStatusChange(e, tournament, 'In Progress')}
                              className="p-1.5 text-brand-green hover:text-white hover:bg-green-500/20 rounded-lg transition-colors border border-transparent hover:border-green-500/30 group/btn"
                              title="Start Tournament"
                          >
                              <div className="flex items-center gap-2 px-1">
                                  <span className="text-xs font-bold uppercase hidden 2xl:inline">Start</span>
                                  <Play size={16} fill="currentColor" />
                              </div>
                          </button>
                      )}
  
                      {tournament.status === 'In Progress' && (
                          <button
                              onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedTournamentId(tournament.id);
                              }}
                              className="p-1.5 text-orange-400 hover:text-white hover:bg-orange-500/20 rounded-lg transition-colors border border-transparent hover:border-orange-500/30 group/btn"
                              title="Tally & Finish"
                          >
                              <div className="flex items-center gap-2 px-1">
                                  <span className="text-xs font-bold uppercase hidden 2xl:inline">Finish</span>
                                  <CheckCircle size={16} />
                              </div>
                          </button>
                      )}
  
                      <div className="w-px h-4 bg-[#333] mx-1"></div>
  
                      <button 
                          onClick={() => toggleExpand(tournament.id)}
                          className={`p-1.5 rounded-lg transition-colors ${
                              isExpanded 
                              ? 'bg-[#333] text-white' 
                              : 'text-gray-500 hover:text-white hover:bg-[#222]'
                          }`}
                          title={isExpanded ? t('common.close') : t('common.manage')}
                      >
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
  
                      <button 
                          onClick={() => onEdit(tournament)}
                          className="p-1.5 text-gray-500 hover:text-white hover:bg-[#333] rounded-lg transition-colors"
                          title={t('common.edit')}
                      >
                          <Edit2 size={16} />
                      </button>
                  </div>
                );
            }
        }
    ], [expandedTournamentId, registrationCounts, t, structures]);

    return (
        <>
            <div className="absolute top-0 right-0 -mt-20"> 
               <button 
                  onClick={onCreate}
                  className={`${THEME.buttonPrimary} px-6 py-3 rounded-full font-semibold shadow-lg shadow-green-500/20 flex items-center gap-2 transition-transform hover:scale-105 active:scale-95 whitespace-nowrap`}
              >
                  <Plus size={20} strokeWidth={2.5} />
                  {t('tournaments.btn.createEvent')}
              </button>
            </div>

            <ControlBar>
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input 
                        type="text"
                        placeholder={t('tournaments.filter.search')}
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className={`w-full ${THEME.card} border ${THEME.border} rounded-xl pl-11 pr-4 py-2.5 text-white placeholder:text-gray-600 focus:ring-1 focus:ring-brand-green outline-none transition-all`}
                    />
                </div>
            </ControlBar>

            <Table 
                data={filteredTournaments}
                columns={columns}
                keyExtractor={(t) => t.id}
                sortConfig={sortConfig}
                onSort={handleSort}
                filters={filters}
                onFilter={handleFilter}
                onRowClick={(t) => toggleExpand(t.id)}
                rowId={(t) => `tournament-row-${t.id}`}
                isRowExpanded={(t) => expandedTournamentId === t.id}
                rowClassName={(t) => expandedTournamentId === t.id ? 'bg-[#222] sticky top-[34px] z-20 shadow-xl border-b-0' : ''}
                renderExpandedRow={(t) => (
                    <TournamentDetailPanel 
                        tournament={t} 
                        onUpdate={onRefresh}
                        onClose={() => setExpandedTournamentId(null)}
                    />
                )}
                emptyState={
                    <div className="flex flex-col items-center justify-center py-8">
                        <div className="w-16 h-16 rounded-full bg-[#111] flex items-center justify-center mx-auto mb-4 border border-[#333]">
                            <div className="opacity-50"><Edit2 size={32}/></div> 
                        </div>
                        <h3 className="text-lg font-medium mb-2">{t('tournaments.table.empty')}</h3>
                    </div>
                }
            />
        </>
    );
};

export default TournamentList;
