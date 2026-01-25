
# Royal Flush Manager ♠️

A professional-grade, high-fidelity Club Management System and Point-of-Sale (POS) designed specifically for poker rooms and card clubs. Built with **React 18**, **TypeScript**, and **Tailwind CSS**.

This application serves as a complete solution for managing members, running complex tournaments, handling financial transactions, and displaying real-time digital signage.

---

## 🌟 Key Features

### 1. 🏆 Tournament Operations
*   **Complete Lifecycle**: Manage events from Scheduling -> Registration -> Live Play -> Reconciliation -> Completion.
*   **Advanced Templates**: Create reusable tournament templates with pre-defined structures, buy-ins, and clock layouts.
*   **Live Director Tools**:
    *   **Seating Management**: Auto-assign seats, handle table balancing, and track occupied seats.
    *   **Chip Reconciliation**: End-of-game tools to balance total chips in play against the buy-in ledger.
    *   **Smart Statuses**: Quick transitions for "Open Registration", "Start Clock", and "Finish".

### 2. 💰 Financial Point-of-Sale & Wallets
*   **Member Wallets**: Built-in digital wallet system for every player.
    *   **Transactions**: Handle Deposits and Withdrawals with support for Cash, Bank Transfer, and Crypto.
    *   **Audit Log**: Full transaction history per member.
*   **Complex Buy-in Management**:
    *   Support for Buy-ins, Re-buys, and Add-ons.
    *   **Split Payments**: Handle partial payments via Wallet balance + Cash.
    *   **Discounts**: Apply Membership, Voucher, or Campaign discounts dynamically.
    *   **Outstanding Tracking**: Real-time calculation of net payable vs. paid amounts.

### 3. 📺 Digital Signage (Clocks)
*   **WYSIWYG Editor**: Drag-and-drop canvas editor to design custom tournament screens.
    *   **Widgets**: Timer, Blinds, Antes, Players, Avg Stack, Payouts, Shapes, Images, and dynamic Tickers.
    *   **Layer Management**: Z-index control, grouping, and locking.
*   **Smart Display System**:
    *   **Tournament Mode**: Dedicated fullscreen clock for specific events.
    *   **Table Mode**: Intelligent displays for individual tables that detect which tournament is currently running on them.
    *   **Idle Screensaver**: Auto-scheduling display when no games are active.
    *   **Wake Lock**: Prevents screens from sleeping during events.

### 4. ⚙️ Structures & Logic
*   **Blind Structure Builder**: 
    *   Visual schedule builder with Drag-and-Drop reordering.
    *   Support for Levels, Breaks, Small/Big Blinds, and Antes.
    *   Estimators for tournament duration.
*   **Payout Engine**:
    *   **Algorithms**: Standard ICM and ChipEV calculators.
    *   **Custom Matrices**: Define complex rules (e.g., "Top 15%", "Winner Takes All", "Final Table Only") with validation for gaps and overlaps.

### 5. 👥 Membership & CRM
*   **Member Database**: Track personal details, notes, and activity.
*   **Tier Management**: Configurable loyalty tiers (e.g., Bronze, Silver, Gold) with custom colors and benefits.
*   **Identity Verification**: Storage for ID/Passport numbers and photo references (Front/Back) with verification status.

### 6. 🛡️ Admin & Security
*   **RBAC (Role-Based Access Control)**: Granular permission system.
    *   Define custom roles (e.g., Floor Manager, Dealer, Viewer).
    *   Set View/Edit/No Access permissions per module (Dashboard, Financials, Settings, etc.).
*   **Audit Ready**: All financial actions and tournament results are persisted.

---

## 🛠 Technical Architecture

### Core Stack
*   **Framework**: React 18 (Vite)
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS + CSS Variables for theming.
*   **Routing**: React Router DOM v6.
*   **Icons**: Lucide React.

### Data Layer (`/services`)
*   **Persistence**: Custom `DataService` acting as a synchronous ORM over `localStorage`.
    *   *Note*: Designed to be swappable with an async backend (Supabase/Firebase) in the future.
*   **Seeds**: Robust seeding logic (`mockData.ts`) to populate the app with realistic test data for demos.

### UI Architecture (`/components`)
*   **Atomic Design**: Reusable base components (`Button`, `Modal`, `NumberInput`, `Table`) in `components/ui`.
*   **Domain Modules**: Complex logic is encapsulated in domain folders:
    *   `components/clock/`: Canvas interaction, rendering engine, and property editors.
    *   `components/tournament/`: Detail panels, player lists, and stat footers.
*   **Hooks**: Heavy logic extracted to custom hooks:
    *   `useTournamentLogic`: Centralized state machine for active tournaments.
    *   `useTournamentTimer`: Accurate countdown logic handling levels and breaks.
    *   `useTableData`: Generic sorting, filtering, and searching for data grids.

### Localization
*   **i18n**: Built-in `LanguageContext` supporting hot-swapping between English (`en`) and Chinese (`zh`).

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
    The app will automatically seed `localStorage` with sample data (Members, Tournaments, Structures, Layouts) on the first load. To reset, clear your browser's Local Storage.

---

## 🎨 Theming

Global themes are handled via CSS variables defined in `index.html` and managed by `SettingsView`.
*   **Primary Color**: `--color-brand-green`
*   **Backgrounds**: `--color-brand-black`, `--color-brand-dark`
*   **Typography**: Inter font family.

