
import { PokerTable, Tournament, TournamentStructure, PayoutStructure, PayoutModel } from '../../types';

const getLocalDate = (daysToAdd: number = 0): string => {
    const d = new Date();
    d.setDate(d.getDate() + daysToAdd);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

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
            { type: 'Break', duration: 1 },
            { type: 'Level', duration: 1, smallBlind: 20000, bigBlind: 40000, ante: 40000, level: 18 },
            { type: 'Break', duration: 1 },
            { type: 'Level', duration: 1, smallBlind: 25000, bigBlind: 50000, ante: 50000, level: 19 },
            { type: 'Break', duration: 1 },
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
    { 
        id: 'algo_1', 
        name: 'Standard Fixed (15%)', 
        description: 'Pays top 15% of the field. System Default.', 
        isSystemDefault: true,
        allocations: [
            {
                id: 'alloc_1',
                name: 'Main Prize Pool',
                percent: 100,
                type: 'Custom',
                color: '#06C167',
                rules: [
                    { minPlayers: 2, maxPlayers: 8, placesPaid: 2, percentages: [65, 35] },
                    { minPlayers: 9, maxPlayers: 20, placesPaid: 3, percentages: [50, 30, 20] },
                    { minPlayers: 21, maxPlayers: 999, placesPaid: 15, percentages: [30, 20, 14, 10, 8, 6, 5, 4, 3] }, // Simplified
                ]
            }
        ]
    },
    { 
        id: 'algo_icm', 
        name: 'ICM (Winner Takes All)', 
        description: 'Calculates equity based on stack sizes.', 
        isSystemDefault: true,
        allocations: [
            {
                id: 'alloc_icm_main',
                name: 'Main Prize Pool',
                percent: 100,
                type: 'ICM',
                color: '#a855f7',
                rules: [
                    { minPlayers: 2, maxPlayers: 9, placesPaid: 2, percentages: [100, 0] }
                ]
            }
        ]
    },
    {
        id: 'custom_split_1',
        name: '95% ICM + 5% High Hand',
        description: 'Splits pool: 95% distributed by ICM, 5% reserved for High Hand (Winner Take All)',
        allocations: [
            {
                id: 'alloc_split_1_main',
                name: 'Main Pool (ICM)',
                percent: 95,
                type: 'ICM',
                color: '#3b82f6',
                rules: [
                    { minPlayers: 2, maxPlayers: 99, placesPaid: 1, percentages: [100] }
                ]
            },
            {
                id: 'alloc_split_1_hh',
                name: 'High Hand Promo',
                percent: 5,
                type: 'Custom',
                color: '#eab308',
                rules: [
                    { minPlayers: 2, maxPlayers: 1000, placesPaid: 3, percentages: [50, 30, 20] }
                ]
            }
        ]
    }
];

// --- TOURNAMENT GENERATION LOGIC ---

const TEMPLATES = [
    { name: 'Daily Turbo', buyIn: 50, fee: 10, struct: 'struct_turbo', payout: 'algo_1', chips: 20000, duration: 240 },
    { name: 'Deepstack Weekend', buyIn: 150, fee: 25, struct: 'struct_deep', payout: 'algo_icm', chips: 50000, duration: 480 },
    { name: 'Bounty Hunter', buyIn: 80, fee: 20, struct: 'struct_turbo', payout: 'algo_1', chips: 15000, duration: 240 },
    { name: 'PLO Pot Limit', buyIn: 100, fee: 15, struct: 'struct_deep', payout: 'algo_1', chips: 25000, duration: 360 },
    { name: 'Freezeout', buyIn: 200, fee: 30, struct: 'struct_deep', payout: 'algo_1', chips: 30000, duration: 420 },
];

