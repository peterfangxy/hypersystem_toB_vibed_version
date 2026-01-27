
import { TournamentRegistration, RegistrationStatus, TournamentTransaction } from '../../types';
import { SEED_REGISTRATIONS } from '../mockData';
import { broadcast } from '../broadcastService';
import { getLocalData, setLocalData, REGISTRATIONS_KEY } from './storage';
import { getTournaments } from './tournaments';

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
