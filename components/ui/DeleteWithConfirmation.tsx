import React, { useState } from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';
import Button from './Button';

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
    title = "Confirm Deletion",
    description,
    itemName,
    trigger,
    className,
    disabled = false
}) => {
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

    const content = description || (
        <>
            Are you sure you want to delete <span className="text-white font-bold">{itemName || 'this item'}</span>? This action cannot be undone.
        </>
    );

    return (
        <>
            <button
                onClick={handleOpen}
                disabled={disabled}
                className={className || "p-1.5 text-gray-500 hover:text-red-500 hover:bg-[#333] rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed"}
                title="Delete"
                type="button"
            >
                {trigger || <Trash2 size={16} />}
            </button>

            {isOpen && (
                <Modal
                    isOpen={isOpen}
                    onClose={handleClose}
                    title={title}
                    size="sm"
                    zIndex={60}
                >
                    <div className="p-6 text-center space-y-6">
                        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mx-auto">
                            <AlertTriangle size={32} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                {content}
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                variant="secondary"
                                onClick={handleClose}
                                fullWidth
                            >
                                No, Keep It
                            </Button>
                            <Button
                                variant="danger"
                                onClick={handleConfirm}
                                fullWidth
                            >
                                Yes, Delete
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}
        </>
    );
};

export default DeleteWithConfirmation;