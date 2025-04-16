
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

/**
 * Component for toggling model availability in settings
 */
const ProvidersToggle: React.FC<ProvidersToggleProps> = ({
  modelId,
  modelName,
  isEnabled,
  onToggle,
  disabled,
  description
}) => {
  return (
    <div className="flex items-center justify-between py-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Label htmlFor={`toggle-${modelId}`} className="cursor-pointer text-sm">
              {modelName}
            </Label>
          </TooltipTrigger>
          {description && (
            <TooltipContent side="right" className="max-w-[200px]">
              <p className="text-xs">{description}</p>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
      
      <Switch
        id={`toggle-${modelId}`}
        checked={isEnabled}
        onCheckedChange={onToggle}
        disabled={disabled}
      />
    </div>
  );
};

export default ProvidersToggle;
