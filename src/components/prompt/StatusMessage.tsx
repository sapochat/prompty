import React from 'react';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface StatusMessageProps {
  isLoadingKeys: boolean;
  hasModels: boolean;
  selectedCategoriesCount: number;
  requiredCount: number;
}

const StatusMessage: React.FC<StatusMessageProps> = ({
  isLoadingKeys,
  hasModels,
  selectedCategoriesCount,
  requiredCount
}) => {
  if (isLoadingKeys) {
    return (
      <div
        className="flex items-center justify-center gap-2 text-sm text-foreground-muted py-2"
        role="status"
        aria-live="polite"
      >
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Loading settings...</span>
      </div>
    );
  }

  if (!hasModels) {
    return (
      <div
        className="flex items-center justify-center gap-2 text-sm text-primary py-2"
        role="status"
        aria-live="polite"
      >
        <AlertCircle className="h-4 w-4" />
        <span>Configure API keys in settings to begin</span>
      </div>
    );
  }

  const isReady = selectedCategoriesCount >= requiredCount;

  return (
    <div
      className={`flex items-center justify-center gap-2 text-sm py-2 ${
        isReady ? 'text-foreground-muted' : 'text-foreground-subtle'
      }`}
      role="status"
      aria-live="polite"
    >
      {isReady ? (
        <>
          <CheckCircle2 className="h-4 w-4 text-primary" />
          <span>
            {selectedCategoriesCount} parameter{selectedCategoriesCount !== 1 ? 's' : ''} selected
          </span>
        </>
      ) : (
        <span>
          Select {requiredCount - selectedCategoriesCount} more to generate
        </span>
      )}
    </div>
  );
};

export default StatusMessage;
