
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Plus,
  Loader2,
  X
} from 'lucide-react';
import { Tournament, TournamentRegistration, Member, RegistrationStatus, PokerTable, TournamentTransaction } from '../types';
import * as DataService from '../services/dataService';
import { THEME } from '../theme';
import { BuyinMgmtModal, EnrichedRegistration } from './BuyinMgmtModal';
import AddPlayerModal from './AddPlayerModal';
import { useLanguage } from '../contexts/LanguageContext';
import TournamentStatsFooter from './tournament/TournamentStatsFooter';
import TournamentPlayerList from './tournament/TournamentPlayerList';

interface TournamentDetailPanelProps {
  tournament: Tournament;
  onUpdate: () => void; // Callback to refresh parent list
  onClose: () => void;
}

const TournamentDetailPanel: React.FC<TournamentDetailPanelProps> = ({ tournament, onUpdate, onClose }) => {
  const { t } = useLanguage();
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
  }, [tournament.id]);

  const refreshData = () => {
    // We re-fetch tournament specific data, but we use the prop for the tournament itself
    // to avoid prop drilling sync issues, although for actions we re-read data service usually.
    setRegistrations(DataService.getTournamentRegistrations(tournament.id));
    setMembers(DataService.getMembers());
    
    const allTables = DataService.getTables();
    const relevantTables = (tournament.tableIds && tournament.tableIds.length > 0)
        ? allTables.filter(table => tournament.tableIds?.includes(table.id))
        : allTables.filter(table => table.status === 'Active');
    setTables(relevantTables);
  };

  const handleAddMember = (memberId: string) => {
    DataService.addRegistration(tournament.id, memberId);
    refreshData();
    onUpdate();
  };

  const handleStatusChange = (regId: string, status: RegistrationStatus) => {
    DataService.updateRegistrationStatus(regId, status);
    refreshData();
    onUpdate();
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
      refreshData();
  };
  
  const handleChipChange = (regId: string, chips: number) => {
      DataService.updateRegistrationChips(regId, chips);
      refreshData();
  };

  const handleTransactionsSave = (regId: string, transactions: TournamentTransaction[]) => {
      DataService.updateRegistrationTransactions(regId, transactions);
      const buyInCount = transactions.length;
      DataService.updateRegistrationBuyIn(regId, buyInCount);
      refreshData();
      onUpdate();
  };

  const handleDelete = (regId: string) => {
      if(window.confirm('Are you sure you want to remove this player from the tournament?')) {
          DataService.deleteRegistration(regId);
          refreshData();
          onUpdate();
      }
  };

  const enrichedRegistrations = useMemo(() => {
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

    if (!registrationSearch) return all;
    return all.filter(r => 
      r.member?.fullName.toLowerCase().includes(registrationSearch.toLowerCase()) || 
      r.member?.email.toLowerCase().includes(registrationSearch.toLowerCase())
    );
  }, [registrations, members, tables, registrationSearch, tournament]);

  const totalBuyIns = enrichedRegistrations.reduce((sum, reg) => sum + reg.buyInCount, 0);
  const totalPrizePool = totalBuyIns * tournament.buyIn;
  const totalFees = totalBuyIns * tournament.fee;
  
  // --- Chip Reconciliation Logic ---
  const totalChipsInPlay = totalBuyIns * tournament.startingChips;
  const totalChipsCounted = enrichedRegistrations.reduce((sum, reg) => sum + (reg.finalChipCount || 0), 0);
  const chipDifference = totalChipsInPlay - totalChipsCounted;
  const isChipsBalanced = chipDifference === 0;

  const isTournamentLocked = ['Completed', 'Cancelled'].includes(tournament.status || '');
  const isInProgress = tournament.status === 'In Progress';

  const handleConfirmCompletion = async () => {
    if (!isChipsBalanced) return;

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
    onUpdate();
    setIsProcessing(false);
  };

  return (
    <div className="bg-[#111] rounded-b-3xl border-x border-b border-[#333] shadow-inner animate-in slide-in-from-top-4 duration-300 relative">
      
      {/* Condensed Header: Search, Add Player, Close */}
      <div className="flex items-center gap-4 p-4 border-b border-[#222] bg-[#151515]">
          <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input 
                type="text"
                placeholder={t('tournaments.detail.searchPlayers')}
                value={registrationSearch}
                onChange={(e) => setRegistrationSearch(e.target.value)}
                className={`w-full ${THEME.input} rounded-xl pl-10 pr-4 py-2 text-sm outline-none transition-all focus:ring-1 focus:ring-brand-green bg-[#1A1A1A]`}
              />
          </div>

          {!isTournamentLocked && (
              <button 
                onClick={() => setIsAddPlayerOpen(true)}
                className={`bg-[#222] hover:bg-[#2A2A2A] text-brand-green border border-brand-green/20 hover:border-brand-green/50 px-4 py-2 rounded-xl flex items-center gap-2 font-bold text-sm transition-all whitespace-nowrap`}
              >
                <Plus size={16} />
                <span>{t('tournaments.detail.addPlayer')}</span>
              </button>
          )}

          <div className="h-8 w-px bg-[#333] mx-2"></div>

          <button onClick={onClose} className="p-2 text-gray-500 hover:text-white rounded-full hover:bg-[#222] transition-colors">
              <X size={20} />
          </button>
      </div>

      {/* Processing Overlay */}
      {isProcessing && (
          <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white rounded-b-3xl">
              <Loader2 size={48} className="animate-spin text-brand-green mb-4" />
              <h3 className="text-2xl font-bold mb-2">{t('tournaments.detail.calculating')}</h3>
              <p className="text-gray-400">{t('tournaments.detail.verifying')}</p>
          </div>
      )}

      {/* Table Component */}
      <TournamentPlayerList 
        registrations={enrichedRegistrations}
        tables={tables}
        occupiedSeatsByTable={occupiedSeatsByTable}
        startingChips={tournament.startingChips}
        isLocked={isTournamentLocked}
        searchQuery={registrationSearch}
        onSeatChange={handleSeatChange}
        onStatusChange={handleStatusChange}
        onChipChange={handleChipChange}
        onPaymentClick={setPaymentModalReg}
        onDelete={handleDelete}
      />

       {/* Footer Component */}
       <TournamentStatsFooter 
          totalPrizePool={totalPrizePool}
          totalFees={totalFees}
          totalChipsInPlay={totalChipsInPlay}
          totalChipsCounted={totalChipsCounted}
          chipDifference={chipDifference}
          isChipsBalanced={isChipsBalanced}
          isInProgress={isInProgress}
          isProcessing={isProcessing}
          onComplete={handleConfirmCompletion}
       />

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

export default TournamentDetailPanel;
