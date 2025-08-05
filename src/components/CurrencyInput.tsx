import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { formatInputCurrency, parseCurrencyToNumber } from '../utils/format';

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  onKeyPress?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  'aria-label'?: string;
  'aria-describedby'?: string;
  id?: string;
  name?: string;
}

export interface CurrencyInputRef {
  focus: () => void;
  blur: () => void;
  select: () => void;
}

const CurrencyInput = forwardRef<CurrencyInputRef, CurrencyInputProps>(({
  value,
  onChange,
  min = 0,
  max = 999999999,
  placeholder = '0,00',
  className = '',
  disabled = false,
  autoFocus = false,
  onKeyPress,
  onFocus,
  onBlur,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  id,
  name
}, ref) => {
  const [displayValue, setDisplayValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Expose input methods through ref
  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    blur: () => inputRef.current?.blur(),
    select: () => inputRef.current?.select()
  }));

  // Update display value when prop value changes
  useEffect(() => {
    if (value > 0) {
      setDisplayValue(formatInputCurrency(String(value * 100)));
    } else {
      setDisplayValue('');
    }
  }, [value]);

  // Auto focus if requested
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;

    const inputValue = e.target.value.replace(/\D/g, '');
    
    if (inputValue) {
      const formattedValue = formatInputCurrency(inputValue);
      setDisplayValue(formattedValue);
      
      const numericValue = parseCurrencyToNumber(formattedValue);
      const clampedValue = Math.min(Math.max(0, numericValue), max);
      onChange(clampedValue);
    } else {
      setDisplayValue('');
      onChange(0);
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    
    // Apply minimum value validation only if there's a value and it's below minimum
    if (value > 0 && value < min) {
      onChange(min);
    }
    
    onBlur?.(e);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow only numbers, backspace, delete, arrow keys, tab
    const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];
    const isNumber = /^[0-9]$/.test(e.key);
    
    if (!isNumber && !allowedKeys.includes(e.key)) {
      e.preventDefault();
    }
    
    onKeyPress?.(e);
  };

  // Calculate dynamic padding based on screen size and focus state
  const getPaddingClass = () => {
    return 'pl-16 sm:pl-18 md:pl-20';
  };

  // Get currency symbol positioning
  const getSymbolPositioning = () => {
    return 'currency-symbol-position';
  };

  return (
    <div className="relative currency-input-container">
      {/* Currency Symbol */}
      <span 
        className={`
          absolute top-1/2 -translate-y-1/2 
          ${getSymbolPositioning()}
          text-[#888] pointer-events-none select-none z-20
          font-medium
          transition-all duration-200
          ${isFocused ? 'text-[#CABD95]' : ''}
          ${disabled ? 'opacity-50' : ''}
        `}
        aria-hidden="true"
      >
        R$
      </span>

      {/* Input Field */}
      <input
        ref={inputRef}
        type="text"
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        disabled={disabled}
        inputMode="numeric"
        autoComplete="off"
        spellCheck={false}
        aria-label={ariaLabel || 'Valor em reais'}
        aria-describedby={ariaDescribedBy}
        id={id}
        name={name}
        className={`
          currency-input-field-custom
          ${className}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${isFocused ? 'ring-2 ring-[#CABD95] border-[#CABD95]' : ''}
          transition-all duration-200
        `}
      />

      {/* Error state indicator (if value is below minimum and has value) */}
      {value > 0 && value < min && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        </div>
      )}
    </div>
  );
});

CurrencyInput.displayName = 'CurrencyInput';

export default CurrencyInput;