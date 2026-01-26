
import { PayoutRule, PayoutStructure, PayoutAllocation } from '../types';

export interface PayoutResult {
    rank: number;
    percentage: number;
    amount: number;
}

/**
 * Validates a set of payout rules for UI feedback.
 */
export const validatePayoutRules = (rules: PayoutRule[], t: (key: string) => string): { isValid: boolean; error: string | null } => {
    if (!rules || rules.length === 0) {
        return { isValid: true, error: null };
    }

    // 1. Check Distribution Sums (Must equal 100% with small float tolerance)
    for (const rule of rules) {
        const sum = rule.percentages.reduce((a, b) => a + b, 0);
        if (Math.abs(sum - 100) > 0.1) {
            return { isValid: false, error: `Total: ${Math.round(sum)}% (Must be 100%)` };
        }
    }

    // 2. Check Descending Payouts (Warning mostly)
    for (const rule of rules) {
        for (let i = 0; i < rule.percentages.length - 1; i++) {
            if (rule.percentages[i] < rule.percentages[i+1]) {
                return { 
                    isValid: false, 
                    error: `${t('structures.payoutForm.validation.descending')}` 
                };
            }
        }
    }

    return { isValid: true, error: null };
};

/**
 * Internal: Calculates distribution percentages for a single allocation segment.
 * Returns an array of percentages (e.g. [50, 30, 20]) for ranks 1, 2, 3...
 */
const calculateSegmentDistribution = (
    allocation: PayoutAllocation,
    playerCount: number
): number[] => {
    // Default fallback: Winner Takes All
    let percentages = [100]; 

    if (allocation.type === 'Custom') {
        if (allocation.rules && allocation.rules.length > 0) {
            // Find specific rule for this player count range
            const matchedRule = allocation.rules.find(r => playerCount >= r.minPlayers && playerCount <= r.maxPlayers);
            
            if (matchedRule) {
                percentages = [...matchedRule.percentages];
            } else {
                // Fallback: Use the rule with the widest coverage or simply the first one
                percentages = [...allocation.rules[0].percentages];
            }
        }
    } else if (allocation.type === 'ICM' || allocation.type === 'ChipEV') {
        // TODO: Implement Calculator Types
        return [100];
    }

    // Edge Case: Active players < Places Paid
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
 * Calculates the final percentage distribution relative to the TOTAL prize pool.
 * Handles splitting the pool between multiple allocations (e.g. 90% Main, 10% Side).
 */
export const calculatePayoutDistribution = (
    payoutStructure: PayoutStructure | undefined, 
    playerCount: number
): number[] => {
    if (!payoutStructure || !payoutStructure.allocations || payoutStructure.allocations.length === 0) {
        return [100]; // Default 100% to 1st
    }

    // Map to store cumulative percentage for each rank (Index 0 = 1st place)
    const rankTotals: number[] = [];

    // Iterate through each allocation (e.g. Main 95%, Side 5%)
    for (const allocation of payoutStructure.allocations) {
        const segmentShare = (allocation.percent || 0) / 100; // e.g. 95% -> 0.95
        
        if (segmentShare <= 0) continue;

        // Get the distribution within this segment (e.g. [50, 30, 20] for 1st, 2nd, 3rd)
        const segmentDistribution = calculateSegmentDistribution(allocation, playerCount);

        // Add weighted amounts to global rank totals
        segmentDistribution.forEach((pct, rankIndex) => {
            const weightedPct = pct * segmentShare; // e.g. 50% * 0.95 = 47.5% of total pool
            
            if (rankTotals[rankIndex] === undefined) {
                rankTotals[rankIndex] = 0;
            }
            rankTotals[rankIndex] += weightedPct;
        });
    }

    // Round to 2 decimal places to avoid float errors (e.g. 33.333333%)
    return rankTotals.map(p => Math.round(p * 100) / 100);
};

/**
 * Calculates the exact currency amounts for each rank.
 * Handles integer rounding and remainder distribution to ensure total sum equals prize pool.
 */
export const calculatePayouts = (
    structure: PayoutStructure | undefined, 
    totalPrizePool: number,
    playerCount: number
): PayoutResult[] => {
    const percentages = calculatePayoutDistribution(structure, playerCount);
    
    // 1. Calculate base amounts with rounding
    const results = percentages.map((pct, index) => {
        const rawAmount = totalPrizePool * (pct / 100);
        // Use round instead of floor to handle floating point epsilons (e.g. 3849.999 -> 3850)
        const amount = Math.round(rawAmount); 
        
        return {
            rank: index + 1,
            percentage: pct,
            amount: amount
        };
    });

    // 2. Reconcile Remainder
    // Summing rounded numbers may result in total > pool or total < pool.
    const currentSum = results.reduce((sum, item) => sum + item.amount, 0);
    const diff = totalPrizePool - currentSum;

    if (diff !== 0 && results.length > 0) {
        // Adjust 1st place to absorb the difference (cents/dollars)
        // If diff is positive (under-paid), add to 1st.
        // If diff is negative (over-paid), subtract from 1st.
        results[0].amount += diff;
    }

    return results;
};
