
import {
  Member,
  PokerTable,
  Tournament,
  TournamentStructure,
  PayoutStructure,
  TournamentRegistration,
  ClubSettings,
  TeamMember,
  MemberFinancials,
  FinancialTransaction,
  RegistrationStatus,
  TournamentTransaction,
  PaymentMethod,
  ClockConfig,
  RoleDefinition,
  TierDefinition,
  MembershipTier
} from '../types';

import {
  SEED_MEMBERS,
  SEED_TABLES,
  SEED_STRUCTURES,
  SEED_PAYOUTS,
  SEED_TOURNAMENTS,
  SEED_CLOCKS,
  SEED_TEMPLATES,
  SEED_ROLES,
  SEED_REGISTRATIONS
} from './mockData';

import { broadcast } from './broadcastService';

// Storage Keys
const SETTINGS_KEY = 'rf_settings';
const MEMBERS_KEY = 'rf_members';
const TABLES_KEY = 'rf_tables';
const STRUCTURES_KEY = 'rf_structures';
const PAYOUTS_KEY = 'rf_payouts';
const TOURNAMENTS_KEY = 'rf_tournaments';
const TEMPLATES_KEY = 'rf_templates';
const REGISTRATIONS_KEY = 'rf_registrations';
const FINANCIALS_KEY = 'rf_financials';
const TEAM_KEY = 'rf_team';
const CLOCKS_KEY = 'rf_clocks';
const ROLES_KEY = 'rf_roles';
const TIERS_KEY = 'rf_tiers';

// Helpers
function getLocalData<T>(key: string): T | null {
  const str = localStorage.getItem(key);
  return str ? JSON.parse(str) : null;
}

function setLocalData<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// --- Club Settings ---
export const getClubSettings = (): ClubSettings => {
  const defaults: ClubSettings = {
    name: 'Royal Flush Club',
    address: '123 Poker Blvd, Las Vegas, NV',
    googleMapLink: '',
    contactEmail: 'info@royalflush.com',
    contactPhone: '+1 (555) 123-4567',
    logoUrl: '',
    theme: {
      primaryColor: '#06C167',
      backgroundColor: '#000000',
      cardColor: '#171717',
      textColor: '#FFFFFF',
      secondaryTextColor: '#A3A3A3',
      borderColor: '#333333'
    }
  };
  return getLocalData<ClubSettings>(SETTINGS_KEY) || defaults;
};

export const saveClubSettings = (settings: ClubSettings): void => {
  setLocalData(SETTINGS_KEY, settings);
};

// --- Members ---
export const getMembers = (): Member[] => {
  const data = getLocalData<Member[]>(MEMBERS_KEY);
  if (!data || data.length === 0) {
      setLocalData(MEMBERS_KEY, SEED_MEMBERS);
      return SEED_MEMBERS;
  }
  return data;
};

export const saveMember = (member: Member): void => {
  const members = getMembers();
  const idx = members.findIndex(m => m.id === member.id);
  if (idx >= 0) members[idx] = member;
  else members.push(member);
  setLocalData(MEMBERS_KEY, members);
};

// --- Membership Tiers ---
const DEFAULT_TIERS: TierDefinition[] = [
    { id: 'Diamond', name: 'Diamond', color: '#22d3ee', order: 1, requirements: '10,000 Points', benefits: 'Access to private room\nFree food & drinks\nPriority waitlist' },
    { id: 'Platinum', name: 'Platinum', color: '#cbd5e1', order: 2, requirements: '5,000 Points', benefits: 'Free drinks\n2x Points multiplier' },
    { id: 'Gold', name: 'Gold', color: '#eab308', order: 3, requirements: '1,000 Points', benefits: '1.5x Points multiplier' },
    { id: 'Silver', name: 'Silver', color: '#9ca3af', order: 4, requirements: '500 Points', benefits: 'Standard earning rate' },
    { id: 'Bronze', name: 'Bronze', color: '#c2410c', order: 5, requirements: 'Sign up', benefits: 'Basic membership' },
];

