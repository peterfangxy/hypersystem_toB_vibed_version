import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { THEME } from '../../theme';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  size?: ModalSize;
  zIndex?: number;
}

const sizeClasses: Record<ModalSize, string> = {
  sm: 'max-w-md',     // 28rem
  md: 'max-w-lg',     // 32rem
  lg: 'max-w-xl',     // 36rem
  xl: 'max-w-2xl',    // 42rem
  '2xl': 'max-w-4xl', // 56rem
  '3xl': 'max-w-5xl', // 64rem
  '4xl': 'max-w-6xl', // 72rem
};

export const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  zIndex = 100 
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  // Use slimmer padding for smaller modals to save vertical space
  const headerPadding = ['sm', 'md', 'lg', 'xl'].includes(size) ? 'p-4' : 'p-6';

  return createPortal(
    <div 
      className="fixed inset-0 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      style={{ zIndex }}
      onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className={`${THEME.card} border ${THEME.border} rounded-3xl w-full ${sizeClasses[size]} shadow-2xl overflow-hidden flex flex-col max-h-[95vh] relative animate-in zoom-in-95 duration-200`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || onClose) && (
          <div className={`flex justify-between items-start ${headerPadding} border-b border-[#222] shrink-0`}>
            <div className="flex-1">
              {typeof title === 'string' ? (
                <h2 className="text-xl font-bold text-white">{title}</h2>
              ) : (
                title
              )}
            </div>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-white rounded-full p-1 hover:bg-[#333] transition-colors ml-4"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>
        )}
        
        {/* Content */}
        {children}
      </div>
    </div>,
    document.body
  );
};