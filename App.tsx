import React, { useState, useEffect } from 'react';
import { LayoutDashboard } from 'lucide-react';
import { ViewState } from './types';
import { THEME } from './theme';
import * as DataService from './services/dataService';

import Sidebar from './components/Sidebar';
import MembersView from './components/MembersView';
import TablesView from './components/TablesView';
import TournamentsView from './components/TournamentsView';
import StructuresView from './components/StructuresView';
import DashboardView from './components/DashboardView';
import SettingsView from './components/SettingsView';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('dashboard');

  useEffect(() => {
    // Initialize Theme from Settings
    const settings = DataService.getClubSettings();
    if (settings && settings.theme) {
      const root = document.documentElement;
      root.style.setProperty('--color-brand-green', settings.theme.primaryColor);
      root.style.setProperty('--color-brand-black', settings.theme.backgroundColor);
      root.style.setProperty('--color-brand-dark', settings.theme.cardColor);
      
      // New Typography & Border settings
      if (settings.theme.textColor) root.style.setProperty('--color-brand-white', settings.theme.textColor);
      if (settings.theme.secondaryTextColor) root.style.setProperty('--color-brand-gray', settings.theme.secondaryTextColor);
      if (settings.theme.borderColor) root.style.setProperty('--color-brand-border', settings.theme.borderColor);
    }
  }, []);

  return (
    <div className={`min-h-screen ${THEME.bg} text-white font-sans selection:bg-brand-green/30`}>
      <Sidebar currentView={view} setView={setView} />
      
      <main className="pl-64 h-screen overflow-hidden relative">
        <div className="h-full overflow-auto p-8 scroll-smooth">
          {view === 'dashboard' && <DashboardView />}
          {view === 'members' && <MembersView />}
          {view === 'tables' && <TablesView />}
          {view === 'tournaments' && <TournamentsView />}
          {view === 'structures' && <StructuresView />}
          {view === 'settings' && <SettingsView />}
        </div>
      </main>
    </div>
  );
};

export default App;