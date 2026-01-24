
import { TournamentRegistration, TournamentTransaction } from '../../types';
import { SEED_MEMBERS } from './memberSeeds';
import { SEED_TOURNAMENTS } from './pokerSeeds';

const generateRegistrations = (): TournamentRegistration[] => {
    const registrations: TournamentRegistration[] = [];
    
    // Only generate for completed/past tournaments to populate dashboard
    const completedTournaments = SEED_TOURNAMENTS.filter(t => t.status === 'Completed');

    completedTournaments.forEach(tournament => {
        // Random number of players between 10 and 40
        const playerCount = 10 + Math.floor(Math.random() * 30);
        
        // Shuffle members to pick random participants
        const shuffledMembers = [...SEED_MEMBERS].sort(() => 0.5 - Math.random());
        const participants = shuffledMembers.slice(0, playerCount);

        // Determine Payouts (Top 15%)
        const placesPaid = Math.ceil(playerCount * 0.15);
        const totalPrizePool = playerCount * tournament.buyIn; // Simplified logic, ignoring rebuys for prize calcs here
        
        participants.forEach((member, index) => {
            // Rank 1 is index 0
            const rank = index + 1;
            let prize = 0;

            // Simplified Payout Distribution
            if (rank <= placesPaid) {
                if (rank === 1) prize = totalPrizePool * 0.50;
                else if (rank === 2) prize = totalPrizePool * 0.30;
                else if (rank === 3) prize = totalPrizePool * 0.20;
                else prize = (totalPrizePool * 0.10) / (placesPaid - 3); // Dust
            }

            // Random rebuys
            const buyInCount = (tournament.rebuyLimit > 0 && Math.random() > 0.7) ? 2 : 1;

            // Create transactions
            const transactions: TournamentTransaction[] = [];
            // Initial Buyin
            transactions.push({
                id: crypto.randomUUID(),
                type: 'BuyIn',
                timestamp: tournament.startDate || new Date().toISOString(),
                rebuyDiscount: 0,
                membershipDiscount: 0,
                voucherDiscount: 0,
                campaignDiscount: 0,
                depositPaid: 0,
                isPaid: true
            });
            // Rebuy
            if (buyInCount > 1) {
                transactions.push({
                    id: crypto.randomUUID(),
                    type: 'Rebuy',
                    timestamp: tournament.startDate || new Date().toISOString(),
                    rebuyDiscount: 0,
                    membershipDiscount: 0,
                    voucherDiscount: 0,
                    campaignDiscount: 0,
                    depositPaid: 0,
                    isPaid: true
                });
            }

            registrations.push({
                id: `reg-${tournament.id}-${member.id}`,
                tournamentId: tournament.id,
                memberId: member.id,
                status: 'Joined',
                registeredAt: tournament.startDate || new Date().toISOString(),
                buyInCount: buyInCount,
                finalChipCount: rank === 1 ? (playerCount * tournament.startingChips * 1.5) : 0, // Fake chips for winner
                rank: rank,
                prize: Math.floor(prize),
                transactions: transactions
            });
        });
    });

    return registrations;
};

export const SEED_REGISTRATIONS: TournamentRegistration[] = generateRegistrations();
