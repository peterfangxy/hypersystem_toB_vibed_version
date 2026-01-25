import React, { useState, useEffect } from 'react';
import { PokerTable } from '../types';
import * as DataService from '../services/dataService';
import { THEME } from '../theme';
import { Modal } from './ui/Modal';
import NumberInput from './ui/NumberInput';
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
          
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-300">{t('tables.form.capacity')}</label>
            <NumberInput 
                value={formData.capacity}
                onChange={(val) => setFormData({...formData, capacity: val || 9})}
                min={2}
                max={10}
                step={1}
                suffix={t('tables.seats')}
                size="lg"
            />
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