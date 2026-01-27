
import React, { useState, useEffect } from 'react';
import { Mail, Check, UserPlus, User, Save } from 'lucide-react';
import { Modal } from './ui/Modal';
import { THEME } from '../theme';
import { RoleDefinition, TeamMember } from '../types';
import * as DataService from '../services/dataService';
import { useLanguage } from '../contexts/LanguageContext';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { email: string; role: string; nickname: string; id?: string }) => void;
  initialData?: TeamMember;
}

const InviteMemberModal: React.FC<InviteMemberModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [roles, setRoles] = useState<RoleDefinition[]>([]);

  useEffect(() => {
    if (isOpen) {
      const allRoles = DataService.getRoleConfigs();
      setRoles(allRoles);
      
      if (initialData) {
          setEmail(initialData.email);
          setNickname(initialData.nickname || '');
          // Find role ID by name
          const role = allRoles.find(r => r.name === initialData.role);
          if (role) setSelectedRoleId(role.id);
          else setSelectedRoleId(allRoles[0]?.id || '');
      } else {
          // Reset for new invite
          setEmail('');
          setNickname('');
          const defaultRole = allRoles.find(r => r.name === 'Viewer') || allRoles[0];
          if (defaultRole) setSelectedRoleId(defaultRole.id);
      }
    }
  }, [isOpen, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const role = roles.find(r => r.id === selectedRoleId);
    if (email && role) {
        onSubmit({
            id: initialData?.id,
            email,
            role: role.name,
            nickname
        });
        onClose();
    }
  };

  const getLocalizedRoleName = (role: RoleDefinition) => {
      if (role.id === 'role_admin') return t('settings.roles.adminName');
      if (role.id === 'role_viewer') return t('settings.roles.viewerName');
      return role.name;
  };

  const getLocalizedRoleDesc = (role: RoleDefinition) => {
      if (role.id === 'role_admin') return t('settings.roles.adminDesc');
      if (role.id === 'role_viewer') return t('settings.roles.viewerDesc');
      return role.description;
  };

  return (
    <Modal 
        isOpen={isOpen} 
        onClose={onClose} 
        title={
            <div className="flex items-center gap-2">
                {initialData ? <User size={20} className="text-brand-green"/> : <UserPlus size={20} className="text-brand-green"/>}
                {initialData ? 'Edit Team Member' : t('settings.inviteModal.title')}
            </div>
        } 
        size="sm"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="space-y-4">
            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-400">{t('settings.inviteModal.email')}</label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                    <input 
                        required
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t('settings.inviteModal.placeholder')}
                        className={`w-full ${THEME.input} rounded-xl pl-10 pr-4 py-3 outline-none focus:border-brand-green transition-all ${initialData ? 'opacity-70 cursor-not-allowed' : ''}`}
                        disabled={!!initialData} // Email is usually immutable for identity
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-400">{t('settings.inviteModal.nickname')}</label>
                <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                    <input 
                        type="text"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        placeholder={t('settings.inviteModal.nicknamePlaceholder')}
                        className={`w-full ${THEME.input} rounded-xl pl-10 pr-4 py-3 outline-none focus:border-brand-green transition-all`}
                        autoFocus={!!initialData}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-400">{t('settings.inviteModal.assignRole')}</label>
                <div className="grid grid-cols-2 gap-2">
                    {roles.map(role => (
                        <div 
                            key={role.id}
                            onClick={() => setSelectedRoleId(role.id)}
                            className={`flex items-center justify-center p-2 rounded-xl border cursor-pointer transition-all text-sm font-bold text-center ${
                                selectedRoleId === role.id 
                                ? 'bg-brand-green/10 border-brand-green text-white' 
                                : 'bg-[#1A1A1A] border-[#333] text-gray-400 hover:border-gray-500 hover:text-gray-200'
                            }`}
                        >
                            {getLocalizedRoleName(role)}
                        </div>
                    ))}
                </div>
                {selectedRoleId && (
                    <div className="text-xs text-gray-500 mt-2 p-2 bg-[#1A1A1A] rounded-lg border border-[#222]">
                        {(() => {
                            const r = roles.find(r => r.id === selectedRoleId);
                            return r ? getLocalizedRoleDesc(r) : t('settings.inviteModal.noDescription');
                        })()}
                    </div>
                )}
            </div>
        </div>

        <div className="pt-2 flex justify-end gap-3">
            <button 
                type="button"
                onClick={onClose}
                className={`${THEME.buttonSecondary} px-6 py-3 rounded-xl font-bold`}
            >
                {t('settings.inviteModal.cancel')}
            </button>
            <button 
                type="submit"
                disabled={!email || !selectedRoleId}
                className={`${THEME.buttonPrimary} px-8 py-3 rounded-xl font-bold flex items-center gap-2`}
            >
                {initialData ? <Save size={18} /> : <Check size={18} />} 
                {initialData ? 'Save Changes' : t('settings.inviteModal.send')}
            </button>
        </div>
      </form>
    </Modal>
  );
};

export default InviteMemberModal;