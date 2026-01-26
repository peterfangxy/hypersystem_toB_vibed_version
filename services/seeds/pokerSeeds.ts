
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
        name: 'ICM Calculator', 
        description: 'Calculates equity based on stack sizes.', 
        isSystemDefault: true,
        allocations: [
            {
                id: 'alloc_icm_main',
                name: 'Main Prize Pool',
                percent: 100,
                type: 'ICM',
                color: '#a855f7'
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
                color: '#3b82f6'
            },
            {
                id: 'alloc_split_1_hh',
                name: 'High Hand Promo',
                percent: 5,
                type: 'Custom',
                color: '#eab308',
                rules: [
                    { minPlayers: 2, maxPlayers: 1000, placesPaid: 1, percentages: [100] }
                ]
            }
        ]
    }
];

const EXISTING_TOURNAMENTS: Tournament[] = [
    {
        id: 'evt-2023-0841',
        name: 'Friday Night Turbo',
        startDate: getLocalDate(0),
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
        startDate: getLocalDate(2), // 2 days from now
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
        startDate: getLocalDate(5), // 5 days from now
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
        payoutStructureId: 'custom_split_1',
        clockConfigId: 'default_clock',
        status: 'Scheduled',
        description: 'Unlimited rebuys for the first hour.',
        tableIds: ['t2', 't3']
    },
    {
        id: 'evt-2023-0900',
        name: 'High Roller Championship',
        startDate: getLocalDate(14),
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

const generatePastTournaments = (): Tournament[] => {
    const templates = [
        { name: 'Daily Turbo', buyIn: 50, fee: 10, struct: 'struct_turbo' },
        { name: 'Deepstack', buyIn: 120, fee: 20, struct: 'struct_deep' },
        { name: 'Bounty Hunter', buyIn: 80, fee: 20, struct: 'struct_turbo' },
        { name: 'PLO Night', buyIn: 100, fee: 15, struct: 'struct_deep' },
    ];

    const pastTournaments: Tournament[] = [];
    
    // Generate for the last 14 days
    for (let i = 1; i <= 14; i++) {
        const dateStr = getLocalDate(-i);
        // Create 2 tournaments per day on average
        const numEvents = i % 7 === 0 ? 3 : 2; 

        for (let j = 0; j < numEvents; j++) {
            const template = templates[(i + j) % templates.length];
            // 5 Cancelled tournaments total approx
            const isCancelled = (i * j) % 7 === 6 && pastTournaments.length < 5; 
            
            pastTournaments.push({
                id: `past-evt-${i}-${j}`,
                name: `${template.name} - ${new Date(dateStr).toLocaleDateString(undefined, {month:'short', day:'numeric'})}`,
                startDate: dateStr,
                startTime: j === 0 ? '14:00' : '19:00',
                estimatedDurationMinutes: 240,
                buyIn: template.buyIn,
                fee: template.fee,
                maxPlayers: 50,
                startingChips: 15000,
                startingBlinds: '100/200',
                blindLevelMinutes: 20,
                blindIncreasePercent: 20,
                rebuyLimit: 1,
                lastRebuyLevel: 6,
                payoutModel: PayoutModel.FIXED,
                structureId: template.struct,
                payoutStructureId: 'algo_1',
                clockConfigId: 'default_clock',
                status: isCancelled ? 'Cancelled' : 'Completed',
                tableIds: ['t1', 't2', 't3']
            });
        }
    }
    return pastTournaments;
};

export const SEED_TOURNAMENTS: Tournament[] = [
    ...EXISTING_TOURNAMENTS,
    ...generatePastTournaments()
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
        payoutStructureId: 'custom_split_1',
        clockConfigId: 'default_clock',
        description: 'Satellite to the monthly main event. Top 20% win seats.'
    }
];
