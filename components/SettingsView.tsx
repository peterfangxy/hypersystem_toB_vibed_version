import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  Palette, 
  Save, 
  Plus, 
  Trash2, 
  ShieldAlert, 
  Check, 
  Mail, 
  Phone, 
  MapPin, 
  RotateCcw
} from 'lucide-react';
import { THEME } from '../theme';
import { ClubSettings, TeamMember, AccessRole } from '../types';
import * as DataService from '../services/dataService';

type TabType = 'general' | 'roles' | 'theme';

const SettingsView = () => {
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [settings, setSettings] = useState<ClubSettings>(DataService.getClubSettings());
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [isSaved, setIsSaved] = useState(false);

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
  const handleInviteUser = () => {
      // Mock invite
      const newMember: TeamMember = {
          id: crypto.randomUUID(),
          fullName: 'New User',
          email: 'user@example.com',
          role: 'Viewer',
          status: 'Pending',
          avatarUrl: ''
      };
      DataService.saveTeamMember(newMember);
      setTeam(DataService.getTeamMembers());
  };

  const handleRemoveUser = (id: string) => {
      if(window.confirm('Revoke access for this user?')) {
          DataService.deleteTeamMember(id);
          setTeam(DataService.getTeamMembers());
      }
  };

  const getRoleBadge = (role: AccessRole) => {
      switch(role) {
          case 'Owner': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
          case 'Admin': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
          case 'Operator': return 'bg-brand-green/10 text-brand-green border-brand-green/20';
          default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
      }
  };

  return (
    <div className="h-full flex flex-col max-w-5xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-4xl font-bold text-white mb-2">Settings</h2>
          <p className="text-gray-400">Manage club details, access and appearance</p>
        </div>
        {isSaved && (
             <div className="flex items-center gap-2 text-brand-green font-bold animate-in fade-in slide-in-from-bottom-2">
                 <Check size={20} />
                 Changes Saved
             </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-8 mb-8 border-b border-[#222]">
        <button
          onClick={() => setActiveTab('general')}
          className={`pb-4 px-2 text-sm font-bold uppercase tracking-wider transition-all relative ${
            activeTab === 'general' 
              ? 'text-white' 
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <Building2 size={18} />
            Club Details
          </div>
          {activeTab === 'general' && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-green shadow-[0_0_10px_rgba(6,193,103,0.5)]" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('roles')}
          className={`pb-4 px-2 text-sm font-bold uppercase tracking-wider transition-all relative ${
            activeTab === 'roles' 
              ? 'text-white' 
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <Users size={18} />
            Team & Roles
          </div>
          {activeTab === 'roles' && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-green shadow-[0_0_10px_rgba(6,193,103,0.5)]" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('theme')}
          className={`pb-4 px-2 text-sm font-bold uppercase tracking-wider transition-all relative ${
            activeTab === 'theme' 
              ? 'text-white' 
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <Palette size={18} />
            Appearance
          </div>
          {activeTab === 'theme' && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-green shadow-[0_0_10px_rgba(6,193,103,0.5)]" />
          )}
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 pb-10">
          
          {/* --- GENERAL TAB --- */}
          {activeTab === 'general' && (
              <form onSubmit={handleSaveSettings} className={`${THEME.card} border ${THEME.border} rounded-3xl p-8 space-y-6 animate-in fade-in`}>
                  <div className="space-y-4">
                      <h3 className="text-lg font-bold text-white mb-6">Club Information</h3>
                      
                      <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-300">Club Name</label>
                          <input 
                              type="text"
                              required
                              value={settings.name}
                              onChange={e => setSettings({...settings, name: e.target.value})}
                              className={`w-full ${THEME.input} rounded-xl px-4 py-3 outline-none transition-all`}
                          />
                      </div>

                      <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-300">Logo URL</label>
                          <input 
                              type="url"
                              value={settings.logoUrl}
                              onChange={e => setSettings({...settings, logoUrl: e.target.value})}
                              className={`w-full ${THEME.input} rounded-xl px-4 py-3 outline-none transition-all`}
                              placeholder="https://..."
                          />
                      </div>
                  </div>

                  <div className="pt-6 border-t border-[#222] space-y-4">
                      <h3 className="text-lg font-bold text-white mb-6">Contact & Location</h3>
                      
                      <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                              <MapPin size={14}/> Address
                          </label>
                          <input 
                              type="text"
                              value={settings.address}
                              onChange={e => setSettings({...settings, address: e.target.value})}
                              className={`w-full ${THEME.input} rounded-xl px-4 py-3 outline-none transition-all`}
                          />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-1">
                              <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                  <Mail size={14}/> Email
                              </label>
                              <input 
                                  type="email"
                                  value={settings.contactEmail}
                                  onChange={e => setSettings({...settings, contactEmail: e.target.value})}
                                  className={`w-full ${THEME.input} rounded-xl px-4 py-3 outline-none transition-all`}
                              />
                          </div>
                          <div className="space-y-1">
                              <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                  <Phone size={14}/> Phone
                              </label>
                              <input 
                                  type="tel"
                                  value={settings.contactPhone}
                                  onChange={e => setSettings({...settings, contactPhone: e.target.value})}
                                  className={`w-full ${THEME.input} rounded-xl px-4 py-3 outline-none transition-all`}
                              />
                          </div>
                      </div>
                  </div>

                  <div className="pt-6">
                      <button type="submit" className={`${THEME.buttonPrimary} px-8 py-3 rounded-xl font-bold flex items-center gap-2`}>
                          <Save size={18} /> Save Changes
                      </button>
                  </div>
              </form>
          )}

          {/* --- ROLES TAB --- */}
          {activeTab === 'roles' && (
              <div className={`${THEME.card} border ${THEME.border} rounded-3xl overflow-hidden animate-in fade-in`}>
                  <div className="p-6 border-b border-[#222] flex justify-between items-center">
                      <div>
                          <h3 className="text-lg font-bold text-white">Team Members</h3>
                          <p className="text-sm text-gray-500">Manage operator access and permissions</p>
                      </div>
                      <button 
                         onClick={handleInviteUser}
                         className={`${THEME.buttonPrimary} px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2`}
                      >
                          <Plus size={16} /> Invite Member
                      </button>
                  </div>
                  
                  <div className="divide-y divide-[#222]">
                      {team.map(member => (
                          <div key={member.id} className="p-4 flex items-center justify-between hover:bg-[#222] transition-colors group">
                              <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-full bg-[#111] flex items-center justify-center text-gray-400 font-bold">
                                      {member.avatarUrl ? <img src={member.avatarUrl} className="w-full h-full rounded-full object-cover"/> : member.fullName.charAt(0)}
                                  </div>
                                  <div>
                                      <div className="font-bold text-white">{member.fullName}</div>
                                      <div className="text-xs text-gray-500">{member.email}</div>
                                  </div>
                              </div>
                              <div className="flex items-center gap-6">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getRoleBadge(member.role)}`}>
                                      {member.role}
                                  </span>
                                  
                                  <div className="text-xs text-gray-600">
                                      {member.status === 'Active' ? (
                                          <span className="text-green-500/50">Active now</span>
                                      ) : (
                                          <span className="text-yellow-500/50">Invite Pending</span>
                                      )}
                                  </div>

                                  <button 
                                    onClick={() => handleRemoveUser(member.id)}
                                    disabled={member.role === 'Owner'}
                                    className="p-2 text-gray-600 hover:text-red-500 hover:bg-[#111] rounded-full transition-colors disabled:opacity-0"
                                  >
                                      <Trash2 size={16} />
                                  </button>
                              </div>
                          </div>
                      ))}
                  </div>
                  <div className="p-4 bg-[#1A1A1A] border-t border-[#222]">
                      <div className="flex items-start gap-3 p-3 bg-blue-500/5 border border-blue-500/10 rounded-lg">
                          <ShieldAlert size={18} className="text-blue-400 shrink-0 mt-0.5" />
                          <div className="text-xs text-gray-400">
                              <strong className="text-blue-400 block mb-1">Access Control</strong>
                              Full RBAC (Role Based Access Control) is currently in read-only mode for this demo. 
                              Invited users will appear here but email delivery is simulated.
                          </div>
                      </div>
                  </div>
              </div>
          )}

          {/* --- THEME TAB --- */}
          {activeTab === 'theme' && (
              <div className={`${THEME.card} border ${THEME.border} rounded-3xl p-8 space-y-8 animate-in fade-in`}>
                   <div className="flex justify-between items-start">
                      <div>
                          <h3 className="text-lg font-bold text-white mb-2">UI Customization</h3>
                          <p className="text-gray-400 text-sm">Personalize the application colors to match your brand.</p>
                      </div>
                      <button 
                         onClick={handleResetTheme}
                         className="text-xs font-bold text-gray-500 hover:text-white flex items-center gap-1 bg-[#222] px-3 py-1.5 rounded-lg border border-[#333]"
                      >
                          <RotateCcw size={12} /> Reset to Default
                      </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      
                      {/* Group 1: Brand Colors */}
                      <div className="md:col-span-3">
                          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 border-b border-[#222] pb-2">Base Brand Colors</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              <div className="space-y-3">
                                  <label className="text-sm font-bold text-gray-300 block">Primary Accent</label>
                                  <div className="flex items-center gap-3">
                                      <input 
                                        type="color" 
                                        value={settings.theme.primaryColor}
                                        onChange={(e) => handleThemeChange('primaryColor', e.target.value)}
                                        className="w-12 h-12 rounded-xl cursor-pointer bg-transparent border-none p-0"
                                      />
                                      <div className="flex flex-col">
                                          <span className="text-xs text-gray-500 font-mono">{settings.theme.primaryColor}</span>
                                          <span className="text-[10px] text-gray-600">Buttons, Highlights</span>
                                      </div>
                                  </div>
                              </div>

                              <div className="space-y-3">
                                  <label className="text-sm font-bold text-gray-300 block">App Background</label>
                                  <div className="flex items-center gap-3">
                                      <input 
                                        type="color" 
                                        value={settings.theme.backgroundColor}
                                        onChange={(e) => handleThemeChange('backgroundColor', e.target.value)}
                                        className="w-12 h-12 rounded-xl cursor-pointer bg-transparent border-none p-0"
                                      />
                                      <div className="flex flex-col">
                                          <span className="text-xs text-gray-500 font-mono">{settings.theme.backgroundColor}</span>
                                          <span className="text-[10px] text-gray-600">Main page background</span>
                                      </div>
                                  </div>
                              </div>

                              <div className="space-y-3">
                                  <label className="text-sm font-bold text-gray-300 block">Card Surface</label>
                                  <div className="flex items-center gap-3">
                                      <input 
                                        type="color" 
                                        value={settings.theme.cardColor}
                                        onChange={(e) => handleThemeChange('cardColor', e.target.value)}
                                        className="w-12 h-12 rounded-xl cursor-pointer bg-transparent border-none p-0"
                                      />
                                      <div className="flex flex-col">
                                          <span className="text-xs text-gray-500 font-mono">{settings.theme.cardColor}</span>
                                          <span className="text-[10px] text-gray-600">Panels, Modals</span>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </div>

                      {/* Group 2: Typography & Borders */}
                      <div className="md:col-span-3 mt-4">
                           <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 border-b border-[#222] pb-2">Typography & Borders</h4>
                           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              
                              <div className="space-y-3">
                                  <label className="text-sm font-bold text-gray-300 block">Primary Text</label>
                                  <div className="flex items-center gap-3">
                                      <input 
                                        type="color" 
                                        value={settings.theme.textColor || '#FFFFFF'}
                                        onChange={(e) => handleThemeChange('textColor', e.target.value)}
                                        className="w-12 h-12 rounded-xl cursor-pointer bg-transparent border-none p-0"
                                      />
                                      <div className="flex flex-col">
                                          <span className="text-xs text-gray-500 font-mono">{settings.theme.textColor}</span>
                                          <span className="text-[10px] text-gray-600">Headings, Body</span>
                                      </div>
                                  </div>
                              </div>

                              <div className="space-y-3">
                                  <label className="text-sm font-bold text-gray-300 block">Secondary Text</label>
                                  <div className="flex items-center gap-3">
                                      <input 
                                        type="color" 
                                        value={settings.theme.secondaryTextColor || '#A3A3A3'}
                                        onChange={(e) => handleThemeChange('secondaryTextColor', e.target.value)}
                                        className="w-12 h-12 rounded-xl cursor-pointer bg-transparent border-none p-0"
                                      />
                                      <div className="flex flex-col">
                                          <span className="text-xs text-gray-500 font-mono">{settings.theme.secondaryTextColor}</span>
                                          <span className="text-[10px] text-gray-600">Subtitles, Labels</span>
                                      </div>
                                  </div>
                              </div>

                              <div className="space-y-3">
                                  <label className="text-sm font-bold text-gray-300 block">Border Color</label>
                                  <div className="flex items-center gap-3">
                                      <input 
                                        type="color" 
                                        value={settings.theme.borderColor || '#333333'}
                                        onChange={(e) => handleThemeChange('borderColor', e.target.value)}
                                        className="w-12 h-12 rounded-xl cursor-pointer bg-transparent border-none p-0"
                                      />
                                      <div className="flex flex-col">
                                          <span className="text-xs text-gray-500 font-mono">{settings.theme.borderColor}</span>
                                          <span className="text-[10px] text-gray-600">Dividers, Inputs</span>
                                      </div>
                                  </div>
                              </div>

                           </div>
                      </div>
                  </div>

                  <div className="p-6 mt-8 bg-[#1A1A1A] rounded-2xl border border-brand-border">
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Live Preview</h4>
                      <div className="flex flex-wrap gap-4 items-center">
                          <button className={`${THEME.buttonPrimary} px-6 py-2 rounded-lg font-bold`}>
                              Primary Button
                          </button>
                          <div className="px-4 py-2 rounded-lg bg-brand-green/10 text-brand-green border border-brand-green/20 font-bold text-sm flex items-center">
                              Status Badge
                          </div>
                          <div className="px-4 py-2 border border-brand-border rounded-lg text-brand-white">
                              Bordered Element
                          </div>
                          <div className="text-sm text-brand-gray">
                              This is secondary text.
                          </div>
                      </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                       <button onClick={() => handleSaveSettings()} className={`${THEME.buttonPrimary} px-8 py-3 rounded-xl font-bold flex items-center gap-2`}>
                          <Save size={18} /> Save Appearance
                      </button>
                  </div>
              </div>
          )}
      </div>
    </div>
  );
};

export default SettingsView;