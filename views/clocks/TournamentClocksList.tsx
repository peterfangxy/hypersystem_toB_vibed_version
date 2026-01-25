
import React, { useState, useEffect } from 'react';
import { 
  Maximize2, 
  Radio, 
  Trophy,
  Clock,
  Coins,
  Calendar,
  Users
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Tournament, TournamentRegistration } from '../../types';
import * as DataService from '../../services/dataService';
import { THEME } from '../../theme';
import { useLanguage } from '../../contexts/LanguageContext';

const TournamentClocksList = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [activeTournaments, setActiveTournaments] = useState<Tournament[]>([]);
    const [registrationsMap, setRegistrationsMap] = useState<Record<string, TournamentRegistration[]>>({});

    useEffect(() => {
        refreshData();
        const interval = setInterval(refreshData, 30000);
        return () => clearInterval(interval);
    }, []);

    const refreshData = () => {
        const allTournaments = DataService.getTournaments();
        const inProgress = allTournaments.filter(t => t.status === 'In Progress' || t.status === 'Registration');
        
        inProgress.sort((a, b) => {
            const dateA = new Date(`${a.startDate}T${a.startTime}`).getTime();
            const dateB = new Date(`${b.startDate}T${b.startTime}`).getTime();
            return dateA - dateB;
        });

        setActiveTournaments(inProgress);

        const regMap: Record<string, TournamentRegistration[]> = {};
        inProgress.forEach(t => {
            regMap[t.id] = DataService.getTournamentRegistrations(t.id);
        });
        setRegistrationsMap(regMap);
    };

    const handleOpenClock = async (tournament: Tournament) => {
        try { if (!document.fullscreenElement) await document.documentElement.requestFullscreen(); } catch (e) {}
        navigate(`/clocks/tournaments/${tournament.id}`);
    };

    return (
        <div className="flex-1 animate-in fade-in slide-in-from-bottom-2 mt-4">
           {activeTournaments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-500 border border-dashed border-[#222] rounded-3xl bg-[#111]">
                  <div className="w-16 h-16 rounded-full bg-[#1A1A1A] flex items-center justify-center mb-4 text-gray-600">
                      <Radio size={32} />
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-gray-300">{t('clocks.empty.noTournaments')}</h3>
                  <p className="text-sm max-w-md text-center">{t('clocks.empty.noTournamentsDesc')}</p>
              </div>
           ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeTournaments.map(tournament => {
                      const regs = registrationsMap[tournament.id] || [];
                      const activePlayers = regs.filter(r => r.status !== 'Cancelled').length;
                      const isLive = tournament.status === 'In Progress';
                      
                      const totalBuyIns = regs.reduce((sum, r) => sum + (r.buyInCount || 0), 0);
                      const prizePool = totalBuyIns * tournament.buyIn;

                      return (
                          <div key={tournament.id} className="bg-[#111] border border-[#333] rounded-3xl p-6 flex flex-col hover:border-brand-green/30 transition-colors shadow-xl group">
                              <div className="flex justify-between items-start mb-4">
                                  <div className="flex-1 min-w-0 pr-2">
                                      <div className="flex items-center gap-2 mb-1">
                                          <span className={`w-2 h-2 rounded-full animate-pulse ${isLive ? 'bg-red-500' : 'bg-blue-500'}`}></span>
                                          <span className={`text-xs font-bold ${isLive ? 'text-red-500' : 'text-blue-500'}`}>
                                            {isLive ? 'LIVE' : 'REGISTRATION'}
                                          </span>
                                      </div>
                                      <h3 className="text-xl font-bold text-white truncate" title={tournament.name}>{tournament.name}</h3>
                                  </div>
                                  <div className="p-2 bg-[#222] rounded-full text-gray-400 shrink-0">
                                      <Trophy size={18} />
                                  </div>
                              </div>
                              
                              <div className="flex items-center gap-4 text-gray-400 text-xs mb-4 bg-[#1A1A1A] p-2 rounded-lg border border-[#222]">
                                  <div className="flex items-center gap-1.5">
                                      <Calendar size={14} />
                                      {tournament.startDate ? new Date(tournament.startDate).toLocaleDateString() : 'TBD'}
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                      <Clock size={14} />
                                      {tournament.startTime || 'TBD'}
                                  </div>
                              </div>

                              <div className="flex items-center gap-4 text-gray-500 text-sm mb-6">
                                  <div className="flex items-center gap-1.5">
                                      <Users size={14} />
                                      {activePlayers} Players
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                      <Coins size={14} />
                                      ${prizePool.toLocaleString()} Prize Pool
                                  </div>
                              </div>

                              <button 
                                onClick={() => handleOpenClock(tournament)}
                                className={`mt-auto w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${THEME.buttonPrimary}`}
                              >
                                  <Maximize2 size={18} /> Open Clock
                              </button>
                          </div>
                      );
                  })}
              </div>
           )}
        </div>
    );
};

export default TournamentClocksList;
