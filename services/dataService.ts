
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
  MembershipTier,
  PayoutModel
} from '../types';

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

// Helpers
function getLocalData<T>(key: string): T | null {
  const str = localStorage.getItem(key);
  return str ? JSON.parse(str) : null;
}

function setLocalData<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// --- SEED DATA ---

const SEED_MEMBERS: Member[] = [
  { id: 'm1', fullName: 'Daniel Negreanu', email: 'dnegs@gg.com', phone: '555-0101', age: 48, gender: 'Male', joinDate: '2023-01-15', tier: MembershipTier.DIAMOND, status: 'Activated', avatarUrl: 'https://ui-avatars.com/api/?name=Daniel+Negreanu&background=random' },
  { id: 'm2', fullName: 'Phil Ivey', email: 'ivey@poker.com', phone: '555-0102', age: 46, gender: 'Male', joinDate: '2023-01-20', tier: MembershipTier.PLATINUM, status: 'Activated', avatarUrl: 'https://ui-avatars.com/api/?name=Phil+Ivey&background=random' },
  { id: 'm3', fullName: 'Vanessa Selbst', email: 'v.selbst@law.com', phone: '555-0103', age: 38, gender: 'Female', joinDate: '2023-02-10', tier: MembershipTier.GOLD, status: 'Activated', avatarUrl: 'https://ui-avatars.com/api/?name=Vanessa+Selbst&background=random' },
  { id: 'm4', fullName: 'Tom Dwan', email: 'durrrr@online.com', phone: '555-0104', age: 36, gender: 'Male', joinDate: '2023-03-05', tier: MembershipTier.SILVER, status: 'Activated', avatarUrl: 'https://ui-avatars.com/api/?name=Tom+Dwan&background=random' },
  { id: 'm5', fullName: 'Jennifer Tilly', email: 'jtilly@hollywood.com', phone: '555-0105', age: 64, gender: 'Female', joinDate: '2023-04-12', tier: MembershipTier.GOLD, status: 'Activated', avatarUrl: 'https://ui-avatars.com/api/?name=Jennifer+Tilly&background=random' },
  { id: 'm6', fullName: 'Doyle Brunson', email: 'doyle@legend.com', phone: '555-0106', age: 89, gender: 'Male', joinDate: '2022-12-01', tier: MembershipTier.DIAMOND, status: 'Activated', avatarUrl: 'https://ui-avatars.com/api/?name=Doyle+Brunson&background=random' },
  { id: 'm7', fullName: 'Liv Boeree', email: 'liv@science.com', phone: '555-0107', age: 38, gender: 'Female', joinDate: '2023-05-20', tier: MembershipTier.SILVER, status: 'Activated', avatarUrl: 'https://ui-avatars.com/api/?name=Liv+Boeree&background=random' },
  { id: 'm8', fullName: 'Erik Seidel', email: 'seiborg@quiet.com', phone: '555-0108', age: 63, gender: 'Male', joinDate: '2023-01-05', tier: MembershipTier.PLATINUM, status: 'Activated', avatarUrl: 'https://ui-avatars.com/api/?name=Erik+Seidel&background=random' },
];

const SEED_TABLES: PokerTable[] = [
  { id: 't1', name: 'Table 1 (Feature)', capacity: 9, status: 'Active', notes: 'RFID Equipped' },
  { id: 't2', name: 'Table 2', capacity: 9, status: 'Active' },
  { id: 't3', name: 'Table 3', capacity: 9, status: 'Active' },
  { id: 't4', name: 'Table 4', capacity: 9, status: 'Active' },
  { id: 't5', name: 'Table 5 (High Roller)', capacity: 6, status: 'Inactive', notes: 'Private Room' },
];

