
import React, { useState, useEffect } from 'react';
import { PokerTable, TableStatus } from '../types';
import * as DataService from '../services/dataService';
import { THEME } from '../theme';
import { Modal } from './ui/Modal';
import { useLanguage } from '../contexts/LanguageContext';

interface TableFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (table: PokerTable) => void;
  initialData?: PokerTable;
}

const TableForm: React.FC<TableFormProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<Partial<PokerTable>>({
    name: '',
    capacity: 9,
    status: 'Active',
    notes: '',
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData(initialData);
      } else {
        // Auto-generate name for new table
        setFormData({
          name: DataService.getNextTableName(),
          capacity: 9,
          status: 'Active',
          notes: '',
        });
      }
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTable: PokerTable = {
      id: initialData?.id || crypto.randomUUID(),
      ...formData as PokerTable
    };
    onSubmit(newTable);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? t('tables.form.titleEdit') : t('tables.form.titleNew')}
      size="md"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="space-y-4">
            <div className="space-y-1">
            <label className="text-sm font-medium text-gray-300">{t('tables.form.name')}</label>
            <input 
              required
              type="text" 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className={`w-full ${THEME.input} rounded-xl px-4 py-3 outline-none transition-all placeholder:text-gray-600`}
              placeholder="e.g. Table 1"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
              <label className="text-sm font-medium text-gray-300">{t('tables.form.status')}</label>
              <select 
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value as TableStatus})}
                className={`w-full ${THEME.input} rounded-xl px-4 py-3 outline-none appearance-none cursor-pointer`}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-300">{t('tables.form.capacity')}</label>
              <select 
                value={formData.capacity}
                onChange={e => setFormData({...formData, capacity: parseInt(e.target.value)})}
                className={`w-full ${THEME.input} rounded-xl px-4 py-3 outline-none appearance-none cursor-pointer`}
              >
                {[2, 6, 8, 9, 10].map(num => (
                  <option key={num} value={num}>{num} {t('tables.seats')}</option>
                ))}
              </select>
            </div>
          </div>

            <div className="space-y-1">
            <label className="text-sm font-medium text-gray-300">{t('tables.form.notes')}</label>
            <textarea 
              rows={3}
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
              className={`w-full ${THEME.input} rounded-xl px-4 py-3 outline-none resize-none`}
              placeholder="Table features or location..."
            />
          </div>
        </div>

        <div className="pt-2">
          <button 
            type="submit" 
            className={`w-full ${THEME.buttonPrimary} font-bold text-lg py-4 rounded-xl transition-transform active:scale-[0.98]`}
          >
            {initialData ? t('tables.form.submitSave') : t('tables.form.submitCreate')}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default TableForm;
