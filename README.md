
# Royal Flush Manager

A premium, high-fidelity Point-of-Sale and Club Management System designed specifically for poker rooms. Built with **React 18**, **TypeScript**, and **Tailwind CSS**.

## 🌟 Key Features

### 1. ♠️ Tournament Management
*   **Event Lifecycle**: Manage tournaments from Scheduling -> Registration -> Live Play -> Completion.
*   **Templates**: Save recurring event configurations for one-click setup.
*   **Structure Builder**: Create reusable blind structures (Levels, Breaks) with duration and chip calculations.
*   **Payout Engine**: Configure payout models using standard algorithms (ICM, ChipEV) or Custom Matrix rules (e.g., "Top 15% gets paid").
*   **Live Tournament Director**: 
    *   Manage player registration and buy-ins.
    *   Auto-seating logic.
    *   **Chip Reconciliation**: End-of-tournament tool to ensure total chips in play match the count before finalizing results.

### 2. 💰 Financial Point-of-Sale
*   **Member Wallets**: Individual digital wallets for players. Track balances, deposits, and withdrawals.
*   **Transaction History**: Granular logs for every financial interaction (Buy-in, Re-buy, Add-on, Payout, Deposit).
*   **Buy-in Management**: specific modal for handling complex tournament payments, including discounts, vouchers, and split payments (Cash vs Wallet).

### 3. 📺 Digital Signage & Clock Editor
*   **WYSIWYG Editor**: A drag-and-drop visual editor to design tournament clock screens.
*   **Widget Library**: Add dynamic widgets for Timer, Blinds, Antes, Players Remaining, Avg Stack, Next Break, and more.
*   **Customization**: Control fonts, colors, positioning, and shapes (Rectangles, Circles) to match club branding.
*   **Live Preview**: See exactly how the clock will look with real tournament data during the setup phase.

### 4. 👥 Member & Floor Management
*   **CRM**: distinct profiles, membership tiers (Bronze to Diamond), and activity logs.
*   **Floor Map**: Manage poker tables, track capacity, and toggle table status (Active/Inactive) visually.

### 5. 🎨 Theming Engine
*   **Global Appearance**: Fully customizable color palette via the Settings panel. 
*   **Live Updates**: Change primary accents, background colors, and typography across the entire app instantly.

---

## 📂 Code Structure

### Core
*   **`App.tsx`**: Main router and layout shell.
*   **`theme.ts`**: CSS variable definitions and Tailwind utility mappings.
*   **`types.ts`**: Comprehensive TypeScript definitions for all domain entities.

### Services (`/services`)
*   **`dataService.ts`**: A robust "Mock Backend". It handles data persistence using `localStorage`, simulates database relationships, and pre-seeds the app with demo data (Players like Daniel Negreanu, Phil Ivey, etc.).
*   **`geminiService.ts`**: Integration point for Google GenAI (Gemini) for future AI features.

### Components (`/components`)

#### Views (Pages)
*   **`DashboardView.tsx`**: High-level KPIs (Revenue, Active Members) and recent winners list.
*   **`MembersView.tsx`**: Data grid for member management.
*   **`TournamentsView.tsx`**: The hub for scheduling and managing events.
*   **`TournamentParticipantsView.tsx`**: The "Run of Show" interface for active tournaments.
*   **`StructuresView.tsx`**: Management of Blind Structures and Payout Models.
*   **`ClocksView.tsx`**: Gallery of saved clock layouts.
*   **`TablesView.tsx`**: Visual grid of the physical poker room.
*   **`SettingsView.tsx`**: Club details, Access Control, and Theme customization.

#### Editors & Wizards
*   **`ClockEditor.tsx`**: Complex canvas-based editor for designing tournament clocks.
*   **`TournamentForm.tsx`**: Creation wizard with live clock preview.
*   **`StructureForm.tsx`**: Editor for blind levels and intervals.
*   **`PayoutModelForm.tsx`**: Logic builder for payout percentage distribution rules.

#### Modals & Utilities
*   **`MemberWalletModal.tsx`**: Financial dashboard for individual members.
*   **`BuyinMgmtModal.tsx`**: Detailed transaction handling for tournament entries.
*   **`AddPlayerModal.tsx`**: Quick-search modal to register existing members to events.
*   **`Modal.tsx`**: Reusable accessible modal container.
*   **`Sidebar.tsx`**: Main navigation.

## 🚀 Getting Started

1.  **Install Dependencies**: `npm install`
2.  **Run Development Server**: `npm run dev`
3.  **Reset Data**: To reset the database to its initial seed state, clear your browser's Local Storage (Application -> Local Storage -> Clear).

## 🛠 Tech Stack
*   **Framework**: React 18
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS
*   **Icons**: Lucide React
*   **Routing**: React Router DOM
*   **AI**: Google GenAI SDK (Ready)
