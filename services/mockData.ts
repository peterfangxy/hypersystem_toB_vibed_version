
import {
  Member,
  PokerTable,
  Tournament,
  TournamentStructure,
  PayoutStructure,
  ClockConfig,
  MembershipTier,
  PayoutModel,
  RoleDefinition
} from '../types';

export const SEED_ROLES: RoleDefinition[] = [
    {
        id: 'role_admin',
        name: 'Admin',
        description: 'Full access to all system modules and configurations.',
        isSystem: true,
        permissions: {
            dashboard: 'edit',
            members: 'edit',
            tables: 'edit',
            tournaments: 'edit',
            structures: 'edit',
            clocks: 'edit',
            settings: 'edit'
        }
    },
    {
        id: 'role_operator',
        name: 'Operator',
        description: 'Can run tournaments and manage tables, but restricted from system settings.',
        isSystem: false,
        permissions: {
            dashboard: 'view',
            members: 'view', // Can see members but not edit profiles
            tables: 'edit', // Can open/close tables
            tournaments: 'edit', // Can run tournaments
            structures: 'view', // Can see but not change structures
            clocks: 'edit', // Can run clocks
            settings: 'no_access'
        }
    },
    {
        id: 'role_viewer',
        name: 'Viewer',
        description: 'Read-only access for staff to view live status.',
        isSystem: false,
        permissions: {
            dashboard: 'view',
            members: 'no_access',
            tables: 'view',
            tournaments: 'view',
            structures: 'view',
            clocks: 'view',
            settings: 'no_access'
        }
    }
];

export const SEED_MEMBERS: Member[] = [
  { id: 'm1', fullName: 'Daniel Negreanu', nickname: 'Kid Poker', club_id: 'RFC-1001', email: 'dnegs@gg.com', phone: '555-0101', age: 48, gender: 'Male', joinDate: '2023-01-15', tier: MembershipTier.DIAMOND, status: 'Activated', avatarUrl: 'https://ui-avatars.com/api/?name=Daniel+Negreanu&background=random' },
  { id: 'm2', fullName: 'Phil Ivey', nickname: 'The Tiger Woods of Poker', club_id: 'RFC-1002', email: 'ivey@poker.com', phone: '555-0102', age: 46, gender: 'Male', joinDate: '2023-01-20', tier: MembershipTier.PLATINUM, status: 'Activated', avatarUrl: 'https://ui-avatars.com/api/?name=Phil+Ivey&background=random' },
  { id: 'm3', fullName: 'Vanessa Selbst', nickname: 'V. Selbst', club_id: 'RFC-1003', email: 'v.selbst@law.com', phone: '555-0103', age: 38, gender: 'Female', joinDate: '2023-02-10', tier: MembershipTier.GOLD, status: 'Activated', avatarUrl: 'https://ui-avatars.com/api/?name=Vanessa+Selbst&background=random' },
  { id: 'm4', fullName: 'Tom Dwan', nickname: 'durrrr', club_id: 'RFC-1004', email: 'durrrr@online.com', phone: '555-0104', age: 36, gender: 'Male', joinDate: '2023-03-05', tier: MembershipTier.SILVER, status: 'Activated', avatarUrl: 'https://ui-avatars.com/api/?name=Tom+Dwan&background=random' },
  { id: 'm5', fullName: 'Jennifer Tilly', nickname: 'The Unabombshell', club_id: 'RFC-1005', email: 'jtilly@hollywood.com', phone: '555-0105', age: 64, gender: 'Female', joinDate: '2023-04-12', tier: MembershipTier.GOLD, status: 'Activated', avatarUrl: 'https://ui-avatars.com/api/?name=Jennifer+Tilly&background=random' },
  { id: 'm6', fullName: 'Doyle Brunson', nickname: 'Texas Dolly', club_id: 'RFC-0001', email: 'doyle@legend.com', phone: '555-0106', age: 89, gender: 'Male', joinDate: '2022-12-01', tier: MembershipTier.DIAMOND, status: 'Activated', avatarUrl: 'https://ui-avatars.com/api/?name=Doyle+Brunson&background=random' },
  { id: 'm7', fullName: 'Liv Boeree', nickname: 'Iron Maiden', club_id: 'RFC-1007', email: 'liv@science.com', phone: '555-0107', age: 38, gender: 'Female', joinDate: '2023-05-20', tier: MembershipTier.SILVER, status: 'Activated', avatarUrl: 'https://ui-avatars.com/api/?name=Liv+Boeree&background=random' },
  { id: 'm8', fullName: 'Erik Seidel', nickname: 'Seiborg', club_id: 'RFC-1008', email: 'seiborg@quiet.com', phone: '555-0108', age: 63, gender: 'Male', joinDate: '2023-01-05', tier: MembershipTier.PLATINUM, status: 'Activated', avatarUrl: 'https://ui-avatars.com/api/?name=Erik+Seidel&background=random' },
];

