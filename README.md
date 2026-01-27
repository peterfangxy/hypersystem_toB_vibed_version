
# Royal Flush Manager ♠️

A professional-grade, high-fidelity Club Management System and Point-of-Sale (POS) designed specifically for poker rooms and card clubs. Built with **React 18**, **TypeScript**, **Tailwind CSS**, and designed for a hybrid LocalStorage/Supabase data architecture.

This application serves as a complete solution for managing members, running complex tournaments (ICM/ChipEV), handling financial transactions, and displaying real-time digital signage.

---

## 🌟 Key Features

### 1. 🏆 Tournament Operations
*   **Complete Lifecycle**: Schedule -> Registration -> Live Play -> Reconciliation -> Completion.
*   **Live Management**:
    *   **Seating Logic**: Auto-balancing logic and seat assignment.
    *   **Buy-in Management**: Track Re-buys, Add-ons, and fees with support for vouchers and campaigns.
    *   **Player & Chip Tracking**: Monitor chips in play vs. counted chips for security.
*   **Payout Engine**:
    *   **ICM (Independent Chip Model)**: Advanced equity calculations for final table deals.
    *   **ChipEV**: Proportional equity based on stack sizes.
    *   **Custom Matrices**: Define fixed percentage rules (e.g., "Top 15%").

### 2. 📺 Digital Signage (Clocks)
*   **WYSIWYG Editor**: Fully customizable Drag-and-Drop canvas editor to design tournament screens.
*   **Widgets Library**: Timers, Blinds, Antes, Player Counts, Avg Stack, Payouts, Tickers, and Shapes.
*   **Multi-View System**:
    *   **Tournament Mode**: Dedicated fullscreen clock for specific events.
    *   **Table Mode**: Intelligent displays for individual tables showing the active tournament on that table.
    *   **Idle Screensaver**: Auto-scheduling display when no games are active.

### 3. 💰 Financial Point-of-Sale & Wallets
*   **Member Wallets**: Built-in digital wallet system for every player.
*   **Transaction History**: Detailed audit trail of Deposits, Withdrawals (Cash, Bank, Crypto), and Winnings.
*   **Split Payments**: Handle tournament entry fees using a mix of wallet balance and cash.

### 4. 👥 Membership & CRM
*   **Member Database**: Track personal details, notes, and activity.
*   **Tier Management**: Configurable loyalty tiers (e.g., Bronze, Silver, Gold) with custom colors and benefits.
*   **Identity Verification**: KYC status tracking with ID photo storage slots.

### 5. 🌐 Internationalization (i18n)
*   **Multi-language Support**: Fully translated into **English** and **Traditional Chinese (繁體中文)**.
*   **Context-Aware**: Format dates, currencies, and numbers based on locale.

### 6. 🛡️ Admin & Security
*   **RBAC (Role-Based Access Control)**: Granular permission system (View/Edit/No Access) per module.
*   **Audit Logs**: comprehensive tracking of system actions, logins, and sensitive data changes.

---

## 🛠 Technical Architecture

### Core Stack
*   **Framework**: React 18 (Vite)
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS + CSS Variables for dynamic theming.
*   **State Management**: React Context + Custom Hooks.
*   **Routing**: React Router DOM v6.
*   **I18n**: i18next.

### Data Layer (`/services`)
*   **Modular Architecture**: Data logic is split into domain-specific files (`data/members.ts`, `data/tournaments.ts`, etc.).
*   **Hybrid Sync**: 
    *   Primary reads/writes go to `localStorage` for instant UI updates and offline capability.
    *   `services/broadcastService.ts` handles cross-tab synchronization using the Broadcast Channel API.
    *   Supabase integration hooks are present in `members.ts` for cloud synchronization (optional/configurable).

### Project Structure

```text
/
├── components/         # Reusable UI components & Feature-specific modals
│   ├── clock/          # Clock Editor & Display Canvas
│   ├── tournament/     # Tournament management & Live control
│   └── ui/             # Atomic UI elements (Buttons, Modals, Inputs, Tables)
├── contexts/           # Global state (Language, Theme)
├── hooks/              # Custom React hooks (useTableData, useTournamentTimer, etc.)
├── locales/            # i18n translation files
│   ├── en/             # English translations
│   └── zh_TW/          # Traditional Chinese translations
├── services/           # Data access & Business logic
│   ├── data/           # Domain-specific data handlers (Storage/Supabase)
│   ├── seeds/          # Mock data generators
│   └── analytics...    # Business logic services
├── types/              # TypeScript definitions
│   ├── models.ts       # Core entities (Member, Tournament)
│   ├── ui.ts           # View-specific types (ClockConfig)
│   └── enums.ts        # Shared constants
├── utils/              # Helper functions (Math, Validation, Payouts)
└── views/              # Main page views (Router destinations)
    ├── clocks/         # Clock list and runners
    ├── dashboard/      # Analytics dashboard
    ├── members/        # Member management
    ├── settings/       # System configuration
    ├── structures/     # Blind & Payout structure editors
    └── tournaments/    # Tournament lists & templates
```

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
    The app will automatically seed `localStorage` with sample data (Members, Tournaments, Clock Layouts) on the first load.

---

## 🎨 Theming

Global themes are handled via CSS variables defined in `index.html` and managed by `SettingsView`.
*   **Primary Color**: `--color-brand-green`
*   **Backgrounds**: `--color-brand-black`, `--color-brand-dark`
*   **Typography**: `--color-brand-white`, `--color-brand-gray`
