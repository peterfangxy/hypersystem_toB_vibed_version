
import React, { useState, useEffect } from 'react';
import { 
  Maximize2, 
  Armchair,
  Tv,
  AlertTriangle,
  Coffee
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PokerTable } from '../../types';
import * as DataService from '../../services/dataService';
import { THEME } from '../../theme';
import { useLanguage } from '../../contexts/LanguageContext';

const TableClocksList = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [tables, setTables] = useState<PokerTable[]>([]);
    
    // Map tableId -> Active Tournament Name (if any)
    const [activeTournaments, setActiveTournaments] = useState<Record<string, string | null>>({});

    useEffect(() => {
        refreshData();
        const interval = setInterval(refreshData, 30000); // Poll status
        return () => clearInterval(interval);
    }, []);

    const refreshData = () => {
        const allTables = DataService.getTables().filter(t => t.status !== 'Archived');
        setTables(allTables);

        const allTournaments = DataService.getTournaments();
        
        const mapping: Record<string, string | null> = {};
        
        allTables.forEach(table => {
            const assigned = allTournaments.filter(t => t.tableIds && t.tableIds.includes(table.id));
            
            const inProgress = assigned.filter(t => t.status === 'In Progress');
            const registration = assigned.filter(t => t.status === 'Registration');

            if (inProgress.length > 1) {
                mapping[table.id] = 'ERROR: Overlap';
            } else if (inProgress.length === 1) {
                mapping[table.id] = inProgress[0].name;
            } else if (registration.length > 0) {
                 // Sort to find the one we would show
                 registration.sort((a, b) => {
                    const dateA = new Date(`${a.startDate}T${a.startTime}`).getTime();
                    const dateB = new Date(`${b.startDate}T${b.startTime}`).getTime();
                    return dateA - dateB;
                });
                mapping[table.id] = registration[0].name; // Show the upcoming one
            } else {
                mapping[table.id] = null;
            }
        });
        setActiveTournaments(mapping);
    };

    const handleOpenTableClock = async (tableId: string) => {
        try { if (!document.fullscreenElement) await document.documentElement.requestFullscreen(); } catch (e) {}
        navigate(`/clocks/tables/${tableId}`);
    };

    return (
        <div className="flex-1 animate-in fade-in slide-in-from-bottom-2 mt-4">
            {tables.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-500 border border-dashed border-[#222] rounded-3xl bg-[#111]">
                    <div className="w-16 h-16 rounded-full bg-[#1A1A1A] flex items-center justify-center mb-4 text-gray-600">
                        <Armchair size={32} />
                    </div>
                    <h3 className="text-lg font-bold mb-2 text-gray-300">{t('clocks.empty.noTables')}</h3>
                    <p className="text-sm max-w-md text-center">{t('clocks.empty.noTablesDesc')}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {tables.map(table => {
                        const activeTournamentName = activeTournaments[table.id];
                        const isError = activeTournamentName === 'ERROR: Overlap';
                        const isActive = !!activeTournamentName && !isError;

                        return (
                            <div key={table.id} className="bg-[#111] border border-[#333] rounded-3xl p-6 flex flex-col hover:border-brand-green/30 transition-colors shadow-xl group">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-white">{table.name}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-red-500 animate-pulse' : (isError ? 'bg-orange-500 animate-pulse' : 'bg-gray-600')}`} />
                                            <span className={`text-xs font-bold uppercase tracking-wider ${isActive ? 'text-red-500' : (isError ? 'text-orange-500' : 'text-gray-500')}`}>
                                                {isActive ? 'LIVE' : (isError ? 'ERROR' : 'IDLE')}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-2 bg-[#222] rounded-full text-gray-400">
                                        <Tv size={18} />
                                    </div>
                                </div>

                                <div className={`flex-1 flex flex-col justify-center items-center py-6 text-center rounded-xl mb-6 border ${isError ? 'bg-red-900/10 border-red-900/30' : 'bg-[#1A1A1A] border-[#222]'}`}>
                                    {isError ? (
                                        <>
                                            <AlertTriangle size={24} className="text-red-500 mb-2" />
                                            <span className="text-red-400 font-bold text-sm">Conflict Detected</span>
                                        </>
                                    ) : isActive ? (
                                        <>
                                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">{t('clocks.live.assignedTo')}</span>
                                            <span className="text-brand-green font-bold text-sm line-clamp-2 px-2">{activeTournamentName}</span>
                                        </>
                                    ) : (
                                        <>
                                            <Coffee size={24} className="text-gray-600 mb-2" />
                                            <span className="text-gray-500 font-bold text-xs">{t('clocks.live.idle')}</span>
                                        </>
                                    )}
                                </div>

                                <button 
                                    onClick={() => handleOpenTableClock(table.id)}
                                    className={`mt-auto w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${THEME.buttonPrimary}`}
                                >
                                    <Maximize2 size={18} /> Open Clock
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default TableClocksList;
