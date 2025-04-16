
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search, FileText } from 'lucide-react';

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
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onBack}
          className="h-9 w-9"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        
        <div>
          <h1 className="text-2xl font-bold gradient-text">Prompt Explorer</h1>
          <p className="text-muted-foreground">
            Explore {promptCount} {promptCount === 1 ? 'prompt' : 'prompts'} from your history
          </p>
        </div>
      </div>
      
      <div className="relative max-w-md">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search prompts..."
          className="pl-9"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
    </div>
  );
};

export default PromptExplorerHeader;
