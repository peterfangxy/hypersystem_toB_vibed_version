import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Search, 
  CheckCircle2, 
  Trash2, 
  PlayCircle,
  Clock,
  User,
  Plus,
  Users,
  DollarSign,
  Coins,
  Minus,
  Banknote,
  Lock,
  Trophy,
  AlertTriangle,
  Loader2,
  Armchair
} from 'lucide-react';
import { Tournament, TournamentRegistration, Member, RegistrationStatus, PokerTable } from '../types';
import * as DataService from '../services/dataService';
import { THEME } from '../theme';
import { Modal } from './Modal';

// --- Internal Component: Add Player Picker ---

interface AddPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (memberId: string) => void;
  existingMemberIds: Set<string>;
}

const AddPlayerModal: React.FC<AddPlayerModalProps> = ({ isOpen, onClose, onAdd, existingMemberIds }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    if (isOpen) {
      setMembers(DataService.getMembers());
      setSearchTerm('');
    }
  }, [isOpen]);

  const availableMembers = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return members.filter(m => 
      !existingMemberIds.has(m.id) && 
      (m.fullName.toLowerCase().includes(term) || m.email.toLowerCase().includes(term))
    );
  }, [members, existingMemberIds, searchTerm]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      zIndex={60}
      title={
        <div className="flex items-center gap-2">
            <UserPlusIcon size={20} className="text-brand-green"/>
            Add Player
        </div>
      }
    >
        <div className="p-4 border-b border-[#222]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
             <input 
                autoFocus
                type="text"
                placeholder="Search available members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full ${THEME.input} rounded-xl pl-10 pr-4 py-3 text-sm outline-none shadow-inner`}
            />
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-2 space-y-1 max-h-[50vh]">
          {availableMembers.map(member => (
            <button 
              key={member.id} 
              onClick={() => { onAdd(member.id); onClose(); }} 
              className="w-full flex items-center justify-between p-3 hover:bg-[#333] rounded-xl group transition-all border border-transparent hover:border-[#333]"
            >
               <div className="flex items-center gap-3 text-left">
                  <div className="w-10 h-10 rounded-full bg-[#222] flex items-center justify-center text-xs font-bold text-gray-400 overflow-hidden">
                      {member.avatarUrl ? <img src={member.avatarUrl} className="w-full h-full object-cover"/> : member.fullName.charAt(0)}
                  </div>
                  <div>
                      <div className="text-sm font-bold text-gray-200 group-hover:text-white">{member.fullName}</div>
                      <div className="text-xs text-gray-500">{member.tier} Member</div>
                  </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#222] flex items-center justify-center text-brand-green opacity-0 group-hover:opacity-100 transition-all transform group-hover:scale-110">
                <Plus size={18} />
              </div>
            </button>
          ))}
          
          {availableMembers.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
               <Users size={32} className="opacity-20 mb-2" />
               <p className="text-sm">No available members found</p>
            </div>
          )}
        </div>
    </Modal>
  );
};

// --- Main Component ---

interface TournamentParticipantsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tournament: Tournament;
  onComplete?: () => void;
}

