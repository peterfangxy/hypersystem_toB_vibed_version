
import React, { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Users } from 'lucide-react';
import { Member } from '../types';
import * as DataService from '../services/dataService';
import { THEME } from '../theme';
import { Modal } from './ui/Modal';
import { useLanguage } from '../contexts/LanguageContext';

interface AddPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (memberId: string) => void;
  existingMemberIds: Set<string>;
}

const UserPlusIcon = ({ size, className }: { size: number, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="8.5" cy="7" r="4"></circle>
    <line x1="20" y1="8" x2="20" y2="14"></line>
    <line x1="23" y1="11" x2="17" y2="11"></line>
  </svg>
);

const AddPlayerModal: React.FC<AddPlayerModalProps> = ({ isOpen, onClose, onAdd, existingMemberIds }) => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    if (isOpen) {
      setMembers(DataService.getMembers());
      setSearchTerm('');
    }
  }, [isOpen]);

  const availableMembers = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return members.filter(m => 
      !existingMemberIds.has(m.id) && 
      (m.fullName.toLowerCase().includes(term) || m.email.toLowerCase().includes(term))
    );
  }, [members, existingMemberIds, searchTerm]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      zIndex={60}
      title={
        <div className="flex items-center gap-2">
            <UserPlusIcon size={20} className="text-brand-green"/>
            {t('tournaments.addPlayerModal.title')}
        </div>
      }
    >
        <div className="p-4 border-b border-[#222]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
             <input 
                autoFocus
                type="text"
                placeholder={t('tournaments.addPlayerModal.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full ${THEME.input} rounded-xl pl-10 pr-4 py-3 text-sm outline-none shadow-inner`}
            />
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-2 space-y-1 max-h-[50vh]">
          {availableMembers.map(member => (
            <button 
              key={member.id} 
              onClick={() => { onAdd(member.id); onClose(); }} 
              className="w-full flex items-center justify-between p-3 hover:bg-[#333] rounded-xl group transition-all border border-transparent hover:border-[#333]"
            >
               <div className="flex items-center gap-3 text-left">
                  <div className="w-10 h-10 rounded-full bg-[#222] flex items-center justify-center text-xs font-bold text-gray-400 overflow-hidden">
                      {member.avatarUrl ? <img src={member.avatarUrl} className="w-full h-full object-cover"/> : member.fullName.charAt(0)}
                  </div>
                  <div>
                      <div className="text-sm font-bold text-gray-200 group-hover:text-white">{member.fullName}</div>
                      <div className="text-xs text-gray-500">{member.tier} Member</div>
                  </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#222] flex items-center justify-center text-brand-green opacity-0 group-hover:opacity-100 transition-all transform group-hover:scale-110">
                <Plus size={18} />
              </div>
            </button>
          ))}
          
          {availableMembers.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
               <Users size={32} className="opacity-20 mb-2" />
               <p className="text-sm">{t('tournaments.addPlayerModal.noResults')}</p>
            </div>
          )}
        </div>
    </Modal>
  );
};

export default AddPlayerModal;