import React, { useCallback, useEffect } from 'react';
import { promptCategories } from '@/utils/promptData';
import CategorySelector from './CategorySelector';
import { PromptConfig } from '@/types/prompt';
import { useIsMobile } from '@/hooks/use-mobile';
import ModelSelector from './prompt/ModelSelector';
import ExtraDetailsInput from './prompt/ExtraDetailsInput';
import ActionButtons from './prompt/ActionButtons';
import StatusMessage from './prompt/StatusMessage';
import { usePromptConfig } from '@/hooks/usePromptConfig';
import { useModelSelection } from '@/hooks/useModelSelection';
import { usePromptGeneration } from '@/hooks/usePromptGeneration';
import { toast } from 'sonner';

interface PromptGeneratorProps {
  initialConfig?: PromptConfig;
}

const PromptGenerator: React.FC<PromptGeneratorProps> = ({ initialConfig }) => {
  const isMobile = useIsMobile();
  const { isLoadingKeys, filteredModels, loadApiKeys } = useModelSelection();
  const { isGenerating, generatePromptHelper } = usePromptGeneration();

  const {
    promptConfig,
    setPromptConfig,
    extraDetails,
    setExtraDetails,
    isInitialized
  } = usePromptConfig(initialConfig);

  const [prefixText, setPrefixText] = React.useState<string>('');

  useEffect(() => {
    if (isInitialized && promptConfig.prefixText) {
      setPrefixText(promptConfig.prefixText);
    }
  }, [isInitialized, promptConfig.prefixText]);

  useEffect(() => {
    const handleApiKeysUpdated = () => {
      loadApiKeys();
    };

    window.addEventListener('apiKeysUpdated', handleApiKeysUpdated);
    return () => {
      window.removeEventListener('apiKeysUpdated', handleApiKeysUpdated);
    };
  }, [loadApiKeys]);

  const handleOptionSelect = useCallback((categoryId: string, value: string | string[]) => {
    setPromptConfig(prev => ({
      ...prev,
      [categoryId]: value,
    }));
  }, [setPromptConfig]);

  const handleExtraDetailsChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setExtraDetails(e.target.value);
  }, [setExtraDetails]);

  const handlePrefixTextChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setPrefixText(newValue);
    setPromptConfig(prev => ({
      ...prev,
      prefixText: newValue,
    }));
  }, [setPromptConfig]);

  const handleModelChange = useCallback((value: string) => {
    setPromptConfig(prev => ({
      ...prev,
      model: value,
    }));
  }, [setPromptConfig]);

  const getRandomOptionFromCategory = useCallback((categoryId: string) => {
    const category = promptCategories.find(c => c.id === categoryId);
    if (!category || category.options.length === 0) return [];
    const randomIndex = Math.floor(Math.random() * category.options.length);
    return [category.options[randomIndex].value];
  }, []);

  const handleRandomizeAll = useCallback(() => {
    const newConfig = { ...promptConfig };
    promptCategories.forEach(category => {
      newConfig[category.id as keyof PromptConfig] = getRandomOptionFromCategory(category.id);
    });
    setPromptConfig(newConfig);
    toast.success("All categories randomized");
  }, [promptConfig, getRandomOptionFromCategory, setPromptConfig]);

  const handleGeneratePrompt = () => generatePromptHelper(promptConfig, extraDetails, prefixText, promptCategories, 1);
  const handleGenerateMultiple = () => generatePromptHelper(promptConfig, extraDetails, prefixText, promptCategories, 3);

  const handleReset = useCallback(() => {
    const defaultConfig = { ...promptConfig };
    const model = defaultConfig.model;
    promptCategories.forEach(category => {
      defaultConfig[category.id as keyof PromptConfig] = [];
    });
    defaultConfig.model = model;
    setPromptConfig(defaultConfig);
    setExtraDetails('');
    setPrefixText('');
    toast.success("All selections cleared");
  }, [promptConfig, setPromptConfig, setExtraDetails]);

  const countSelectedCategories = useCallback(() => {
    return Object.entries(promptConfig).filter(([key, value]) => {
      if (key === 'model' || key === 'prefixText') return false;
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return !!value;
    }).length + (extraDetails ? 1 : 0) + (prefixText ? 1 : 0);
  }, [promptConfig, extraDetails, prefixText]);

  const selectedCategoriesCount = countSelectedCategories();
  const requiredCategoriesCount = 2;
  const canGeneratePrompt = selectedCategoriesCount >= requiredCategoriesCount;

  return (
    <div
      className="editorial-card-elevated overflow-hidden"
      role="region"
      aria-label="Prompt Generator"
    >
      <form className="p-6 md:p-8 space-y-8" onSubmit={(e) => e.preventDefault()}>
        <fieldset className="space-y-8">
          <legend className="sr-only">Prompt Configuration</legend>

          {/* Model Selection */}
          <section aria-labelledby="model-selection-heading">
            <header className="mb-4">
              <h3
                id="model-selection-heading"
                className="font-display text-lg font-medium text-foreground"
              >
                AI Model
              </h3>
              <p className="text-sm text-foreground-muted mt-1">
                Choose the model that will generate your prompt
              </p>
            </header>

            <ModelSelector
              isLoading={isLoadingKeys}
              filteredModels={filteredModels}
              selectedModel={promptConfig.model || ''}
              onModelChange={handleModelChange}
            />
          </section>

          <div className="divider" aria-hidden="true" />

          {/* Category Selection */}
          <section aria-label="Category Selection">
            <header className="mb-4">
              <h3 className="font-display text-lg font-medium text-foreground">
                Prompt Parameters
              </h3>
              <p className="text-sm text-foreground-muted mt-1">
                Select at least {requiredCategoriesCount} categories to enable generation
              </p>
            </header>

            <CategorySelector
              categories={promptCategories}
              selectedOptions={promptConfig}
              onOptionSelect={handleOptionSelect}
              isLoading={isGenerating || isLoadingKeys}
            />
          </section>

          <div className="divider" aria-hidden="true" />

          {/* Extra Details */}
          <section aria-label="Additional Details">
            <ExtraDetailsInput
              value={extraDetails}
              onChange={handleExtraDetailsChange}
              isDisabled={isGenerating || isLoadingKeys}
              prefixText={prefixText}
              onPrefixChange={handlePrefixTextChange}
            />
          </section>

          {/* Action Buttons */}
          <section aria-label="Generator Controls" className="pt-2">
            <ActionButtons
              onReset={handleReset}
              onRandomizeAll={handleRandomizeAll}
              onGeneratePrompt={handleGeneratePrompt}
              onGenerateMultiple={handleGenerateMultiple}
              isGenerating={isGenerating}
              isDisabled={isGenerating || isLoadingKeys}
              canGenerate={canGeneratePrompt}
              hasModels={filteredModels.length > 0}
              isMobile={isMobile}
            />
          </section>

          {/* Status Message */}
          <footer aria-live="polite">
            <StatusMessage
              isLoadingKeys={isLoadingKeys}
              hasModels={filteredModels.length > 0}
              selectedCategoriesCount={selectedCategoriesCount}
              requiredCount={requiredCategoriesCount}
            />
          </footer>
        </fieldset>
      </form>
    </div>
  );
};

export default PromptGenerator;
