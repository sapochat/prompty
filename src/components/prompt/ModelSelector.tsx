
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AIModel } from '@/types/prompt';
import { Spinner } from '@/components/ui/spinner';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface ModelSelectorProps {
  isLoading: boolean;
  filteredModels: AIModel[];
  selectedModel: string;
  onModelChange: (value: string) => void;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({
  isLoading,
  filteredModels,
  selectedModel,
  onModelChange
}) => {
  const isMobile = useIsMobile();
  
  const handleModelSelect = (value: string) => {
    // Stop propagation to prevent triggering category selectors below
    onModelChange(value);
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <Spinner size="md" />
        <span className="ml-2">Loading API settings...</span>
      </div>
    );
  }

  if (filteredModels.length === 0) {
    return (
      <div className="rounded-md bg-amber-50 dark:bg-amber-950 p-4 border border-amber-200 dark:border-amber-800">
        <div className="flex items-center">
          <div className="text-amber-800 dark:text-amber-300">
            <p className="text-sm font-medium">
              Please add your API keys in the settings menu in the header to get started.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Sort models alphabetically by name
  const sortedModels = [...filteredModels].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="w-full">
      <Select 
        value={selectedModel} 
        onValueChange={handleModelSelect}
      >
        <SelectTrigger 
          className={cn(
            "w-full text-left justify-between", 
            isMobile && "text-sm h-9"
          )}
          onClick={(e) => {
            // Stop click from propagating to elements underneath
            e.stopPropagation();
          }}
        >
          <SelectValue placeholder="Select a model" className="text-left" />
        </SelectTrigger>
        <SelectContent 
          className={cn(
            "max-h-[60vh] z-50",
            isMobile && "w-[calc(100vw-2rem)] max-w-[300px]"
          )}
          onPointerDownOutside={(e) => {
            // Prevent the click from propagating to elements below
            e.preventDefault();
          }}
        >
          {sortedModels.map((model) => (
            <SelectItem 
              key={model.id} 
              value={model.id}
              onPointerDown={(e) => {
                // Stop propagation at the item level too
                e.stopPropagation();
              }}
            >
              <div className="flex flex-col">
                <span className={cn(isMobile && "text-sm truncate max-w-[200px]")}>
                  {model.name}
                </span>
                <span className={cn(
                  "text-xs text-muted-foreground",
                  isMobile && "truncate max-w-[200px]"
                )}>
                  {model.provider.charAt(0).toUpperCase() + model.provider.slice(1)} • {model.description}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ModelSelector;