export const SEED_TABLES: PokerTable[] = [
  { id: 't1', name: 'Table 1 (Feature)', capacity: 9, status: 'Active', notes: 'RFID Equipped' },
  { id: 't2', name: 'Table 2', capacity: 9, status: 'Active' },
  { id: 't3', name: 'Table 3', capacity: 9, status: 'Active' },
  { id: 't4', name: 'Table 4', capacity: 9, status: 'Active' },
  { id: 't5', name: 'Table 5 (High Roller)', capacity: 6, status: 'Inactive', notes: 'Private Room' },
];

export const SEED_STRUCTURES: TournamentStructure[] = [
    {
        id: 'struct_turbo',
        name: 'Turbo Daily (BB Ante)',
        startingChips: 20000,
        rebuyLimit: 3,
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
    },
    {
        id: 'struct_test_1min',
        name: 'TEST: Hyper Turbo (1min)',
        startingChips: 5000,
        rebuyLimit: 1,
        lastRebuyLevel: 3,
        items: [
            { type: 'Level', duration: 1, smallBlind: 100, bigBlind: 200, ante: 0, level: 1 },
            { type: 'Level', duration: 1, smallBlind: 200, bigBlind: 400, ante: 0, level: 2 },
            { type: 'Level', duration: 1, smallBlind: 300, bigBlind: 600, ante: 600, level: 3 },
            { type: 'Level', duration: 1, smallBlind: 400, bigBlind: 800, ante: 800, level: 4 },
            { type: 'Break', duration: 1 },
            { type: 'Level', duration: 1, smallBlind: 500, bigBlind: 1000, ante: 1000, level: 5 },
            { type: 'Level', duration: 1, smallBlind: 600, bigBlind: 1200, ante: 1200, level: 6 },
            { type: 'Level', duration: 1, smallBlind: 800, bigBlind: 1600, ante: 1600, level: 7 },
            { type: 'Level', duration: 1, smallBlind: 1000, bigBlind: 2000, ante: 2000, level: 8 },
            { type: 'Break', duration: 1 },
            { type: 'Level', duration: 1, smallBlind: 1500, bigBlind: 3000, ante: 3000, level: 9 },
            { type: 'Level', duration: 1, smallBlind: 2000, bigBlind: 4000, ante: 4000, level: 10 },
            { type: 'Level', duration: 1, smallBlind: 3000, bigBlind: 6000, ante: 6000, level: 11 },
            { type: 'Level', duration: 1, smallBlind: 4000, bigBlind: 8000, ante: 8000, level: 12 },
            { type: 'Break', duration: 1 },
            { type: 'Level', duration: 1, smallBlind: 5000, bigBlind: 10000, ante: 10000, level: 13 },
            { type: 'Level', duration: 1, smallBlind: 6000, bigBlind: 12000, ante: 12000, level: 14 },
            { type: 'Level', duration: 1, smallBlind: 8000, bigBlind: 16000, ante: 16000, level: 15 },
            { type: 'Level', duration: 1, smallBlind: 10000, bigBlind: 20000, ante: 20000, level: 16 },
            { type: 'Break', duration: 1 },
            { type: 'Level', duration: 1, smallBlind: 15000, bigBlind: 30000, ante: 30000, level: 17 },
            { type: 'Level', duration: 1, smallBlind: 20000, bigBlind: 40000, ante: 40000, level: 18 },
            { type: 'Level', duration: 1, smallBlind: 25000, bigBlind: 50000, ante: 50000, level: 19 },
            { type: 'Level', duration: 1, smallBlind: 30000, bigBlind: 60000, ante: 60000, level: 20 },
        ]
    },
    {
        id: 'struct_test_breaks',
        name: 'TEST: 1min Level + Break',
        startingChips: 10000,
        rebuyLimit: 0,
        lastRebuyLevel: 0,
        items: [
            { type: 'Level', duration: 1, smallBlind: 100, bigBlind: 200, ante: 0, level: 1 },
            { type: 'Break', duration: 1 },
            { type: 'Level', duration: 1, smallBlind: 200, bigBlind: 400, ante: 0, level: 2 },
            { type: 'Break', duration: 1 },
            { type: 'Level', duration: 1, smallBlind: 300, bigBlind: 600, ante: 600, level: 3 },
            { type: 'Break', duration: 1 },
            { type: 'Level', duration: 1, smallBlind: 400, bigBlind: 800, ante: 800, level: 4 },
            { type: 'Break', duration: 1 },
            { type: 'Level', duration: 1, smallBlind: 500, bigBlind: 1000, ante: 1000, level: 5 },
            { type: 'Break', duration: 1 },
            { type: 'Level', duration: 1, smallBlind: 600, bigBlind: 1200, ante: 1200, level: 6 },
            { type: 'Break', duration: 1 },
            { type: 'Level', duration: 1, smallBlind: 800, bigBlind: 1600, ante: 1600, level: 7 },
            { type: 'Break', duration: 1 },
            { type: 'Level', duration: 1, smallBlind: 1000, bigBlind: 2000, ante: 2000, level: 8 },
            { type: 'Break', duration: 1 },
            { type: 'Level', duration: 1, smallBlind: 1500, bigBlind: 3000, ante: 3000, level: 9 },
            { type: 'Break', duration: 1 },
            { type: 'Level', duration: 1, smallBlind: 2000, bigBlind: 4000, ante: 4000, level: 10 },
            { type: 'Break', duration: 1 },
            { type: 'Level', duration: 1, smallBlind: 3000, bigBlind: 6000, ante: 6000, level: 11 },
            { type: 'Break', duration: 1 },
            { type: 'Level', duration: 1, smallBlind: 4000, bigBlind: 8000, ante: 8000, level: 12 },
            { type: 'Break', duration: 1 },
            { type: 'Level', duration: 1, smallBlind: 5000, bigBlind: 10000, ante: 10000, level: 13 },
            { type: 'Break', duration: 1 },
            { type: 'Level', duration: 1, smallBlind: 6000, bigBlind: 12000, ante: 12000, level: 14 },
            { type: 'Break', duration: 1 },
            { type: 'Level', duration: 1, smallBlind: 8000, bigBlind: 16000, ante: 16000, level: 15 },
            { type: 'Break', duration: 1 },
            { type: 'Level', duration: 1, smallBlind: 10000, bigBlind: 20000, ante: 20000, level: 16 },
            { type: 'Break', duration: 1 },
            { type: 'Level', duration: 1, smallBlind: 15000, bigBlind: 30000, ante: 30000, level: 17 },
            { type: 'Break', duration: 1 },
            { type: 'Level', duration: 1, smallBlind: 20000, bigBlind: 40000, ante: 40000, level: 18 },
            { type: 'Break', duration: 1 },
            { type: 'Level', duration: 1, smallBlind: 25000, bigBlind: 50000, ante: 50000, level: 19 },
            { type: 'Break', duration: 1 },
            { type: 'Level', duration: 1, smallBlind: 30000, bigBlind: 60000, ante: 60000, level: 20 },
        ]
    },
    {
        id: 'struct_pko',
        name: 'Progressive KO',
        startingChips: 25000,
        rebuyLimit: 1,
        lastRebuyLevel: 8,
        items: [
            { type: 'Level', duration: 20, smallBlind: 100, bigBlind: 200, ante: 200, level: 1 },
            { type: 'Level', duration: 20, smallBlind: 150, bigBlind: 300, ante: 300, level: 2 },
            { type: 'Level', duration: 20, smallBlind: 200, bigBlind: 400, ante: 400, level: 3 },
            { type: 'Break', duration: 15 },
            { type: 'Level', duration: 20, smallBlind: 300, bigBlind: 600, ante: 600, level: 4 },
        ]
    }
];

