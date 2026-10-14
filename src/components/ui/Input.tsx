import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  iconRight,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            {icon}
          </span>
        )}
        <input
          id={inputId}
          className={`input ${icon ? 'pl-9' : ''} ${iconRight ? 'pr-9' : ''} ${error ? 'border-red-300 focus:border-red-400 focus:ring-red-200' : ''} ${className}`}
          {...props}
        />
        {iconRight && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            {iconRight}
          </span>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  options,
  placeholder,
  className = '',
  id,
  ...props
}) => {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="input-label">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`input appearance-none bg-white cursor-pointer ${error ? 'border-red-300' : ''} ${className}`}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};
