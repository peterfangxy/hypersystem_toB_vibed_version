
import React, { useState } from 'react';
import { 
  Users, 
  Wallet, 
  Receipt, 
  Trophy, 
  Download, 
  FileText, 
  Filter, 
  CheckCircle2 
} from 'lucide-react';
import { THEME } from '../../theme';
import { useLanguage } from '../../contexts/LanguageContext';
import { Modal } from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import { MembershipTier } from '../../types';

type ReportType = 'members' | 'transactions' | 'tournaments' | 'revenue';

interface ReportDefinition {
    id: ReportType;
    title: string;
    description: string;
    icon: React.ReactNode;
    color: string;
}

const REPORTS: ReportDefinition[] = [
    {
        id: 'members',
        title: 'Member Roster & Analysis',
        description: 'Export member details including join dates, tiers, outstanding balances, and win rates.',
        icon: <Users size={24} />,
        color: 'text-blue-400'
    },
    {
        id: 'transactions',
        title: 'Financial Ledger',
        description: 'Detailed log of all deposits, withdrawals, and wallet adjustments.',
        icon: <Wallet size={24} />,
        color: 'text-brand-green'
    },
    {
        id: 'tournaments',
        title: 'Tournament History',
        description: 'List of hosted tournaments including player counts, prize pools, and status.',
        icon: <Trophy size={24} />,
        color: 'text-yellow-500'
    },
    {
        id: 'revenue',
        title: 'Buy-ins & Revenue',
        description: 'Itemized list of buy-ins, rebuys, and fees collected across all events.',
        icon: <Receipt size={24} />,
        color: 'text-purple-400'
    }
];

const ExportTab = () => {
    const { t } = useLanguage();
    const [selectedReport, setSelectedReport] = useState<ReportType | null>(null);
    const [isExporting, setIsExporting] = useState(false);
    
    // Filter States
    const [dateFrom, setDateFrom] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]); // Start of current month
    const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);
    const [selectedTiers, setSelectedTiers] = useState<string[]>([]);
    const [transactionType, setTransactionType] = useState<string>('all');

    const handleExport = async () => {
        setIsExporting(true);
        // Simulate API call/processing
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsExporting(false);
        setSelectedReport(null);
        alert("Export generated successfully! (Simulation)");
    };

    const toggleTier = (tier: string) => {
        if (selectedTiers.includes(tier)) {
            setSelectedTiers(selectedTiers.filter(t => t !== tier));
        } else {
            setSelectedTiers([...selectedTiers, tier]);
        }
    };

    const renderFilters = () => {
        switch(selectedReport) {
            case 'members':
                return (
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Date Joined (Optional)</label>
                            <div className="flex items-center gap-2">
                                <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className={`w-full ${THEME.input} rounded-xl px-4 py-3 outline-none [color-scheme:dark]`} />
                                <span className="text-gray-500">-</span>
                                <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className={`w-full ${THEME.input} rounded-xl px-4 py-3 outline-none [color-scheme:dark]`} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Membership Tiers</label>
                            <div className="grid grid-cols-2 gap-2">
                                {Object.values(MembershipTier).map(tier => (
                                    <div 
                                        key={tier}
                                        onClick={() => toggleTier(tier)}
                                        className={`p-2 rounded-lg border cursor-pointer text-sm font-medium flex items-center justify-between transition-all ${
                                            selectedTiers.includes(tier) 
                                            ? 'bg-brand-green/20 border-brand-green text-white' 
                                            : 'bg-[#1A1A1A] border-[#333] text-gray-400 hover:border-gray-500'
                                        }`}
                                    >
                                        {tier}
                                        {selectedTiers.includes(tier) && <CheckCircle2 size={14} className="text-brand-green"/>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            case 'transactions':
                return (
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Transaction Date Range</label>
                            <div className="flex items-center gap-2">
                                <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className={`w-full ${THEME.input} rounded-xl px-4 py-3 outline-none [color-scheme:dark]`} />
                                <span className="text-gray-500">-</span>
                                <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className={`w-full ${THEME.input} rounded-xl px-4 py-3 outline-none [color-scheme:dark]`} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Type</label>
                            <select 
                                value={transactionType}
                                onChange={e => setTransactionType(e.target.value)}
                                className={`w-full ${THEME.input} rounded-xl px-4 py-3 outline-none`}
                            >
                                <option value="all">All Transactions</option>
                                <option value="deposit">Deposits Only</option>
                                <option value="withdrawal">Withdrawals Only</option>
                            </select>
                        </div>
                    </div>
                );
            case 'tournaments':
            case 'revenue':
                return (
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Event Date Range</label>
                            <div className="flex items-center gap-2">
                                <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className={`w-full ${THEME.input} rounded-xl px-4 py-3 outline-none [color-scheme:dark]`} />
                                <span className="text-gray-500">-</span>
                                <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className={`w-full ${THEME.input} rounded-xl px-4 py-3 outline-none [color-scheme:dark]`} />
                            </div>
                        </div>
                    </div>
                );
            default: return null;
        }
    };

    return (
        <div className="animate-in fade-in zoom-in-95 duration-500 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {REPORTS.map(report => (
                    <button 
                        key={report.id}
                        onClick={() => setSelectedReport(report.id)}
                        className={`${THEME.card} border ${THEME.border} p-6 rounded-2xl text-left hover:border-brand-green/50 hover:bg-[#222] transition-all group flex flex-col h-full`}
                    >
                        <div className={`w-12 h-12 rounded-full bg-[#1A1A1A] flex items-center justify-center mb-4 border border-[#333] group-hover:scale-110 transition-transform ${report.color}`}>
                            {report.icon}
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">{report.title}</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">{report.description}</p>
                        
                        <div className="mt-auto pt-6 flex items-center text-brand-green text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                            Configure & Export <FileText size={16} className="ml-2" />
                        </div>
                    </button>
                ))}
            </div>

            {/* Configuration Modal */}
            <Modal
                isOpen={!!selectedReport}
                onClose={() => setSelectedReport(null)}
                title={
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-[#1A1A1A] border border-[#333] ${REPORTS.find(r => r.id === selectedReport)?.color}`}>
                            {REPORTS.find(r => r.id === selectedReport)?.icon}
                        </div>
                        <span>{REPORTS.find(r => r.id === selectedReport)?.title}</span>
                    </div>
                }
                size="md"
            >
                <div className="p-6">
                    <div className="mb-6 p-4 bg-[#1A1A1A] border border-[#333] rounded-xl flex items-start gap-3">
                        <Filter size={18} className="text-gray-500 mt-0.5" />
                        <div className="text-sm text-gray-400">
                            Configure your export filters below. The resulting file will be a <strong>.CSV</strong> compatible with Excel and Google Sheets.
                        </div>
                    </div>

                    {renderFilters()}

                    <div className="mt-8 flex gap-3">
                        <Button 
                            variant="secondary" 
                            fullWidth 
                            onClick={() => setSelectedReport(null)}
                        >
                            Cancel
                        </Button>
                        <Button 
                            variant="primary" 
                            fullWidth 
                            isLoading={isExporting}
                            onClick={handleExport}
                            icon={Download}
                        >
                            Export Data
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default ExportTab;
