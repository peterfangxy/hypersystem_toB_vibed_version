
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Clock,
  User,
  Shield,
  FileText,
  LogIn,
  LogOut,
  Edit,
  Trash2,
  Plus,
  Eye,
  Play,
  Pause,
  Ban,
  CheckCircle,
  XCircle,
  DollarSign,
  UserCheck,
  UserX,
  Download,
  Activity
} from 'lucide-react';
import { AuditLog } from '../types';
import * as DataService from '../services/dataService';
import { THEME } from '../theme';
import { Table, Column } from '../components/ui/Table';
import { useTableData } from '../hooks/useTableData';
import { ControlBar, PageHeader } from '../components/ui/PageLayout';
import { useLanguage } from '../contexts/LanguageContext';

// Helper to get Icon based on Action
const getActionIcon = (action: string) => {
  const actionLower = action.toLowerCase();
  if (actionLower.includes('login') && !actionLower.includes('failed')) return <LogIn size={14} className="text-green-400" />;
  if (actionLower.includes('login_failed')) return <LogIn size={14} className="text-red-400" />;
  if (actionLower.includes('logout')) return <LogOut size={14} className="text-orange-400" />;
  if (actionLower.includes('create') || actionLower.includes('add')) return <Plus size={14} className="text-blue-400" />;
  if (actionLower.includes('update') || actionLower.includes('edit')) return <Edit size={14} className="text-yellow-400" />;
  if (actionLower.includes('delete') || actionLower.includes('remove')) return <Trash2 size={14} className="text-red-400" />;
  if (actionLower.includes('view') || actionLower.includes('read')) return <Eye size={14} className="text-purple-400" />;
  if (actionLower.includes('start')) return <Play size={14} className="text-green-400" />;
  if (actionLower.includes('pause')) return <Pause size={14} className="text-yellow-400" />;
  if (actionLower.includes('end') || actionLower.includes('cancel')) return <Ban size={14} className="text-red-400" />;
  if (actionLower.includes('approve')) return <CheckCircle size={14} className="text-green-400" />;
  if (actionLower.includes('reject')) return <XCircle size={14} className="text-red-400" />;
  if (actionLower.includes('activate')) return <UserCheck size={14} className="text-green-400" />;
  if (actionLower.includes('deactivate')) return <UserX size={14} className="text-orange-400" />;
  if (actionLower.includes('payment') || actionLower.includes('balance')) return <DollarSign size={14} className="text-brand-green" />;
  if (actionLower.includes('export')) return <Download size={14} className="text-cyan-400" />;
  return <Activity size={14} className="text-gray-400" />;
};

// Helper to get Badge Color
const getActionBadgeClass = (action: string) => {
  const actionLower = action.toLowerCase();
  if (actionLower.includes('login') && !actionLower.includes('failed')) return 'bg-green-500/10 text-green-400 border-green-500/20';
  if (actionLower.includes('login_failed')) return 'bg-red-500/10 text-red-400 border-red-500/20';
  if (actionLower.includes('logout')) return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
  if (actionLower.includes('create') || actionLower.includes('add')) return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
  if (actionLower.includes('update') || actionLower.includes('edit')) return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
  if (actionLower.includes('delete') || actionLower.includes('remove') || actionLower.includes('cancel')) return 'bg-red-500/10 text-red-400 border-red-500/20';
  if (actionLower.includes('approve') || actionLower.includes('activate') || actionLower.includes('start')) return 'bg-green-500/10 text-green-400 border-green-500/20';
  if (actionLower.includes('reject') || actionLower.includes('deactivate')) return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
  if (actionLower.includes('payment') || actionLower.includes('balance')) return 'bg-brand-green/10 text-brand-green border-brand-green/20';
  return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
};