export const getTierDefinitions = (): TierDefinition[] => {
    const data = getLocalData<TierDefinition[]>(TIERS_KEY);
    if (!data || data.length === 0) {
        setLocalData(TIERS_KEY, DEFAULT_TIERS);
        return DEFAULT_TIERS;
    }
    // Ensure they are sorted
    return data.sort((a, b) => a.order - b.order);
};

export const saveTierDefinition = (tier: TierDefinition): void => {
    const tiers = getTierDefinitions();
    const idx = tiers.findIndex(t => t.id === tier.id);
    if (idx >= 0) tiers[idx] = tier;
    else tiers.push(tier);
    setLocalData(TIERS_KEY, tiers);
};

export const saveAllTierDefinitions = (tiers: TierDefinition[]): void => {
    setLocalData(TIERS_KEY, tiers);
};

export const deleteTierDefinition = (id: string): void => {
    const tiers = getTierDefinitions().filter(t => t.id !== id);
    setLocalData(TIERS_KEY, tiers);
};

// --- Tables ---
export const getTables = (): PokerTable[] => {
  const data = getLocalData<PokerTable[]>(TABLES_KEY);
  if (!data || data.length === 0) {
      setLocalData(TABLES_KEY, SEED_TABLES);
      return SEED_TABLES;
  }
  return data;
};

export const saveTable = (table: PokerTable): void => {
  const tables = getTables();
  const idx = tables.findIndex(t => t.id === table.id);
  if (idx >= 0) tables[idx] = table;
  else tables.push(table);
  setLocalData(TABLES_KEY, tables);
  broadcast('TABLE_UPDATED', { tableId: table.id });
};

export const deleteTable = (id: string): void => {
  const tables = getTables().filter(t => t.id !== id);
  setLocalData(TABLES_KEY, tables);
  broadcast('TABLE_UPDATED', { tableId: id });
};

export const getNextTableName = (): string => {
  const tables = getTables();
  return `Table ${tables.length + 1}`;
};

// --- Structures ---
export const getTournamentStructures = (): TournamentStructure[] => {
  const data = getLocalData<TournamentStructure[]>(STRUCTURES_KEY);
  if (!data || data.length === 0) {
      setLocalData(STRUCTURES_KEY, SEED_STRUCTURES);
      return SEED_STRUCTURES;
  }
  return data;
};

export const saveTournamentStructure = (structure: TournamentStructure): void => {
  const structs = getTournamentStructures();
  const idx = structs.findIndex(s => s.id === structure.id);
  if (idx >= 0) structs[idx] = structure;
  else structs.push(structure);
  setLocalData(STRUCTURES_KEY, structs);
  broadcast('STRUCTURE_UPDATED', { structureId: structure.id });
};

export const deleteTournamentStructure = (id: string): void => {
  const structs = getTournamentStructures().filter(s => s.id !== id);
  setLocalData(STRUCTURES_KEY, structs);
  broadcast('STRUCTURE_UPDATED', { structureId: id });
};

// --- Payouts ---
export const getPayoutStructures = (): PayoutStructure[] => {
    let payouts = getLocalData<PayoutStructure[]>(PAYOUTS_KEY);
    if (!payouts || payouts.length === 0) {
        setLocalData(PAYOUTS_KEY, SEED_PAYOUTS);
        return SEED_PAYOUTS;
    }
    return payouts;
};

export const savePayoutStructure = (payout: PayoutStructure): void => {
  const payouts = getPayoutStructures();
  const idx = payouts.findIndex(p => p.id === payout.id);
  if (idx >= 0) payouts[idx] = payout;
  else payouts.push(payout);
  setLocalData(PAYOUTS_KEY, payouts);
};

export const deletePayoutStructure = (id: string): void => {
  const payouts = getPayoutStructures().filter(p => p.id !== id);
  setLocalData(PAYOUTS_KEY, payouts);
};

// --- Tournaments ---
export const getTournaments = (): Tournament[] => {
  const data = getLocalData<Tournament[]>(TOURNAMENTS_KEY);
  if (!data || data.length === 0) {
      setLocalData(TOURNAMENTS_KEY, SEED_TOURNAMENTS);
      return SEED_TOURNAMENTS;
  }
  return data;
};

