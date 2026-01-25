
# Refactoring Roadmap

This document outlines technical debt and architectural improvements to ensure the application remains maintainable, performant, and consistent as features grow.

## 1. Standardize UI Components (Completed)
**Current State:**
All major views (`TournamentsView`, `MembersView`, `StructuresView`) now utilize the robust `Table` component and the `useTableData` hook for consistent sorting and filtering behavior.

## 2. Extract Table Logic Hook (Completed)
**Current State:**
The `useTableData` hook has been extracted and implemented across `MembersView`, `TournamentsView`, and `StructuresView`. It abstracts sorting (multi-type) and filtering (multi-select, date range) logic.

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
