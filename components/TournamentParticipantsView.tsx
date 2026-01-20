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
  Users,
  DollarSign,
  Coins,
  Minus,
  Banknote,
  Lock,
  Trophy,
  AlertTriangle,
  Loader2,
  Armchair,
  Save,
  CreditCard,
  Ticket,
  Percent,
  Calculator
} from 'lucide-react';
import { Tournament, TournamentRegistration, Member, RegistrationStatus, PokerTable, TournamentTransaction } from '../types';
import * as DataService from '../services/dataService';
import { THEME } from '../theme';
import { Modal } from './Modal';

// --- Internal Component: Add Player Picker (Modal) ---

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

// --- Internal Component: Payment Details Modal (Table View) ---

interface EnrichedRegistration extends TournamentRegistration {
    member?: Member;
    assignedTable?: PokerTable;
    netPayable?: number;
    totalDepositPaid?: number;
}

interface PaymentDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    registration: EnrichedRegistration | null;
    tournament: Tournament | null;
    onSave: (regId: string, transactions: TournamentTransaction[]) => void;
}

const PaymentDetailsModal: React.FC<PaymentDetailsModalProps> = ({ isOpen, onClose, registration, tournament, onSave }) => {
    const [transactions, setTransactions] = useState<TournamentTransaction[]>([]);

    useEffect(() => {
        if (isOpen && registration) {
            // Load transactions or create defaults if missing (migration)
            const txs = registration.transactions && registration.transactions.length > 0 
                ? [...registration.transactions] 
                : [];
            
            // Fixup: Ensure transactions array length matches buyInCount
            // In a real scenario DataService.updateRegistrationBuyIn handles this, but for viewing safety:
            if (txs.length !== registration.buyInCount) {
               // If there is a mismatch (e.g. data loaded before sync), we just display what we have or pad it. 
               // For now assume DataService sync is correct.
            }
            
            setTransactions(txs);
        }
    }, [isOpen, registration]);

    if (!registration || !tournament) return null;

    const baseCost = tournament.buyIn + tournament.fee;

    const handleTransactionChange = (index: number, field: keyof TournamentTransaction, value: number) => {
        const updated = [...transactions];
        updated[index] = { ...updated[index], [field]: value };
        setTransactions(updated);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(registration.id, transactions);
        onClose();
    };

    const calculateRowNet = (tx: TournamentTransaction) => {
        const totalDiscount = (tx.rebuyDiscount || 0) + (tx.membershipDiscount || 0) + (tx.voucherDiscount || 0) + (tx.campaignDiscount || 0);
        return Math.max(0, baseCost - totalDiscount);
    };

    const calculateRowCash = (tx: TournamentTransaction) => {
        const net = calculateRowNet(tx);
        return Math.max(0, net - (tx.depositPaid || 0));
    };

    // Summaries
    const totalNetPayable = transactions.reduce((sum, tx) => sum + calculateRowNet(tx), 0);
    const totalDepositPaid = transactions.reduce((sum, tx) => sum + (tx.depositPaid || 0), 0);
    const totalCashOutstanding = transactions.reduce((sum, tx) => sum + calculateRowCash(tx), 0);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`${registration.member?.fullName || 'Player'} - Payment Breakdown`}
            size="4xl"
            zIndex={70}
        >
            <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden h-[80vh]">
                <div className="flex-1 overflow-x-auto overflow-y-auto bg-[#111]">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead className="sticky top-0 bg-[#1A1A1A] z-10 shadow-sm text-xs font-bold text-gray-500 uppercase tracking-wider">
                            <tr>
                                <th className="px-4 py-3 border-b border-[#333]">#</th>
                                <th className="px-4 py-3 border-b border-[#333]">Type</th>
                                <th className="px-4 py-3 border-b border-[#333] text-right">Base Cost</th>
                                <th className="px-2 py-3 border-b border-[#333] text-right text-orange-400">Re-buy Disc</th>
                                <th className="px-2 py-3 border-b border-[#333] text-right text-blue-400">Mem Disc</th>
                                <th className="px-2 py-3 border-b border-[#333] text-right text-purple-400">Voucher</th>
                                <th className="px-2 py-3 border-b border-[#333] text-right text-yellow-400">Campaign</th>
                                <th className="px-2 py-3 border-b border-[#333] text-right text-brand-green">Deposit Pay</th>
                                <th className="px-4 py-3 border-b border-[#333] text-right text-white">Net Payable</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#262626]">
                            {transactions.length === 0 ? (
                                <tr><td colSpan={9} className="p-8 text-center text-gray-500">No buy-ins recorded yet.</td></tr>
                            ) : (
                                transactions.map((tx, idx) => {
                                    const net = calculateRowNet(tx);
                                    return (
                                        <tr key={tx.id} className="hover:bg-[#1A1A1A] transition-colors">
                                            <td className="px-4 py-3 text-gray-500 font-mono text-xs">{idx + 1}</td>
                                            <td className="px-4 py-3">
                                                <span className={`text-xs font-bold uppercase px-2 py-1 rounded border ${
                                                    tx.type === 'BuyIn' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 'bg-orange-500/10 text-orange-500 border-orange-500/20'
                                                }`}>
                                                    {tx.type}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right text-gray-300 font-mono text-sm">
                                                ${baseCost.toLocaleString()}
                                            </td>
                                            
                                            {/* Inputs */}
                                            {['rebuyDiscount', 'membershipDiscount', 'voucherDiscount', 'campaignDiscount', 'depositPaid'].map((field) => (
                                                <td key={field} className="px-2 py-3">
                                                    <input 
                                                        type="number"
                                                        min="0"
                                                        value={(tx as any)[field]}
                                                        onChange={(e) => handleTransactionChange(idx, field as keyof TournamentTransaction, parseFloat(e.target.value) || 0)}
                                                        className="w-20 bg-[#222] border border-[#333] rounded px-2 py-1 text-right text-sm text-white outline-none focus:border-brand-green focus:bg-[#111] transition-colors"
                                                        onFocus={e => e.target.select()}
                                                    />
                                                </td>
                                            ))}

                                            <td className="px-4 py-3 text-right">
                                                <div className="font-bold text-white font-mono">${net.toLocaleString()}</div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-6 border-t border-[#222] bg-[#171717] flex justify-between items-center shrink-0">
                    <div className="flex gap-8">
                        <div>
                            <span className="text-gray-500 text-xs font-bold uppercase block mb-1">Total Net Payable</span>
                            <span className="text-xl font-bold text-white font-mono">${totalNetPayable.toLocaleString()}</span>
                        </div>
                        <div>
                            <span className="text-gray-500 text-xs font-bold uppercase block mb-1">Total Deposit Paid</span>
                            <span className="text-xl font-bold text-brand-green font-mono">${totalDepositPaid.toLocaleString()}</span>
                        </div>
                        <div className="pl-8 border-l border-[#333]">
                            <span className="text-gray-500 text-xs font-bold uppercase block mb-1">Outstanding (Cash)</span>
                            <span className="text-2xl font-bold text-white font-mono">${totalCashOutstanding.toLocaleString()}</span>
                        </div>
                    </div>
                    <button 
                        type="submit"
                        className={`px-8 py-3 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 ${THEME.buttonPrimary}`}
                    >
                        <Save size={20} />
                        Save Changes
                    </button>
                </div>
            </form>
        </Modal>
    );
};


// --- Main Page Component ---

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

  const handleBuyInChange = (regId: string, newCount: number) => {
    if (!tournament) return;
    if (newCount < 0) return;
    const maxBuyIns = 1 + tournament.rebuyLimit;
    if (newCount > maxBuyIns) return; 

    DataService.updateRegistrationBuyIn(regId, newCount);
    setRegistrations(DataService.getTournamentRegistrations(tournament.id));
  };
  
  const handleChipChange = (regId: string, chips: number) => {
      if (!tournament) return;
      DataService.updateRegistrationChips(regId, chips);
      setRegistrations(DataService.getTournamentRegistrations(tournament.id));
  };

  const handleTransactionsSave = (regId: string, transactions: TournamentTransaction[]) => {
      DataService.updateRegistrationTransactions(regId, transactions);
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
          // Fallback logic if needed (legacy), though dataService.addRegistration creates empty array now
          // and buyIn change creates default transactions.
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
                  <span className="flex items-center gap-1.5">
                    <Clock size={16} className="text-gray-500"/>
                    {new Date(tournament.startDate || '').toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <User size={16} className="text-gray-500"/>
                    {registrations.filter(r => r.status !== 'Cancelled').length} / {tournament.maxPlayers} Players
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
                <table className="w-full text-left border-collapse min-w-[1300px]">
                    <thead className="sticky top-0 bg-[#171717] z-10 shadow-sm">
                      <tr className="text-xs uppercase text-gray-500 font-bold tracking-wider">
                        <th className="px-6 py-4 w-[20%]">Player</th>
                        <th className="px-6 py-4 w-[10%]">Status</th>
                        <th className="px-6 py-4 w-[15%]">Table / Seat</th>
                        <th className="px-6 py-4 text-center w-[10%]">Buy-ins</th>
                        <th className="px-6 py-4 text-right w-[15%]">Net Payable</th>
                        <th className="px-6 py-4 text-right w-[15%]">Chips In/Out</th>
                        {isTournamentLocked && (
                             <th className="px-6 py-4 text-right text-brand-green w-[10%]">Winnings</th>
                        )}
                        <th className="px-6 py-4 text-right w-[5%]"></th>
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
                        enrichedRegistrations.map((reg) => (
                          <tr key={reg.id} className="group hover:bg-[#222] transition-colors">
                            {/* Player Column */}
                            <td className="px-6 py-4 truncate pr-2">
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
                                            className="bg-[#111] border border-[#333] rounded px-2 py-1.5 text-xs text-white outline-none focus:border-brand-green w-[70px] shrink-0"
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
                            <td className="px-6 py-4">
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

                             {/* Net Payable Column (New) */}
                             <td className="px-6 py-4 text-right">
                                <button 
                                    onClick={() => setPaymentModalReg(reg)}
                                    className="font-mono font-bold text-white hover:text-brand-green hover:underline decoration-brand-green decoration-2 underline-offset-4 transition-all"
                                    title="Edit Payment Details"
                                >
                                    ${reg.netPayable.toLocaleString()}
                                </button>
                                <div className="text-[10px] text-gray-500">
                                    Paid: ${reg.totalDepositPaid ? reg.totalDepositPaid.toLocaleString() : '0'}
                                </div>
                            </td>

                            {/* Chips Column */}
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
                                            className={`w-24 bg-[#111] border rounded px-2 py-1 text-right text-white text-sm outline-none transition-colors placeholder:text-gray-700 font-mono ${
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

      <PaymentDetailsModal 
        isOpen={!!paymentModalReg}
        onClose={() => setPaymentModalReg(null)}
        registration={paymentModalReg}
        tournament={tournament}
        onSave={handleTransactionsSave}
      />
    </div>
  );
};

// Helper Icons
const UserPlusIcon = ({ size, className }: { size: number, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="8.5" cy="7" r="4"></circle>
    <line x1="20" y1="8" x2="20" y2="14"></line>
    <line x1="23" y1="11" x2="17" y2="11"></line>
  </svg>
);

const WalletIcon = ({ size, className }: { size: number, className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
      <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
      <path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z" />
    </svg>
);

const MegaphoneIcon = ({ size, className }: { size: number, className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m3 11 18-5v12L3 14v-3z" />
      <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
    </svg>
);

export default TournamentParticipantsView;