import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowLeft,
  Search, 
  CheckCircle2, 
  Trash2, 
  PlayCircle,
  Clock,
  User,
  Plus,
  Coins,
  Banknote,
  Lock,
  Trophy,
  AlertTriangle,
  Loader2,
  Ticket,
  Repeat
} from 'lucide-react';
import { Tournament, TournamentRegistration, Member, RegistrationStatus, PokerTable, TournamentTransaction } from '../types';
import * as DataService from '../services/dataService';
import { THEME } from '../theme';
import { BuyinMgmtModal, EnrichedRegistration } from './BuyinMgmtModal';
import AddPlayerModal from './AddPlayerModal';

interface TournamentParticipantsViewProps {
  tournamentId: string;
  onBack: () => void;
}

const TournamentParticipantsView: React.FC<TournamentParticipantsViewProps> = ({ tournamentId, onBack }) => {
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [registrations, setRegistrations] = useState<TournamentRegistration[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [tables, setTables] = useState<PokerTable[]>([]);
  
  const [registrationSearch, setRegistrationSearch] = useState('');
  const [isAddPlayerOpen, setIsAddPlayerOpen] = useState(false);
  
  // Payment Modal State
  const [paymentModalReg, setPaymentModalReg] = useState<EnrichedRegistration | null>(null);

  // Processing State
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    refreshData();
  }, [tournamentId]);

  const refreshData = () => {
    const t = DataService.getTournaments().find(t => t.id === tournamentId);
    if (t) {
        setTournament(t);
        setRegistrations(DataService.getTournamentRegistrations(t.id));
        setMembers(DataService.getMembers());
        
        const allTables = DataService.getTables();
        const relevantTables = (t.tableIds && t.tableIds.length > 0)
            ? allTables.filter(table => t.tableIds?.includes(table.id))
            : allTables.filter(table => table.status === 'Active');
        setTables(relevantTables);
    }
  };

  const handleAddMember = (memberId: string) => {
    if (!tournament) return;
    DataService.addRegistration(tournament.id, memberId);
    setRegistrations(DataService.getTournamentRegistrations(tournament.id));
  };

  const handleStatusChange = (regId: string, status: RegistrationStatus) => {
    if (!tournament) return;
    DataService.updateRegistrationStatus(regId, status);
    setRegistrations(DataService.getTournamentRegistrations(tournament.id));
  };

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
      if (!tournament) return;
      const table = tables.find(t => t.id === tableId);
      if (!table) return;

      const occupied = new Set<number>();
      registrations.forEach(r => {
          if (r.id !== regId && r.status !== 'Cancelled' && r.tableId === tableId && r.seatNumber) {
              occupied.add(r.seatNumber);
          }
      });

      let validSeat = seatNumber;
      if (validSeat > table.capacity) validSeat = 1;
      if (validSeat < 1) validSeat = 1;

      if (occupied.has(validSeat)) {
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
  
  const handleChipChange = (regId: string, chips: number) => {
      if (!tournament) return;
      DataService.updateRegistrationChips(regId, chips);
      setRegistrations(DataService.getTournamentRegistrations(tournament.id));
  };

  const handleTransactionsSave = (regId: string, transactions: TournamentTransaction[]) => {
      DataService.updateRegistrationTransactions(regId, transactions);
      // Sync buyInCount
      const buyInCount = transactions.length;
      DataService.updateRegistrationBuyIn(regId, buyInCount);
      
      setRegistrations(DataService.getTournamentRegistrations(tournamentId));
  };

  const handleDelete = (regId: string) => {
      if (!tournament) return;
      if(window.confirm('Are you sure you want to remove this player from the tournament?')) {
          DataService.deleteRegistration(regId);
          setRegistrations(DataService.getTournamentRegistrations(tournament.id));
      }
  };

  const enrichedRegistrations = useMemo(() => {
    if (!tournament) return [];
    const baseCost = tournament.buyIn + tournament.fee;
    
    const all = registrations.map(reg => {
      const member = members.find(m => m.id === reg.memberId);
      const assignedTable = tables.find(t => t.id === reg.tableId);
      
      // Calculate Financials via Transactions Summation
      let netPayable = 0;
      let totalDepositPaid = 0;

      // Ensure we use transactions if available
      if (reg.transactions && reg.transactions.length > 0) {
          reg.transactions.forEach(tx => {
              const totalDiscount = (tx.rebuyDiscount || 0) + (tx.membershipDiscount || 0) + (tx.voucherDiscount || 0) + (tx.campaignDiscount || 0);
              netPayable += Math.max(0, baseCost - totalDiscount);
              totalDepositPaid += (tx.depositPaid || 0);
          });
      } else {
          // Fallback logic if needed (legacy)
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

    if (tournament.status === 'Completed') {
        all.sort((a, b) => {
            if (a.rank && b.rank) return a.rank - b.rank;
            return (b.prize || 0) - (a.prize || 0);
        });
    } else {
        all.sort((a, b) => {
            if (a.status === 'Joined' && b.status !== 'Joined') return -1;
            if (b.status === 'Joined' && a.status !== 'Joined') return 1;
            
            if (a.status === 'Joined') {
                if (a.assignedTable?.name !== b.assignedTable?.name) {
                    return (a.assignedTable?.name || '').localeCompare(b.assignedTable?.name || '');
                }
                return (a.seatNumber || 0) - (b.seatNumber || 0);
            }
            return new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime();
        });
    }

    if (!registrationSearch) return all;
    return all.filter(r => 
      r.member?.fullName.toLowerCase().includes(registrationSearch.toLowerCase()) || 
      r.member?.email.toLowerCase().includes(registrationSearch.toLowerCase())
    );
  }, [registrations, members, tables, registrationSearch, tournament]);

  if (!tournament) return null;

  const totalBuyIns = enrichedRegistrations.reduce((sum, reg) => sum + reg.buyInCount, 0);
  const totalPrizePool = totalBuyIns * tournament.buyIn;
  const totalFees = totalBuyIns * tournament.fee;
  const maxAllowedBuyIns = 1 + tournament.rebuyLimit;

  // --- Chip Reconciliation Logic ---
  const totalChipsInPlay = totalBuyIns * tournament.startingChips;
  const totalChipsCounted = enrichedRegistrations.reduce((sum, reg) => sum + (reg.finalChipCount || 0), 0);
  const chipDifference = totalChipsInPlay - totalChipsCounted;
  const isChipsBalanced = chipDifference === 0;

  const isTournamentLocked = ['Completed', 'Cancelled'].includes(tournament.status || '');
  const isInProgress = tournament.status === 'In Progress';

  const handleConfirmCompletion = async () => {
    if (!isChipsBalanced || !tournament) return;

    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    const payoutStruct = DataService.getPayoutStructures().find(p => p.id === tournament.payoutStructureId);
    
    const activeRegs = registrations.filter(r => r.status !== 'Cancelled');
    const sortedRegs = [...activeRegs].sort((a, b) => (b.finalChipCount || 0) - (a.finalChipCount || 0));

    let percentages = [100];
    if (payoutStruct && payoutStruct.rules) {
        const count = activeRegs.length;
        const rule = payoutStruct.rules.find(r => count >= r.minPlayers && count <= r.maxPlayers);
        if (rule) percentages = rule.percentages;
    }

    let finalPercentages = [...percentages];
    if (activeRegs.length > 0 && activeRegs.length < percentages.length) {
        const playerCount = activeRegs.length;
        const assignablePercentages = percentages.slice(0, playerCount);
        const excessPercentage = percentages.slice(playerCount).reduce((sum, p) => sum + p, 0);
        
        if (excessPercentage > 0) {
            const boostPerPlayer = excessPercentage / playerCount;
            finalPercentages = assignablePercentages.map(p => p + boostPerPlayer);
        } else {
            finalPercentages = assignablePercentages;
        }
    }

    sortedRegs.forEach((reg, index) => {
        const rank = index + 1;
        let prize = 0;
        if (index < finalPercentages.length) {
            prize = totalPrizePool * (finalPercentages[index] / 100);
        }
        DataService.updateRegistrationResult(reg.id, rank, prize);
    });

    const updatedTournament = { ...tournament, status: 'Completed' as const };
    DataService.saveTournament(updatedTournament);
    
    refreshData();
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

  return (
    <div className="flex flex-col h-full bg-brand-black animate-in fade-in duration-300">
      
      {/* Header Bar */}
      <div className="flex items-center gap-4 mb-6">
          <button 
             onClick={onBack}
             className="w-10 h-10 rounded-full bg-[#1A1A1A] flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#333] transition-colors border border-[#333]"
          >
              <ArrowLeft size={20} />
          </button>
          
          <div className="flex-1">
              <h1 className="text-3xl font-bold text-white leading-tight">{tournament.name}</h1>
              <div className="flex items-center gap-6 text-sm text-gray-400 mt-1">
                  <span className="flex items-center gap-1.5" title="Start Date">
                    <Clock size={16} className="text-gray-500"/>
                    {new Date(tournament.startDate || '').toLocaleDateString()}
                  </span>

                  <span className="flex items-center gap-1.5" title="Buy-in + Fee">
                    <Ticket size={16} className="text-gray-500"/>
                    ${tournament.buyIn} + ${tournament.fee}
                  </span>

                  <span className="flex items-center gap-1.5" title="Max Buy-ins">
                    <Repeat size={16} className="text-gray-500"/>
                     {tournament.rebuyLimit === 0 ? 'Freezeout' : `Max ${maxAllowedBuyIns} Buy-ins`}
                  </span>

                  <span className="flex items-center gap-1.5" title="Registered / Cap">
                    <User size={16} className="text-gray-500"/>
                    {registrations.filter(r => r.status !== 'Cancelled').length} / {tournament.maxPlayers}
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
                    <span className="flex items-center gap-1.5 text-red-400 font-bold bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20 ml-2">
                        <Lock size={12} />
                        {tournament.status}
                    </span>
                  )}
              </div>
          </div>
      </div>

      {/* Main Content Card */}
      <div className={`${THEME.card} border ${THEME.border} rounded-3xl overflow-hidden flex flex-col flex-1 shadow-xl relative`}>
            
            {/* Processing Overlay */}
            {isProcessing && (
                <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white animate-in fade-in duration-300">
                    <Loader2 size={48} className="animate-spin text-brand-green mb-4" />
                    <h3 className="text-2xl font-bold mb-2">Calculating Results...</h3>
                    <p className="text-gray-400">Verifying chip counts and allocating prizes</p>
                </div>
            )}

            {/* Controls */}
            <div className="p-6 border-b border-[#222] flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input 
                      type="text"
                      placeholder="Search registered players..."
                      value={registrationSearch}
                      onChange={(e) => setRegistrationSearch(e.target.value)}
                      className={`w-full ${THEME.input} rounded-xl pl-11 pr-4 py-3 outline-none transition-all focus:ring-1 focus:ring-brand-green`}
                    />
                </div>

                {!isTournamentLocked && (
                    <button 
                      onClick={() => setIsAddPlayerOpen(true)}
                      className={`${THEME.buttonPrimary} px-6 rounded-xl flex items-center gap-2 font-bold shadow-lg shadow-green-500/10 shrink-0 transition-transform active:scale-95`}
                    >
                      <Plus size={18} />
                      <span>Add Player</span>
                    </button>
                )}
            </div>

            {/* Table Container */}
            <div className="flex-1 overflow-auto relative">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                    <thead className="sticky top-0 bg-[#171717] z-10 shadow-sm">
                      <tr className="text-xs uppercase text-gray-500 font-bold tracking-wider">
                        <th className="px-6 py-4 w-[25%]">Player</th>
                        <th className="px-6 py-4 w-[10%]">Status</th>
                        <th className="px-6 py-4 w-[20%]">Table / Seat</th>
                        <th className="px-6 py-4 text-center w-[10%]">Buy-ins</th>
                        <th className="px-6 py-4 text-right w-[10%]">Chips In/Out</th>
                        {isTournamentLocked && (
                             <th className="px-6 py-4 text-right text-brand-green w-[10%]">Winnings</th>
                        )}
                        <th className="px-6 py-4 text-right w-[15%]">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#262626]">
                      {enrichedRegistrations.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-20 text-center text-gray-500">
                            {registrationSearch ? 'No matching players found.' : 'No players registered yet.'}
                          </td>
                        </tr>
                      ) : (
                        enrichedRegistrations.map((reg) => (
                          <tr key={reg.id} className="group hover:bg-[#222] transition-colors">
                            {/* Player Column */}
                            <td className="px-6 py-4 pr-2 max-w-[200px]">
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
                                <div className="min-w-0 flex-1">
                                  <div className="font-bold text-white truncate" title={reg.member?.fullName || 'Unknown Member'}>{reg.member?.fullName || 'Unknown Member'}</div>
                                  <div className="text-xs text-gray-500">{reg.member?.tier} Member</div>
                                </div>
                              </div>
                            </td>

                            {/* Status Column */}
                            <td className="px-6 py-4">
                              <span className={`inline-flex px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(reg.status)}`}>
                                {reg.status}
                              </span>
                            </td>

                            {/* Table / Seat Column */}
                            <td className="px-6 py-4">
                                {(reg.status === 'Approved' || reg.status === 'Joined') ? (
                                    <div className="flex items-center gap-2">
                                        <select 
                                            value={reg.tableId || ''}
                                            onChange={(e) => handleSeatChange(reg.id, e.target.value, reg.seatNumber || 1)}
                                            className="bg-[#111] border border-[#333] rounded px-2 py-1.5 text-xs text-white outline-none focus:border-brand-green w-full min-w-0"
                                            disabled={isTournamentLocked}
                                        >
                                            <option value="" disabled>Table</option>
                                            {tables.map(t => (
                                                <option key={t.id} value={t.id}>{t.name}</option>
                                            ))}
                                        </select>
                                        
                                        <select 
                                            value={reg.seatNumber || ''}
                                            onChange={(e) => handleSeatChange(reg.id, reg.tableId || '', parseInt(e.target.value))}
                                            className="bg-[#111] border border-[#333] rounded px-2 py-1.5 text-xs text-white outline-none focus:border-brand-green w-[50px] shrink-0"
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

                            {/* Buy-ins Column (Reduced) */}
                            <td className="px-6 py-4 text-center">
                                <span className={`font-mono font-bold ${reg.buyInCount > 0 ? 'text-white' : 'text-gray-500'}`}>
                                    {reg.buyInCount}
                                </span>
                            </td>

                            {/* Chips Column (In / Out) */}
                            <td className="px-6 py-4 text-right">
                                <div className="flex flex-col items-end gap-1">
                                   <div className="text-xs text-gray-500 uppercase tracking-wide">
                                       In: <span className="text-gray-300 font-mono">{(reg.buyInCount * tournament.startingChips).toLocaleString()}</span>
                                   </div>
                                   <div className="flex items-center justify-end gap-2">
                                       <span className="text-xs text-gray-500 uppercase tracking-wide">Final:</span>
                                       <input 
                                            type="number" 
                                            min="0"
                                            value={reg.finalChipCount === 0 && document.activeElement !== document.getElementById(`chips-${reg.id}`) ? '' : reg.finalChipCount}
                                            onChange={(e) => handleChipChange(reg.id, parseInt(e.target.value) || 0)}
                                            placeholder="0"
                                            disabled={isTournamentLocked}
                                            id={`chips-${reg.id}`}
                                            className={`w-20 bg-[#111] border rounded px-2 py-1 text-right text-white text-sm outline-none transition-colors placeholder:text-gray-700 font-mono ${
                                            isTournamentLocked 
                                            ? 'border-[#333] opacity-50 cursor-not-allowed' 
                                            : 'border-[#333] focus:border-brand-green focus:bg-[#1A1A1A]'
                                            }`}
                                        />
                                   </div>
                                </div>
                             </td>

                            {/* Winnings Column */}
                            {isTournamentLocked && (
                                <td className="px-6 py-4 text-right">
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
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-2">
                                {/* Manage Payment Button */}
                                <button 
                                    onClick={() => setPaymentModalReg(reg)}
                                    className={`p-2 rounded-full transition-colors ${
                                        reg.buyInCount === 0 
                                        ? 'bg-brand-green/20 text-brand-green hover:bg-brand-green hover:text-black animate-pulse'
                                        : 'text-gray-500 hover:text-white hover:bg-[#333]'
                                    }`}
                                    title="Manage Buy-ins & Payments"
                                >
                                    <Coins size={16} />
                                </button>

                                {!isTournamentLocked && (
                                    <>
                                        {reg.status === 'Registered' && (
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

             {/* Reconciliation Footer */}
             {isInProgress && (
                <div className="bg-[#111] border-t border-[#333] p-4 flex justify-between items-center animate-in slide-in-from-bottom-2 gap-6">
                    <div className="flex items-center gap-4 flex-1">
                        <div className="bg-[#1A1A1A] px-3 py-2 rounded-lg border border-[#333]">
                            <span className="text-gray-500 block text-[10px] font-bold uppercase mb-0.5">Total Chips In Play</span>
                            <span className="text-white font-mono font-medium text-lg">{totalChipsInPlay.toLocaleString()}</span>
                        </div>
                        <div className="bg-[#1A1A1A] px-3 py-2 rounded-lg border border-[#333]">
                            <span className="text-gray-500 block text-[10px] font-bold uppercase mb-0.5">Total Chips Counted</span>
                             <span className={`font-mono font-medium text-lg ${isChipsBalanced ? 'text-brand-green' : 'text-red-400'}`}>
                                {totalChipsCounted.toLocaleString()}
                            </span>
                        </div>
                        {chipDifference !== 0 && (
                             <div className="flex items-center gap-3 text-red-400 bg-red-950/20 px-4 rounded-lg border border-red-500/20">
                                <AlertTriangle size={20} />
                                <div>
                                    <span className="block text-[10px] font-bold uppercase opacity-80">Discrepancy Detected</span>
                                    <span className="font-mono font-bold text-sm">
                                        {chipDifference > 0 ? 'Missing ' : 'Excess '}{Math.abs(chipDifference).toLocaleString()} chips
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <button 
                        onClick={handleConfirmCompletion}
                        disabled={!isChipsBalanced || isProcessing}
                        className={`px-6 py-3 rounded-xl font-bold flex items-center gap-3 shadow-lg transition-all active:scale-95 text-sm shrink-0 ${
                            !isChipsBalanced || isProcessing
                            ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-[#333]'
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

      <AddPlayerModal 
        isOpen={isAddPlayerOpen}
        onClose={() => setIsAddPlayerOpen(false)}
        onAdd={handleAddMember}
        existingMemberIds={new Set(registrations.map(r => r.memberId))}
      />

      <BuyinMgmtModal 
        isOpen={!!paymentModalReg}
        onClose={() => setPaymentModalReg(null)}
        registration={paymentModalReg}
        tournament={tournament}
        onSave={handleTransactionsSave}
      />
    </div>
  );
};

export default TournamentParticipantsView;