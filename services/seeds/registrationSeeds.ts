
import { TournamentRegistration, TournamentTransaction } from '../../types';
import { SEED_MEMBERS } from './memberSeeds';
import { SEED_TOURNAMENTS } from './pokerSeeds';

const TEST_CHIPS_OUT = [17390, 12640, 11240, 9150, 8470, 7860, 3250];

const generateRegistrations = (): TournamentRegistration[] => {
    const registrations: TournamentRegistration[] = [];
    
    // Generate data for Completed AND In Progress/Registration tournaments to ensure dashboards and lists are populated
    const targetTournaments = SEED_TOURNAMENTS.filter(t => 
        t.status === 'Completed' || t.status === 'In Progress' || t.status === 'Registration'
    );

    targetTournaments.forEach(tournament => {
        // Random number of players between 10 and 40
        // If it's a test tournament, keep it smaller
        const isTest = tournament.id.includes('test');
        let playerCount = isTest ? 8 : (10 + Math.floor(Math.random() * 30));
        
        // Specific Override for the Breaks Test Case
        if (tournament.id === 'live-test-breaks') {
            playerCount = TEST_CHIPS_OUT.length;
        }
        
        // Shuffle members to pick random participants
        const shuffledMembers = [...SEED_MEMBERS].sort(() => 0.5 - Math.random());
        const participants = shuffledMembers.slice(0, playerCount);

        // Determine Payouts (Top 15%)
        const placesPaid = Math.ceil(playerCount * 0.15);
        const totalPrizePool = playerCount * tournament.buyIn; 
        
        participants.forEach((member, index) => {
            // Rank 1 is index 0
            const rank = index + 1;
            let prize = 0;

            // Only assign prizes/ranks if completed
            if (tournament.status === 'Completed') {
                if (rank <= placesPaid) {
                    if (rank === 1) prize = totalPrizePool * 0.50;
                    else if (rank === 2) prize = totalPrizePool * 0.30;
                    else if (rank === 3) prize = totalPrizePool * 0.20;
                    else prize = (totalPrizePool * 0.10) / (placesPaid - 3 || 1); 
                }
            }

            // Random rebuys (unless Freezeout)
            let buyInCount = (tournament.rebuyLimit > 0 && Math.random() > 0.7) ? 2 : 1;
            
            // Override for Test Case: Single Buy-in to ensure Prize Pool matches exactly
            if (tournament.id === 'live-test-breaks') {
                buyInCount = 1;
            }

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

            // Randomly assign table/seat for active tourneys
            let tableId = undefined;
            let seatNumber = undefined;
            if (tournament.status === 'In Progress' && tournament.tableIds && tournament.tableIds.length > 0) {
                tableId = tournament.tableIds[0]; // Just dump everyone on first table for simplicity in seed
                seatNumber = index + 1;
            }

            // Final Chip Count (Fake it for completed)
            let finalChips = 0;
            if (tournament.status === 'Completed') {
                // Winner gets most, others get 0
                finalChips = rank === 1 ? (playerCount * tournament.startingChips * 1.5) : 0;
            } else if (tournament.status === 'In Progress') {
                if (tournament.id === 'live-test-breaks') {
                    // Apply Specific Test Stack
                    finalChips = TEST_CHIPS_OUT[index] !== undefined ? TEST_CHIPS_OUT[index] : 0;
                } else {
                    // Everyone has starting stack + variance
                    finalChips = tournament.startingChips * buyInCount; 
                }
            }

            registrations.push({
                id: `reg-${tournament.id}-${member.id}`,
                tournamentId: tournament.id,
                memberId: member.id,
                status: 'Joined',
                registeredAt: tournament.startDate || new Date().toISOString(),
                buyInCount: buyInCount,
                finalChipCount: finalChips,
                rank: tournament.status === 'Completed' ? rank : undefined,
                prize: Math.floor(prize),
                transactions: transactions,
                tableId,
                seatNumber
            });
        });
    });

    return registrations;
};

export const SEED_REGISTRATIONS: TournamentRegistration[] = generateRegistrations();