export const SEED_PAYOUTS: PayoutStructure[] = [
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
    },
    {
        id: 'custom_3',
        name: 'Winner Takes All',
        type: 'Custom Matrix',
        description: 'Only the winner gets paid. High risk, high reward.',
        rules: [
            { minPlayers: 2, maxPlayers: 1000, placesPaid: 1, percentages: [100] }
        ]
    },
    {
        id: 'custom_4',
        name: 'Broad & Flat (20%)',
        type: 'Custom Matrix',
        description: 'Pays out 20% of the field with a flatter curve.',
        rules: [
            { minPlayers: 5, maxPlayers: 10, placesPaid: 2, percentages: [60, 40] },
            { minPlayers: 11, maxPlayers: 20, placesPaid: 4, percentages: [40, 25, 20, 15] },
            { minPlayers: 21, maxPlayers: 50, placesPaid: 10, percentages: [20, 15, 12, 10, 8, 7, 6, 6, 5, 5] }
        ]
    }
];

export const SEED_TOURNAMENTS: Tournament[] = [
    {
        id: 'evt-2023-0841',
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
        id: 'evt-2023-0842',
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
        id: 'evt-2023-0845',
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
    },
    {
        id: 'evt-test-9901',
        name: 'Test: 1-Min Blinds',
        startDate: new Date().toISOString().split('T')[0],
        startTime: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false}), // Starts now
        estimatedDurationMinutes: 60,
        buyIn: 0,
        fee: 0,
        maxPlayers: 10,
        startingChips: 5000,
        startingBlinds: '100/200',
        blindLevelMinutes: 1,
        blindIncreasePercent: 50,
        rebuyLimit: 0,
        lastRebuyLevel: 0,
        payoutModel: PayoutModel.FIXED,
        structureId: 'struct_test_1min',
        payoutStructureId: 'custom_3',
        clockConfigId: 'default_clock',
        status: 'In Progress',
        description: 'Rapid fire test tournament. 1 min levels.',
        tableIds: ['t1']
    },
    {
        id: 'evt-test-9902',
        name: 'Test: Frequent Breaks',
        startDate: new Date().toISOString().split('T')[0],
        startTime: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false}), // Starts now
        estimatedDurationMinutes: 60,
        buyIn: 0,
        fee: 0,
        maxPlayers: 10,
        startingChips: 10000,
        startingBlinds: '100/200',
        blindLevelMinutes: 1,
        blindIncreasePercent: 0,
        rebuyLimit: 0,
        lastRebuyLevel: 0,
        payoutModel: PayoutModel.FIXED,
        structureId: 'struct_test_breaks',
        payoutStructureId: 'custom_3',
        clockConfigId: 'default_clock',
        status: 'In Progress',
        description: 'Test tournament with breaks after every level.',
        tableIds: ['t2']
    },
    {
        id: 'evt-2023-0900',
        name: 'High Roller Championship',
        startDate: new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0],
        startTime: '16:00',
        estimatedDurationMinutes: 600,
        buyIn: 2500,
        fee: 200,
        maxPlayers: 64,
        startingChips: 100000,
        startingBlinds: '500/1000',
        blindLevelMinutes: 60,
        blindIncreasePercent: 10,
        rebuyLimit: 0,
        lastRebuyLevel: 8,
        payoutModel: PayoutModel.ICM,
        structureId: 'struct_deep',
        payoutStructureId: 'algo_icm',
        clockConfigId: 'clock_light',
        status: 'Scheduled',
        description: 'The big one. 100k starting stack, 60min levels.',
        tableIds: ['t1', 't2', 't3', 't4', 't5']
    }
];

