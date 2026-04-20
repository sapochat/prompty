import React, { useState } from 'react';
import { Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useIsMobile } from '@/hooks/use-mobile';
import { logger } from '@/utils/logger';

interface GithubSignInButtonProps {
  onClick: () => Promise<void>;
  isLoading: boolean;
}

export const GithubSignInButton: React.FC<GithubSignInButtonProps> = ({ onClick, isLoading }) => {
  const [localLoading, setLocalLoading] = useState(false);
  const effectiveLoading = isLoading || localLoading;
  const isMobile = useIsMobile();

  const handleClick = async () => {
    try {
      setLocalLoading(true);
      await onClick();
    } catch (error) {
      logger.error('GithubSignInButton: Error during sign in:', error);
    } finally {
      setTimeout(() => setLocalLoading(false), 500);
    }
  };
  
  return (
    <Button 
      onClick={handleClick} 
      className="w-full font-sans" 
      size={isMobile ? "default" : "lg"}
      disabled={effectiveLoading}
      variant="default"
    >
      {effectiveLoading ? (
        <Spinner size="sm" className="mr-2" />
      ) : (
        <Github className="mr-2 h-5 w-5" />
      )}
      {effectiveLoading ? "Signing in..." : "Sign in with GitHub"}
    </Button>
  );
};
