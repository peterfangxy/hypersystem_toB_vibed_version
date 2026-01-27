
# Engineering & Refactoring Roadmap

This document outlines technical debt, architectural improvements, and future optimizations. It is prioritized by impact on stability, maintainability, and scalability.

## 🔴 High Priority (Stability & Architecture)

### 1. Full Supabase Integration
**Problem:** 
Currently, only `services/data/members.ts` has Supabase integration. Other modules (`tournaments`, `financials`, `tables`) rely solely on `localStorage`.
**Solution:**
*   Create Supabase tables for `tournaments`, `registrations`, `transactions`, etc.
*   Update `services/data/*.ts` files to implement the async fetch/save pattern used in `members.ts`.
*   Ensure RLS (Row Level Security) policies are set up in Supabase.

### 2. Decouple Financial Logic & Centralize Math
**Problem:** 
Financial calculations (Net Payable, Discounts, Wallet deduction logic) are currently duplicated between `BuyinMgmtModal.tsx` and `useTournamentLogic.ts`.
**Solution:**
*   Create `utils/financeUtils.ts`.
*   Extract core functions: `calculateTransactionNet(tx)`, `calculateRegistrationTotal(reg)`, `validateWalletBalance(amount, wallet)`.

### 3. Refactor Synchronous Data Layer (Async UI)
**Problem:** 
UI components often expect synchronous returns from `DataService`. As we move to Supabase, data fetching becomes async.
**Solution:**
*   Refactor `DataService` methods to return `Promise<T>`.
*   Implement `react-query` (TanStack Query) to handle caching, loading states, and background updates, replacing the current `useEffect` + `useState` fetching pattern.

## 🟡 Medium Priority (Maintenance & DX)

### 4. Optimize Clock Rendering
**Problem:** 
`ClockRunner` triggers state updates every second, causing `ClockDisplay` to re-render the entire DOM tree.
**Solution:**
*   Memoize `ClockDisplay` components.
*   Separate "static" widgets (shapes, images, text labels) from "dynamic" widgets (timer, blinds).

### 5. Form State Management
**Problem:** 
Forms (`TournamentForm`, `MemberForm`) use native `useState`.
**Solution:**
*   Adopt `react-hook-form` + `zod` for schema definition and validation.

### 6. Internationalization Optimization
**Problem:** 
`translations.ts` is a single large object loaded instantly.
**Solution:**
*   Split translations into separate JSON files (`en.json`, `zh.json`).
*   Load languages asynchronously.

## 🟢 Low Priority (Polish & Features)

### 7. Testing Suite
**Problem:** 
No automated tests exist.
**Solution:**
*   Setup **Vitest** for unit testing utility logic (`payoutUtils`, `financeUtils`).
*   Setup **React Testing Library** for critical components (`TournamentForm`, `ClockRunner`).

### 8. Lazy Loading Routes
**Problem:** 
All views are imported eagerly in `App.tsx`.
**Solution:**
*   Use `React.lazy()` and `Suspense` for top-level views.

## ✅ Completed Items

*   **Split Monolithic `types.ts`**: Refactored into `types/models.ts`, `types/ui.ts`, etc.
*   **Payout Validation & Calculation Utility**: Extracted complex math to `utils/payoutUtils.ts`.
*   **Modular Data Service**: Split `dataService.ts` into domain-specific sub-modules.
