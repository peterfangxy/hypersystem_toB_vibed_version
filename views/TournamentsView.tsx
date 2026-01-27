
import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Copy
} from 'lucide-react';
import { Routes, Route, Navigate, NavLink, useLocation } from 'react-router-dom';
import { Tournament, TournamentStructure, PayoutStructure } from '../types';
import * as DataService from '../services/dataService';
import TournamentForm from '../components/tournament/TournamentForm';
import { useLanguage } from '../contexts/LanguageContext';
import { PageHeader, TabContainer } from '../components/ui/PageLayout';
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
      />

       {/* Tabs Navigation */}
      <div className="relative">
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
      </div>

      <div className="flex-1 min-h-0 flex flex-col relative">
        <Routes>
            <Route path="manage" element={
                <TournamentList 
                    tournaments={tournaments}
                    structures={structures}
                    payouts={payouts}
                    registrationCounts={registrationCounts}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    onCreate={openCreate}
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
                    onSearchChange={setSearchQuery}
                    onCreate={openCreate}
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