const generateMockTournaments = (): Tournament[] => {
    const list: Tournament[] = [];
    const completedCount = 20;
    
    // 1. Generate 20 Completed Tournaments (Spread over last 14 days)
    for (let i = 0; i < completedCount; i++) {
        // Distribute i from 0 to 19 over 0 to 14 days
        const daysAgo = Math.floor((i / completedCount) * 14);
        const template = TEMPLATES[i % TEMPLATES.length];
        
        list.push({
            id: `hist-evt-${i}`,
            name: template.name,
            startDate: getLocalDate(-daysAgo),
            startTime: i % 2 === 0 ? '19:00' : '14:00',
            estimatedDurationMinutes: template.duration,
            buyIn: template.buyIn,
            fee: template.fee,
            maxPlayers: 50 + (i * 2),
            startingChips: template.chips,
            startingBlinds: '100/200',
            blindLevelMinutes: 20,
            blindIncreasePercent: 20,
            rebuyLimit: template.name.includes('Freezeout') ? 0 : 1,
            lastRebuyLevel: 6,
            payoutModel: PayoutModel.FIXED,
            structureId: template.struct,
            payoutStructureId: template.payout,
            clockConfigId: 'default_clock',
            status: 'Completed',
            description: `Historical event data for ${template.name}`,
            tableIds: ['t1', 't2', 't3']
        });
    }

    // 2. Generate 3 Scheduled Tournaments (Future)
    const futureTemplates = [TEMPLATES[0], TEMPLATES[1], TEMPLATES[4]]; // Turbo, Deepstack, Freezeout
    futureTemplates.forEach((tpl, idx) => {
        const daysForward = idx === 0 ? 1 : idx === 1 ? 3 : 7;
        list.push({
            id: `sch-evt-${idx}`,
            name: `Upcoming: ${tpl.name}`,
            startDate: getLocalDate(daysForward),
            startTime: '18:00',
            estimatedDurationMinutes: tpl.duration,
            buyIn: tpl.buyIn,
            fee: tpl.fee,
            maxPlayers: 60,
            startingChips: tpl.chips,
            startingBlinds: '100/200',
            blindLevelMinutes: 20,
            blindIncreasePercent: 20,
            rebuyLimit: tpl.name.includes('Freezeout') ? 0 : 1,
            lastRebuyLevel: 6,
            payoutModel: PayoutModel.FIXED,
            structureId: tpl.struct,
            payoutStructureId: tpl.payout,
            clockConfigId: 'default_clock',
            status: 'Scheduled',
            description: 'Register now for this upcoming event.',
            tableIds: ['t1', 't2']
        });
    });

    // 3. Generate 2 In-Progress "Test" Tournaments (Live)
    // Dynamic Time Calculation for "Now"
    const now = new Date();
    // Helper to format time HH:mm 24h format
    const formatTime = (d: Date) => d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false});
    
    const startTimeHyper = new Date(now.getTime() - 15 * 60000); // 15 mins ago
    const startTimeBreaks = new Date(now.getTime() - 45 * 60000); // 45 mins ago

    // Tournament A: Hyper Turbo Test
    list.push({
        id: 'live-test-hyper',
        name: 'LIVE TEST: Hyper Turbo',
        startDate: getLocalDate(0), // Today
        startTime: formatTime(startTimeHyper), 
        estimatedDurationMinutes: 60,
        buyIn: 1000,
        fee: 0,
        maxPlayers: 9,
        startingChips: 5000,
        startingBlinds: '100/200',
        blindLevelMinutes: 1,
        blindIncreasePercent: 50,
        rebuyLimit: 3, // Changed from 99
        lastRebuyLevel: 6, // Changed from 99
        payoutModel: PayoutModel.CHIP_EV,
        structureId: 'struct_test_1min',
        payoutStructureId: 'algo_1',
        clockConfigId: 'default_clock',
        status: 'In Progress',
        description: 'Test Environment: 1 minute levels to test clock transitions.',
        tableIds: ['t1']
    });

    // Tournament B: Break Test
    list.push({
        id: 'live-test-breaks',
        name: 'LIVE TEST: Breaks Logic',
        startDate: getLocalDate(0), // Today
        startTime: formatTime(startTimeBreaks),
        estimatedDurationMinutes: 120,
        buyIn: 3000,
        fee: 400,
        maxPlayers: 18,
        startingChips: 10000, // Calculated for test case
        startingBlinds: '100/200',
        blindLevelMinutes: 1,
        blindIncreasePercent: 20,
        rebuyLimit: 0,
        lastRebuyLevel: 0,
        payoutModel: PayoutModel.ICM,
        structureId: 'struct_test_breaks',
        payoutStructureId: 'algo_icm',
        clockConfigId: 'clock_light',
        status: 'In Progress',
        description: 'Test Environment: Alternating levels and breaks.',
        tableIds: ['t2', 't3']
    });

    // Tournament C: Split Payout Test
    list.push({
        id: 'live-test-breaks-split',
        name: 'TEST: 1min + Break (Split Payout)',
        startDate: getLocalDate(0), // Today
        startTime: formatTime(startTimeBreaks),
        estimatedDurationMinutes: 120,
        buyIn: 3000,
        fee: 400,
        maxPlayers: 18,
        startingChips: 10000, // Calculated for test case
        startingBlinds: '100/200',
        blindLevelMinutes: 1,
        blindIncreasePercent: 20,
        rebuyLimit: 0,
        lastRebuyLevel: 0,
        payoutModel: PayoutModel.ICM,
        structureId: 'struct_test_breaks',
        payoutStructureId: 'custom_split_1', // Split Payout
        clockConfigId: 'clock_light',
        status: 'In Progress',
        description: 'Test Environment: Split Payout (95% ICM / 5% High Hand).',
        tableIds: ['t4']
    });

    return list;
};

export const SEED_TOURNAMENTS: Tournament[] = generateMockTournaments();

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
        payoutStructureId: 'custom_split_1',
        clockConfigId: 'default_clock',
        description: 'Satellite to the monthly main event. Top 20% win seats.'
    }
];
