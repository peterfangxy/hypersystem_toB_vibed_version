
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
  Clock
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
  const [timerSeconds, setTimerSeconds] = useState(tournament.blindLevelMinutes * 60); 
  const [config, setConfig] = useState<ClockConfig | null>(null);
  const [structure, setStructure] = useState<TournamentStructure | null>(null);
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0); // Mock level progression
  
  const [stats, setStats] = useState({
    players: 0,
    entries: 0,
    chipsInPlay: 0,
    avgStack: 0,
    prizePool: 0
  });

  useEffect(() => {
    const allConfigs = DataService.getClockConfigs();
    const specificConfig = allConfigs.find(c => c.id === tournament.clockConfigId);
    const defaultConfig = allConfigs.find(c => c.isDefault);
    setConfig(specificConfig || defaultConfig || null);

    const allStructures = DataService.getTournamentStructures();
    const foundStruct = allStructures.find(s => s.id === tournament.structureId);
    setStructure(foundStruct || null);

    const regs = DataService.getTournamentRegistrations(tournament.id).filter(r => r.status !== 'Cancelled');
    const buyIns = regs.reduce((sum, r) => sum + (r.buyInCount || 0), 0);
    const chips = buyIns * tournament.startingChips;
    // Simple avg stack calc (Total Chips / Total Players) - in real app, divide by remaining players
    const avg = regs.length > 0 ? Math.floor(chips / regs.length) : 0;
    
    setStats({
      players: regs.length,
      entries: buyIns,
      chipsInPlay: chips,
      avgStack: avg,
      prizePool: buyIns * tournament.buyIn
    });

    const timer = setInterval(() => {
      setCurrentTime(new Date());
      setTimerSeconds(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [tournament]);

  if (!config) return <div className="fixed inset-0 bg-black z-50 flex items-center justify-center text-white">Loading configuration...</div>;

  const formatSeconds = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getFieldValue = (type: string) => {
    // Derive structure info
    const levels = structure?.items.filter(i => i.type === 'Level') || [];
    const currentLevel = levels[currentLevelIndex];
    const nextLevel = levels[currentLevelIndex + 1];

    switch(type) {
      case 'tournament_name': return tournament.name;
      case 'tournament_desc': return tournament.description || '';
      case 'timer': return formatSeconds(timerSeconds);
      case 'blind_countdown': return formatSeconds(timerSeconds);
      
      // Blinds & Structure
      case 'blind_level': 
          return currentLevel ? `${currentLevel.smallBlind}/${currentLevel.bigBlind}` : tournament.startingBlinds;
      case 'ante': 
          return currentLevel ? (currentLevel.ante || 0).toString() : '0';
      case 'next_blinds': 
          return nextLevel ? `${nextLevel.smallBlind}/${nextLevel.bigBlind}` : '-/-';
      case 'next_ante': 
          return nextLevel ? (nextLevel.ante || 0).toString() : '-';
      case 'next_break':
          return '---'; // Requires tracking breaks in time sequence

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
        const inProgress = allTournaments.filter(t => t.status === 'In Progress');
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
                  <h3 className="text-lg font-bold mb-2 text-gray-300">No Tournaments In Progress</h3>
                  <p className="text-sm max-w-md text-center">Start a tournament from the "Tournaments" tab to see it appear here for live clock management.</p>
              </div>
           ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeTournaments.map(tournament => {
                      const regs = registrationsMap[tournament.id] || [];
                      const activePlayers = regs.filter(r => r.status !== 'Cancelled').length;
                      
                      return (
                          <div key={tournament.id} className="bg-[#111] border border-[#333] rounded-3xl p-6 flex flex-col hover:border-brand-green/30 transition-colors shadow-xl">
                              <div className="flex justify-between items-start mb-4">
                                  <div>
                                      <div className="flex items-center gap-2 mb-1">
                                          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                                          <span className="text-xs font-bold text-red-500 uppercase tracking-wider">Live Now</span>
                                      </div>
                                      <h3 className="text-xl font-bold text-white">{tournament.name}</h3>
                                  </div>
                                  <div className="bg-[#1A1A1A] p-2 rounded-xl text-gray-400">
                                      <Trophy size={20} />
                                  </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4 mb-6">
                                  <div className="bg-[#1A1A1A] p-3 rounded-xl">
                                      <div className="text-[10px] uppercase text-gray-500 font-bold mb-1">Players</div>
                                      <div className="text-lg font-mono font-bold text-white flex items-center gap-2">
                                          <Users size={16} className="text-brand-green"/>
                                          {activePlayers}
                                      </div>
                                  </div>
                                  <div className="bg-[#1A1A1A] p-3 rounded-xl">
                                      <div className="text-[10px] uppercase text-gray-500 font-bold mb-1">Blinds</div>
                                      <div className="text-lg font-mono font-bold text-white flex items-center gap-2">
                                          <Clock size={16} className="text-blue-400"/>
                                          {tournament.startingBlinds}
                                      </div>
                                  </div>
                              </div>

                              <div className="mt-auto pt-4 border-t border-[#222]">
                                  <button 
                                      onClick={() => setFullScreenTournament(tournament)}
                                      className="w-full bg-brand-green text-black font-bold py-3 rounded-xl hover:bg-[#05a357] transition-colors flex items-center justify-center gap-2 shadow-lg shadow-green-500/20"
                                  >
                                      <Maximize2 size={18} />
                                      Launch Display
                                  </button>
                              </div>
                          </div>
                      );
                  })}
              </div>
           )}

           {/* Full Screen Overlay */}
           {fullScreenTournament && (
              <LiveClockRunner 
                  tournament={fullScreenTournament} 
                  onClose={() => setFullScreenTournament(null)} 
              />
           )}
        </div>
    );
};

const ClocksView = () => {
  const { t } = useLanguage();

  return (
    <div className="h-full flex flex-col w-full relative">
      {/* Header */}
      <div className="flex justify-between items-end mb-8 relative z-10 pointer-events-none">
        <div className="pointer-events-auto">
          <h2 className="text-4xl font-bold text-white mb-2">{t('clocks.title')}</h2>
          <p className="text-gray-400">{t('clocks.subtitle')}</p>
        </div>
        
        {/* The Action Button is rendered inside ClockLayouts now */}
        <div className="pointer-events-auto"></div> 
      </div>

      {/* Tabs */}
      <div className="flex gap-8 mb-6 border-b border-[#222] relative z-10">
        <NavLink
          to="layouts"
          className={({isActive}) => `pb-4 px-2 text-sm font-bold uppercase tracking-wider transition-all relative flex items-center gap-2 ${
            isActive ? 'text-white' : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          {({isActive}) => (
             <>
                <Layout size={18} />
                Clock Layouts
                {isActive && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-green shadow-[0_0_10px_rgba(6,193,103,0.5)]" />}
             </>
          )}
        </NavLink>

        <NavLink
          to="live"
          className={({isActive}) => `pb-4 px-2 text-sm font-bold uppercase tracking-wider transition-all relative flex items-center gap-2 ${
            isActive ? 'text-white' : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          {({isActive}) => (
             <>
                <Radio size={18} className={isActive ? 'text-red-500 animate-pulse' : ''} />
                Live Tournaments
                {isActive && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-green shadow-[0_0_10px_rgba(6,193,103,0.5)]" />}
             </>
          )}
        </NavLink>
      </div>

      {/* Content Area */}
      <div className="flex-1 relative">
          <Routes>
              <Route path="layouts" element={<ClockLayouts />} />
              <Route path="live" element={<LiveClocks />} />
              <Route index element={<Navigate to="layouts" replace />} />
          </Routes>
      </div>
    </div>
  );
};

export default ClocksView;
