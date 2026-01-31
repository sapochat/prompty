import React, { useRef, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';

interface TextAreaWithCounterProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  isDisabled: boolean;
  placeholder: string;
  maxLength: number;
  label: string;
}

const TextAreaWithCounter: React.FC<TextAreaWithCounterProps> = ({
  value,
  onChange,
  isDisabled,
  placeholder,
  maxLength,
  label
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const resizeTextarea = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.max(100, Math.min(textarea.scrollHeight, 300))}px`;
    }
  };

  useEffect(() => {
    resizeTextarea();
  }, [value]);

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-baseline">
        <label
          htmlFor="extra-details-textarea"
          className="font-display text-base font-medium text-foreground"
        >
          {label}
        </label>
        <span
          id="extra-details-counter"
          className="text-xs text-foreground-subtle tabular-nums"
          aria-live="polite"
        >
          {value.length}/{maxLength}
        </span>
      </div>
      <Textarea
        ref={textareaRef}
        id="extra-details-textarea"
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onChange(e);
          window.requestAnimationFrame(() => resizeTextarea());
        }}
        onInput={resizeTextarea}
        className="textarea-editorial resize-none min-h-[100px] max-h-[300px]"
        disabled={isDisabled}
        maxLength={maxLength}
        aria-label={label}
        aria-describedby="extra-details-counter"
      />
    </div>
  );
};

export default TextAreaWithCounter;
