import React from 'react';
import { formatNumberInput, parseNumberInput } from '../utils/format';

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  id?: string;
  required?: boolean;
  autoFocus?: boolean;
  className?: string;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  value,
  onChange,
  placeholder = '0',
  id,
  required,
  autoFocus,
  className = '',
}) => {
  const displayValue = value > 0 ? formatNumberInput(String(Math.round(value))) : '';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseNumberInput(e.target.value);
    onChange(parsed);
  };

  return (
    <div className={`relative flex items-center ${className}`}>
      <span className="pointer-events-none absolute left-3.5 text-sm font-semibold text-slate-500 dark:text-slate-400">
        Rp
      </span>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        autoFocus={autoFocus}
        className="w-full rounded-xl border border-sandline dark:border-slateborder bg-alabaster/70 dark:bg-obsidian/80 pl-10 pr-4 py-3 text-base font-semibold num-tabular text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition"
      />
    </div>
  );
};
