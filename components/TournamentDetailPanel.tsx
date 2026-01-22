
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  CheckCircle2, 
  Trash2, 
  PlayCircle,
  User,
  Plus,
  Coins,
  Banknote,
  Lock,
  Trophy,
  AlertTriangle,
  Loader2,
  Ticket,
  Repeat,
  MoreVertical,
  X
} from 'lucide-react';
import { Tournament, TournamentRegistration, Member, RegistrationStatus, PokerTable, TournamentTransaction } from '../types';
import * as DataService from '../services/dataService';
import { THEME } from '../theme';
import { BuyinMgmtModal, EnrichedRegistration } from './BuyinMgmtModal';
import AddPlayerModal from './AddPlayerModal';
import { useLanguage } from '../contexts/LanguageContext';

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

  const getStatusBadge = (status: RegistrationStatus) => {
    switch (status) {
      case 'Reserved': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'Joined': return 'bg-brand-green/10 text-brand-green border-brand-green/20';
      case 'Cancelled': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  return (
    <div className="bg-[#111] rounded-b-3xl border-x border-b border-[#333] shadow-inner animate-in slide-in-from-top-4 duration-300 relative">
      
      {/* Detail Metrics Header */}
      <div className="flex flex-wrap items-center gap-6 p-6 border-b border-[#222] bg-[#151515]">
          <div className="flex items-center gap-2" title="Buy-in + Fee">
            <div className="p-2 rounded-lg bg-[#222] text-gray-400">
                <Ticket size={16}/>
            </div>
            <div>
                <div className="text-[10px] text-gray-500 font-bold uppercase">{t('tournaments.detail.buyIn')}</div>
                <div className="text-sm font-medium text-white">${tournament.buyIn} <span className="text-gray-500 text-xs">+ ${tournament.fee}</span></div>
            </div>
          </div>

          <div className="flex items-center gap-2" title="Max Buy-ins">
            <div className="p-2 rounded-lg bg-[#222] text-gray-400">
                <Repeat size={16}/>
            </div>
            <div>
                <div className="text-[10px] text-gray-500 font-bold uppercase">{t('tournaments.detail.rebuys')}</div>
                <div className="text-sm font-medium text-white">{tournament.rebuyLimit === 0 ? 'Freezeout' : `Max ${tournament.rebuyLimit + 1}`}</div>
            </div>
          </div>

          <div className="h-8 w-px bg-[#333]"></div>

          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-brand-green/10 text-brand-green">
                <Coins size={16} />
            </div>
            <div>
                <div className="text-[10px] text-gray-500 font-bold uppercase">{t('tournaments.detail.prizePool')}</div>
                <div className="text-base font-bold text-white">${totalPrizePool.toLocaleString()}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-[#222] text-gray-400">
                <Banknote size={16} />
            </div>
            <div>
                <div className="text-[10px] text-gray-500 font-bold uppercase">{t('tournaments.detail.houseFees')}</div>
                <div className="text-sm font-medium text-gray-300">${totalFees.toLocaleString()}</div>
            </div>
          </div>

          <div className="ml-auto">
              <button onClick={onClose} className="p-2 text-gray-500 hover:text-white rounded-full hover:bg-[#222]">
                  <X size={20} />
              </button>
          </div>
      </div>

      {/* Processing Overlay */}
      {isProcessing && (
          <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white rounded-b-3xl">
              <Loader2 size={48} className="animate-spin text-brand-green mb-4" />
              <h3 className="text-2xl font-bold mb-2">Calculating Results...</h3>
              <p className="text-gray-400">Verifying chip counts and allocating prizes</p>
          </div>
      )}

      {/* Controls */}
      <div className="p-4 border-b border-[#222] flex gap-4 bg-[#111]">
          <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input 
                type="text"
                placeholder={t('common.search')}
                value={registrationSearch}
                onChange={(e) => setRegistrationSearch(e.target.value)}
                className={`w-full ${THEME.input} rounded-xl pl-10 pr-4 py-2 text-sm outline-none transition-all focus:ring-1 focus:ring-brand-green bg-[#1A1A1A]`}
              />
          </div>

          {!isTournamentLocked && (
              <button 
                onClick={() => setIsAddPlayerOpen(true)}
                className={`bg-[#222] hover:bg-[#2A2A2A] text-brand-green border border-brand-green/20 hover:border-brand-green/50 px-4 py-2 rounded-xl flex items-center gap-2 font-bold text-sm transition-all`}
              >
                <Plus size={16} />
                <span>Add Player</span>
              </button>
          )}
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left border-collapse">
              <thead className="bg-[#151515] text-[10px] uppercase text-gray-500 font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-3 w-[25%]">{t('tournaments.detail.table.player')}</th>
                  <th className="px-6 py-3 w-[10%]">{t('tournaments.detail.table.status')}</th>
                  <th className="px-6 py-3 w-[20%]">{t('tournaments.detail.table.seat')}</th>
                  <th className="px-6 py-3 text-center w-[10%]">{t('tournaments.detail.table.entries')}</th>
                  <th className="px-6 py-3 text-right w-[15%]">{t('tournaments.detail.table.chips')}</th>
                  {isTournamentLocked && (
                       <th className="px-6 py-3 text-right text-brand-green w-[10%]">{t('tournaments.detail.table.winnings')}</th>
                  )}
                  <th className="px-6 py-3 text-right w-[10%]">{t('tournaments.detail.table.manage')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222]">
                {enrichedRegistrations.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-600 text-sm">
                      {registrationSearch ? 'No matching players found.' : 'No players registered yet.'}
                    </td>
                  </tr>
                ) : (
                  enrichedRegistrations.map((reg) => (
                    <tr key={reg.id} className="group hover:bg-[#1A1A1A] transition-colors">
                      {/* Player Column */}
                      <td className="px-6 py-3 pr-2">
                        <div className="flex items-center gap-3">
                          {isTournamentLocked && reg.rank && (
                              <div className={`w-5 h-5 shrink-0 rounded-full flex items-center justify-center text-[10px] font-bold mr-1 ${
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
                            className="w-8 h-8 rounded-full object-cover bg-gray-800 shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-white text-sm truncate">{reg.member?.fullName || 'Unknown'}</div>
                            <div className="text-[10px] text-gray-500">{reg.member?.club_id}</div>
                          </div>
                        </div>
                      </td>

                      {/* Status Column */}
                      <td className="px-6 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(reg.status)}`}>
                          {reg.status}
                        </span>
                      </td>

                      {/* Table / Seat Column */}
                      <td className="px-6 py-3">
                          {(reg.status === 'Joined') ? (
                              <div className="flex items-center gap-2">
                                  <select 
                                      value={reg.tableId || ''}
                                      onChange={(e) => handleSeatChange(reg.id, e.target.value, reg.seatNumber || 1)}
                                      className="bg-[#222] border border-[#333] rounded px-2 py-1 text-xs text-gray-300 outline-none focus:border-brand-green w-full min-w-0"
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
                                      className="bg-[#222] border border-[#333] rounded px-2 py-1 text-xs text-gray-300 outline-none focus:border-brand-green w-[50px] shrink-0"
                                      disabled={!reg.tableId || isTournamentLocked}
                                  >
                                      <option value="" disabled>Seat</option>
                                      {reg.assignedTable && Array.from({ length: reg.assignedTable.capacity }, (_, i) => i + 1).map(num => {
                                          const isTaken = occupiedSeatsByTable.get(reg.tableId!)?.has(num) && reg.seatNumber !== num;
                                          return (
                                              <option key={num} value={num} disabled={isTaken}>
                                                  {num} {isTaken ? '(x)' : ''}
                                              </option>
                                          );
                                      })}
                                  </select>
                              </div>
                          ) : (
                              <span className="text-gray-600 text-xs italic">
                                  {reg.status === 'Reserved' ? 'On Waitlist' : '---'}
                              </span>
                          )}
                      </td>

                      {/* Entries Column */}
                      <td className="px-6 py-3 text-center">
                          <span className={`font-mono font-bold text-sm ${reg.buyInCount > 0 ? 'text-white' : 'text-gray-600'}`}>
                              {reg.buyInCount}
                          </span>
                      </td>

                      {/* Chips Column */}
                      <td className="px-6 py-3 text-right">
                          <div className="flex flex-col items-end gap-1">
                             <div className="text-[10px] text-gray-500 uppercase">
                                 In: <span className="text-gray-400 font-mono">{(reg.buyInCount * tournament.startingChips).toLocaleString()}</span>
                             </div>
                             <div className="flex items-center justify-end gap-2">
                                 <input 
                                      type="number" 
                                      min="0"
                                      value={reg.finalChipCount === 0 && document.activeElement !== document.getElementById(`chips-${reg.id}`) ? '' : reg.finalChipCount}
                                      onChange={(e) => handleChipChange(reg.id, parseInt(e.target.value) || 0)}
                                      placeholder="Final"
                                      disabled={isTournamentLocked}
                                      id={`chips-${reg.id}`}
                                      className={`w-20 bg-[#151515] border rounded px-2 py-1 text-right text-white text-xs outline-none transition-colors placeholder:text-gray-700 font-mono ${
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
                          <td className="px-6 py-3 text-right">
                              {reg.prize && reg.prize > 0 ? (
                                  <span className="font-bold text-brand-green flex items-center justify-end gap-1 text-sm">
                                      <Trophy size={12} />
                                      ${reg.prize.toLocaleString()}
                                  </span>
                              ) : (
                                  <span className="text-gray-700 text-sm">-</span>
                              )}
                          </td>
                      )}

                      {/* Actions Column */}
                      <td className="px-6 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          {/* Payment Button */}
                          <button 
                              onClick={() => setPaymentModalReg(reg)}
                              className={`p-1.5 rounded-lg transition-colors ${
                                  reg.buyInCount === 0 
                                  ? 'bg-brand-green/20 text-brand-green hover:bg-brand-green hover:text-black animate-pulse'
                                  : 'text-gray-500 hover:text-white hover:bg-[#333]'
                              }`}
                              title="Payments"
                          >
                              <Coins size={16} />
                          </button>

                          {!isTournamentLocked && (
                              <>
                                  {reg.status === 'Reserved' && (
                                  <button 
                                      onClick={() => handleStatusChange(reg.id, 'Joined')}
                                      className="p-1.5 bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white rounded-lg transition-colors"
                                      title="Seat Player"
                                  >
                                      <PlayCircle size={16} />
                                  </button>
                                  )}
                                  <button 
                                      onClick={() => handleDelete(reg.id)}
                                      className="p-1.5 text-gray-600 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors"
                                      title="Remove"
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
          <div className="bg-[#151515] border-t border-[#333] p-4 flex justify-between items-center rounded-b-3xl">
              <div className="flex items-center gap-4 flex-1">
                  <div className="bg-[#222] px-3 py-2 rounded-lg border border-[#333]">
                      <span className="text-gray-500 block text-[10px] font-bold uppercase mb-0.5">{t('tournaments.detail.chipsInPlay')}</span>
                      <span className="text-white font-mono font-medium text-sm">{totalChipsInPlay.toLocaleString()}</span>
                  </div>
                  <div className="bg-[#222] px-3 py-2 rounded-lg border border-[#333]">
                      <span className="text-gray-500 block text-[10px] font-bold uppercase mb-0.5">{t('tournaments.detail.chipsCounted')}</span>
                       <span className={`font-mono font-medium text-sm ${isChipsBalanced ? 'text-brand-green' : 'text-red-400'}`}>
                          {totalChipsCounted.toLocaleString()}
                      </span>
                  </div>
                  {chipDifference !== 0 && (
                       <div className="flex items-center gap-3 text-red-400 bg-red-950/20 px-3 py-2 rounded-lg border border-red-500/20">
                          <AlertTriangle size={16} />
                          <div>
                              <span className="block text-[10px] font-bold uppercase opacity-80">{t('tournaments.detail.discrepancy')}</span>
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
                  className={`px-6 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all active:scale-95 text-xs shrink-0 ${
                      !isChipsBalanced || isProcessing
                      ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-[#333]'
                      : 'bg-brand-green text-black hover:bg-brand-green/90 shadow-green-500/20 hover:scale-105'
                  }`}
              >
                  {isProcessing ? <Loader2 size={14} className="animate-spin" /> : <Trophy size={14} />}
                  {t('tournaments.detail.completeTournament')}
              </button>
          </div>
        )}

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
