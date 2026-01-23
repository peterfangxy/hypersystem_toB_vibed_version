
# Royal Flush Manager

A premium, high-fidelity Point-of-Sale and Club Management System designed specifically for high-end poker rooms. Built with **React 18**, **TypeScript**, and **Tailwind CSS**.

## 🌟 Key Features

### 1. ♠️ Tournament Management
*   **Event Lifecycle**: Manage tournaments from Scheduling -> Registration -> Live Play -> Completion.
*   **Templates**: Save recurring event configurations for one-click setup.
*   **Structure Builder**: Create reusable blind structures (Levels, Breaks) with duration and chip calculations.
*   **Payout Engine**: Configure payout models using standard algorithms (ICM, ChipEV) or Custom Matrix rules (e.g., "Top 15% gets paid").
*   **Live Tournament Director**: 
    *   Integrated accordion dashboard for managing active events.
    *   **Chip Reconciliation**: End-of-tournament tool to ensure total chips in play match the count before finalizing results.
    *   **Table Balancing**: Auto-check seat availability and move players.
    *   **Buy-in Management**: Handle complex payments (Cash, Chips, Wallet, Vouchers).

### 2. 📺 Digital Signage & Clock Editor
*   **WYSIWYG Editor**: A drag-and-drop visual editor (Canvas-like) to design tournament clock screens.
*   **JSON Import/Export**: Share and backup clock configurations easily via JSON.
*   **Widget Library**: Add dynamic widgets for Timer, Blinds, Antes, Players Remaining, Avg Stack, Next Break, Shapes, and Custom Text.
*   **Live Runner**: Fullscreen, responsive clock display that syncs in real-time with tournament data.

### 3. 💰 Financial Point-of-Sale
*   **Member Wallets**: Individual digital wallets for players. Track balances, deposits, and withdrawals.
*   **Transaction History**: Granular logs for every financial interaction (Buy-in, Re-buy, Add-on, Payout, Deposit).
*   **Reporting**: Dashboard with monthly revenue, prize pool, and participation metrics.

### 4. 👥 Member & Floor Management
*   **CRM**: Distinct profiles, membership tiers (Bronze to Diamond), and activity logs.
*   **Floor Map**: Manage poker tables, track capacity, and toggle table status (Active/Inactive) visually.

### 5. 🎨 Customization & Architecture
*   **Internationalization (i18n)**: Fully localized interface supporting **English** and **Chinese (Simplified)** via React Context.
*   **Theming Engine**: Global appearance settings. Change primary accents, background colors, and typography across the entire app instantly via CSS variables.
*   **Consistent Layouts**: Utilizes abstract `PageLayout` components for pixel-perfect consistency across views.

---

## 📂 Code Structure

### Core
*   **`App.tsx`**: Main router and layout shell.
*   **`theme.ts`**: CSS variable definitions and Tailwind utility mappings.
*   **`types.ts`**: Comprehensive TypeScript definitions for all domain entities (Members, Tournaments, Clocks, etc.).
*   **`contexts/LanguageContext.tsx`**: Context provider for localization.

### Services (`/services`)
*   **`dataService.ts`**: A robust "Mock Backend". Handles data persistence using `localStorage`, simulates database relationships (Foreign Keys), and includes seed data generator.
*   **`geminiService.ts`**: Integration point for Google GenAI (Gemini) for future AI features (Bracket generation, Chat).

### Components (`/components`)

#### UI Primitives (`/components/ui`)
*   **`PageLayout.tsx`**: layout primitives (`PageHeader`, `TabContainer`, `ControlBar`) for standardizing page structure.
*   **`Modal.tsx`**: Reusable, accessible modal container with Z-index management.
*   **`NumberInput.tsx`**: specialized input for financial/numeric data with scroll support and validation.
*   **`Button.tsx`**: Standardized button component with variants.

#### Editors & Wizards
*   **`ClockEditor.tsx`**: Complex canvas-based editor for designing tournament clocks.
*   **`TournamentForm.tsx`**: Creation wizard with live clock preview.
*   **`StructureForm.tsx`**: Editor for blind levels and intervals.
*   **`PayoutModelForm.tsx`**: Logic builder for payout percentage distribution rules.

#### Complex Views
*   **`TournamentDetailPanel.tsx`**: The "Run of Show" interface embedded within the Tournament list.
*   **`BuyinMgmtModal.tsx`**: Detailed ledger for managing individual player payments within a tournament.
*   **`ClockDisplay.tsx`**: The rendering engine that interprets `ClockConfig` JSON to display the UI.

## 🚀 Getting Started

1.  **Install Dependencies**: `npm install`
2.  **Run Development Server**: `npm run dev`
3.  **Reset Data**: To reset the database to its initial seed state, clear your browser's Local Storage (Application -> Local Storage -> Clear) and refresh.

## 🛠 Tech Stack
*   **Framework**: React 18
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS
*   **Icons**: Lucide React
*   **Routing**: React Router DOM
*   **AI**: Google GenAI SDK (@google/genai)
