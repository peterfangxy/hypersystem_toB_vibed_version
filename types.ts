
export enum MembershipTier {
  BRONZE = 'Bronze',
  SILVER = 'Silver',
  GOLD = 'Gold',
  PLATINUM = 'Platinum',
  DIAMOND = 'Diamond'
}

export type MemberStatus = 'Submitted' | 'Pending Approval' | 'Activated' | 'Deactivated';

export type Gender = 'Male' | 'Female' | 'Other' | 'Prefer not to say';

export interface Member {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  age: number;
  gender: Gender;
  joinDate: string;
  tier: MembershipTier;
  status: MemberStatus;
  notes?: string;
  avatarUrl?: string;
}

export type TableStatus = 'Active' | 'Inactive' | 'Archived';

export interface PokerTable {
  id: string;
  name: string;
  capacity: number;
  status: TableStatus;
  notes?: string;
}

export enum PayoutModel {
  FIXED = 'Fixed %',
  ICM = 'ICM',
  CHIP_EV = 'ChipEV',
  FGS = 'FGS'
}

// --- New Payout Definitions ---

export type PayoutType = 'Algorithm' | 'Custom Matrix';

export interface PayoutRule {
  minPlayers: number;
  maxPlayers: number;
  placesPaid: number;
  percentages: number[]; // e.g. [50, 30, 20] must sum to 100
}

export interface PayoutStructure {
  id: string;
  name: string;
  type: PayoutType;
  description?: string;
  isSystemDefault?: boolean; // If true, cannot be edited/deleted (e.g. ICM)
  rules?: PayoutRule[]; // Only for Custom Matrix
}

// ------------------------------

export type TournamentStatus = 'Scheduled' | 'Registration' | 'In Progress' | 'Completed' | 'Cancelled';

export interface Tournament {
  id: string;
  name: string;
  startDate?: string; // Optional for Templates
  startTime?: string; // Optional for Templates
  endTime?: string; 
  estimatedDurationMinutes: number;
  
  buyIn: number;
  fee: number;
  maxPlayers: number;

  // Snapshot fields from Structure
  startingChips: number;
  startingBlinds: string; // e.g. "100/200"
  blindLevelMinutes: number; // Kept as a "default" or "base" duration for display
  blindIncreasePercent: number; // e.g. 50%
  rebuyLimit: number; // 0 for Freezeout
  lastRebuyLevel: number;
  
  // Linked Structures
  structureId?: string; // Renamed from blindStructureId
  payoutStructureId?: string;

  // Legacy/Snapshot fields (kept for display/fallback)
  payoutModel: PayoutModel; 
  
  status?: TournamentStatus; // Optional for Templates
  description?: string;
  tableIds?: string[];
  
  // Template Flag
  isTemplate?: boolean;
}

export type RegistrationStatus = 'Registered' | 'Approved' | 'Joined' | 'Cancelled';

export interface TournamentTransaction {
  id: string;
  type: 'BuyIn' | 'Rebuy' | 'AddOn';
  timestamp: string;
  
  // Modifiers
  rebuyDiscount: number;
  membershipDiscount: number;
  voucherDiscount: number;
  campaignDiscount: number;
  depositPaid: number; // Amount paid from Member Deposit/Balance
}

export interface TournamentRegistration {
  id: string;
  tournamentId: string;
  memberId: string;
  status: RegistrationStatus;
  registeredAt: string;
  buyInCount: number;
  finalChipCount?: number;
  prize?: number;
  rank?: number;
  // Seating
  tableId?: string;
  seatNumber?: number;
  
  // Granular History
  transactions?: TournamentTransaction[];
}

export type StructureItemType = 'Level' | 'Break';

export interface StructureItem {
  type: StructureItemType;
  duration: number; // Minutes
  
  // Level Specific
  level?: number; // Sequence number 1, 2, 3...
  smallBlind?: number;
  bigBlind?: number;
  ante?: number;
}

export interface TournamentStructure {
  id: string;
  name: string;
  
  startingChips: number;
  
  // Rebuys (Moved from Tournament)
  rebuyLimit: number;
  lastRebuyLevel: number;

  items: StructureItem[];
}

// --- Financials ---

export type PaymentMethod = 'Cash' | 'Bank Transfer' | 'Crypto';

export interface Withdrawal {
  id: string;
  memberId: string;
  amount: number;
  date: string;
  method: PaymentMethod;
  note?: string;
  processedBy?: string;
}

export interface Deposit {
  id: string;
  memberId: string;
  amount: number;
  date: string;
  method: PaymentMethod;
  note?: string;
  processedBy?: string;
}

export interface FinancialTransaction {
  id: string;
  type: 'Win' | 'Withdrawal' | 'BuyIn' | 'Deposit';
  amount: number;
  date: string;
  description: string;
  referenceId?: string; // Tournament ID or Withdrawal ID
  method?: string;
}

export interface MemberFinancials {
  balance: number;
  totalWinnings: number;
  totalDeposited: number;
  totalBuyIns: number;
  totalWithdrawn: number;
  transactions: FinancialTransaction[];
}

// --- Settings & Access ---

export type AccessRole = 'Owner' | 'Admin' | 'Operator' | 'Viewer';

export interface TeamMember {
    id: string;
    fullName: string;
    email: string;
    role: AccessRole;
    status: 'Active' | 'Pending' | 'Deactivated';
    lastActive?: string;
    avatarUrl?: string;
}

export interface ClubTheme {
    primaryColor: string; // brand-green
    backgroundColor: string; // brand-black
    cardColor: string; // brand-dark
    textColor: string; // brand-white (Primary Font Color)
    secondaryTextColor: string; // brand-gray (Secondary Font Color)
    borderColor: string; // brand-border
}

export interface ClubSettings {
    name: string;
    address: string;
    contactEmail: string;
    contactPhone: string;
    logoUrl: string;
    theme: ClubTheme;
}

export type ViewState = 'dashboard' | 'members' | 'tables' | 'tournaments' | 'structures' | 'settings';
