import React from 'react';

interface CheckboxProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
}

export const Checkbox: React.FC<CheckboxProps> = ({ id, checked, onChange, label, disabled }) => {
  return (
    <label 
      htmlFor={id} 
      className={`flex items-center space-x-3 select-none py-1 transition-opacity ${
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer group'
      }`}
    >
      <div className="relative flex items-center justify-center">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="peer sr-only"
        />
        {/* Custom checkbox box */}
        <div 
          className={`w-5 h-5 rounded border border-border-default bg-surface-input transition-colors flex items-center justify-center peer-checked:bg-accent peer-checked:border-accent peer-focus-visible:ring-2 peer-focus-visible:ring-accent/50 ${
            !disabled ? 'group-hover:border-border-hover' : ''
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-3.5 h-3.5 text-surface-card [.theme-vampire_&]:text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-150 pointer-events-none"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
      </div>
      <span
        className={`text-sm font-medium text-secondary transition-colors ${
          !disabled ? 'group-hover:text-heading' : ''
        }`}
      >
        {label}
      </span>
    </label>
  );
};
