
import { Tournament, TournamentRegistration, PayoutStructure } from '../types';
import * as DataService from './dataService';

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

        // Determine Payout Percentages
        let percentages = [100];
        if (payoutStructure && payoutStructure.rules) {
            const count = activeRegs.length;
            const rule = payoutStructure.rules.find(r => count >= r.minPlayers && count <= r.maxPlayers);
            if (rule) {
                percentages = rule.percentages;
            }
        }

        // Adjust percentages if actual players < expected places
        let finalPercentages = [...percentages];
        if (activeRegs.length > 0 && activeRegs.length < percentages.length) {
            const playerCount = activeRegs.length;
            const assignablePercentages = percentages.slice(0, playerCount);
            const excessPercentage = percentages.slice(playerCount).reduce((sum, p) => sum + p, 0);
            
            if (excessPercentage > 0) {
                // Redistribute excess evenly among paid places
                const boostPerPlayer = excessPercentage / playerCount;
                finalPercentages = assignablePercentages.map(p => p + boostPerPlayer);
            } else {
                finalPercentages = assignablePercentages;
            }
        }

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
