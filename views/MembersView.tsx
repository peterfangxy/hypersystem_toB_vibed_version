
import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Wallet, 
  Filter, 
  ArrowUpDown, 
  CheckCircle2, 
  AlertCircle,
  UserCheck
} from 'lucide-react';
import { Member, MembershipTier } from '../types';
import * as DataService from '../services/dataService';
import { THEME } from '../theme';
import MemberForm from '../components/MemberForm';
import MemberWalletModal from '../components/MemberWalletModal';
import { useLanguage } from '../contexts/LanguageContext';
import { PageHeader, ControlBar } from '../components/ui/PageLayout';

const MembersView = () => {
  const { t } = useLanguage();
  const [members, setMembers] = useState<Member[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | undefined>(undefined);
  const [walletMember, setWalletMember] = useState<Member | null>(null);

  // Filters & Sorting
  const [searchQuery, setSearchQuery] = useState('');
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

  const handleOpenWallet = (member: Member) => {
      setWalletMember(member);
  };

  const openCreate = () => {
    setEditingMember(undefined);
    setIsFormOpen(true);
  };

  const openEdit = (member: Member) => {
    setEditingMember(member);
    setIsFormOpen(true);
  };

  const handleSort = (key: keyof Member) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const SortHeader = ({ label, sortKey, className = "" }: { label: string, sortKey: keyof Member, className?: string }) => (
    <th 
      className={`px-2 py-3 cursor-pointer hover:text-white transition-colors group select-none sticky top-0 bg-[#1A1A1A] z-10 border-b border-[#262626] whitespace-nowrap ${className}`}
      onClick={() => handleSort(sortKey)}
    >
      <div className={`flex items-center gap-2 ${className.includes('text-right') ? 'justify-end' : ''}`}>
        {label}
        <ArrowUpDown size={14} className={`text-gray-600 group-hover:text-gray-400 ${sortConfig.key === sortKey ? 'text-brand-green' : ''}`} />
      </div>
    </th>
  );

  const getTierColor = (tier: MembershipTier) => {
      switch(tier) {
          case MembershipTier.DIAMOND: return 'text-cyan-400';
          case MembershipTier.PLATINUM: return 'text-slate-300';
          case MembershipTier.GOLD: return 'text-yellow-500';
          case MembershipTier.SILVER: return 'text-gray-400';
          default: return 'text-orange-700'; // Bronze
      }
  };

  const filteredMembers = members
    .filter(m => {
        const matchesSearch = (m.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                              (m.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                              (m.club_id || '').toLowerCase().includes(searchQuery.toLowerCase());
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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
                <option value="Activated">Activated</option>
                <option value="Pending Approval">Pending</option>
                <option value="Deactivated">Deactivated</option>
            </select>
        </div>
      </ControlBar>

      <div className={`${THEME.card} border ${THEME.border} rounded-3xl overflow-hidden flex flex-col shadow-xl flex-1 min-h-0 mb-3`}>
          <div className="overflow-y-auto h-full">
              <table className="w-full text-left border-collapse">
                  <thead>
                      <tr className="text-xs uppercase text-gray-500 font-bold tracking-wider">
                          <SortHeader label={t('members.table.member')} sortKey="fullName" className="pl-6" />
                          <th className="px-2 py-3 text-center sticky top-0 bg-[#1A1A1A] z-10 w-20 border-b border-[#262626]">Verified</th>
                          <SortHeader label={t('members.table.email')} sortKey="email" />
                          <SortHeader label={t('members.table.phone')} sortKey="phone" />
                          <SortHeader label={t('members.table.clubId')} sortKey="club_id" className="w-[12%]" />
                          <SortHeader label={t('members.table.tier')} sortKey="tier" />
                          <SortHeader label={t('members.table.status')} sortKey="status" />
                          <SortHeader label={t('members.table.joined')} sortKey="joinDate" className="w-[12%]" />
                          <th className="px-2 py-3 pr-4 text-right sticky top-0 bg-[#1A1A1A] z-10 w-[1%] whitespace-nowrap border-b border-[#262626]">{t('common.actions')}</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-[#262626]">
                      {filteredMembers.length === 0 ? (
                          <tr>
                              <td colSpan={9} className="py-12 text-center text-gray-500">
                                  No members found.
                              </td>
                          </tr>
                      ) : (
                          filteredMembers.map((member) => (
                              <tr key={member.id} className="hover:bg-[#222] transition-colors group">
                                  <td className="px-2 py-3 pl-6">
                                      <div className="flex items-center gap-3">
                                          <div className="w-10 h-10 rounded-full bg-[#1A1A1A] flex items-center justify-center overflow-hidden border border-[#333]">
                                              {member.avatarUrl ? <img src={member.avatarUrl} alt="" className="w-full h-full object-cover" /> : <span className="font-bold text-gray-500">{member.fullName.charAt(0)}</span>}
                                          </div>
                                          <div>
                                              <div className="font-bold text-white text-sm">{member.fullName}</div>
                                              {member.nickname && <div className="text-xs text-gray-500">"{member.nickname}"</div>}
                                          </div>
                                      </div>
                                  </td>
                                  <td className="px-2 py-3 text-center">
                                      {member.isIdVerified ? (
                                          <CheckCircle2 size={16} className="text-brand-green mx-auto" />
                                      ) : (
                                          <AlertCircle size={16} className="text-gray-600 mx-auto opacity-30" />
                                      )}
                                  </td>
                                  <td className="px-2 py-3 text-sm text-gray-400">{member.email}</td>
                                  <td className="px-2 py-3 text-sm text-gray-400">{member.phone || '-'}</td>
                                  <td className="px-2 py-3 text-sm font-mono text-gray-500">{member.club_id || '-'}</td>
                                  <td className="px-2 py-3 text-sm font-bold">
                                      <span className={getTierColor(member.tier)}>{member.tier}</span>
                                  </td>
                                  <td className="px-2 py-3">
                                      <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded border ${
                                          member.status === 'Activated' ? 'bg-brand-green/10 text-brand-green border-brand-green/20' : 
                                          member.status === 'Deactivated' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                                          'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                      }`}>
                                          {member.status === 'Pending Approval' ? 'Pending' : member.status}
                                      </span>
                                  </td>
                                  <td className="px-2 py-3 text-sm text-gray-500">{new Date(member.joinDate).toLocaleDateString()}</td>
                                  <td className="px-2 py-3 pr-4 text-right">
                                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                          {member.status === 'Pending Approval' && (
                                              <>
                                                  <button 
                                                      onClick={() => openEdit(member)}
                                                      className="p-1.5 text-blue-400 hover:text-white hover:bg-blue-500/20 rounded-full transition-colors"
                                                      title="Review Application"
                                                  >
                                                      <UserCheck size={16} />
                                                  </button>
                                                  <div className="w-px h-4 bg-[#333] my-auto mx-1"></div>
                                              </>
                                          )}
                                          <button 
                                              onClick={() => handleOpenWallet(member)}
                                              className="p-1.5 text-gray-500 hover:text-white hover:bg-[#333] rounded-full transition-colors"
                                              title="Wallet"
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
                          ))
                      )}
                  </tbody>
              </table>
          </div>
      </div>

      <MemberForm 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleCreateOrUpdate}
        initialData={editingMember}
        isActivationMode={editingMember?.status === 'Pending Approval'}
      />

      {walletMember && (
          <MemberWalletModal 
              isOpen={!!walletMember}
              onClose={() => setWalletMember(null)}
              member={walletMember}
          />
      )}
    </div>
  );
};

export default MembersView;
