
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Trophy, 
  Banknote, 
  Coins, 
  CalendarDays,
  Medal
} from 'lucide-react';
import * as DataService from '../services/dataService';
import { THEME } from '../theme';
import { Tournament } from '../types';
import TournamentForm from '../components/TournamentForm';
import { PageHeader } from '../components/ui/PageLayout';

interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  tournamentsHosted: number;
  prizePoolAwarded: number;
  monthlyRevenue: number;
}

const DashboardView = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalMembers: 0,
    activeMembers: 0,
    tournamentsHosted: 0,
    prizePoolAwarded: 0,
    monthlyRevenue: 0
  });

  const [recentWinners, setRecentWinners] = useState<{tournamentId: string, tournamentName: string, winnerName: string, amount: number, date: string, timestamp: number}[]>([]);

  // Tournament Details Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTournament, setEditingTournament] = useState<Tournament | undefined>(undefined);

  useEffect(() => {
    calculateStats();
  }, []);

  const calculateStats = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const members = DataService.getMembers();
    const tournaments = DataService.getTournaments();
    const allRegistrations = DataService.getAllRegistrations();

    // 1. Total Members
    const totalMembers = members.length;

    // 2. Filter Monthly Tournaments (By Start Date)
    const monthlyTournaments = tournaments.filter(t => {
        if (!t.startDate) return false;
        const d = new Date(t.startDate);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    // 3. Monthly Tournaments Hosted (Completed status only)
    const completedMonthlyTournaments = monthlyTournaments.filter(t => t.status === 'Completed');
    const tournamentsHosted = completedMonthlyTournaments.length;

    // 4. Active Members (Registered for ANY tournament starting this month)
    const monthlyTournamentIds = new Set(monthlyTournaments.map(t => t.id));
    const monthlyRegistrations = allRegistrations.filter(r => monthlyTournamentIds.has(r.tournamentId));
    const uniqueActiveMembers = new Set(monthlyRegistrations.map(r => r.memberId)).size;

    // 5. Financials (From Completed Tournaments only to be accurate)
    let prizePoolAwarded = 0;
    let monthlyRevenue = 0;

    // Efficient lookup map for tournament details
    const tournamentMap = new Map(tournaments.map(t => [t.id, t]));

    // Aggregate from registrations of completed tournaments in this month
    const completedIds = new Set(completedMonthlyTournaments.map(t => t.id));
    const relevantRegistrations = allRegistrations.filter(r => completedIds.has(r.tournamentId));

    relevantRegistrations.forEach(r => {
        // Prize Pool
        prizePoolAwarded += (r.prize || 0);
        
        // Revenue (Fees)
        const t = tournamentMap.get(r.tournamentId);
        if (t && r.buyInCount > 0) {
            monthlyRevenue += (t.fee * r.buyInCount);
        }
    });

    setStats({
        totalMembers,
        activeMembers: uniqueActiveMembers,
        tournamentsHosted,
        prizePoolAwarded,
        monthlyRevenue
    });

    // 6. Recent Winners Logic
    // Get all registrations with a rank of 1, sort by date descending
    const winners = allRegistrations
        .filter(r => r.rank === 1 && r.prize && r.prize > 0)
        .map(r => {
            const t = tournamentMap.get(r.tournamentId);
            const m = members.find(mem => mem.id === r.memberId);
            const dateStr = t?.startDate || '';
            return {
                tournamentId: r.tournamentId,
                tournamentName: t?.name || 'Unknown Event',
                winnerName: m?.fullName || 'Unknown Player',
                amount: r.prize || 0,
                date: dateStr,
                timestamp: dateStr ? new Date(dateStr).getTime() : 0
            };
        })
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 5); // Take top 5

    setRecentWinners(winners);
  };

  const handleWinnerClick = (tournamentId: string) => {
    const tournament = DataService.getTournaments().find(t => t.id === tournamentId);
    if (tournament) {
        setEditingTournament(tournament);
        setIsFormOpen(true);
    }
  };

  const handleTournamentSave = (tournament: Tournament) => {
      DataService.saveTournament(tournament);
      setIsFormOpen(false);
      setEditingTournament(undefined);
      calculateStats(); // Recalculate in case details changed
  };

  const StatCard = ({ title, value, subtext, icon: Icon, colorClass }: any) => (
      <div className={`${THEME.card} p-6 rounded-3xl border border-[#222] relative overflow-hidden group hover:border-[#333] transition-all`}>
          <div className={`absolute top-0 right-0 p-3 m-3 rounded-2xl ${colorClass.replace('text-', 'bg-').replace('500', '500/10')} ${colorClass}`}>
              <Icon size={24} />
          </div>
          <div className="relative z-10">
              <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-2">{title}</h3>
              <div className="text-3xl font-bold text-white mb-1">{value}</div>
              <div className="text-xs text-gray-600 font-medium">{subtext}</div>
          </div>
      </div>
  );

  return (
    <div className="h-full flex flex-col w-full animate-in fade-in duration-500">
      <PageHeader 
        title="Dashboard" 
        subtitle={
            <div className="flex items-center gap-2">
                <CalendarDays size={16} />
                Overview for {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
            </div>
        }
        actions={
            <div className="text-right hidden md:block">
                <div className="text-sm text-gray-500 font-medium">Club Status</div>
                <div className="text-brand-green font-bold flex items-center gap-2 justify-end">
                    <div className="w-2 h-2 rounded-full bg-brand-green animate-pulse"></div>
                    Operational
                </div>
            </div>
        }
      />

      {/* Metric Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          
          <StatCard 
            title="Monthly Active Members"
            value={stats.activeMembers}
            subtext={`${stats.totalMembers} total members`}
            icon={Users}
            colorClass="text-blue-500"
          />

          <StatCard 
            title="Monthly Tournaments Hosted"
            value={stats.tournamentsHosted}
            subtext="Completed this month"
            icon={Trophy}
            colorClass="text-yellow-500"
          />

           <StatCard 
            title="Monthly Revenue"
            value={`$${stats.monthlyRevenue.toLocaleString()}`}
            subtext="Total fees collected"
            icon={Banknote}
            colorClass="text-brand-green"
          />

          <StatCard 
            title="Monthly Total Prize Pool"
            value={`$${stats.prizePoolAwarded.toLocaleString()}`}
            subtext="Distributed this month"
            icon={Coins}
            colorClass="text-purple-500"
          />
      </div>

      {/* Recent Winners Section */}
      <div className="flex-1 min-h-[300px]">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Medal size={20} className="text-yellow-500" />
              Recent Champions
          </h3>
          
          <div className={`${THEME.card} border ${THEME.border} rounded-3xl overflow-hidden`}>
              {recentWinners.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                      No tournament winners recorded yet.
                  </div>
              ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-[#1A1A1A] text-xs uppercase text-gray-500 font-bold tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Tournament</th>
                                <th className="px-6 py-4">Champion</th>
                                <th className="px-6 py-4 text-right">Prize</th>
                                <th className="px-6 py-4 text-right">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#262626]">
                            {recentWinners.map((winner, idx) => (
                                <tr 
                                    key={idx} 
                                    onClick={() => handleWinnerClick(winner.tournamentId)}
                                    className="hover:bg-[#222] transition-colors cursor-pointer group"
                                >
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-white group-hover:text-brand-green transition-colors">{winner.tournamentName}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-yellow-500 font-medium">
                                            <Trophy size={14} />
                                            {winner.winnerName}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="font-mono text-brand-green font-bold">
                                            ${winner.amount.toLocaleString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right text-sm text-gray-500">
                                        {winner.date ? new Date(winner.date).toLocaleDateString() : 'N/A'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                  </div>
              )}
          </div>
      </div>

      <TournamentForm 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleTournamentSave}
        initialData={editingTournament}
      />
    </div>
  );
};

export default DashboardView;
