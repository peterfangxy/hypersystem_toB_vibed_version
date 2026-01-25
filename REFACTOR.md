
# Refactoring Roadmap

This document outlines technical debt and architectural improvements to ensure the application remains maintainable, performant, and consistent as features grow.

## 1. Standardize UI Components (High Priority)
**Current State:**
The `TournamentsView` and `MembersView` utilize the robust `Table` component. However, the `StructuresView` (Payouts tab) still uses a hardcoded HTML table implementation.

**Action:**
*   Refactor `StructuresView` to use the `Table` component for the Payouts list.
*   Ensure the `Table` component handles the specific "Rules" and "Range" column rendering requirements of the Payouts model.

## 2. Extract Table Logic Hook (Medium Priority)
**Current State:**
Both `MembersView` and `TournamentsView` implement nearly identical `useMemo` logic for client-side filtering and sorting. This leads to code duplication.

**Action:**
*   Create `hooks/useTableData.ts`.
*   Abstract the sorting (multi-type) and filtering (multi-select, date range) logic into this hook.
*   **Benefit:** Reduces boilerplate in Views and ensures consistent sorting behavior across the app.

## 3. Decouple Business Logic (High Priority)
### A. Financial Calculations
**Location:** `components/BuyinMgmtModal.tsx` & `hooks/useTournamentLogic.ts`
*   Extract core math for net payable, discounts, and wallet balances into `utils/financialUtils.ts`.
*   Ensure the "Outstanding Balance" calculated in the list view matches the detailed view exactly.

### B. Payout Validation
**Location:** `components/PayoutModelForm.tsx`
*   Extract the complex validation rules (gaps, overlaps, sum-to-100) into `utils/payoutValidator.ts`.

## 4. Form State Management (Future)
**Current State:**
Forms (`TournamentForm`, `MemberForm`) manage state with simple `useState`. As validation rules grow (especially for Tournaments), this becomes unwieldy.

**Action:**
*   Adopt a form library (e.g., React Hook Form) or create a `useForm` hook with Zod schema validation.