const SEED_STRUCTURES: TournamentStructure[] = [
    {
        id: 'struct_turbo',
        name: 'Turbo Daily (BB Ante)',
        startingChips: 20000,
        rebuyLimit: 1,
        lastRebuyLevel: 6,
        items: [
            { type: 'Level', duration: 15, smallBlind: 100, bigBlind: 200, ante: 200, level: 1 },
            { type: 'Level', duration: 15, smallBlind: 200, bigBlind: 400, ante: 400, level: 2 },
            { type: 'Level', duration: 15, smallBlind: 300, bigBlind: 600, ante: 600, level: 3 },
            { type: 'Level', duration: 15, smallBlind: 400, bigBlind: 800, ante: 800, level: 4 },
            { type: 'Level', duration: 15, smallBlind: 600, bigBlind: 1200, ante: 1200, level: 5 },
            { type: 'Break', duration: 10 },
            { type: 'Level', duration: 15, smallBlind: 1000, bigBlind: 2000, ante: 2000, level: 6 },
            { type: 'Level', duration: 15, smallBlind: 1500, bigBlind: 3000, ante: 3000, level: 7 },
            { type: 'Level', duration: 15, smallBlind: 2000, bigBlind: 4000, ante: 4000, level: 8 },
            { type: 'Level', duration: 15, smallBlind: 3000, bigBlind: 6000, ante: 6000, level: 9 },
        ]
    },
    {
        id: 'struct_deep',
        name: 'Deepstack Weekend',
        startingChips: 50000,
        rebuyLimit: 0,
        lastRebuyLevel: 8,
        items: [
            { type: 'Level', duration: 40, smallBlind: 50, bigBlind: 100, ante: 0, level: 1 },
            { type: 'Level', duration: 40, smallBlind: 75, bigBlind: 150, ante: 0, level: 2 },
            { type: 'Level', duration: 40, smallBlind: 100, bigBlind: 200, ante: 0, level: 3 },
            { type: 'Level', duration: 40, smallBlind: 150, bigBlind: 300, ante: 0, level: 4 },
            { type: 'Break', duration: 15 },
            { type: 'Level', duration: 40, smallBlind: 200, bigBlind: 400, ante: 400, level: 5 },
            { type: 'Level', duration: 40, smallBlind: 250, bigBlind: 500, ante: 500, level: 6 },
            { type: 'Level', duration: 40, smallBlind: 300, bigBlind: 600, ante: 600, level: 7 },
            { type: 'Level', duration: 40, smallBlind: 400, bigBlind: 800, ante: 800, level: 8 },
        ]
    }
];

const SEED_PAYOUTS: PayoutStructure[] = [
    { id: 'algo_1', name: 'Standard Fixed (15%)', type: 'Algorithm', description: 'Top 15% of field paid. Standard steepness.', isSystemDefault: true },
    { id: 'algo_icm', name: 'ICM Calculator', type: 'Algorithm', description: 'Calculates equity based on stack sizes.', isSystemDefault: true },
    { 
        id: 'custom_1', 
        name: 'Final Table Only', 
        type: 'Custom Matrix', 
        description: 'Pays top 3 for small fields, top 9 for large fields.',
        rules: [
            { minPlayers: 2, maxPlayers: 8, placesPaid: 2, percentages: [70, 30] },
            { minPlayers: 9, maxPlayers: 20, placesPaid: 3, percentages: [50, 30, 20] },
            { minPlayers: 21, maxPlayers: 100, placesPaid: 9, percentages: [30, 20, 14, 10, 8, 6, 5, 4, 3] },
        ]
    },
    {
        id: 'custom_2',
        name: 'Top 3 Heavy',
        type: 'Custom Matrix', 
        description: 'Aggressive payout structure rewarding the podium finishers.',
        rules: [
            { minPlayers: 2, maxPlayers: 10, placesPaid: 2, percentages: [75, 25] },
            { minPlayers: 11, maxPlayers: 30, placesPaid: 3, percentages: [60, 30, 10] },
            { minPlayers: 31, maxPlayers: 100, placesPaid: 5, percentages: [50, 25, 15, 7, 3] },
        ]
    }
];

