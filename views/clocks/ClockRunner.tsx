
import React, { useState, useEffect, useRef } from 'react';
import { 
  Maximize2, 
  X,
  Minimize2,
  Coffee,
  AlertTriangle
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { ClockConfig, Tournament, TournamentStructure, PokerTable } from '../../types';
import * as DataService from '../../services/dataService';
import ClockDisplay from '../../components/clock/ClockDisplay';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTournamentTimer } from '../../hooks/useTournamentTimer';

const ClockRunner = () => {
  const { tournamentId, tableId } = useParams();
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  // Logic State
  const [activeTournament, setActiveTournament] = useState<Tournament | null>(null);
  const [tableInfo, setTableInfo] = useState<PokerTable | null>(null);
  const [status, setStatus] = useState<'loading' | 'active' | 'idle' | 'error'>('loading');
  
  const [config, setConfig] = useState<ClockConfig | null>(null);
  const [structure, setStructure] = useState<TournamentStructure | null>(null);
  const [dimensions, setDimensions] = useState({ w: window.innerWidth, h: window.innerHeight });
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Wake Lock Reference
  const wakeLockRef = useRef<any>(null);

  // Use Custom Hook for Timer Logic
  const { 
      currentTime, 
      timeRemaining, 
      currentLevelIndex, 
      isBreak, 
      isFinished,
      hasStarted
  } = useTournamentTimer(activeTournament, structure);
  
  const [stats, setStats] = useState({
    players: 0,
    entries: 0,
    chipsInPlay: 0,
    avgStack: 0,
    prizePool: 0
  });

  // 0. Fullscreen & Resize Lifecycle & Wake Lock
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

      // --- Wake Lock Logic ---
      const requestWakeLock = async () => {
        const nav: any = navigator;
        if ('wakeLock' in nav) {
          try {
            const lock = await nav.wakeLock.request('screen');
            wakeLockRef.current = lock;
            console.debug('Screen Wake Lock active');
            
            lock.addEventListener('release', () => {
              console.debug('Screen Wake Lock released');
            });
          } catch (err: any) {
            // Suppress NotAllowedError (common in iframes/dev envs without 'allow="screen-wake-lock"')
            if (err.name === 'NotAllowedError') {
                console.warn('Wake Lock request rejected. This is expected in some development environments or iframes.');
            } else {
                console.error(`Wake Lock failed: ${err.message}`);
            }
          }
        }
      };

      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          requestWakeLock();
        }
      };

      // Initialize Listeners
      window.addEventListener('resize', handleResize);
      document.addEventListener('fullscreenchange', handleFullscreenChange);
      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      // Initial checks
      setIsFullscreen(!!document.fullscreenElement);
      requestWakeLock();

      return () => {
          window.removeEventListener('resize', handleResize);
          document.removeEventListener('fullscreenchange', handleFullscreenChange);
          document.removeEventListener('visibilitychange', handleVisibilityChange);
          if (document.fullscreenElement) {
              document.exitFullscreen().catch(() => {});
          }
          // Release Wake Lock
          if (wakeLockRef.current) {
            wakeLockRef.current.release().catch((e: Error) => console.error(e));
            wakeLockRef.current = null;
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
        let totalSec = timeRemaining;
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
        timer: isFinished ? "ENDED" : formatSeconds(timeRemaining),
        blind_countdown: isFinished ? "00:00" : formatSeconds(timeRemaining),
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

export default ClockRunner;
