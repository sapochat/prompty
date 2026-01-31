import React from 'react';
import Header from '@/components/Header';
import PromptGenerator from '@/components/PromptGenerator';
import PromptHistory from '@/components/PromptHistory';

const Index = () => {
  return (
    <div className="min-h-screen relative" role="main" aria-label="Prompt Generator Application">
      {/* Subtle warm glow in background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(212, 165, 116, 0.04), transparent 70%)',
        }}
        aria-hidden="true"
      />

      <Header />

      <main className="container max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        {/* Hero Section */}
        <header className="text-center mb-12 animate-fade-in">
          <h1 className="heading-display mb-4">
            Craft Perfect Prompts
          </h1>
          <p className="text-foreground-muted text-lg max-w-2xl mx-auto leading-relaxed">
            Generate refined, creative prompts for your AI workflows with precision and elegance.
          </p>
        </header>

        {/* Main Content */}
        <div className="space-y-8">
          <section
            className="animate-fade-in delay-100"
            style={{ animationFillMode: 'both' }}
            aria-label="Prompt Generator"
          >
            <PromptGenerator />
          </section>

          <div className="divider my-10" aria-hidden="true" />

          <section
            className="animate-fade-in delay-200"
            style={{ animationFillMode: 'both' }}
            aria-label="Recent Prompts"
          >
            <PromptHistory />
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/5 py-8 mt-16">
        <div className="container max-w-4xl mx-auto px-6 text-center">
          <p className="text-xs text-foreground-subtle">
            Built with care for prompt crafters everywhere
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
