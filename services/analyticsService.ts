
import * as DataService from './dataService';
import { Tournament, TournamentRegistration } from '../types';

export type TimeRange = '7d' | '30d';

export interface DashboardKPIs {
    revenue: number;
    tournamentsHosted: number;
    avgPrizePool: number;
    activeMembers: number;
}

export interface ChartDataPoint {
    date: string; // "MM/DD"
    fullDate: string; // "YYYY-MM-DD"
    value: number;
}

export interface RecentWinnerStats {
    tournamentId: string;
    tournamentName: string;
    winnerName: string;
    amount: number;
    date: string;
}

/**
 * Helper to get the start date object based on range
 */
const getStartDate = (range: TimeRange): Date => {
    const date = new Date();
    date.setHours(0, 0, 0, 0); // Start of today
    if (range === '7d') {
        date.setDate(date.getDate() - 6); // Include today + 6 previous days = 7 days
    } else {
        date.setDate(date.getDate() - 29); // 30 days
    }
    return date;
};

/**
 * Helper to generate an array of date strings for the chart axis
 */
const getDateRangeArray = (start: Date, end: Date): string[] => {
    const arr = [];
    for(let dt=new Date(start); dt<=end; dt.setDate(dt.getDate()+1)){
        arr.push(new Date(dt).toISOString().split('T')[0]);
    }
    return arr;
};

export const AnalyticsService = {
    
    getStats: (range: TimeRange): { kpis: DashboardKPIs, chartData: ChartDataPoint[], winners: RecentWinnerStats[] } => {
        const startDate = getStartDate(range);
        const now = new Date();
        now.setHours(23, 59, 59, 999); // End of today

        const tournaments = DataService.getTournaments();
        const allRegistrations = DataService.getAllRegistrations();
        const members = DataService.getMembers();

        // 1. Filter Tournaments in Range
        const rangeTournaments = tournaments.filter(t => {
            if (!t.startDate) return false;
            const tDate = new Date(t.startDate);
            // We count scheduled/completed tournaments that fall in the range
            return tDate >= startDate && tDate <= now;
        });

        // 2. Calculate KPIs
        let revenue = 0;
        let totalPrizePool = 0;
        let completedCount = 0;
        const tournamentIdsInRange = new Set(rangeTournaments.map(t => t.id));
        
        // Active members in range (registered for any tournament in this period)
        const activeMemberIds = new Set<string>();

        // Map for Chart Data (Date -> Revenue)
        const revenueByDate: Record<string, number> = {};
        
        // Initialize chart map with 0s for all days
        const dateStrings = getDateRangeArray(startDate, now);
        dateStrings.forEach(ds => revenueByDate[ds] = 0);

        // Process Registrations for Financials
        allRegistrations.forEach(reg => {
            if (tournamentIdsInRange.has(reg.tournamentId) && reg.status !== 'Cancelled') {
                const t = rangeTournaments.find(tour => tour.id === reg.tournamentId);
                if (t) {
                    // Revenue
                    const fees = t.fee * (reg.buyInCount || 0);
                    revenue += fees;
                    
                    // Chart Aggregation
                    if (t.startDate) {
                        revenueByDate[t.startDate] = (revenueByDate[t.startDate] || 0) + fees;
                    }

                    // Prize Pool (Estimated from buyins for KPIs)
                    totalPrizePool += (t.buyIn * (reg.buyInCount || 0));

                    // Active Member
                    activeMemberIds.add(reg.memberId);
                }
            }
        });

        completedCount = rangeTournaments.length; // Simply count events scheduled/happened in this timeframe
        const avgPrizePool = completedCount > 0 ? (totalPrizePool / completedCount) : 0;

        // 3. Format Chart Data
        const chartData: ChartDataPoint[] = dateStrings.map(ds => {
            const dateObj = new Date(ds);
            return {
                date: dateObj.toLocaleDateString(undefined, { month: '2-digit', day: '2-digit' }),
                fullDate: ds,
                value: revenueByDate[ds] || 0
            };
        });

        // 4. Get Recent Winners (Global, not just in range, but top 5 most recent)
        const winners = allRegistrations
            .filter(r => r.rank === 1 && r.prize && r.prize > 0)
            .map(r => {
                const t = tournaments.find(tour => tour.id === r.tournamentId);
                const m = members.find(mem => mem.id === r.memberId);
                return {
                    tournamentId: r.tournamentId,
                    tournamentName: t?.name || 'Unknown',
                    winnerName: m?.fullName || 'Unknown',
                    amount: r.prize || 0,
                    date: t?.startDate || ''
                };
            })
            // Sort by date descending
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 5);

        return {
            kpis: {
                revenue,
                tournamentsHosted: completedCount,
                avgPrizePool,
                activeMembers: activeMemberIds.size
            },
            chartData,
            winners
        };
    }
};