export const saveTournament = (tournament: Tournament): void => {
  const tournaments = getTournaments();
  const idx = tournaments.findIndex(t => t.id === tournament.id);
  if (idx >= 0) tournaments[idx] = tournament;
  else tournaments.push(tournament);
  setLocalData(TOURNAMENTS_KEY, tournaments);
  if (!tournament.isTemplate) {
      broadcast('TOURNAMENT_UPDATED', { tournamentId: tournament.id });
  }
};

// --- Templates ---
export const getTournamentTemplates = (): Tournament[] => {
  const data = getLocalData<Tournament[]>(TEMPLATES_KEY);
  if (!data || data.length === 0) {
      setLocalData(TEMPLATES_KEY, SEED_TEMPLATES);
      return SEED_TEMPLATES;
  }
  return data;
};

export const saveTournamentTemplate = (template: Tournament): void => {
    const templates = getTournamentTemplates();
    const idx = templates.findIndex(t => t.id === template.id);
    const safeTemplate = { ...template, isTemplate: true };
    if (idx >= 0) templates[idx] = safeTemplate;
    else templates.push(safeTemplate);
    setLocalData(TEMPLATES_KEY, templates);
};

export const deleteTournamentTemplate = (id: string): void => {
    const templates = getTournamentTemplates().filter(t => t.id !== id);
    setLocalData(TEMPLATES_KEY, templates);
};

// --- Registrations ---
export const getAllRegistrations = (): TournamentRegistration[] => {
    const data = getLocalData<TournamentRegistration[]>(REGISTRATIONS_KEY);
    if (!data || data.length === 0) {
        if (getTournaments().length > 0) {
             setLocalData(REGISTRATIONS_KEY, SEED_REGISTRATIONS);
             return SEED_REGISTRATIONS;
        }
        return [];
    }
    return data;
};

export const getTournamentRegistrations = (tournamentId: string): TournamentRegistration[] => {
    return getAllRegistrations().filter(r => r.tournamentId === tournamentId);
};

export const addRegistration = (tournamentId: string, memberId: string): void => {
    const regs = getAllRegistrations();
    if (regs.some(r => r.tournamentId === tournamentId && r.memberId === memberId && r.status !== 'Cancelled')) {
        return;
    }
    
    const now = new Date().toISOString();
    const newReg: TournamentRegistration = {
        id: crypto.randomUUID(),
        tournamentId,
        memberId,
        status: 'Reserved',
        registeredAt: now,
        buyInCount: 0,
        transactions: []
    };
    regs.push(newReg);
    setLocalData(REGISTRATIONS_KEY, regs);
    broadcast('REGISTRATION_UPDATED', { tournamentId, registrationId: newReg.id });
};

export const deleteRegistration = (regId: string): void => {
    const regs = getAllRegistrations();
    const target = regs.find(r => r.id === regId);
    if (target) {
        const remaining = regs.filter(r => r.id !== regId);
        setLocalData(REGISTRATIONS_KEY, remaining);
        broadcast('REGISTRATION_UPDATED', { tournamentId: target.tournamentId, registrationId: regId });
    }
};

export const updateRegistrationStatus = (regId: string, status: RegistrationStatus): void => {
    const regs = getAllRegistrations();
    const reg = regs.find(r => r.id === regId);
    if (reg) {
        reg.status = status;
        setLocalData(REGISTRATIONS_KEY, regs);
        broadcast('REGISTRATION_UPDATED', { tournamentId: reg.tournamentId, registrationId: regId });
    }
};

export const updateRegistrationSeat = (regId: string, tableId: string, seatNumber: number): void => {
    const regs = getAllRegistrations();
    const reg = regs.find(r => r.id === regId);
    if (reg) {
        reg.tableId = tableId;
        reg.seatNumber = seatNumber;
        setLocalData(REGISTRATIONS_KEY, regs);
        broadcast('REGISTRATION_UPDATED', { tournamentId: reg.tournamentId, registrationId: regId });
    }
};

