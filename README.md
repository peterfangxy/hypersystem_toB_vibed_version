
# Royal Flush Manager

A premium, high-fidelity Point-of-Sale (POS) and Club Management System designed specifically for professional poker rooms. Built with **React 18**, **TypeScript**, and **Tailwind CSS**.

## 🌟 Key Features

### 1. 📺 Advanced Digital Signage (Clocks)
*   **WYSIWYG Editor**: A drag-and-drop canvas editor to design custom tournament screens. Support for dynamic widgets (Timer, Blinds, Antes, Players, Avg Stack), shapes, and custom text.
*   **Intelligent Table Clocks**: 
    *   Automatically detects which tournament is running on specific tables.
    *   **Smart Priority Logic**: Prioritizes "In Progress" games over "Registration" or "Idle" states to prevent conflicts.
    *   **Auto-Scheduling**: Displays upcoming registration details when no live game is active.
*   **JSON Import/Export**: Share clock layouts between devices or back them up easily.
*   **Fullscreen Mode**: Optimized for TV displays and projectors.

### 2. ♠️ Tournament Operations
*   **Event Lifecycle**: Manage the full flow from Scheduling -> Registration -> Live Play -> Completion.
*   **Structure Builder**: Create reusable blind structures with duration, ante types (BB Ante), and break schedules.
*   **Payout Engine**: 
    *   **Algorithm**: Standard ICM and ChipEV calculators.
    *   **Custom Matrix**: Define complex payout rules (e.g., "Top 15% gets paid", "Winner Takes All").
*   **Live Tournament Director**: 
    *   **Chip Reconciliation**: End-of-tournament tool to verify total chips in play against the buy-in ledger before finalizing results.
    *   **Seating Management**: Assign and track player seats per table.
    *   **Templates**: Save frequent tournament configurations for one-click setup.

### 3. 💰 Financial Point-of-Sale
*   **Member Wallets**: Digital wallet system for every player. Track deposits, withdrawals, and current balance.
*   **Complex Buy-ins**: Handle multi-faceted payments including:
    *   Cash & Wallet deductions.
    *   Discounts (Membership, Campaign, Vouchers).
    *   Partial payments and tracking outstanding balances.
*   **Transaction Logs**: Granular history of every financial interaction (Buy-in, Re-buy, Add-on, Payout).
*   **Dashboard Analytics**: Real-time overview of monthly revenue, prize pools, and active player counts.

### 4. 👥 Member & Floor Management
*   **CRM**: distinct profiles, membership tiers (Bronze to Diamond), identity verification storage, and activity logs.
*   **Floor Map**: Manage poker tables, track capacity, and toggle table status (Active/Inactive/Archived).
*   **Role-Based Access**: 
    *   **Admin**: Full system access.
    *   **Operator**: Day-to-day operations (Tournaments/Tables).
    *   **Viewer**: Read-only access for displays.

### 5. 🎨 Customization & Architecture
*   **Theming Engine**: Global appearance settings. Instantly change primary accents, background colors, and typography across the entire app via CSS variables.
*   **Internationalization (i18n)**: Fully localized interface supporting **English** and **Chinese (Simplified)**.
*   **Data Persistence**: robust `localStorage` service acting as a mock backend with relational data integrity.

---

## 📂 Code Structure

### Core
*   **`App.tsx`**: Main router and layout shell.
*   **`theme.ts`**: CSS variable definitions and Tailwind utility mappings.
*   **`types.ts`**: Comprehensive TypeScript definitions for all domain entities.
*   **`contexts/LanguageContext.tsx`**: Context provider for localization.

### Views (`/views`)
*   **`DashboardView.tsx`**: Analytics and high-level KPIs.
*   **`ClocksView.tsx`**: Hub for running Tournament Clocks, Table Clocks, and the Layout Editor.
*   **`TournamentsView.tsx`**: Management grid for events and templates.
*   **`MembersView.tsx`**: Member list, CRM, and Wallet access.
*   **`StructuresView.tsx`**: Configuration for Blind Structures and Payout Models.
*   **`SettingsView.tsx`**: Global club settings, team management, and theme customization.

### Components (`/components`)
*   **`ClockEditor.tsx`**: Canvas-based editor for designing clock layouts.
*   **`ClockDisplay.tsx`**: Rendering engine for clock configs (used in Editor, Previews, and Live Mode).
*   **`TournamentDetailPanel.tsx`**: The "Run of Show" interface for active tournaments.
*   **`BuyinMgmtModal.tsx`**: Detailed ledger for managing individual player payments.
*   **`MemberWalletModal.tsx`**: Banking interface for member deposits/withdrawals.
*   **`TournamentForm.tsx`**: Wizard for creating events with live clock preview.

## 🚀 Getting Started

1.  **Install Dependencies**: 
    ```bash
    npm install
    ```
2.  **Run Development Server**: 
    ```bash
    npm run dev
    ```
3.  **Reset Data**: To reset the database to its initial seed state (including sample tournaments, members, and layouts), clear your browser's Local Storage (Application -> Local Storage -> Clear) and refresh the page.

## 🛠 Tech Stack
*   **Framework**: React 18
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS
*   **Icons**: Lucide React
*   **Routing**: React Router DOM
*   **AI Integration**: Google GenAI SDK (@google/genai) - *Ready for future prediction features.*
