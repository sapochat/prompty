
import React from 'react';

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
  return (
    <div
      className="text-center text-sm text-muted-foreground"
      role="status"
      aria-live="polite"
    >
      {isLoadingKeys ? (
        "Loading API settings..."
      ) : !hasModels ? (
        "Add your API keys in the header settings to get started"
      ) : selectedCategoriesCount < requiredCount ? (
        `Select at least ${requiredCount} categories to generate a prompt (${selectedCategoriesCount}/${requiredCount})`
      ) : (
        `${selectedCategoriesCount} categories selected`
      )}
    </div>
  );
};

export default StatusMessage;
