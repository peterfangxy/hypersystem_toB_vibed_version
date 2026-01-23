
import React, { useState, useEffect } from 'react';
import { 
  Trash2, 
  Plus, 
  Save, 
  AlertCircle,
  Wallet,
  Check
} from 'lucide-react';
import { Tournament, TournamentRegistration, Member, PokerTable, TournamentTransaction } from '../types';
import * as DataService from '../services/dataService';
import { THEME } from '../theme';
import { Modal } from './ui/Modal';
import NumberInput from './ui/NumberInput';

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
    const [transactions, setTransactions] = useState<TournamentTransaction[]>([]);
    const [walletBalance, setWalletBalance] = useState<number>(0);
    const [initialAllocatedDeposit, setInitialAllocatedDeposit] = useState<number>(0);

    useEffect(() => {
        if (isOpen && registration) {
            // Load transactions or create defaults if missing (migration)
            const txs = registration.transactions && registration.transactions.length > 0 
                ? [...registration.transactions] 
                : [];
            
            setTransactions(txs);

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

    const calculateRowNet = (tx: TournamentTransaction) => {
        const totalDiscount = (tx.rebuyDiscount || 0) + (tx.membershipDiscount || 0) + (tx.voucherDiscount || 0) + (tx.campaignDiscount || 0);
        return Math.max(0, baseCost - totalDiscount);
    };

    const calculateRowCash = (tx: TournamentTransaction) => {
        if (tx.isPaid) return 0; // If marked as paid, no outstanding cash
        const net = calculateRowNet(tx);
        return Math.max(0, net - (tx.depositPaid || 0));
    };

    // Summaries
    const totalNetPayable = transactions.reduce((sum, tx) => sum + calculateRowNet(tx), 0);
    const totalDepositPaid = transactions.reduce((sum, tx) => sum + (tx.depositPaid || 0), 0);
    const totalCashOutstanding = transactions.reduce((sum, tx) => sum + calculateRowCash(tx), 0);

    // Validation
    const isOverBalance = totalDepositPaid > effectiveAvailableFunds;

    // Grid Layout Definition
    // Columns: Index, Time, Type, BaseCost, RebuyDisc, MemDisc, Voucher, Campaign, Deposit, Net, Paid, Action
    const gridClass = "grid grid-cols-[3rem_4.5rem_4.5rem_5rem_1fr_1fr_1fr_1fr_1fr_5rem_3.5rem_3rem] gap-2 items-center";

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
                    <div className="min-w-[1000px] p-4">
                        {/* Sticky Grid Header - Matches StructureForm Style */}
                        <div className={`sticky top-0 z-10 ${gridClass} p-2 bg-[#111] border-b border-[#222] text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 shadow-sm`}>
                            <div className="text-center pl-2">#</div>
                            <div className="text-center">Time</div>
                            <div className="text-center">Type</div>
                            <div className="text-center">Base</div>
                            <div className="text-center">Rebuy</div>
                            <div className="text-center">Member</div>
                            <div className="text-center">Voucher</div>
                            <div className="text-center">Campaign</div>
                            <div className="text-center">Deposit Pay</div>
                            <div className="text-center">Net</div>
                            <div className="text-center">Paid</div>
                            <div className="text-center"></div>
                        </div>

                        {/* Transaction Rows */}
                        <div className="space-y-1">
                            {transactions.length === 0 ? (
                                <div className="p-10 text-center text-gray-500 border border-dashed border-[#222] rounded-xl bg-[#1A1A1A]/30">
                                    No transactions recorded. Click "Add" below.
                                </div>
                            ) : (
                                transactions.map((tx, idx) => {
                                    const net = calculateRowNet(tx);
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
                                                <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border inline-block ${
                                                    tx.type === 'BuyIn' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 'bg-orange-500/10 text-orange-500 border-orange-500/20'
                                                }`}>
                                                    {tx.type === 'BuyIn' ? 'Buy-in' : 'Re-buy'}
                                                </span>
                                            </div>
                                            
                                            {/* Base Cost */}
                                            <div className="text-center text-gray-300 font-mono text-sm">
                                                ${baseCost.toLocaleString()}
                                            </div>
                                            
                                            {/* Inputs */}
                                            {['rebuyDiscount', 'membershipDiscount', 'voucherDiscount', 'campaignDiscount', 'depositPaid'].map((field) => (
                                                <div key={field}>
                                                    <NumberInput 
                                                        value={(tx as any)[field]}
                                                        onChange={(val) => handleTransactionChange(idx, field as keyof TournamentTransaction, val ?? 0)}
                                                        min={0}
                                                        allowEmpty={true}
                                                        enableScroll={false}
                                                        align="center"
                                                        size="sm"
                                                        variant="transparent"
                                                        className={`w-full border rounded-lg ${
                                                            field === 'depositPaid' && isOverBalance 
                                                            ? 'border-red-500/50 bg-red-900/10' 
                                                            : 'border-[#333] bg-[#222]'
                                                        }`}
                                                        placeholder="0"
                                                    />
                                                </div>
                                            ))}

                                            {/* Net Payable */}
                                            <div className="text-center">
                                                <div className="font-bold text-white font-mono text-sm">${net.toLocaleString()}</div>
                                            </div>
                                            
                                            {/* Paid Toggle */}
                                            <div className="flex justify-center">
                                                <button
                                                    type="button"
                                                    onClick={() => handleTransactionChange(idx, 'isPaid', !tx.isPaid)}
                                                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors border ${
                                                        tx.isPaid 
                                                        ? 'bg-green-500/20 border-green-500 text-green-500' 
                                                        : 'bg-[#222] border-[#444] text-gray-600 hover:border-gray-500'
                                                    }`}
                                                    title={tx.isPaid ? "Mark as Unpaid" : "Mark as Paid"}
                                                >
                                                    {tx.isPaid && <Check size={16} strokeWidth={3} />}
                                                </button>
                                            </div>

                                            {/* Delete Action */}
                                            <div className="flex justify-center opacity-50 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    type="button"
                                                    onClick={() => handleRemoveTransaction(idx)}
                                                    className="p-1.5 text-gray-600 hover:text-red-500 rounded hover:bg-[#333] transition-colors"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
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
                        Add {transactions.length === 0 ? 'Buy-In' : 'Re-buy / Add-on'}
                    </button>
                    {!canAdd && (
                        <span className="text-xs text-red-400 font-medium bg-red-900/10 px-3 py-1 rounded-full border border-red-900/20 flex items-center gap-2">
                            <AlertCircle size={12} />
                            Tournament Limit Reached (Max {maxBuyIns})
                        </span>
                    )}
                </div>

                <div className="p-6 border-t border-[#222] bg-[#171717] flex justify-between items-center shrink-0">
                    <div className="flex gap-8">
                        <div>
                            <span className="text-gray-500 text-xs font-bold uppercase block mb-1">Total Net Payable</span>
                            <span className="text-xl font-bold text-white font-mono">${totalNetPayable.toLocaleString()}</span>
                        </div>
                        <div>
                            <span className="text-gray-500 text-xs font-bold uppercase block mb-1 flex items-center gap-1.5">
                                Total Deposit Paid
                                {isOverBalance && <AlertCircle size={14} className="text-red-500" />}
                            </span>
                            <span className={`text-xl font-bold font-mono ${isOverBalance ? 'text-red-500' : 'text-brand-green'}`}>
                                ${totalDepositPaid.toLocaleString()}
                            </span>
                            <div className="text-[10px] text-gray-500 flex items-center gap-1.5 mt-1">
                                <Wallet size={12} />
                                Avail: ${effectiveAvailableFunds.toLocaleString()}
                            </div>
                        </div>
                        <div className="pl-8 border-l border-[#333]">
                            <span className="text-gray-500 text-xs font-bold uppercase block mb-1">Outstanding</span>
                            <span className="text-2xl font-bold text-white font-mono">${totalCashOutstanding.toLocaleString()}</span>
                        </div>
                    </div>
                    <button 
                        type="submit"
                        disabled={isOverBalance}
                        className={`px-8 py-3 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 ${
                            isOverBalance 
                            ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                            : THEME.buttonPrimary
                        }`}
                        title={isOverBalance ? "Insufficient wallet balance" : ""}
                    >
                        <Save size={20} />
                        Save Changes
                    </button>
                </div>
            </form>
        </Modal>
    );
};
