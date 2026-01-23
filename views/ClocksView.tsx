
import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  MonitorPlay, 
  Trash2, 
  Edit2, 
  Layout, 
  Radio, 
  Maximize2, 
  X,
  Users,
  Trophy,
  Clock,
  Play,
  Coins,
  Calendar,
  Minimize2,
  Armchair,
  Tv,
  AlertTriangle,
  Coffee
} from 'lucide-react';
import { Routes, Route, Navigate, NavLink, useNavigate, useParams } from 'react-router-dom';
import { ClockConfig, Tournament, TournamentRegistration, TournamentStructure, PokerTable } from '../types';
import * as DataService from '../services/dataService';
import { THEME } from '../theme';
import ClockEditor from '../components/ClockEditor';
import ClockDisplay from '../components/ClockDisplay';
import { useLanguage } from '../contexts/LanguageContext';
import { PageHeader, TabContainer } from '../components/ui/PageLayout';

// --- Sub-Component: Unified Clock Runner (Page) ---
const ClockRunner = () => {
  const { tournamentId, tableId } = useParams();
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  // Logic State
  const [activeTournament, setActiveTournament] = useState<Tournament | null>(null);
  const [tableInfo, setTableInfo] = useState<PokerTable | null>(null);
  const [status, setStatus] = useState<'loading' | 'active' | 'idle' | 'error'>('loading');
  
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timerSeconds, setTimerSeconds] = useState(0); 
  const [config, setConfig] = useState<ClockConfig | null>(null);
  const [structure, setStructure] = useState<TournamentStructure | null>(null);
  const [dimensions, setDimensions] = useState({ w: window.innerWidth, h: window.innerHeight });
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [isBreak, setIsBreak] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  
  const [stats, setStats] = useState({
    players: 0,
    entries: 0,
    chipsInPlay: 0,
    avgStack: 0,
    prizePool: 0
  });

  // 0. Fullscreen & Resize Lifecycle
  useEffect(() => {
      const handleResize = () => {
          setDimensions({ w: window.innerWidth, h: window.innerHeight });
      };

      const handleFullscreenChange = () => {
          const isFs = !!document.fullscreenElement;
          setIsFullscreen(isFs);
          if (!isFs) {
              // Navigate back based on context
              if (tableId) navigate('/clocks/tables');
              else navigate('/clocks/tournaments');
          }
      };

      window.addEventListener('resize', handleResize);
      document.addEventListener('fullscreenchange', handleFullscreenChange);
      
      setIsFullscreen(!!document.fullscreenElement);

      return () => {
          window.removeEventListener('resize', handleResize);
          document.removeEventListener('fullscreenchange', handleFullscreenChange);
          if (document.fullscreenElement) {
              document.exitFullscreen().catch(() => {});
          }
      };
  }, [navigate, tableId]);

  // 1. Resolve Tournament Logic (Table vs Tournament Mode)
  useEffect(() => {
      // MODE A: Specific Tournament ID (Tournament Clock)
      if (tournamentId) {
          const t = DataService.getTournaments().find(t => t.id === tournamentId);
          if (t) {
              setActiveTournament(t);
              setStatus('active');
          } else {
              navigate('/clocks/tournaments');
          }
          return;
      }

      // MODE B: Table ID (Table Clock)
      if (tableId) {
          const table = DataService.getTables().find(t => t.id === tableId);
          if (!table) {
              navigate('/clocks/tables');
              return;
          }
          setTableInfo(table);

          // Get all assigned tournaments
          const assignedTournaments = DataService.getTournaments().filter(t => 
              t.tableIds && t.tableIds.includes(tableId)
          );

          const inProgress = assignedTournaments.filter(t => t.status === 'In Progress');
          const registration = assignedTournaments.filter(t => t.status === 'Registration');

          // Logic:
          // 1. In Progress takes absolute priority.
          // 2. If > 1 In Progress, it's an error (physical overlap).
          // 3. If 0 In Progress, look for Registration.
          // 4. If Registration exists, pick the earliest start time (upcoming).
          
          if (inProgress.length > 1) {
              setStatus('error');
              setActiveTournament(null);
          } else if (inProgress.length === 1) {
              setActiveTournament(inProgress[0]);
              setStatus('active');
          } else if (registration.length > 0) {
              // Sort by date to find the next upcoming event
              registration.sort((a, b) => {
                  const dateA = new Date(`${a.startDate}T${a.startTime}`).getTime();
                  const dateB = new Date(`${b.startDate}T${b.startTime}`).getTime();
                  return dateA - dateB;
              });
              setActiveTournament(registration[0]);
              setStatus('active');
          } else {
              setStatus('idle');
              setActiveTournament(null);
          }
      }
  }, [tournamentId, tableId, navigate]);

  // 2. Load Clock Data if Active
  useEffect(() => {
    if (status !== 'active' || !activeTournament) return;

    const allConfigs = DataService.getClockConfigs();
    const specificConfig = allConfigs.find(c => c.id === activeTournament.clockConfigId);
    const defaultConfig = allConfigs.find(c => c.isDefault);
    // If no specific config is found, use default. If no default, use the first one available.
    setConfig(specificConfig || defaultConfig || allConfigs[0] || null);

    const allStructures = DataService.getTournamentStructures();
    const foundStruct = allStructures.find(s => s.id === activeTournament.structureId);
    setStructure(foundStruct || null);

    // Calculate Stats
    const regs = DataService.getTournamentRegistrations(activeTournament.id).filter(r => r.status !== 'Cancelled');
    const buyIns = regs.reduce((sum, r) => sum + (r.buyInCount || 0), 0);
    const chips = buyIns * activeTournament.startingChips;
    const avg = regs.length > 0 ? Math.floor(chips / regs.length) : 0;
    
    setStats({
      players: regs.length,
      entries: buyIns,
      chipsInPlay: chips,
      avgStack: avg,
      prizePool: buyIns * activeTournament.buyIn
    });
  }, [activeTournament, status]);

  // 3. Timer Loop
  useEffect(() => {
    if (status !== 'active' || !activeTournament) return;

    const updateTimer = () => {
        const now = new Date();
        setCurrentTime(now);

        if (!activeTournament.startDate || !activeTournament.startTime) {
            setTimerSeconds(0);
            return;
        }

        const start = new Date(`${activeTournament.startDate}T${activeTournament.startTime}`);
        const elapsedSeconds = (now.getTime() - start.getTime()) / 1000;

        if (elapsedSeconds < 0) {
            // Before start, show first level duration
            if (structure && structure.items.length > 0) {
                 setTimerSeconds(structure.items[0].duration * 60);
            } else {
                 setTimerSeconds(activeTournament.blindLevelMinutes * 60);
            }
            setCurrentLevelIndex(0);
            setIsBreak(false);
            setIsFinished(false);
            return;
        }

        if (structure && structure.items.length > 0) {
            let tempElapsed = elapsedSeconds;
            let foundLevel = false;

            for (let i = 0; i < structure.items.length; i++) {
                const item = structure.items[i];
                const itemDurationSec = item.duration * 60;

                if (tempElapsed < itemDurationSec) {
                    setTimerSeconds(Math.max(0, Math.floor(itemDurationSec - tempElapsed)));
                    setCurrentLevelIndex(i);
                    setIsBreak(item.type === 'Break');
                    setIsFinished(false);
                    foundLevel = true;
                    break;
                } else {
                    tempElapsed -= itemDurationSec;
                }
            }

            if (!foundLevel) {
                setTimerSeconds(0);
                setCurrentLevelIndex(structure.items.length - 1);
                setIsFinished(true);
                setIsBreak(false);
            }
        } else {
            const durationSec = activeTournament.blindLevelMinutes * 60;
            if (durationSec > 0) {
                const levelIdx = Math.floor(elapsedSeconds / durationSec);
                const secondsIntoLevel = elapsedSeconds % durationSec;
                setTimerSeconds(Math.floor(durationSec - secondsIntoLevel));
                setCurrentLevelIndex(levelIdx);
                setIsBreak(false);
                setIsFinished(false);
            } else {
                setTimerSeconds(0);
            }
        }
    };

    updateTimer(); 
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [activeTournament, structure, status]);

  const toggleFullscreen = async () => {
      if (!document.fullscreenElement) {
          try { await document.documentElement.requestFullscreen(); } catch(e) { console.error(e); }
      } else {
          document.exitFullscreen().catch(console.error);
      }
  };

  const handleClose = () => {
      if (document.fullscreenElement) {
          document.exitFullscreen().catch(console.error);
      } else {
          if (tableId) navigate('/clocks/tables');
          else navigate('/clocks/tournaments');
      }
  };

  // --- Render Functions ---

  if (status === 'loading') {
      return <div className="fixed inset-0 bg-black z-50 flex items-center justify-center text-white font-bold">{t('common.processing')}</div>;
  }

  // --- Screensaver: Idle ---
  if (status === 'idle') {
      return (
          <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center text-center p-8 animate-in fade-in">
              <div className="w-32 h-32 rounded-full bg-[#111] flex items-center justify-center mb-8 border border-[#333]">
                  <Coffee size={64} className="text-gray-600" />
              </div>
              <h1 className="text-6xl font-bold text-white mb-4 tracking-tight">{tableInfo?.name}</h1>
              <p className="text-2xl text-gray-500 font-medium uppercase tracking-widest">{t('clocks.live.idle')}</p>
              
              {/* Floating Date/Time */}
              <div className="absolute bottom-12 text-gray-600 font-mono text-xl">
                  {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} • {new Date().toLocaleDateString()}
              </div>

              {/* Controls */}
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 hover:opacity-100 transition-opacity">
                  <button onClick={toggleFullscreen} className="bg-black/30 p-3 rounded-full text-white/50 hover:text-white backdrop-blur-md">
                      {isFullscreen ? <Minimize2 size={24}/> : <Maximize2 size={24}/>}
                  </button>
                  <button onClick={handleClose} className="bg-black/30 p-3 rounded-full text-white/50 hover:text-white backdrop-blur-md">
                      <X size={24} />
                  </button>
              </div>
          </div>
      );
  }

  // --- Error: Overlap ---
  if (status === 'error') {
      return (
          <div className="fixed inset-0 z-[100] bg-red-950 flex flex-col items-center justify-center text-center p-8 animate-in zoom-in-95">
              <div className="p-6 bg-red-900/50 rounded-full mb-6 text-red-200 animate-pulse">
                  <AlertTriangle size={80} />
              </div>
              <h1 className="text-5xl font-bold text-white mb-4">{t('clocks.live.duplicate')}</h1>
              <p className="text-xl text-red-200 max-w-xl">{t('clocks.live.duplicateDesc')}</p>
              
              <div className="absolute top-4 right-4 flex gap-2">
                  <button onClick={handleClose} className="bg-black/30 p-3 rounded-full text-white/80 hover:text-white">
                      <X size={24} />
                  </button>
              </div>
          </div>
      );
  }

  // --- Active Clock Render ---
  // If config is missing, show a fallback error rather than null
  if (!activeTournament) return null;
  
  if (!config) {
      return (
          <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center text-center p-8">
              <AlertTriangle size={48} className="text-red-500 mb-4" />
              <h2 className="text-2xl font-bold text-white">Clock Configuration Not Found</h2>
              <p className="text-gray-500">Please assign a valid clock layout to this tournament.</p>
              <button onClick={handleClose} className="mt-6 bg-[#333] px-6 py-2 rounded-full text-white hover:bg-[#444]">Close</button>
          </div>
      );
  }

  const formatSeconds = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getClockData = () => {
    const currentItem = structure?.items[currentLevelIndex];
    const nextLevelItem = structure?.items.slice(currentLevelIndex + 1).find(i => i.type === 'Level');
    const nextBreakItem = structure?.items.slice(currentLevelIndex + 1).find(i => i.type === 'Break');
    
    const getTimeUntilNextBreak = () => {
        if (!structure || !nextBreakItem) return '---';
        let totalSec = timerSeconds;
        const breakIndex = structure.items.indexOf(nextBreakItem);
        for (let i = currentLevelIndex + 1; i < breakIndex; i++) {
             totalSec += (structure.items[i].duration * 60);
        }
        const h = Math.floor(totalSec / 3600);
        const m = Math.floor((totalSec % 3600) / 60);
        if (h > 0) return `${h}h ${m}m`;
        return `${m}m`;
    };

    const getBlindString = (item: any) => {
        if (!item) return '-';
        if (item.type === 'Level') return `${item.smallBlind}/${item.bigBlind}`;
        return '-';
    };

    const getAnteString = (item: any) => {
        if (!item || item.type !== 'Level') return '-';
        return (item.ante || 0).toString();
    };

    return {
        tournament_name: activeTournament.name,
        tournament_desc: activeTournament.description || '',
        timer: isFinished ? "ENDED" : formatSeconds(timerSeconds),
        blind_countdown: isFinished ? "00:00" : formatSeconds(timerSeconds),
        blind_level: isFinished ? "ENDED" : (isBreak ? "BREAK" : getBlindString(currentItem) || activeTournament.startingBlinds),
        ante: isFinished ? "-" : (isBreak ? "-" : getAnteString(currentItem)),
        next_blinds: isFinished ? "-/-" : getBlindString(nextLevelItem),
        next_ante: isFinished ? "-" : getAnteString(nextLevelItem),
        players_count: `${stats.players} / ${activeTournament.maxPlayers}`,
        entries_count: `${stats.entries}`,
        total_chips: stats.chipsInPlay.toLocaleString(),
        avg_stack: stats.avgStack.toLocaleString(),
        payout_total: `$${stats.prizePool.toLocaleString()}`,
        starting_chips: activeTournament.startingChips.toLocaleString(),
        rebuy_limit: activeTournament.rebuyLimit === 0 ? 'Freezeout' : `${activeTournament.rebuyLimit} Limit`,
        next_break: isFinished ? "-" : getTimeUntilNextBreak(),
        current_time: currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        current_date: currentTime.toLocaleDateString(),
        start_time: activeTournament.startTime || '--:--',
        start_date: activeTournament.startDate ? new Date(activeTournament.startDate).toLocaleDateString() : '---',
        est_end_time: activeTournament.startTime && activeTournament.startDate 
            ? new Date(new Date(`${activeTournament.startDate}T${activeTournament.startTime}`).getTime() + activeTournament.estimatedDurationMinutes * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
            : '---'
    };
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black overflow-hidden animate-in fade-in duration-500">
      <ClockDisplay 
        config={config} 
        data={getClockData()} 
        scale={Math.min(dimensions.w / 1280, dimensions.h / 720)} 
        className="w-full h-full flex items-center justify-center"
      />
      
      <div className="absolute top-4 right-4 flex gap-2 z-[110] opacity-0 hover:opacity-100 transition-opacity">
          <button 
            onClick={toggleFullscreen}
            className="bg-black/30 hover:bg-black/60 text-white/50 hover:text-white p-3 rounded-full backdrop-blur-md transition-all"
          >
            {isFullscreen ? <Minimize2 size={24} /> : <Maximize2 size={24} />}
          </button>
          
          <button 
            onClick={handleClose}
            className="bg-black/30 hover:bg-red-500/80 text-white/50 hover:text-white p-3 rounded-full backdrop-blur-md transition-all"
          >
            <X size={24} />
          </button>
      </div>
    </div>
  );
};

// --- Sub-Component: Table Clocks List ---
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
                                            <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-brand-green animate-pulse' : (isError ? 'bg-red-500 animate-pulse' : 'bg-gray-600')}`} />
                                            <span className="text-xs text-gray-500 font-bold uppercase">{isActive ? 'Active' : (isError ? 'Error' : 'Idle')}</span>
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

// --- Sub-Component: Tournament Clocks List (Formerly LiveClocks) ---
const TournamentClocksList = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [activeTournaments, setActiveTournaments] = useState<Tournament[]>([]);
    const [registrationsMap, setRegistrationsMap] = useState<Record<string, TournamentRegistration[]>>({});

    useEffect(() => {
        refreshData();
        const interval = setInterval(refreshData, 30000);
        return () => clearInterval(interval);
    }, []);

    const refreshData = () => {
        const allTournaments = DataService.getTournaments();
        const inProgress = allTournaments.filter(t => t.status === 'In Progress' || t.status === 'Registration');
        
        inProgress.sort((a, b) => {
            const dateA = new Date(`${a.startDate}T${a.startTime}`).getTime();
            const dateB = new Date(`${b.startDate}T${b.startTime}`).getTime();
            return dateA - dateB;
        });

        setActiveTournaments(inProgress);

        const regMap: Record<string, TournamentRegistration[]> = {};
        inProgress.forEach(t => {
            regMap[t.id] = DataService.getTournamentRegistrations(t.id);
        });
        setRegistrationsMap(regMap);
    };

    const handleOpenClock = async (tournament: Tournament) => {
        try { if (!document.fullscreenElement) await document.documentElement.requestFullscreen(); } catch (e) {}
        navigate(`/clocks/tournaments/${tournament.id}`);
    };

    return (
        <div className="flex-1 animate-in fade-in slide-in-from-bottom-2 mt-4">
           {activeTournaments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-500 border border-dashed border-[#222] rounded-3xl bg-[#111]">
                  <div className="w-16 h-16 rounded-full bg-[#1A1A1A] flex items-center justify-center mb-4 text-gray-600">
                      <Radio size={32} />
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-gray-300">{t('clocks.empty.noTournaments')}</h3>
                  <p className="text-sm max-w-md text-center">{t('clocks.empty.noTournamentsDesc')}</p>
              </div>
           ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeTournaments.map(tournament => {
                      const regs = registrationsMap[tournament.id] || [];
                      const activePlayers = regs.filter(r => r.status !== 'Cancelled').length;
                      const isLive = tournament.status === 'In Progress';
                      
                      const totalBuyIns = regs.reduce((sum, r) => sum + (r.buyInCount || 0), 0);
                      const prizePool = totalBuyIns * tournament.buyIn;

                      return (
                          <div key={tournament.id} className="bg-[#111] border border-[#333] rounded-3xl p-6 flex flex-col hover:border-brand-green/30 transition-colors shadow-xl group">
                              <div className="flex justify-between items-start mb-4">
                                  <div className="flex-1 min-w-0 pr-2">
                                      <div className="flex items-center gap-2 mb-1">
                                          <span className={`w-2 h-2 rounded-full animate-pulse ${isLive ? 'bg-red-500' : 'bg-blue-500'}`}></span>
                                          <span className={`text-xs font-bold ${isLive ? 'text-red-500' : 'text-blue-500'}`}>
                                            {isLive ? 'LIVE' : 'REGISTRATION'}
                                          </span>
                                      </div>
                                      <h3 className="text-xl font-bold text-white truncate" title={tournament.name}>{tournament.name}</h3>
                                  </div>
                                  <div className="p-2 bg-[#222] rounded-full text-gray-400 shrink-0">
                                      <Trophy size={18} />
                                  </div>
                              </div>
                              
                              <div className="flex items-center gap-4 text-gray-400 text-xs mb-4 bg-[#1A1A1A] p-2 rounded-lg border border-[#222]">
                                  <div className="flex items-center gap-1.5">
                                      <Calendar size={14} />
                                      {tournament.startDate ? new Date(tournament.startDate).toLocaleDateString() : 'TBD'}
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                      <Clock size={14} />
                                      {tournament.startTime || 'TBD'}
                                  </div>
                              </div>

                              <div className="flex items-center gap-4 text-gray-500 text-sm mb-6">
                                  <div className="flex items-center gap-1.5">
                                      <Users size={14} />
                                      {activePlayers} Players
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                      <Coins size={14} />
                                      ${prizePool.toLocaleString()} Prize Pool
                                  </div>
                              </div>

                              <button 
                                onClick={() => handleOpenClock(tournament)}
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

// --- Sub-Component: Layouts Grid ---
const ClockLayouts = () => {
    const { t } = useLanguage();
    const [clocks, setClocks] = useState<ClockConfig[]>([]);
    const [editingClock, setEditingClock] = useState<ClockConfig | undefined>(undefined);
    const [isEditorOpen, setIsEditorOpen] = useState(false);

    // Refs for grid scaling
    const gridItemRef = useRef<HTMLDivElement>(null);
    const [gridScale, setGridScale] = useState(0.3);

    useEffect(() => {
        setClocks(DataService.getClockConfigs());
    }, [isEditorOpen]);

    useEffect(() => {
        const updateScale = () => {
            if (gridItemRef.current) {
                // Calculate scale based on container width vs base 1280
                const width = gridItemRef.current.offsetWidth;
                setGridScale(width / 1280);
            }
        };
        setTimeout(updateScale, 100);
        window.addEventListener('resize', updateScale);
        return () => window.removeEventListener('resize', updateScale);
    }, [clocks]);

    const handleCreate = () => {
        setEditingClock(undefined);
        setIsEditorOpen(true);
    };

    const handleEdit = (clock: ClockConfig) => {
        setEditingClock(clock);
        setIsEditorOpen(true);
    };

    const handleDelete = (id: string) => {
        if (window.confirm(t('common.delete') + "?")) {
            DataService.deleteClockConfig(id);
            setClocks(DataService.getClockConfigs());
        }
    };

    const handleSave = (config: ClockConfig) => {
        DataService.saveClockConfig(config);
        setIsEditorOpen(false);
    };

    const mockData = {
        tournament_name: "Mock Tournament",
        tournament_desc: "Daily Deepstack",
        timer: "20:00",
        blind_countdown: "20:00",
        blind_level: "100/200",
        next_blinds: "200/400",
        ante: "200",
        next_ante: "400",
        players_count: "45 / 100",
        entries_count: "45",
        total_chips: "900,000",
        avg_stack: "20,000",
        payout_total: "$4,500",
        next_break: "1h 40m",
        starting_chips: "20,000",
        rebuy_limit: "1 Rebuy",
        current_time: "12:00 PM",
        current_date: "10/24/2023",
        start_time: "11:00 AM",
        start_date: "10/24/2023",
        est_end_time: "06:00 PM"
    };

    if (isEditorOpen) {
        return <ClockEditor 
            initialConfig={editingClock} 
            onSave={handleSave} 
            onClose={() => setIsEditorOpen(false)} 
        />;
    }

    return (
        <>
          <div className="absolute top-0 right-0 -mt-20"> 
               <button 
                  onClick={handleCreate}
                  className={`${THEME.buttonPrimary} px-6 py-3 rounded-full font-semibold shadow-lg shadow-green-500/20 flex items-center gap-2 transition-transform hover:scale-105 active:scale-95`}
              >
                  <Plus size={20} strokeWidth={2.5} />
                  {t('clocks.btn.new')}
              </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2 mt-4">
              {clocks.map((clock, index) => (
                  <div key={clock.id} className={`${THEME.card} border ${THEME.border} rounded-3xl overflow-hidden group hover:border-brand-green/30 transition-all shadow-lg`}>
                      <div 
                          ref={index === 0 ? gridItemRef : null} // Measure first item
                          className="aspect-video w-full relative bg-[#000] overflow-hidden"
                      >
                          {/* Preview Render */}
                          <ClockDisplay 
                             config={clock}
                             data={mockData}
                             scale={gridScale}
                          />

                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm z-10">
                              <button 
                                  onClick={() => handleEdit(clock)}
                                  className="p-3 bg-white text-black rounded-full hover:scale-110 transition-transform font-bold"
                                  title={t('common.edit')}
                              >
                                  <Edit2 size={20} />
                              </button>
                          </div>
                      </div>
                      <div className="p-5 flex justify-between items-center relative z-20 bg-[#171717]">
                          <div>
                              <h3 className="text-lg font-bold text-white">{clock.name}</h3>
                              <p className="text-xs text-gray-500">{clock.fields.length} {t('clocks.card.activeWidgets')}</p>
                          </div>
                          <button 
                              onClick={() => handleDelete(clock.id)}
                              className="text-gray-600 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-[#222]"
                          >
                              <Trash2 size={18} />
                          </button>
                      </div>
                  </div>
              ))}
              
              <button 
                  onClick={handleCreate}
                  className="border-2 border-dashed border-[#222] rounded-3xl p-6 flex flex-col items-center justify-center text-gray-600 hover:border-brand-green/50 hover:text-brand-green/80 transition-all min-h-[250px] aspect-video"
              >
                  <div className="w-14 h-14 rounded-full bg-[#111] flex items-center justify-center mb-4">
                      <MonitorPlay size={28} />
                  </div>
                  <span className="font-bold text-lg">{t('clocks.empty.title')}</span>
                  <span className="text-sm mt-1 opacity-70">{t('clocks.empty.subtitle')}</span>
              </button>
          </div>
        </>
    );
};

// --- Main View ---
const ClocksView = () => {
  const { t } = useLanguage();

  return (
    <div className="h-full flex flex-col w-full">
      <PageHeader 
        title={t('clocks.title')} 
        subtitle={t('clocks.subtitle')} 
      />

      {/* Tabs Navigation */}
      <TabContainer>
        <NavLink
          to="tournaments"
          className={({isActive}) => `pb-2.5 px-2 text-sm font-bold uppercase tracking-wider transition-all relative ${
            isActive 
              ? 'text-white' 
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
             {({isActive}) => (
                <>
                    <div className="flex items-center gap-2">
                        <Play size={18} />
                        {t('clocks.tabs.tournaments')}
                    </div>
                    {isActive && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-green shadow-[0_0_10px_rgba(6,193,103,0.5)]" />
                    )}
                </>
             )}
        </NavLink>

        <NavLink
          to="tables"
          className={({isActive}) => `pb-2.5 px-2 text-sm font-bold uppercase tracking-wider transition-all relative ${
            isActive 
              ? 'text-white' 
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
             {({isActive}) => (
                <>
                    <div className="flex items-center gap-2">
                        <Tv size={18} />
                        {t('clocks.tabs.tables')}
                    </div>
                    {isActive && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-green shadow-[0_0_10px_rgba(6,193,103,0.5)]" />
                    )}
                </>
             )}
        </NavLink>

        <NavLink
          to="layouts"
          className={({isActive}) => `pb-2.5 px-2 text-sm font-bold uppercase tracking-wider transition-all relative ${
            isActive 
              ? 'text-white' 
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
             {({isActive}) => (
                <>
                    <div className="flex items-center gap-2">
                        <Layout size={18} />
                        {t('clocks.tabs.layouts')}
                    </div>
                    {isActive && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-green shadow-[0_0_10px_rgba(6,193,103,0.5)]" />
                    )}
                </>
             )}
        </NavLink>
      </TabContainer>

      <div className="flex-1 relative">
          <Routes>
              <Route path="tournaments" element={<TournamentClocksList />} />
              <Route path="tournaments/:tournamentId" element={<ClockRunner />} />
              <Route path="tables" element={<TableClocksList />} />
              <Route path="tables/:tableId" element={<ClockRunner />} />
              <Route path="layouts" element={<ClockLayouts />} />
              {/* Backwards compatibility / Default redirect */}
              <Route path="live/*" element={<Navigate to="../tournaments" replace />} />
              <Route index element={<Navigate to="tournaments" replace />} />
          </Routes>
      </div>
    </div>
  );
};

export default ClocksView;