const SEED_TOURNAMENTS: Tournament[] = [
    {
        id: 'tour_1',
        name: 'Friday Night Turbo',
        startDate: new Date().toISOString().split('T')[0],
        startTime: '19:00',
        estimatedDurationMinutes: 240,
        buyIn: 100,
        fee: 20,
        maxPlayers: 45,
        startingChips: 20000,
        startingBlinds: '100/200',
        blindLevelMinutes: 15,
        blindIncreasePercent: 20,
        rebuyLimit: 1,
        lastRebuyLevel: 6,
        payoutModel: PayoutModel.FIXED,
        structureId: 'struct_turbo',
        payoutStructureId: 'algo_1',
        clockConfigId: 'default_clock',
        status: 'Scheduled',
        description: 'Fast paced action with BB Ante from level 1.',
        tableIds: ['t1', 't2', 't3']
    },
    {
        id: 'tour_2',
        name: 'Sunday Deepstack',
        startDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], // 2 days from now
        startTime: '14:00',
        estimatedDurationMinutes: 480,
        buyIn: 250,
        fee: 30,
        maxPlayers: 100,
        startingChips: 50000,
        startingBlinds: '50/100',
        blindLevelMinutes: 40,
        blindIncreasePercent: 15,
        rebuyLimit: 0,
        lastRebuyLevel: 8,
        payoutModel: PayoutModel.FIXED,
        structureId: 'struct_deep',
        payoutStructureId: 'algo_icm',
        clockConfigId: 'default_clock',
        status: 'Scheduled',
        description: 'Deep structure with 40min levels. Great value.',
        tableIds: ['t1', 't2', 't3', 't4']
    },
    {
        id: 'tour_3',
        name: 'Wednesday Rebuy Madness',
        startDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0], // 5 days from now
        startTime: '19:30',
        estimatedDurationMinutes: 180,
        buyIn: 50,
        fee: 10,
        maxPlayers: 30,
        startingChips: 10000,
        startingBlinds: '100/200',
        blindLevelMinutes: 10,
        blindIncreasePercent: 25,
        rebuyLimit: 99, // Unlimited
        lastRebuyLevel: 6,
        payoutModel: PayoutModel.FIXED,
        structureId: 'struct_turbo',
        payoutStructureId: 'custom_1',
        clockConfigId: 'default_clock',
        status: 'Scheduled',
        description: 'Unlimited rebuys for the first hour.',
        tableIds: ['t2', 't3']
    }
];

const SEED_CLOCKS: ClockConfig[] = [
    {
        id: 'default_clock',
        name: 'Standard Tournament Clock',
        description: 'High visibility layout designed for 1080p screens. Includes blinds, ante, and average stack tracking.',
        backgroundColor: '#050505',
        fontColor: '#FFFFFF',
        isDefault: true,
        fields: [
            { id: 't1', type: 'timer', label: 'Timer', x: 50, y: 42, fontSize: 40, fontWeight: 'bold', color: '#06C167', align: 'center', showLabel: false },
            
            { id: 'h1', type: 'tournament_name', label: 'Title', x: 50, y: 10, fontSize: 40, fontWeight: 'bold', color: '#FFFFFF', align: 'center', showLabel: false },
            { id: 'div1', type: 'line', label: 'Divider', x: 50, y: 18, width: 900, height: 2, color: '#333333', align: 'center', showLabel: false, fontSize: 40, fontWeight: 'normal' },

            { id: 'l1', type: 'blind_level', label: 'Blinds', x: 20, y: 40, fontSize: 40, fontWeight: 'bold', color: '#FFFFFF', align: 'center', showLabel: true, labelText: 'CURRENT BLINDS' },
            { id: 'l2', type: 'ante', label: 'Ante', x: 20, y: 65, fontSize: 40, fontWeight: 'bold', color: '#A3A3A3', align: 'center', showLabel: true, labelText: 'ANTE' },

            { id: 'r1', type: 'next_blinds', label: 'Next Blinds', x: 80, y: 40, fontSize: 40, fontWeight: 'bold', color: '#666666', align: 'center', showLabel: true, labelText: 'NEXT BLINDS' },
            { id: 'r2', type: 'next_ante', label: 'Next Ante', x: 80, y: 65, fontSize: 40, fontWeight: 'bold', color: '#666666', align: 'center', showLabel: true, labelText: 'NEXT ANTE' },

            { id: 'b1', type: 'players_count', label: 'Players', x: 20, y: 88, fontSize: 40, fontWeight: 'bold', color: '#FFFFFF', align: 'center', showLabel: true, labelText: 'ENTRIES' },
            { id: 'b2', type: 'avg_stack', label: 'Avg', x: 50, y: 88, fontSize: 40, fontWeight: 'bold', color: '#FFFFFF', align: 'center', showLabel: true, labelText: 'AVG STACK' },
            { id: 'b3', type: 'next_break', label: 'Break', x: 80, y: 88, fontSize: 40, fontWeight: 'bold', color: '#FFFFFF', align: 'center', showLabel: true, labelText: 'NEXT BREAK' },
        ]
    }
];

