
import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trophy, 
  Search, 
  Copy
} from 'lucide-react';
import { Routes, Route, Navigate, NavLink, useLocation } from 'react-router-dom';
import { Tournament, TournamentStructure, PayoutStructure } from '../types';
import * as DataService from '../services/dataService';
import { THEME } from '../theme';
import TournamentForm from '../components/tournament/TournamentForm';
import { useLanguage } from '../contexts/LanguageContext';
import { PageHeader, TabContainer, ControlBar } from '../components/ui/PageLayout';
import TournamentList from './tournaments/TournamentList';
import TemplateList from './tournaments/TemplateList';

const TournamentsView = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const isTemplatesTab = location.pathname.includes('/templates');

  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [templates, setTemplates] = useState<Tournament[]>([]);
  const [structures, setStructures] = useState<TournamentStructure[]>([]);
  const [payouts, setPayouts] = useState<PayoutStructure[]>([]);
  const [registrationCounts, setRegistrationCounts] = useState<Record<string, number>>({});

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTournament, setEditingTournament] = useState<Tournament | undefined>(undefined);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    refreshData();
  }, []);

  // Reset search when switching tabs for cleaner UX
  useEffect(() => {
    setSearchQuery('');
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
  
  const openCreate = () => {
    setEditingTournament(undefined);
    setIsFormOpen(true);
  };

  const openEdit = (tournament: Tournament) => {
    setEditingTournament(tournament);
    setIsFormOpen(true);
  };

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
                <TournamentList 
                    tournaments={tournaments}
                    structures={structures}
                    payouts={payouts}
                    registrationCounts={registrationCounts}
                    searchQuery={searchQuery}
                    onEdit={openEdit}
                    onRefresh={refreshData}
                />
            } />
            
            <Route path="templates" element={
                <TemplateList 
                    templates={templates}
                    structures={structures}
                    payouts={payouts}
                    searchQuery={searchQuery}
                    onEdit={openEdit}
                    onDelete={handleDeleteTemplate}
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
