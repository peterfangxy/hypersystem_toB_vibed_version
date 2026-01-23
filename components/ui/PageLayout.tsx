
import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, actions, className = '' }) => {
  return (
    <div className={`flex justify-between items-end mb-6 animate-in fade-in slide-in-from-top-2 duration-300 ${className}`}>
      <div>
        <h2 className="text-4xl font-bold text-white mb-2 tracking-tight">{title}</h2>
        <div className="text-gray-400 text-base font-medium">{subtitle}</div>
      </div>
      {actions && (
        <div className="flex items-center gap-3">
          {actions}
        </div>
      )}
    </div>
  );
};

interface TabContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const TabContainer: React.FC<TabContainerProps> = ({ children, className = '' }) => {
  return (
    <div className={`flex gap-8 mb-4 border-b border-[#222] ${className}`}>
      {children}
    </div>
  );
};

interface ControlBarProps {
  children: React.ReactNode;
  className?: string;
}

export const ControlBar: React.FC<ControlBarProps> = ({ children, className = '' }) => {
  return (
    <div className={`flex flex-col md:flex-row gap-4 mb-4 animate-in fade-in slide-in-from-bottom-2 ${className}`}>
      {children}
    </div>
  );
};
