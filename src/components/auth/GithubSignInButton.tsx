
import React, { useState } from 'react';
import { Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useIsMobile } from '@/hooks/use-mobile';

interface GithubSignInButtonProps {
  onClick: () => Promise<void>;
  isLoading: boolean;
}

export const GithubSignInButton: React.FC<GithubSignInButtonProps> = ({ onClick, isLoading }) => {
  const [localLoading, setLocalLoading] = useState(false);
  const effectiveLoading = isLoading || localLoading;
  const isMobile = useIsMobile();
  
  console.log('GithubSignInButton: Rendering with isLoading =', isLoading, 'localLoading =', localLoading);
  
  const handleClick = async () => {
    try {
      console.log('GithubSignInButton: Button clicked, setting localLoading to true');
      setLocalLoading(true);
      await onClick();
    } catch (error) {
      console.error('GithubSignInButton: Error during sign in:', error);
    } finally {
      // Keep loading state for a short time to prevent flashing
      setTimeout(() => {
        console.log('GithubSignInButton: Resetting localLoading to false');
        setLocalLoading(false);
      }, 500);
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
