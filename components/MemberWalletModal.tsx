import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  History, 
  Coins, 
  Banknote,
  DollarSign,
  ArrowLeft,
  Check,
  Trophy,
  CreditCard,
  Building2,
  Ticket,
  PlusCircle,
  PiggyBank
} from 'lucide-react';
import { Member, MemberFinancials, PaymentMethod } from '../types';
import * as DataService from '../services/dataService';
import { THEME } from '../theme';
import { Modal } from './Modal';

interface MemberWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member;
}

type WalletView = 'dashboard' | 'withdraw' | 'deposit';

const MemberWalletModal: React.FC<MemberWalletModalProps> = ({ isOpen, onClose, member }) => {
  const [view, setView] = useState<WalletView>('dashboard');
  const [financials, setFinancials] = useState<MemberFinancials | null>(null);
  
  // Withdraw/Deposit Form State
  const [amount, setAmount] = useState<string>('');
  const [method, setMethod] = useState<PaymentMethod>('Cash');
  const [note, setNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadFinancials();
      setView('dashboard');
      setSuccessMessage(null);
      resetForm();
    }
  }, [isOpen, member.id]);

  const loadFinancials = () => {
    const data = DataService.getMemberFinancials(member.id);
    setFinancials(data);
  };

  const resetForm = () => {
      setAmount('');
      setMethod('Cash');
      setNote('');
  };

  const handleTransaction = async (e: React.FormEvent, type: 'withdraw' | 'deposit') => {
    e.preventDefault();
    if (!financials) return;

    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) return;
    
    // Check constraints for withdraw
    if (type === 'withdraw' && val > financials.balance) return;

    setIsProcessing(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    if (type === 'withdraw') {
        DataService.addWithdrawal(member.id, val, method, note);
        setSuccessMessage(`Successfully withdrew $${val.toLocaleString()}`);
    } else {
        DataService.addDeposit(member.id, val, method, note);
        setSuccessMessage(`Successfully deposited $${val.toLocaleString()}`);
    }
    
    // Refresh Data
    loadFinancials();
    
    setIsProcessing(false);
    
    // Reset and go back to dashboard after brief delay
    setTimeout(() => {
        setSuccessMessage(null);
        setView('dashboard');
        resetForm();
    }, 1200);
  };

  const Header = () => (
      <div className="flex items-center gap-3">
          <img 
            src={member.avatarUrl} 
            alt={member.fullName}
            className="w-10 h-10 rounded-full object-cover border border-[#333]"
          />
          <div>
              <h2 className="text-lg font-bold text-white leading-tight">{member.fullName}</h2>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Wallet & Financials</p>
          </div>
      </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={<Header />}
      size="lg"
    >
      <div className="flex flex-col min-h-[420px] max-h-[80vh]">
        {/* Stats Cards - Updated Layout for 4 items */}
        {financials && (
            <div className="p-4 grid grid-cols-4 gap-3 bg-[#111] border-b border-[#222]">
                <div className="bg-[#1A1A1A] px-3 py-3 rounded-xl border border-[#333]">
                    <div className="text-gray-500 text-[10px] font-bold uppercase mb-0.5 flex items-center gap-1.5 whitespace-nowrap">
                        <ArrowUpRight size={12} className="text-brand-green"/> Winnings
                    </div>
                    <div className="text-base font-bold text-white">${financials.totalWinnings.toLocaleString()}</div>
                </div>

                <div className="bg-[#1A1A1A] px-3 py-3 rounded-xl border border-[#333]">
                    <div className="text-gray-500 text-[10px] font-bold uppercase mb-0.5 flex items-center gap-1.5 whitespace-nowrap">
                        <PlusCircle size={12} className="text-blue-400"/> Deposits
                    </div>
                    <div className="text-base font-bold text-white">${financials.totalDeposited.toLocaleString()}</div>
                </div>
                
                <div className="bg-[#1A1A1A] px-3 py-3 rounded-xl border border-[#333]">
                    <div className="text-gray-500 text-[10px] font-bold uppercase mb-0.5 flex items-center gap-1.5 whitespace-nowrap">
                        <ArrowDownLeft size={12} className="text-orange-400"/> Withdrawn
                    </div>
                    <div className="text-base font-bold text-gray-300">${financials.totalWithdrawn.toLocaleString()}</div>
                </div>

                <div className="bg-gradient-to-br from-brand-green/20 to-brand-green/5 px-3 py-3 rounded-xl border border-brand-green/30 relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="text-brand-green text-[10px] font-bold uppercase mb-0.5 flex items-center gap-1.5 whitespace-nowrap">
                            <Coins size={12} /> Available
                        </div>
                        <div className="text-lg font-bold text-white">${financials.balance.toLocaleString()}</div>
                    </div>
                </div>
            </div>
        )}

        {/* Content Area */}
        <div className="flex-1 bg-[#171717] overflow-hidden flex flex-col relative">
            
            {/* VIEW: DASHBOARD (HISTORY) */}
            {view === 'dashboard' && financials && (
                <div className="flex flex-col h-full animate-in slide-in-from-left-4 duration-300">
                    <div className="px-4 py-3 flex justify-between items-center border-b border-[#222] bg-[#1A1A1A]/50">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                            <History size={14} /> Activity Log
                        </h3>
                        <div className="flex gap-2">
                             <button 
                                onClick={() => setView('deposit')}
                                className="px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all bg-[#222] text-white border border-[#333] hover:bg-[#333]"
                            >
                                <PiggyBank size={14} className="text-blue-400"/>
                                Deposit
                            </button>
                            <button 
                                onClick={() => setView('withdraw')}
                                disabled={financials.balance <= 0}
                                className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all ${
                                    financials.balance > 0 
                                    ? 'bg-brand-green text-black hover:bg-brand-green/90 shadow-lg shadow-green-500/10'
                                    : 'bg-[#333] text-gray-500 cursor-not-allowed'
                                }`}
                            >
                                <Banknote size={14} />
                                Withdraw
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-3">
                        {financials.transactions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-600 pb-10">
                                <History size={32} className="mb-2 opacity-20" />
                                <p className="text-sm">No transaction history found.</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {financials.transactions.map((tx) => (
                                    <div key={tx.id} className="bg-[#222] p-3 rounded-lg border border-[#333] flex items-center justify-between group hover:border-[#444] transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                                tx.type === 'Win' ? 'bg-brand-green/10 text-brand-green' : 
                                                tx.type === 'Deposit' ? 'bg-blue-500/10 text-blue-500' :
                                                tx.type === 'BuyIn' ? 'bg-gray-500/10 text-gray-500' :
                                                'bg-orange-500/10 text-orange-500'
                                            }`}>
                                                {tx.type === 'Win' && <Trophy size={14} />}
                                                {tx.type === 'Deposit' && <PlusCircle size={14} />}
                                                {tx.type === 'BuyIn' && <Ticket size={14} />}
                                                {tx.type === 'Withdrawal' && <ArrowDownLeft size={14} />}
                                            </div>
                                            <div>
                                                <div className="font-bold text-white text-xs">{tx.description}</div>
                                                <div className="text-[10px] text-gray-500">
                                                    {new Date(tx.date).toLocaleDateString(undefined, {month:'short', day:'numeric'})} • {new Date(tx.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                </div>
                                            </div>
                                        </div>
                                        <div className={`text-right font-mono font-bold text-sm ${
                                            tx.type === 'Win' || tx.type === 'Deposit' ? 'text-brand-green' : 
                                            tx.type === 'BuyIn' ? 'text-gray-500' :
                                            'text-orange-400'
                                        }`}>
                                            {tx.type === 'Win' || tx.type === 'Deposit' ? '+' : '-'}${tx.amount.toLocaleString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* VIEW: WITHDRAWAL / DEPOSIT FORM */}
            {(view === 'withdraw' || view === 'deposit') && financials && (
                <div className="flex flex-col h-full p-6 animate-in slide-in-from-right-4 duration-300">
                    <div className="flex items-center justify-between mb-6">
                         <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            {view === 'withdraw' ? (
                                <>
                                    <Banknote size={20} className="text-orange-500"/>
                                    Withdraw Funds
                                </>
                            ) : (
                                <>
                                    <PiggyBank size={20} className="text-blue-500"/>
                                    Deposit Funds
                                </>
                            )}
                         </h3>
                         <button 
                            onClick={() => setView('dashboard')}
                            className="text-gray-500 hover:text-white flex items-center gap-1.5 text-xs font-bold transition-colors bg-[#222] px-3 py-1.5 rounded-lg"
                        >
                            <ArrowLeft size={14} /> Back
                        </button>
                    </div>

                    <div className="flex-1 flex flex-col justify-start">
                        
                        {!successMessage ? (
                            <form onSubmit={(e) => handleTransaction(e, view)} className="space-y-5">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                        <input 
                                            autoFocus
                                            type="number"
                                            min="1"
                                            max={view === 'withdraw' ? financials.balance : undefined}
                                            step="0.01"
                                            required
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            className={`w-full bg-[#222] border border-[#333] rounded-xl pl-10 pr-16 py-3 text-xl font-bold text-white outline-none focus:border-brand-green transition-all placeholder:text-gray-700`}
                                            placeholder="0.00"
                                        />
                                        {view === 'withdraw' && (
                                            <button 
                                                type="button"
                                                onClick={() => setAmount(financials.balance.toString())}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold bg-[#333] text-brand-green px-2 py-1 rounded hover:bg-[#444] transition-colors"
                                            >
                                                MAX
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex justify-between px-1">
                                        <p className="text-[10px] text-gray-500">Available: ${financials.balance.toLocaleString()}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Method</label>
                                        <div className="relative">
                                            <select
                                                value={method}
                                                onChange={(e) => setMethod(e.target.value as PaymentMethod)}
                                                className={`w-full ${THEME.input} rounded-xl pl-3 pr-8 py-2.5 text-sm outline-none appearance-none cursor-pointer`}
                                            >
                                                <option value="Cash">Cash</option>
                                                <option value="Bank Transfer">Bank Transfer</option>
                                                <option value="Crypto">Crypto</option>
                                            </select>
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                                {method === 'Cash' && <Banknote size={14} />}
                                                {method === 'Bank Transfer' && <Building2 size={14} />}
                                                {method === 'Crypto' && <CreditCard size={14} />}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Note</label>
                                        <input 
                                            type="text"
                                            value={note}
                                            onChange={(e) => setNote(e.target.value)}
                                            className={`w-full ${THEME.input} rounded-xl px-3 py-2.5 text-sm outline-none`}
                                            placeholder="Optional..."
                                        />
                                    </div>
                                </div>

                                <button 
                                    type="submit"
                                    disabled={isProcessing}
                                    className={`w-full ${view === 'withdraw' ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'} py-3.5 rounded-xl font-bold text-base shadow-lg mt-2 disabled:opacity-50 flex justify-center items-center gap-2 transition-colors`}
                                >
                                    {isProcessing ? 'Processing...' : (
                                        <>
                                            <span>Confirm {view === 'withdraw' ? 'Withdrawal' : 'Deposit'}</span>
                                        </>
                                    )}
                                </button>
                            </form>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full py-10 animate-in zoom-in-95 duration-300">
                                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white mb-4 shadow-lg shadow-green-500/30">
                                    <Check size={32} strokeWidth={3} />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-1">Transaction Complete</h3>
                                <p className="text-brand-green font-medium text-sm">{successMessage}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
      </div>
    </Modal>
  );
};

export default MemberWalletModal;