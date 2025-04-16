
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Trash, Settings, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
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
  
  // No prompts state
  if (prompts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg bg-muted/30">
        <FileText className="w-10 h-10 mb-4 text-muted-foreground" />
        <h3 className="mb-1 text-lg font-medium">No prompts found</h3>
        <p className="text-sm text-muted-foreground">
          Your generated prompts will appear here.
        </p>
      </div>
    );
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Prompt copied to clipboard"
    });
  };

  const loadPromptSettings = (promptId: string) => {
    // Navigate to the main page with the prompt ID to load
    navigate(`/?loadPrompt=${promptId}`);
  };

  const handleDelete = (id: string) => {
    onDelete(id);
    toast({
      title: "Deleted",
      description: "Prompt was deleted successfully"
    });
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {prompts.map((prompt) => (
        <Card key={prompt.id} className="overflow-hidden border">
          <CardContent className="p-0">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {prompt.modelUsed && (
                    <Badge variant="outline" className="px-2 py-0">
                      {prompt.modelUsed}
                    </Badge>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {prompt.createdAt ? format(new Date(prompt.createdAt), 'MMM d, yyyy h:mm a') : 'No date'}
                  </p>
                </div>
              </div>
              
              <div className="max-h-32 overflow-y-auto mb-3">
                <p className="text-sm">{prompt.prompt}</p>
              </div>

              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(prompt.prompt)}
                  className="gap-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copy
                </Button>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadPromptSettings(prompt.id)}
                    className="gap-1"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    Load settings
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-1">
                        <Trash className="w-3.5 h-3.5" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete prompt</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this prompt? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
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
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PromptExplorerList;
