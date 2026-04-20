import React, { useState, useEffect } from 'react';
import { getApiKey } from '@/services/promptService';
import { maskApiKey } from '@/utils/apiKeyUtils';
import ApiSettingsDialog from './settings/ApiSettingsDialog';
import { getAllProviders } from '@/services/modelService';
import { Link } from 'react-router-dom';
import { BookOpen, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { logger } from '@/utils/logger';

const Header: React.FC = () => {
  const [apiKeys, setApiKeys] = useState({
    openai: '',
    anthropic: '',
    huggingface: '',
    novita: '',
    openrouter: ''
  });

  const [maskedApiKeys, setMaskedApiKeys] = useState({
    openai: '',
    anthropic: '',
    huggingface: '',
    novita: '',
    openrouter: ''
  });

  const [enabledProviders, setEnabledProviders] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadApiKeys();
    loadEnabledProviders();
  }, []);

  const loadEnabledProviders = async () => {
    try {
      const savedProviders = localStorage.getItem('enabledProviders');
      if (savedProviders) {
        setEnabledProviders(JSON.parse(savedProviders));
      } else {
        const allProviders = getAllProviders();
        setEnabledProviders(allProviders);
      }
    } catch (error) {
      logger.error("Error loading enabled providers:", error);
      setEnabledProviders(getAllProviders());
    }
  };

  const handleProvidersUpdated = async (providers: string[]) => {
    setEnabledProviders(providers);
  };

  const loadApiKeys = async () => {
    setIsLoading(true);
    try {
      const openaiKey = await getApiKey('openai');
      const anthropicKey = await getApiKey('anthropic');
      const huggingfaceKey = await getApiKey('huggingface');
      const novitaKey = await getApiKey('novita');
      const openrouterKey = await getApiKey('openrouter');

      setApiKeys({
        openai: openaiKey,
        anthropic: anthropicKey,
        huggingface: huggingfaceKey,
        novita: novitaKey,
        openrouter: openrouterKey
      });

      setMaskedApiKeys({
        openai: openaiKey ? maskApiKey(openaiKey) : '',
        anthropic: anthropicKey ? maskApiKey(anthropicKey) : '',
        huggingface: huggingfaceKey ? maskApiKey(huggingfaceKey) : '',
        novita: novitaKey ? maskApiKey(novitaKey) : '',
        openrouter: openrouterKey ? maskApiKey(openrouterKey) : ''
      });
    } catch (error) {
      logger.error("Error loading API keys:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeysUpdated = () => {
    loadApiKeys();
    window.dispatchEvent(new Event('apiKeysUpdated'));
  };

  return (
    <header
      className="w-full fixed top-0 left-0 right-0 z-50 border-b border-border/10 backdrop-blur-md"
      style={{
        background: 'linear-gradient(to bottom, rgba(20, 20, 20, 0.95), rgba(20, 20, 20, 0.9))',
      }}
      role="banner"
    >
      <div className="container flex items-center justify-between h-16 px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-md bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-editorial">
            <span className="font-display text-background font-bold text-lg">P</span>
          </div>
          <h1 className="font-display text-xl font-semibold text-foreground tracking-tight group-hover:text-primary transition-colors duration-200">
            Prompty
          </h1>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-2" aria-label="Main navigation">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link to="/explorer">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 text-foreground-muted hover:text-foreground hover:bg-background-elevated"
                  >
                    <BookOpen className="h-4 w-4" />
                    <span className="hidden sm:inline text-sm">Explorer</span>
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent
                className="bg-popover border-border/10 text-foreground text-xs"
                sideOffset={8}
              >
                Browse prompt history
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className="w-px h-5 bg-border/10 mx-1" />

          <ApiSettingsDialog
            apiKeys={apiKeys}
            maskedKeys={maskedApiKeys}
            enabledProviders={enabledProviders}
            onKeysUpdated={handleKeysUpdated}
            onProvidersUpdated={handleProvidersUpdated}
          />
        </nav>
      </div>
    </header>
  );
};

export default Header;
