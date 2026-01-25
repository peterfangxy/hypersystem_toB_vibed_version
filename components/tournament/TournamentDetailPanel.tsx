
import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus,
  Loader2,
  X
} from 'lucide-react';
import { Tournament, RegistrationStatus, TournamentTransaction } from '../../types';
import * as DataService from '../../services/dataService';
import { THEME } from '../../theme';
import { BuyinMgmtModal, EnrichedRegistration } from '../BuyinMgmtModal';
import AddPlayerModal from '../AddPlayerModal';
import { useLanguage } from '../../contexts/LanguageContext';
import TournamentStatsFooter from './TournamentStatsFooter';
import TournamentPlayerList from './TournamentPlayerList';
import { useTournamentLogic } from '../../hooks/useTournamentLogic';
import { TournamentService } from '../../services/tournamentService';

interface TournamentDetailPanelProps {
  tournament: Tournament;
  onUpdate: () => void; // Callback to refresh parent list
  onClose: () => void;
}

const TournamentDetailPanel: React.FC<TournamentDetailPanelProps> = ({ tournament, onUpdate, onClose }) => {
  const { t } = useLanguage();
  
  // Use the new Hook
  const { 
      registrations, // These are enriched
      tables, 
      occupiedSeatsByTable, 
      financialStats,
      actions 
  } = useTournamentLogic(tournament);

  const [registrationSearch, setRegistrationSearch] = useState('');
  const [isAddPlayerOpen, setIsAddPlayerOpen] = useState(false);
  
  // Payment Modal State
  const [paymentModalReg, setPaymentModalReg] = useState<EnrichedRegistration | null>(null);

  // Processing State
  const [isProcessing, setIsProcessing] = useState(false);

  // --- Handlers using Hook Actions ---

  const handleAddMember = (memberId: string) => {
    actions.registerMember(memberId);
    onUpdate(); // Notify parent
  };

  const handleStatusChange = (regId: string, status: RegistrationStatus) => {
    actions.updateStatus(regId, status);
    onUpdate();
  };

  const handleSeatChange = (regId: string, tableId: string, seatNumber: number) => {
      const success = actions.updateSeat(regId, tableId, seatNumber);
      if (!success) {
          alert("This table is fully occupied.");
      }
  };
  
  const handleChipChange = (regId: string, chips: number) => {
      actions.updateChips(regId, chips);
  };

  const handleTransactionsSave = (regId: string, transactions: TournamentTransaction[]) => {
      actions.updateTransactions(regId, transactions);
      onUpdate();
  };

  const handleDelete = (regId: string) => {
      if(window.confirm('Are you sure you want to remove this player from the tournament?')) {
          actions.removeRegistration(regId);
          onUpdate();
      }
  };

  // --- Filter Logic (UI Concern) ---
  const filteredRegistrations = useMemo(() => {
    if (!registrationSearch) return registrations;
    return registrations.filter(r => 
      r.member?.fullName.toLowerCase().includes(registrationSearch.toLowerCase()) || 
      r.member?.email.toLowerCase().includes(registrationSearch.toLowerCase())
    );
  }, [registrations, registrationSearch]);

  const isTournamentLocked = ['Completed', 'Cancelled'].includes(tournament.status || '');
  const isInProgress = tournament.status === 'In Progress';

  const handleConfirmCompletion = async () => {
    if (!financialStats.isChipsBalanced) return;

    setIsProcessing(true);
    // Simulate thinking delay for better UX
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Delegate Logic to Service
    const payoutStruct = DataService.getPayoutStructures().find(p => p.id === tournament.payoutStructureId);
    const results = TournamentService.calculateResults(tournament, registrations, payoutStruct);
    TournamentService.finalizeTournament(tournament, results);
    
    actions.refresh();
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
        registrations={filteredRegistrations}
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
          totalPrizePool={financialStats.totalPrizePool}
          totalFees={financialStats.totalFees}
          totalChipsInPlay={financialStats.totalChipsInPlay}
          totalChipsCounted={financialStats.totalChipsCounted}
          chipDifference={financialStats.chipDifference}
          isChipsBalanced={financialStats.isChipsBalanced}
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
