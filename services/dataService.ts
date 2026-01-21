
import { Member, MembershipTier, PokerTable, Tournament, PayoutModel, TournamentRegistration, RegistrationStatus, TournamentStructure, PayoutStructure, Withdrawal, Deposit, MemberFinancials, FinancialTransaction, PaymentMethod, StructureItem, TournamentTransaction, ClubSettings, ClubTheme, TeamMember, ClockConfig, ClockField } from '../types';

const MEMBERS_KEY = 'royal_flush_members';
const TABLES_KEY = 'royal_flush_tables';
const TOURNAMENTS_KEY = 'royal_flush_tournaments_v3';
const TOURNAMENT_TEMPLATES_KEY = 'royal_flush_tournament_templates';
const REGISTRATIONS_KEY = 'royal_flush_registrations';
const STRUCTURES_KEY = 'royal_flush_structures_v2';
const PAYOUTS_KEY = 'royal_flush_payouts';
const WITHDRAWALS_KEY = 'royal_flush_withdrawals';
const DEPOSITS_KEY = 'royal_flush_deposits';
const SETTINGS_KEY = 'royal_flush_settings';
const TEAM_KEY = 'royal_flush_team';
const CLOCKS_KEY = 'royal_flush_clocks';

// --- Helpers ---

const getLocalData = <T>(key: string): T | null => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
};

const setLocalData = <T>(key: string, data: T): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

// ... (Existing Member, Table, Structure code remains same, omitted for brevity but assumed present in real file. Since I have to output full file if I change it, I will paste EVERYTHING below to be safe) ...
// Actually, to save tokens and avoid errors, I will use the established pattern:

// --- Members ---

const SEED_MEMBERS: Member[] = [
  {
    id: '1',
    fullName: 'Daniel Negreanu',
    email: 'kidpoker@example.com',
    phone: '555-0101',
    age: 49,
    gender: 'Male',
    joinDate: '2023-01-15',
    tier: MembershipTier.DIAMOND,
    status: 'Activated',
    notes: 'Reads souls. Very chatty at the table.',
    avatarUrl: 'https://ui-avatars.com/api/?name=Daniel+Negreanu&background=ef4444&color=fff'
  },
  {
    id: '2',
    fullName: 'Phil Ivey',
    email: 'polarize@example.com',
    phone: '555-0102',
    age: 47,
    gender: 'Male',
    joinDate: '2023-02-20',
    tier: MembershipTier.PLATINUM,
    status: 'Activated',
    notes: 'Intimidating stare. Plays baccarat.',
    avatarUrl: 'https://ui-avatars.com/api/?name=Phil+Ivey&background=000&color=fff'
  },
  {
    id: '3',
    fullName: 'Doyle Brunson',
    email: 'texasdolly@example.com',
    phone: '555-0103',
    age: 89,
    gender: 'Male',
    joinDate: '2022-11-10',
    tier: MembershipTier.DIAMOND,
    status: 'Activated',
    notes: 'The Godfather of Poker. Respect the legend.',
    avatarUrl: 'https://ui-avatars.com/api/?name=Doyle+Brunson&background=f59e0b&color=fff'
  },
  {
    id: '4',
    fullName: 'Vanessa Selbst',
    email: 'v.selbst@example.com',
    phone: '555-0104',
    age: 39,
    gender: 'Female',
    joinDate: '2023-03-05',
    tier: MembershipTier.GOLD,
    status: 'Activated',
    notes: 'Aggressive style. Law school graduate.',
    avatarUrl: 'https://ui-avatars.com/api/?name=Vanessa+Selbst&background=3b82f6&color=fff'
  },
  {
    id: '5',
    fullName: 'Tom Dwan',
    email: 'durrrr@example.com',
    phone: '555-0105',
    age: 37,
    gender: 'Male',
    joinDate: '2023-04-12',
    tier: MembershipTier.PLATINUM,
    status: 'Activated',
    notes: 'Loose aggressive. Loves high stakes cash games.',
    avatarUrl: 'https://ui-avatars.com/api/?name=Tom+Dwan&background=8b5cf6&color=fff'
  },
  {
    id: '6',
    fullName: 'Fedor Holz',
    email: 'crownupguy@example.com',
    phone: '555-0106',
    age: 30,
    gender: 'Male',
    joinDate: '2023-06-20',
    tier: MembershipTier.GOLD,
    status: 'Activated',
    notes: 'German wizard. Retired but still crushing.',
    avatarUrl: 'https://ui-avatars.com/api/?name=Fedor+Holz&background=10b981&color=fff'
  },
  {
    id: '7',
    fullName: 'Justin Bonomo',
    email: 'zeejustin@example.com',
    phone: '555-0107',
    age: 38,
    gender: 'Male',
    joinDate: '2023-01-30',
    tier: MembershipTier.SILVER,
    status: 'Activated',
    notes: 'All-time money list contender.',
    avatarUrl: 'https://ui-avatars.com/api/?name=Justin+Bonomo&background=ec4899&color=fff'
  }
];

