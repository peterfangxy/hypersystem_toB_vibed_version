
import { PayoutRule, PayoutStructure, PayoutAllocation } from '../types';

/**
 * Validates a single set of custom payout rules.
 */
export const validatePayoutRules = (rules: PayoutRule[], t: (key: string) => string): { isValid: boolean; error: string | null } => {
    if (rules.length === 0) {
        return { isValid: true, error: null };
    }

    // 1. Check Distribution Sums
    if (rules.some(r => r.percentages.reduce((a, b) => a + b, 0) !== 100)) {
        return { isValid: false, error: t('structures.payoutForm.validation.sum') };
    }

    // 2. Check Min/Max Validity
    if (rules.some(r => r.minPlayers > r.maxPlayers)) {
        return { isValid: false, error: t('structures.payoutForm.validation.minMax') };
    }

    // 3. Check Descending Payouts
    for (const rule of rules) {
        for (let i = 0; i < rule.percentages.length - 1; i++) {
            if (rule.percentages[i] < rule.percentages[i+1]) {
                return { 
                    isValid: false, 
                    error: `${t('structures.payoutForm.validation.descending')} (${rule.minPlayers}-${rule.maxPlayers} players)` 
                };
            }
        }
    }

    // 4. Check for Gaps and Overlaps
    const sorted = [...rules].sort((a, b) => a.minPlayers - b.minPlayers);
    
    for (let i = 0; i < sorted.length - 1; i++) {
        const current = sorted[i];
        const next = sorted[i+1];
        
        if (current.maxPlayers >= next.minPlayers) {
            return { 
                isValid: false, 
                error: `${t('structures.payoutForm.validation.overlap')}: ${current.minPlayers}-${current.maxPlayers} / ${next.minPlayers}-${next.maxPlayers}` 
            };
        }
        
        if (current.maxPlayers + 1 !== next.minPlayers) {
             return { 
                 isValid: false, 
                 error: `${t('structures.payoutForm.validation.gap')}: ${current.maxPlayers} -> ${next.minPlayers}` 
             };
        }
    }

    return { isValid: true, error: null };
};

/**
 * Calculates the percentage distribution for a single allocation segment.
 */
const calculateSegmentDistribution = (
    allocation: PayoutAllocation,
    playerCount: number
): number[] => {
    let percentages = [100]; // Default Winner Take All

    if (allocation.type === 'Custom' && allocation.rules) {
        const rule = allocation.rules.find(r => playerCount >= r.minPlayers && playerCount <= r.maxPlayers);
        if (rule) {
            percentages = [...rule.percentages];
        }
    } else if (allocation.type === 'ICM' || allocation.type === 'ChipEV') {
        // Placeholder: In a real app, you'd pass stack sizes here for ICM. 
        // For pre-calculation (without stacks), we default to 100% or a standard curve.
        // We will default to 100% here as "Winner Take All" until stacks are available.
        return [100];
    }

    // Adjust if active players < paid places
    if (playerCount > 0 && playerCount < percentages.length) {
        const assignablePercentages = percentages.slice(0, playerCount);
        const excessPercentage = percentages.slice(playerCount).reduce((sum, p) => sum + p, 0);
        
        if (excessPercentage > 0) {
            const boostPerPlayer = excessPercentage / playerCount;
            percentages = assignablePercentages.map(p => p + boostPerPlayer);
        } else {
            percentages = assignablePercentages;
        }
    }

    return percentages;
};

/**
 * Calculates the final percentage distribution for a given player count based on the entire structure.
 * Returns an array of percentages relative to the TOTAL prize pool.
 */
export const calculatePayoutDistribution = (
    payoutStructure: PayoutStructure | undefined, 
    playerCount: number
): number[] => {
    if (!payoutStructure || !payoutStructure.allocations || payoutStructure.allocations.length === 0) {
        return [100];
    }

    // Map to store cumulative percentage for each rank (0 = 1st place)
    const rankTotals: number[] = [];

    // Iterate through each allocation (e.g. Main 95%, Side 5%)
    for (const allocation of payoutStructure.allocations) {
        const segmentShare = allocation.percent / 100; // e.g. 0.95
        
        // Get the distribution within this segment (e.g. [50, 30, 20] for 1st, 2nd, 3rd)
        const segmentDistribution = calculateSegmentDistribution(allocation, playerCount);

        // Add weighted amounts to total
        segmentDistribution.forEach((pct, rankIndex) => {
            const weightedPct = pct * segmentShare; // e.g. 50 * 0.95 = 47.5
            
            if (rankTotals[rankIndex] === undefined) {
                rankTotals[rankIndex] = 0;
            }
            rankTotals[rankIndex] += weightedPct;
        });
    }

    // Clean up floating point precision issues
    return rankTotals.map(p => Math.round(p * 100) / 100);
};
