
import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  Palette, 
  Check, 
  ShieldCheck
} from 'lucide-react';
import { Routes, Route, Navigate, NavLink } from 'react-router-dom';
import { ClubSettings, TeamMember } from '../types';
import * as DataService from '../services/dataService';
import { useLanguage } from '../contexts/LanguageContext';
import RoleConfigModal from '../components/RoleConfigModal';
import InviteMemberModal from '../components/InviteMemberModal';
import { PageHeader, TabContainer } from '../components/ui/PageLayout';
import GeneralSettings from './settings/GeneralSettings';
import TeamSettings from './settings/TeamSettings';
import ThemeSettings from './settings/ThemeSettings';
import AuditLogsTab from './settings/AuditLogsTab';

const SettingsView = () => {
  const { t } = useLanguage();
  const [settings, setSettings] = useState<ClubSettings>(DataService.getClubSettings());
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [isSaved, setIsSaved] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  useEffect(() => {
    setTeam(DataService.getTeamMembers());
  }, []);

  // -- Theme Helper --
  const applyTheme = (theme: typeof settings.theme) => {
      const root = document.documentElement;
      root.style.setProperty('--color-brand-green', theme.primaryColor);
      root.style.setProperty('--color-brand-black', theme.backgroundColor);
      root.style.setProperty('--color-brand-dark', theme.cardColor);
      
      // Typography & Borders
      root.style.setProperty('--color-brand-white', theme.textColor);
      root.style.setProperty('--color-brand-gray', theme.secondaryTextColor);
      root.style.setProperty('--color-brand-border', theme.borderColor);
  };

  const handleSaveSettings = (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      DataService.saveClubSettings(settings);
      applyTheme(settings.theme);
      
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
  };

  const handleThemeChange = (key: keyof typeof settings.theme, value: string) => {
      const newTheme = { ...settings.theme, [key]: value };
      setSettings({ ...settings, theme: newTheme });
      applyTheme(newTheme); // Live preview
  };

  const handleResetTheme = () => {
      const defaults = {
          primaryColor: '#06C167',
          backgroundColor: '#000000',
          cardColor: '#171717',
          textColor: '#FFFFFF',
          secondaryTextColor: '#A3A3A3',
          borderColor: '#333333'
      };
      setSettings(prev => ({ ...prev, theme: defaults }));
      applyTheme(defaults);
  };

  // -- Team Logic --
  const handleSendInvite = (email: string, role: string) => {
      const newMember: TeamMember = {
          id: crypto.randomUUID(),
          fullName: email.split('@')[0], // Simple username assumption
          email: email,
          role: role,
          status: 'Pending',
          avatarUrl: ''
      };
      DataService.saveTeamMember(newMember);
      setTeam(DataService.getTeamMembers());
  };

  const handleRemoveUser = (id: string) => {
      if(window.confirm(t('settings.team.confirmRemove'))) {
          DataService.deleteTeamMember(id);
          setTeam(DataService.getTeamMembers());
      }
  };

  return (
    <div className="h-full flex flex-col w-full">
      <PageHeader 
        title={t('settings.title')}
        subtitle={t('settings.subtitle')}
        actions={isSaved ? (
             <div className="flex items-center gap-2 text-brand-green font-bold animate-in fade-in slide-in-from-bottom-2">
                 <Check size={20} />
                 {t('settings.saved')}
             </div>
        ) : null}
      />

      {/* Tabs Navigation */}
      <TabContainer className="mb-6">
        <NavLink
          to="general"
          className={({isActive}) => `pb-2.5 px-2 text-sm font-bold uppercase tracking-wider transition-all relative ${
            isActive 
              ? 'text-white' 
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
             {({isActive}) => (
                <>
                    <div className="flex items-center gap-2">
                        <Building2 size={18} />
                        {t('settings.tabs.general')}
                    </div>
                    {isActive && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-green shadow-[0_0_10px_rgba(6,193,103,0.5)]" />
                    )}
                </>
             )}
        </NavLink>

        <NavLink
          to="team"
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
                        {t('settings.tabs.team')}
                    </div>
                    {isActive && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-green shadow-[0_0_10px_rgba(6,193,103,0.5)]" />
                    )}
                </>
             )}
        </NavLink>

        <NavLink
          to="appearance"
          className={({isActive}) => `pb-2.5 px-2 text-sm font-bold uppercase tracking-wider transition-all relative ${
            isActive 
              ? 'text-white' 
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
             {({isActive}) => (
                <>
                    <div className="flex items-center gap-2">
                        <Palette size={18} />
                        {t('settings.tabs.appearance')}
                    </div>
                    {isActive && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-green shadow-[0_0_10px_rgba(6,193,103,0.5)]" />
                    )}
                </>
             )}
        </NavLink>

        <NavLink
          to="audit-logs"
          className={({isActive}) => `pb-2.5 px-2 text-sm font-bold uppercase tracking-wider transition-all relative ${
            isActive 
              ? 'text-white' 
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
             {({isActive}) => (
                <>
                    <div className="flex items-center gap-2">
                        <ShieldCheck size={18} />
                        Audit Logs
                    </div>
                    {isActive && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-green shadow-[0_0_10px_rgba(6,193,103,0.5)]" />
                    )}
                </>
             )}
        </NavLink>
      </TabContainer>

      {/* Content Area */}
      <div className="flex-1 pb-10 min-h-0 relative flex flex-col">
          <Routes>
              <Route path="general" element={<GeneralSettings settings={settings} setSettings={setSettings} onSave={handleSaveSettings} />} />
              <Route path="team" element={<TeamSettings team={team} onInvite={() => setIsInviteModalOpen(true)} onRemove={handleRemoveUser} onOpenConfig={() => setIsConfigModalOpen(true)} />} />
              <Route path="appearance" element={<ThemeSettings settings={settings} onThemeChange={handleThemeChange} onReset={handleResetTheme} onSave={handleSaveSettings} />} />
              <Route path="audit-logs" element={<AuditLogsTab />} />
              <Route index element={<Navigate to="general" replace />} />
          </Routes>
      </div>

      <RoleConfigModal 
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
      />

      <InviteMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onInvite={handleSendInvite}
      />
    </div>
  );
};

export default SettingsView;
