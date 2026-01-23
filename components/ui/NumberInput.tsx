
import React, { useState, useEffect, useRef } from 'react';
import { THEME } from '../../theme';

interface NumberInputProps {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  placeholder?: string;
  disabled?: boolean;
  className?: string; // Outer container class
  
  // Logic
  allowEmpty?: boolean; // If false, blur will reset to 0 or min
  enableScroll?: boolean; // Enable mouse wheel adjustment
  clampValueOnBlur?: boolean; // If true (default), value snaps to min/max on blur
  
  // Style
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'filled' | 'transparent' | 'bordered';
  align?: 'left' | 'center' | 'right';
  isInvalid?: boolean; // Visual error state
}

const sizeClasses = {
  sm: 'text-xs py-1.5 px-2 rounded-lg',
  md: 'text-sm py-2.5 px-3 rounded-xl',
  lg: 'text-base py-3 px-4 rounded-xl',
  xl: 'text-2xl py-4 px-5 rounded-2xl font-bold',
};

const NumberInput: React.FC<NumberInputProps> = ({
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  prefix,
  suffix,
  placeholder,
  disabled = false,
  className = '',
  allowEmpty = false,
  enableScroll = false,
  clampValueOnBlur = true,
  size = 'md',
  variant = 'filled',
  align = 'left',
  isInvalid = false
}) => {
  // Local state to handle typing "0." or "-" or empty string temporarily
  const [inputValue, setInputValue] = useState<string>('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync prop value to local state when not focused to avoid cursor jumps
  useEffect(() => {
    if (!isFocused) {
      if (value !== undefined && value !== null) {
        setInputValue(value.toString());
      } else {
        setInputValue('');
      }
    }
  }, [value, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    
    // Allow empty, minus sign, or valid number format (regex)
    if (newVal === '' || newVal === '-' || /^-?\d*\.?\d*$/.test(newVal)) {
      setInputValue(newVal);
      
      if (newVal === '') {
        if (allowEmpty) {
          onChange(undefined);
        }
      } else {
        const parsed = parseFloat(newVal);
        if (!isNaN(parsed)) {
          // Propagate change immediately
          onChange(parsed);
        }
      }
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    let parsed = parseFloat(inputValue);

    if (isNaN(parsed)) {
      if (!allowEmpty) {
        parsed = min; // Default to min
        onChange(parsed);
        setInputValue(parsed.toString());
      } else {
        onChange(undefined);
      }
    } else {
      // Clamp on blur only if enabled
      if (clampValueOnBlur) {
        let clamped = parsed;
        if (min !== undefined && clamped < min) clamped = min;
        if (max !== undefined && clamped > max) clamped = max;
        
        if (clamped !== parsed) {
          onChange(clamped);
          setInputValue(clamped.toString());
        } else {
          setInputValue(parsed.toString());
        }
      } else {
        // Just normalize string but don't force value change if out of bounds
        setInputValue(parsed.toString());
      }
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (!enableScroll || disabled || !isFocused) return;
    
    const delta = e.deltaY > 0 ? -step : step;
    let newVal = (parseFloat(inputValue) || 0) + delta;
    
    if (clampValueOnBlur) {
      if (min !== undefined && newVal < min) newVal = min;
      if (max !== undefined && newVal > max) newVal = max;
    }
    
    onChange(newVal);
    setInputValue(newVal.toString());
  };

  const baseBg = variant === 'transparent' ? 'bg-transparent' : (variant === 'bordered' ? 'bg-[#1A1A1A] border border-[#333]' : 'bg-[#262626] border border-brand-border');
  
  let borderColorClass = '';
  let focusClass = '';

  if (isInvalid) {
    borderColorClass = 'border-red-500';
    focusClass = variant === 'transparent' ? '' : 'focus-within:ring-1 focus-within:ring-red-500 focus-within:border-red-500';
  } else {
    focusClass = variant === 'transparent' ? '' : 'focus-within:ring-1 focus-within:ring-brand-green focus-within:border-brand-green';
  }

  const opacity = disabled ? 'opacity-50 cursor-not-allowed' : '';

  // Combine classes, ensuring isInvalid styles override default borders if needed
  const containerClasses = `relative flex items-center transition-all ${baseBg} ${sizeClasses[size]} ${focusClass} ${borderColorClass} ${opacity} ${className}`;

  return (
    <div className={containerClasses}>
      {prefix && <span className="mr-2 text-gray-500 select-none flex-shrink-0">{prefix}</span>}
      
      <input
        ref={inputRef}
        type="text"
        inputMode="decimal"
        value={inputValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={() => setIsFocused(true)}
        onWheel={handleWheel}
        disabled={disabled}
        placeholder={placeholder}
        className={`w-full bg-transparent outline-none text-white placeholder:text-gray-600 font-medium ${align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'}`}
      />
      
      {suffix && <span className="ml-2 text-gray-500 select-none flex-shrink-0">{suffix}</span>}
    </div>
  );
};

export default NumberInput;
