
import React, { useState, useEffect } from 'react';
import { 
  Trash2, 
  Plus, 
  Save, 
  AlertCircle,
  Wallet,
  Check,
  Lock
} from 'lucide-react';
import { Tournament, TournamentRegistration, Member, PokerTable, TournamentTransaction } from '../types';
import * as DataService from '../services/dataService';
import { THEME } from '../theme';
import { Modal } from './ui/Modal';
import NumberInput from './ui/NumberInput';
import StatusBadge from './ui/StatusBadge';
import { useLanguage } from '../contexts/LanguageContext';

export interface EnrichedRegistration extends TournamentRegistration {
    member?: Member;
    assignedTable?: PokerTable;
    netPayable?: number;
    totalDepositPaid?: number;
}

interface BuyinMgmtModalProps {
    isOpen: boolean;
    onClose: () => void;
    registration: EnrichedRegistration | null;
    tournament: Tournament | null;
    onSave: (regId: string, transactions: TournamentTransaction[]) => void;
}

export const BuyinMgmtModal: React.FC<BuyinMgmtModalProps> = ({ isOpen, onClose, registration, tournament, onSave }) => {
    const { t } = useLanguage();
    const [transactions, setTransactions] = useState<TournamentTransaction[]>([]);
    const [walletBalance, setWalletBalance] = useState<number>(0);
    const [initialAllocatedDeposit, setInitialAllocatedDeposit] = useState<number>(0);
    const [lockedTransactionIds, setLockedTransactionIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (isOpen && registration) {
            // Load transactions or create defaults if missing (migration)
            const txs = registration.transactions && registration.transactions.length > 0 
                ? [...registration.transactions] 
                : [];
            
            setTransactions(txs);

            // Identify transactions that were already paid and saved (Locked)
            const locked = new Set<string>();
            if (registration.transactions) {
                registration.transactions.forEach(tx => {
                    if (tx.isPaid) locked.add(tx.id);
                });
            }
            setLockedTransactionIds(locked);

            // Calculate initial allocated deposit for this specific registration
            // This is funds already deducted from the user's wallet for this tournament
            const initialAllocated = txs.reduce((sum, tx) => sum + (tx.depositPaid || 0), 0);
            setInitialAllocatedDeposit(initialAllocated);

            // Fetch member wallet balance
            if (registration.member) {
                const financials = DataService.getMemberFinancials(registration.member.id);
                setWalletBalance(financials.balance);
            }
        }
    }, [isOpen, registration]);

    if (!registration || !tournament) return null;

    const baseCost = tournament.buyIn + tournament.fee;
    const maxBuyIns = 1 + (tournament.rebuyLimit || 0);
    const canAdd = transactions.length < maxBuyIns;
    
    // Calculate total available funds including what is already allocated to this tournament
    const effectiveAvailableFunds = walletBalance + initialAllocatedDeposit;

    const handleTransactionChange = (index: number, field: keyof TournamentTransaction, value: any) => {
        const updated = [...transactions];
        updated[index] = { ...updated[index], [field]: value };
        setTransactions(updated);
    };

    const handleAddTransaction = () => {
        if (!canAdd) return;

        const type = transactions.length === 0 ? 'BuyIn' : 'Rebuy';
        const newTx: TournamentTransaction = {
            id: crypto.randomUUID(),
            type,
            timestamp: new Date().toISOString(),
            rebuyDiscount: 0,
            membershipDiscount: 0,
            voucherDiscount: 0,
            campaignDiscount: 0,
            depositPaid: 0,
            isPaid: false
        };
        setTransactions([...transactions, newTx]);
    };

    const handleRemoveTransaction = (index: number) => {
        const updated = [...transactions];
        updated.splice(index, 1);
        if (updated.length > 0 && updated[0].type !== 'BuyIn') {
            updated[0].type = 'BuyIn';
        }
        setTransactions(updated);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(registration.id, transactions);
        onClose();
    };

    // Helper to calculate row stats and validation
    const getRowState = (tx: TournamentTransaction) => {
        const totalDiscount = (tx.rebuyDiscount || 0) + (tx.membershipDiscount || 0) + (tx.voucherDiscount || 0) + (tx.campaignDiscount || 0);
        
        // Maximum amount that can be paid (Net Payable before Deposit)
        // If discounts exceed base, this is 0.
        const netBeforeDeposit = Math.max(0, baseCost - totalDiscount);
        
        // Validation: Deposit cannot exceed the payable amount
        const isDepositInvalid = (tx.depositPaid || 0) > netBeforeDeposit;
        
        // Cash to be paid
        const cash = Math.max(0, netBeforeDeposit - (tx.depositPaid || 0));

        return { netBeforeDeposit, isDepositInvalid, cash };
    };

    // Summaries & Validations
    const totalCashDue = transactions.reduce((sum, tx) => sum + getRowState(tx).cash, 0);
    const totalDepositPaid = transactions.reduce((sum, tx) => sum + (tx.depositPaid || 0), 0);
    
    const isOverBalance = totalDepositPaid > effectiveAvailableFunds;
    const isAnyDepositInvalid = transactions.some(tx => getRowState(tx).isDepositInvalid);
    const allPaid = transactions.every(tx => tx.isPaid);

    const canSave = !isOverBalance && !isAnyDepositInvalid && allPaid;

    // Grid Layout Definition
    const gridClass = "grid grid-cols-[3rem_4.5rem_4.5rem_5rem_1fr_1fr_1fr_1fr_1fr_5rem_3.5rem_3rem] gap-2 items-center";

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`${registration.member?.fullName || 'Player'} - ${t('tournaments.buyinModal.title')}`}
            size="4xl"
            zIndex={70}
        >
            <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden h-[80vh]">
                <div className="flex-1 overflow-x-auto overflow-y-auto bg-[#111]">
                    <div className="min-w-[1000px] p-4">
                        {/* Sticky Grid Header */}
                        <div className={`sticky top-0 z-10 ${gridClass} p-2 bg-[#111] border-b border-[#222] text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 shadow-sm`}>
                            <div className="text-center pl-2">#</div>
                            <div className="text-center">{t('tournaments.buyinModal.headers.time')}</div>
                            <div className="text-center">{t('tournaments.buyinModal.headers.type')}</div>
                            <div className="text-center">{t('tournaments.buyinModal.headers.base')}</div>
                            <div className="text-center text-blue-400">{t('tournaments.buyinModal.headers.rebuy')}</div>
                            <div className="text-center text-blue-400">{t('tournaments.buyinModal.headers.member')}</div>
                            <div className="text-center text-blue-400">{t('tournaments.buyinModal.headers.voucher')}</div>
                            <div className="text-center text-blue-400">{t('tournaments.buyinModal.headers.campaign')}</div>
                            <div className="text-center text-brand-green">{t('tournaments.buyinModal.headers.deposit')}</div>
                            <div className="text-center text-brand-green">{t('tournaments.buyinModal.headers.cash')}</div>
                            <div className="text-center">{t('tournaments.buyinModal.headers.paid')}</div>
                            <div className="text-center"></div>
                        </div>

                        {/* Transaction Rows */}
                        <div className="space-y-1">
                            {transactions.length === 0 ? (
                                <div className="p-10 text-center text-gray-500 border border-dashed border-[#222] rounded-xl bg-[#1A1A1A]/30">
                                    {t('tournaments.buyinModal.empty')}
                                </div>
                            ) : (
                                transactions.map((tx, idx) => {
                                    const { cash, isDepositInvalid } = getRowState(tx);
                                    const isLocked = lockedTransactionIds.has(tx.id);

                                    return (
                                        <div key={tx.id} className={`${gridClass} p-2 rounded-lg hover:bg-[#1A1A1A] border border-transparent hover:border-[#333] transition-colors group`}>
                                            {/* Index */}
                                            <div className="text-center pl-2 text-gray-500 font-mono text-xs">{idx + 1}</div>
                                            
                                            {/* Time */}
                                            <div className="text-center text-gray-500 font-mono text-xs truncate">
                                                {new Date(tx.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </div>
                                            
                                            {/* Type */}
                                            <div className="text-center">
                                                <StatusBadge 
                                                    variant={tx.type === 'BuyIn' ? 'info' : 'warning'} 
                                                    size="sm"
                                                >
                                                    {tx.type === 'BuyIn' ? t('tournaments.buyinModal.types.buyIn') : t('tournaments.buyinModal.types.reBuy')}
                                                </StatusBadge>
                                            </div>
                                            
                                            {/* Base Cost */}
                                            <div className="text-center text-gray-300 font-mono text-sm">
                                                ${baseCost.toLocaleString()}
                                            </div>
                                            
                                            {/* Inputs (Discounts & Deposit) */}
                                            {['rebuyDiscount', 'membershipDiscount', 'voucherDiscount', 'campaignDiscount', 'depositPaid'].map((field) => {
                                                const isDiscount = ['rebuyDiscount', 'membershipDiscount', 'voucherDiscount', 'campaignDiscount'].includes(field);
                                                const isDeposit = field === 'depositPaid';
                                                
                                                // Determine Text Color based on Column Type
                                                let textColorClass = 'text-gray-300';
                                                if (isDiscount) textColorClass = 'text-blue-400 font-medium';
                                                if (isDeposit) textColorClass = 'text-brand-green font-bold';

                                                return (
                                                    <div key={field} className="relative group/input">
                                                        <NumberInput 
                                                            value={(tx as any)[field]}
                                                            onChange={(val) => handleTransactionChange(idx, field as keyof TournamentTransaction, val ?? 0)}
                                                            min={0}
                                                            allowEmpty={true}
                                                            enableScroll={false}
                                                            align="center"
                                                            size="sm"
                                                            variant="transparent"
                                                            disabled={isLocked} 
                                                            className={`w-full border rounded-lg ${textColorClass} ${
                                                                isDeposit 
                                                                    ? (isDepositInvalid || isOverBalance ? 'border-red-500/50 bg-red-900/10 text-red-200' : (isLocked ? 'border-transparent text-gray-500' : 'border-[#333] bg-[#222]'))
                                                                    : (isLocked ? 'border-transparent text-gray-500' : 'border-[#333] bg-[#222]')
                                                            }`}
                                                            placeholder="0"
                                                        />
                                                        {isDeposit && isDepositInvalid && (
                                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-red-500 text-white text-[10px] rounded opacity-0 group-hover/input:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-20">
                                                                {t('tournaments.buyinModal.validation.exceedsPayable')}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}

                                            {/* Cash Column */}
                                            <div className="text-center">
                                                <div className="font-bold text-brand-green font-mono text-sm">${cash.toLocaleString()}</div>
                                            </div>
                                            
                                            {/* Paid Toggle */}
                                            <div className="flex justify-center">
                                                <button
                                                    type="button"
                                                    disabled={isLocked}
                                                    onClick={() => handleTransactionChange(idx, 'isPaid', !tx.isPaid)}
                                                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors border ${
                                                        tx.isPaid 
                                                        ? 'bg-green-500/20 border-green-500 text-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]' 
                                                        : 'bg-[#222] border-[#444] text-gray-600 hover:border-gray-500'
                                                    } ${isLocked ? 'cursor-not-allowed opacity-80' : ''}`}
                                                    title={isLocked ? "Paid (Locked)" : (tx.isPaid ? "Mark as Unpaid" : "Mark as Paid")}
                                                >
                                                    {tx.isPaid ? <Check size={16} strokeWidth={3} /> : null}
                                                </button>
                                            </div>

                                            {/* Delete Action */}
                                            <div className="flex justify-center">
                                                {isLocked ? (
                                                    <div title="Locked (Saved)">
                                                        <Lock size={14} className="text-gray-600 opacity-50" />
                                                    </div>
                                                ) : (
                                                    <button 
                                                        type="button"
                                                        onClick={() => handleRemoveTransaction(idx)}
                                                        className="p-1.5 text-gray-600 hover:text-red-500 rounded hover:bg-[#333] transition-colors opacity-50 group-hover:opacity-100"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>

                {/* Add Button Bar */}
                <div className="p-3 bg-[#171717] border-t border-[#222] flex flex-col items-center justify-center gap-2">
                    <button 
                        type="button" 
                        onClick={handleAddTransaction}
                        disabled={!canAdd}
                        className={`flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-lg transition-colors ${
                            canAdd 
                            ? 'text-gray-400 hover:text-white hover:bg-[#222]' 
                            : 'text-gray-600 cursor-not-allowed opacity-50'
                        }`}
                    >
                        <Plus size={16} className={canAdd ? "text-brand-green" : "text-gray-600"} />
                        {t('tournaments.buyinModal.addBtn')} {transactions.length === 0 ? t('tournaments.buyinModal.types.buyIn') : t('tournaments.buyinModal.types.reBuy')}
                    </button>
                    {!canAdd && (
                        <span className="text-xs text-red-400 font-medium bg-red-900/10 px-3 py-1 rounded-full border border-red-900/20 flex items-center gap-2">
                            <AlertCircle size={12} />
                            {t('tournaments.buyinModal.limitReached', { max: maxBuyIns })}
                        </span>
                    )}
                </div>

                <div className="p-6 border-t border-[#222] bg-[#171717] flex justify-between items-center shrink-0">
                    <div className="flex gap-8">
                        <div>
                            <span className="text-gray-500 text-xs font-bold uppercase block mb-1">{t('tournaments.buyinModal.summary.totalCash')}</span>
                            <span className="text-xl font-bold text-white font-mono">${totalCashDue.toLocaleString()}</span>
                        </div>
                        <div>
                            <span className="text-gray-500 text-xs font-bold uppercase block mb-1 flex items-center gap-1.5">
                                {t('tournaments.buyinModal.summary.deposit')}
                                {isOverBalance && <AlertCircle size={14} className="text-red-500" />}
                            </span>
                            <span className={`text-xl font-bold font-mono ${isOverBalance ? 'text-red-500' : 'text-blue-400'}`}>
                                ${totalDepositPaid.toLocaleString()}
                            </span>
                            <div className="text-[10px] text-gray-500 flex items-center gap-1.5 mt-1">
                                <Wallet size={12} />
                                {t('tournaments.buyinModal.summary.avail')}: ${effectiveAvailableFunds.toLocaleString()}
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                        <button 
                            type="submit"
                            disabled={!canSave}
                            className={`px-8 py-3 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all ${
                                !canSave
                                ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-[#333]' 
                                : THEME.buttonPrimary
                            }`}
                            title={!allPaid ? t('tournaments.buyinModal.validation.allEntriesPaidTooltip') : (isAnyDepositInvalid ? t('tournaments.buyinModal.validation.invalidDepositTooltip') : "")}
                        >
                            <Save size={20} />
                            {t('tournaments.buyinModal.save')}
                        </button>
                        
                        {!allPaid && !isAnyDepositInvalid && !isOverBalance && (
                            <span className="text-xs text-orange-500 font-bold animate-pulse">
                                {t('tournaments.buyinModal.validation.markAllPaid')}
                            </span>
                        )}
                        {isAnyDepositInvalid && (
                            <span className="text-xs text-red-500 font-bold">
                                {t('tournaments.buyinModal.validation.invalidDeposit')}
                            </span>
                        )}
                        {isOverBalance && (
                            <span className="text-xs text-red-500 font-bold animate-pulse">
                                {t('tournaments.buyinModal.validation.insufficientBalance')}
                            </span>
                        )}
                    </div>
                </div>
            </form>
        </Modal>
    );
};