export const getMembers = (): Member[] => {
  const members = getLocalData<Member[]>(MEMBERS_KEY);
  if (!members) {
    setLocalData(MEMBERS_KEY, SEED_MEMBERS);
    return SEED_MEMBERS;
  }
  return members;
};

export const saveMember = (member: Member): void => {
  const members = getMembers();
  const index = members.findIndex(m => m.id === member.id);
  if (index >= 0) {
    members[index] = member;
  } else {
    members.push(member);
  }
  setLocalData(MEMBERS_KEY, members);
};

// --- Tables ---

const SEED_TABLES: PokerTable[] = [
  { id: '1', name: 'Table 1', capacity: 9, status: 'Active', notes: 'Main feature table with RFID' },
  { id: '2', name: 'Table 2', capacity: 9, status: 'Active', notes: 'Standard play' },
  { id: '3', name: 'Table 3', capacity: 9, status: 'Active', notes: 'Standard play' },
  { id: '4', name: 'Table 4 (VIP)', capacity: 6, status: 'Active', notes: 'High stakes area, secluded' },
  { id: '5', name: 'Table 5 (Stream)', capacity: 9, status: 'Inactive', notes: 'Live stream setup' },
];

export const getTables = (): PokerTable[] => {
  const tables = getLocalData<PokerTable[]>(TABLES_KEY);
  if (!tables) {
    setLocalData(TABLES_KEY, SEED_TABLES);
    return SEED_TABLES;
  }
  return tables;
};

