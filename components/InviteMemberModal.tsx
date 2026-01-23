
import React, { useState, useEffect } from 'react';
import { Mail, Shield, Check, UserPlus } from 'lucide-react';
import { Modal } from './ui/Modal';
import { THEME } from '../theme';
import { RoleDefinition } from '../types';
import * as DataService from '../services/dataService';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (email: string, roleName: string) => void;
}

const InviteMemberModal: React.FC<InviteMemberModalProps> = ({ isOpen, onClose, onInvite }) => {
  const [email, setEmail] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [roles, setRoles] = useState<RoleDefinition[]>([]);

  useEffect(() => {
    if (isOpen) {
      const allRoles = DataService.getRoleConfigs();
      setRoles(allRoles);
      // Default to Viewer if exists, otherwise first role
      const defaultRole = allRoles.find(r => r.name === 'Viewer') || allRoles[0];
      if (defaultRole) setSelectedRoleId(defaultRole.id);
      setEmail('');
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const role = roles.find(r => r.id === selectedRoleId);
    if (email && role) {
        onInvite(email, role.name);
        onClose();
    }
  };

  return (
    <Modal 
        isOpen={isOpen} 
        onClose={onClose} 
        title={
            <div className="flex items-center gap-2">
                <UserPlus size={20} className="text-brand-green"/>
                Invite Team Member
            </div>
        } 
        size="sm"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="space-y-4">
            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-400">Email Address</label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                    <input 
                        required
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="colleague@example.com"
                        className={`w-full ${THEME.input} rounded-xl pl-10 pr-4 py-3 outline-none focus:border-brand-green transition-all`}
                        autoFocus
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-400">Assign Role</label>
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
                            {role.name}
                        </div>
                    ))}
                </div>
                {selectedRoleId && (
                    <div className="text-xs text-gray-500 mt-2 p-2 bg-[#1A1A1A] rounded-lg border border-[#222]">
                        {roles.find(r => r.id === selectedRoleId)?.description || 'No description available.'}
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
                Cancel
            </button>
            <button 
                type="submit"
                disabled={!email || !selectedRoleId}
                className={`${THEME.buttonPrimary} px-8 py-3 rounded-xl font-bold flex items-center gap-2`}
            >
                <Check size={18} /> Send Invite
            </button>
        </div>
      </form>
    </Modal>
  );
};

export default InviteMemberModal;
