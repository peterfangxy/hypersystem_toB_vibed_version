import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Plus, 
  Edit2, 
  Clock, 
  Trophy, 
  Search, 
  Users, 
  Copy, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  DoorOpen,
  Play,
  CheckCircle
} from 'lucide-react';
import { Routes, Route, Navigate, NavLink, useLocation } from 'react-router-dom';
import { Tournament, TournamentStatus, TournamentStructure, PayoutStructure } from '../types';
import * as DataService from '../services/dataService';
import { THEME } from '../theme';
import TournamentForm from '../components/TournamentForm';
import TournamentDetailPanel from '../components/TournamentDetailPanel';
import { useLanguage } from '../contexts/LanguageContext';
import { PageHeader, TabContainer, ControlBar } from '../components/ui/PageLayout';
import StatusBadge, { StatusVariant } from '../components/ui/StatusBadge';
import { Table, Column } from '../components/ui/Table';
import { SortDirection } from '../components/ui/ColumnHeader';
import { useTableData } from '../hooks/useTableData';

const TournamentsView = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const isTemplatesTab = location.pathname.includes('/templates');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [templates, setTemplates] = useState<Tournament[]>([]);
  const [structures, setStructures] = useState<TournamentStructure[]>([]);
  const [payouts, setPayouts] = useState<PayoutStructure[]>([]);
  const [registrationCounts, setRegistrationCounts] = useState<Record<string, number>>({});

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTournament, setEditingTournament] = useState<Tournament | undefined>(undefined);
  
  // Accordion State
  const [expandedTournamentId, setExpandedTournamentId] = useState<string | null>(null);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');

  // Use the Hook
  const { 
      data: filteredTournaments, 
      sortConfig, 
      filters, 
      handleSort, 
      handleFilter,
      setFilters 
  } = useTableData<Tournament>({
      data: tournaments,
      initialSort: { key: 'startDate', direction: 'desc' },
      searchQuery: searchQuery,
      searchKeys: ['name'],
      customSort: (a, b, key, direction) => {
          // Specific handling for Date sorting to include Time
          if (key === 'startDate' && a.startDate && b.startDate && a.startTime && b.startTime) {
              const dir = direction === 'asc' ? 1 : -1;
              const dateA = new Date(`${a.startDate}T${a.startTime}`);
              const dateB = new Date(`${b.startDate}T${b.startTime}`);
              return dateA < dateB ? -1 * dir : 1 * dir;
          }
          return null; // Fallback to default
      }
  });

  const {
      data: filteredTemplates,
      sortConfig: templateSortConfig,
      handleSort: handleTemplateSort
  } = useTableData<Tournament>({
      data: templates,
      initialSort: { key: 'name', direction: 'asc' },
      searchQuery: searchQuery,
      searchKeys: ['name']
  });

  useEffect(() => {
    refreshData();
  }, []);

  // Reset search when switching tabs for cleaner UX
  useEffect(() => {
    setSearchQuery('');
    setFilters({});
    setExpandedTournamentId(null);
  }, [isTemplatesTab]);

  // Handle Auto-Scroll on Expand - Logic moved to rely on table row IDs
  useEffect(() => {
    if (expandedTournamentId) {
        // Use a timeout to ensure DOM layout has settled after expand/collapse animations or state updates
        const timer = setTimeout(() => {
            const row = document.getElementById(`tournament-row-${expandedTournamentId}`);
            if (row) {
                // Use 'start' to snap the sticky row to the top (under the header)
                row.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 150); 
        return () => clearTimeout(timer);
    }
  }, [expandedTournamentId]);

  const refreshData = () => {
    setTournaments(DataService.getTournaments());
    setTemplates(DataService.getTournamentTemplates());
    setStructures(DataService.getTournamentStructures());
    setPayouts(DataService.getPayoutStructures());
    
    // Calculate registration counts
    const allRegs = DataService.getAllRegistrations();
    const counts: Record<string, number> = {};
    allRegs.forEach(r => {
        if (r.status !== 'Cancelled') {
            counts[r.tournamentId] = (counts[r.tournamentId] || 0) + 1;
        }
    });
    setRegistrationCounts(counts);
  };

  const handleCreateOrUpdate = (tournament: Tournament) => {
    if (isTemplatesTab) {
        DataService.saveTournamentTemplate(tournament);
    } else {
        DataService.saveTournament(tournament);
    }
    refreshData();
    setIsFormOpen(false);
    setEditingTournament(undefined);
  };

  const handleDeleteTemplate = (id: string) => {
      if(window.confirm('Are you sure you want to delete this template?')) {
          DataService.deleteTournamentTemplate(id);
          refreshData();
      }
  };
  
  const handleStatusChange = (e: React.MouseEvent, tournament: Tournament, newStatus: TournamentStatus) => {
      e.stopPropagation();
      const updated = { ...tournament, status: newStatus };
      DataService.saveTournament(updated);
      refreshData();
  };

  const openCreate = () => {
    setEditingTournament(undefined);
    setIsFormOpen(true);
  };

  const openEdit = (tournament: Tournament) => {
    setEditingTournament(tournament);
    setIsFormOpen(true);
  };
  
  const toggleExpand = (id: string) => {
      setExpandedTournamentId(prev => prev === id ? null : id);
  };

  // --- Helpers for Render ---
  const getStructureName = (id?: string) => {
      if (!id) return null;
      return structures.find(s => s.id === id)?.name;
  };

  const getPayoutName = (id?: string) => {
      if (!id) return null;
      return payouts.find(p => p.id === id)?.name;
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

  // --- Column Definitions ---
  const statusOptions = [
      { label: 'Scheduled', value: 'Scheduled', color: '#3b82f6' },
      { label: 'Registration', value: 'Registration', color: '#22c55e' },
      { label: 'In Progress', value: 'In Progress', color: '#eab308' },
      { label: 'Completed', value: 'Completed', color: '#9ca3af' },
      { label: 'Cancelled', value: 'Cancelled', color: '#ef4444' }
  ];

  const tournamentColumns: Column<Tournament>[] = useMemo(() => [
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
                  {t.status}
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
          className: 'text-center text-sm font-medium text-gray-300'
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
                        onClick={() => openEdit(tournament)}
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

  const templateColumns: Column<Tournament>[] = useMemo(() => [
      {
          key: 'name',
          label: t('tournaments.table.templateName'),
          sortable: true,
          className: 'pl-4',
          render: (t) => <span className="text-base font-bold text-white">{t.name}</span>
      },
      {
          key: 'estimatedDurationMinutes',
          label: t('tournaments.table.estDuration'),
          className: 'text-sm font-medium text-gray-300',
          render: (t) => `${Math.floor(t.estimatedDurationMinutes / 60)}h ${t.estimatedDurationMinutes % 60 > 0 ? `${t.estimatedDurationMinutes % 60}m` : ''}`
      },
      {
          key: 'buyIn',
          label: t('tournaments.table.buyIn'),
          className: 'text-sm font-bold text-brand-green',
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
          key: 'payoutStructureId',
          label: t('tournaments.table.payoutModel'),
          render: (t) => getPayoutName(t.payoutStructureId) ? (
              <span className="text-sm text-white">{getPayoutName(t.payoutStructureId)}</span>
          ) : (
              <span className="text-sm text-gray-500">{t.payoutModel}</span>
          )
      },
      {
          key: 'actions',
          label: t('common.actions'),
          className: 'pr-4 text-right',
          render: (template) => (
              <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => openEdit(template)}
                    className="p-1.5 text-gray-500 hover:text-white hover:bg-[#333] rounded-full transition-colors"
                    title={t('common.edit')}
                  >
                      <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => handleDeleteTemplate(template.id)}
                    className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-[#333] rounded-full transition-colors"
                    title={t('common.delete')}
                  >
                      <Trash2 size={16} />
                  </button>
              </div>
          )
      }
  ], [t, structures, payouts]);

  return (
     <div className="h-full flex flex-col w-full">
      <PageHeader
        title={t('tournaments.title')}
        subtitle={t('tournaments.subtitle')}
        actions={
            <button 
                onClick={openCreate}
                className={`${THEME.buttonPrimary} px-6 py-3 rounded-full font-semibold shadow-lg shadow-green-500/20 flex items-center gap-2 transition-transform hover:scale-105 active:scale-95`}
            >
                <Plus size={20} strokeWidth={2.5} />
                {isTemplatesTab ? t('tournaments.btn.createTemplate') : t('tournaments.btn.createEvent')}
            </button>
        }
      />

       {/* Tabs Navigation */}
      <TabContainer>
        <NavLink
          to="manage"
          className={({isActive}) => `pb-2.5 px-2 text-sm font-bold uppercase tracking-wider transition-all relative ${
            isActive 
              ? 'text-white' 
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
            {({isActive}) => (
                <>
                    <div className="flex items-center gap-2">
                        <Trophy size={18} />
                        {t('tournaments.tabs.manage')}
                    </div>
                    {isActive && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-green shadow-[0_0_10px_rgba(6,193,103,0.5)]" />
                    )}
                </>
            )}
        </NavLink>

        <NavLink
          to="templates"
          className={({isActive}) => `pb-2.5 px-2 text-sm font-bold uppercase tracking-wider transition-all relative ${
            isActive 
              ? 'text-white' 
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
             {({isActive}) => (
                <>
                    <div className="flex items-center gap-2">
                        <Copy size={18} />
                        {t('tournaments.tabs.templates')}
                    </div>
                    {isActive && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-green shadow-[0_0_10px_rgba(6,193,103,0.5)]" />
                    )}
                </>
             )}
        </NavLink>
      </TabContainer>

      {/* Control Bar */}
      <ControlBar>
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text"
            placeholder={isTemplatesTab ? t('tournaments.filter.searchTemplates') : t('tournaments.filter.search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full ${THEME.card} border ${THEME.border} rounded-xl pl-11 pr-4 py-2.5 text-white placeholder:text-gray-600 focus:ring-1 focus:ring-brand-green outline-none transition-all`}
          />
        </div>
      </ControlBar>

      <div className="flex-1 min-h-0 flex flex-col">
        <Routes>
            <Route path="manage" element={
                <Table 
                    data={filteredTournaments}
                    columns={tournamentColumns}
                    keyExtractor={(t) => t.id}
                    sortConfig={sortConfig}
                    onSort={handleSort}
                    filters={filters}
                    onFilter={handleFilter}
                    onRowClick={(t) => toggleExpand(t.id)}
                    rowId={(t) => `tournament-row-${t.id}`}
                    isRowExpanded={(t) => expandedTournamentId === t.id}
                    // Adjusted top position to 34px to tuck slightly under 40px header, creating a seamless seal
                    // Removed bottom border to merge visually with the detail panel
                    rowClassName={(t) => expandedTournamentId === t.id ? 'bg-[#222] sticky top-[34px] z-20 shadow-xl border-b-0' : ''}
                    renderExpandedRow={(t) => (
                        <TournamentDetailPanel 
                            tournament={t} 
                            onUpdate={refreshData}
                            onClose={() => setExpandedTournamentId(null)}
                        />
                    )}
                    emptyState={
                        <div className="flex flex-col items-center justify-center py-8">
                            <div className="w-16 h-16 rounded-full bg-[#111] flex items-center justify-center mx-auto mb-4 border border-[#333]">
                                <Trophy size={32} className="opacity-50" />
                            </div>
                            <h3 className="text-lg font-medium mb-2">{t('tournaments.table.empty')}</h3>
                            {tournaments.length === 0 && (
                                <button onClick={openCreate} className="text-brand-green hover:underline">
                                    {t('tournaments.table.createFirst')}
                                </button>
                            )}
                        </div>
                    }
                />
            } />
            
            <Route path="templates" element={
                <Table 
                    data={filteredTemplates}
                    columns={templateColumns}
                    keyExtractor={(t) => t.id}
                    sortConfig={templateSortConfig}
                    onSort={handleTemplateSort}
                    emptyState={
                        <div className="flex flex-col items-center justify-center py-8">
                            <div className="w-16 h-16 rounded-full bg-[#111] flex items-center justify-center mx-auto mb-4 border border-[#333]">
                                <Copy size={32} className="opacity-50" />
                            </div>
                            <h3 className="text-lg font-medium mb-2">{t('tournaments.table.emptyTemplates')}</h3>
                            <button onClick={openCreate} className="text-brand-green hover:underline">
                                {t('tournaments.table.createFirstTemplate')}
                            </button>
                        </div>
                    }
                />
            } />
            
            <Route index element={<Navigate to="manage" replace />} />
        </Routes>
      </div>

      <TournamentForm 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleCreateOrUpdate}
        initialData={editingTournament}
        isTemplateMode={isTemplatesTab}
      />
     </div>
  );
};

export default TournamentsView;