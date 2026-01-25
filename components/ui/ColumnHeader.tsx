
import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowUp, 
  ArrowDown, 
  ArrowUpDown,
  Filter, 
  X, 
  Check, 
  Calendar,
  Search,
  ListFilter,
  ArrowDownAZ,
  ArrowUpAZ
} from 'lucide-react';
import { THEME } from '../../theme';

export type SortDirection = 'asc' | 'desc';
export type FilterType = 'multi-select' | 'date-range' | 'text';

interface ColumnHeaderProps {
  label: string;
  columnKey: string;
  className?: string;
  
  // Sorting
  sortable?: boolean;
  currentSort?: { key: string; direction: SortDirection };
  onSort?: (key: string, direction?: SortDirection) => void;

  // Filtering
  filterable?: boolean;
  filterType?: FilterType;
  filterOptions?: { label: string; value: string | boolean | number, color?: string }[];
  currentFilter?: any;
  onFilter?: (key: string, value: any) => void;
}

export const ColumnHeader: React.FC<ColumnHeaderProps> = ({
  label,
  columnKey,
  className = '',
  sortable = false,
  currentSort,
  onSort,
  filterable = false,
  filterType = 'multi-select',
  filterOptions = [],
  currentFilter,
  onFilter
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Local state for filter inputs (buffer before applying)
  const [tempFilter, setTempFilter] = useState<any>(currentFilter);

  // Sync prop changes to local state when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setTempFilter(currentFilter);
    }
  }, [isOpen, currentFilter]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSimpleSort = () => {
    if (sortable && onSort) {
      onSort(columnKey);
    }
  };

  const handleMenuSort = (direction: SortDirection) => {
      if (onSort) {
          onSort(columnKey, direction);
      }
      setIsOpen(false);
  };

  const applyFilter = () => {
    if (onFilter) {
      onFilter(columnKey, tempFilter);
    }
    setIsOpen(false);
  };

  const clearFilter = () => {
    setTempFilter(undefined);
    if (onFilter) {
      onFilter(columnKey, undefined);
    }
    setIsOpen(false);
  };

  const isSorted = currentSort?.key === columnKey;
  const isFiltered = currentFilter !== undefined && (Array.isArray(currentFilter) ? currentFilter.length > 0 : true);

  // --- Render Filter Content based on Type ---
  const renderFilterContent = () => {
    if (filterType === 'date-range') {
        const start = tempFilter?.start || '';
        const end = tempFilter?.end || '';
        return (
            <div className="p-3 space-y-3 min-w-[240px]">
                <div className="space-y-1">
                    <label className="text-xs text-gray-500 uppercase font-bold block">From</label>
                    <input 
                        type="date" 
                        value={start}
                        onChange={(e) => setTempFilter({ ...tempFilter, start: e.target.value })}
                        className={`w-full ${THEME.input} rounded px-2 py-1.5 text-sm [color-scheme:dark]`}
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs text-gray-500 uppercase font-bold block">To</label>
                    <input 
                        type="date" 
                        value={end}
                        onChange={(e) => setTempFilter({ ...tempFilter, end: e.target.value })}
                        className={`w-full ${THEME.input} rounded px-2 py-1.5 text-sm [color-scheme:dark]`}
                    />
                </div>
            </div>
        );
    }

    if (filterType === 'multi-select') {
        const selectedValues = (Array.isArray(tempFilter) ? tempFilter : []) as any[];
        
        const toggleValue = (val: any) => {
            if (selectedValues.includes(val)) {
                setTempFilter(selectedValues.filter(v => v !== val));
            } else {
                setTempFilter([...selectedValues, val]);
            }
        };

        const selectAll = () => {
            setTempFilter(filterOptions.map(o => o.value));
        };

        const clearSelection = () => {
            setTempFilter([]);
        };

        return (
            <div className="flex flex-col min-w-[220px] max-h-[300px]">
                <div className="p-2 border-b border-[#333] flex gap-2 text-xs">
                    <button type="button" onClick={selectAll} className="text-brand-green hover:underline">Select All</button>
                    <span className="text-gray-600">|</span>
                    <button type="button" onClick={clearSelection} className="text-gray-400 hover:text-white hover:underline">Clear</button>
                </div>
                <div className="overflow-y-auto p-1 flex-1 space-y-0.5">
                    {filterOptions.map((option, idx) => {
                        const isSelected = selectedValues.includes(option.value);
                        return (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => toggleValue(option.value)}
                                className="flex items-center gap-3 w-full p-2 hover:bg-[#222] rounded text-left group transition-colors"
                            >
                                <div className={`w-4 h-4 border rounded flex items-center justify-center transition-colors ${isSelected ? 'bg-brand-green border-brand-green text-black' : 'border-gray-600 bg-transparent'}`}>
                                    {isSelected && <Check size={12} strokeWidth={4} />}
                                </div>
                                <span className={`text-sm ${isSelected ? 'text-white font-medium' : 'text-gray-400'}`} style={{ color: option.color }}>
                                    {option.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    }

    return null;
  };

  // --- Scenario 1: Filterable (Complex Header) ---
  if (filterable) {
      return (
        <th className={`relative group px-2 py-3 border-b border-[#262626] bg-[#1A1A1A] select-none ${className}`}>
            <div className={`flex items-center gap-2 h-full cursor-pointer hover:bg-[#222] -m-2 p-2 rounded-lg transition-colors ${className.includes('text-right') ? 'justify-end' : className.includes('text-center') ? 'justify-center' : ''}`}
                 onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center gap-2">
                    <span className={`font-bold text-xs uppercase tracking-wider ${isFiltered || isSorted ? 'text-white' : 'text-gray-500'}`}>{label}</span>
                    
                    {/* State Indicators */}
                    <div className="flex items-center">
                        {isSorted && (
                            <span className="text-brand-green mr-1">
                                {currentSort?.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                            </span>
                        )}
                        <ListFilter size={14} className={isFiltered ? 'text-brand-green' : 'text-gray-600'} />
                    </div>
                </div>

                {/* Dropdown Menu */}
                {isOpen && (
                    <div 
                        ref={dropdownRef}
                        className="absolute top-full left-0 mt-2 bg-[#1A1A1A] border border-[#333] rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-left min-w-[200px]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Sort Controls (Moved Inside) */}
                        {sortable && (
                            <div className="p-1 border-b border-[#333]">
                                <button 
                                    onClick={() => handleMenuSort('asc')}
                                    className={`flex items-center gap-3 w-full p-2 rounded text-left transition-colors ${isSorted && currentSort?.direction === 'asc' ? 'bg-brand-green/10 text-brand-green' : 'text-gray-400 hover:bg-[#222] hover:text-white'}`}
                                >
                                    <ArrowDownAZ size={16} />
                                    <span className="text-sm font-medium">Sort Ascending</span>
                                    {isSorted && currentSort?.direction === 'asc' && <Check size={14} className="ml-auto" />}
                                </button>
                                <button 
                                    onClick={() => handleMenuSort('desc')}
                                    className={`flex items-center gap-3 w-full p-2 rounded text-left transition-colors ${isSorted && currentSort?.direction === 'desc' ? 'bg-brand-green/10 text-brand-green' : 'text-gray-400 hover:bg-[#222] hover:text-white'}`}
                                >
                                    <ArrowUpAZ size={16} />
                                    <span className="text-sm font-medium">Sort Descending</span>
                                    {isSorted && currentSort?.direction === 'desc' && <Check size={14} className="ml-auto" />}
                                </button>
                            </div>
                        )}

                        {/* Filter Content */}
                        {renderFilterContent()}

                        {/* Footer Actions */}
                        <div className="p-3 border-t border-[#333] bg-[#151515] flex justify-between gap-2">
                            <button 
                                onClick={clearFilter}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold text-gray-400 hover:text-white hover:bg-[#222] transition-colors"
                            >
                                Reset
                            </button>
                            <button 
                                onClick={applyFilter}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-brand-green text-black hover:bg-[#05a357] transition-colors"
                            >
                                Apply
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </th>
      );
  }

  // --- Scenario 2: Simple Sortable (No Filter) ---
  return (
    <th 
        className={`relative group px-2 py-3 border-b border-[#262626] bg-[#1A1A1A] select-none cursor-pointer hover:bg-[#222] transition-colors ${className}`}
        onClick={handleSimpleSort}
    >
        <div className={`flex items-center gap-2 h-full ${className.includes('text-right') ? 'justify-end' : className.includes('text-center') ? 'justify-center' : ''}`}>
            <span className={`font-bold text-xs uppercase tracking-wider ${isSorted ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'}`}>{label}</span>
            {isSorted ? (
                <span className="text-brand-green">
                    {currentSort?.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                </span>
            ) : (
                <ArrowUpDown size={14} className="text-gray-700 opacity-50 group-hover:opacity-100 group-hover:text-gray-500 transition-all" />
            )}
        </div>
    </th>
  );
};
