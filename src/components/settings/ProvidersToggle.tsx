import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ProvidersToggleProps {
  modelId: string;
  modelName: string;
  isEnabled: boolean;
  onToggle: () => void;
  disabled: boolean;
  description?: string;
}

const ProvidersToggle: React.FC<ProvidersToggleProps> = ({
  modelId,
  modelName,
  isEnabled,
  onToggle,
  disabled,
  description
}) => {
  return (
    <div className="flex items-center justify-between py-2.5 px-3 rounded-md hover:bg-background-elevated transition-colors">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Label
              htmlFor={`toggle-${modelId}`}
              className="cursor-pointer text-sm text-foreground font-medium"
            >
              {modelName}
            </Label>
          </TooltipTrigger>
          {description && (
            <TooltipContent
              side="right"
              className="max-w-[200px] bg-popover border-border/10"
            >
              <p className="text-xs text-foreground">{description}</p>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>

      <Switch
        id={`toggle-${modelId}`}
        checked={isEnabled}
        onCheckedChange={onToggle}
        disabled={disabled}
        className="data-[state=checked]:bg-primary"
      />
    </div>
  );
};

export default ProvidersToggle;
