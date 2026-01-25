
import React, { useState, useEffect } from 'react';
import { Trophy, Info } from 'lucide-react';
import { THEME } from '../../theme';
import { AnalyticsService, TimeRange, DashboardKPIs, ChartDataPoint, RecentWinnerStats } from '../../services/analyticsService';
import RevenueChart from '../../components/RevenueChart';

const DashboardOverview = () => {
    const [timeRange, setTimeRange] = useState<TimeRange>('7d');
    const [kpis, setKpis] = useState<DashboardKPIs>({
        revenue: 0,
        tournamentsHosted: 0,
        avgPrizePool: 0,
        activeMembers: 0
    });
    const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
    const [recentWinners, setRecentWinners] = useState<RecentWinnerStats[]>([]);

    useEffect(() => {
        // Load Analytics
        const stats = AnalyticsService.getStats(timeRange);
        setKpis(stats.kpis);
        setChartData(stats.chartData);
        setRecentWinners(stats.winners);
    }, [timeRange]);

    const KPICard = ({ title, value, icon, info }: { title: string, value: string, icon?: React.ReactNode, info?: string }) => (
        <div className={`${THEME.card} p-5 rounded-2xl border border-[#222] shadow-sm relative group hover:border-[#333] transition-all`}>
            <div className="flex justify-between items-start mb-2">
                <h3 className="text-sm font-bold text-gray-400">{title}</h3>
                {info && (
                    <div title={info} className="cursor-help">
                        <Info size={14} className="text-gray-600" />
                    </div>
                )}
            </div>
            <div className="text-2xl font-bold text-white tracking-tight">{value}</div>
        </div>
    );

    return (
        <div className="animate-in fade-in duration-500 space-y-8 pb-12">
            {/* Time Range Controls */}
            <div className="flex justify-end">
                <div className="flex bg-[#111] p-1 rounded-full border border-[#222]">
                    <button 
                        onClick={() => setTimeRange('7d')}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                            timeRange === '7d' 
                            ? 'bg-brand-green/10 text-brand-green border border-brand-green/20' 
                            : 'text-gray-500 hover:text-white'
                        }`}
                    >
                        Last 7 days
                    </button>
                    <button 
                        onClick={() => setTimeRange('30d')}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                            timeRange === '30d' 
                            ? 'bg-brand-green/10 text-brand-green border border-brand-green/20' 
                            : 'text-gray-500 hover:text-white'
                        }`}
                    >
                        Last 30 days
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard 
                    title="Sales (Revenue)" 
                    value={`$${kpis.revenue.toLocaleString()}`} 
                    info="Total fees collected from buy-ins, rebuys, and add-ons."
                />
                <KPICard 
                    title="Tournaments" 
                    value={kpis.tournamentsHosted.toString()} 
                    info="Number of tournaments scheduled or completed in this period."
                />
                <KPICard 
                    title="Avg. Prize Pool" 
                    value={`$${Math.round(kpis.avgPrizePool).toLocaleString()}`} 
                    info="Average total prize pool per tournament."
                />
                <KPICard 
                    title="Active Members" 
                    value={kpis.activeMembers.toString()} 
                    info="Unique players who registered for at least one event."
                />
            </div>

            {/* Sales Chart */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        Sales by Day
                        <Info size={14} className="text-gray-600" />
                    </h3>
                </div>
                
                <div className={`${THEME.card} border ${THEME.border} rounded-3xl p-6`}>
                    <div className="mb-6">
                        <span className="text-xs text-gray-500 uppercase font-bold tracking-wider block mb-1">Total Sales ({timeRange === '7d' ? '7 Days' : '30 Days'})</span>
                        <div className="text-3xl font-bold text-white">${kpis.revenue.toLocaleString()}</div>
                    </div>
                    <RevenueChart data={chartData} height={200} />
                </div>
            </div>

            {/* Recent Winners */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-white">Recent Champions</h3>
                <div className={`${THEME.card} border ${THEME.border} rounded-3xl overflow-hidden`}>
                    {recentWinners.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            No recent winners recorded.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-[#1A1A1A] text-xs uppercase text-gray-500 font-bold tracking-wider border-b border-[#262626]">
                                    <tr>
                                        <th className="px-6 py-4">Tournament</th>
                                        <th className="px-6 py-4">Winner</th>
                                        <th className="px-6 py-4 text-right">Prize</th>
                                        <th className="px-6 py-4 text-right">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#262626]">
                                    {recentWinners.map((winner, idx) => (
                                        <tr key={idx} className="hover:bg-[#222] transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-white text-sm">{winner.tournamentName}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-yellow-500 font-medium text-sm">
                                                    <Trophy size={14} />
                                                    {winner.winnerName}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="font-mono text-brand-green font-bold text-sm">
                                                    ${winner.amount.toLocaleString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right text-sm text-gray-500">
                                                {winner.date ? new Date(winner.date).toLocaleDateString() : 'N/A'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardOverview;