export const updateRegistrationChips = (regId: string, chips: number): void => {
    const regs = getAllRegistrations();
    const reg = regs.find(r => r.id === regId);
    if (reg) {
        reg.finalChipCount = chips;
        reg.isSigned = false;
        reg.signatureUrl = undefined;
        setLocalData(REGISTRATIONS_KEY, regs);
        broadcast('REGISTRATION_UPDATED', { tournamentId: reg.tournamentId, registrationId: regId });
    }
};

export const updateRegistrationSignature = (regId: string, isSigned: boolean, signatureUrl?: string): void => {
    const regs = getAllRegistrations();
    const reg = regs.find(r => r.id === regId);
    if (reg) {
        reg.isSigned = isSigned;
        if (signatureUrl) reg.signatureUrl = signatureUrl;
        setLocalData(REGISTRATIONS_KEY, regs);
        broadcast('REGISTRATION_UPDATED', { tournamentId: reg.tournamentId, registrationId: regId });
    }
};

export const updateRegistrationResult = (regId: string, rank: number, prize: number): void => {
    const regs = getAllRegistrations();
    const reg = regs.find(r => r.id === regId);
    if (reg) {
        reg.rank = rank;
        reg.prize = prize;
        setLocalData(REGISTRATIONS_KEY, regs);
        broadcast('REGISTRATION_UPDATED', { tournamentId: reg.tournamentId, registrationId: regId });
    }
};

export const updateRegistrationTransactions = (regId: string, transactions: TournamentTransaction[]): void => {
    const regs = getAllRegistrations();
    const reg = regs.find(r => r.id === regId);
    if (reg) {
        reg.transactions = transactions;
        setLocalData(REGISTRATIONS_KEY, regs);
        broadcast('REGISTRATION_UPDATED', { tournamentId: reg.tournamentId, registrationId: regId });
    }
};

export const updateRegistrationBuyIn = (regId: string, count: number): void => {
    const regs = getAllRegistrations();
    const reg = regs.find(r => r.id === regId);
    if (reg) {
        reg.buyInCount = count;
        setLocalData(REGISTRATIONS_KEY, regs);
        broadcast('REGISTRATION_UPDATED', { tournamentId: reg.tournamentId, registrationId: regId });
    }
};

// --- Financials ---
const getAllTransactions = (): FinancialTransaction[] => {
    return getLocalData<FinancialTransaction[]>(FINANCIALS_KEY) || [];
};

export const getMemberFinancials = (memberId: string): MemberFinancials => {
    const deposits = getLocalData<any[]>('rf_deposits') || [];
    const withdrawals = getLocalData<any[]>('rf_withdrawals') || [];
    const memberDeposits = deposits.filter(d => d.memberId === memberId);
    const memberWithdrawals = withdrawals.filter(w => w.memberId === memberId);
    const allRegs = getAllRegistrations().filter(r => r.memberId === memberId);
    
    let totalWinnings = 0;
    let totalBuyInsCost = 0;
    let totalDeposited = memberDeposits.reduce((sum, d) => sum + d.amount, 0);
    let totalWithdrawn = memberWithdrawals.reduce((sum, w) => sum + w.amount, 0);
    
    const history: FinancialTransaction[] = [];
    
    memberDeposits.forEach(d => {
        history.push({
            id: d.id,
            type: 'Deposit',
            amount: d.amount,
            date: d.date,
            description: `Deposit (${d.method})`,
            method: d.method
        });
    });

    memberWithdrawals.forEach(w => {
        history.push({
            id: w.id,
            type: 'Withdrawal',
            amount: w.amount,
            date: w.date,
            description: `Withdrawal (${w.method})`,
            method: w.method
        });
    });

    const tournaments = getTournaments();
    allRegs.forEach(r => {
        const t = tournaments.find(tour => tour.id === r.tournamentId);
        const tName = t ? t.name : 'Unknown Tournament';
        
        if (r.prize && r.prize > 0) {
            totalWinnings += r.prize;
            history.push({
                id: `win-${r.id}`,
                type: 'Win',
                amount: r.prize,
                date: t?.startDate || r.registeredAt,
                description: `Win: ${tName} (Rank ${r.rank})`
            });
        }
        
        if (r.transactions) {
            r.transactions.forEach(tx => {
                if (tx.depositPaid && tx.depositPaid > 0) {
                     totalBuyInsCost += tx.depositPaid;
                     history.push({
                        id: `buyin-${tx.id}`,
                        type: 'BuyIn',
                        amount: tx.depositPaid,
                        date: tx.timestamp,
                        description: `Buy-in: ${tName}`
                     });
                }
            });
        }
    });
    
    history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const balance = (totalDeposited + totalWinnings) - (totalWithdrawn + totalBuyInsCost);

    return {
        balance,
        totalWinnings,
        totalDeposited,
        totalBuyIns: totalBuyInsCost,
        totalWithdrawn,
        transactions: history
    };
};

