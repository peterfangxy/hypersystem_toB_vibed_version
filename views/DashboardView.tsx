
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard,
  FileSpreadsheet,
} from 'lucide-react';
import { Routes, Route, Navigate, NavLink } from 'react-router-dom';
import { THEME } from '../theme';
import { PageHeader, TabContainer } from '../components/ui/PageLayout';
import * as DataService from '../services/dataService';
import { useLanguage } from '../contexts/LanguageContext';
import DashboardOverview from './dashboard/DashboardOverview';
import ExportTab from './dashboard/ExportTab';

// --- Main View ---
const DashboardView = () => {
  const { t } = useLanguage();
  const [clubName, setClubName] = useState('Royal Flush Club');

  useEffect(() => {
    const settings = DataService.getClubSettings();
    if (settings) setClubName(settings.name);
  }, []);

  return (
    <div className="h-full flex flex-col w-full">
      
      <PageHeader 
        title={t('performance.title')}
        subtitle={
            <div className="flex items-center gap-2">
                {clubName}
                <span className="w-1 h-1 rounded-full bg-gray-600"/>
                <span className="text-gray-500 text-sm font-normal">{t('performance.subtitle')}</span>
            </div>
        }
      />

      <TabContainer>
        <NavLink
          to="overview"
          className={({isActive}) => `pb-2.5 px-2 text-sm font-bold uppercase tracking-wider transition-all relative ${
            isActive 
              ? 'text-white' 
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
             {({isActive}) => (
                <>
                    <div className="flex items-center gap-2">
                        <LayoutDashboard size={18} />
                        {t('performance.tabs.overview')}
                    </div>
                    {isActive && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-green shadow-[0_0_10px_rgba(6,193,103,0.5)]" />
                    )}
                </>
             )}
        </NavLink>

        <NavLink
          to="export"
          className={({isActive}) => `pb-2.5 px-2 text-sm font-bold uppercase tracking-wider transition-all relative ${
            isActive 
              ? 'text-white' 
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
             {({isActive}) => (
                <>
                    <div className="flex items-center gap-2">
                        <FileSpreadsheet size={18} />
                        {t('performance.tabs.export')}
                    </div>
                    {isActive && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-green shadow-[0_0_10px_rgba(6,193,103,0.5)]" />
                    )}
                </>
             )}
        </NavLink>
      </TabContainer>

      <div className="flex-1 min-h-0">
          <Routes>
              <Route path="overview" element={<DashboardOverview />} />
              <Route path="export" element={<ExportTab />} />
              <Route index element={<Navigate to="overview" replace />} />
          </Routes>
      </div>
    </div>
  );
};

export default DashboardView;
