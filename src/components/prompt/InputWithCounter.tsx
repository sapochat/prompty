import React from 'react';
import { Input } from '@/components/ui/input';

interface InputWithCounterProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isDisabled: boolean;
  placeholder: string;
  maxLength: number;
  label: string;
  id: string;
}

const InputWithCounter: React.FC<InputWithCounterProps> = ({
  value,
  onChange,
  isDisabled,
  placeholder,
  maxLength,
  label,
  id
}) => {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-baseline">
        <label
          htmlFor={id}
          className="font-display text-base font-medium text-foreground"
        >
          {label}
        </label>
        <span
          id={`${id}-counter`}
          className="text-xs text-foreground-subtle tabular-nums"
          aria-live="polite"
        >
          {value.length}/{maxLength}
        </span>
      </div>
      <Input
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="input-editorial"
        disabled={isDisabled}
        maxLength={maxLength}
        aria-label={label}
        aria-describedby={`${id}-counter`}
      />
    </div>
  );
};

export default InputWithCounter;
