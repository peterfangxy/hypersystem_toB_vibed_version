
import { FinancialTransaction, MemberFinancials, PaymentMethod } from '../../types';
import { getLocalData, setLocalData, DEPOSITS_KEY, WITHDRAWALS_KEY, FINANCIALS_KEY } from './storage';
import { getAllRegistrations } from './registrations';
import { getTournaments } from './tournaments';

export const getAllTransactions = (): FinancialTransaction[] => {
    return getLocalData<FinancialTransaction[]>(FINANCIALS_KEY) || [];
};

export const getMemberFinancials = (memberId: string): MemberFinancials => {
    const deposits = getLocalData<any[]>(DEPOSITS_KEY) || [];
    const withdrawals = getLocalData<any[]>(WITHDRAWALS_KEY) || [];
    const memberDeposits = deposits.filter(d => d.memberId === memberId);
    const memberWithdrawals = withdrawals.filter(w => w.memberId === memberId);
    const allRegs = getAllRegistrations().filter(r => r.memberId === memberId);
    
    let totalWinnings = 0;
    let totalBuyInsCost = 0;
    let totalDeposited = memberDeposits.reduce((sum, d) => sum + d.amount, 0);
    let totalWithdrawn = memberWithdrawals.reduce((sum, w) => sum + w.amount, 0);
    
    const history: FinancialTransaction[] = [];
    
    memberDeposits.forEach(d => {
        history.push({
            id: d.id,
            type: 'Deposit',
            amount: d.amount,
            date: d.date,
            description: `Deposit (${d.method})`,
            method: d.method
        });
    });

    memberWithdrawals.forEach(w => {
        history.push({
            id: w.id,
            type: 'Withdrawal',
            amount: w.amount,
            date: w.date,
            description: `Withdrawal (${w.method})`,
            method: w.method
        });
    });

    const tournaments = getTournaments();
    allRegs.forEach(r => {
        const t = tournaments.find(tour => tour.id === r.tournamentId);
        const tName = t ? t.name : 'Unknown Tournament';
        
        if (r.prize && r.prize > 0) {
            totalWinnings += r.prize;
            history.push({
                id: `win-${r.id}`,
                type: 'Win',
                amount: r.prize,
                date: t?.startDate || r.registeredAt,
                description: `Win: ${tName} (Rank ${r.rank})`
            });
        }
        
        if (r.transactions) {
            r.transactions.forEach(tx => {
                if (tx.depositPaid && tx.depositPaid > 0) {
                     totalBuyInsCost += tx.depositPaid;
                     history.push({
                        id: `buyin-${tx.id}`,
                        type: 'BuyIn',
                        amount: tx.depositPaid,
                        date: tx.timestamp,
                        description: `Buy-in: ${tName}`
                     });
                }
            });
        }
    });
    
    history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const balance = (totalDeposited + totalWinnings) - (totalWithdrawn + totalBuyInsCost);

    return {
        balance,
        totalWinnings,
        totalDeposited,
        totalBuyIns: totalBuyInsCost,
        totalWithdrawn,
        transactions: history
    };
};

export const addDeposit = (memberId: string, amount: number, method: PaymentMethod, note?: string): void => {
    const deposits = getLocalData<any[]>(DEPOSITS_KEY) || [];
    deposits.push({
        id: crypto.randomUUID(),
        memberId,
        amount,
        method,
        note,
        date: new Date().toISOString()
    });
    setLocalData(DEPOSITS_KEY, deposits);
};

export const addWithdrawal = (memberId: string, amount: number, method: PaymentMethod, note?: string): void => {
     const withdrawals = getLocalData<any[]>(WITHDRAWALS_KEY) || [];
    withdrawals.push({
        id: crypto.randomUUID(),
        memberId,
        amount,
        method,
        note,
        date: new Date().toISOString()
    });
    setLocalData(WITHDRAWALS_KEY, withdrawals);
};