// --- Club Settings ---
export const getClubSettings = (): ClubSettings => {
  const defaults: ClubSettings = {
    name: 'Royal Flush Club',
    address: '123 Poker Blvd, Las Vegas, NV',
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
};

export const deleteTable = (id: string): void => {
  const tables = getTables().filter(t => t.id !== id);
  setLocalData(TABLES_KEY, tables);
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
};

export const deleteTournamentStructure = (id: string): void => {
  const structs = getTournamentStructures().filter(s => s.id !== id);
  setLocalData(STRUCTURES_KEY, structs);
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
};

// --- Templates ---
export const getTournamentTemplates = (): Tournament[] => {
  return getLocalData<Tournament[]>(TEMPLATES_KEY) || [];
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
    return getLocalData<TournamentRegistration[]>(REGISTRATIONS_KEY) || [];
};

export const getTournamentRegistrations = (tournamentId: string): TournamentRegistration[] => {
    return getAllRegistrations().filter(r => r.tournamentId === tournamentId);
};

export const addRegistration = (tournamentId: string, memberId: string): void => {
    const regs = getAllRegistrations();
    if (regs.some(r => r.tournamentId === tournamentId && r.memberId === memberId && r.status !== 'Cancelled')) {
        return;
    }
    
    const newReg: TournamentRegistration = {
        id: crypto.randomUUID(),
        tournamentId,
        memberId,
        status: 'Registered',
        registeredAt: new Date().toISOString(),
        buyInCount: 0 
    };
    regs.push(newReg);
    setLocalData(REGISTRATIONS_KEY, regs);
};

export const deleteRegistration = (regId: string): void => {
    const regs = getAllRegistrations().filter(r => r.id !== regId);
    setLocalData(REGISTRATIONS_KEY, regs);
};

export const updateRegistrationStatus = (regId: string, status: RegistrationStatus): void => {
    const regs = getAllRegistrations();
    const reg = regs.find(r => r.id === regId);
    if (reg) {
        reg.status = status;
        if (status === 'Joined' && reg.buyInCount === 0) {
            reg.buyInCount = 1;
        }
        setLocalData(REGISTRATIONS_KEY, regs);
    }
};

export const updateRegistrationSeat = (regId: string, tableId: string, seatNumber: number): void => {
    const regs = getAllRegistrations();
    const reg = regs.find(r => r.id === regId);
    if (reg) {
        reg.tableId = tableId;
        reg.seatNumber = seatNumber;
        setLocalData(REGISTRATIONS_KEY, regs);
    }
};

export const updateRegistrationChips = (regId: string, chips: number): void => {
    const regs = getAllRegistrations();
    const reg = regs.find(r => r.id === regId);
    if (reg) {
        reg.finalChipCount = chips;
        setLocalData(REGISTRATIONS_KEY, regs);
    }
};

export const updateRegistrationResult = (regId: string, rank: number, prize: number): void => {
    const regs = getAllRegistrations();
    const reg = regs.find(r => r.id === regId);
    if (reg) {
        reg.rank = rank;
        reg.prize = prize;
        if (prize > 0) {
             // Implicitly handled in financials
        }
        setLocalData(REGISTRATIONS_KEY, regs);
    }
};

export const updateRegistrationTransactions = (regId: string, transactions: TournamentTransaction[]): void => {
    const regs = getAllRegistrations();
    const reg = regs.find(r => r.id === regId);
    if (reg) {
        reg.transactions = transactions;
        setLocalData(REGISTRATIONS_KEY, regs);
    }
};

export const updateRegistrationBuyIn = (regId: string, count: number): void => {
    const regs = getAllRegistrations();
    const reg = regs.find(r => r.id === regId);
    if (reg) {
        reg.buyInCount = count;
        setLocalData(REGISTRATIONS_KEY, regs);
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
};

export const deleteClockConfig = (id: string): void => {
    const configs = getClockConfigs().filter(c => c.id !== id);
    setLocalData(CLOCKS_KEY, configs);
};
