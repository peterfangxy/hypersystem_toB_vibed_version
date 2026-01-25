import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Wallet, 
  CheckCircle2, 
  AlertCircle,
  UserCheck,
  Users,
  Settings,
  Crown,
  ChevronUp,
  ChevronDown,
  Trash2
} from 'lucide-react';
import { Routes, Route, Navigate, NavLink, useLocation } from 'react-router-dom';
import { Member, MemberStatus, TierDefinition } from '../types';
import * as DataService from '../services/dataService';
import { THEME } from '../theme';
import MemberForm from '../components/MemberForm';
import MemberWalletModal from '../components/MemberWalletModal';
import TierForm from '../components/TierForm';
import { SortDirection } from '../components/ui/ColumnHeader';
import { Table, Column } from '../components/ui/Table';
import { useLanguage } from '../contexts/LanguageContext';
import { PageHeader, ControlBar, TabContainer } from '../components/ui/PageLayout';
import StatusBadge, { StatusVariant } from '../components/ui/StatusBadge';

// --- Membership Settings Component ---
const MembershipSettings = () => {
    const { t } = useLanguage();
    const [tiers, setTiers] = useState<TierDefinition[]>([]);
    const [isTierFormOpen, setIsTierFormOpen] = useState(false);
    const [editingTier, setEditingTier] = useState<TierDefinition | undefined>(undefined);

    useEffect(() => {
        loadTiers();
    }, []);

    const loadTiers = () => {
        setTiers(DataService.getTierDefinitions());
    };

    const handleEdit = (tier: TierDefinition) => {
        setEditingTier(tier);
        setIsTierFormOpen(true);
    };

    const handleSave = (tier: TierDefinition) => {
        DataService.saveTierDefinition(tier);
        loadTiers();
        setIsTierFormOpen(false);
        setEditingTier(undefined);
    };

    const handleDelete = (id: string) => {
        if(window.confirm("Are you sure you want to delete this tier? Existing members may need to be reassigned.")) {
            DataService.deleteTierDefinition(id);
            loadTiers();
        }
    };

    const handleMove = (index: number, direction: 'up' | 'down') => {
        const newTiers = [...tiers];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        
        if (swapIndex >= 0 && swapIndex < newTiers.length) {
            // Swap array elements
            [newTiers[index], newTiers[swapIndex]] = [newTiers[swapIndex], newTiers[index]];
            
            // Re-assign order based on new array index
            const orderedTiers = newTiers.map((t, idx) => ({ ...t, order: idx + 1 }));
            
            DataService.saveAllTierDefinitions(orderedTiers);
            setTiers(orderedTiers);
        }
    };

    const openCreate = () => {
        setEditingTier(undefined);
        setIsTierFormOpen(true);
    };

    return (
        <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-2 overflow-y-auto pb-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Crown size={24} className="text-brand-green" /> Membership Tiers
                    </h3>
                    <p className="text-gray-400 text-sm mt-1">Define loyalty levels, visual badges, and benefits.</p>
                </div>
                <button 
                    onClick={openCreate}
                    className="px-4 py-2 bg-[#222] hover:bg-[#2A2A2A] text-brand-green border border-brand-green/20 rounded-xl font-bold flex items-center gap-2 transition-all"
                >
                    <Plus size={16} /> Add Tier
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {tiers.map((tier, index) => (
                    <div key={tier.id} className="group relative">
                        {/* Physical Card Look */}
                        <div className="bg-[#111] rounded-2xl overflow-hidden border border-[#333] shadow-lg flex flex-col h-full hover:border-brand-green/30 transition-all">
                            
                            {/* Card Header (Colored) */}
                            <div 
                                className="h-24 relative p-4 flex items-center justify-between"
                                style={{ 
                                    background: `linear-gradient(135deg, ${tier.color}20, ${tier.color}05)`,
                                    borderBottom: `1px solid ${tier.color}30`
                                }}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-black/20 flex items-center justify-center backdrop-blur-sm border border-white/5">
                                        <Crown size={24} style={{ color: tier.color }} fill="currentColor" className="opacity-90 drop-shadow-md" />
                                    </div>
                                    <h4 className="text-xl font-bold text-white tracking-widest uppercase" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                                        {tier.name}
                                    </h4>
                                </div>
                                
                                {/* Ordering Controls */}
                                <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded-lg p-1 backdrop-blur-sm">
                                    <button 
                                        onClick={() => handleMove(index, 'up')}
                                        disabled={index === 0}
                                        className="p-0.5 hover:text-white text-gray-400 disabled:opacity-30"
                                    >
                                        <ChevronUp size={14} />
                                    </button>
                                    <button 
                                        onClick={() => handleMove(index, 'down')}
                                        disabled={index === tiers.length - 1}
                                        className="p-0.5 hover:text-white text-gray-400 disabled:opacity-30"
                                    >
                                        <ChevronDown size={14} />
                                    </button>
                                </div>
                            </div>

                            {/* Body */}
                            <div className="p-5 flex-1 flex flex-col gap-4">
                                <div>
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Requirements</span>
                                    <p className="text-sm font-medium text-gray-200">{tier.requirements || 'None'}</p>
                                </div>
                                
                                <div className="flex-1">
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Benefits</span>
                                    {tier.benefits ? (
                                        <ul className="text-xs text-gray-400 space-y-1 leading-relaxed">
                                            {tier.benefits.split('\n').map((line, i) => (
                                                <li key={i} className="flex items-start gap-2">
                                                    <span className="mt-1 w-1 h-1 rounded-full bg-brand-green/50 shrink-0"/> 
                                                    {line}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <span className="text-xs text-gray-600 italic">No benefits listed.</span>
                                    )}
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="p-4 border-t border-[#222] bg-[#151515] flex justify-between items-center">
                                <span className="text-xs text-gray-600 font-mono">ID: {tier.id}</span>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => handleEdit(tier)}
                                        className="p-2 hover:bg-[#222] rounded-lg text-gray-400 hover:text-white transition-colors"
                                        title="Edit Tier"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    {!['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'].includes(tier.id) && (
                                        <button 
                                            onClick={() => handleDelete(tier.id)}
                                            className="p-2 hover:bg-red-900/20 rounded-lg text-gray-600 hover:text-red-500 transition-colors"
                                            title="Delete Tier"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                
                {/* Add New Card Placeholder */}
                <button 
                    onClick={openCreate}
                    className="border-2 border-dashed border-[#222] rounded-2xl flex flex-col items-center justify-center p-8 text-gray-600 hover:border-brand-green/30 hover:text-brand-green hover:bg-brand-green/5 transition-all min-h-[300px]"
                >
                    <div className="w-12 h-12 rounded-full bg-[#1A1A1A] flex items-center justify-center mb-4">
                        <Plus size={24} />
                    </div>
                    <span className="font-bold">Add New Tier</span>
                </button>
            </div>

            <TierForm 
                isOpen={isTierFormOpen}
                onClose={() => setIsTierFormOpen(false)}
                onSubmit={handleSave}
                initialData={editingTier}
                isNew={!editingTier}
            />
        </div>
    );
};

// --- Main MembersView Component ---
const MembersView = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const isSettingsTab = location.pathname.includes('/settings');

  const [members, setMembers] = useState<Member[]>([]);
  const [tierDefinitions, setTierDefinitions] = useState<TierDefinition[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | undefined>(undefined);
  const [walletMember, setWalletMember] = useState<Member | null>(null);

  // Filters & Sorting State
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [sortConfig, setSortConfig] = useState<{ key: keyof Member; direction: SortDirection }>({ 
    key: 'fullName', 
    direction: 'asc' 
  });

  useEffect(() => {
    setMembers(DataService.getMembers());
    setTierDefinitions(DataService.getTierDefinitions());
  }, [isSettingsTab]); // Refresh when switching tabs in case tiers changed

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

  // --- Header Handlers ---
  const handleSort = (key: string, direction?: SortDirection) => {
    setSortConfig(current => {
        if (direction) {
             return { key: key as keyof Member, direction };
        }
        let newDir: SortDirection = 'asc';
        if (current.key === key && current.direction === 'asc') {
            newDir = 'desc';
        }
        return { key: key as keyof Member, direction: newDir };
    });
  };

  const handleFilter = (key: string, value: any) => {
      setFilters(prev => {
          const next = { ...prev };
          if (value === undefined || (Array.isArray(value) && value.length === 0) || value === '') {
              delete next[key];
          } else {
              next[key] = value;
          }
          return next;
      });
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

  // --- Filtering & Sorting Logic ---
  const filteredMembers = useMemo(() => {
      return members.filter(m => {
        // Global Search
        const matchesSearch = (m.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                              (m.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                              (m.club_id || '').toLowerCase().includes(searchQuery.toLowerCase());
        if (!matchesSearch) return false;

        // Column Filters
        if (filters.status && filters.status.length > 0) {
            if (!filters.status.includes(m.status)) return false;
        }

        if (filters.tier && filters.tier.length > 0) {
            if (!filters.tier.includes(m.tier)) return false;
        }

        if (filters.isIdVerified && filters.isIdVerified.length > 0) {
            if (!filters.isIdVerified.includes(!!m.isIdVerified)) return false;
        }

        if (filters.joinDate) {
            const { start, end } = filters.joinDate;
            const date = new Date(m.joinDate).getTime();
            if (start && date < new Date(start).getTime()) return false;
            if (end && date > new Date(end).getTime()) return false;
        }

        return true;
    }).sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        // Handle boolean sorting (false < true)
        if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
             return sortConfig.direction === 'asc' 
                ? (aValue === bValue ? 0 : aValue ? 1 : -1)
                : (aValue === bValue ? 0 : aValue ? -1 : 1);
        }

        if (aValue === undefined || bValue === undefined) return 0;
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });
  }, [members, searchQuery, filters, sortConfig]);

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
          label: 'Verified',
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
  ], [tierOptions, statusOptions, verifiedOptions, t]); // Dependencies for useMemo

  const manageView = (
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
      </div>
  );

  return (
    <div className="h-full flex flex-col w-full">
      <PageHeader
        title={t('members.title')}
        subtitle={t('members.subtitle')}
        actions={
            !isSettingsTab && (
                <button 
                    onClick={openCreate}
                    className={`${THEME.buttonPrimary} px-6 py-3 rounded-full font-semibold shadow-lg shadow-green-500/20 flex items-center gap-2 transition-transform hover:scale-105 active:scale-95`}
                >
                    <Plus size={20} strokeWidth={2.5} />
                    {t('members.createBtn')}
                </button>
            )
        }
      />

      <TabContainer>
        <NavLink
          to="manage"
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
                        {t('members.tabs.manage')}
                    </div>
                    {isActive && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-green shadow-[0_0_10px_rgba(6,193,103,0.5)]" />
                    )}
                </>
             )}
        </NavLink>

        <NavLink
          to="settings"
          className={({isActive}) => `pb-2.5 px-2 text-sm font-bold uppercase tracking-wider transition-all relative ${
            isActive 
              ? 'text-white' 
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
             {({isActive}) => (
                <>
                    <div className="flex items-center gap-2">
                        <Settings size={18} />
                        {t('members.tabs.settings')}
                    </div>
                    {isActive && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-green shadow-[0_0_10px_rgba(6,193,103,0.5)]" />
                    )}
                </>
             )}
        </NavLink>
      </TabContainer>

      <div className="flex-1 min-h-0">
          <Routes>
              <Route path="manage" element={manageView} />
              <Route path="settings" element={<MembershipSettings />} />
              <Route index element={<Navigate to="manage" replace />} />
          </Routes>
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