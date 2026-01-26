
import { Tournament, TournamentRegistration, PayoutStructure } from '../types';
import * as DataService from './dataService';
import { calculatePayoutDistribution } from '../utils/payoutUtils';

export interface TournamentResult {
    regId: string;
    rank: number;
    prize: number;
}

export const TournamentService = {
    /**
     * Calculates the final ranks and prizes for a tournament based on chip counts and payout structure.
     */
    calculateResults: (
        tournament: Tournament,
        registrations: TournamentRegistration[],
        payoutStructure: PayoutStructure | undefined
    ): TournamentResult[] => {
        const totalBuyIns = registrations.reduce((sum, r) => sum + r.buyInCount, 0);
        const totalPrizePool = totalBuyIns * tournament.buyIn;

        // Filter active players (not cancelled)
        const activeRegs = registrations.filter(r => r.status !== 'Cancelled');
        
        // Sort by final chip count (Descending)
        // If chips are equal, could use join time as tiebreaker, but for now just chips
        const sortedRegs = [...activeRegs].sort((a, b) => (b.finalChipCount || 0) - (a.finalChipCount || 0));

        // Get Payout Percentages using the utility function
        const finalPercentages = calculatePayoutDistribution(payoutStructure, activeRegs.length);

        // Generate Result Objects
        const results: TournamentResult[] = sortedRegs.map((reg, index) => {
            const rank = index + 1;
            let prize = 0;
            if (index < finalPercentages.length) {
                prize = totalPrizePool * (finalPercentages[index] / 100);
            }
            return {
                regId: reg.id,
                rank,
                prize
            };
        });

        return results;
    },

    /**
     * Applies results to database and marks tournament as completed.
     */
    finalizeTournament: (tournament: Tournament, results: TournamentResult[]): void => {
        // Update each registration with rank and prize
        results.forEach(res => {
            DataService.updateRegistrationResult(res.regId, res.rank, res.prize);
        });

        // Update Tournament Status
        const updatedTournament = { ...tournament, status: 'Completed' as const };
        DataService.saveTournament(updatedTournament);
    }
};
