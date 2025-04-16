
import React from 'react';
import Header from '@/components/Header';
import PromptGenerator from '@/components/PromptGenerator';
import PromptHistory from '@/components/PromptHistory';
import { useIsMobile } from '@/hooks/use-mobile';

const Index = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container px-4 pt-20 pb-12 space-y-8">
        <PromptGenerator />
        <PromptHistory />
      </div>
    </div>
  );
};

export default Index;