export const saveTable = (table: PokerTable): void => {
  const tables = getTables();
  const index = tables.findIndex(t => t.id === table.id);
  if (index >= 0) {
    tables[index] = table;
  } else {
    tables.push(table);
  }
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

const SEED_STRUCTURES: TournamentStructure[] = [
    {
        id: 'struct_1',
        name: 'Standard Deepstack',
        startingChips: 20000,
        rebuyLimit: 1,
        lastRebuyLevel: 6,
        items: [
            { type: 'Level', level: 1, duration: 20, smallBlind: 100, bigBlind: 200, ante: 0 },
            { type: 'Level', level: 2, duration: 20, smallBlind: 200, bigBlind: 400, ante: 0 },
            { type: 'Level', level: 3, duration: 20, smallBlind: 300, bigBlind: 600, ante: 600 },
            { type: 'Break', duration: 10 },
            { type: 'Level', level: 4, duration: 20, smallBlind: 400, bigBlind: 800, ante: 800 },
            { type: 'Level', level: 5, duration: 20, smallBlind: 500, bigBlind: 1000, ante: 1000 },
            { type: 'Level', level: 6, duration: 20, smallBlind: 600, bigBlind: 1200, ante: 1200 },
            { type: 'Break', duration: 10 },
            { type: 'Level', level: 7, duration: 20, smallBlind: 800, bigBlind: 1600, ante: 1600 },
            { type: 'Level', level: 8, duration: 20, smallBlind: 1000, bigBlind: 2000, ante: 2000 },
        ]
    },
    {
        id: 'struct_2',
        name: 'Turbo Freezeout',
        startingChips: 15000,
        rebuyLimit: 0,
        lastRebuyLevel: 0,
        items: [
            { type: 'Level', level: 1, duration: 10, smallBlind: 100, bigBlind: 200, ante: 200 },
            { type: 'Level', level: 2, duration: 10, smallBlind: 200, bigBlind: 400, ante: 400 },
            { type: 'Level', level: 3, duration: 10, smallBlind: 300, bigBlind: 600, ante: 600 },
            { type: 'Level', level: 4, duration: 10, smallBlind: 500, bigBlind: 1000, ante: 1000 },
            { type: 'Break', duration: 5 },
            { type: 'Level', level: 5, duration: 10, smallBlind: 800, bigBlind: 1600, ante: 1600 },
            { type: 'Level', level: 6, duration: 10, smallBlind: 1000, bigBlind: 2000, ante: 2000 },
            { type: 'Level', level: 7, duration: 10, smallBlind: 1500, bigBlind: 3000, ante: 3000 },
            { type: 'Level', level: 8, duration: 10, smallBlind: 2000, bigBlind: 4000, ante: 4000 },
        ]
    },
    {
        id: 'struct_3',
        name: 'Hyper Turbo',
        startingChips: 10000,
        rebuyLimit: 99,
        lastRebuyLevel: 10,
        items: [
            { type: 'Level', level: 1, duration: 5, smallBlind: 100, bigBlind: 200, ante: 200 },
            { type: 'Level', level: 2, duration: 5, smallBlind: 200, bigBlind: 400, ante: 400 },
            { type: 'Level', level: 3, duration: 5, smallBlind: 400, bigBlind: 800, ante: 800 },
            { type: 'Level', level: 4, duration: 5, smallBlind: 600, bigBlind: 1200, ante: 1200 },
            { type: 'Level', level: 5, duration: 5, smallBlind: 1000, bigBlind: 2000, ante: 2000 },
            { type: 'Level', level: 6, duration: 5, smallBlind: 1500, bigBlind: 3000, ante: 3000 },
        ]
    }
];

export const getTournamentStructures = (): TournamentStructure[] => {
    const data = getLocalData<TournamentStructure[]>(STRUCTURES_KEY);
    if (!data) {
        setLocalData(STRUCTURES_KEY, SEED_STRUCTURES);
        return SEED_STRUCTURES;
    }
    return data;
};

export const saveTournamentStructure = (struct: TournamentStructure): void => {
    const list = getTournamentStructures();
    const idx = list.findIndex(s => s.id === struct.id);
    if (idx >= 0) list[idx] = struct;
    else list.push(struct);
    setLocalData(STRUCTURES_KEY, list);
};

export const deleteTournamentStructure = (id: string): void => {
    const list = getTournamentStructures().filter(s => s.id !== id);
    setLocalData(STRUCTURES_KEY, list);
};

// --- Payouts ---

const SEED_PAYOUTS: PayoutStructure[] = [
    { 
        id: 'algo_1', 
        name: 'Standard ICM', 
        type: 'Algorithm', 
        description: 'Independent Chip Model. Calculates equity based on stack sizes relative to total chips.',
        isSystemDefault: true 
    },
    { 
        id: 'algo_2', 
        name: 'Chip EV', 
        type: 'Algorithm', 
        description: 'Direct equity calculation based purely on chip count percentage.',
        isSystemDefault: true 
    },
    {
        id: 'matrix_1',
        name: 'Standard Top 15%',
        type: 'Custom Matrix',
        description: 'Pays out top 15% of the field. Good for standard tourneys.',
        rules: [
            { minPlayers: 2, maxPlayers: 4, placesPaid: 1, percentages: [100] },
            { minPlayers: 5, maxPlayers: 8, placesPaid: 2, percentages: [65, 35] },
            { minPlayers: 9, maxPlayers: 16, placesPaid: 3, percentages: [50, 30, 20] },
            { minPlayers: 17, maxPlayers: 24, placesPaid: 4, percentages: [45, 25, 18, 12] },
            { minPlayers: 25, maxPlayers: 999, placesPaid: 5, percentages: [40, 25, 15, 12, 8] },
        ]
    },
    {
        id: 'matrix_2',
        name: 'Top 3 Heavy',
        type: 'Custom Matrix',
        description: 'Concentrated payout for the podium finishers.',
        rules: [
            { minPlayers: 2, maxPlayers: 100, placesPaid: 3, percentages: [50, 30, 20] },
        ]
    },
    {
        id: 'matrix_3',
        name: 'Winner Takes All',
        type: 'Custom Matrix',
        description: 'Only first place gets paid.',
        rules: [
            { minPlayers: 2, maxPlayers: 999, placesPaid: 1, percentages: [100] },
        ]
    }
];

export const getPayoutStructures = (): PayoutStructure[] => {
    const data = getLocalData<PayoutStructure[]>(PAYOUTS_KEY);
    if (!data) {
        setLocalData(PAYOUTS_KEY, SEED_PAYOUTS);
        return SEED_PAYOUTS;
    }
    return data;
};

export const savePayoutStructure = (payout: PayoutStructure): void => {
    const list = getPayoutStructures();
    const idx = list.findIndex(p => p.id === payout.id);
    if (idx >= 0) list[idx] = payout;
    else list.push(payout);
    setLocalData(PAYOUTS_KEY, list);
};

export const deletePayoutStructure = (id: string): void => {
    const list = getPayoutStructures().filter(p => p.id !== id);
    setLocalData(PAYOUTS_KEY, list);
};

// --- Tournaments ---

const SEED_TOURNAMENTS: Tournament[] = [
    {
        id: 'tourney_1',
        name: 'Daily Deepstack',
        startDate: new Date().toISOString().split('T')[0],
        startTime: '19:00',
        estimatedDurationMinutes: 240,
        buyIn: 150,
        fee: 20,
        maxPlayers: 54,
        status: 'Registration',
        structureId: 'struct_1',
        payoutStructureId: 'matrix_1',
        startingChips: 20000,
        startingBlinds: '100/200',
        blindLevelMinutes: 20,
        blindIncreasePercent: 0,
        rebuyLimit: 1,
        lastRebuyLevel: 6,
        payoutModel: PayoutModel.FIXED,
        tableIds: ['1', '2', '3']
    },
    {
        id: 'tourney_2',
        name: 'Turbo Tuesday',
        startDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
        startTime: '20:00',
        estimatedDurationMinutes: 180,
        buyIn: 80,
        fee: 10,
        maxPlayers: 36,
        status: 'Scheduled',
        structureId: 'struct_2',
        payoutStructureId: 'matrix_2',
        startingChips: 15000,
        startingBlinds: '100/200',
        blindLevelMinutes: 10,
        blindIncreasePercent: 0,
        rebuyLimit: 0,
        lastRebuyLevel: 0,
        payoutModel: PayoutModel.FIXED
    },
    {
        id: 'tourney_3',
        name: 'High Roller',
        startDate: new Date(Date.now() + 172800000).toISOString().split('T')[0], // Day after tomorrow
        startTime: '18:00',
        estimatedDurationMinutes: 360,
        buyIn: 1000,
        fee: 100,
        maxPlayers: 18,
        status: 'Scheduled',
        structureId: 'struct_1',
        payoutStructureId: 'matrix_1',
        startingChips: 50000,
        startingBlinds: '200/400',
        blindLevelMinutes: 30,
        blindIncreasePercent: 0,
        rebuyLimit: 1,
        lastRebuyLevel: 8,
        payoutModel: PayoutModel.FIXED,
        tableIds: ['4']
    },
    {
        id: 'tourney_4',
        name: 'Midnight Hyper',
        startDate: new Date().toISOString().split('T')[0],
        startTime: '23:59',
        estimatedDurationMinutes: 90,
        buyIn: 50,
        fee: 5,
        maxPlayers: 90,
        status: 'Scheduled',
        structureId: 'struct_3',
        payoutStructureId: 'matrix_3', // Winner takes all
        startingChips: 10000,
        startingBlinds: '100/200',
        blindLevelMinutes: 5,
        blindIncreasePercent: 0,
        rebuyLimit: 99,
        lastRebuyLevel: 10,
        payoutModel: PayoutModel.FIXED
    }
];

export const getTournaments = (): Tournament[] => {
  const data = getLocalData<Tournament[]>(TOURNAMENTS_KEY);
  if (!data) {
    setLocalData(TOURNAMENTS_KEY, SEED_TOURNAMENTS);
    return SEED_TOURNAMENTS;
  }
  return data;
};

export const saveTournament = (tournament: Tournament): void => {
  const tournaments = getTournaments();
  const index = tournaments.findIndex(t => t.id === tournament.id);
  if (index >= 0) {
    tournaments[index] = tournament;
  } else {
    tournaments.push(tournament);
  }
  setLocalData(TOURNAMENTS_KEY, tournaments);
};

export const deleteTournament = (id: string): void => {
    const list = getTournaments().filter(t => t.id !== id);
    setLocalData(TOURNAMENTS_KEY, list);
};

// --- Tournament Templates ---

export const getTournamentTemplates = (): Tournament[] => {
    return getLocalData<Tournament[]>(TOURNAMENT_TEMPLATES_KEY) || [];
};

export const saveTournamentTemplate = (template: Tournament): void => {
    const templates = getTournamentTemplates();
    const index = templates.findIndex(t => t.id === template.id);
    const newTemplate = { ...template, isTemplate: true };
    
    // Ensure template doesn't have status or dates
    delete newTemplate.startDate;
    delete newTemplate.startTime;
    delete newTemplate.status;
    
    if (index >= 0) {
        templates[index] = newTemplate;
    } else {
        templates.push(newTemplate);
    }
    setLocalData(TOURNAMENT_TEMPLATES_KEY, templates);
};

export const deleteTournamentTemplate = (id: string): void => {
    const templates = getTournamentTemplates().filter(t => t.id !== id);
    setLocalData(TOURNAMENT_TEMPLATES_KEY, templates);
};


// --- Tournament Registrations ---

export const getTournamentRegistrations = (tournamentId: string): TournamentRegistration[] => {
  const allRegs = getLocalData<TournamentRegistration[]>(REGISTRATIONS_KEY) || [];
  return allRegs.filter(r => r.tournamentId === tournamentId);
};

export const getAllRegistrations = (): TournamentRegistration[] => {
    return getLocalData<TournamentRegistration[]>(REGISTRATIONS_KEY) || [];
};

export const addRegistration = (tournamentId: string, memberId: string): void => {
  const allRegs = getLocalData<TournamentRegistration[]>(REGISTRATIONS_KEY) || [];
  
  // Prevent duplicates
  if (allRegs.some(r => r.tournamentId === tournamentId && r.memberId === memberId)) {
    return;
  }

  const newReg: TournamentRegistration = {
    id: crypto.randomUUID(),
    tournamentId,
    memberId,
    status: 'Registered',
    registeredAt: new Date().toISOString(),
    buyInCount: 0,
    transactions: [] // Initialize empty
  };
  
  allRegs.push(newReg);
  setLocalData(REGISTRATIONS_KEY, allRegs);
};

export const updateRegistrationStatus = (regId: string, status: RegistrationStatus): void => {
  const allRegs = getLocalData<TournamentRegistration[]>(REGISTRATIONS_KEY) || [];
  const index = allRegs.findIndex(r => r.id === regId);
  if (index >= 0) {
    allRegs[index].status = status;

    // --- Auto-Seat Assignment Logic ---
    if (status === 'Joined' && (!allRegs[index].tableId || !allRegs[index].seatNumber)) {
        const tournaments = getTournaments();
        const tournament = tournaments.find(t => t.id === allRegs[index].tournamentId);
        
        if (tournament && tournament.tableIds && tournament.tableIds.length > 0) {
            const tables = getTables();
            const tournamentTables = tables.filter(t => tournament.tableIds?.includes(t.id));
            
            // Get all 'Joined' players in this tournament
            const activeRegs = allRegs.filter(r => r.tournamentId === tournament.id && r.status === 'Joined');
            
            // Try to find the first available seat
            for (const table of tournamentTables) {
                const occupiedSeats = new Set(
                    activeRegs
                    .filter(r => r.tableId === table.id && r.seatNumber)
                    .map(r => r.seatNumber!)
                );
                
                for (let i = 1; i <= table.capacity; i++) {
                    if (!occupiedSeats.has(i)) {
                        allRegs[index].tableId = table.id;
                        allRegs[index].seatNumber = i;
                        setLocalData(REGISTRATIONS_KEY, allRegs);
                        return; // Seat assigned, exit
                    }
                }
            }
        }
    }
    
    setLocalData(REGISTRATIONS_KEY, allRegs);
  }
};

export const updateRegistrationSeat = (regId: string, tableId: string, seatNumber: number): void => {
    const allRegs = getLocalData<TournamentRegistration[]>(REGISTRATIONS_KEY) || [];
    const index = allRegs.findIndex(r => r.id === regId);
    if (index >= 0) {
        allRegs[index].tableId = tableId;
        allRegs[index].seatNumber = seatNumber;
        setLocalData(REGISTRATIONS_KEY, allRegs);
    }
};

export const updateRegistrationBuyIn = (regId: string, count: number): void => {
  const allRegs = getLocalData<TournamentRegistration[]>(REGISTRATIONS_KEY) || [];
  const index = allRegs.findIndex(r => r.id === regId);
  if (index >= 0) {
    const reg = allRegs[index];
    const currentTxCount = reg.transactions?.length || 0;
    const diff = count - currentTxCount;

    let newTransactions = reg.transactions ? [...reg.transactions] : [];

    if (diff > 0) {
        // Add new transactions
        for(let i=0; i<diff; i++) {
            newTransactions.push({
                id: crypto.randomUUID(),
                type: (currentTxCount + i) === 0 ? 'BuyIn' : 'Rebuy',
                timestamp: new Date().toISOString(),
                rebuyDiscount: 0,
                membershipDiscount: 0,
                voucherDiscount: 0,
                campaignDiscount: 0,
                depositPaid: 0,
                isPaid: false
            });
        }
    } else if (diff < 0) {
        // Remove transactions from the end
        newTransactions = newTransactions.slice(0, count);
    }

    allRegs[index].buyInCount = count;
    allRegs[index].transactions = newTransactions;
    setLocalData(REGISTRATIONS_KEY, allRegs);
  }
};

export const updateRegistrationTransactions = (regId: string, transactions: TournamentTransaction[]): void => {
    const allRegs = getLocalData<TournamentRegistration[]>(REGISTRATIONS_KEY) || [];
    const index = allRegs.findIndex(r => r.id === regId);
    
    if (index >= 0) {
        const oldReg = allRegs[index];
        const memberId = oldReg.memberId;
        
        // Calculate previous total deposit usage
        const oldTotalDeposit = oldReg.transactions?.reduce((sum, tx) => sum + (tx.depositPaid || 0), 0) || 0;
        
        // Calculate new total deposit usage
        const newTotalDeposit = transactions.reduce((sum, tx) => sum + (tx.depositPaid || 0), 0);
        
        const diff = newTotalDeposit - oldTotalDeposit;
        
        if (diff !== 0) {
            const financials = getMemberFinancials(memberId);
            
            const tx: FinancialTransaction = {
                id: crypto.randomUUID(),
                type: 'BuyIn', // 'BuyIn' reduces balance in saveMemberFinancials logic
                amount: diff, // Positive diff means we deduct more. Negative diff means we deduct less (refund).
                date: new Date().toISOString(),
                description: `Tournament Entry/Rebuy Adjustment (${oldReg.tournamentId.substring(0,8)})`,
                referenceId: oldReg.tournamentId
            };
            
            // Add to history
            financials.transactions.unshift(tx);
            // Save updates balance automatically
            saveMemberFinancials(memberId, financials);
        }

        allRegs[index].transactions = transactions;
        
        // Also update buyInCount just in case
        allRegs[index].buyInCount = transactions.length;

        setLocalData(REGISTRATIONS_KEY, allRegs);
    }
};

export const updateRegistrationFinancials = (regId: string, data: Partial<TournamentRegistration>): void => {
    const allRegs = getLocalData<TournamentRegistration[]>(REGISTRATIONS_KEY) || [];
    const index = allRegs.findIndex(r => r.id === regId);
    if (index >= 0) {
        allRegs[index] = { ...allRegs[index], ...data };
        setLocalData(REGISTRATIONS_KEY, allRegs);
    }
};

export const updateRegistrationChips = (regId: string, chips: number): void => {
    const allRegs = getLocalData<TournamentRegistration[]>(REGISTRATIONS_KEY) || [];
    const index = allRegs.findIndex(r => r.id === regId);
    if (index >= 0) {
      allRegs[index].finalChipCount = chips;
      setLocalData(REGISTRATIONS_KEY, allRegs);
    }
};

export const updateRegistrationResult = (regId: string, rank: number, prize: number): void => {
    const allRegs = getLocalData<TournamentRegistration[]>(REGISTRATIONS_KEY) || [];
    const index = allRegs.findIndex(r => r.id === regId);
    if (index >= 0) {
      allRegs[index].rank = rank;
      allRegs[index].prize = prize;
      setLocalData(REGISTRATIONS_KEY, allRegs);
      
      // Also Create Financial Transaction for Win
      if (prize > 0) {
          const reg = allRegs[index];
          // Check if transaction exists to avoid duplicates (idempotency key based on tourney)
          const financials = getMemberFinancials(reg.memberId);
          if (!financials.transactions.some(t => t.referenceId === reg.tournamentId && t.type === 'Win')) {
              const tx: FinancialTransaction = {
                  id: crypto.randomUUID(),
                  type: 'Win',
                  amount: prize,
                  date: new Date().toISOString(),
                  description: `Tournament Win (Rank ${rank})`,
                  referenceId: reg.tournamentId
              };
              financials.transactions.push(tx);
              saveMemberFinancials(reg.memberId, financials);
          }
      }
    }
};

export const deleteRegistration = (regId: string): void => {
    const allRegs = getLocalData<TournamentRegistration[]>(REGISTRATIONS_KEY) || [];
    const filtered = allRegs.filter(r => r.id !== regId);
    setLocalData(REGISTRATIONS_KEY, filtered);
};

// --- Member Financials ---

const getFinancialsKey = (memberId: string) => `financials_${memberId}`;

export const getMemberFinancials = (memberId: string): MemberFinancials => {
    const data = getLocalData<MemberFinancials>(getFinancialsKey(memberId));
    if (data) return data;

    return {
        balance: 0,
        totalWinnings: 0,
        totalDeposited: 0,
        totalBuyIns: 0,
        totalWithdrawn: 0,
        transactions: []
    };
};

export const saveMemberFinancials = (memberId: string, data: MemberFinancials): void => {
    // Re-calculate totals from transactions to ensure consistency
    let balance = 0;
    let winnings = 0;
    let deposited = 0;
    let buyins = 0;
    let withdrawn = 0;

    data.transactions.forEach(tx => {
        if (tx.type === 'Win') {
            balance += tx.amount;
            winnings += tx.amount;
        } else if (tx.type === 'Deposit') {
            balance += tx.amount;
            deposited += tx.amount;
        } else if (tx.type === 'BuyIn') {
            balance -= tx.amount;
            buyins += tx.amount;
        } else if (tx.type === 'Withdrawal') {
            balance -= tx.amount;
            withdrawn += tx.amount;
        }
    });

    const updated = {
        ...data,
        balance,
        totalWinnings: winnings,
        totalDeposited: deposited,
        totalBuyIns: buyins,
        totalWithdrawn: withdrawn
    };

    setLocalData(getFinancialsKey(memberId), updated);
};

export const addWithdrawal = (memberId: string, amount: number, method: PaymentMethod, note?: string): void => {
    const financials = getMemberFinancials(memberId);
    const tx: FinancialTransaction = {
        id: crypto.randomUUID(),
        type: 'Withdrawal',
        amount,
        date: new Date().toISOString(),
        description: `Withdrawal (${method})`,
        method,
        referenceId: undefined // Could link to a specific withdrawal record ID
    };
    financials.transactions.unshift(tx); // Newest first
    saveMemberFinancials(memberId, financials);
};

export const addDeposit = (memberId: string, amount: number, method: PaymentMethod, note?: string): void => {
    const financials = getMemberFinancials(memberId);
    const tx: FinancialTransaction = {
        id: crypto.randomUUID(),
        type: 'Deposit',
        amount,
        date: new Date().toISOString(),
        description: `Deposit (${method})`,
        method,
    };
    financials.transactions.unshift(tx);
    saveMemberFinancials(memberId, financials);
};

// --- Club Settings & Team ---

const DEFAULT_THEME: ClubTheme = {
    primaryColor: '#06C167',
    backgroundColor: '#000000',
    cardColor: '#171717',
    textColor: '#FFFFFF',
    secondaryTextColor: '#A3A3A3',
    borderColor: '#333333'
};

const DEFAULT_SETTINGS: ClubSettings = {
    name: 'Royal Flush Club',
    address: '123 Poker Blvd, Las Vegas, NV',
    contactEmail: 'manager@royalflush.com',
    contactPhone: '+1 (555) 123-4567',
    logoUrl: '',
    theme: DEFAULT_THEME
};

const SEED_TEAM: TeamMember[] = [
    { id: '1', fullName: 'Tony G', email: 'tony@royalflush.com', role: 'Owner', status: 'Active', lastActive: new Date().toISOString(), avatarUrl: 'https://ui-avatars.com/api/?name=Tony+G&background=06C167&color=fff' },
    { id: '2', fullName: 'Mike Matusow', email: 'mike@royalflush.com', role: 'Operator', status: 'Active', lastActive: new Date(Date.now() - 86400000).toISOString(), avatarUrl: 'https://ui-avatars.com/api/?name=Mike+M&background=333&color=fff' }
];

export const getClubSettings = (): ClubSettings => {
    const data = getLocalData<ClubSettings>(SETTINGS_KEY);
    // Backward compatibility for themes without new fields
    const settings = data || DEFAULT_SETTINGS;
    if (settings.theme && !settings.theme.textColor) {
        settings.theme = { ...DEFAULT_THEME, ...settings.theme };
    }
    return settings;
};

export const saveClubSettings = (settings: ClubSettings): void => {
    setLocalData(SETTINGS_KEY, settings);
};

export const getTeamMembers = (): TeamMember[] => {
    const data = getLocalData<TeamMember[]>(TEAM_KEY);
    if (!data) {
        setLocalData(TEAM_KEY, SEED_TEAM);
        return SEED_TEAM;
    }
    return data;
};

export const saveTeamMember = (member: TeamMember): void => {
    const members = getTeamMembers();
    const idx = members.findIndex(m => m.id === member.id);
    if (idx >= 0) members[idx] = member;
    else members.push(member);
    setLocalData(TEAM_KEY, members);
};

export const deleteTeamMember = (id: string): void => {
    const members = getTeamMembers().filter(m => m.id !== id);
    setLocalData(TEAM_KEY, members);
};

// --- Clock Configs ---

const SEED_CLOCKS: ClockConfig[] = [
    {
        id: 'default_clock',
        name: 'Standard Tournament Clock',
        backgroundColor: '#4A1C16', // Reddish brown from screenshot
        fontColor: '#FFFFFF',
        fields: [
            { id: '1', type: 'tournament_name', label: 'Tournament Name', x: 50, y: 10, fontSize: 48, fontWeight: 'bold', color: '#FFFFFF', align: 'center', showLabel: false },
            { id: '2', type: 'timer', label: 'Timer', x: 50, y: 40, fontSize: 180, fontWeight: 'bold', color: '#FFFFFF', align: 'center', showLabel: false },
            { id: '3', type: 'blind_level', label: 'Blinds', x: 30, y: 70, fontSize: 60, fontWeight: 'bold', color: '#FFFFFF', align: 'left', showLabel: true, labelText: 'BLINDS:' },
            { id: '4', type: 'ante', label: 'Ante', x: 70, y: 70, fontSize: 60, fontWeight: 'bold', color: '#FFFFFF', align: 'right', showLabel: true, labelText: 'ANTE:' },
            { id: '5', type: 'players_count', label: 'Players', x: 85, y: 40, fontSize: 32, fontWeight: 'bold', color: '#FFFFFF', align: 'center', showLabel: true, labelText: 'PLAYERS' },
            { id: '6', type: 'avg_stack', label: 'Avg Stack', x: 85, y: 25, fontSize: 32, fontWeight: 'bold', color: '#FFFFFF', align: 'center', showLabel: true, labelText: 'AVG STACK' },
            { id: '7', type: 'next_break', label: 'Next Break', x: 85, y: 10, fontSize: 32, fontWeight: 'bold', color: '#FFFFFF', align: 'center', showLabel: true, labelText: 'NEXT BREAK' },
        ],
        isDefault: true
    }
];

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
