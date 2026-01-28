
import React, { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Users, Phone, Mail, CreditCard } from 'lucide-react';
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
    const term = searchTerm.toLowerCase().trim();
    return members.filter(m => {
        // Exclude already added members
        if (existingMemberIds.has(m.id)) return false;
        
        // If empty search, show all (or limit to recent if list is huge, but showing all for now)
        if (!term) return true;

        // Search across multiple fields
        return (
            m.fullName.toLowerCase().includes(term) ||
            (m.nickname && m.nickname.toLowerCase().includes(term)) ||
            m.email.toLowerCase().includes(term) ||
            (m.club_id && m.club_id.toLowerCase().includes(term)) ||
            (m.phone && m.phone.includes(term))
        );
    });
  }, [members, existingMemberIds, searchTerm]);

  // Adjusted grid layout: Reduced name width, increased ID and Contact width
  const gridLayout = "grid-cols-[1.5fr_1.2fr_2fr_auto]";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg" 
      zIndex={60}
      title={
        <div className="flex items-center gap-2">
            <UserPlusIcon size={20} className="text-brand-green"/>
            {t('tournaments.addPlayerModal.title')}
        </div>
      }
    >
        <div className="p-4 border-b border-[#222] space-y-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
             <input 
                autoFocus
                type="text"
                placeholder={t('tournaments.addPlayerModal.searchPlaceholder') + " (Name, ID, Phone, Email)"}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full ${THEME.input} rounded-xl pl-11 pr-4 py-3 text-sm outline-none shadow-inner bg-[#1A1A1A] focus:bg-[#222] transition-colors`}
            />
          </div>
          
          {/* Column Headers */}
          <div className={`grid ${gridLayout} px-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider`}>
              <div>{t('tournaments.addPlayerModal.headers.member')}</div>
              <div>{t('tournaments.addPlayerModal.headers.id')}</div>
              <div>{t('tournaments.addPlayerModal.headers.contact')}</div>
              <div className="text-right">{t('tournaments.addPlayerModal.headers.action')}</div>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-2 space-y-1 max-h-[60vh]">
          {availableMembers.map(member => (
            <button 
              key={member.id} 
              onClick={() => { onAdd(member.id); onClose(); }} 
              className={`w-full grid ${gridLayout} items-center gap-4 p-3 hover:bg-[#333] rounded-xl group transition-all border border-transparent hover:border-[#444] text-left`}
            >
               {/* Player Info */}
               <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 shrink-0 rounded-full bg-[#222] flex items-center justify-center text-xs font-bold text-gray-400 overflow-hidden border border-[#333]">
                      {member.avatarUrl ? <img src={member.avatarUrl} className="w-full h-full object-cover" alt={member.fullName}/> : member.fullName.charAt(0)}
                  </div>
                  <div className="min-w-0 flex flex-col justify-center">
                      <div className="flex items-center gap-2">
                          <div className="text-sm font-bold text-gray-200 group-hover:text-white truncate">{member.fullName}</div>
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${member.status === 'Activated' ? 'bg-green-500' : 'bg-gray-500'}`} title={member.status}></span>
                      </div>
                  </div>
              </div>

              {/* Club ID */}
              <div className="text-xs font-mono text-gray-400 group-hover:text-gray-300 flex items-center gap-2">
                  <CreditCard size={12} className="opacity-50" />
                  {member.club_id || '-'}
              </div>

              {/* Contact */}
              <div className="flex flex-col justify-center gap-0.5 min-w-0">
                  {member.phone && (
                      <div className="text-[11px] text-gray-500 group-hover:text-gray-400 flex items-center gap-1.5 truncate">
                          <Phone size={10} />
                          {member.phone}
                      </div>
                  )}
                  <div className="text-[11px] text-gray-500 group-hover:text-gray-400 flex items-center gap-1.5 truncate">
                      <Mail size={10} />
                      {member.email}
                  </div>
              </div>

              {/* Add Button */}
              <div className="w-8 h-8 rounded-full bg-[#222] flex items-center justify-center text-brand-green opacity-0 group-hover:opacity-100 transition-all transform group-hover:scale-110 shadow-lg">
                <Plus size={18} />
              </div>
            </button>
          ))}
          
          {availableMembers.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
               <Users size={48} className="opacity-10 mb-3" />
               <p className="text-sm font-medium">{t('tournaments.addPlayerModal.noResults')}</p>
               <p className="text-xs opacity-60 mt-1">Try searching by ID, phone number, or email.</p>
            </div>
          )}
        </div>
    </Modal>
  );
};

export default AddPlayerModal;
