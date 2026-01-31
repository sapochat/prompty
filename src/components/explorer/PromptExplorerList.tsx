import React from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Trash2, Settings, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { PromptHistoryItem } from '@/types/prompt';

interface PromptExplorerListProps {
  prompts: PromptHistoryItem[];
  onDelete: (id: string) => void;
}

const PromptExplorerList: React.FC<PromptExplorerListProps> = ({
  prompts,
  onDelete
}) => {
  const navigate = useNavigate();

  if (prompts.length === 0) {
    return (
      <div className="flex-center flex-col py-16">
        <FileText className="h-10 w-10 text-foreground-subtle mb-4" />
        <p className="font-display text-lg font-medium text-foreground mb-2">
          No prompts found
        </p>
        <p className="text-sm text-foreground-muted text-center max-w-xs">
          Your generated prompts will appear here.
        </p>
      </div>
    );
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const loadPromptSettings = (promptId: string) => {
    navigate(`/?loadPrompt=${promptId}`);
  };

  const handleDelete = (id: string) => {
    onDelete(id);
    toast.success("Prompt deleted");
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {prompts.map((prompt) => (
        <article key={prompt.id} className="content-item">
          {/* Header */}
          <div className="item-header mb-3">
            <div className="flex items-center gap-2">
              {prompt.modelUsed && (
                <span className="badge-primary">
                  {prompt.modelUsed}
                </span>
              )}
              <time className="item-timestamp">
                {prompt.createdAt ? format(new Date(prompt.createdAt), 'MMM d, yyyy') : 'No date'}
              </time>
            </div>
          </div>

          {/* Content */}
          <div className="max-h-28 overflow-y-auto mb-4">
            <p className="text-sm text-foreground-muted leading-relaxed">
              {prompt.prompt}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-border/5">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(prompt.prompt)}
              className="gap-1.5 text-foreground-muted hover:text-foreground"
            >
              <Copy className="h-3.5 w-3.5" />
              Copy
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => loadPromptSettings(prompt.id)}
                className="gap-1.5 text-primary hover:text-primary-light"
              >
                <Settings className="h-3.5 w-3.5" />
                Load
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-foreground-subtle hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-card border-border/10">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="font-display">Delete prompt</AlertDialogTitle>
                    <AlertDialogDescription className="text-foreground-muted">
                      Are you sure you want to delete this prompt? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="btn-secondary">Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDelete(prompt.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
};

export default PromptExplorerList;
