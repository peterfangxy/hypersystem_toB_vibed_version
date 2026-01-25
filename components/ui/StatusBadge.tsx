
import React from 'react';

export type StatusVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'purple';

interface StatusBadgeProps {
  children: React.ReactNode;
  variant?: StatusVariant;
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

const variants: Record<StatusVariant, string> = {
  success: 'bg-brand-green/10 text-brand-green border-brand-green/20',
  warning: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  danger: 'bg-red-500/10 text-red-500 border-red-500/20',
  info: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  neutral: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  children, 
  variant = 'neutral', 
  size = 'sm', 
  dot = false,
  className = '' 
}) => {
  const sizeClasses = size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1';
  
  return (
    <span className={`
      inline-flex items-center justify-center gap-1.5 
      font-bold uppercase tracking-wider 
      rounded border 
      whitespace-nowrap
      ${variants[variant]} 
      ${sizeClasses} 
      ${className}
    `}>
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${variant === 'success' || variant === 'danger' ? 'animate-pulse' : ''} bg-current`} />
      )}
      {children}
    </span>
  );
};

export default StatusBadge;
