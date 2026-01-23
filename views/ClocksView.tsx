
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
  Calendar
} from 'lucide-react';
import { Routes, Route, Navigate, NavLink } from 'react-router-dom';
import { ClockConfig, Tournament, TournamentRegistration, TournamentStructure } from '../types';
import * as DataService from '../services/dataService';
import { THEME } from '../theme';
import ClockEditor from '../components/ClockEditor';
import ClockDisplay from '../components/ClockDisplay';
import { useLanguage } from '../contexts/LanguageContext';

// --- Sub-Component: Live Clock Runner (Overlay) ---
const LiveClockRunner = ({ tournament, onClose }: { tournament: Tournament, onClose: () => void }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timerSeconds, setTimerSeconds] = useState(0); 
  const [config, setConfig] = useState<ClockConfig | null>(null);
  const [structure, setStructure] = useState<TournamentStructure | null>(null);
  const [dimensions, setDimensions] = useState({ w: window.innerWidth, h: window.innerHeight });
  
  // Logic State
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
      // Handle Window Resize
      const handleResize = () => {
          setDimensions({ w: window.innerWidth, h: window.innerHeight });
      };

      // Handle Fullscreen Exit (ESC or F11)
      const handleFullscreenChange = () => {
          if (!document.fullscreenElement) {
              onClose();
          }
      };

      // Handle direct ESC key (fallback if not in fullscreen or browser passes it through)
      const handleKeyDown = (e: KeyboardEvent) => {
          if (e.key === 'Escape') {
              if (document.fullscreenElement) {
                  document.exitFullscreen().catch(console.error);
              } else {
                  onClose();
              }
          }
      };

      window.addEventListener('resize', handleResize);
      document.addEventListener('fullscreenchange', handleFullscreenChange);
      document.addEventListener('keydown', handleKeyDown);
      
      return () => {
          window.removeEventListener('resize', handleResize);
          document.removeEventListener('fullscreenchange', handleFullscreenChange);
          document.removeEventListener('keydown', handleKeyDown);
      };
  }, [onClose]);

  // 1. Initial Data Load (Runs once or when tournament/structure changes)
  useEffect(() => {
    const allConfigs = DataService.getClockConfigs();
    const specificConfig = allConfigs.find(c => c.id === tournament.clockConfigId);
    const defaultConfig = allConfigs.find(c => c.isDefault);
    setConfig(specificConfig || defaultConfig || null);

    const allStructures = DataService.getTournamentStructures();
    const foundStruct = allStructures.find(s => s.id === tournament.structureId);
    setStructure(foundStruct || null);

    // Calculate Stats
    const regs = DataService.getTournamentRegistrations(tournament.id).filter(r => r.status !== 'Cancelled');
    const buyIns = regs.reduce((sum, r) => sum + (r.buyInCount || 0), 0);
    const chips = buyIns * tournament.startingChips;
    const avg = regs.length > 0 ? Math.floor(chips / regs.length) : 0;
    
    setStats({
      players: regs.length,
      entries: buyIns,
      chipsInPlay: chips,
      avgStack: avg,
      prizePool: buyIns * tournament.buyIn
    });
  }, [tournament]);

  // 2. Timer Loop (Calculates exact position in structure based on Wall Clock Time)
  useEffect(() => {
    const updateTimer = () => {
        const now = new Date();
        setCurrentTime(now);

        // Safety check for start time
        if (!tournament.startDate || !tournament.startTime) {
            setTimerSeconds(0);
            return;
        }

        const start = new Date(`${tournament.startDate}T${tournament.startTime}`);
        const elapsedSeconds = (now.getTime() - start.getTime()) / 1000;

        // Case A: Tournament hasn't started yet
        if (elapsedSeconds < 0) {
            if (structure && structure.items.length > 0) {
                 setTimerSeconds(structure.items[0].duration * 60);
            } else {
                 setTimerSeconds(tournament.blindLevelMinutes * 60);
            }
            setCurrentLevelIndex(0);
            setIsBreak(false);
            setIsFinished(false);
            return;
        }

        // Case B: Calculate position in Structure
        if (structure && structure.items.length > 0) {
            let tempElapsed = elapsedSeconds;
            let foundLevel = false;

            for (let i = 0; i < structure.items.length; i++) {
                const item = structure.items[i];
                const itemDurationSec = item.duration * 60;

                if (tempElapsed < itemDurationSec) {
                    // We are currently in this item
                    setTimerSeconds(Math.max(0, Math.floor(itemDurationSec - tempElapsed)));
                    setCurrentLevelIndex(i);
                    setIsBreak(item.type === 'Break');
                    setIsFinished(false);
                    foundLevel = true;
                    break;
                } else {
                    // Passed this item
                    tempElapsed -= itemDurationSec;
                }
            }

            if (!foundLevel) {
                // Elapsed time exceeds total structure duration
                setTimerSeconds(0);
                setCurrentLevelIndex(structure.items.length - 1);
                setIsFinished(true);
                setIsBreak(false);
            }
        } else {
            // Case C: No Structure (Fallback to infinite repeating levels)
            const durationSec = tournament.blindLevelMinutes * 60;
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

    // Run immediately and then interval
    updateTimer(); 
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [tournament, structure]);

  const handleManualClose = () => {
      if (document.fullscreenElement) {
          document.exitFullscreen().catch(err => console.error(err));
      } else {
          onClose();
      }
  };

  if (!config) return <div className="fixed inset-0 bg-black z-50 flex items-center justify-center text-white">Loading configuration...</div>;

  const formatSeconds = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getClockData = () => {
    // Determine Current Item data
    const currentItem = structure?.items[currentLevelIndex];
    
    // Determine Next Level (Look ahead for first item type === 'Level')
    const nextLevelItem = structure?.items.slice(currentLevelIndex + 1).find(i => i.type === 'Level');
    
    // Determine Next Break (Look ahead for first item type === 'Break')
    const nextBreakItem = structure?.items.slice(currentLevelIndex + 1).find(i => i.type === 'Break');
    
    // Helper to calculate time until next break
    const getTimeUntilNextBreak = () => {
        if (!structure || !nextBreakItem) return '---';
        
        // Sum durations from current item (partial) up to break
        // 1. Remaining time in current item
        let totalSec = timerSeconds;
        
        // 2. Duration of all items between current+1 and break
        const breakIndex = structure.items.indexOf(nextBreakItem);
        for (let i = currentLevelIndex + 1; i < breakIndex; i++) {
             totalSec += (structure.items[i].duration * 60);
        }
        
        // Format
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
        tournament_name: tournament.name,
        tournament_desc: tournament.description || '',
        timer: isFinished ? "ENDED" : formatSeconds(timerSeconds),
        blind_countdown: isFinished ? "00:00" : formatSeconds(timerSeconds),
        
        blind_level: isFinished ? "ENDED" : (isBreak ? "BREAK" : getBlindString(currentItem) || tournament.startingBlinds),
        ante: isFinished ? "-" : (isBreak ? "-" : getAnteString(currentItem)),
        
        next_blinds: isFinished ? "-/-" : getBlindString(nextLevelItem),
        next_ante: isFinished ? "-" : getAnteString(nextLevelItem),
        
        players_count: `${stats.players} / ${tournament.maxPlayers}`,
        entries_count: `${stats.entries}`,
        total_chips: stats.chipsInPlay.toLocaleString(),
        avg_stack: stats.avgStack.toLocaleString(),
        payout_total: `$${stats.prizePool.toLocaleString()}`,
        
        starting_chips: tournament.startingChips.toLocaleString(),
        rebuy_limit: tournament.rebuyLimit === 0 ? 'Freezeout' : `${tournament.rebuyLimit} Limit`,
        
        next_break: isFinished ? "-" : getTimeUntilNextBreak(),
        
        current_time: currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        current_date: currentTime.toLocaleDateString(),
        start_time: tournament.startTime || '--:--',
        start_date: tournament.startDate ? new Date(tournament.startDate).toLocaleDateString() : '---',
        est_end_time: tournament.startTime && tournament.startDate 
            ? new Date(new Date(`${tournament.startDate}T${tournament.startTime}`).getTime() + tournament.estimatedDurationMinutes * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
            : '---'
    };
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black overflow-hidden animate-in fade-in duration-300">
      <ClockDisplay 
        config={config} 
        data={getClockData()} 
        // Dynamic scaling based on current window dimensions (which updates on resize/fullscreen)
        scale={Math.min(dimensions.w / 1280, dimensions.h / 720)} 
        className="w-full h-full flex items-center justify-center"
      />
      {/* Hidden control to exit via mouse if needed */}
      <button 
        onClick={handleManualClose}
        className="absolute top-4 right-4 bg-black/30 hover:bg-red-500/80 text-white/50 hover:text-white p-3 rounded-full backdrop-blur-md transition-all z-[110] group cursor-pointer opacity-0 hover:opacity-100"
      >
        <X size={24} />
      </button>
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

// --- Sub-Component: Live Tournaments List ---
const LiveClocks = () => {
    const { t } = useLanguage();
    const [activeTournaments, setActiveTournaments] = useState<Tournament[]>([]);
    const [registrationsMap, setRegistrationsMap] = useState<Record<string, TournamentRegistration[]>>({});
    const [fullScreenTournament, setFullScreenTournament] = useState<Tournament | null>(null);

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
        // Trigger Fullscreen on user gesture (click)
        try {
            if (!document.fullscreenElement) {
                await document.documentElement.requestFullscreen();
            }
        } catch (err) {
            console.warn("Fullscreen denied:", err);
        }
        // Then set state to render the overlay
        setFullScreenTournament(tournament);
    };

    return (
        <div className="flex-1 animate-in fade-in slide-in-from-bottom-2 mt-4">
           {activeTournaments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-500 border border-dashed border-[#222] rounded-3xl bg-[#111]">
                  <div className="w-16 h-16 rounded-full bg-[#1A1A1A] flex items-center justify-center mb-4 text-gray-600">
                      <Radio size={32} />
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-gray-300">No Tournaments Active</h3>
                  <p className="text-sm max-w-md text-center">Set a tournament to "In Progress" or "Registration" in the Tournaments tab to see it appear here for live clock management.</p>
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

           {fullScreenTournament && (
               <LiveClockRunner 
                  tournament={fullScreenTournament} 
                  onClose={() => setFullScreenTournament(null)} 
               />
           )}
        </div>
    );
};

// --- Main View ---
const ClocksView = () => {
  const { t } = useLanguage();

  return (
    <div className="h-full flex flex-col w-full">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-4xl font-bold text-white mb-2">{t('clocks.title')}</h2>
          <p className="text-gray-400">{t('clocks.subtitle')}</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-8 mb-6 border-b border-[#222]">
        <NavLink
          to="live"
          className={({isActive}) => `pb-4 px-2 text-sm font-bold uppercase tracking-wider transition-all relative ${
            isActive 
              ? 'text-white' 
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
             {({isActive}) => (
                <>
                    <div className="flex items-center gap-2">
                        <Play size={18} />
                        LIVE CLOCKS
                    </div>
                    {isActive && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-green shadow-[0_0_10px_rgba(6,193,103,0.5)]" />
                    )}
                </>
             )}
        </NavLink>

        <NavLink
          to="layouts"
          className={({isActive}) => `pb-4 px-2 text-sm font-bold uppercase tracking-wider transition-all relative ${
            isActive 
              ? 'text-white' 
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
             {({isActive}) => (
                <>
                    <div className="flex items-center gap-2">
                        <Layout size={18} />
                        Editor
                    </div>
                    {isActive && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-green shadow-[0_0_10px_rgba(6,193,103,0.5)]" />
                    )}
                </>
             )}
        </NavLink>
      </div>

      <div className="flex-1 relative">
          <Routes>
              <Route path="live" element={<LiveClocks />} />
              <Route path="layouts" element={<ClockLayouts />} />
              <Route index element={<Navigate to="live" replace />} />
          </Routes>
      </div>
    </div>
  );
};

export default ClocksView;
