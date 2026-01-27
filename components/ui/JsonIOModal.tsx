
import React, { useState, useEffect } from 'react';
import { Copy, Upload, Check, AlertCircle } from 'lucide-react';
import { Modal } from './Modal';
import { THEME } from '../../theme';
import { useLanguage } from '../../contexts/LanguageContext';

interface JsonIOModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'import' | 'export';
  exportData?: any;
  onImport?: (data: any) => void;
  validate?: (data: any) => string | null; // Returns error message or null
  title?: string;
}

export const JsonIOModal: React.FC<JsonIOModalProps> = ({
  isOpen,
  onClose,
  mode,
  exportData,
  onImport,
  validate,
  title
}) => {
  const { t } = useLanguage();
  const [jsonContent, setJsonContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setCopySuccess(false);
      if (mode === 'export' && exportData) {
        try {
          setJsonContent(JSON.stringify(exportData, null, 2));
        } catch (e) {
          setError(t('common.io.errorSerialize'));
        }
      } else {
        setJsonContent('');
      }
    }
  }, [isOpen, mode, exportData, t]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonContent);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleImport = () => {
    setError(null);
    try {
      const parsed = JSON.parse(jsonContent);
      
      if (validate) {
        const validationError = validate(parsed);
        if (validationError) {
          setError(validationError);
          return;
        }
      }

      if (onImport) {
        onImport(parsed);
        onClose();
      }
    } catch (e) {
      setError((e as Error).message || t('common.io.errorParse'));
    }
  };

  const defaultTitle = title || (mode === 'export' ? t('common.io.exportTitle') : t('common.io.importTitle'));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={defaultTitle}
      size="xl"
      zIndex={200}
    >
      <div className="p-6 flex flex-col h-[500px]">
        {mode === 'export' && (
            <div className="mb-4 text-sm text-gray-400">
                {t('common.io.copyHelp')}
            </div>
        )}
        {mode === 'import' && (
            <div className="mb-4 text-sm text-gray-400">
                {t('common.io.importHelp')}
            </div>
        )}
        
        <textarea 
            value={jsonContent}
            onChange={(e) => { setJsonContent(e.target.value); setError(null); }}
            readOnly={mode === 'export'}
            className={`flex-1 bg-[#111] border rounded-xl p-4 font-mono text-xs text-gray-300 outline-none resize-none mb-4 ${error ? 'border-red-500' : 'border-[#333] focus:border-brand-green'}`}
            placeholder={mode === 'import' ? t('common.io.placeholder') : ''}
        />

        {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-xs">
                <AlertCircle size={16} />
                {error}
            </div>
        )}

        <div className="flex justify-end gap-3">
            <button 
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-sm font-bold text-gray-400 hover:text-white hover:bg-[#222] transition-colors"
            >
                {t('common.cancel')}
            </button>
            
            {mode === 'export' ? (
                <button 
                    type="button"
                    onClick={handleCopy}
                    className={`px-6 py-2 rounded-xl font-bold flex items-center gap-2 transition-all ${copySuccess ? 'bg-green-500 text-white' : THEME.buttonPrimary}`}
                >
                    {copySuccess ? <Check size={18} /> : <Copy size={18} />}
                    {copySuccess ? t('common.io.copied') : t('common.io.copy')}
                </button>
            ) : (
                <button 
                    type="button"
                    onClick={handleImport}
                    className={`${THEME.buttonPrimary} px-6 py-2 rounded-xl font-bold flex items-center gap-2`}
                >
                    <Upload size={18} /> {t('common.io.import')}
                </button>
            )}
        </div>
      </div>
    </Modal>
  );
};