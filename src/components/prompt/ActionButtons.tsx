
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Shuffle, Sparkles, Zap } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';

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
      className={`flex ${isMobile ? 'flex-col space-y-2' : 'flex-between'}`}
      role="group"
      aria-label="Prompt action buttons"
    >
      <Button 
        variant="outline" 
        onClick={onReset}
        className="gap-2"
        disabled={isDisabled}
        size={isMobile ? "sm" : "default"}
        aria-label="Reset all fields"
      >
        <RefreshCw className="h-4 w-4" />
        Reset
      </Button>
      
      <div className={`flex ${isMobile ? 'flex-col w-full space-y-2' : 'gap-2'}`}>
        <Button
          variant="outline"
          onClick={onRandomizeAll}
          className={`gap-2 ${isMobile ? 'w-full' : ''}`}
          disabled={isDisabled}
          size={isMobile ? "sm" : "default"}
          aria-label="Randomize all fields"
        >
          <Shuffle className="h-4 w-4" />
          Randomize All
        </Button>
        
        <Button 
          onClick={onGenerateMultiple} 
          disabled={isDisabled || !canGenerate || !hasModels}
          className={`gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:opacity-90 transition-opacity ${isMobile ? 'w-full' : ''}`}
          size={isMobile ? "sm" : "default"}
          aria-label="Generate multiple prompts"
        >
          {isGenerating ? (
            <>
              <Spinner size="sm" className="mr-2" />
              Generating x3
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
          className={`gap-2 bg-flux-gradient hover:opacity-90 transition-opacity ${isMobile ? 'w-full' : ''}`}
          size={isMobile ? "sm" : "default"}
          aria-label="Generate prompt"
        >
          {isGenerating ? (
            <>
              <Spinner size="sm" className="mr-2" />
              Generating
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate Prompt
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ActionButtons;
