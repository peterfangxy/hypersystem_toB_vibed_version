
import { Tournament, TournamentRegistration, PayoutStructure } from '../types';
import * as DataService from './dataService';
import { calculatePayouts } from '../utils/payoutUtils';

export interface TournamentResult {
    regId: string;
    rank: number;
    prize: number;
}

export const TournamentService = {
    /**
     * Calculates the final ranks and prizes for a tournament based on chip counts and payout structure.
     * Delegates math logic to `utils/payoutUtils`.
     */
    calculateResults: (
        tournament: Tournament,
        registrations: TournamentRegistration[],
        payoutStructure: PayoutStructure | undefined
    ): TournamentResult[] => {
        // 1. Calculate Total Prize Pool
        const totalBuyIns = registrations.reduce((sum, r) => sum + (r.buyInCount || 0), 0);
        const totalPrizePool = totalBuyIns * tournament.buyIn;

        // 2. Identify Active Players
        const activeRegs = registrations.filter(r => r.status !== 'Cancelled');
        
        // 3. Sort Players by Chip Count (Descending)
        // Tie-breaker: Currently arbitrary (stable sort), could be join time in future
        // NOTE: This sort order is critical for ICM. index 0 = Chip Leader.
        const sortedRegs = [...activeRegs].sort((a, b) => (b.finalChipCount || 0) - (a.finalChipCount || 0));

        // 4. Extract Chips for Calculation Engine
        const chipCounts = sortedRegs.map(r => r.finalChipCount || 0);

        // 5. Get Payout Distribution (Passing chips for ICM/ChipEV support)
        const payouts = calculatePayouts(payoutStructure, totalPrizePool, activeRegs.length, chipCounts);

        // 6. Map Results to Players
        const results: TournamentResult[] = sortedRegs.map((reg, index) => {
            // If using Rank-based (Direct), 'payouts' is keyed by Rank (1st, 2nd...)
            // If using Player-based (ICM), 'payouts' is keyed by Player Index in sorted list.
            // Since we sorted both regs and passed sorted chips, index matching works for both.
            
            const payoutItem = payouts[index]; // Payout corresponding to this sorted position
            
            return {
                regId: reg.id,
                rank: index + 1, // Rank determined by chip count sort
                prize: payoutItem ? payoutItem.amount : 0
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
        const updatedTournament = { 
            ...tournament, 
            status: 'Completed' as const,
            endTime: new Date().toISOString()
        };
        DataService.saveTournament(updatedTournament);
    }
};
