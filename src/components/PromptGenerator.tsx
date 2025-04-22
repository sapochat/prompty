
import React, { useCallback, useEffect } from 'react';
import { promptCategories } from '@/utils/promptData';
import { Card } from '@/components/ui/card';
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

/**
 * Main component for generating prompts with various parameters
 */
const PromptGenerator: React.FC<PromptGeneratorProps> = ({ initialConfig }) => {
  const isMobile = useIsMobile();
  const { isLoadingKeys, filteredModels, loadApiKeys } = useModelSelection();
  const { isGenerating, generatePromptHelper } = usePromptGeneration();
  
  // Manage prompt configuration with custom hook
  const { 
    promptConfig, 
    setPromptConfig, 
    extraDetails, 
    setExtraDetails, 
    isInitialized 
  } = usePromptConfig(initialConfig);

  const [prefixText, setPrefixText] = React.useState<string>('');
  
  // Initialize prefix text from config
  useEffect(() => {
    if (isInitialized && promptConfig.prefixText) {
      setPrefixText(promptConfig.prefixText);
    }
  }, [isInitialized, promptConfig.prefixText]);

  // Reload models when API keys are updated
  useEffect(() => {
    const handleApiKeysUpdated = () => {
      console.log("API keys updated event received, reloading models");
      loadApiKeys();
    };
    
    window.addEventListener('apiKeysUpdated', handleApiKeysUpdated);
    return () => {
      window.removeEventListener('apiKeysUpdated', handleApiKeysUpdated);
    };
  }, [loadApiKeys]);

  // Handler for category option selection
  const handleOptionSelect = useCallback((categoryId: string, value: string | string[]) => {
    setPromptConfig(prev => ({
      ...prev,
      [categoryId]: value,
    }));
  }, [setPromptConfig]);

  // Handler for extra details input
  const handleExtraDetailsChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setExtraDetails(e.target.value);
  }, [setExtraDetails]);
  
  // Handler for prefix text input
  const handlePrefixTextChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setPrefixText(newValue);
    
    setPromptConfig(prev => ({
      ...prev,
      prefixText: newValue,
    }));
  }, [setPromptConfig]);

  // Handler for model selection
  const handleModelChange = useCallback((value: string) => {
    setPromptConfig(prev => ({
      ...prev,
      model: value,
    }));
  }, [setPromptConfig]);

  // Helper to get a random option from a category
  const getRandomOptionFromCategory = useCallback((categoryId: string) => {
    const category = promptCategories.find(c => c.id === categoryId);
    if (!category || category.options.length === 0) return [];
    
    const randomIndex = Math.floor(Math.random() * category.options.length);
    return [category.options[randomIndex].value];
  }, []);

  // Handler to randomize all categories
  const handleRandomizeAll = useCallback(() => {
    const newConfig = { ...promptConfig };
    
    promptCategories.forEach(category => {
      newConfig[category.id as keyof PromptConfig] = getRandomOptionFromCategory(category.id);
    });
    
    setPromptConfig(newConfig);
    toast.success("All categories randomized");
  }, [promptConfig, getRandomOptionFromCategory, setPromptConfig]);

  // Handlers for prompt generation
  const handleGeneratePrompt = () => generatePromptHelper(promptConfig, extraDetails, prefixText, promptCategories, 1);
  const handleGenerateMultiple = () => generatePromptHelper(promptConfig, extraDetails, prefixText, promptCategories, 3);

  // Handler to reset all selections
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

  // Count selected categories to determine if prompt can be generated
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
    <Card className="bg-[#121220] border border-[#2a2a3a] rounded-lg shadow-md text-white overflow-hidden">
      <div className="p-5 space-y-6">
        <div className="space-y-6">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-white">AI Model</h3>
              <p className="text-sm text-gray-400">Select which AI model to use</p>
            </div>
          </div>
          
          <ModelSelector
            isLoading={isLoadingKeys}
            filteredModels={filteredModels}
            selectedModel={promptConfig.model || ''}
            onModelChange={handleModelChange}
          />
          
          <CategorySelector 
            categories={promptCategories} 
            selectedOptions={promptConfig}
            onOptionSelect={handleOptionSelect}
            isLoading={isGenerating || isLoadingKeys}
          />
          
          <ExtraDetailsInput
            value={extraDetails}
            onChange={handleExtraDetailsChange}
            isDisabled={isGenerating || isLoadingKeys}
            prefixText={prefixText}
            onPrefixChange={handlePrefixTextChange}
          />
          
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
          
          <StatusMessage
            isLoadingKeys={isLoadingKeys}
            hasModels={filteredModels.length > 0}
            selectedCategoriesCount={selectedCategoriesCount}
            requiredCount={requiredCategoriesCount}
          />
        </div>
      </div>
    </Card>
  );
};

export default PromptGenerator;
