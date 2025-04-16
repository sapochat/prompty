import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { Clock, Copy, Trash, ChevronDown, ChevronUp, RefreshCw, Rewind, Layers, BookOpen } from 'lucide-react';
import { usePromptHistory } from '@/hooks/usePromptHistory';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Spinner } from '@/components/ui/spinner';
import { GeneratedPrompt } from '@/types/prompt';
import { useNavigate } from 'react-router-dom';
import { dispatchPromptConfigLoadedEvent } from '@/hooks/usePromptConfig';
import { Badge } from "@/components/ui/badge";
import { Link } from 'react-router-dom';

const PromptHistory: React.FC = () => {
  const { history, isLoading, isInitialized, loadHistory, handleDeletePrompt, handleClearAll } = usePromptHistory();
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [expandedBatches, setExpandedBatches] = useState<Record<string, boolean>>({});
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  const groupPromptsByBatch = () => {
    const batchGroups: Record<string, GeneratedPrompt[]> = {};
    const standalonePrompts: GeneratedPrompt[] = [];
    
    history.forEach(prompt => {
      if (prompt.batchId) {
        if (!batchGroups[prompt.batchId]) {
          batchGroups[prompt.batchId] = [];
        }
        batchGroups[prompt.batchId].push(prompt);
      } else {
        standalonePrompts.push(prompt);
      }
    });
    
    Object.values(batchGroups).forEach(group => {
      group.sort((a, b) => b.timestamp - a.timestamp);
    });
    
    return { batchGroups, standalonePrompts };
  };

  const { batchGroups, standalonePrompts } = groupPromptsByBatch();
  
  const organizePromptsForDisplay = () => {
    const batchKeys = Object.keys(batchGroups);
    
    const organizedPrompts: Array<{
      type: 'batch' | 'standalone',
      batchId?: string,
      prompts: GeneratedPrompt[]
    }> = [];
    
    batchKeys.forEach(batchId => {
      organizedPrompts.push({
        type: 'batch',
        batchId,
        prompts: batchGroups[batchId]
      });
    });
    
    standalonePrompts.forEach(prompt => {
      organizedPrompts.push({
        type: 'standalone',
        prompts: [prompt]
      });
    });
    
    return organizedPrompts.sort((a, b) => {
      const aTime = Math.max(...a.prompts.map(p => p.timestamp));
      const bTime = Math.max(...b.prompts.map(p => p.timestamp));
      return bTime - aTime;
    });
  };
  
  const organizedPrompts = organizePromptsForDisplay();
  
  const handleCopyPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt);
    toast.success('Prompt copied to clipboard');
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const toggleExpandBatch = (batchId: string) => {
    setExpandedBatches(prev => ({
      ...prev,
      [batchId]: !prev[batchId]
    }));
  };

  const handleRefresh = async () => {
    if (refreshing) return;
    
    setRefreshing(true);
    try {
      await loadHistory();
      toast.success('Prompt history refreshed');
    } catch (error) {
      console.error("Error refreshing history:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleLoadPromptConfig = (prompt: GeneratedPrompt) => {
    dispatchPromptConfigLoadedEvent(prompt.config);
    
    if (window.location.pathname !== '/') {
      navigate('/');
    }
    
    toast.success('Prompt configuration loaded');
  };

  if (!isInitialized && isLoading) {
    return (
      <Card className="flux-card section-container flex-center flex-col space-y-4 py-12">
        <Spinner size="lg" />
        <p className="text-muted-foreground">Loading prompt history...</p>
      </Card>
    );
  }

  if (isInitialized && history.length === 0) {
    return (
      <Card className="flux-card section-container flex-center flex-col space-y-4 py-12">
        <Clock className="h-12 w-12 text-muted-foreground opacity-50" />
        <p className="text-muted-foreground">No prompt history yet. Generated prompts will appear here.</p>
      </Card>
    );
  }

  const renderPromptItem = (item: GeneratedPrompt, index?: number, isInBatch?: boolean) => (
    <div key={item.id} className={`content-item relative ${isInBatch ? 'border-l-0 pl-0' : ''}`}>
      <div className="item-header">
        <div className="flex items-center gap-2">
          <span className="item-timestamp">{formatDate(item.timestamp)}</span>
          {isInBatch && (
            <Badge variant="outline" className="text-xs bg-primary/5 text-primary">
              Variation {index !== undefined ? index + 1 : ''}
            </Badge>
          )}
        </div>
        <div className="item-actions">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-primary hover:text-primary/80"
                  onClick={() => handleLoadPromptConfig(item)}
                >
                  <Rewind className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Load this prompt's settings</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  onClick={() => handleCopyPrompt(item.prompt)}
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Copy prompt</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive/90"
                  onClick={() => handleDeletePrompt(item.id)}
                >
                  <Trash className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete from history</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
      <div>
        {!expandedItems[item.id] && (
          <div className="item-content item-preview">
            {item.prompt}
          </div>
        )}
        
        {expandedItems[item.id] && (
          <div className="item-content item-expanded">
            {item.prompt}
          </div>
        )}

        <Button
          variant="ghost"
          size="sm"
          className="p-0 h-auto flex items-center text-left hover:bg-transparent text-primary hover:text-primary/80"
          onClick={() => toggleExpand(item.id)}
        >
          <span className="mr-1">
            {expandedItems[item.id] ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </span>
          <span className="text-xs font-medium">
            {expandedItems[item.id] ? 'Show less' : 'Show more'}
          </span>
        </Button>
      </div>

      <div className="item-footer">
        Generated with: <span className="text-primary/80">{item.modelUsed || "AI Model"}</span>
      </div>
    </div>
  );

  return (
    <Card className="flux-card section-container">
      <div className="flex-between mb-6">
        <h2 className="heading-2 gradient-text">Recent Prompts</h2>
        <div className="flex gap-2">
          <Link to="/explorer">
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
            >
              <BookOpen className="h-4 w-4" />
              View All
            </Button>
          </Link>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={handleRefresh}
            disabled={refreshing || isLoading}
          >
            {refreshing || isLoading ? <Spinner size="sm" /> : <RefreshCw className="h-4 w-4" />}
            Refresh
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 text-destructive hover:bg-destructive/10"
            onClick={handleClearAll}
            disabled={refreshing || isLoading || history.length === 0}
          >
            <Trash className="h-4 w-4" />
            Clear All
          </Button>
        </div>
      </div>
      
      <ScrollArea className="h-[400px] pr-4">
        {isLoading && history.length > 0 && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
            <Spinner size="lg" />
          </div>
        )}
        
        <div className="space-y-4">
          {organizedPrompts.map((group, index) => (
            <div key={group.type === 'batch' ? `batch-${group.batchId}` : `standalone-${index}`}>
              {group.type === 'batch' && (
                <div className="mb-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2 text-sm font-medium text-primary p-1"
                    onClick={() => group.batchId && toggleExpandBatch(group.batchId)}
                  >
                    <Layers className="h-4 w-4" />
                    <span>Batch Generation ({group.prompts.length} prompts)</span>
                    {group.batchId && expandedBatches[group.batchId] ? 
                      <ChevronUp className="h-3.5 w-3.5" /> : 
                      <ChevronDown className="h-3.5 w-3.5" />
                    }
                  </Button>
                </div>
              )}
              
              <div className={group.type === 'batch' ? 
                "pl-3 border-l-2 border-primary/30 space-y-4 rounded-sm bg-primary/5 p-2" : 
                ""}>
                {group.type === 'batch' && group.batchId ? (
                  !expandedBatches[group.batchId] ? 
                    renderPromptItem(group.prompts[0], 0, true) :
                    group.prompts.map((item, idx) => renderPromptItem(item, idx, true))
                ) : (
                  group.prompts.map(item => renderPromptItem(item))
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
};

export default PromptHistory;
