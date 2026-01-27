
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Wallet, 
  CheckCircle2, 
  AlertCircle,
  UserCheck
} from 'lucide-react';
import { Member, MemberStatus, TierDefinition } from '../../types';
import * as DataService from '../../services/dataService';
import { THEME } from '../../theme';
import MemberForm from '../../components/MemberForm';
import MemberWalletModal from '../../components/MemberWalletModal';
import { Table, Column } from '../../components/ui/Table';
import { useLanguage } from '../../contexts/LanguageContext';
import { ControlBar } from '../../components/ui/PageLayout';
import StatusBadge, { StatusVariant } from '../../components/ui/StatusBadge';
import { useTableData } from '../../hooks/useTableData';

const MembersList = () => {
  const { t } = useLanguage();
  const [members, setMembers] = useState<Member[]>([]);
  const [tierDefinitions, setTierDefinitions] = useState<TierDefinition[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | undefined>(undefined);
  const [walletMember, setWalletMember] = useState<Member | null>(null);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');

  // Use the Hook
  const { 
      data: filteredMembers, 
      sortConfig, 
      filters, 
      handleSort, 
      handleFilter 
  } = useTableData<Member>({
      data: members,
      initialSort: { key: 'joinDate', direction: 'desc' },
      searchQuery: searchQuery,
      searchKeys: ['fullName', 'email', 'club_id']
  });

  useEffect(() => {
    const loadMembers = async () => {
        const data = await DataService.fetchMembers();
        setMembers(data);
    };
    loadMembers();
    setTierDefinitions(DataService.getTierDefinitions());
  }, []);

  const handleCreateOrUpdate = async (member: Member) => {
    await DataService.saveMember(member);
    // Refresh list locally for now (even if save went to LS only, the UI should update)
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

  const getTierDisplay = (tierId?: string) => {
      if (!tierId) return { name: 'No Tier', color: '#666666' };
      const def = tierDefinitions.find(t => t.id === tierId);
      return def ? { name: def.name, color: def.color } : { name: tierId, color: '#999999' };
  };

  const getStatusVariant = (status: MemberStatus): StatusVariant => {
      switch(status) {
          case 'Activated': return 'success';
          case 'Pending Approval': return 'info';
          case 'Deactivated': return 'danger';
          default: return 'neutral';
      }
  };

  // --- Dynamic Filter Options ---
  const statusOptions = [
      { label: 'Activated', value: 'Activated', color: '#4ade80' },
      { label: 'Pending Approval', value: 'Pending Approval', color: '#60a5fa' },
      { label: 'Deactivated', value: 'Deactivated', color: '#f87171' }
  ];

  const tierOptions = useMemo(() => {
      return tierDefinitions.map(t => ({
          label: t.name,
          value: t.id,
          color: t.color
      }));
  }, [tierDefinitions]);

  const verifiedOptions = [
      { label: 'Verified', value: true, color: '#4ade80' },
      { label: 'Unverified', value: false, color: '#9ca3af' }
  ];

  // --- Columns Definition ---
  const columns: Column<Member>[] = useMemo(() => [
      {
          key: 'fullName',
          label: t('members.table.member'),
          sortable: true,
          className: 'pl-6 whitespace-nowrap',
          render: (member) => (
              <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#1A1A1A] flex items-center justify-center overflow-hidden border border-[#333]">
                      {member.avatarUrl ? <img src={member.avatarUrl} alt="" className="w-full h-full object-cover" /> : <span className="font-bold text-gray-500">{member.fullName.charAt(0)}</span>}
                  </div>
                  <div className="font-bold text-white text-sm">{member.fullName}</div>
              </div>
          )
      },
      {
          key: 'email',
          label: t('members.table.email'),
          sortable: true,
          className: 'text-sm text-gray-400'
      },
      {
          key: 'phone',
          label: t('members.table.phone'),
          sortable: true,
          className: 'text-sm text-gray-400',
          render: (member) => member.phone || '-'
      },
      {
          key: 'club_id',
          label: t('members.table.clubId'),
          sortable: true,
          className: 'text-sm font-mono text-gray-500 whitespace-nowrap',
          render: (member) => member.club_id || '-'
      },
      {
          key: 'tier',
          label: t('members.table.tier'),
          sortable: true,
          filterable: true,
          filterType: 'multi-select',
          filterOptions: tierOptions,
          className: 'text-sm font-bold',
          render: (member) => {
              const info = getTierDisplay(member.tier);
              return <span style={{ color: info.color }}>{info.name}</span>;
          }
      },
      {
          key: 'status',
          label: t('members.table.status'),
          sortable: true,
          filterable: true,
          filterType: 'multi-select',
          filterOptions: statusOptions,
          className: 'text-center',
          render: (member) => (
              <StatusBadge 
                variant={getStatusVariant(member.status)}
                className="w-24"
              >
                  {member.status === 'Pending Approval' ? 'Pending' : member.status}
              </StatusBadge>
          )
      },
      {
          key: 'joinDate',
          label: t('members.table.joined'),
          sortable: true,
          filterable: true,
          filterType: 'date-range',
          className: 'text-sm text-gray-500',
          render: (member) => new Date(member.joinDate).toLocaleDateString()
      },
      {
          key: 'isIdVerified',
          label: t('members.table.verified'),
          sortable: true,
          filterable: true,
          filterType: 'multi-select',
          filterOptions: verifiedOptions,
          className: 'text-center w-24',
          render: (member) => member.isIdVerified ? (
              <CheckCircle2 size={16} className="text-brand-green mx-auto" />
          ) : (
              <AlertCircle size={16} className="text-gray-600 mx-auto opacity-30" />
          )
      },
      {
          key: 'actions',
          label: t('common.actions'),
          className: 'pr-4 text-right w-[1%] whitespace-nowrap',
          render: (member) => (
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
          )
      }
  ], [tierOptions, statusOptions, verifiedOptions, t]);

  return (
      <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-2">
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
            
            {/* 
            <button 
                onClick={openCreate}
                className={`${THEME.buttonPrimary} px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-green-500/20 flex items-center gap-2 transition-transform hover:scale-105 active:scale-95 whitespace-nowrap`}
            >
                <Plus size={20} strokeWidth={2.5} />
                {t('members.createBtn')}
            </button> 
            */}
          </ControlBar>

          <Table 
              data={filteredMembers}
              columns={columns}
              keyExtractor={(member) => member.id}
              sortConfig={sortConfig}
              onSort={handleSort}
              filters={filters}
              onFilter={handleFilter}
              emptyState="No members found."
          />

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

export default MembersList;
