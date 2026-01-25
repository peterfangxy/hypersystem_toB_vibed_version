import React from 'react';
import { ColumnHeader, SortDirection, FilterType } from './ColumnHeader';
import { THEME } from '../../theme';

export interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
  className?: string; // Applied to both th and td
  headerClassName?: string; // Applied only to th
  cellClassName?: string; // Applied only to td
  
  sortable?: boolean;
  filterable?: boolean;
  filterType?: FilterType;
  filterOptions?: { label: string; value: any; color?: string }[];
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  
  sortConfig?: { key: string; direction: SortDirection };
  onSort?: (key: string, direction?: SortDirection) => void;
  
  filters?: Record<string, any>;
  onFilter?: (key: string, value: any) => void;
  
  onRowClick?: (item: T) => void;
  emptyState?: React.ReactNode;
  className?: string;
}

export function Table<T>({ 
  data, 
  columns, 
  keyExtractor,
  sortConfig,
  onSort,
  filters,
  onFilter,
  onRowClick,
  emptyState,
  className = ''
}: TableProps<T>) {
  
  return (
    <div className={`${THEME.card} border ${THEME.border} rounded-3xl overflow-hidden flex flex-col shadow-xl flex-1 min-h-0 mb-3 ${className}`}>
        <div className="overflow-y-auto h-full">
            <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 z-20 shadow-sm">
                    <tr>
                        {columns.map((col) => {
                            if (!col.sortable && !col.filterable) {
                                return (
                                    <th 
                                        key={col.key} 
                                        className={`px-2 py-3 bg-[#1A1A1A] border-b border-[#262626] font-bold text-gray-500 text-xs uppercase tracking-wider ${col.headerClassName || col.className || ''}`}
                                    >
                                        {col.label}
                                    </th>
                                );
                            }
                            return (
                                <ColumnHeader 
                                    key={col.key}
                                    label={col.label}
                                    columnKey={col.key}
                                    className={col.headerClassName || col.className}
                                    sortable={col.sortable}
                                    currentSort={sortConfig}
                                    onSort={onSort}
                                    filterable={col.filterable}
                                    filterType={col.filterType}
                                    filterOptions={col.filterOptions}
                                    currentFilter={filters?.[col.key]}
                                    onFilter={onFilter}
                                />
                            );
                        })}
                    </tr>
                </thead>
                <tbody className="divide-y divide-[#262626]">
                    {data.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length} className="py-12 text-center text-gray-500">
                                {emptyState || "No data found."}
                            </td>
                        </tr>
                    ) : (
                        data.map((item) => (
                            <tr 
                                key={keyExtractor(item)} 
                                onClick={onRowClick ? () => onRowClick(item) : undefined}
                                className={`transition-colors group ${onRowClick ? 'cursor-pointer hover:bg-[#222]' : 'hover:bg-[#222]'}`}
                            >
                                {columns.map((col) => (
                                    <td 
                                        key={`${keyExtractor(item)}-${col.key}`} 
                                        className={`px-2 py-3 ${col.cellClassName || col.className || ''}`}
                                    >
                                        {col.render ? col.render(item) : (item as any)[col.key]}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    </div>
  );
}