export const addDeposit = (memberId: string, amount: number, method: PaymentMethod, note?: string): void => {
    const deposits = getLocalData<any[]>('rf_deposits') || [];
    deposits.push({
        id: crypto.randomUUID(),
        memberId,
        amount,
        method,
        note,
        date: new Date().toISOString()
    });
    setLocalData('rf_deposits', deposits);
};

export const addWithdrawal = (memberId: string, amount: number, method: PaymentMethod, note?: string): void => {
     const withdrawals = getLocalData<any[]>('rf_withdrawals') || [];
    withdrawals.push({
        id: crypto.randomUUID(),
        memberId,
        amount,
        method,
        note,
        date: new Date().toISOString()
    });
    setLocalData('rf_withdrawals', withdrawals);
};

// --- Team ---
export const getTeamMembers = (): TeamMember[] => {
    const team = getLocalData<TeamMember[]>(TEAM_KEY);
    if (!team || team.length === 0) {
        return [{
            id: 'owner',
            fullName: 'Club Owner',
            email: 'owner@club.com',
            role: 'Owner',
            status: 'Active',
            avatarUrl: ''
        }];
    }
    return team;
};

export const saveTeamMember = (member: TeamMember): void => {
    const team = getTeamMembers();
    const idx = team.findIndex(t => t.id === member.id);
    if (idx >= 0) team[idx] = member;
    else team.push(member);
    setLocalData(TEAM_KEY, team);
};

export const deleteTeamMember = (id: string): void => {
    const team = getTeamMembers().filter(t => t.id !== id);
    setLocalData(TEAM_KEY, team);
};

// --- Roles ---
export const getRoleConfigs = (): RoleDefinition[] => {
    const roles = getLocalData<RoleDefinition[]>(ROLES_KEY);
    if (!roles || roles.length === 0) {
        setLocalData(ROLES_KEY, SEED_ROLES);
        return SEED_ROLES;
    }
    return roles;
};

export const saveRoleConfig = (role: RoleDefinition): void => {
    const roles = getRoleConfigs();
    const idx = roles.findIndex(r => r.id === role.id);
    if (idx >= 0) {
        roles[idx] = role;
    } else {
        roles.push(role);
    }
    setLocalData(ROLES_KEY, roles);
};

export const deleteRoleConfig = (id: string): void => {
    const roles = getRoleConfigs().filter(r => r.id !== id);
    setLocalData(ROLES_KEY, roles);
};

// --- Clocks ---

export const getClockConfigs = (): ClockConfig[] => {
    const data = getLocalData<ClockConfig[]>(CLOCKS_KEY);
    if (!data) {
        setLocalData(CLOCKS_KEY, SEED_CLOCKS);
        return SEED_CLOCKS;
    }
    return data;
};

export const saveClockConfig = (config: ClockConfig): void => {
    const configs = getClockConfigs();
    const index = configs.findIndex(c => c.id === config.id);
    if (index >= 0) {
        configs[index] = config;
    } else {
        configs.push(config);
    }
    setLocalData(CLOCKS_KEY, configs);
    broadcast('CLOCK_CONFIG_UPDATED', { clockId: config.id });
};

export const deleteClockConfig = (id: string): void => {
    const configs = getClockConfigs().filter(c => c.id !== id);
    setLocalData(CLOCKS_KEY, configs);
    broadcast('CLOCK_CONFIG_UPDATED', { clockId: id });
};
