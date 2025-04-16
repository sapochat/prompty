import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Settings } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { saveApiKey } from '@/services/promptService';
import { availableModels, saveEnabledModels } from '@/services/modelService';
import ApiProviderTab from './ApiProviderTab';

interface ApiSettingsDialogProps {
  apiKeys: {
    openai: string;
    anthropic: string;
    huggingface: string;
    novita: string;
    openrouter: string;
  };
  maskedKeys: {
    openai: string;
    anthropic: string;
    huggingface: string;
    novita: string;
    openrouter: string;
  };
  enabledProviders: string[];
  onKeysUpdated: () => void;
  onProvidersUpdated: (providers: string[]) => void;
}

/**
 * Dialog for managing API keys and model settings
 */
const ApiSettingsDialog: React.FC<ApiSettingsDialogProps> = ({
  apiKeys,
  maskedKeys,
  enabledProviders,
  onKeysUpdated,
  onProvidersUpdated
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('openai');
  
  const [localApiKeys, setLocalApiKeys] = useState({
    openai: '',
    anthropic: '',
    huggingface: '',
    novita: '',
    openrouter: ''
  });
  
  const [keysModified, setKeysModified] = useState({
    openai: false,
    anthropic: false,
    huggingface: false,
    novita: false,
    openrouter: false
  });
  
  const [enabledModels, setEnabledModels] = useState<string[]>([]);
  const [modelsModified, setModelsModified] = useState<boolean>(false);
  
  useEffect(() => {
    loadEnabledModels();
  }, []);

  const loadEnabledModels = async () => {
    try {
      const savedModels = localStorage.getItem('enabledModels');
      if (savedModels) {
        setEnabledModels(JSON.parse(savedModels));
      } else {
        setEnabledModels(availableModels.map(model => model.id));
      }
    } catch (error) {
      console.error("Error loading enabled models:", error);
      setEnabledModels(availableModels.map(model => model.id));
    }
  };

  const saveEnabledProviders = async (providers: string[]): Promise<void> => {
    try {
      localStorage.setItem('enabledProviders', JSON.stringify(providers));
    } catch (error) {
      console.error("Error saving enabled providers:", error);
    }
  };

  const handleApiKeyChange = (provider: keyof typeof localApiKeys) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalApiKeys(prev => ({ ...prev, [provider]: e.target.value }));
    setKeysModified(prev => ({ ...prev, [provider]: true }));
  };

  const handleToggleModel = (modelId: string) => {
    setEnabledModels(prev => {
      const newModels = prev.includes(modelId)
        ? prev.filter(p => p !== modelId)
        : [...prev, modelId];
      
      setModelsModified(true);
      return newModels;
    });
  };

  const handleDialogOpenChange = (open: boolean) => {
    if (open) {
      setLocalApiKeys({
        openai: '',
        anthropic: '',
        huggingface: '',
        novita: '',
        openrouter: ''
      });
      setKeysModified({
        openai: false,
        anthropic: false,
        huggingface: false,
        novita: false,
        openrouter: false
      });
      loadEnabledModels();
      setModelsModified(false);
    }
    setIsOpen(open);
  };

  const handleSaveApiKeys = async () => {
    setIsLoading(true);
    let keysUpdated = false;
    
    try {
      for (const [provider, isModified] of Object.entries(keysModified)) {
        if (isModified) {
          await saveApiKey(provider, localApiKeys[provider as keyof typeof localApiKeys]);
          keysUpdated = true;
        }
      }
      
      if (modelsModified) {
        await saveEnabledModels(enabledModels);
        const enabledProviderSet = new Set<string>();
        availableModels
          .filter(model => enabledModels.includes(model.id))
          .forEach(model => enabledProviderSet.add(model.provider));
        
        const newEnabledProviders = Array.from(enabledProviderSet);
        await saveEnabledProviders(newEnabledProviders);
        onProvidersUpdated(newEnabledProviders);
      }
      
      if (keysUpdated || modelsModified) {
        toast.success("Settings saved successfully");
        
        onKeysUpdated();
      }
    } catch (error) {
      console.error("Error saving API settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setIsLoading(false);
      setIsOpen(false);
    }
  };

  const getProviderModels = (provider: string) => {
    return availableModels.filter(model => model.provider === provider);
  };

  const hasChanges = Object.values(keysModified).some(Boolean) || modelsModified;

  const providerConfigs = [
    { 
      id: 'openai',
      name: 'OpenAI',
      linkUrl: 'https://platform.openai.com/api-keys'
    },
    { 
      id: 'anthropic',
      name: 'Anthropic',
      linkUrl: 'https://console.anthropic.com/settings/keys'
    },
    { 
      id: 'huggingface',
      name: 'Huggingface',
      linkUrl: 'https://huggingface.co/settings/tokens'
    },
    { 
      id: 'novita',
      name: 'Novita.AI',
      linkUrl: 'https://novita.ai/account/api-key'
    },
    { 
      id: 'openrouter',
      name: 'OpenRouter',
      linkUrl: 'https://openrouter.ai/keys'
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Settings">
          <Settings className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full sm:max-w-[500px] md:max-w-[550px] overflow-y-auto max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>API Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Tabs defaultValue="openai" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full mb-4">
              {providerConfigs.map(provider => (
                <TabsTrigger 
                  key={provider.id} 
                  value={provider.id} 
                  className="flex-1"
                >
                  {provider.name}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {providerConfigs.map(provider => (
              <TabsContent key={provider.id} value={provider.id}>
                <ApiProviderTab
                  provider={provider.id}
                  displayName={provider.name}
                  linkUrl={provider.linkUrl}
                  apiKeyValue={keysModified[provider.id as keyof typeof keysModified] ? localApiKeys[provider.id as keyof typeof localApiKeys] : ''}
                  apiKeyMasked={maskedKeys[provider.id as keyof typeof maskedKeys]}
                  onApiKeyChange={handleApiKeyChange(provider.id as keyof typeof localApiKeys)}
                  models={getProviderModels(provider.id)}
                  enabledModels={enabledModels}
                  onToggleModel={handleToggleModel}
                  isLoading={isLoading}
                />
              </TabsContent>
            ))}
          </Tabs>
          <Button 
            onClick={handleSaveApiKeys} 
            className="w-full"
            disabled={isLoading || !hasChanges}
          >
            {isLoading ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ApiSettingsDialog;
