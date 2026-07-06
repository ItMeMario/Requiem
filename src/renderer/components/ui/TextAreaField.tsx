import React from 'react';

export const TextAreaField = ({ label, value, onChange, placeholder = '' }: any) => (
  <div>
    <label className="block text-sm text-muted mb-1">{label}</label>
    <textarea 
      value={value}
      onChange={onChange}
      className="w-full bg-surface-input border border-border-default text-primary rounded p-2 focus:outline-none focus:border-accent min-h-[80px]"
      placeholder={placeholder}
    />
  </div>
);
