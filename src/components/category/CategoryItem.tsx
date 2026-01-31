import React, { useState } from 'react';
import { Category, PromptConfig } from '@/types/prompt';
import { CheckIcon, ChevronDownIcon, Shuffle } from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useIsMobile } from '@/hooks/use-mobile';

interface CategoryItemProps {
  category: Category;
  selectedOptions: PromptConfig;
  onOptionSelect: (categoryId: string, value: string | string[]) => void;
  isLoading?: boolean;
}

const CategoryItem: React.FC<CategoryItemProps> = ({
  category,
  selectedOptions,
  onOptionSelect,
  isLoading = false,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const isMobile = useIsMobile();

  const handleToggleOption = (categoryId: string, optionValue: string) => {
    const currentValues = selectedOptions[categoryId as keyof PromptConfig] || [];
    const currentArray = Array.isArray(currentValues) ? currentValues : [currentValues].filter(Boolean);

    if (currentArray.includes(optionValue)) {
      const newValues = currentArray.filter(value => value !== optionValue);
      onOptionSelect(categoryId, newValues);
    } else {
      onOptionSelect(categoryId, [...currentArray, optionValue]);
    }
  };

  const handleRandomSelect = () => {
    if (!category || category.options.length === 0) return;
    const randomIndex = Math.floor(Math.random() * category.options.length);
    const randomOption = category.options[randomIndex];
    onOptionSelect(category.id, [randomOption.value]);
    setIsOpen(false);
  };

  const handleClearCategory = (categoryId: string) => {
    onOptionSelect(categoryId, []);
  };

  const getCategorySelectionCount = (): number => {
    const value = selectedOptions[category.id as keyof PromptConfig];
    if (!value) return 0;
    return Array.isArray(value) ? value.length : value ? 1 : 0;
  };

  const getCategorySelectionLabel = (): string => {
    const count = getCategorySelectionCount();
    if (count === 0) return 'Select...';
    return `${count} selected`;
  };

  const selectionCount = getCategorySelectionCount();

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              role="combobox"
              className={cn(
                "w-full justify-between h-auto min-h-12 py-2.5 px-4",
                "bg-background-elevated border border-border/10",
                "text-foreground rounded-md",
                "hover:bg-background-surface hover:border-border/20",
                "focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/30",
                "transition-all duration-200",
                selectionCount > 0 && "border-primary/20 bg-primary/5",
                isMobile && "text-sm"
              )}
              disabled={isLoading}
              size={isMobile ? "sm" : "default"}
            >
              <div className="flex flex-col items-start gap-0.5">
                <span className={cn(
                  "text-xs text-foreground-muted font-medium",
                  isMobile && "truncate max-w-[120px]"
                )}>
                  {category.name}
                </span>
                <span className={cn(
                  "text-sm",
                  selectionCount > 0 ? "text-primary" : "text-foreground-subtle",
                  isMobile ? "max-w-[120px]" : "max-w-[180px]",
                  "truncate"
                )}>
                  {getCategorySelectionLabel()}
                </span>
              </div>
              <ChevronDownIcon className="h-4 w-4 shrink-0 text-foreground-subtle" />
            </Button>
          </PopoverTrigger>

          <PopoverContent
            className={cn(
              "p-0 bg-popover border border-border/10 shadow-editorial-xl rounded-lg overflow-hidden",
              isMobile ? "w-[90vw] max-w-[320px]" : "w-[360px]"
            )}
            align="start"
            sideOffset={4}
            side="bottom"
            avoidCollisions={false}
            sticky="always"
          >
            <Command className="bg-transparent">
              <CommandInput
                placeholder={`Search ${category.name.toLowerCase()}...`}
                className="h-10 bg-transparent text-foreground placeholder:text-foreground-subtle border-b border-border/10 rounded-none"
              />
              <CommandList>
                <CommandEmpty className="py-6 text-center text-sm text-foreground-muted">
                  No results found.
                </CommandEmpty>

                {/* Header with description and actions */}
                <div className="flex justify-between items-center px-3 py-2.5 border-b border-border/10 bg-background-elevated/50">
                  <span className={cn(
                    "text-xs text-foreground-subtle",
                    isMobile ? "truncate max-w-[120px]" : "max-w-[200px] truncate"
                  )}>
                    {category.description}
                  </span>
                  <div className="flex gap-1.5">
                    {selectionCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-foreground-muted hover:text-foreground"
                        onClick={() => handleClearCategory(category.id)}
                      >
                        Clear
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-foreground-muted hover:text-foreground"
                      onClick={handleRandomSelect}
                    >
                      <Shuffle className="h-3 w-3 mr-1" />
                      {isMobile ? "" : "Random"}
                    </Button>
                  </div>
                </div>

                <CommandGroup>
                  <ScrollArea className={cn(
                    "px-1",
                    isMobile ? "h-[40vh] max-h-[280px]" : "h-[280px]"
                  )}>
                    {category.options.map((option) => {
                      const isSelected = Array.isArray(selectedOptions[category.id as keyof PromptConfig])
                        ? (selectedOptions[category.id as keyof PromptConfig] as string[])?.includes(option.value)
                        : selectedOptions[category.id as keyof PromptConfig] === option.value;

                      return (
                        <CommandItem
                          key={option.id}
                          value={option.name}
                          onSelect={() => handleToggleOption(category.id, option.value)}
                          className={cn(
                            "flex items-center gap-3 cursor-pointer py-2.5 px-2 rounded-md",
                            "hover:bg-background-elevated",
                            isSelected && "bg-primary/5"
                          )}
                        >
                          <div className={cn(
                            "flex h-4 w-4 items-center justify-center rounded border transition-colors",
                            isSelected
                              ? "bg-primary border-primary text-background"
                              : "border-border/30"
                          )}>
                            {isSelected && <CheckIcon className="h-3 w-3" />}
                          </div>
                          <span className={cn(
                            "text-foreground",
                            isMobile && "text-sm"
                          )}>
                            {option.name}
                          </span>
                          {option.description && !isMobile && (
                            <span className="text-xs text-foreground-subtle ml-auto max-w-[140px] truncate">
                              {option.description}
                            </span>
                          )}
                        </CommandItem>
                      );
                    })}
                  </ScrollArea>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <Button
          variant="ghost"
          size={isMobile ? "sm" : "icon"}
          className={cn(
            "bg-background-elevated border border-border/10",
            "hover:bg-background-surface hover:border-border/20",
            "text-foreground-muted hover:text-foreground",
            "transition-all duration-200",
            isMobile ? "px-2 min-h-10 h-auto" : "h-auto min-h-12 w-12"
          )}
          onClick={handleRandomSelect}
          disabled={isLoading || category.options.length === 0}
          title="Randomize"
        >
          <Shuffle className="h-4 w-4" />
        </Button>
      </div>

      {/* Selected badges */}
      {selectionCount > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {Array.isArray(selectedOptions[category.id as keyof PromptConfig]) ?
            (selectedOptions[category.id as keyof PromptConfig] as string[]).map((selected, index) => {
              const option = category.options.find(o => o.value === selected);
              return option ? (
                <Badge
                  key={index}
                  variant="secondary"
                  className={cn(
                    "text-xs bg-primary/10 text-primary border border-primary/20",
                    "hover:bg-primary/15",
                    isMobile && "text-[10px] py-0 h-5"
                  )}
                >
                  {option.name}
                </Badge>
              ) : null;
            })
            :
            selectedOptions[category.id as keyof PromptConfig] ? (
              <Badge
                variant="secondary"
                className={cn(
                  "text-xs bg-primary/10 text-primary border border-primary/20",
                  isMobile && "text-[10px] py-0 h-5"
                )}
              >
                {category.options.find(o => o.value === selectedOptions[category.id as keyof PromptConfig])?.name}
              </Badge>
            ) : null
          }
        </div>
      )}
    </div>
  );
};

export default CategoryItem;
