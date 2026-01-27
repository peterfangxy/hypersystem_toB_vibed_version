
import { MembershipTier, PayoutModel } from './enums';
import { ClubTheme } from './ui';

// --- Membership Models ---

export type MemberStatus = 'Pending Approval' | 'Activated' | 'Deactivated';

export type Gender = 'Male' | 'Female' | 'Other' | 'Prefer not to say';

export interface TierDefinition {
    id: string; // Unique ID, matches enum values for defaults
    name: string; // Display Name
    color: string; // Hex Color
    order: number; // Sort Order
    requirements?: string; // "Spend $500/mo"
    benefits?: string; // "Free drinks, priority seating"
}

export interface Member {
  id: string;
  fullName: string;
  nickname?: string;
  club_id?: string;
  email: string;
  phone: string;
  
  // Demographics
  birthDate?: string; // ISO Date YYYY-MM-DD
  age: number;
  gender: Gender;
  
  // Identity
  idNumber?: string;
  passportNumber?: string;
  idPhotoFrontUrl?: string;
  idPhotoBackUrl?: string;
  isIdVerified?: boolean; // New field for staff verification

  joinDate: string;
  tier?: string; // ID of the TierDefinition, or undefined/null
  status: MemberStatus;
  notes?: string;
  avatarUrl?: string;
}

// --- Table Models ---

export type TableStatus = 'Active' | 'Inactive' | 'Archived';

export interface PokerTable {
  id: string;
  name: string;
  capacity: number;
  status: TableStatus;
  notes?: string;
}

// --- Payout Models ---

export type PayoutType = 'ICM' | 'ChipEV' | 'Custom';

export interface PayoutRule {
  minPlayers: number;
  maxPlayers: number;
  placesPaid: number;
  percentages: number[]; // e.g. [50, 30, 20] must sum to 100
}

export interface PayoutAllocation {
    id: string;
    name: string; // e.g. "Main Pot", "Bounty Pool"
    percent: number; // 0-100, portion of total prize pool
    type: PayoutType;
    color?: string; // UI helper
    rules?: PayoutRule[]; // Only for Custom Matrix
}

export interface PayoutStructure {
  id: string;
  name: string;
  description?: string;
  isSystemDefault?: boolean;
  allocations: PayoutAllocation[]; // List of splits (e.g. 95% Main, 5% High Hand)
}

// --- Tournament Models ---

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
  clockConfigId?: string; // New: Linked Clock Layout

  // Legacy/Snapshot fields (kept for display/fallback)
  payoutModel: PayoutModel; 
  
  status?: TournamentStatus; // Optional for Templates
  description?: string;
  tableIds?: string[];
  
  // Template Flag
  isTemplate?: boolean;
  createdAt?: string;
}

export type RegistrationStatus = 'Reserved' | 'Joined' | 'Cancelled';

export interface TournamentTransaction {
  id: string;
  type: 'BuyIn' | 'Rebuy' | 'AddOn';
  timestamp: string;
  isPaid?: boolean; // Payment received status
  
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
  
  // Verification
  isSigned?: boolean; // Member has confirmed final chip count
  signatureUrl?: string; // Base64 data URL of the signature
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

// --- Audit Logs ---

export interface AuditLog {
  id: string;
  timestamp: string;
  userName: string;
  userRole: string;
  action: string;
  targetType: string;
  targetName: string | null;
  details: string | null;
}

// --- Settings & Access ---

export type AccessRole = string; 

export type PermissionLevel = 'no_access' | 'view' | 'edit';

export type AppModule = 'dashboard' | 'members' | 'tables' | 'tournaments' | 'structures' | 'clocks' | 'settings';

export interface RoleDefinition {
    id: string;
    name: string;
    description?: string;
    isSystem?: boolean; // Cannot delete/rename system roles
    permissions: Record<AppModule, PermissionLevel>;
}

export interface TeamMember {
    id: string;
    fullName: string;
    email: string;
    role: AccessRole;
    status: 'Active' | 'Pending' | 'Deactivated';
    lastActive?: string;
    avatarUrl?: string;
}

export interface ClubSettings {
    name: string;
    address: string;
    googleMapLink?: string;
    contactEmail: string;
    contactPhone: string;
    logoUrl: string;
    theme: ClubTheme;
}
