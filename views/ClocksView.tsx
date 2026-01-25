
import React from 'react';
import { 
  Layout, 
  Play,
  Tv,
} from 'lucide-react';
import { Routes, Route, Navigate, NavLink } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { PageHeader, TabContainer } from '../components/ui/PageLayout';

import TournamentClocksList from './clocks/TournamentClocksList';
import TableClocksList from './clocks/TableClocksList';
import ClockLayouts from './clocks/ClockLayouts';
import ClockRunner from './clocks/ClockRunner';

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
