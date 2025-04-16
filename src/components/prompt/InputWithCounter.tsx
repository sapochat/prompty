
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
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label htmlFor={id} className="heading-3">{label}</label>
        <span className="text-xs text-muted-foreground">
          {value.length}/{maxLength} characters
        </span>
      </div>
      <Input 
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="transition-colors focus-visible:ring-1"
        disabled={isDisabled}
        maxLength={maxLength}
      />
    </div>
  );
};

export default InputWithCounter;
