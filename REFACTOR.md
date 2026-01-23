
# Refactoring Roadmap: Decoupling Logic from UI

This document outlines key areas where business logic and complex computation should be extracted from React components into standalone services, hooks, or utility files. This will improve maintainability, testability, and performance.

## 1. Dashboard Analytics
**Current Location:** `views/DashboardView.tsx`

**Current State:**
The `calculateStats` function is a heavy operation running inside a `useEffect`. It fetches *all* data and manually iterates to calculate total revenue, active members, and recent winners.

**Refactoring Strategy:**
*   **Create `services/analyticsService.ts`:** Move the aggregation logic out of the View.
    *   `getMonthlyStats()`: Returns the calculated totals.
    *   `getRecentWinners(limit)`: Returns the sorted winners list.
*   **Benefit:** This allows caching these calculations later or moving them to a web worker if the dataset grows, without blocking the UI thread.

## 2. Financial Calculations
**Current Location:** `components/BuyinMgmtModal.tsx`

**Current State:**
The logic for `calculateRowNet` (applying discounts), `calculateRowCash` (determining outstanding balance), and validating wallet balances (`isOverBalance`) is defined inside the modal component.

**Refactoring Strategy:**
*   **Create `utils/financialUtils.ts`:** Extract these pure functions.
    *   `calculateTransactionNet(tx, baseCost)`
    *   `calculateRegistrationBalance(transactions, baseCost)`
*   **Benefit:** Ensures that if you calculate a player's outstanding balance in the `TournamentDetailPanel` (to show the red/green indicators), it uses the exact same math as the `BuyinMgmtModal`.

## 3. Payout Validation
**Current Location:** `components/PayoutModelForm.tsx`

**Current State:**
The `validateRules` function contains complex array iteration to check for gaps, overlaps, and sum-to-100 violations.

**Refactoring Strategy:**
*   **Create `utils/payoutValidator.ts`:** Move this logic to a standalone file.
*   **Benefit:** You can run these validations on the server-side (future state) or reuse them when importing/exporting payout structures to ensure data integrity.
