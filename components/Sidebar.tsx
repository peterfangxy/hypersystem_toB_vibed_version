import React, { useState, useEffect } from 'react';
import { 
  Users, 
  LayoutDashboard, 
  Trophy, 
  Armchair, 
  User,
  Sliders,
  Settings,
  MonitorPlay
} from 'lucide-react';
import { ViewState } from '../types';
import { THEME } from '../theme';

interface SidebarProps {
  currentView: ViewState;
  setView: (v: ViewState) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Update every minute is usually enough for HH:MM, but let's do 1s to be accurate on minute change
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'members', label: 'Members', icon: Users },
    { id: 'tables', label: 'Tables', icon: Armchair },
    { id: 'tournaments', label: 'Tournaments', icon: Trophy },
    { id: 'structures', label: 'Structures', icon: Sliders },
    { id: 'clocks', label: 'Clocks', icon: MonitorPlay },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className={`w-64 ${THEME.bg} border-r ${THEME.border} flex flex-col h-screen fixed left-0 top-0 z-20`}>
      <div className="p-8">
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <span className="text-brand-green">♠</span> Royal Flush
        </h1>
      </div>
      
      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id as ViewState)}
            className={`w-full flex items-center gap-4 px-4 py-4 rounded-full transition-all duration-200 font-medium ${
              currentView === item.id 
                ? 'bg-[#1F1F1F] text-brand-green' 
                : 'text-gray-400 hover:text-white hover:bg-[#111]'
            }`}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Live Clock */}
      <div className="px-6 pb-6 flex flex-col items-center">
         <div className="text-3xl font-bold text-gray-500 font-mono tracking-tighter">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
         </div>
         <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mt-1">
            {currentTime.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric'})}
         </div>
      </div>

      <div className="p-6 border-t border-[#222]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#222] flex items-center justify-center text-gray-400 border border-[#333]">
            <User size={18} />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Floor Manager</p>
            <p className="text-xs text-gray-500">Admin</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;