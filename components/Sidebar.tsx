
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  LayoutDashboard, 
  Trophy, 
  Armchair, 
  User,
  Sliders,
  Settings,
  MonitorPlay,
  Languages
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { THEME } from '../theme';
import { useLanguage } from '../contexts/LanguageContext';

const Sidebar: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const location = useLocation();
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const menuItems = [
    { id: '/dashboard', label: t('sidebar.dashboard'), icon: LayoutDashboard },
    { id: '/members', label: t('sidebar.members'), icon: Users },
    { id: '/tournaments', label: t('sidebar.tournaments'), icon: Trophy },
    { id: '/structures', label: t('sidebar.structures'), icon: Sliders },
    { id: '/tables', label: t('sidebar.tables'), icon: Armchair },
    { id: '/clocks', label: t('sidebar.clocks'), icon: MonitorPlay },
    { id: '/settings', label: t('sidebar.settings'), icon: Settings },
  ];

  const isActive = (path: string) => location.pathname.startsWith(path);

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'zh' : 'en');
  };

  return (
    <div className={`w-64 ${THEME.bg} border-r ${THEME.border} flex flex-col h-screen fixed left-0 top-0 z-20`}>
      <div className="p-8 flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <span className="text-brand-green">♠</span> Royal Flush
        </h1>
      </div>
      
      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => navigate(item.id)}
            className={`w-full flex items-center gap-4 px-4 py-4 rounded-full transition-all duration-200 font-medium ${
              isActive(item.id)
                ? 'bg-[#1F1F1F] text-brand-green' 
                : 'text-gray-400 hover:text-white hover:bg-[#111]'
            }`}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Language Toggle */}
      <div className="px-6 pb-2">
          <button 
            onClick={toggleLanguage}
            className="flex items-center gap-2 text-[9px] font-bold text-gray-500 hover:text-white transition-colors bg-[#222] px-2 py-1 rounded-lg w-full justify-center uppercase tracking-wider"
          >
              <Languages size={10} />
              {language === 'en' ? 'English' : '中文'}
          </button>
      </div>

      {/* Live Clock */}
      <div className="px-6 pb-6 flex flex-col items-center">
         <div className="text-xl font-bold text-gray-500 font-mono tracking-tighter">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
         </div>
         <div className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mt-0.5">
            {currentTime.toLocaleDateString(language === 'en' ? undefined : 'zh-CN', { weekday: 'short', month: 'short', day: 'numeric'})}
         </div>
      </div>

      <div className="p-6 border-t border-[#222]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#222] flex items-center justify-center text-gray-400 border border-[#333]">
            <User size={18} />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{t('sidebar.floorManager')}</p>
            <p className="text-xs text-gray-500">{t('sidebar.admin')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
