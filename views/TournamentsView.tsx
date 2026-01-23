
import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Edit2, 
  Clock, 
  Trophy, 
  Search, 
  ArrowUpDown, 
  Filter, 
  Users, 
  Flag, 
  Play, 
  Ticket, 
  Copy, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  Timer
} from 'lucide-react';
import { Routes, Route, Navigate, NavLink, useLocation } from 'react-router-dom';
import { Tournament, TournamentStatus, TournamentStructure, PayoutStructure } from '../types';
import * as DataService from '../services/dataService';
import { THEME } from '../theme';
import TournamentForm from '../components/TournamentForm';
import TournamentDetailPanel from '../components/TournamentDetailPanel';
import { useLanguage } from '../contexts/LanguageContext';

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

  // Filtering & Sorting State (Shared or lifted)
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Tournament; direction: 'asc' | 'desc' }>({ 
    key: 'startDate', 
    direction: 'asc' 
  });

  useEffect(() => {
    refreshData();
  }, []);

  // Reset search when switching tabs for cleaner UX
  useEffect(() => {
    setSearchQuery('');
    setStatusFilter('All');
    setExpandedTournamentId(null);
  }, [isTemplatesTab]);

  // Handle Auto-Scroll on Expand
  useEffect(() => {
    if (expandedTournamentId) {
        // Use a timeout to ensure DOM layout has settled after expand/collapse animations or state updates
        const timer = setTimeout(() => {
            const container = scrollContainerRef.current;
            const row = document.getElementById(`tournament-row-${expandedTournamentId}`);
            
            if (container && row) {
                const containerRect = container.getBoundingClientRect();
                const rowRect = row.getBoundingClientRect();
                const currentScroll = container.scrollTop;
                
                // Calculate position relative to container
                const relativeTop = rowRect.top - containerRect.top;
                
                // Target offset: 30px from top (matching sticky position)
                const targetOffset = 30;
                const diff = relativeTop - targetOffset;

                // Only scroll if not already in position (with small tolerance)
                if (Math.abs(diff) > 2) {
                    container.scrollTo({
                        top: currentScroll + diff,
                        behavior: 'smooth'
                    });
                }
            }
        }, 150); // 150ms delay for layout stability
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
  
  const handleStatusChange = (tournament: Tournament, newStatus: TournamentStatus) => {
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

  const handleSort = (key: keyof Tournament) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
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

  const getStatusStyle = (status?: TournamentStatus) => {
      if (!status) return '';
      switch(status) {
          case 'Scheduled': return THEME.statusScheduled;
          case 'Registration': return THEME.statusRegistration;
          case 'In Progress': return THEME.statusInProgress;
          case 'Completed': return THEME.statusCompleted;
          case 'Cancelled': return THEME.statusCancelled;
      }
  };

  const getValidStatusOptions = (currentStatus?: TournamentStatus): TournamentStatus[] => {
      if (!currentStatus) return [];
      switch(currentStatus) {
          case 'Scheduled':
              return ['Scheduled', 'Registration', 'Cancelled'];
          case 'Registration':
              return ['Registration', 'In Progress', 'Cancelled'];
          case 'In Progress':
              return ['In Progress', 'Cancelled'];
          default:
              return [currentStatus];
      }
  };

  const SortHeader = ({ label, sortKey, className = "" }: { label: string, sortKey: keyof Tournament, className?: string }) => (
    <th 
      className={`px-2 py-3 cursor-pointer hover:text-white transition-colors group select-none sticky top-0 bg-[#1A1A1A] z-30 border-b border-[#262626] whitespace-nowrap ${className}`}
      onClick={() => handleSort(sortKey)}
    >
      <div className={`flex items-center gap-2 ${className.includes('text-right') ? 'justify-end' : ''}`}>
        {label}
        <ArrowUpDown size={14} className={`text-gray-600 group-hover:text-gray-400 ${sortConfig.key === sortKey ? 'text-brand-green' : ''}`} />
      </div>
    </th>
  );

  const StaticHeader = ({ label, className = "" }: { label: string, className?: string }) => (
    <th className={`px-2 py-3 sticky top-0 bg-[#1A1A1A] z-30 text-gray-500 font-bold border-b border-[#262626] whitespace-nowrap ${className}`}>
        {label}
    </th>
  );

  // --- Render Views as Variables ---

  const filteredTournaments = tournaments
        .filter(t => {
            const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
            return matchesSearch && matchesStatus;
        })
        .sort((a, b) => {
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];
            if (aValue === undefined || bValue === undefined) return 0;
            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });

  const manageView = (
        <div className={`${THEME.card} border ${THEME.border} rounded-3xl overflow-hidden flex flex-col shadow-xl animate-in fade-in slide-in-from-bottom-2 flex-1 min-h-0 mb-3`}>
            {filteredTournaments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500 h-full">
                <div className="w-16 h-16 rounded-full bg-[#111] flex items-center justify-center mb-4">
                <Trophy size={32} className="opacity-50" />
                </div>
                <p className="text-lg font-medium mb-4">{t('tournaments.table.empty')}</p>
                {tournaments.length === 0 && (
                <button 
                    onClick={openCreate}
                    className="text-brand-green hover:underline"
                >
                    {t('tournaments.table.createFirst')}
                </button>
                )}
            </div>
            ) : (
            <div ref={scrollContainerRef} className="overflow-y-auto h-full relative">
                <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="text-xs uppercase text-gray-500 font-bold tracking-wider">
                    <SortHeader label={t('tournaments.table.status')} sortKey="status" className="pl-4 w-[130px]" />
                    <SortHeader label={t('tournaments.table.date')} sortKey="startDate" />
                    <SortHeader label={t('tournaments.table.time')} sortKey="startTime" />
                    <StaticHeader label={t('tournaments.table.duration')} />
                    <SortHeader label={t('tournaments.table.tournament')} sortKey="name" className="w-[22%]" />
                    <SortHeader label={t('tournaments.table.buyIn')} sortKey="buyIn" />
                    <StaticHeader label={t('tournaments.table.structure')} className="w-[15%]" />
                    <StaticHeader label={t('tournaments.table.rebuys')} />
                    <StaticHeader label={t('tournaments.table.players')} className="w-[12%]" />
                    <th className="px-2 py-3 pr-4 text-right sticky top-0 bg-[#1A1A1A] z-30 border-b border-[#262626] whitespace-nowrap">{t('common.actions')}</th>
                    </tr>
                </thead>
                {/* 
                    Using separate tbodies to enable sticky grouping.
                    Sticky only works within the containing block (tbody in this case).
                    So the row will stick to top of scroll container until the tbody is scrolled out.
                */}
                {filteredTournaments.map((tournament) => {
                    const isExpanded = expandedTournamentId === tournament.id;
                    return (
                        <tbody key={tournament.id} className="border-b border-[#262626]">
                            <tr 
                                id={`tournament-row-${tournament.id}`}
                                onClick={() => toggleExpand(tournament.id)}
                                className={`cursor-pointer transition-colors group ${
                                    isExpanded 
                                    ? 'bg-[#222] sticky top-[30px] z-20' 
                                    : 'hover:bg-[#222]'
                                }`}
                            >
                                <td className="px-2 py-3 pl-4" onClick={(e) => e.stopPropagation()}>
                                {(tournament.status === 'Completed' || tournament.status === 'Cancelled') ? (
                                    <span className={`inline-block text-[10px] font-bold uppercase tracking-wider border rounded py-1 px-2 text-center min-w-[100px] cursor-default ${getStatusStyle(tournament.status)}`}>
                                        {tournament.status}
                                    </span>
                                ) : (
                                    <select
                                        value={tournament.status}
                                        onChange={(e) => handleStatusChange(tournament, e.target.value as TournamentStatus)}
                                        className={`text-[10px] font-bold uppercase tracking-wider border rounded py-0.5 px-2 outline-none cursor-pointer appearance-none text-center min-w-[100px] transition-colors ${getStatusStyle(tournament.status)}`}
                                    >
                                        {getValidStatusOptions(tournament.status).map(opt => (
                                            <option key={opt} value={opt} className="bg-[#171717] text-white">
                                                {opt}
                                            </option>
                                        ))}
                                    </select>
                                )}
                                </td>
                                <td className="px-2 py-3 text-sm font-medium text-gray-300 whitespace-nowrap">
                                {tournament.startDate && new Date(tournament.startDate).toLocaleDateString(undefined, {
                                    month: 'short', 
                                    day: 'numeric',
                                    year: 'numeric'
                                })}
                                </td>
                                <td className="px-2 py-3 text-sm font-medium text-white whitespace-nowrap">
                                    {tournament.startTime}
                                </td>
                                <td className="px-2 py-3">
                                    <div className="text-xs text-gray-400 flex items-center gap-1.5 whitespace-nowrap">
                                        <Clock size={14} />
                                        {Math.floor(tournament.estimatedDurationMinutes / 60)}h {tournament.estimatedDurationMinutes % 60 > 0 ? `${tournament.estimatedDurationMinutes % 60}m` : ''}
                                    </div>
                                </td>
                                <td className="px-2 py-3 max-w-[200px]">
                                    <div className="text-sm font-bold text-white whitespace-nowrap overflow-hidden text-ellipsis" title={tournament.name}>
                                        {tournament.name}
                                    </div>
                                </td>
                                <td className="px-2 py-3">
                                <div className="text-sm font-bold text-brand-green whitespace-nowrap">
                                    ${tournament.buyIn} <span className="text-gray-500 text-xs font-normal">+ ${tournament.fee}</span>
                                </div>
                                </td>
                                <td className="px-2 py-3 max-w-[140px]">
                                    {getStructureName(tournament.structureId) ? (
                                        <div className="text-sm font-medium text-white truncate" title={getStructureName(tournament.structureId) || ''}>
                                            {getStructureName(tournament.structureId)}
                                        </div>
                                    ) : (
                                        <span className="text-sm font-medium text-gray-500 italic">Custom</span>
                                    )}
                                </td>
                                <td className="px-2 py-3">
                                    {tournament.rebuyLimit > 0 ? (
                                        <span className="text-xs font-bold text-orange-400 bg-orange-400/10 px-2 py-1 rounded border border-orange-400/20 whitespace-nowrap">
                                            {tournament.rebuyLimit} Rebuy{tournament.rebuyLimit > 1 ? 's' : ''}
                                        </span>
                                    ) : (
                                        <span className="text-xs font-bold text-blue-400 bg-blue-400/10 px-2 py-1 rounded border border-blue-400/20 whitespace-nowrap">
                                            Freezeout
                                        </span>
                                    )}
                                </td>
                                <td className="px-2 py-3 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                        <Users size={16} className="text-gray-500" />
                                        <span className="font-bold text-white">
                                            {registrationCounts[tournament.id] || 0}
                                            <span className="text-gray-500 font-normal"> / {tournament.maxPlayers}</span>
                                        </span>
                                    </div>
                                </td>
                                <td className="px-2 py-3 pr-4 text-right" onClick={(e) => e.stopPropagation()}>
                                <div className="flex justify-end gap-2 items-center">
                                    {/* Action Buttons */}
                                    <button 
                                        onClick={() => toggleExpand(tournament.id)}
                                        className={`flex items-center justify-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap min-w-[90px] ${
                                            isExpanded 
                                            ? 'bg-brand-green text-black' 
                                            : 'bg-[#222] text-gray-400 hover:bg-[#333] hover:text-white'
                                        }`}
                                    >
                                        {isExpanded ? (
                                            <>{t('common.close')} <ChevronUp size={14} /></>
                                        ) : (
                                            <>{t('common.manage')} <ChevronDown size={14} /></>
                                        )}
                                    </button>

                                    <button 
                                        onClick={() => openEdit(tournament)}
                                        disabled={tournament.status === 'Completed' || tournament.status === 'Cancelled'}
                                        className={`p-1.5 rounded-full transition-colors ${
                                            tournament.status === 'Completed' || tournament.status === 'Cancelled'
                                            ? 'text-gray-700 cursor-not-allowed'
                                            : 'text-gray-500 hover:text-white hover:bg-[#333]'
                                        }`}
                                        title={t('common.edit')}
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                </div>
                                </td>
                            </tr>
                            
                            {/* Expandable Detail Panel */}
                            {isExpanded && (
                                <tr>
                                    <td colSpan={10} className="p-0 border-b border-[#262626]">
                                        <TournamentDetailPanel 
                                            tournament={tournament} 
                                            onUpdate={refreshData}
                                            onClose={() => setExpandedTournamentId(null)}
                                        />
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    );
                })}
                </table>
            </div>
            )}
        </div>
  );

  const filteredTemplates = templates.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const templatesView = (
        <div className={`${THEME.card} border ${THEME.border} rounded-3xl overflow-hidden flex flex-col shadow-xl animate-in fade-in slide-in-from-bottom-2 flex-1 min-h-0 mb-3`}>
             {filteredTemplates.length === 0 ? (
                 <div className="flex flex-col items-center justify-center py-20 text-gray-500 h-full">
                    <div className="w-16 h-16 rounded-full bg-[#111] flex items-center justify-center mb-4">
                        <Copy size={32} className="opacity-50" />
                    </div>
                    <p className="text-lg font-medium mb-4">{t('tournaments.table.emptyTemplates')}</p>
                    <button 
                        onClick={openCreate}
                        className="text-brand-green hover:underline"
                    >
                        {t('tournaments.table.createFirstTemplate')}
                    </button>
                 </div>
             ) : (
                 <div className="overflow-y-auto h-full">
                     <table className="w-full text-left border-collapse">
                         <thead>
                             <tr className="bg-[#1A1A1A] border-b border-[#262626] text-xs uppercase text-gray-500 font-bold tracking-wider">
                                 <th className="px-2 py-3 pl-4 whitespace-nowrap">{t('tournaments.table.templateName')}</th>
                                 <th className="px-2 py-3 whitespace-nowrap">{t('tournaments.table.estDuration')}</th>
                                 <th className="px-2 py-3 whitespace-nowrap">{t('tournaments.table.buyIn')}</th>
                                 <th className="px-2 py-3 whitespace-nowrap">{t('tournaments.table.structure')}</th>
                                 <th className="px-2 py-3 whitespace-nowrap">{t('tournaments.table.payoutModel')}</th>
                                 <th className="px-2 py-3 pr-4 text-right whitespace-nowrap">{t('common.actions')}</th>
                             </tr>
                         </thead>
                         <tbody className="divide-y divide-[#262626]">
                             {filteredTemplates.map(template => (
                                 <tr key={template.id} className="hover:bg-[#222] transition-colors group">
                                     <td className="px-2 py-3 pl-4">
                                         <span className="text-base font-bold text-white">{template.name}</span>
                                     </td>
                                     <td className="px-2 py-3">
                                         <div className="text-sm font-medium text-gray-300">
                                            {Math.floor(template.estimatedDurationMinutes / 60)}h {template.estimatedDurationMinutes % 60 > 0 ? `${template.estimatedDurationMinutes % 60}m` : ''}
                                         </div>
                                     </td>
                                     <td className="px-2 py-3">
                                        <div className="text-sm font-bold text-brand-green">
                                            ${template.buyIn} <span className="text-gray-500 text-xs font-normal">+ ${template.fee}</span>
                                        </div>
                                     </td>
                                     <td className="px-2 py-3">
                                         {getStructureName(template.structureId) ? (
                                            <span className="text-sm font-medium text-white">{getStructureName(template.structureId)}</span>
                                        ) : (
                                            <span className="text-sm font-medium text-gray-500 italic">Custom</span>
                                        )}
                                     </td>
                                     <td className="px-2 py-3">
                                        {getPayoutName(template.payoutStructureId) ? (
                                            <span className="text-sm text-white">{getPayoutName(template.payoutStructureId)}</span>
                                        ) : (
                                            <span className="text-sm text-gray-500">{template.payoutModel}</span>
                                        )}
                                     </td>
                                     <td className="px-2 py-3 pr-4 text-right">
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
                                     </td>
                                 </tr>
                             ))}
                         </tbody>
                     </table>
                 </div>
             )}
          </div>
  );

  return (
     <div className="h-full flex flex-col w-full">
      {/* Header */}
      <div className="flex justify-between items-end mb-5">
        <div>
          <h2 className="text-4xl font-bold text-white mb-2">{t('tournaments.title')}</h2>
          <p className="text-gray-400">{t('tournaments.subtitle')}</p>
        </div>
        <button 
          onClick={openCreate}
          className={`${THEME.buttonPrimary} px-6 py-3 rounded-full font-semibold shadow-lg shadow-green-500/20 flex items-center gap-2 transition-transform hover:scale-105 active:scale-95`}
        >
          <Plus size={20} strokeWidth={2.5} />
          {isTemplatesTab ? t('tournaments.btn.createTemplate') : t('tournaments.btn.createEvent')}
        </button>
      </div>

       {/* Tabs Navigation */}
      <div className="flex gap-8 mb-4 border-b border-[#222]">
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
      </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
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
        
        {/* Status Filter - Only for Manage Tab */}
        {!isTemplatesTab && (
            <div className="relative min-w-[200px]">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`w-full ${THEME.card} border ${THEME.border} rounded-xl pl-11 pr-4 py-2.5 text-white outline-none appearance-none cursor-pointer focus:ring-1 focus:ring-brand-green`}
            >
                <option value="All">{t('tournaments.filter.status')}</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Registration">Registration</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
            </select>
            </div>
        )}
      </div>

      <Routes>
          <Route path="manage" element={manageView} />
          <Route path="templates" element={templatesView} />
          <Route index element={<Navigate to="manage" replace />} />
      </Routes>

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