export const SEED_TEMPLATES: Tournament[] = [
    {
        id: 'temp_daily',
        name: 'Daily $50 Rebuy',
        isTemplate: true,
        estimatedDurationMinutes: 180,
        buyIn: 50,
        fee: 10,
        maxPlayers: 50,
        startingChips: 10000,
        startingBlinds: '100/200',
        blindLevelMinutes: 15,
        blindIncreasePercent: 20,
        rebuyLimit: 1,
        lastRebuyLevel: 6,
        payoutModel: PayoutModel.FIXED,
        structureId: 'struct_turbo',
        payoutStructureId: 'algo_1',
        clockConfigId: 'default_clock',
        description: 'Standard weekday tournament structure.'
    },
    {
        id: 'temp_sat',
        name: 'Monthly Satellite',
        isTemplate: true,
        estimatedDurationMinutes: 240,
        buyIn: 120,
        fee: 20,
        maxPlayers: 100,
        startingChips: 15000,
        startingBlinds: '100/200',
        blindLevelMinutes: 20,
        blindIncreasePercent: 20,
        rebuyLimit: 0,
        lastRebuyLevel: 6,
        payoutModel: PayoutModel.FIXED,
        structureId: 'struct_deep',
        payoutStructureId: 'custom_4',
        clockConfigId: 'default_clock',
        description: 'Satellite to the monthly main event. Top 20% win seats.'
    }
];