const AuditLogsView: React.FC = () => {
  const { t } = useLanguage();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setLogs(DataService.getAuditLogs());
  }, []);

  const { 
      data: filteredLogs, 
      sortConfig, 
      filters, 
      handleSort, 
      handleFilter
  } = useTableData<AuditLog>({
      data: logs,
      initialSort: { key: 'timestamp', direction: 'desc' },
      searchQuery: searchQuery,
      searchKeys: ['userName', 'action', 'targetType', 'targetName', 'details'],
      customSort: (a, b, key, direction) => {
          if (key === 'timestamp') {
              const dir = direction === 'asc' ? 1 : -1;
              return (new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()) * dir;
          }
          return null;
      }
  });

  // Filter Options Generation
  const actionOptions = useMemo(() => Array.from(new Set(logs.map(l => l.action))).map(a => ({ label: a, value: a })), [logs]);
  const targetTypeOptions = useMemo(() => Array.from(new Set(logs.map(l => l.targetType))).map(t => ({ label: t, value: t })), [logs]);

  const columns: Column<AuditLog>[] = useMemo(() => [
      {
          key: 'timestamp',
          label: 'Timestamp',
          sortable: true,
          filterable: true,
          filterType: 'date-range',
          className: 'w-[180px]',
          render: (log) => {
              const date = new Date(log.timestamp);
              return (
                  <div className="flex items-center gap-2">
                      <Clock size={14} className="text-gray-600" />
                      <div>
                          <div className="text-sm text-white font-medium">
                              {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </div>
                          <div className="text-xs text-gray-500">{date.toLocaleDateString()}</div>
                      </div>
                  </div>
              );
          }
      },
      {
          key: 'userName',
          label: 'User',
          sortable: true,
          className: 'w-[200px]',
          render: (log) => (
              <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#222] flex items-center justify-center border border-[#333]">
                      <User size={14} className="text-gray-400" />
                  </div>
                  <div>
                      <div className="text-sm text-white font-medium">{log.userName}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                          <Shield size={10} />
                          {log.userRole}
                      </div>
                  </div>
              </div>
          )
      },
      {
          key: 'action',
          label: 'Action',
          sortable: true,
          filterable: true,
          filterType: 'multi-select',
          filterOptions: actionOptions,
          className: 'w-[150px]',
          render: (log) => (
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full border ${getActionBadgeClass(log.action)}`}>
                  {getActionIcon(log.action)}
                  {log.action}
              </span>
          )
      },
      {
          key: 'targetType',
          label: 'Target',
          sortable: true,
          filterable: true,
          filterType: 'multi-select',
          filterOptions: targetTypeOptions,
          className: 'w-[200px]',
          render: (log) => (
              <div>
                  <div className="text-sm text-white font-medium">{log.targetType}</div>
                  {log.targetName && (
                      <div className="text-xs text-gray-500 truncate max-w-[180px]">{log.targetName}</div>
                  )}
              </div>
          )
      },
      {
          key: 'details',
          label: 'Details',
          render: (log) => (
              <div className="text-sm text-gray-400 truncate max-w-[400px]" title={log.details || ''}>
                  {log.details || '-'}
              </div>
          )
      }
  ], [actionOptions, targetTypeOptions]);

  return (
    <div className="h-full flex flex-col w-full">
        <PageHeader 
            title={t('sidebar.auditLogs')}
            subtitle="Monitor system activity, security events, and user actions."
        />

        <ControlBar>
            <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input 
                    type="text"
                    placeholder="Search logs by user, action, or details..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full ${THEME.card} border ${THEME.border} rounded-xl pl-11 pr-4 py-2.5 text-white placeholder:text-gray-600 focus:ring-1 focus:ring-brand-green outline-none transition-all`}
                />
            </div>
        </ControlBar>

        <Table 
            data={filteredLogs}
            columns={columns}
            keyExtractor={(log) => log.id}
            sortConfig={sortConfig}
            onSort={handleSort}
            filters={filters}
            onFilter={handleFilter}
            emptyState={
                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                    <FileText size={32} className="opacity-20 mb-2" />
                    <p>No audit logs found matching your criteria.</p>
                </div>
            }
        />
    </div>
  );
};

export default AuditLogsView;
