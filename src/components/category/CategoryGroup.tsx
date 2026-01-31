import React from 'react';
import { Category, PromptConfig } from '@/types/prompt';
import CategoryItem from './CategoryItem';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface CategoryGroupProps {
  title: string;
  categories: Category[];
  selectedOptions: PromptConfig;
  onOptionSelect: (categoryId: string, value: string | string[]) => void;
  isLoading?: boolean;
}

const CategoryGroup: React.FC<CategoryGroupProps> = ({
  title,
  categories,
  selectedOptions,
  onOptionSelect,
  isLoading = false,
}) => {
  const isMobile = useIsMobile();

  return (
    <div className="space-y-4">
      <h4 className={cn(
        "font-display text-sm font-medium text-foreground-muted uppercase tracking-wider",
        isMobile && "text-xs"
      )}>
        {title}
      </h4>
      <div className={cn(
        "grid grid-cols-1 gap-3",
        !isMobile && "md:grid-cols-2 lg:grid-cols-3"
      )}>
        {categories.map((category) => (
          <CategoryItem
            key={category.id}
            category={category}
            selectedOptions={selectedOptions}
            onOptionSelect={onOptionSelect}
            isLoading={isLoading}
          />
        ))}
      </div>
    </div>
  );
};

export default React.memo(CategoryGroup);
