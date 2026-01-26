
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Tournament, TournamentRegistration, Member, PokerTable, RegistrationStatus, TournamentTransaction } from '../types';
import * as DataService from '../services/dataService';
import { broadcast, subscribe } from '../services/broadcastService';
import { EnrichedRegistration } from '../components/BuyinMgmtModal';

export const useTournamentLogic = (tournament: Tournament) => {
    const [registrations, setRegistrations] = useState<TournamentRegistration[]>([]);
    const [members, setMembers] = useState<Member[]>([]);
    const [tables, setTables] = useState<PokerTable[]>([]);
    const [lastUpdated, setLastUpdated] = useState(Date.now());

    // --- Data Fetching ---
    const refresh = useCallback(() => {
        setRegistrations(DataService.getTournamentRegistrations(tournament.id));
        setMembers(DataService.getMembers());
        
        const allTables = DataService.getTables();
        const relevantTables = (tournament.tableIds && tournament.tableIds.length > 0)
            ? allTables.filter(table => tournament.tableIds?.includes(table.id))
            : allTables.filter(table => table.status === 'Active');
        setTables(relevantTables);
        setLastUpdated(Date.now());
    }, [tournament.id, tournament.tableIds]);

    useEffect(() => {
        refresh();
        
        // Subscribe to cross-tab updates
        const unsubscribe = subscribe((message) => {
            if (
                message.type === 'REGISTRATION_UPDATED' && 
                message.payload?.tournamentId === tournament.id
            ) {
                refresh();
            }
            if (message.type === 'TOURNAMENT_UPDATED' && message.payload?.tournamentId === tournament.id) {
                refresh();
            }
        });

        return () => unsubscribe();
    }, [refresh, tournament.id]);

    // --- Computed Data ---
    
    // 1. Occupied Seats Map
    const occupiedSeatsByTable = useMemo(() => {
        const map = new Map<string, Set<number>>();
        registrations.forEach(r => {
            if (r.status !== 'Cancelled' && r.tableId && r.seatNumber) {
                if (!map.has(r.tableId)) {
                    map.set(r.tableId, new Set());
                }
                map.get(r.tableId)?.add(r.seatNumber);
            }
        });
        return map;
    }, [registrations]);

    // 2. Enriched Registrations (Merged Data + Financial Calcs)
    const enrichedRegistrations = useMemo((): EnrichedRegistration[] => {
        const baseCost = tournament.buyIn + tournament.fee;
        
        const all = registrations.map(reg => {
            const member = members.find(m => m.id === reg.memberId);
            const assignedTable = tables.find(t => t.id === reg.tableId);
            
            let netPayable = 0;
            let totalDepositPaid = 0;

            if (reg.transactions && reg.transactions.length > 0) {
                reg.transactions.forEach(tx => {
                    const totalDiscount = (tx.rebuyDiscount || 0) + (tx.membershipDiscount || 0) + (tx.voucherDiscount || 0) + (tx.campaignDiscount || 0);
                    netPayable += Math.max(0, baseCost - totalDiscount);
                    totalDepositPaid += (tx.depositPaid || 0);
                });
            } else {
                const count = reg.buyInCount || 0;
                netPayable = count * baseCost;
            }

            return { 
                ...reg, 
                member, 
                buyInCount: reg.buyInCount || 0,
                finalChipCount: reg.finalChipCount || 0,
                assignedTable,
                netPayable,
                totalDepositPaid
            };
        });

        // Sorting Logic
        if (tournament.status === 'Completed') {
            all.sort((a, b) => {
                if (a.rank && b.rank) return a.rank - b.rank;
                return (b.prize || 0) - (a.prize || 0);
            });
        } else {
            all.sort((a, b) => {
                // Group by Status (Joined first)
                if (a.status === 'Joined' && b.status !== 'Joined') return -1;
                if (b.status === 'Joined' && a.status !== 'Joined') return 1;
                
                // Sort by Name (Stable)
                return (a.member?.fullName || '').localeCompare(b.member?.fullName || '');
            });
        }

        return all;
    }, [registrations, members, tables, tournament]);

    // 3. Financial Stats
    const financialStats = useMemo(() => {
        const totalBuyIns = enrichedRegistrations.reduce((sum, reg) => sum + reg.buyInCount, 0);
        const totalPrizePool = totalBuyIns * tournament.buyIn;
        const totalFees = totalBuyIns * tournament.fee;
        
        const totalChipsInPlay = totalBuyIns * tournament.startingChips;
        const totalChipsCounted = enrichedRegistrations.reduce((sum, reg) => sum + (reg.finalChipCount || 0), 0);
        const chipDifference = totalChipsInPlay - totalChipsCounted;
        const isChipsBalanced = chipDifference === 0;

        return {
            totalBuyIns,
            totalPrizePool,
            totalFees,
            totalChipsInPlay,
            totalChipsCounted,
            chipDifference,
            isChipsBalanced
        };
    }, [enrichedRegistrations, tournament]);


    // --- Actions ---

    const registerMember = (memberId: string) => {
        DataService.addRegistration(tournament.id, memberId);
        refresh();
    };

    const updateStatus = (regId: string, status: RegistrationStatus) => {
        DataService.updateRegistrationStatus(regId, status);
        refresh();
    };

    const updateSeat = (regId: string, tableId: string, seatNumber: number): boolean => {
        const table = tables.find(t => t.id === tableId);
        if (!table) return false;

        // Check if seat is occupied by someone else
        const occupied = occupiedSeatsByTable.get(tableId);
        let validSeat = seatNumber;
        
        // Validation: clamp seat number
        if (validSeat > table.capacity) validSeat = 1;
        if (validSeat < 1) validSeat = 1;

        if (occupied && occupied.has(validSeat)) {
            // Simple "find next available" logic or fail
            let found = false;
            for (let i = 1; i <= table.capacity; i++) {
                if (!occupied.has(i)) {
                    validSeat = i;
                    found = true;
                    break;
                }
            }
            if (!found) {
                return false; // Table full
            }
        }

        DataService.updateRegistrationSeat(regId, tableId, validSeat);
        refresh();
        return true;
    };

    const updateChips = (regId: string, chips: number) => {
        DataService.updateRegistrationChips(regId, chips);
        refresh();
    };

    const signMember = (regId: string, isSigned: boolean, signatureUrl?: string) => {
        DataService.updateRegistrationSignature(regId, isSigned, signatureUrl);
        refresh();
    };

    const updateTransactions = (regId: string, transactions: TournamentTransaction[]) => {
        DataService.updateRegistrationTransactions(regId, transactions);
        const buyInCount = transactions.length;
        DataService.updateRegistrationBuyIn(regId, buyInCount);
        refresh();
    };

    const removeRegistration = (regId: string) => {
        DataService.deleteRegistration(regId);
        refresh();
    };

    return {
        registrations: enrichedRegistrations, // Expose enriched version directly
        rawRegistrations: registrations, // Access raw if needed
        tables,
        members,
        occupiedSeatsByTable,
        financialStats,
        lastUpdated,
        
        actions: {
            refresh,
            registerMember,
            updateStatus,
            updateSeat,
            updateChips,
            signMember,
            updateTransactions,
            removeRegistration
        }
    };
};
