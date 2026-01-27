import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  User,
  Shield,
  Activity,
  FileText,
  LogIn,
  LogOut,
  Edit,
  Trash2,
  Plus,
  Eye,
  Calendar,
  X,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Play,
  Pause,
  Ban,
  CheckCircle,
  XCircle,
  DollarSign,
  UserCheck,
  UserX,
  Download
} from 'lucide-react';
import { 
  AuditLog, 
  getAuditLogsFromDb, 
  getDistinctActions, 
  getDistinctTargetTypes,
  formatAction,
  getRoleDisplayName 
} from '../services/db/auditLogDbService';
import { getCurrentUser } from '../services/sessionService';
import { THEME } from '../theme';

// Action icon mapping
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

// Action badge color
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
  const currentUser = getCurrentUser();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAction, setSelectedAction] = useState('');
  const [selectedTargetType, setSelectedTargetType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter options
  const [actionOptions, setActionOptions] = useState<string[]>([]);
  const [targetTypeOptions, setTargetTypeOptions] = useState<string[]>([]);
  
  // Sorting
  type SortField = 'timestamp' | 'userName' | 'action' | 'targetType';
  type SortDirection = 'asc' | 'desc';
  const [sortField, setSortField] = useState<SortField>('timestamp');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Check permission - super_admin and admin can view audit logs
  const userRole = currentUser?.role?.toLowerCase();
  const canViewAuditLogs = userRole === 'super_admin' || userRole === 'admin';

  if (!canViewAuditLogs) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center">
          <Shield size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-500 mb-2">Access Denied</h2>
          <p className="text-gray-400">Only Admins can view audit logs.</p>
        </div>
      </div>
    );
  }

  const loadLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const offset = (currentPage - 1) * pageSize;
      const filters: any = {};
      
      if (selectedAction) filters.action = selectedAction;
      if (selectedTargetType) filters.targetType = selectedTargetType;
      if (startDate) filters.startDate = new Date(startDate).toISOString();
      if (endDate) filters.endDate = new Date(endDate + 'T23:59:59').toISOString();

      const { logs: fetchedLogs, total } = await getAuditLogsFromDb(
        pageSize,
        offset,
        Object.keys(filters).length > 0 ? filters : undefined
      );

      // Apply search filter client-side
      let filteredLogs = fetchedLogs;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredLogs = fetchedLogs.filter(log => 
          log.userName.toLowerCase().includes(query) ||
          log.action.toLowerCase().includes(query) ||
          log.targetType.toLowerCase().includes(query) ||
          (log.targetName && log.targetName.toLowerCase().includes(query)) ||
          (log.details && log.details.toLowerCase().includes(query))
        );
      }

      setLogs(filteredLogs);
      setTotalCount(total);
    } catch (error) {
      console.error('Error loading audit logs:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, selectedAction, selectedTargetType, startDate, endDate, searchQuery]);

  // Sort logs client-side
  const sortedLogs = useMemo(() => {
    const sorted = [...logs].sort((a, b) => {
      let aVal: string | number;
      let bVal: string | number;
      
      switch (sortField) {
        case 'timestamp':
          aVal = new Date(a.timestamp).getTime();
          bVal = new Date(b.timestamp).getTime();
          break;
        case 'userName':
          aVal = a.userName.toLowerCase();
          bVal = b.userName.toLowerCase();
          break;
        case 'action':
          aVal = a.action.toLowerCase();
          bVal = b.action.toLowerCase();
          break;
        case 'targetType':
          aVal = a.targetType.toLowerCase();
          bVal = b.targetType.toLowerCase();
          break;
        default:
          return 0;
      }
      
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [logs, sortField, sortDirection]);

  // Handle sort click
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection(field === 'timestamp' ? 'desc' : 'asc');
    }
  };

  // Sort icon component
  const SortIcon: React.FC<{ field: SortField }> = ({ field }) => {
    if (sortField !== field) {
      return <ArrowUpDown size={14} className="text-gray-600" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp size={14} className="text-brand-green" />
      : <ArrowDown size={14} className="text-brand-green" />;
  };

  const loadFilterOptions = async () => {
    const [actions, targetTypes] = await Promise.all([
      getDistinctActions(),
      getDistinctTargetTypes(),
    ]);
    setActionOptions(actions);
    setTargetTypeOptions(targetTypes);
  };

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  useEffect(() => {
    loadFilterOptions();
  }, []);

  const totalPages = Math.ceil(totalCount / pageSize);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedAction('');
    setSelectedTargetType('');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  const hasActiveFilters = selectedAction || selectedTargetType || startDate || endDate;

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <FileText className="text-brand-green" />
            Audit Logs
          </h1>
          <p className="text-gray-500 mt-1">Track all system activities and user actions</p>
        </div>
        
        <button
          onClick={() => loadLogs()}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-[#1A1A1A] hover:bg-[#222] border border-[#333] rounded-xl text-gray-300 transition-all"
        >
          <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Search & Filters Bar */}
      <div className="bg-[#111] border border-[#222] rounded-2xl p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by user, action, target..."
              className={`w-full ${THEME.input} rounded-xl pl-12 pr-4 py-3 outline-none`}
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all ${
              showFilters || hasActiveFilters
                ? 'bg-brand-green/10 border-brand-green/30 text-brand-green'
                : 'bg-[#1A1A1A] border-[#333] text-gray-400 hover:text-white'
            }`}
          >
            <Filter size={18} />
            Filters
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-brand-green" />
            )}
          </button>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-[#222] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Action Filter */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500">Action</label>
              <select
                value={selectedAction}
                onChange={(e) => { setSelectedAction(e.target.value); setCurrentPage(1); }}
                className={`w-full ${THEME.input} rounded-lg px-3 py-2.5 text-sm outline-none`}
              >
                <option value="">All Actions</option>
                {actionOptions.map(action => (
                  <option key={action} value={action}>{formatAction(action)}</option>
                ))}
              </select>
            </div>

            {/* Target Type Filter */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500">Target Type</label>
              <select
                value={selectedTargetType}
                onChange={(e) => { setSelectedTargetType(e.target.value); setCurrentPage(1); }}
                className={`w-full ${THEME.input} rounded-lg px-3 py-2.5 text-sm outline-none`}
              >
                <option value="">All Types</option>
                {targetTypeOptions.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Start Date */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500">From Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }}
                className={`w-full ${THEME.input} rounded-lg px-3 py-2.5 text-sm outline-none`}
              />
            </div>

            {/* End Date */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500">To Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }}
                className={`w-full ${THEME.input} rounded-lg px-3 py-2.5 text-sm outline-none`}
              />
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <div className="md:col-span-2 lg:col-span-4 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  <X size={14} />
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Results Info */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>
          Showing {sortedLogs.length} of {totalCount} entries
          {sortField && (
            <span className="ml-2 text-gray-600">
              • Sorted by {sortField === 'userName' ? 'User' : sortField === 'targetType' ? 'Target' : sortField.charAt(0).toUpperCase() + sortField.slice(1)} ({sortDirection === 'asc' ? '↑' : '↓'})
            </span>
          )}
        </span>
        <span>
          Page {currentPage} of {totalPages || 1}
        </span>
      </div>

      {/* Logs Table */}
      <div className="bg-[#111] border border-[#222] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#222]">
                <th 
                  className="px-4 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-300 transition-colors select-none"
                  onClick={() => handleSort('timestamp')}
                >
                  <div className="flex items-center gap-2">
                    Timestamp
                    <SortIcon field="timestamp" />
                  </div>
                </th>
                <th 
                  className="px-4 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-300 transition-colors select-none"
                  onClick={() => handleSort('userName')}
                >
                  <div className="flex items-center gap-2">
                    User
                    <SortIcon field="userName" />
                  </div>
                </th>
                <th 
                  className="px-4 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-300 transition-colors select-none"
                  onClick={() => handleSort('action')}
                >
                  <div className="flex items-center gap-2">
                    Action
                    <SortIcon field="action" />
                  </div>
                </th>
                <th 
                  className="px-4 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-300 transition-colors select-none"
                  onClick={() => handleSort('targetType')}
                >
                  <div className="flex items-center gap-2">
                    Target
                    <SortIcon field="targetType" />
                  </div>
                </th>
                <th className="px-4 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Details</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                // Skeleton Loading
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="border-b border-[#1A1A1A]">
                    <td className="px-4 py-4"><div className="h-4 bg-[#222] rounded animate-pulse w-32" /></td>
                    <td className="px-4 py-4"><div className="h-4 bg-[#222] rounded animate-pulse w-28" /></td>
                    <td className="px-4 py-4"><div className="h-4 bg-[#222] rounded animate-pulse w-24" /></td>
                    <td className="px-4 py-4"><div className="h-4 bg-[#222] rounded animate-pulse w-36" /></td>
                    <td className="px-4 py-4"><div className="h-4 bg-[#222] rounded animate-pulse w-40" /></td>
                  </tr>
                ))
              ) : sortedLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                    <Activity size={32} className="mx-auto mb-3 opacity-50" />
                    <p>No audit logs found</p>
                  </td>
                </tr>
              ) : (
                sortedLogs.map((log) => {
                  const { date, time } = formatTimestamp(log.timestamp);
                  return (
                    <tr key={log.id} className="border-b border-[#1A1A1A] hover:bg-[#1A1A1A]/50 transition-colors">
                      {/* Timestamp */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Clock size={14} className="text-gray-600" />
                          <div>
                            <div className="text-sm text-white font-medium">{time}</div>
                            <div className="text-xs text-gray-500">{date}</div>
                          </div>
                        </div>
                      </td>

                      {/* User */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-[#222] flex items-center justify-center">
                            <User size={14} className="text-gray-400" />
                          </div>
                          <div>
                            <div className="text-sm text-white font-medium">{log.userName}</div>
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                              <Shield size={10} />
                              {getRoleDisplayName(log.userRole)}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full border ${getActionBadgeClass(log.action)}`}>
                          {getActionIcon(log.action)}
                          {formatAction(log.action)}
                        </span>
                      </td>

                      {/* Target */}
                      <td className="px-4 py-3">
                        <div>
                          <div className="text-sm text-white">{log.targetType}</div>
                          {log.targetName && (
                            <div className="text-xs text-gray-500 truncate max-w-[200px]">{log.targetName}</div>
                          )}
                        </div>
                      </td>

                      {/* Details */}
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-400 truncate max-w-[250px]" title={log.details || undefined}>
                          {log.details || '-'}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-4 border-t border-[#222]">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
              Previous
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                      currentPage === pageNum
                        ? 'bg-brand-green text-black'
                        : 'text-gray-400 hover:text-white hover:bg-[#222]'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogsView;
