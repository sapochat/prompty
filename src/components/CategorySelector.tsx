
import React, { useMemo } from 'react';
import { Category, PromptConfig } from '@/types/prompt';
import CategoryGroup from './category/CategoryGroup';
import { groupCategories } from './category/CategoryUtils';

interface CategorySelectorProps {
  categories: Category[];
  selectedOptions: PromptConfig;
  onOptionSelect: (categoryId: string, value: string | string[]) => void;
  isLoading?: boolean;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  categories,
  selectedOptions,
  onOptionSelect,
  isLoading = false,
}) => {
  // Memoize the grouped categories to avoid recomputation on every render
  const groupedCategories = useMemo(() => groupCategories(categories), [categories]);

  return (
    <div className={`space-y-6 transition-opacity duration-200 ${isLoading ? 'opacity-70 pointer-events-none' : 'opacity-100'}`}>
      {groupedCategories.map((group) => (
        <CategoryGroup
          key={group.title}
          title={group.title}
          categories={group.items}
          selectedOptions={selectedOptions}
          onOptionSelect={onOptionSelect}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
};

export default React.memo(CategorySelector);
