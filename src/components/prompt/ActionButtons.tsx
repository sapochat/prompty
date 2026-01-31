import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Shuffle, Sparkles, Zap } from 'lucide-react';

interface ActionButtonsProps {
  onReset: () => void;
  onRandomizeAll: () => void;
  onGeneratePrompt: () => void;
  onGenerateMultiple: () => void;
  isGenerating: boolean;
  isDisabled: boolean;
  canGenerate: boolean;
  hasModels: boolean;
  isMobile: boolean;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  onReset,
  onRandomizeAll,
  onGeneratePrompt,
  onGenerateMultiple,
  isGenerating,
  isDisabled,
  canGenerate,
  hasModels,
  isMobile
}) => {
  return (
    <div
      className={`flex ${isMobile ? 'flex-col space-y-3' : 'items-center justify-between'}`}
      role="group"
      aria-label="Prompt action buttons"
    >
      {/* Secondary Actions */}
      <div className={`flex ${isMobile ? 'w-full' : ''} gap-2`}>
        <Button
          variant="ghost"
          onClick={onReset}
          className="gap-2 text-foreground-muted hover:text-foreground hover:bg-background-elevated"
          disabled={isDisabled}
          size={isMobile ? "sm" : "default"}
          aria-label="Reset all fields"
        >
          <RefreshCw className="h-4 w-4" />
          Reset
        </Button>

        <Button
          variant="ghost"
          onClick={onRandomizeAll}
          className="gap-2 text-foreground-muted hover:text-foreground hover:bg-background-elevated"
          disabled={isDisabled}
          size={isMobile ? "sm" : "default"}
          aria-label="Randomize all fields"
        >
          <Shuffle className="h-4 w-4" />
          Randomize
        </Button>
      </div>

      {/* Primary Actions */}
      <div className={`flex ${isMobile ? 'flex-col w-full space-y-2' : 'gap-3'}`}>
        <Button
          onClick={onGenerateMultiple}
          disabled={isDisabled || !canGenerate || !hasModels}
          variant="outline"
          className={`gap-2 border-primary/30 text-primary hover:bg-primary/10 hover:text-primary-light ${isMobile ? 'w-full' : ''}`}
          size={isMobile ? "sm" : "default"}
          aria-label="Generate three prompts"
        >
          {isGenerating ? (
            <>
              <div className="spinner h-4 w-4" />
              Generating...
            </>
          ) : (
            <>
              <Zap className="h-4 w-4" />
              Generate x3
            </>
          )}
        </Button>

        <Button
          onClick={onGeneratePrompt}
          disabled={isDisabled || !canGenerate || !hasModels}
          className={`gap-2 btn-primary ${isMobile ? 'w-full' : ''}`}
          size={isMobile ? "sm" : "default"}
          aria-label="Generate prompt"
        >
          {isGenerating ? (
            <>
              <div className="spinner h-4 w-4 border-background border-t-primary-dark" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ActionButtons;
