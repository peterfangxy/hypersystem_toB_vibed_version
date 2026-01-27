
import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit2, 
  Power,
  Users2
} from 'lucide-react';
import { PokerTable, TableStatus } from '../types';
import * as DataService from '../services/dataService';
import { THEME } from '../theme';
import TableForm from '../components/TableForm';
import { useLanguage } from '../contexts/LanguageContext';
import { PageHeader } from '../components/ui/PageLayout';
import DeleteWithConfirmation from '../components/ui/DeleteWithConfirmation';

const TablesView = () => {
  const { t } = useLanguage();
  const [tables, setTables] = useState<PokerTable[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<PokerTable | undefined>(undefined);

  useEffect(() => {
    setTables(DataService.getTables());
  }, []);

  const handleCreateOrUpdate = (table: PokerTable) => {
    DataService.saveTable(table);
    setTables(DataService.getTables());
    setIsFormOpen(false);
    setEditingTable(undefined);
  };

  const handleDelete = (id: string) => {
    DataService.deleteTable(id);
    setTables(DataService.getTables());
  };

  const handleToggleStatus = (e: React.MouseEvent, table: PokerTable) => {
    // Toggle logic: If Active -> Inactive. If Inactive/Archived -> Active.
    const newStatus: TableStatus = table.status === 'Active' ? 'Inactive' : 'Active';
    const updated = { ...table, status: newStatus };
    DataService.saveTable(updated);
    setTables(DataService.getTables());
  };

  const openCreate = () => {
    setEditingTable(undefined);
    setIsFormOpen(true);
  };

  const openEdit = (table: PokerTable) => {
    setEditingTable(table);
    setIsFormOpen(true);
  };

  return (
    <div className="h-full flex flex-col w-full">
      <PageHeader
        title={t('tables.title')}
        subtitle={t('tables.subtitle')}
        actions={
            <button 
                onClick={openCreate}
                className={`${THEME.buttonPrimary} px-6 py-3 rounded-full font-semibold shadow-lg shadow-green-500/20 flex items-center gap-2 transition-transform hover:scale-105 active:scale-95`}
            >
                <Plus size={20} strokeWidth={2.5} />
                {t('tables.addBtn')}
            </button>
        }
      />

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
        {tables.map((table) => (
          <div 
            key={table.id} 
            className={`${THEME.card} p-6 rounded-3xl flex flex-col border border-transparent hover:border-[#333] transition-all group relative overflow-hidden`}
          >
            {/* Table Top Surface Visual */}
            <div className={`absolute top-0 right-0 p-20 rounded-full translate-x-1/3 -translate-y-1/3 opacity-5 pointer-events-none ${table.status === 'Active' ? 'bg-brand-green' : 'bg-gray-500'}`} />

            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="flex flex-col gap-2">
                <h3 className="text-xl font-bold text-white tracking-tight">{table.name}</h3>
                <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${table.status === 'Active' ? 'bg-brand-green animate-pulse' : table.status === 'Archived' ? 'bg-red-500' : 'bg-gray-500'}`}></span>
                    <span className={`text-xs font-bold uppercase tracking-wider ${table.status === 'Active' ? 'text-brand-green' : table.status === 'Archived' ? 'text-red-500' : 'text-gray-500'}`}>
                        {t(`tables.statusOption.${table.status.toLowerCase()}`)}
                    </span>
                </div>
              </div>
              
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => openEdit(table)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-[#333] rounded-full transition-colors"
                  title={t('common.edit')}
                >
                  <Edit2 size={16} />
                </button>
                <DeleteWithConfirmation 
                    onConfirm={() => handleDelete(table.id)}
                    itemName={table.name}
                    title={t('tables.deleteTitle')}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-[#333] rounded-full transition-colors"
                />
              </div>
            </div>

            <div className="flex-1 relative z-10">
               <div className="flex items-center gap-2 text-gray-400 mb-2">
                 <Users2 size={16} />
                 <span className="text-sm">{table.capacity} {t('tables.seats')}</span>
               </div>
               {table.notes && (
                 <p className="text-sm text-gray-600 line-clamp-2">{table.notes}</p>
               )}
            </div>

            {/* Bottom decoration */}
            <div className="mt-4 pt-4 border-t border-[#222] flex justify-between items-center text-xs text-gray-600 relative z-10">
               <span>{t('tables.id')}: {table.id.slice(0,4)}</span>
               
               <button 
                 onClick={(e) => handleToggleStatus(e, table)}
                 className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                    table.status === 'Active'
                      ? 'bg-brand-green text-black shadow-[0_0_12px_rgba(6,193,103,0.6)] hover:scale-110 hover:shadow-[0_0_20px_rgba(6,193,103,0.8)]'
                      : 'bg-[#222] text-gray-600 hover:text-gray-300 hover:bg-[#333] hover:scale-110'
                 }`}
                 title={table.status === 'Active' ? t('tables.turnOff') : t('tables.turnOn')}
               >
                  <Power size={16} strokeWidth={2.5} />
               </button>
            </div>
          </div>
        ))}
        
        {/* Empty State Card/Button */}
        <button 
          onClick={openCreate}
          className="border-2 border-dashed border-[#222] rounded-3xl p-6 flex flex-col items-center justify-center text-gray-600 hover:border-brand-green/50 hover:text-brand-green/80 transition-all min-h-[180px]"
        >
          <div className="w-12 h-12 rounded-full bg-[#111] flex items-center justify-center mb-3">
            <Plus size={24} />
          </div>
          <span className="font-medium">{t('tables.newTable')}</span>
        </button>
      </div>

      <TableForm 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleCreateOrUpdate}
        initialData={editingTable}
      />
    </div>
  );
};

export default TablesView;
