
import React from 'react';
import { Loader2, LucideIcon } from 'lucide-react';
import { THEME } from '../../theme';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  icon?: LucideIcon;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon: Icon,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  
  const baseStyles = "font-bold rounded-xl transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:active:scale-100 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: THEME.buttonPrimary, // bg-brand-green text-black ...
    secondary: THEME.buttonSecondary, // bg-[#333] ...
    danger: "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20",
    outline: "border-2 border-[#333] hover:border-brand-green text-gray-400 hover:text-brand-green bg-transparent",
    ghost: "bg-transparent hover:bg-[#222] text-gray-400 hover:text-white",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
    xl: "px-8 py-4 text-lg",
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {isLoading && <Loader2 size={size === 'sm' ? 14 : 18} className="animate-spin" />}
      {!isLoading && Icon && <Icon size={size === 'sm' ? 16 : 20} strokeWidth={2.5} />}
      {children}
    </button>
  );
};

export default Button;
