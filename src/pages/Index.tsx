
import React from 'react';
import Header from '@/components/Header';
import PromptGenerator from '@/components/PromptGenerator';
import PromptHistory from '@/components/PromptHistory';
import { useIsMobile } from '@/hooks/use-mobile';

const Index = () => {
  const isMobile = useIsMobile();
  
  return (
    <main className="min-h-screen bg-background" role="main" aria-label="Prompt Generator Application">
      <Header />
      <section className="container px-4 pt-20 pb-12 space-y-8" aria-label="Main Content">
        <article aria-label="Prompt Generator Section">
          <PromptGenerator />
        </article>
        <article aria-label="Prompt History Section">
          <PromptHistory />
        </article>
      </section>
    </main>
  );
};

export default Index;
