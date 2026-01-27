
import React, { useState } from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import { Trans } from 'react-i18next';
import { Modal } from './Modal';
import Button from './Button';
import { useLanguage } from '../../contexts/LanguageContext';

interface DeleteWithConfirmationProps {
    onConfirm: () => void;
    title?: string;
    description?: React.ReactNode;
    itemName?: string; // Shortcut to generate standard description
    trigger?: React.ReactNode;
    className?: string;
    disabled?: boolean;
}

const DeleteWithConfirmation: React.FC<DeleteWithConfirmationProps> = ({
    onConfirm,
    title,
    description,
    itemName,
    trigger,
    className,
    disabled = false
}) => {
    const { t } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);

    const handleConfirm = (e: React.MouseEvent) => {
        e.stopPropagation();
        onConfirm();
        setIsOpen(false);
    };

    const handleOpen = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!disabled) {
            setIsOpen(true);
        }
    };

    const handleClose = () => {
        setIsOpen(false);
    };

    const modalTitle = title || t('common.deleteConfirm.title');

    return (
        <>
            <button
                onClick={handleOpen}
                disabled={disabled}
                className={className || "p-1.5 text-gray-500 hover:text-red-500 hover:bg-[#333] rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed"}
                title={t('common.delete')}
                type="button"
            >
                {trigger || <Trash2 size={16} />}
            </button>

            {isOpen && (
                <Modal
                    isOpen={isOpen}
                    onClose={handleClose}
                    title={modalTitle}
                    size="sm"
                    zIndex={60}
                >
                    <div className="p-6 text-center space-y-6">
                        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mx-auto">
                            <AlertTriangle size={32} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white mb-2">{modalTitle}</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                {description || (
                                    <Trans
                                        i18nKey="common.deleteConfirm.message"
                                        values={{ name: itemName || 'this item' }}
                                        components={{ bold: <span className="text-white font-bold" /> }}
                                    />
                                )}
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                variant="secondary"
                                onClick={handleClose}
                                fullWidth
                            >
                                {t('common.deleteConfirm.cancel')}
                            </Button>
                            <Button
                                variant="danger"
                                onClick={handleConfirm}
                                fullWidth
                            >
                                {t('common.deleteConfirm.confirm')}
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}
        </>
    );
};

export default DeleteWithConfirmation;