import React, { useState } from 'react';
import { LayoutDashboard } from 'lucide-react';
import { ViewState } from './types';
import { THEME } from './theme';

import Sidebar from './components/Sidebar';
import MembersView from './components/MembersView';
import TablesView from './components/TablesView';
import TournamentsView from './components/TournamentsView';
import StructuresView from './components/StructuresView';
import DashboardView from './components/DashboardView';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('dashboard');

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
        </div>
      </main>
    </div>
  );
};

export default App;