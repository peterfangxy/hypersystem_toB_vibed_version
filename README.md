
# Royal Flush Manager ♠️

A professional-grade, high-fidelity Club Management System and Point-of-Sale (POS) designed specifically for poker rooms and card clubs. Built with **React 18**, **TypeScript**, **Tailwind CSS**, and **Supabase** (Partial/Hybrid).

This application serves as a complete solution for managing members, running complex tournaments (ICM/ChipEV), handling financial transactions, and displaying real-time digital signage.

---

## 🌟 Key Features

### 1. 🏆 Tournament Operations
*   **Complete Lifecycle**: Schedule -> Registration -> Live Play -> Reconciliation -> Completion.
*   **Advanced Templates**: Reusable templates for recurring events (Daily Turbo, Deepstacks).
*   **Live Director Tools**:
    *   **Seating Management**: Auto-assign seats, handle table balancing, and track occupied seats.
    *   **Chip Reconciliation**: End-of-game tools to balance total chips in play against the buy-in ledger.
    *   **Smart Statuses**: Quick transitions for "Open Registration", "Start Clock", and "Finish".
    *   **Real-time Updates**: Uses `BroadcastChannel` to sync state across multiple open tabs (e.g., Control Panel updates Clock instantly).

### 2. 💰 Financial Point-of-Sale & Wallets
*   **Member Wallets**: Built-in digital wallet system for every player.
    *   **Transactions**: Handle Deposits and Withdrawals (Cash, Bank, Crypto).
    *   **Audit Log**: Full transaction history per member.
*   **Complex Buy-in Management**:
    *   Support for Buy-ins, Re-buys, and Add-ons.
    *   **Split Payments**: Handle partial payments via Wallet balance + Cash.
    *   **Outstanding Tracking**: Real-time calculation of net payable vs. paid amounts.

### 3. 📺 Digital Signage (Clocks)
*   **WYSIWYG Editor**: Drag-and-drop canvas editor to design custom tournament screens.
    *   **Widgets**: Timer, Blinds, Antes, Players, Avg Stack, Payouts, Shapes, Images, and dynamic Tickers.
    *   **Layer Management**: Z-index control, grouping, and locking.
*   **Smart Display System**:
    *   **Tournament Mode**: Dedicated fullscreen clock for specific events.
    *   **Table Mode**: Intelligent displays for individual tables that detect which tournament is currently running on them.
    *   **Idle Screensaver**: Auto-scheduling display when no games are active.
    *   **Wake Lock**: Prevents screens from sleeping during events using the browser Wake Lock API.

### 4. ⚙️ Structures & Logic
*   **Blind Structure Builder**: 
    *   Visual schedule builder with Drag-and-Drop reordering.
    *   Support for Levels, Breaks, Small/Big Blinds, and Antes.
*   **Payout Engine**:
    *   **Algorithms**: 
        *   **ICM (Independent Chip Model)**: Calculates equity based on stack sizes (ideal for final tables/deals).
        *   **ChipEV**: Proportional equity based on chip count.
        *   **Custom Matrix**: Fixed percentage rules (e.g., "Top 15%").
    *   **Smoothing**: Auto-rounding logic to prevent fractional cent payouts.

### 5. 👥 Membership & CRM
*   **Member Database**: Track personal details, notes, and activity.
*   **Tier Management**: Configurable loyalty tiers (e.g., Bronze, Silver, Gold) with custom colors and benefits.
*   **Identity Verification**: Storage for ID/Passport numbers and photo references with verification workflows.
*   **Hybrid Data**: Members are synchronized with Supabase (if configured), falling back to LocalStorage.

### 6. 🛡️ Admin & Security
*   **RBAC (Role-Based Access Control)**: Granular permission system.
    *   Define custom roles (e.g., Floor Manager, Dealer, Viewer).
    *   Set View/Edit/No Access permissions per module.
*   **Audit Ready**: All financial actions and tournament results are persisted.

---

## 🛠 Technical Architecture

### Core Stack
*   **Framework**: React 18 (Vite)
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS + CSS Variables for dynamic theming.
*   **Routing**: React Router DOM v6.
*   **Icons**: Lucide React.
*   **Backend**: Supabase (PostgreSQL) + LocalStorage fallback.

### Data Layer (`/services`)
*   **Modular Architecture**: Data logic is split into domain-specific files (`data/members.ts`, `data/tournaments.ts`, etc.) and exported via a unified `DataService`.
*   **Hybrid Sync**: 
    *   Primary reads/writes go to `localStorage` for optimistic UI updates.
    *   `services/data/members.ts` implements an async sync pattern with Supabase.
*   **Seeds**: Robust seeding logic (`mockData.ts`) to populate the app with realistic test data.

### UI Architecture (`/components`)
*   **Atomic Design**: Reusable base components (`Button`, `Modal`, `NumberInput`, `Table`) in `components/ui`.
*   **Hooks**: Heavy logic extracted to custom hooks:
    *   `useTournamentLogic`: Centralized state machine for active tournaments.
    *   `useTournamentTimer`: Accurate countdown logic handling levels and breaks.
    *   `useTableData`: Generic sorting, filtering, and searching for data grids.
    *   `useCanvasInteraction`: Logic for drag-and-drop in the Clock Editor.

### Type System (`/types`)
*   **Models**: Core entities (`Member`, `Tournament`) in `types/models.ts`.
*   **UI**: View-specific types (`ClockConfig`) in `types/ui.ts`.
*   **Enums**: `types/enums.ts`.

---

## 🚀 Getting Started

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Start Development Server**
    ```bash
    npm run dev
    ```

3.  **Initial Setup**: 
    The app will automatically seed `localStorage` with sample data on the first load.

---

## 🎨 Theming

Global themes are handled via CSS variables defined in `index.html` and managed by `SettingsView`.
*   **Primary Color**: `--color-brand-green`
*   **Backgrounds**: `--color-brand-black`, `--color-brand-dark`
