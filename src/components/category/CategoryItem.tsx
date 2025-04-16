
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
    if (count === 0) return 'Select options...';
    return `${count} selected`;
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Popover
          open={isOpen}
          onOpenChange={setIsOpen}
        >
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              className={cn(
                "w-full justify-between h-auto min-h-9 py-1.5",
                isMobile ? "text-sm" : ""
              )}
              disabled={isLoading}
              size={isMobile ? "sm" : "default"}
            >
              <div className="flex flex-col items-start">
                <span className={cn(
                  "text-xs text-muted-foreground",
                  isMobile ? "truncate max-w-[120px]" : ""
                )}>
                  {category.name}
                </span>
                <span className={cn(
                  "text-sm truncate",
                  isMobile ? "max-w-[120px]" : "max-w-[180px]"
                )}>
                  {getCategorySelectionLabel()}
                </span>
              </div>
              <ChevronDownIcon className="h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className={cn(
            "p-0",
            isMobile ? "w-[90vw] max-w-[280px]" : "w-[300px]"
          )} align="start">
            <Command>
              <CommandInput placeholder={`Search ${category.name.toLowerCase()}...`} className="h-9" />
              <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <div className="flex justify-between items-center px-2 py-1.5 flex-wrap gap-1">
                  <span className={cn(
                    "text-xs text-muted-foreground",
                    isMobile ? "truncate max-w-[120px]" : ""
                  )}>
                    {category.description}
                  </span>
                  <div className="flex gap-2">
                    {getCategorySelectionCount() > 0 && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 text-xs"
                        onClick={() => handleClearCategory(category.id)}
                      >
                        Clear
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={handleRandomSelect}
                    >
                      <Shuffle className="h-3 w-3 mr-1" />
                      {isMobile ? "" : "Random"}
                    </Button>
                  </div>
                </div>
                <CommandGroup>
                  <ScrollArea className={isMobile ? "h-[40vh] max-h-[300px]" : "h-[300px]"}>
                    {category.options.map((option) => {
                      const isSelected = Array.isArray(selectedOptions[category.id as keyof PromptConfig])
                        ? (selectedOptions[category.id as keyof PromptConfig] as string[])?.includes(option.value)
                        : selectedOptions[category.id as keyof PromptConfig] === option.value;

                      return (
                        <CommandItem
                          key={option.id}
                          value={option.name}
                          onSelect={() => handleToggleOption(category.id, option.value)}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <div className={cn(
                            "flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                            isSelected ? "bg-primary text-primary-foreground" : "opacity-50"
                          )}>
                            {isSelected && <CheckIcon className="h-3 w-3" />}
                          </div>
                          <span className={cn(isMobile && "text-sm")}>{option.name}</span>
                          {option.description && !isMobile && (
                            <span className="text-xs text-muted-foreground ml-auto">
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
          variant="outline"
          size={isMobile ? "sm" : "icon"}
          className={cn(
            isMobile ? "px-2 min-h-9 h-auto" : "h-auto min-h-9"
          )}
          onClick={handleRandomSelect}
          disabled={isLoading || category.options.length === 0}
          title="Randomize this category"
        >
          <Shuffle className="h-4 w-4" />
        </Button>
      </div>

      {getCategorySelectionCount() > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {Array.isArray(selectedOptions[category.id as keyof PromptConfig]) ? 
            (selectedOptions[category.id as keyof PromptConfig] as string[]).map((selected, index) => {
              const option = category.options.find(o => o.value === selected);
              return option ? (
                <Badge 
                  key={index} 
                  variant="secondary"
                  className={cn("text-xs", isMobile && "text-[10px] py-0 h-5")}
                >
                  {option.name}
                </Badge>
              ) : null;
            })
            : 
            selectedOptions[category.id as keyof PromptConfig] ? (
              <Badge 
                variant="secondary" 
                className={cn("text-xs", isMobile && "text-[10px] py-0 h-5")}
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
