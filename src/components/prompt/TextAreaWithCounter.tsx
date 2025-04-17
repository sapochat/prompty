
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

  // Auto-resize function
  const resizeTextarea = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = 'auto';
      // Set new height based on content (min 80px, max 300px)
      textarea.style.height = `${Math.max(80, Math.min(textarea.scrollHeight, 300))}px`;
    }
  };

  // Resize on initial render and when value changes
  useEffect(() => {
    resizeTextarea();
  }, [value]);

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label htmlFor="extra-details-textarea" className="heading-3">{label}</label>
        <span id="extra-details-counter" className="text-xs text-muted-foreground" aria-live="polite">
          {value.length}/{maxLength} characters
        </span>
      </div>
      <Textarea
        ref={textareaRef}
        id="extra-details-textarea"
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onChange(e);
          // Manual resize on each input
          window.requestAnimationFrame(() => resizeTextarea());
        }}
        onInput={resizeTextarea} // Additional event handler for immediate feedback
        className="resize-none min-h-[80px] max-h-[300px] transition-colors focus-visible:ring-1"
        disabled={isDisabled}
        maxLength={maxLength}
        aria-label={label}
        aria-describedby="extra-details-counter"
      />
    </div>
  );
};

export default TextAreaWithCounter;
