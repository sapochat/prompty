import React, { useState, useMemo, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { Clock, Copy, Trash2, ChevronDown, ChevronUp, RefreshCw, Rewind, BookOpen } from 'lucide-react';
import { usePromptHistory } from '@/hooks/usePromptHistory';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Spinner } from '@/components/ui/spinner';
import { GeneratedPrompt } from '@/types/prompt';
import { useNavigate } from 'react-router-dom';
import { dispatchPromptConfigLoadedEvent } from '@/hooks/usePromptConfig';
import { Link } from 'react-router-dom';

const PAGE_SIZE = 20;

const PromptHistory: React.FC = () => {
  const { history, isLoading, isInitialized, loadHistory, handleDeletePrompt } = usePromptHistory();
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [expandedBatches, setExpandedBatches] = useState<Record<string, boolean>>({});
  const [refreshing, setRefreshing] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const lastScrollTimeRef = useRef<number>(0);
  const navigate = useNavigate();

  const { batchGroups, standalonePrompts } = useMemo(() => {
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
  }, [history]);

  const allOrganizedPrompts = useMemo(() => {
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
  }, [batchGroups, standalonePrompts]);

  const organizedPrompts = useMemo(() => {
    return allOrganizedPrompts.slice(0, visibleCount);
  }, [allOrganizedPrompts, visibleCount]);

  const loadingMore = useMemo(() => {
    return visibleCount < allOrganizedPrompts.length;
  }, [visibleCount, allOrganizedPrompts.length]);

  React.useEffect(() => {
    const THROTTLE_MS = 100;

    const handleScroll = () => {
      const now = Date.now();
      if (now - lastScrollTimeRef.current < THROTTLE_MS) {
        return;
      }
      lastScrollTimeRef.current = now;

      const scrollArea = scrollAreaRef.current;
      if (!scrollArea) return;
      if (scrollArea.scrollTop + scrollArea.clientHeight >= scrollArea.scrollHeight - 10) {
        setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, allOrganizedPrompts.length));
      }
    };
    const scrollArea = scrollAreaRef.current;
    if (scrollArea) {
      scrollArea.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (scrollArea) {
        scrollArea.removeEventListener('scroll', handleScroll);
      }
    };
  }, [allOrganizedPrompts.length]);

  const handleCopyPrompt = useCallback((prompt: string) => {
    navigator.clipboard.writeText(prompt);
    toast.success('Copied to clipboard');
  }, []);

  const formatDate = useCallback((timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }, []);

  const toggleExpand = useCallback((id: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  }, []);

  const toggleExpandBatch = useCallback((batchId: string) => {
    setExpandedBatches(prev => ({
      ...prev,
      [batchId]: !prev[batchId]
    }));
  }, []);

  const handleRefresh = useCallback(async () => {
    if (refreshing) return;
    setRefreshing(true);
    try {
      await loadHistory();
      toast.success('History refreshed');
    } catch (error) {
      console.error("Error refreshing history:", error);
    } finally {
      setRefreshing(false);
    }
  }, [refreshing, loadHistory]);

  const handleLoadPromptConfig = useCallback((prompt: GeneratedPrompt) => {
    dispatchPromptConfigLoadedEvent(prompt.config);
    if (window.location.pathname !== '/') {
      navigate('/');
    }
    toast.success('Configuration loaded');
  }, [navigate]);

  if (!isInitialized && isLoading) {
    return (
      <div
        className="editorial-card flex-center flex-col py-16"
        role="status"
        aria-label="Loading prompt history"
      >
        <div className="spinner h-8 w-8 mb-4" aria-hidden="true" />
        <p className="text-foreground-muted text-sm">Loading history...</p>
      </div>
    );
  }

  if (isInitialized && history.length === 0) {
    return (
      <div
        className="editorial-card flex-center flex-col py-16"
        role="status"
        aria-label="Empty prompt history"
      >
        <Clock className="h-10 w-10 text-foreground-subtle mb-4" aria-hidden="true" />
        <p className="text-foreground-muted text-sm text-center max-w-xs">
          No prompts yet. Generated prompts will appear here.
        </p>
      </div>
    );
  }

  const renderPromptItem = (item: GeneratedPrompt, index?: number, isInBatch?: boolean) => (
    <article
      key={item.id}
      className={`content-item ${isInBatch ? 'ml-4 border-l-2 border-primary/20 pl-4' : ''}`}
      aria-label={`Prompt from ${formatDate(item.timestamp)}`}
    >
      <header className="item-header">
        <div className="flex items-center gap-3">
          <time
            className="item-timestamp"
            dateTime={new Date(item.timestamp).toISOString()}
          >
            {formatDate(item.timestamp)}
          </time>
          {isInBatch && index !== undefined && (
            <span className="badge-muted">
              #{index + 1}
            </span>
          )}
        </div>
        <div className="item-actions" role="toolbar" aria-label="Prompt actions">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-primary hover:text-primary-light hover:bg-primary/10"
                  onClick={() => handleLoadPromptConfig(item)}
                >
                  <Rewind className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-popover border-border/10 text-xs">
                Load settings
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-foreground-muted hover:text-foreground hover:bg-background-elevated"
                  onClick={() => handleCopyPrompt(item.prompt)}
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-popover border-border/10 text-xs">
                Copy prompt
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-foreground-subtle hover:text-destructive hover:bg-destructive/10"
                  onClick={() => handleDeletePrompt(item.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-popover border-border/10 text-xs">
                Delete
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </header>

      <section className="mt-2">
        <div
          className={expandedItems[item.id] ? 'item-expanded' : 'item-content item-preview'}
          id={`prompt-content-${item.id}`}
        >
          {item.prompt}
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="mt-2 h-auto p-0 text-primary hover:text-primary-light hover:bg-transparent"
          onClick={() => toggleExpand(item.id)}
          aria-expanded={expandedItems[item.id]}
          aria-controls={`prompt-content-${item.id}`}
        >
          <span className="flex items-center gap-1 text-xs font-medium">
            {expandedItems[item.id] ? (
              <>
                <ChevronUp className="h-3 w-3" />
                Show less
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3" />
                Show more
              </>
            )}
          </span>
        </Button>
      </section>

      <footer className="item-footer">
        Model: <span className="text-primary">{item.modelUsed || "Unknown"}</span>
      </footer>
    </article>
  );

  return (
    <div className="editorial-card" role="region" aria-label="Prompt History">
      <header className="flex-between p-6 pb-0">
        <div>
          <h2 className="heading-2">Recent Prompts</h2>
          <p className="text-sm text-foreground-muted mt-1">
            {history.length} prompt{history.length !== 1 ? 's' : ''} generated
          </p>
        </div>
        <nav className="flex gap-2" aria-label="History actions">
          <Link to="/explorer">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-foreground-muted hover:text-foreground"
            >
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">View All</span>
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-foreground-muted hover:text-foreground"
            onClick={handleRefresh}
            disabled={refreshing || isLoading}
          >
            {refreshing || isLoading ? (
              <div className="spinner h-4 w-4" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </nav>
      </header>

      <ScrollArea className="p-6 max-h-[500px]" ref={scrollAreaRef}>
        <div className="space-y-4">
          {organizedPrompts.map((group, idx) => (
            <section
              key={group.type === 'batch' ? group.batchId : idx}
              aria-label={group.type === 'batch' ? 'Prompt batch' : 'Individual prompt'}
            >
              {group.type === 'batch' && group.batchId ? (
                <div className="space-y-3">
                  {!expandedBatches[group.batchId]
                    ? renderPromptItem(group.prompts[0], 0, true)
                    : group.prompts.map((item, idx) => renderPromptItem(item, idx, true))}
                  {group.prompts.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-4 text-xs text-foreground-subtle hover:text-foreground"
                      onClick={() => toggleExpandBatch(group.batchId!)}
                    >
                      {expandedBatches[group.batchId]
                        ? `Hide ${group.prompts.length - 1} variations`
                        : `Show ${group.prompts.length - 1} more variations`}
                    </Button>
                  )}
                </div>
              ) : (
                group.prompts.map(item => renderPromptItem(item))
              )}
            </section>
          ))}
        </div>

        {loadingMore && (
          <div className="flex-center py-6" aria-live="polite">
            <div className="spinner h-5 w-5 mr-2" />
            <span className="text-sm text-foreground-muted">Loading more...</span>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default PromptHistory;
