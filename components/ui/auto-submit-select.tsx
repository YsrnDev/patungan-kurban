'use client';

import type { SelectHTMLAttributes } from 'react';

interface AutoSubmitSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: ReadonlyArray<{
    value: string;
    label: string;
  }>;
}

export function AutoSubmitSelect({ options, onChange, ...props }: AutoSubmitSelectProps) {
  return (
    <select
      {...props}
      onChange={(event) => {
        onChange?.(event);

        if (!event.defaultPrevented) {
          event.currentTarget.form?.requestSubmit();
        }
      }}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