const TournamentParticipantsModal: React.FC<TournamentParticipantsModalProps> = ({ isOpen, onClose, tournament, onComplete }) => {
  const [registrations, setRegistrations] = useState<TournamentRegistration[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [tables, setTables] = useState<PokerTable[]>([]);
  
  const [registrationSearch, setRegistrationSearch] = useState('');
  const [isAddPlayerOpen, setIsAddPlayerOpen] = useState(false);
  
  // Processing State
  const [isProcessing, setIsProcessing] = useState(false);

  // Load data when modal opens or tournament changes (e.g. status update)
  useEffect(() => {
    if (isOpen) {
      setRegistrations(DataService.getTournamentRegistrations(tournament.id));
      setMembers(DataService.getMembers());
      
      const allTables = DataService.getTables();
      // If tournament has specific tables, use those. Otherwise fallback to all Active tables.
      const relevantTables = (tournament.tableIds && tournament.tableIds.length > 0)
        ? allTables.filter(t => tournament.tableIds?.includes(t.id))
        : allTables.filter(t => t.status === 'Active');

      setTables(relevantTables);
    }
  }, [isOpen, tournament.id, tournament.status, tournament.tableIds]);

  const handleAddMember = (memberId: string) => {
    DataService.addRegistration(tournament.id, memberId);
    setRegistrations(DataService.getTournamentRegistrations(tournament.id));
  };

  const handleStatusChange = (regId: string, status: RegistrationStatus) => {
    DataService.updateRegistrationStatus(regId, status);
    setRegistrations(DataService.getTournamentRegistrations(tournament.id));
  };

  // Map of TableID -> Set of occupied Seat Numbers
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

  const handleSeatChange = (regId: string, tableId: string, seatNumber: number) => {
      const table = tables.find(t => t.id === tableId);
      if (!table) return;

      // Check occupied seats for this table (excluding current user)
      const occupied = new Set<number>();
      registrations.forEach(r => {
          if (r.id !== regId && r.status !== 'Cancelled' && r.tableId === tableId && r.seatNumber) {
              occupied.add(r.seatNumber);
          }
      });

      let validSeat = seatNumber;
      
      // 1. Capacity check
      if (validSeat > table.capacity) validSeat = 1;
      if (validSeat < 1) validSeat = 1;

      // 2. Occupancy check (Collision Avoidance)
      if (occupied.has(validSeat)) {
          // Attempt to find the first available seat
          let found = false;
          for (let i = 1; i <= table.capacity; i++) {
              if (!occupied.has(i)) {
                  validSeat = i;
                  found = true;
                  break;
              }
          }
          if (!found) {
              alert("This table is fully occupied.");
              return; 
          }
      }

      DataService.updateRegistrationSeat(regId, tableId, validSeat);
      setRegistrations(DataService.getTournamentRegistrations(tournament.id));
  };

  const handleBuyInChange = (regId: string, newCount: number) => {
    if (newCount < 0) return;
    const maxBuyIns = 1 + tournament.rebuyLimit;
    if (newCount > maxBuyIns) return; 

    DataService.updateRegistrationBuyIn(regId, newCount);
    setRegistrations(DataService.getTournamentRegistrations(tournament.id));
  };
  
  const handleChipChange = (regId: string, chips: number) => {
      DataService.updateRegistrationChips(regId, chips);
      setRegistrations(DataService.getTournamentRegistrations(tournament.id));
  };

  const handleDelete = (regId: string) => {
      if(window.confirm('Are you sure you want to remove this player from the tournament?')) {
          DataService.deleteRegistration(regId);
          setRegistrations(DataService.getTournamentRegistrations(tournament.id));
      }
  };

  // Merge registration data with member details for display
  const enrichedRegistrations = useMemo(() => {
    const all = registrations.map(reg => {
      const member = members.find(m => m.id === reg.memberId);
      const assignedTable = tables.find(t => t.id === reg.tableId);
      return { 
          ...reg, 
          member, 
          buyInCount: reg.buyInCount || 0, // Default to 0 for legacy data
          finalChipCount: reg.finalChipCount || 0,
          assignedTable
      };
    });

    // If completed, sort by Rank or Prize. If not, sort by date.
    if (tournament.status === 'Completed') {
        all.sort((a, b) => {
            if (a.rank && b.rank) return a.rank - b.rank;
            return (b.prize || 0) - (a.prize || 0);
        });
    } else {
        // Sort: Joined first, then Registered
        // Within Joined, sort by Table/Seat
        all.sort((a, b) => {
            if (a.status === 'Joined' && b.status !== 'Joined') return -1;
            if (b.status === 'Joined' && a.status !== 'Joined') return 1;
            
            if (a.status === 'Joined') {
                // Both joined, sort by table/seat
                if (a.assignedTable?.name !== b.assignedTable?.name) {
                    return (a.assignedTable?.name || '').localeCompare(b.assignedTable?.name || '');
                }
                return (a.seatNumber || 0) - (b.seatNumber || 0);
            }
            
            // Latest registered first
            return new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime();
        });
    }

    // Filter by search
    if (!registrationSearch) return all;
    return all.filter(r => 
      r.member?.fullName.toLowerCase().includes(registrationSearch.toLowerCase()) || 
      r.member?.email.toLowerCase().includes(registrationSearch.toLowerCase())
    );
  }, [registrations, members, tables, registrationSearch, tournament.status]);

  // Calculations
  const totalBuyIns = enrichedRegistrations.reduce((sum, reg) => sum + reg.buyInCount, 0);
  const totalPrizePool = totalBuyIns * tournament.buyIn;
  const totalFees = totalBuyIns * tournament.fee;
  const maxAllowedBuyIns = 1 + tournament.rebuyLimit;

  // Chip Reconciliation
  const totalChipsInPlay = totalBuyIns * tournament.startingChips;
  const totalChipsCounted = enrichedRegistrations.reduce((sum, reg) => sum + (reg.finalChipCount || 0), 0);
  const chipDifference = totalChipsInPlay - totalChipsCounted;
  const isChipsBalanced = chipDifference === 0;

  // Status Check
  const isTournamentLocked = ['Completed', 'Cancelled'].includes(tournament.status);
  const isInProgress = tournament.status === 'In Progress';

  const handleConfirmCompletion = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Safety check
    if (!isChipsBalanced) return;

    setIsProcessing(true);

    // Simulate calculation delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // --- Calculation Logic ---
    
    // 1. Get Payout Structure
    const payoutStruct = DataService.getPayoutStructures().find(p => p.id === tournament.payoutStructureId);
    
    // 2. Filter & Sort Active Players
    const activeRegs = registrations.filter(r => r.status !== 'Cancelled');
    const sortedRegs = [...activeRegs].sort((a, b) => (b.finalChipCount || 0) - (a.finalChipCount || 0));

    // 3. Determine Distribution Percentages
    let percentages = [100]; // Default: Winner takes all
    if (payoutStruct && payoutStruct.rules) {
        const count = activeRegs.length;
        const rule = payoutStruct.rules.find(r => count >= r.minPlayers && count <= r.maxPlayers);
        if (rule) percentages = rule.percentages;
    }

    // 4. Handle Percentage Redistribution (if players < places paid)
    // This happens if a generic rule (e.g. Pays 3 Places) is applied to a small field (e.g. 2 Players)
    let finalPercentages = [...percentages];
    if (activeRegs.length > 0 && activeRegs.length < percentages.length) {
        const playerCount = activeRegs.length;
        // The percentages that can be assigned to actual players
        const assignablePercentages = percentages.slice(0, playerCount);
        // The percentages for non-existent places
        const excessPercentage = percentages.slice(playerCount).reduce((sum, p) => sum + p, 0);
        
        if (excessPercentage > 0) {
            // Split the excess evenly among the winners
            const boostPerPlayer = excessPercentage / playerCount;
            finalPercentages = assignablePercentages.map(p => p + boostPerPlayer);
        } else {
            finalPercentages = assignablePercentages;
        }
    }

    // 5. Assign Prizes
    sortedRegs.forEach((reg, index) => {
        const rank = index + 1;
        let prize = 0;
        if (index < finalPercentages.length) {
            prize = totalPrizePool * (finalPercentages[index] / 100);
        }
        DataService.updateRegistrationResult(reg.id, rank, prize);
    });

    // 6. Update State
    setRegistrations(DataService.getTournamentRegistrations(tournament.id));
    
    // 7. Complete Tournament
    if (onComplete) {
        onComplete();
    }
    
    setIsProcessing(false);
  };

  const getStatusBadge = (status: RegistrationStatus) => {
    switch (status) {
      case 'Registered': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'Approved': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'Joined': return 'bg-brand-green/10 text-brand-green border-brand-green/20';
      case 'Cancelled': return 'bg-red-500/10 text-red-500 border-red-500/20';
    }
  };

  const CustomHeader = () => (
    <div>
        <h2 className="text-2xl font-bold text-white mb-1">{tournament.name}</h2>
        <div className="flex items-center gap-6 text-sm text-gray-400 mt-2">
            <span className="flex items-center gap-1.5">
                <Clock size={16} className="text-gray-500"/>
                {new Date(tournament.startDate).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1.5">
                <User size={16} className="text-gray-500"/>
                {registrations.filter(r => r.status !== 'Cancelled').length} / {tournament.maxPlayers} Registered
            </span>
            <span className="flex items-center gap-1.5 text-brand-green font-medium pl-2 border-l border-[#333]">
                <Coins size={16} />
                Prize Pool: ${totalPrizePool.toLocaleString()}
            </span>
            <span className="flex items-center gap-1.5 text-gray-400 font-medium">
                <Banknote size={16} />
                House: ${totalFees.toLocaleString()}
            </span>
            {isTournamentLocked && (
                <span className="flex items-center gap-1.5 text-red-400 font-bold bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                    <Lock size={12} />
                    {tournament.status}
                </span>
            )}
        </div>
    </div>
  );

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={<CustomHeader />}
        size="4xl"
      >
          <div className="flex flex-1 overflow-hidden relative">
            
            {/* Processing Overlay */}
            {isProcessing && (
                <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white animate-in fade-in duration-300">
                    <Loader2 size={48} className="animate-spin text-brand-green mb-4" />
                    <h3 className="text-2xl font-bold mb-2">Calculating Results...</h3>
                    <p className="text-gray-400">Verifying chip counts and allocating prizes</p>
                </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
              
              {/* Controls Section */}
              <div className="p-6 pb-2">
                <div className="flex gap-3">
                  <div className="relative flex-1">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                      <input 
                        type="text"
                        placeholder="Search registered players..."
                        value={registrationSearch}
                        onChange={(e) => setRegistrationSearch(e.target.value)}
                        className={`w-full ${THEME.input} rounded-xl pl-11 pr-4 py-3 outline-none transition-all shadow-sm focus:ring-1 focus:ring-brand-green/50`}
                      />
                  </div>

                  {!isTournamentLocked && (
                      <button 
                        onClick={() => setIsAddPlayerOpen(true)}
                        className={`${THEME.buttonPrimary} px-6 rounded-xl flex items-center gap-2 font-bold shadow-lg shadow-green-500/10 shrink-0 transition-transform active:scale-95`}
                      >
                        <Plus size={18} />
                        <span>Add Member</span>
                      </button>
                  )}
                </div>
              </div>

              {/* Registration List */}
              <div className="flex-1 overflow-y-auto p-6 pt-2">
                  <table className="w-full text-left border-collapse table-fixed">
                    <thead className="sticky top-0 bg-[#171717] z-10 shadow-sm">
                      <tr className="text-xs uppercase text-gray-500 font-bold tracking-wider">
                        <th className="pb-4 pt-2 w-[15%]">Player</th>
                        <th className="pb-4 pt-2 w-[10%]">Status</th>
                        <th className="pb-4 pt-2 w-[13%]">Table / Seat</th>
                        <th className="pb-4 pt-2 text-center w-[15%]">Buy-ins</th>
                        <th className="pb-4 pt-2 text-right w-[10%]">Total Chips</th>
                        <th className="pb-4 pt-2 text-right w-[10%]">Final Chips</th>
                        {/* Show Winnings column if tournament is completed */}
                        {isTournamentLocked && (
                             <th className="pb-4 pt-2 text-right text-brand-green w-[10%]">Winnings</th>
                        )}
                        <th className="pb-4 pt-2 text-right w-[10%]"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#262626]">
                      {enrichedRegistrations.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-20 text-center text-gray-500">
                            {registrationSearch ? 'No matching players found.' : 'No players registered yet.'}
                          </td>
                        </tr>
                      ) : (
                        enrichedRegistrations.map((reg, idx) => (
                          <tr key={reg.id} className="group hover:bg-[#222] transition-colors">
                            {/* Player Column */}
                            <td className="py-4 truncate pr-2">
                              <div className="flex items-center gap-3">
                                {isTournamentLocked && reg.rank && (
                                    <div className={`w-6 h-6 shrink-0 rounded-full flex items-center justify-center text-xs font-bold mr-1 ${
                                        reg.rank === 1 ? 'bg-yellow-500 text-black' : 
                                        reg.rank === 2 ? 'bg-gray-400 text-black' :
                                        reg.rank === 3 ? 'bg-amber-700 text-white' : 'bg-[#333] text-gray-500'
                                    }`}>
                                        {reg.rank}
                                    </div>
                                )}
                                <img 
                                  src={reg.member?.avatarUrl} 
                                  alt="" 
                                  className="w-10 h-10 rounded-full object-cover bg-gray-800 shrink-0"
                                />
                                <div className="min-w-0">
                                  <div className="font-bold text-white truncate">{reg.member?.fullName || 'Unknown Member'}</div>
                                  <div className="text-xs text-gray-500">{reg.member?.tier} Member</div>
                                </div>
                              </div>
                            </td>

                            {/* Status Column */}
                            <td className="py-4">
                              <span className={`inline-flex px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(reg.status)}`}>
                                {reg.status}
                              </span>
                            </td>

                            {/* Table / Seat Column */}
                            <td className="py-4">
                                {(reg.status === 'Approved' || reg.status === 'Joined') ? (
                                    <div className="flex items-center gap-2">
                                        {/* Table Select */}
                                        <select 
                                            value={reg.tableId || ''}
                                            onChange={(e) => handleSeatChange(reg.id, e.target.value, reg.seatNumber || 1)}
                                            className="bg-[#111] border border-[#333] rounded px-2 py-1 text-xs text-white outline-none focus:border-brand-green w-full min-w-0"
                                            disabled={isTournamentLocked}
                                        >
                                            <option value="" disabled>Table</option>
                                            {tables.map(t => (
                                                <option key={t.id} value={t.id}>{t.name}</option>
                                            ))}
                                        </select>
                                        
                                        {/* Seat Select */}
                                        <select 
                                            value={reg.seatNumber || ''}
                                            onChange={(e) => handleSeatChange(reg.id, reg.tableId || '', parseInt(e.target.value))}
                                            className="bg-[#111] border border-[#333] rounded px-2 py-1 text-xs text-white outline-none focus:border-brand-green w-[60px] shrink-0"
                                            disabled={!reg.tableId || isTournamentLocked}
                                        >
                                            <option value="" disabled>Seat</option>
                                            {reg.assignedTable && Array.from({ length: reg.assignedTable.capacity }, (_, i) => i + 1).map(num => {
                                                const isTaken = occupiedSeatsByTable.get(reg.tableId!)?.has(num) && reg.seatNumber !== num;
                                                return (
                                                    <option key={num} value={num} disabled={isTaken}>
                                                        {num} {isTaken ? '(Taken)' : ''}
                                                    </option>
                                                );
                                            })}
                                        </select>
                                    </div>
                                ) : (
                                    <span className="text-gray-600 text-xs italic">
                                        {reg.status === 'Registered' ? 'Waiting for Approval' : 'Not Seated'}
                                    </span>
                                )}
                            </td>

                            {/* Buy-ins Column */}
                            <td className="py-4">
                                <div className="flex justify-center">
                                    {reg.buyInCount === 0 ? (
                                        <button 
                                            onClick={() => handleBuyInChange(reg.id, 1)}
                                            disabled={isTournamentLocked}
                                            className={`px-4 py-1.5 rounded-full border font-semibold text-xs transition-all flex items-center gap-1.5 ${
                                                isTournamentLocked 
                                                ? 'bg-[#222] text-gray-500 border-gray-600 cursor-not-allowed'
                                                : 'bg-brand-green/20 text-brand-green border-brand-green/30 hover:bg-brand-green hover:text-black'
                                            }`}
                                        >
                                            <DollarSign size={12} />
                                            Pay Buy-in
                                        </button>
                                    ) : (
                                        <div className="flex items-center gap-3 bg-[#111] rounded-lg p-1 border border-[#333]">
                                            <button 
                                                onClick={() => handleBuyInChange(reg.id, reg.buyInCount - 1)}
                                                className="w-6 h-6 flex items-center justify-center rounded bg-[#222] text-gray-400 hover:text-white hover:bg-[#333] transition-colors disabled:opacity-50"
                                                disabled={reg.buyInCount <= 0 || isTournamentLocked}
                                                title="Decrease"
                                            >
                                                <Minus size={12} />
                                            </button>
                                            
                                            <span className="text-sm font-bold text-white w-4 text-center">
                                                {reg.buyInCount}
                                            </span>

                                            <button 
                                                onClick={() => handleBuyInChange(reg.id, reg.buyInCount + 1)}
                                                disabled={reg.buyInCount >= maxAllowedBuyIns || isTournamentLocked}
                                                className={`flex items-center gap-1 px-2 h-6 rounded text-xs font-medium transition-colors ${
                                                    reg.buyInCount >= maxAllowedBuyIns || isTournamentLocked
                                                    ? 'bg-[#1A1A1A] text-gray-600 cursor-not-allowed' 
                                                    : 'bg-[#222] text-brand-green hover:bg-brand-green/20 cursor-pointer'
                                                }`}
                                                title={reg.buyInCount >= maxAllowedBuyIns ? "Max buy-ins reached" : "Add Re-buy"}
                                            >
                                                <Plus size={10} />
                                                Rebuy
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </td>

                            {/* Total Chips Column */}
                            <td className="py-4 text-right">
                                <span className="font-mono font-medium text-gray-300">
                                    {(reg.buyInCount * tournament.startingChips).toLocaleString()}
                                </span>
                            </td>

                             {/* Final Chip Count Column */}
                             <td className="py-4 text-right">
                                <input 
                                    type="number" 
                                    min="0"
                                    value={reg.finalChipCount === 0 && document.activeElement !== document.getElementById(`chips-${reg.id}`) ? '' : reg.finalChipCount}
                                    onChange={(e) => handleChipChange(reg.id, parseInt(e.target.value) || 0)}
                                    placeholder="0"
                                    disabled={isTournamentLocked}
                                    id={`chips-${reg.id}`}
                                    className={`w-24 bg-[#111] border rounded px-2 py-1.5 text-right text-white text-sm outline-none transition-colors placeholder:text-gray-600 ${
                                      isTournamentLocked 
                                      ? 'border-[#333] opacity-50 cursor-not-allowed' 
                                      : 'border-[#333] focus:border-brand-green focus:bg-[#1A1A1A]'
                                    }`}
                                />
                             </td>

                            {/* Winnings Column */}
                            {isTournamentLocked && (
                                <td className="py-4 text-right">
                                    {reg.prize && reg.prize > 0 ? (
                                        <span className="font-bold text-brand-green flex items-center justify-end gap-1">
                                            <Trophy size={14} />
                                            ${reg.prize.toLocaleString()}
                                        </span>
                                    ) : (
                                        <span className="text-gray-600 text-sm">-</span>
                                    )}
                                </td>
                            )}

                            {/* Actions Column */}
                            <td className="py-4 text-right">
                              <div className="flex justify-end gap-2">
                                {!isTournamentLocked && (
                                    <>
                                        {reg.status === 'Registered' && reg.buyInCount > 0 && (
                                        <button 
                                            onClick={() => handleStatusChange(reg.id, 'Approved')}
                                            className="p-2 bg-purple-500/10 text-purple-500 hover:bg-purple-500 hover:text-white rounded-full transition-colors"
                                            title="Approve"
                                        >
                                            <CheckCircle2 size={16} />
                                        </button>
                                        )}
                                        {reg.status === 'Approved' && (
                                        <button 
                                            onClick={() => handleStatusChange(reg.id, 'Joined')}
                                            className="p-2 bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white rounded-full transition-colors"
                                            title="Seat Player (Join)"
                                        >
                                            <PlayCircle size={16} />
                                        </button>
                                        )}
                                        <button 
                                            onClick={() => handleDelete(reg.id)}
                                            className="p-2 text-gray-500 hover:bg-red-500 hover:text-white rounded-full transition-colors"
                                            title="Remove Player"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
              </div>

              {/* Reconciliation & Complete Footer */}
              {isInProgress && (
                <div className="bg-[#1A1A1A] border-t border-[#333] p-4 flex justify-between items-center animate-in slide-in-from-bottom-2">
                    <div className="flex gap-6 text-sm">
                        <div>
                            <span className="text-gray-500 block text-xs font-bold uppercase">Total Chips In Play</span>
                            <span className="text-white font-mono font-medium text-lg">{totalChipsInPlay.toLocaleString()}</span>
                        </div>
                        <div>
                            <span className="text-gray-500 block text-xs font-bold uppercase">Counted</span>
                             <span className={`font-mono font-medium text-lg ${isChipsBalanced ? 'text-brand-green' : 'text-red-400'}`}>
                                {totalChipsCounted.toLocaleString()}
                            </span>
                        </div>
                        {chipDifference !== 0 && (
                             <div className="flex items-center gap-2 text-red-400 bg-red-500/10 px-3 rounded-lg border border-red-500/20">
                                <AlertTriangle size={18} />
                                <div>
                                    <span className="block text-[10px] font-bold uppercase opacity-80">Discrepancy</span>
                                    <span className="font-mono font-bold text-sm">
                                        {chipDifference > 0 ? '-' : '+'}{Math.abs(chipDifference).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <button 
                        onClick={handleConfirmCompletion}
                        disabled={!isChipsBalanced || isProcessing}
                        className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all active:scale-95 ${
                            !isChipsBalanced || isProcessing
                            ? 'bg-gray-700 text-gray-400 cursor-not-allowed opacity-50'
                            : 'bg-brand-green text-black hover:bg-brand-green/90 shadow-green-500/20 hover:scale-105'
                        }`}
                        title={!isChipsBalanced ? "Chips must be balanced to complete" : ""}
                    >
                        {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <Trophy size={18} />}
                        Confirm Results & Complete
                    </button>
                </div>
              )}
            </div>
          </div>
      </Modal>

      <AddPlayerModal 
        isOpen={isAddPlayerOpen}
        onClose={() => setIsAddPlayerOpen(false)}
        onAdd={handleAddMember}
        existingMemberIds={new Set(registrations.map(r => r.memberId))}
      />
    </>
  );
};

// Helper Icon for Add Player Modal Title
const UserPlusIcon = ({ size, className }: { size: number, className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="8.5" cy="7" r="4"></circle>
    <line x1="20" y1="8" x2="20" y2="14"></line>
    <line x1="23" y1="11" x2="17" y2="11"></line>
  </svg>
);

export default TournamentParticipantsModal;