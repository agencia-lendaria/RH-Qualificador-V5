import { useState, useEffect } from 'react';
import { getAccessibilityRating, meetsWCAGAA } from '../utils/colorUtils';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
  testBackground?: string;
  description?: string;
}

export default function ColorPicker({ 
  label, 
  value, 
  onChange, 
  testBackground,
  description 
}: ColorPickerProps) {
  const [inputValue, setInputValue] = useState(value);
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleChange = (newValue: string) => {
    setInputValue(newValue);
    
    // Validate hex color format
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    const valid = hexRegex.test(newValue);
    setIsValid(valid);
    
    if (valid) {
      onChange(newValue);
    }
  };

  const accessibilityInfo = testBackground 
    ? getAccessibilityRating(value, testBackground)
    : null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-[#B8B8B8]">
          {label}
        </label>
        {accessibilityInfo && (
          <span className={`text-xs px-2 py-1 rounded-full ${
            accessibilityInfo.rating === 'AAA' ? 'bg-green-900 text-green-200' :
            accessibilityInfo.rating === 'AA' ? 'bg-yellow-900 text-yellow-200' :
            'bg-red-900 text-red-200'
          }`}>
            {accessibilityInfo.rating}
          </span>
        )}
      </div>
      
      <div className="flex items-center gap-3">
        <div 
          className="w-12 h-12 rounded-lg border-2 border-[#2A2A2D] cursor-pointer relative overflow-hidden"
          style={{ backgroundColor: value }}
          onClick={() => document.getElementById(`color-input-${label}`)?.click()}
        >
          <input
            id={`color-input-${label}`}
            type="color"
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
        
        <div className="flex-1">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => handleChange(e.target.value)}
            className={`input text-sm ${!isValid ? 'border-red-500' : ''}`}
            placeholder="#000000"
            pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
          />
          {!isValid && (
            <p className="text-red-400 text-xs mt-1">
              Formato inválido. Use #000000 ou #000
            </p>
          )}
        </div>
      </div>

      {description && (
        <p className="text-xs text-[#A0A0A0]">{description}</p>
      )}

      {accessibilityInfo && (
        <div className="text-xs space-y-1">
          <p className={`${
            accessibilityInfo.rating === 'Fail' ? 'text-red-400' : 'text-green-400'
          }`}>
            Contraste: {accessibilityInfo.ratio.toFixed(1)}:1
          </p>
          <p className="text-[#A0A0A0]">
            {accessibilityInfo.description}
          </p>
        </div>
      )}
    </div>
  );
}