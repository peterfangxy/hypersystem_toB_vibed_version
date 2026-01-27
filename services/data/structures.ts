
import { TournamentStructure, PayoutStructure } from '../../types';
import { SEED_STRUCTURES, SEED_PAYOUTS } from '../mockData';
import { broadcast } from '../broadcastService';
import { getLocalData, setLocalData, STRUCTURES_KEY, PAYOUTS_KEY } from './storage';

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
