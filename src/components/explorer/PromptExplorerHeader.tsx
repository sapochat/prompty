import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search } from 'lucide-react';

interface PromptExplorerHeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  promptCount: number;
  onBack: () => void;
}

const PromptExplorerHeader: React.FC<PromptExplorerHeaderProps> = ({
  searchTerm,
  setSearchTerm,
  promptCount,
  onBack
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="h-10 w-10 text-foreground-muted hover:text-foreground hover:bg-background-elevated"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div>
          <h1 className="heading-1 mb-1">Prompt Explorer</h1>
          <p className="text-sm text-foreground-muted">
            Browse {promptCount} {promptCount === 1 ? 'prompt' : 'prompts'} from your history
          </p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-subtle" />
        <Input
          type="text"
          placeholder="Search prompts..."
          className="input-editorial pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
    </div>
  );
};

export default PromptExplorerHeader;
