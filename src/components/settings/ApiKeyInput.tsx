
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ApiKeyInputProps {
  id: string;
  provider: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled: boolean;
  linkUrl: string;
}

/**
 * Component for handling API key input with proper masking and external link
 */
const ApiKeyInput: React.FC<ApiKeyInputProps> = ({
  id,
  provider,
  placeholder,
  value,
  onChange,
  disabled,
  linkUrl,
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{provider} API Key</Label>
      <Input
        id={id}
        type="password"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
      />
      <p className="text-xs text-muted-foreground">
        Get your API key from <a href={linkUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80 transition-colors">{provider} Dashboard</a>
      </p>
    </div>
  );
};

export default ApiKeyInput;
