'use client';

import { useState, useEffect } from 'react';

export default function CalculatorInput({
  label,
  type = 'number',
  value,
  onChange,
  placeholder,
  prefix,
  suffix,
  step,
  min,
  required = true,
}) {
  const [displayValue, setDisplayValue] = useState(value);

  // Format number with Indian number system (only for currency)
  const formatNumber = (num) => {
    if (!num) return '';
    if (prefix !== '₹') return num;
    
    const parts = num.toString().split('.');
    const lastThree = parts[0].substring(parts[0].length - 3);
    const otherNumbers = parts[0].substring(0, parts[0].length - 3);
    const formatted = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    return (otherNumbers ? formatted + ',' + lastThree : lastThree) + (parts[1] ? '.' + parts[1] : '');
  };

  // Handle input change
  const handleChange = (e) => {
    const rawValue = e.target.value.replace(/,/g, '');
    if (type === 'number') {
      // Allow only numbers and decimal point
      if (/^\d*\.?\d*$/.test(rawValue)) {
        setDisplayValue(prefix === '₹' ? formatNumber(rawValue) : rawValue);
        onChange({ target: { value: rawValue } });
      }
    } else {
      setDisplayValue(rawValue);
      onChange(e);
    }
  };

  // Update display value when value prop changes
  useEffect(() => {
    if (type === 'number') {
      setDisplayValue(prefix === '₹' ? formatNumber(value) : value);
    } else {
      setDisplayValue(value);
    }
  }, [value, type, prefix]);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="relative rounded-md shadow-sm">
        {prefix && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">{prefix}</span>
          </div>
        )}
        <input
          type="text"
          value={displayValue}
          onChange={handleChange}
          className={`
            block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm
            ${prefix ? 'pl-7' : 'pl-3'}
            ${suffix ? 'pr-12' : 'pr-3'}
            py-2 border
          `}
          placeholder={placeholder}
          step={step}
          min={min}
          required={required}
        />
        {suffix && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">{suffix}</span>
          </div>
        )}
      </div>
    </div>
  );
} 