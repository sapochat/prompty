import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AIModel } from '@/types/prompt';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';

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
    onModelChange(value);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-6">
        <div className="spinner h-5 w-5 mr-3" />
        <span className="text-sm text-foreground-muted">Loading models...</span>
      </div>
    );
  }

  if (filteredModels.length === 0) {
    return (
      <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">
              No API keys configured
            </p>
            <p className="text-sm text-foreground-muted mt-1">
              Add your API keys in settings to start generating prompts.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const sortedModels = [...filteredModels].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="w-full">
      <Select
        value={selectedModel}
        onValueChange={handleModelSelect}
        aria-label="AI Model Selector"
      >
        <SelectTrigger
          className={cn(
            "w-full bg-background-elevated border-border/10 text-foreground",
            "hover:border-border/20 focus:border-primary/30",
            isMobile && "text-sm h-10"
          )}
          onClick={(e) => e.stopPropagation()}
          aria-label="Select an AI model"
        >
          <SelectValue placeholder="Select a model" />
        </SelectTrigger>
        <SelectContent
          className={cn(
            "max-h-[60vh] bg-popover border-border/10",
            isMobile && "w-[calc(100vw-2rem)] max-w-[300px]"
          )}
          onPointerDownOutside={(e) => e.preventDefault()}
          role="menu"
        >
          {sortedModels.map((model) => (
            <SelectItem
              key={model.id}
              value={model.id}
              onPointerDown={(e) => e.stopPropagation()}
              className="text-foreground focus:bg-background-elevated focus:text-foreground"
              aria-label={`Select ${model.name} from ${model.provider}`}
              role="option"
            >
              <div className="flex flex-col py-0.5">
                <span className={cn(
                  "font-medium",
                  isMobile && "text-sm truncate max-w-[200px]"
                )}>
                  {model.name}
                </span>
                <span className={cn(
                  "text-xs text-foreground-muted",
                  isMobile && "truncate max-w-[200px]"
                )}>
                  {model.provider.charAt(0).toUpperCase() + model.provider.slice(1)} · {model.description}
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
