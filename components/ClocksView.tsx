
import React, { useState, useEffect } from 'react';
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
  Coins
} from 'lucide-react';
import { Routes, Route, Navigate, NavLink } from 'react-router-dom';
import { ClockConfig, Tournament, TournamentRegistration, TournamentStructure } from '../types';
import * as DataService from '../services/dataService';
import { THEME } from '../theme';
import ClockEditor from './ClockEditor';
import { useLanguage } from '../contexts/LanguageContext';

// --- Sub-Component: Live Clock Runner (Overlay) ---
const LiveClockRunner = ({ tournament, onClose }: { tournament: Tournament, onClose: () => void }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timerSeconds, setTimerSeconds] = useState(0); 
  const [config, setConfig] = useState<ClockConfig | null>(null);
  const [structure, setStructure] = useState<TournamentStructure | null>(null);
  
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

  if (!config) return <div className="fixed inset-0 bg-black z-50 flex items-center justify-center text-white">Loading configuration...</div>;

  const formatSeconds = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getFieldValue = (type: string) => {
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
        // const s = Math.floor(totalSec % 60);
        
        if (h > 0) return `${h}h ${m}m`;
        return `${m}m`;
    };

    switch(type) {
      case 'tournament_name': return tournament.name;
      case 'tournament_desc': return tournament.description || '';
      case 'timer': return isFinished ? "ENDED" : formatSeconds(timerSeconds);
      case 'blind_countdown': return isFinished ? "00:00" : formatSeconds(timerSeconds);
      
      // Blinds & Structure
      case 'blind_level': 
          if (isFinished) return "ENDED";
          if (isBreak) return "BREAK";
          if (currentItem && currentItem.type === 'Level') {
               return `${currentItem.smallBlind}/${currentItem.bigBlind}`;
          }
          return tournament.startingBlinds; // Fallback

      case 'ante': 
          if (isFinished) return "-";
          if (isBreak) return "-";
          if (currentItem && currentItem.type === 'Level') {
               return (currentItem.ante || 0).toString();
          }
          return '0';

      case 'next_blinds': 
          if (isFinished) return "-/-";
          if (nextLevelItem) return `${nextLevelItem.smallBlind}/${nextLevelItem.bigBlind}`;
          return '---';

      case 'next_ante': 
          if (isFinished) return "-";
          if (nextLevelItem) return (nextLevelItem.ante || 0).toString();
          return '-';

      case 'next_break':
          if (isFinished) return "-";
          return getTimeUntilNextBreak();

      // Stats
      case 'players_count': return `${stats.players} / ${tournament.maxPlayers}`;
      case 'entries_count': return `${stats.entries}`;
      case 'total_chips': return stats.chipsInPlay.toLocaleString();
      case 'avg_stack': return stats.avgStack.toLocaleString();
      case 'payout_total': return `$${stats.prizePool.toLocaleString()}`;
      
      // Configs
      case 'starting_chips': return tournament.startingChips.toLocaleString();
      case 'rebuy_limit': return tournament.rebuyLimit === 0 ? 'Freezeout' : `${tournament.rebuyLimit} Limit`;

      // Time
      case 'current_time': return currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      case 'current_date': return currentTime.toLocaleDateString();
      case 'start_time': return tournament.startTime || '--:--';
      case 'start_date': return tournament.startDate ? new Date(tournament.startDate).toLocaleDateString() : '---';
      case 'est_end_time': 
          if (tournament.startTime && tournament.startDate) {
              const start = new Date(`${tournament.startDate}T${tournament.startTime}`);
              // Add estimated minutes
              const end = new Date(start.getTime() + tournament.estimatedDurationMinutes * 60000);
              if (!isNaN(end.getTime())) {
                  return end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              }
          }
          return '---';

      default: return '---';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black overflow-hidden animate-in fade-in duration-500">
      <div 
        className="w-full h-full relative"
        style={{ backgroundColor: config.backgroundColor }}
      >
        {config.fields.map(field => (
           <div
              key={field.id}
              style={{
                  position: 'absolute',
                  left: `${field.x}%`,
                  top: `${field.y}%`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: config.fields.findIndex(f => f.id === field.id),
                  color: field.color,
                  fontSize: `${field.fontSize}px`,
                  fontWeight: field.fontWeight,
                  textAlign: field.align,
                  whiteSpace: 'nowrap'
              }}
           >
              {field.type.startsWith('shape_') ? (
                  <div style={{
                      width: field.width, 
                      height: field.height, 
                      backgroundColor: field.color,
                      border: `${field.borderWidth || 0}px solid ${field.borderColor || 'transparent'}`,
                      borderRadius: field.type.includes('circle') ? '50%' : '0'
                  }}/>
              ) : field.type === 'line' ? (
                  <div style={{
                      width: field.width,
                      height: field.height,
                      backgroundColor: field.color,
                      borderRadius: '999px'
                  }} />
              ) : (
                  <>
                    {field.showLabel && field.labelText && (
                      <div className="text-[0.4em] opacity-70 mb-[0.1em] tracking-widest uppercase">{field.labelText}</div>
                    )}
                    {field.type === 'custom_text' ? field.customText : getFieldValue(field.type)}
                  </>
              )}
           </div>
        ))}
      </div>
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 bg-black/50 hover:bg-red-500/80 text-white p-3 rounded-full backdrop-blur-md transition-all z-[60] group"
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

    useEffect(() => {
        setClocks(DataService.getClockConfigs());
    }, [isEditorOpen]); // Refresh when editor closes

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
              {clocks.map((clock) => (
                  <div key={clock.id} className={`${THEME.card} border ${THEME.border} rounded-3xl overflow-hidden group hover:border-brand-green/30 transition-all shadow-lg`}>
                      <div 
                          className="aspect-video w-full relative p-4 flex flex-col items-center justify-center text-center select-none"
                          style={{ backgroundColor: clock.backgroundColor || '#222' }}
                      >
                          <div className="text-white opacity-80 scale-75 transform-gpu pointer-events-none">
                              <div className="text-2xl font-bold mb-2">12:34</div>
                              <div className="text-xs uppercase opacity-70">BLINDS 100/200</div>
                          </div>
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
                              <button 
                                  onClick={() => handleEdit(clock)}
                                  className="p-3 bg-white text-black rounded-full hover:scale-110 transition-transform font-bold"
                                  title={t('common.edit')}
                              >
                                  <Edit2 size={20} />
                              </button>
                          </div>
                      </div>
                      <div className="p-5 flex justify-between items-center">
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
        // We consider 'In Progress' as live. Can also allow 'Registration' if needed for pre-game screens.
        const inProgress = allTournaments.filter(t => t.status === 'In Progress' || t.status === 'Registration');
        setActiveTournaments(inProgress);

        const regMap: Record<string, TournamentRegistration[]> = {};
        inProgress.forEach(t => {
            regMap[t.id] = DataService.getTournamentRegistrations(t.id);
        });
        setRegistrationsMap(regMap);
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
                                  <div>
                                      <div className="flex items-center gap-2 mb-1">
                                          <span className={`w-2 h-2 rounded-full animate-pulse ${isLive ? 'bg-red-500' : 'bg-blue-500'}`}></span>
                                          <span className={`text-xs font-bold ${isLive ? 'text-red-500' : 'text-blue-500'}`}>
                                            {isLive ? 'LIVE' : 'REGISTRATION'}
                                          </span>
                                      </div>
                                      <h3 className="text-xl font-bold text-white line-clamp-1">{tournament.name}</h3>
                                  </div>
                                  <div className="p-2 bg-[#222] rounded-full text-gray-400">
                                      <Trophy size={18} />
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
                                onClick={() => setFullScreenTournament(tournament)}
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
                        {t('sidebar.liveClock')}
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
