
import React, { useState, useMemo } from 'react';
import { Plus, ShieldAlert, Settings, Edit2, Search } from 'lucide-react';
import { THEME } from '../../theme';
import { TeamMember, AccessRole } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import StatusBadge, { StatusVariant } from '../../components/ui/StatusBadge';
import { Table, Column } from '../../components/ui/Table';
import DeleteWithConfirmation from '../../components/ui/DeleteWithConfirmation';
import { useTableData } from '../../hooks/useTableData';

interface TeamSettingsProps {
    team: TeamMember[];
    onInvite: () => void;
    onRemove: (id: string) => void;
    onOpenConfig: () => void;
    onEdit: (member: TeamMember) => void;
}

const getRoleVariant = (role: AccessRole): StatusVariant => {
    switch(role) {
        case 'Owner': return 'purple';
        case 'Admin': return 'info';
        case 'Operator': return 'success';
        case 'Viewer': return 'neutral';
        default: return 'neutral'; // Fallback
    }
};

const TeamSettings: React.FC<TeamSettingsProps> = ({ team, onInvite, onRemove, onOpenConfig, onEdit }) => {
    const { t } = useLanguage();
    const [searchQuery, setSearchQuery] = useState('');
    
    // --- Data Processing Hook ---
    const { 
        data: filteredTeam, 
        sortConfig, 
        filters, 
        handleSort, 
        handleFilter 
    } = useTableData<TeamMember>({
        data: team,
        initialSort: { key: 'fullName', direction: 'asc' },
        searchQuery: searchQuery,
        searchKeys: ['fullName', 'nickname', 'email']
    });

    const getLocalizedRole = (role: string) => {
        if (role === 'Admin') return t('settings.roles.adminName');
        if (role === 'Viewer') return t('settings.roles.viewerName');
        return role;
    };

    // Filter Options
    const roleOptions = useMemo(() => {
        const uniqueRoles = Array.from(new Set(team.map(m => m.role)));
        return uniqueRoles.map(r => ({ label: getLocalizedRole(r), value: r }));
    }, [team, t]);

    const statusOptions = [
        { label: t('settings.team.active'), value: 'Active', color: '#4ade80' },
        { label: t('settings.team.pending'), value: 'Pending', color: '#fbbf24' }
    ];

    const columns: Column<TeamMember>[] = useMemo(() => [
        {
            key: 'fullName',
            label: t('settings.team.table.member'),
            sortable: true,
            className: 'pl-6',
            render: (member) => (
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#111] flex items-center justify-center text-gray-400 font-bold overflow-hidden border border-[#333]">
                        {member.avatarUrl ? <img src={member.avatarUrl} className="w-full h-full object-cover" alt={member.fullName}/> : member.fullName.charAt(0)}
                    </div>
                    <div>
                        <div className="font-bold text-white text-sm flex items-center gap-2">
                            {member.fullName}
                            {member.nickname && (
                                <span className="text-gray-500 font-normal">({member.nickname})</span>
                            )}
                        </div>
                    </div>
                </div>
            )
        },
        {
            key: 'email',
            label: t('settings.general.email'),
            sortable: true,
            className: 'text-sm text-gray-400',
            render: (member) => member.email
        },
        {
            key: 'role',
            label: t('settings.team.table.role'),
            sortable: true,
            filterable: true,
            filterType: 'multi-select',
            filterOptions: roleOptions,
            render: (member) => (
                <StatusBadge variant={getRoleVariant(member.role)}>
                    {getLocalizedRole(member.role)}
                </StatusBadge>
            )
        },
        {
            key: 'status',
            label: t('settings.team.table.status'),
            sortable: true,
            filterable: true,
            filterType: 'multi-select',
            filterOptions: statusOptions,
            className: 'text-center',
            render: (member) => (
                <span className={`text-xs font-medium ${member.status === 'Active' ? 'text-green-500' : 'text-yellow-500'}`}>
                    {member.status === 'Active' ? t('settings.team.active') : t('settings.team.pending')}
                </span>
            )
        },
        {
            key: 'actions',
            label: t('common.actions'),
            className: 'text-right pr-6',
            render: (member) => (
                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                        onClick={() => onEdit(member)}
                        className="p-1.5 text-gray-500 hover:text-white hover:bg-[#333] rounded-full transition-colors"
                        title={t('common.edit')}
                    >
                        <Edit2 size={16} />
                    </button>
                    <DeleteWithConfirmation 
                        disabled={member.id === 'owner'}
                        onConfirm={() => onRemove(member.id)}
                        itemName={member.fullName}
                        title={t('common.deleteConfirm.title')}
                    />
                </div>
            )
        }
    ], [t, roleOptions]);

    return (
      <div className="flex flex-col h-full animate-in fade-in">
          <div className="mb-6 flex flex-col md:flex-row items-center gap-4">
              <div className="relative flex-1 w-full">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input 
                      type="text"
                      placeholder={t('members.searchPlaceholder')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`w-full ${THEME.card} border ${THEME.border} rounded-xl pl-11 pr-4 py-2.5 text-white placeholder:text-gray-600 focus:ring-1 focus:ring-brand-green outline-none transition-all`}
                  />
              </div>
              <div className="flex gap-3 w-full md:w-auto justify-end shrink-0">
                  <button 
                     onClick={onOpenConfig}
                     className="px-4 py-2.5 bg-[#222] hover:bg-[#2A2A2A] text-gray-300 border border-[#333] rounded-xl font-bold text-sm flex items-center gap-2 transition-all whitespace-nowrap"
                  >
                      <Settings size={16} /> {t('settings.team.accessConfigs')}
                  </button>
                  <button 
                     onClick={onInvite}
                     className={`${THEME.buttonPrimary} px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 whitespace-nowrap`}
                  >
                      <Plus size={18} /> {t('settings.team.invite')}
                  </button>
              </div>
          </div>
          
          <Table 
              data={filteredTeam}
              columns={columns}
              keyExtractor={(m) => m.id}
              sortConfig={sortConfig}
              onSort={handleSort}
              filters={filters}
              onFilter={handleFilter}
              className="border border-[#222] rounded-3xl"
              emptyState={
                  <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                      <p>{t('common.noData')}</p>
                  </div>
              }
          />

          <div className="mt-4 p-4 bg-[#1A1A1A] border border-[#222] rounded-2xl">
              <div className="flex items-start gap-3">
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
