
import React from 'react';
import { AIModel } from '@/types/prompt';
import ApiKeyInput from './ApiKeyInput';
import ProvidersToggle from './ProvidersToggle';

interface ApiProviderTabProps {
  provider: string;
  displayName: string;
  linkUrl: string;
  apiKeyValue: string;
  apiKeyMasked: string;
  onApiKeyChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  models: AIModel[];
  enabledModels: string[];
  onToggleModel: (modelId: string) => void;
  isLoading: boolean;
}

/**
 * A tab for a specific API provider in the settings dialog
 */
const ApiProviderTab: React.FC<ApiProviderTabProps> = ({
  provider,
  displayName,
  linkUrl,
  apiKeyValue,
  apiKeyMasked,
  onApiKeyChange,
  models,
  enabledModels,
  onToggleModel,
  isLoading
}) => {
  const isModelEnabled = (modelId: string) => enabledModels.includes(modelId);
  
  return (
    <div className="space-y-4">
      <ApiKeyInput
        id={`${provider}-api-key`}
        provider={displayName}
        placeholder={apiKeyMasked || `Enter your ${displayName} API key`}
        value={apiKeyValue}
        onChange={onApiKeyChange}
        disabled={isLoading}
        linkUrl={linkUrl}
      />
      
      <div className="mt-4 pt-2 border-t">
        <h3 className="font-medium mb-2 text-sm">Available Models</h3>
        <div className="space-y-1">
          {models.map(model => (
            <ProvidersToggle
              key={model.id}
              modelId={model.id}
              modelName={model.name}
              isEnabled={isModelEnabled(model.id)}
              onToggle={() => onToggleModel(model.id)}
              disabled={isLoading}
              description={model.description}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ApiProviderTab;
