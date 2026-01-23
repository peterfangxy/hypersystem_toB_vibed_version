
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Edit2, 
  ArrowUpDown,
  Filter,
  CheckCircle2,
  FileClock,
  Wallet
} from 'lucide-react';
import { Member, MemberStatus, MembershipTier } from '../types';
import * as DataService from '../services/dataService';
import { THEME } from '../theme';
import MemberForm from '../components/MemberForm';
import MemberWalletModal from '../components/MemberWalletModal';
import { useLanguage } from '../contexts/LanguageContext';
import { PageHeader, ControlBar } from '../components/ui/PageLayout';

const MembersView = () => {
  const { t } = useLanguage();
  const [members, setMembers] = useState<Member[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | undefined>(undefined);
  
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [selectedMemberForWallet, setSelectedMemberForWallet] = useState<Member | undefined>(undefined);
  
  // Sorting & Filtering
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Member; direction: 'asc' | 'desc' }>({ 
    key: 'fullName', 
    direction: 'asc' 
  });

  useEffect(() => {
    setMembers(DataService.getMembers());
  }, []);

  const handleCreateOrUpdate = (member: Member) => {
    DataService.saveMember(member);
    setMembers(DataService.getMembers());
    setIsFormOpen(false);
    setEditingMember(undefined);
  };
  
  const handleStatusUpdate = (e: React.MouseEvent, member: Member, newStatus: MemberStatus) => {
    e.stopPropagation(); // Prevent row click from triggering edit if we add row click later
    const updated = { ...member, status: newStatus };
    DataService.saveMember(updated);
    setMembers(DataService.getMembers());
  };

  const openCreate = () => {
    setEditingMember(undefined);
    setIsFormOpen(true);
  };

  const openEdit = (member: Member) => {
    setEditingMember(member);
    setIsFormOpen(true);
  };
  
  const openWallet = (member: Member) => {
      setSelectedMemberForWallet(member);
      setIsWalletOpen(true);
  };

  const handleSort = (key: keyof Member) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredMembers = members
    .filter(m => {
      const term = searchTerm.toLowerCase();
      const matchesSearch = m.fullName.toLowerCase().includes(term) ||
                            m.email.toLowerCase().includes(term) ||
                            (m.club_id && m.club_id.toLowerCase().includes(term)) ||
                            (m.phone && m.phone.toLowerCase().includes(term));
      const matchesStatus = statusFilter === 'All' || m.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (aValue === undefined || bValue === undefined) return 0;
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

  const getStatusStyle = (status: MemberStatus) => {
    switch (status) {
      case 'Activated': return 'text-brand-green bg-brand-green/10 border-brand-green/20';
      case 'Deactivated': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'Pending Approval': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'Submitted': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getTierColor = (tier: MembershipTier) => {
      switch(tier) {
          case 'Diamond': return 'text-cyan-300 border-cyan-500/30 bg-cyan-500/10';
          case 'Platinum': return 'text-slate-300 border-slate-400/30 bg-slate-400/10';
          case 'Gold': return 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10';
          case 'Silver': return 'text-gray-300 border-gray-400/30 bg-gray-400/10';
          default: return 'text-amber-700 border-amber-800/30 bg-amber-700/10';
      }
  };

  const SortHeader = ({ label, sortKey, className = "" }: { label: string, sortKey: keyof Member, className?: string }) => (
    <th 
      className={`px-4 py-3 cursor-pointer hover:text-white transition-colors group select-none sticky top-0 bg-[#1A1A1A] z-10 ${className}`}
      onClick={() => handleSort(sortKey)}
    >
      <div className={`flex items-center gap-2 ${className.includes('text-right') ? 'justify-end' : ''}`}>
        {label}
        <ArrowUpDown size={14} className={`text-gray-600 group-hover:text-gray-400 ${sortConfig.key === sortKey ? 'text-brand-green' : ''}`} />
      </div>
    </th>
  );

  return (
    <div className="h-full flex flex-col w-full">
      <PageHeader 
        title={t('members.title')}
        subtitle={t('members.subtitle')}
        actions={
            <button 
                onClick={openCreate}
                className={`${THEME.buttonPrimary} px-6 py-3 rounded-full font-semibold shadow-lg shadow-green-500/20 flex items-center gap-2 transition-transform hover:scale-105 active:scale-95`}
            >
                <Plus size={20} strokeWidth={2.5} />
                {t('members.createBtn')}
            </button>
        }
      />

      <ControlBar>
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text"
            placeholder={t('members.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full ${THEME.card} border ${THEME.border} rounded-xl pl-11 pr-4 py-2.5 text-white placeholder:text-gray-600 focus:ring-1 focus:ring-brand-green outline-none transition-all`}
          />
        </div>
        
        {/* Status Filter */}
        <div className="relative min-w-[200px]">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`w-full ${THEME.card} border ${THEME.border} rounded-xl pl-11 pr-4 py-2.5 text-white outline-none appearance-none cursor-pointer focus:ring-1 focus:ring-brand-green`}
          >
            <option value="All">{t('members.filterStatus')}</option>
            <option value="Submitted">Submitted</option>
            <option value="Pending Approval">Pending Approval</option>
            <option value="Activated">Activated</option>
            <option value="Deactivated">Deactivated</option>
          </select>
        </div>
      </ControlBar>

      {/* Table View */}
      <div className={`${THEME.card} border ${THEME.border} rounded-3xl overflow-hidden flex flex-col shadow-xl flex-1 min-h-0 mb-3`}>
        {filteredMembers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500 h-full">
             <div className="w-16 h-16 rounded-full bg-[#111] flex items-center justify-center mb-4">
              <Users size={32} className="opacity-50" />
            </div>
            <p className="text-lg font-medium mb-4">No members found</p>
          </div>
        ) : (
          <div className="overflow-y-auto h-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#262626] text-xs uppercase text-gray-500 font-bold tracking-wider">
                  <SortHeader label={t('members.table.member')} sortKey="fullName" className="pl-6" />
                  <SortHeader label={t('members.table.email')} sortKey="email" />
                  <SortHeader label={t('members.table.phone')} sortKey="phone" />
                  <SortHeader label={t('members.table.clubId')} sortKey="club_id" />
                  <SortHeader label={t('members.table.tier')} sortKey="tier" />
                  <SortHeader label={t('members.table.status')} sortKey="status" />
                  <SortHeader label={t('members.table.joined')} sortKey="joinDate" />
                  <th className="px-4 py-3 pr-6 text-right sticky top-0 bg-[#1A1A1A] z-10">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262626]">
                {filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-[#222] transition-colors group">
                    <td className="px-4 py-3 pl-6">
                       <div className="flex items-center gap-3">
                        <img 
                            src={member.avatarUrl} 
                            alt={member.fullName} 
                            className="w-10 h-10 rounded-full object-cover bg-gray-800"
                        />
                         <div>
                           <span className="text-base font-bold text-white block">{member.fullName}</span>
                           {member.nickname && <span className="text-xs text-gray-500">"{member.nickname}"</span>}
                         </div>
                       </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">
                        {member.email}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-300">
                        {member.phone || '---'}
                    </td>
                    <td className="px-4 py-3 font-mono text-sm text-gray-300">
                        {member.club_id || '---'}
                    </td>
                    <td className="px-4 py-3">
                         <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getTierColor(member.tier)}`}>
                            {member.tier}
                         </span>
                    </td>
                     <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getStatusStyle(member.status)}`}>
                            {member.status}
                         </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-300">
                        {new Date(member.joinDate).toLocaleDateString(undefined, {
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                    </td>
                    <td className="px-4 py-3 pr-6 text-right">
                       <div className="flex justify-end gap-2 items-center opacity-0 group-hover:opacity-100 transition-opacity">
                         {/* Action Buttons based on Status Flow */}
                         {member.status === 'Submitted' && (
                             <button
                               onClick={(e) => handleStatusUpdate(e, member, 'Pending Approval')}
                               className="p-1.5 text-yellow-500 hover:bg-yellow-500/10 rounded-full transition-colors"
                               title="Move to Pending Approval"
                             >
                                <FileClock size={16} />
                             </button>
                         )}
                         {member.status === 'Pending Approval' && (
                             <button
                               onClick={(e) => handleStatusUpdate(e, member, 'Activated')}
                               className="p-1.5 text-brand-green hover:bg-brand-green/10 rounded-full transition-colors"
                               title="Activate Member"
                             >
                                <CheckCircle2 size={16} />
                             </button>
                         )}

                         <div className="w-px h-4 bg-[#333] mx-1"></div>

                         {/* Wallet Button */}
                         <button 
                           onClick={() => openWallet(member)}
                           className="p-1.5 text-gray-500 hover:text-brand-green hover:bg-[#333] rounded-full transition-colors"
                           title="Financials & Wallet"
                         >
                           <Wallet size={16} />
                         </button>

                         <button 
                           onClick={() => openEdit(member)}
                           className="p-1.5 text-gray-500 hover:text-white hover:bg-[#333] rounded-full transition-colors"
                           title={t('common.edit')}
                         >
                           <Edit2 size={16} />
                         </button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <MemberForm 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleCreateOrUpdate}
        initialData={editingMember}
      />
      
      {selectedMemberForWallet && (
          <MemberWalletModal 
            isOpen={isWalletOpen}
            onClose={() => setIsWalletOpen(false)}
            member={selectedMemberForWallet}
          />
      )}
    </div>
  );
};

export default MembersView;
