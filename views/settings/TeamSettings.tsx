
import React from 'react';
import { Plus, Trash2, ShieldAlert, Settings } from 'lucide-react';
import { THEME } from '../../theme';
import { TeamMember, AccessRole } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import StatusBadge, { StatusVariant } from '../../components/ui/StatusBadge';

interface TeamSettingsProps {
    team: TeamMember[];
    onInvite: () => void;
    onRemove: (id: string) => void;
    onOpenConfig: () => void;
}

const getRoleVariant = (role: AccessRole): StatusVariant => {
    switch(role) {
        case 'Owner': return 'purple';
        case 'Admin': return 'info';
        case 'Operator': return 'success';
        case 'Viewer': return 'neutral';
        default: return 'warning';
    }
};

const TeamSettings: React.FC<TeamSettingsProps> = ({ team, onInvite, onRemove, onOpenConfig }) => {
    const { t } = useLanguage();
    
    return (
      <div className={`${THEME.card} border ${THEME.border} rounded-3xl overflow-hidden animate-in fade-in`}>
          <div className="p-6 border-b border-[#222] flex justify-between items-center">
              <div>
                  <h3 className="text-lg font-bold text-white">{t('settings.team.title')}</h3>
                  <p className="text-sm text-gray-500">{t('settings.team.subtitle')}</p>
              </div>
              <div className="flex gap-3">
                  <button 
                     onClick={onOpenConfig}
                     className="px-4 py-2 bg-[#222] hover:bg-[#2A2A2A] text-gray-300 border border-[#333] rounded-lg font-bold text-sm flex items-center gap-2 transition-all"
                  >
                      <Settings size={16} /> Access Configs
                  </button>
                  <button 
                     onClick={onInvite}
                     className={`${THEME.buttonPrimary} px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2`}
                  >
                      <Plus size={16} /> {t('settings.team.invite')}
                  </button>
              </div>
          </div>
          
          <div className="divide-y divide-[#222]">
              {team.map(member => (
                  <div key={member.id} className="p-4 flex items-center justify-between hover:bg-[#222] transition-colors group">
                      <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-[#111] flex items-center justify-center text-gray-400 font-bold overflow-hidden">
                              {member.avatarUrl ? <img src={member.avatarUrl} className="w-full h-full object-cover" alt={member.fullName}/> : member.fullName.charAt(0)}
                          </div>
                          <div>
                              <div className="font-bold text-white">{member.fullName}</div>
                              <div className="text-xs text-gray-500">{member.email}</div>
                          </div>
                      </div>
                      <div className="flex items-center gap-6">
                          <StatusBadge variant={getRoleVariant(member.role)}>
                              {member.role}
                          </StatusBadge>
                          
                          <div className="text-xs text-gray-600">
                              {member.status === 'Active' ? (
                                  <span className="text-green-500/50">{t('settings.team.activeNow')}</span>
                              ) : (
                                  <span className="text-yellow-500/50">{t('settings.team.invitePending')}</span>
                              )}
                          </div>

                          <button 
                            onClick={() => onRemove(member.id)}
                            disabled={member.role === 'Owner'}
                            className="p-2 text-gray-600 hover:text-red-500 hover:text-white hover:bg-[#111] rounded-full transition-colors disabled:opacity-0"
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
                      <strong className="text-blue-400 block mb-1">{t('settings.team.accessControlTitle')}</strong>
                      {t('settings.team.accessControlText')}
                  </div>
              </div>
          </div>
      </div>
    );
};

export default TeamSettings;
