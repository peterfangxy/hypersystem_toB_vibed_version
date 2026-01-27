
import React from 'react';
import { 
  Users,
  Settings,
} from 'lucide-react';
import { Routes, Route, Navigate, NavLink } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { PageHeader, TabContainer } from '../components/ui/PageLayout';
import MembersList from './members/MembersList';
import MembershipSettings from './members/MembershipSettings';

// --- Main MembersView Component ---
const MembersView = () => {
  const { t } = useLanguage();

  return (
    <div className="h-full flex flex-col w-full">
      <PageHeader
        title={t('members.title')}
        subtitle={t('members.subtitle')}
      />

      <TabContainer>
        <NavLink
          to="manage"
          className={({isActive}) => `pb-2.5 px-2 text-sm font-bold uppercase tracking-wider transition-all relative ${
            isActive 
              ? 'text-white' 
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
             {({isActive}) => (
                <>
                    <div className="flex items-center gap-2">
                        <Users size={18} />
                        {t('members.tabs.manage')}
                    </div>
                    {isActive && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-green shadow-[0_0_10px_rgba(6,193,103,0.5)]" />
                    )}
                </>
             )}
        </NavLink>

        <NavLink
          to="settings"
          className={({isActive}) => `pb-2.5 px-2 text-sm font-bold uppercase tracking-wider transition-all relative ${
            isActive 
              ? 'text-white' 
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
             {({isActive}) => (
                <>
                    <div className="flex items-center gap-2">
                        <Settings size={18} />
                        {t('members.tabs.settings')}
                    </div>
                    {isActive && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-green shadow-[0_0_10px_rgba(6,193,103,0.5)]" />
                    )}
                </>
             )}
        </NavLink>
      </TabContainer>

      <div className="flex-1 min-h-0 relative">
          <Routes>
              <Route path="manage" element={<MembersList />} />
              <Route path="settings" element={<MembershipSettings />} />
              <Route index element={<Navigate to="manage" replace />} />
          </Routes>
      </div>
    </div>
  );
};

export default MembersView;
