
import React, { useState, useEffect } from 'react';
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
  ChevronUp
} from 'lucide-react';
import { Routes, Route, Navigate, NavLink, useLocation } from 'react-router-dom';
import { Tournament, TournamentStatus, TournamentStructure, PayoutStructure } from '../types';
import * as DataService from '../services/dataService';
import { THEME } from '../theme';
import TournamentForm from './TournamentForm';
import TournamentDetailPanel from './TournamentDetailPanel';

const TournamentsView = () => {
  const location = useLocation();
  const isTemplatesTab = location.pathname.includes('/templates');

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
      className={`px-4 py-3 cursor-pointer hover:text-white transition-colors group select-none ${className}`}
      onClick={() => handleSort(sortKey)}
    >
      <div className={`flex items-center gap-2 ${className.includes('text-right') ? 'justify-end' : ''}`}>
        {label}
        <ArrowUpDown size={14} className={`text-gray-600 group-hover:text-gray-400 ${sortConfig.key === sortKey ? 'text-brand-green' : ''}`} />
      </div>
    </th>
  );

  // --- Sub-Components for Route Rendering ---

  const ManageTournaments = () => {
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

    return (
        <div className={`${THEME.card} border ${THEME.border} rounded-3xl overflow-hidden flex flex-col mb-20 shadow-xl animate-in fade-in slide-in-from-bottom-2`}>
            {filteredTournaments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                <div className="w-16 h-16 rounded-full bg-[#111] flex items-center justify-center mb-4">
                <Trophy size={32} className="opacity-50" />
                </div>
                <p className="text-lg font-medium mb-4">No tournaments found</p>
                {tournaments.length === 0 && (
                <button 
                    onClick={openCreate}
                    className="text-brand-green hover:underline"
                >
                    Create your first event
                </button>
                )}
            </div>
            ) : (
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-[#1A1A1A] border-b border-[#262626] text-xs uppercase text-gray-500 font-bold tracking-wider">
                    <SortHeader label="Status" sortKey="status" className="pl-6" />
                    <SortHeader label="Date" sortKey="startDate" />
                    <SortHeader label="Start Time" sortKey="startTime" />
                    <SortHeader label="Tournament" sortKey="name" />
                    <SortHeader label="Buy-In" sortKey="buyIn" />
                    <th className="px-4 py-3">Structure</th>
                    <th className="px-4 py-3">Players</th>
                    <th className="px-4 py-3 pr-6 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-[#262626]">
                    {filteredTournaments.map((tournament) => {
                        const isExpanded = expandedTournamentId === tournament.id;
                        return (
                        <React.Fragment key={tournament.id}>
                            <tr 
                                onClick={() => toggleExpand(tournament.id)}
                                className={`cursor-pointer transition-colors group ${isExpanded ? 'bg-[#222]' : 'hover:bg-[#222]'}`}
                            >
                                <td className="px-4 py-4 pl-6" onClick={(e) => e.stopPropagation()}>
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
                                <td className="px-4 py-4 text-sm font-medium text-gray-300 whitespace-nowrap">
                                {tournament.startDate && new Date(tournament.startDate).toLocaleDateString(undefined, {
                                    month: 'short', 
                                    day: 'numeric',
                                    year: 'numeric'
                                })}
                                </td>
                                <td className="px-4 py-4">
                                <div className="text-sm font-medium text-white whitespace-nowrap">{tournament.startTime}</div>
                                <div className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                                    <Clock size={12} />
                                    {Math.floor(tournament.estimatedDurationMinutes / 60)}h {tournament.estimatedDurationMinutes % 60 > 0 ? `${tournament.estimatedDurationMinutes % 60}m` : ''}
                                </div>
                                </td>
                                <td className="px-4 py-4">
                                <span className="text-base font-bold text-white">{tournament.name}</span>
                                </td>
                                <td className="px-4 py-4">
                                <div className="text-sm font-bold text-brand-green">
                                    ${tournament.buyIn} <span className="text-gray-500 text-xs font-normal">+ ${tournament.fee}</span>
                                </div>
                                </td>
                                <td className="px-4 py-4">
                                    <div className="flex flex-col gap-0.5">
                                    {getStructureName(tournament.structureId) ? (
                                        <span className="text-sm font-medium text-white">{getStructureName(tournament.structureId)}</span>
                                    ) : (
                                        <span className="text-sm font-medium text-gray-500 italic">Custom Structure</span>
                                    )}
                                    
                                    <div className="flex items-center gap-2">
                                        {getPayoutName(tournament.payoutStructureId) ? (
                                            <span className="text-xs text-brand-green/80">{getPayoutName(tournament.payoutStructureId)}</span>
                                        ) : (
                                            <span className="text-xs text-gray-600">{tournament.payoutModel}</span>
                                        )}
                                        
                                        <span className="text-[10px] text-gray-600">•</span>
                                        
                                        {tournament.rebuyLimit > 0 ? (
                                            <span className="text-xs text-orange-400">{tournament.rebuyLimit}x Rebuy</span>
                                        ) : (
                                            <span className="text-xs text-blue-400">Freezeout</span>
                                        )}
                                    </div>
                                    </div>
                                </td>
                                <td className="px-4 py-4">
                                    <div className="flex items-center gap-2">
                                        <Users size={16} className="text-gray-500" />
                                        <span className="font-bold text-white">
                                            {registrationCounts[tournament.id] || 0}
                                            <span className="text-gray-500 font-normal"> / {tournament.maxPlayers}</span>
                                        </span>
                                    </div>
                                </td>
                                <td className="px-4 py-4 pr-6 text-right" onClick={(e) => e.stopPropagation()}>
                                <div className="flex justify-end gap-2 items-center">
                                    {/* Action Buttons */}
                                    <button 
                                        onClick={() => toggleExpand(tournament.id)}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                                            isExpanded 
                                            ? 'bg-brand-green text-black' 
                                            : 'bg-[#222] text-gray-400 hover:bg-[#333] hover:text-white'
                                        }`}
                                    >
                                        {isExpanded ? (
                                            <>Close <ChevronUp size={14} /></>
                                        ) : (
                                            <>Manage <ChevronDown size={14} /></>
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
                                        title="Edit Tournament"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                </div>
                                </td>
                            </tr>
                            
                            {/* Expandable Detail Panel */}
                            {isExpanded && (
                                <tr>
                                    <td colSpan={8} className="p-0 border-b border-[#262626]">
                                        <TournamentDetailPanel 
                                            tournament={tournament} 
                                            onUpdate={refreshData}
                                            onClose={() => setExpandedTournamentId(null)}
                                        />
                                    </td>
                                </tr>
                            )}
                        </React.Fragment>
                        );
                    })}
                </tbody>
                </table>
            </div>
            )}
        </div>
    );
  };

  const TournamentTemplates = () => {
    const filteredTemplates = templates.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className={`${THEME.card} border ${THEME.border} rounded-3xl overflow-hidden flex flex-col mb-20 shadow-xl animate-in fade-in slide-in-from-bottom-2`}>
             {filteredTemplates.length === 0 ? (
                 <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                    <div className="w-16 h-16 rounded-full bg-[#111] flex items-center justify-center mb-4">
                        <Copy size={32} className="opacity-50" />
                    </div>
                    <p className="text-lg font-medium mb-4">No templates found</p>
                    <button 
                        onClick={openCreate}
                        className="text-brand-green hover:underline"
                    >
                        Create your first template
                    </button>
                 </div>
             ) : (
                 <div className="overflow-x-auto">
                     <table className="w-full text-left border-collapse">
                         <thead>
                             <tr className="bg-[#1A1A1A] border-b border-[#262626] text-xs uppercase text-gray-500 font-bold tracking-wider">
                                 <th className="px-4 py-3 pl-6">Template Name</th>
                                 <th className="px-4 py-3">Est. Duration</th>
                                 <th className="px-4 py-3">Buy-In</th>
                                 <th className="px-4 py-3">Structure</th>
                                 <th className="px-4 py-3">Payout Model</th>
                                 <th className="px-4 py-3 pr-6 text-right">Actions</th>
                             </tr>
                         </thead>
                         <tbody className="divide-y divide-[#262626]">
                             {filteredTemplates.map(template => (
                                 <tr key={template.id} className="hover:bg-[#222] transition-colors group">
                                     <td className="px-4 py-3 pl-6">
                                         <span className="text-base font-bold text-white">{template.name}</span>
                                     </td>
                                     <td className="px-4 py-3">
                                         <div className="text-sm font-medium text-gray-300">
                                            {Math.floor(template.estimatedDurationMinutes / 60)}h {template.estimatedDurationMinutes % 60 > 0 ? `${template.estimatedDurationMinutes % 60}m` : ''}
                                         </div>
                                     </td>
                                     <td className="px-4 py-3">
                                        <div className="text-sm font-bold text-brand-green">
                                            ${template.buyIn} <span className="text-gray-500 text-xs font-normal">+ ${template.fee}</span>
                                        </div>
                                     </td>
                                     <td className="px-4 py-3">
                                         {getStructureName(template.structureId) ? (
                                            <span className="text-sm font-medium text-white">{getStructureName(template.structureId)}</span>
                                        ) : (
                                            <span className="text-sm font-medium text-gray-500 italic">Custom</span>
                                        )}
                                     </td>
                                     <td className="px-4 py-3">
                                        {getPayoutName(template.payoutStructureId) ? (
                                            <span className="text-sm text-white">{getPayoutName(template.payoutStructureId)}</span>
                                        ) : (
                                            <span className="text-sm text-gray-500">{template.payoutModel}</span>
                                        )}
                                     </td>
                                     <td className="px-4 py-3 pr-6 text-right">
                                         <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                             <button 
                                                onClick={() => openEdit(template)}
                                                className="p-1.5 text-gray-500 hover:text-white hover:bg-[#333] rounded-full transition-colors"
                                                title="Edit Template"
                                             >
                                                 <Edit2 size={16} />
                                             </button>
                                             <button 
                                                onClick={() => handleDeleteTemplate(template.id)}
                                                className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-[#333] rounded-full transition-colors"
                                                title="Delete Template"
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
  };

  return (
     <div className="h-full flex flex-col max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-4xl font-bold text-white mb-2">Tournaments</h2>
          <p className="text-gray-400">Schedule events and manage structures</p>
        </div>
        <button 
          onClick={openCreate}
          className={`${THEME.buttonPrimary} px-6 py-3 rounded-full font-semibold shadow-lg shadow-green-500/20 flex items-center gap-2 transition-transform hover:scale-105 active:scale-95`}
        >
          <Plus size={20} strokeWidth={2.5} />
          {isTemplatesTab ? 'Create Template' : 'Create Event'}
        </button>
      </div>

       {/* Tabs Navigation */}
      <div className="flex gap-8 mb-6 border-b border-[#222]">
        <NavLink
          to="manage"
          className={({isActive}) => `pb-4 px-2 text-sm font-bold uppercase tracking-wider transition-all relative ${
            isActive 
              ? 'text-white' 
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
            {({isActive}) => (
                <>
                    <div className="flex items-center gap-2">
                        <Trophy size={18} />
                        Manage Tournaments
                    </div>
                    {isActive && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-green shadow-[0_0_10px_rgba(6,193,103,0.5)]" />
                    )}
                </>
            )}
        </NavLink>

        <NavLink
          to="templates"
          className={({isActive}) => `pb-4 px-2 text-sm font-bold uppercase tracking-wider transition-all relative ${
            isActive 
              ? 'text-white' 
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
             {({isActive}) => (
                <>
                    <div className="flex items-center gap-2">
                        <Copy size={18} />
                        Tournament Templates
                    </div>
                    {isActive && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-green shadow-[0_0_10px_rgba(6,193,103,0.5)]" />
                    )}
                </>
             )}
        </NavLink>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text"
            placeholder={isTemplatesTab ? "Search templates..." : "Search tournaments..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full ${THEME.card} border ${THEME.border} rounded-xl pl-11 pr-4 py-3 text-white placeholder:text-gray-600 focus:ring-1 focus:ring-brand-green outline-none transition-all`}
          />
        </div>
        
        {/* Status Filter - Only for Manage Tab */}
        {!isTemplatesTab && (
            <div className="relative min-w-[200px]">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`w-full ${THEME.card} border ${THEME.border} rounded-xl pl-11 pr-4 py-3 text-white outline-none appearance-none cursor-pointer focus:ring-1 focus:ring-brand-green`}
            >
                <option value="All">All Statuses</option>
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
          <Route path="manage" element={<ManageTournaments />} />
          <Route path="templates" element={<TournamentTemplates />} />
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
