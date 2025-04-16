import React, { useState, useEffect } from 'react';
import { getApiKey } from '@/services/promptService';
import { maskApiKey } from '@/utils/apiKeyUtils';
import ApiSettingsDialog from './settings/ApiSettingsDialog';
import { getAllProviders } from '@/services/modelService';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const Header: React.FC = () => {
  // API key state management
  const [apiKeys, setApiKeys] = useState({
    openai: '',
    anthropic: '',
    huggingface: '',
    novita: '',
    openrouter: ''
  });
  
  // Masked keys for UI display
  const [maskedApiKeys, setMaskedApiKeys] = useState({
    openai: '',
    anthropic: '',
    huggingface: '',
    novita: '',
    openrouter: ''
  });
  
  const [enabledProviders, setEnabledProviders] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Load API keys when component mounts
  useEffect(() => {
    loadApiKeys();
    loadEnabledProviders();
  }, []);

  const loadEnabledProviders = async () => {
    try {
      // Default to all providers enabled if not set
      const savedProviders = localStorage.getItem('enabledProviders');
      if (savedProviders) {
        setEnabledProviders(JSON.parse(savedProviders));
      } else {
        const allProviders = getAllProviders();
        setEnabledProviders(allProviders);
      }
    } catch (error) {
      console.error("Error loading enabled providers:", error);
      setEnabledProviders(getAllProviders());
    }
  };

  const handleProvidersUpdated = async (providers: string[]) => {
    setEnabledProviders(providers);
  };

  const loadApiKeys = async () => {
    setIsLoading(true);
    try {
      console.log("Loading API keys...");
      const openaiKey = await getApiKey('openai');
      const anthropicKey = await getApiKey('anthropic');
      const huggingfaceKey = await getApiKey('huggingface');
      const novitaKey = await getApiKey('novita');
      const openrouterKey = await getApiKey('openrouter');
      
      console.log("API keys loaded:", { 
        openai: openaiKey ? "✓" : "✗", 
        anthropic: anthropicKey ? "✓" : "✗", 
        huggingface: huggingfaceKey ? "✓" : "✗",
        novita: novitaKey ? "✓" : "✗",
        openrouter: openrouterKey ? "✓" : "✗"
      });
      
      // Store the actual keys in state (they will never be rendered directly)
      setApiKeys({
        openai: openaiKey,
        anthropic: anthropicKey,
        huggingface: huggingfaceKey,
        novita: novitaKey,
        openrouter: openrouterKey
      });
      
      // Create masked versions for display
      setMaskedApiKeys({
        openai: openaiKey ? maskApiKey(openaiKey) : '',
        anthropic: anthropicKey ? maskApiKey(anthropicKey) : '',
        huggingface: huggingfaceKey ? maskApiKey(huggingfaceKey) : '',
        novita: novitaKey ? maskApiKey(novitaKey) : '',
        openrouter: openrouterKey ? maskApiKey(openrouterKey) : ''
      });
    } catch (error) {
      console.error("Error loading API keys:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeysUpdated = () => {
    loadApiKeys();
    // Dispatch a custom event that other components can listen for
    window.dispatchEvent(new Event('apiKeysUpdated'));
  };

  return (
    <header className="w-full border-b border-border/40 backdrop-blur-sm bg-background/80 fixed top-0 left-0 right-0 z-50">
      <div className="container flex items-center justify-between h-16 px-4">
        <div className="flex-1">
          <h1 className="gradient-text text-xl font-semibold tracking-tight">Prompty</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link to="/explorer">
                  <Button variant="outline" size="sm" className="gap-2">
                    <BookOpen className="h-4 w-4" />
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>Prompt Explorer</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <ApiSettingsDialog 
            apiKeys={apiKeys}
            maskedKeys={maskedApiKeys}
            enabledProviders={enabledProviders}
            onKeysUpdated={handleKeysUpdated}
            onProvidersUpdated={handleProvidersUpdated}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
