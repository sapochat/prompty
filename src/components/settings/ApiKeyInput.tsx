import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ExternalLink } from 'lucide-react';

interface ApiKeyInputProps {
  id: string;
  provider: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled: boolean;
  linkUrl: string;
}

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
    <div className="space-y-3">
      <Label
        htmlFor={id}
        className="font-display text-sm font-medium text-foreground"
      >
        {provider} API Key
      </Label>
      <Input
        id={id}
        type="password"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="input-editorial"
      />
      <p className="text-xs text-foreground-muted flex items-center gap-1">
        Get your key from{' '}
        <a
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:text-primary-light transition-colors inline-flex items-center gap-1"
        >
          {provider}
          <ExternalLink className="h-3 w-3" />
        </a>
      </p>
    </div>
  );
};

export default ApiKeyInput;
