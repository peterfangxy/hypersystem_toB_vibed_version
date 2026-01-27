
import { PayoutRule, PayoutStructure, PayoutAllocation } from '../types';

export interface PayoutResult {
    rank: number;
    percentage: number;
    amount: number;
}

/**
 * Validates a set of payout rules for UI feedback.
 */
export const validatePayoutRules = (rules: PayoutRule[], t: (key: string, options?: any) => string): { isValid: boolean; error: string | null } => {
    if (!rules || rules.length === 0) {
        return { isValid: true, error: null };
    }

    // 1. Check Distribution Sums (Must equal 100% with small float tolerance)
    for (const rule of rules) {
        const sum = rule.percentages.reduce((a, b) => a + b, 0);
        if (Math.abs(sum - 100) > 0.1) {
            return { 
                isValid: false, 
                error: t('structures.payoutForm.validation.totalMustBe100', { total: Math.round(sum) })
            };
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

// --- ICM & Math Helpers ---

const factorial = (n: number): number => {
    if (n < 0) return 0;
    if (n <= 1) return 1;
    let res = 1;
    for (let i = 2; i <= n; i++) res *= i;
    return res;
};

/**
 * Calculates ICM Equity for each player.
 * Ported and adapted from Google Apps Script logic.
 * 
 * @param chipCounts Array of chip counts for each player.
 * @param prizeStructure Array of percentage payouts for ranks (e.g. [50, 30, 20]).
 * @returns Array of equity percentages for each player corresponding to chipCounts indices.
 */
const calculateICMEquity = (chipCounts: number[], prizeStructure: number[]): number[] => {
    const N = chipCounts.length;
    
    // Safety caps
    if (N < 1) return [];
    if (N > 9) {
        console.warn("ICM calculation capped at 9 players due to complexity. Returning Chip Chop.");
        return calculateChipEV(chipCounts);
    }

    const totalChips = chipCounts.reduce((a, b) => a + b, 0);
    if (totalChips === 0) return chipCounts.map(() => 0);

    // Normalize prize structure to length N (pad with 0s if fewer prizes than players)
    const prizes = [...prizeStructure];
    while (prizes.length < N) prizes.push(0);
    // If more prizes than players, only top N matter
    const activePrizes = prizes.slice(0, N);

    // probs[playerIndex][rankIndex]
    const probs = Array.from({ length: N }, () => Array(N).fill(0));

    // Recursive DFS to calculate rank probabilities
    function dfs(order: number[], usedMask: number, remainingTotal: number, pathProb: number) {
        const depth = order.length; // current rank we are assigning (0 = 1st place)
        
        if (depth === N) {
            // Reached leaf: add path probability to each player's specific rank bucket
            for (let r = 0; r < N; r++) {
                const pIdx = order[r];
                probs[pIdx][r] += pathProb;
            }
            return;
        }

        // Edge case: remaining chips = 0 (can happen if multiple players have 0 chips)
        if (remainingTotal <= 0) {
            const remaining = [];
            for (let i = 0; i < N; i++) if (((usedMask >> i) & 1) === 0) remaining.push(i);
            
            const m = remaining.length;
            const eachPermProb = pathProb / factorial(m);

            // Simplification: Uniformly distribute remaining probability for remaining ranks
            // (Full permutation iteration is overkill here as result is uniform)
            for (const pIdx of remaining) {
                for (let r = depth; r < N; r++) {
                    probs[pIdx][r] += eachPermProb * factorial(m - 1); // math shortcut for uniform dist
                }
            }
            return;
        }

        for (let i = 0; i < N; i++) {
            // If player i is already used in this branch, skip
            if (((usedMask >> i) & 1) === 1) continue;

            const chips = chipCounts[i];
            if (chips <= 0) continue; // Players with 0 chips can't win next rank

            const p = chips / remainingTotal;
            
            order.push(i);
            dfs(order, usedMask | (1 << i), remainingTotal - chips, pathProb * p);
            order.pop();
        }
    }

    dfs([], 0, totalChips, 1);

    // Calculate EV (SumProduct of Probs * Prizes)
    const equity: number[] = new Array(N).fill(0);
    for (let pIdx = 0; pIdx < N; pIdx++) {
        let e = 0;
        for (let rank = 0; rank < N; rank++) {
            e += probs[pIdx][rank] * activePrizes[rank];
        }
        equity[pIdx] = e;
    }

    return equity;
};

/**
 * Calculates simple Chip Chop (Proportional) Equity.
 */
const calculateChipEV = (chipCounts: number[]): number[] => {
    const total = chipCounts.reduce((a, b) => a + b, 0);
    if (total === 0) return chipCounts.map(() => 0);
    return chipCounts.map(c => (c / total) * 100);
};


/**
 * Internal: Calculates distribution percentages for a single allocation segment.
 * Returns an array of percentages (e.g. [50, 30, 20]) for ranks 1, 2, 3... OR for specific players if ICM.
 */
const calculateSegmentDistribution = (
    allocation: PayoutAllocation,
    playerCount: number,
    chipCounts?: number[]
): number[] => {
    // 1. Determine the "Standard" rank-based distribution first
    // This is needed for Custom tables OR to define the prizes for ICM to target
    let standardRankPercentages = [100]; 

    if (allocation.rules && allocation.rules.length > 0) {
        const matchedRule = allocation.rules.find(r => playerCount >= r.minPlayers && playerCount <= r.maxPlayers);
        if (matchedRule) {
            standardRankPercentages = [...matchedRule.percentages];
        } else {
            standardRankPercentages = [...allocation.rules[0].percentages];
        }
    }

    // 2. Logic Branch
    if (allocation.type === 'ICM' && chipCounts && chipCounts.length > 0) {
        // ICM Logic: Distribute the total % of this segment based on ICM equity
        // We treat the 'standardRankPercentages' as the theoretical payouts for 1st, 2nd, 3rd...
        return calculateICMEquity(chipCounts, standardRankPercentages);
    } 
    
    if (allocation.type === 'ChipEV' && chipCounts && chipCounts.length > 0) {
        return calculateChipEV(chipCounts);
    }

    // 3. Default / Custom Logic (Rank Based)
    // Handle Edge Case: Active players < Places Paid
    if (playerCount > 0 && playerCount < standardRankPercentages.length) {
        const assignablePercentages = standardRankPercentages.slice(0, playerCount);
        const excessPercentage = standardRankPercentages.slice(playerCount).reduce((sum, p) => sum + p, 0);
        
        if (excessPercentage > 0) {
            const boostPerPlayer = excessPercentage / playerCount;
            return assignablePercentages.map(p => p + boostPerPlayer);
        }
        return assignablePercentages;
    }

    return standardRankPercentages;
};

/**
 * Calculates the final percentage distribution relative to the TOTAL prize pool.
 */
export const calculatePayoutDistribution = (
    payoutStructure: PayoutStructure | undefined, 
    playerCount: number,
    chipCounts?: number[] // Array of chip counts, sorted matching the player list (usually desc)
): number[] => {
    if (!payoutStructure || !payoutStructure.allocations || payoutStructure.allocations.length === 0) {
        return [100]; // Default 100% to 1st
    }

    // Map to store cumulative percentage.
    // For Rank-Based (Custom), indices are Ranks (0=1st, 1=2nd).
    // For Player-Based (ICM/ChipEV), indices are Players (0=PlayerA, 1=PlayerB).
    // IMPORTANT: The consumer must ensure `chipCounts` are sorted if they want Rank 1 to be the Chip Leader for fallback.
    const totals: number[] = [];

    // Iterate through each allocation (e.g. Main 95%, Side 5%)
    for (const allocation of payoutStructure.allocations) {
        const segmentShare = (allocation.percent || 0) / 100; // e.g. 95% -> 0.95
        
        if (segmentShare <= 0) continue;

        const segmentDistribution = calculateSegmentDistribution(allocation, playerCount, chipCounts);

        // Add weighted amounts
        segmentDistribution.forEach((pct, index) => {
            const weightedPct = pct * segmentShare;
            
            if (totals[index] === undefined) {
                totals[index] = 0;
            }
            totals[index] += weightedPct;
        });
    }

    // Round to 4 decimal places to minimize equity drift before currency conversion
    // e.g. 33.3333% instead of 33.33%
    return totals.map(p => Math.round(p * 10000) / 10000);
};

/**
 * Utility: Smooths out payout values to nearest rounding unit (e.g. 1, 10, 100).
 * Adjusts the last paid player to absorb any rounding differences to ensure
 * the total matches the original prize pool exactly.
 * 
 * @param rawAmounts The calculated exact winning amounts
 * @param roundingUnit The integer unit to round to (e.g. 100)
 * @param targetTotal (Optional) Force the final sum to equal this amount. Default is sum(rawAmounts).
 */
export const smoothPayouts = (rawAmounts: number[], roundingUnit: number = 100, targetTotal?: number): number[] => {
    // If targetTotal is provided, use it. Otherwise sum the raw amounts.
    // Using targetTotal is preferred to avoid floating point summation drift.
    const totalPrizePool = targetTotal !== undefined ? targetTotal : rawAmounts.reduce((sum, val) => sum + val, 0);

    // 1. Round individual amounts to nearest unit
    let roundedAmounts = rawAmounts.map(amount => {
        if (roundingUnit <= 0) return amount;
        return Math.round(amount / roundingUnit) * roundingUnit;
    });

    // 2. Calculate discrepancy vs original total
    const currentRoundedTotal = roundedAmounts.reduce((sum, val) => sum + val, 0);
    const diff = totalPrizePool - currentRoundedTotal;

    // 3. Reconcile difference
    // If rounded total is LESS than original, diff is POSITIVE. Add to last player.
    // If rounded total is MORE than original, diff is NEGATIVE. Subtract from last player.
    if (diff !== 0) {
        // Find the index of the last player who is getting paid (non-zero rounded amount)
        let targetIndex = -1;
        for (let i = roundedAmounts.length - 1; i >= 0; i--) {
            if (roundedAmounts[i] > 0) {
                targetIndex = i;
                break;
            }
        }

        // Fallback: If no one has money (e.g. small pool, large rounding unit), assign to 1st place
        if (targetIndex === -1 && roundedAmounts.length > 0) {
            targetIndex = 0;
        }

        if (targetIndex !== -1) {
            roundedAmounts[targetIndex] += diff;
        }
    }

    return roundedAmounts;
};

/**
 * Calculates the exact currency amounts.
 */
export const calculatePayouts = (
    structure: PayoutStructure | undefined, 
    totalPrizePool: number,
    playerCount: number,
    chipCounts?: number[]
): PayoutResult[] => {
    const percentages = calculatePayoutDistribution(structure, playerCount, chipCounts);
    
    // 1. Calculate raw amounts based on percentages
    const rawAmounts = percentages.map(pct => totalPrizePool * (pct / 100));

    // 2. Smooth amounts (Defaulting to 100 for integer precision)
    // Pass totalPrizePool as targetTotal to ensure exact sum matches input
    const smoothedAmounts = smoothPayouts(rawAmounts, 100, totalPrizePool);

    return smoothedAmounts.map((amount, index) => ({
        rank: index + 1, // Note: If ICM, this is really "Player Index + 1"
        percentage: percentages[index], // Maintain original theoretical percentage
        amount: amount
    }));
};