export const SEED_CLOCKS: ClockConfig[] = [
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
    },
    {
        id: 'clock_light',
        name: 'Light Theme (Modern)',
        description: 'Clean white background with dark text. Good for brightly lit rooms.',
        backgroundColor: '#F5F5F5',
        fontColor: '#111111',
        isDefault: false,
        fields: [
            { id: 't1', type: 'timer', label: 'Timer', x: 50, y: 50, fontSize: 160, fontWeight: 'bold', color: '#111111', align: 'center', showLabel: false },
            { id: 'h1', type: 'tournament_name', label: 'Title', x: 50, y: 12, fontSize: 60, fontWeight: 'bold', color: '#333333', align: 'center', showLabel: false },
            { id: 'l1', type: 'blind_level', label: 'Blinds', x: 20, y: 80, fontSize: 50, fontWeight: 'bold', color: '#111111', align: 'center', showLabel: true, labelText: 'BLINDS' },
            { id: 'l2', type: 'ante', label: 'Ante', x: 35, y: 80, fontSize: 50, fontWeight: 'bold', color: '#666666', align: 'center', showLabel: true, labelText: 'ANTE' },
            { id: 'r1', type: 'next_blinds', label: 'Next', x: 80, y: 80, fontSize: 40, fontWeight: 'bold', color: '#999999', align: 'center', showLabel: true, labelText: 'NEXT LEVEL' },
            { id: 'shape1', type: 'shape_rect', label: 'Bar', x: 50, y: 80, width: 1800, height: 180, color: '#FFFFFF', align: 'center', showLabel: false, borderWidth: 1, borderColor: '#CCCCCC', fontSize: 1, fontWeight: 'normal' },
        ]
    }
];
