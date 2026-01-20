# Royal Flush Manager

A premium Point-of-Sale and management system for high-end poker clubs, built with React, TypeScript, and Tailwind CSS.

## Code Structure Overview

### 1. Core Application
*   **`index.html`**: The HTML entry point. Includes Tailwind CSS script and font imports.
*   **`index.tsx`**: The React entry point that mounts the app to the DOM.
*   **`App.tsx`**: The main container component. It handles the layout (Sidebar + Main Content area) and basic view routing.
*   **`theme.ts`**: Contains centralized design tokens (colors, border styles, component styles). Use this for consistency across the dark-themed UI.
*   **`types.ts`**: Defines TypeScript interfaces for domain entities (`Member`, `Tournament`, `PokerTable`, `Structure`, `Payout`) and Enums.

### 2. Services
*   **`services/dataService.ts`**: A "Mock Backend" that persists data to `localStorage`. Handles CRUD logic for all entities and complex business logic like financial calculations and tournament completion.
*   **`services/geminiService.ts`**: Setup for the Google GenAI SDK for future AI features.

### 3. Modules (Components)

#### Dashboard
*   **`components/DashboardView.tsx`**: The landing page displaying high-level club statistics (Revenue, Active Members) and recent tournament winners.

#### Members Management
*   **`components/MembersView.tsx`**: Main view for Members. Displays a sortable/filterable data table.
*   **`components/MemberForm.tsx`**: Modal for creating and editing member profiles.
*   **`components/MemberWalletModal.tsx`**: Financial dashboard for individual members. Handles transaction history (wins, buy-ins, withdrawals) and processes new withdrawal requests (Cash/Crypto/Bank).

#### Tournaments Management
*   **`components/TournamentsView.tsx`**: Lists events with status workflow capabilities (Scheduled -> Registration -> In Progress -> Completed) and manages Tournament Templates.
*   **`components/TournamentForm.tsx`**: Comprehensive wizard for creating events, selecting blind structures, and assigning payout models.
*   **`components/TournamentParticipantsView.tsx`**: The "Tournament Director" view. Handles player registration, seating, and chip counts.
*   **`components/BuyinMgmtModal.tsx`**: A detailed modal for managing tournament transactions (Buy-ins, Re-buys, Add-ons) and discounts per player.
*   **`components/AddPlayerModal.tsx`**: Modal for searching and registering new players to a tournament.

#### Structures & Payouts
*   **`components/StructuresView.tsx`**: Centralized management for reusable Tournament Structures (Blind Levels) and Payout Matrices.
*   **`components/StructureForm.tsx`**: Editor for defining blind levels, durations, and break schedules.
*   **`components/PayoutModelForm.tsx`**: Logic builder for custom payout algorithms (e.g., Top 15% matrix with specific rules per player count).

#### Tables Management
*   **`components/TablesView.tsx`**: Visual grid representation of the poker floor. Allows quick status toggling (Active/Inactive).
*   **`components/TableForm.tsx`**: Modal for adding new tables or updating capacity/notes.

#### Shared
*   **`components/Sidebar.tsx`**: Persistent left-hand navigation menu.
*   **`components/Modal.tsx`**: Reusable modal wrapper with backdrop, animations, and size configurations.

## Developer Notes
*   **Data Persistence**: All data is stored in `localStorage`. You can reset the app to its initial seed state by clearing your browser's application storage.
*   **Styling**: Uses utility-first CSS (Tailwind). Custom brand colors (`brand-green`, `brand-black`) are configured in `index.html`.