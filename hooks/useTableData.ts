import { useState, useMemo } from 'react';
import { SortDirection } from '../components/ui/ColumnHeader';

interface UseTableDataProps<T> {
  data: T[];
  initialSort?: { key: string; direction: SortDirection };
  initialFilters?: Record<string, any>;
  searchQuery?: string;
  searchKeys?: string[]; // Keys to search in
  customSort?: (a: T, b: T, key: string, direction: SortDirection) => number | undefined | null;
}

export function useTableData<T>({
  data,
  initialSort = { key: '', direction: 'asc' },
  initialFilters = {},
  searchQuery = '',
  searchKeys = [],
  customSort
}: UseTableDataProps<T>) {
  const [sortConfig, setSortConfig] = useState(initialSort);
  const [filters, setFilters] = useState<Record<string, any>>(initialFilters);

  const handleSort = (key: string, direction?: SortDirection) => {
    setSortConfig(current => {
      if (direction) return { key, direction };
      let newDir: SortDirection = 'asc';
      if (current.key === key && current.direction === 'asc') {
        newDir = 'desc';
      }
      return { key, direction: newDir };
    });
  };

  const handleFilter = (key: string, value: any) => {
    setFilters(prev => {
      const next = { ...prev };
      // Clean up empty filters
      if (value === undefined || value === null || (Array.isArray(value) && value.length === 0) || value === '') {
        delete next[key];
      } else {
        next[key] = value;
      }
      return next;
    });
  };

  const processedData = useMemo(() => {
    let result = [...data];

    // 1. Filtering
    if (Object.keys(filters).length > 0) {
      result = result.filter(item => {
        return Object.entries(filters).every(([key, filterValue]) => {
          const itemValue = (item as any)[key];

          // Array (Multi-select)
          if (Array.isArray(filterValue)) {
             if (filterValue.length === 0) return true;
             // Handle boolean values in itemValue specially if needed, but generic includes usually works
             return filterValue.includes(itemValue);
          }

          // Date Range
          if (filterValue && typeof filterValue === 'object' && ('start' in filterValue || 'end' in filterValue)) {
             if (!itemValue) return false;
             const itemDate = new Date(itemValue).getTime();
             const { start: filterStart, end: filterEnd } = filterValue as { start?: any, end?: any };
             const start = filterStart ? new Date(filterStart).getTime() : -Infinity;
             const end = filterEnd ? new Date(filterEnd).getTime() : Infinity;
             return itemDate >= start && itemDate <= end;
          }

          // Exact Match
          return itemValue == filterValue;
        });
      });
    }

    // 2. Searching
    if (searchQuery && searchKeys.length > 0) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item => {
        return searchKeys.some(key => {
          const val = (item as any)[key];
          return String(val || '').toLowerCase().includes(query);
        });
      });
    }

    // 3. Sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        const dir = sortConfig.direction === 'asc' ? 1 : -1;
        
        // Custom Sort Override
        if (customSort) {
            const customResult = customSort(a, b, sortConfig.key, sortConfig.direction);
            if (customResult !== null && customResult !== undefined) {
                return customResult;
            }
        }

        const aValue = (a as any)[sortConfig.key];
        const bValue = (b as any)[sortConfig.key];

        // Handle boolean sorting
        if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
             return sortConfig.direction === 'asc' 
                ? (aValue === bValue ? 0 : aValue ? 1 : -1)
                : (aValue === bValue ? 0 : aValue ? -1 : 1);
        }

        // Default comparison
        if (aValue === undefined || bValue === undefined) return 0;
        if (aValue < bValue) return -1 * dir;
        if (aValue > bValue) return 1 * dir;
        return 0;
      });
    }

    return result;
  }, [data, filters, searchQuery, sortConfig, searchKeys, customSort]);

  return {
    data: processedData,
    sortConfig,
    filters,
    handleSort,
    handleFilter,
    setFilters // Expose setter if direct manipulation is needed
  };
}