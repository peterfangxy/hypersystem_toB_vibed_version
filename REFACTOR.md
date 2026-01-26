
# Engineering & Refactoring Roadmap

This document outlines technical debt, architectural improvements, and future optimizations. It is prioritized by impact on stability, maintainability, and scalability.

## 🔴 High Priority (Stability & Architecture)

### 1. Decouple Financial Logic & Centralize Math
**Problem:** 
Financial calculations (Net Payable, Discounts, Wallet deduction logic) are currently duplicated between `BuyinMgmtModal.tsx` and `useTournamentLogic.ts` / `TournamentPlayerList.tsx`. This violates DRY and risks financial discrepancies.
**Solution:**
*   Create `utils/financeUtils.ts`.
*   Extract core functions: `calculateTransactionNet(tx)`, `calculateRegistrationTotal(reg)`, `validateWalletBalance(amount, wallet)`.
*   Ensure the "Outstanding Balance" calculated in the list view uses the exact same function as the modal.

### 2. Refactor Synchronous Data Layer
**Problem:** 
`DataService.ts` relies on synchronous `localStorage` calls. This blocks the main thread during large reads/writes and makes migrating to a real backend (API/DB) difficult, as all UI components expect immediate return values.
**Solution:**
*   Refactor `DataService` methods to return `Promise<T>`.
*   Implement a `useQuery` / `useMutation` pattern (or use TanStack Query) in the UI components to handle loading states and async data fetching.
*   *Migration Path:* Update `DataService` to return Promises that resolve immediately (mocking async), then refactor UI components one by one.

### DONE 
### 3. Split Monolithic `types.ts`
**Problem:** 
`types.ts` has grown to 300+ lines containing Domain Models, UI Types, Enums, and Utility types. It creates circular dependencies and makes the codebase hard to navigate.
**Solution:**
*   Create `types/` directory.
*   `types/models.ts`: Core entities (Member, Tournament, Table).
*   `types/enums.ts`: Enums (MembershipTier, PayoutModel).
*   `types/ui.ts`: UI-specific types (ClockField, Theme).
*   `types/api.ts`: Service response wrappers.

## 🟡 Medium Priority (Maintenance & DX)

### 4. Optimize Clock Rendering
**Problem:** 
`ClockRunner` (in `ClocksView`) uses a `setInterval` that triggers state updates, which causes `ClockDisplay` to re-render the entire DOM tree every second. While React is fast, complex layouts with many widgets causes unnecessary layout thrashing.
**Solution:**
*   Memoize `ClockDisplay` components.
*   Separate "static" widgets (shapes, images, text labels) from "dynamic" widgets (timer, blinds).
*   Render static widgets once, and only update dynamic widgets via refs or a localized context.

### 5. Form State Management
**Problem:** 
Forms (`TournamentForm`, `MemberForm`, `StructureForm`) use native `useState` with large objects. Validation logic is manual and interspersed with UI code.
**Solution:**
*   Adopt `react-hook-form` for state management.
*   Integrate `zod` for schema definition and validation.
*   This will standardize validation error handling and reduce boilerplate.

### DONE
### 6. Payout Validation & Calculation Utility
**Problem:** 
Complex validation logic for Custom Payout Matrices (gaps, overlaps, sum-to-100) resides inside the UI component `PayoutModelForm.tsx`, and payout calculation logic is inside `tournamentService.ts`.
**Solution:**
*   Extracted validation logic to `utils/payoutUtils.ts` (validatePayoutRules).
*   Extracted calculation logic to `utils/payoutUtils.ts` (calculatePayoutDistribution).

## 🟢 Low Priority (Polish & Features)

### 7. Lazy Loading Routes
**Problem:** 
All views are imported eagerly in `App.tsx`. As the bundle grows, initial load time will increase.
**Solution:**
*   Use `React.lazy()` and `Suspense` for top-level views (`DashboardView`, `MembersView`, etc.).

### 8. Internationalization Optimization
**Problem:** 
`translations.ts` is a single large object loaded instantly.
**Solution:**
*   Split translations into separate JSON files (`en.json`, `zh.json`).
*   Load languages asynchronously via `LanguageContext`.

### 9. Theme Context Performance
**Problem:** 
Theme application currently writes directly to `document.documentElement.style`.
**Solution:**
*   While effective, moving this to a dedicated `ThemeProvider` that uses a CSS-in-JS solution or structured CSS variables via a class (e.g., `theme-dark`, `theme-custom`) might be more robust for future "Dark/Light" mode toggles beyond just color swapping.
