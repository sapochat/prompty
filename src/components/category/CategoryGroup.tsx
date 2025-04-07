
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
    <div className="space-y-3">
      <h3 className={cn("heading-3", isMobile && "text-base mb-1")}>
        {title}
      </h3>
      <div className={cn(
        "grid grid-cols-1 gap-2",
        !isMobile && "md:grid-cols-2 lg:grid-cols-3 gap-4"
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
