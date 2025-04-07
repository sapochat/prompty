
import React from 'react';
import InputWithCounter from './InputWithCounter';
import TextAreaWithCounter from './TextAreaWithCounter';

interface ExtraDetailsInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  isDisabled: boolean;
  prefixText: string;
  onPrefixChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ExtraDetailsInput: React.FC<ExtraDetailsInputProps> = ({ 
  value, 
  onChange, 
  isDisabled,
  prefixText,
  onPrefixChange
}) => {
  return (
    <div className="space-y-4">
      <InputWithCounter
        id="prefix-text"
        label="Prefix Text"
        placeholder="Text to insert at the beginning of the prompt..."
        value={prefixText}
        onChange={onPrefixChange}
        isDisabled={isDisabled}
        maxLength={100}
      />
      
      <TextAreaWithCounter
        label="Extra Details"
        placeholder="Add any specific details or additional instructions..."
        value={value}
        onChange={onChange}
        isDisabled={isDisabled}
        maxLength={500}
      />
    </div>
  );
};

export default ExtraDetailsInput;
