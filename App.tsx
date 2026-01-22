
import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { THEME } from './theme';
import * as DataService from './services/dataService';
import { LanguageProvider } from './contexts/LanguageContext';

import Sidebar from './components/Sidebar';
import MembersView from './components/MembersView';
import TablesView from './components/TablesView';
import TournamentsView from './components/TournamentsView';
import StructuresView from './components/StructuresView';
import DashboardView from './components/DashboardView';
import SettingsView from './components/SettingsView';
import ClocksView from './components/ClocksView';

const App: React.FC = () => {
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
    <LanguageProvider>
      <Router>
        <div className={`min-h-screen ${THEME.bg} text-white font-sans selection:bg-brand-green/30`}>
          <Sidebar />
          
          <main className="pl-64 h-screen overflow-hidden relative">
            <div className="h-full overflow-auto p-8 scroll-smooth">
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<DashboardView />} />
                <Route path="/members" element={<MembersView />} />
                <Route path="/tables" element={<TablesView />} />
                <Route path="/tournaments/*" element={<TournamentsView />} />
                <Route path="/structures/*" element={<StructuresView />} />
                <Route path="/clocks/*" element={<ClocksView />} />
                <Route path="/settings/*" element={<SettingsView />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </div>
          </main>
        </div>
      </Router>
    </LanguageProvider>
  );
};

export default App;
