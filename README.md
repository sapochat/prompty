# Prompty

A locally-runnable AI prompt generator with secure API key management.

## Features

- Generate AI prompts for various models (OpenAI, Anthropic, HuggingFace, Novita, OpenRouter)
- Local storage of API keys (never sent to any server other than the chosen provider)
- Customizable prompt categories and parameters
- Prompt history management
- Batch prompt generation
- No user accounts or authentication needed

## How It Works

1. **Add your API keys** - Enter your API keys for the services you want to use
2. **Choose your model** - Select from various AI models
3. **Configure your prompt** - Set categories, styles, and parameters
4. **Generate** - Create prompts with a single click
5. **View history** - Access all your previously generated prompts

All data is stored locally in your browser — API keys are only used to authenticate requests to the provider you selected, never to any other server.

## Supported AI Providers and Models

Each provider offers a tiered selection of models (fast, balanced, powerful).

### OpenAI
- **Models**: GPT-5.4 Nano (fast), GPT-5.4 Mini (balanced), GPT-5.4 (powerful)
- **API Key**: [Get your OpenAI API key](https://platform.openai.com/api-keys)
- **Pricing**: [OpenAI pricing information](https://openai.com/pricing)
- **Best for**: High-quality, coherent, and reliable prompts

### Anthropic
- **Models**: Claude Haiku 4.5 (fast), Claude Sonnet 4.6 (balanced), Claude Opus 4.7 (powerful)
- **API Key**: [Get your Anthropic API key](https://console.anthropic.com/account/keys)
- **Pricing**: [Anthropic pricing information](https://www.anthropic.com/pricing)
- **Best for**: Detailed, nuanced prompts with creative elements

### HuggingFace
- **Models**: Llama 3.1 8B (fast), Llama 3.3 70B (balanced), Qwen 2.5 72B (powerful)
- **API Key**: [Get your HuggingFace API key](https://huggingface.co/settings/tokens)
- **Pricing**: [HuggingFace Inference Providers pricing](https://huggingface.co/docs/inference-providers/pricing)
- **Best for**: Access to a variety of open-source models, routed via any available Inference Provider

### Novita AI
- **Models**: Llama 3.2 3B (fast), Llama 3.3 70B (balanced), Llama 4 Scout 17B (powerful)
- **API Key**: [Get your Novita API key](https://novita.ai/)
- **Pricing**: [Novita pricing information](https://novita.ai/pricing)
- **Best for**: Cost-effective access to Llama models

### OpenRouter
- **Models**: Gemini 3 Flash (fast), Gemini 3 Pro (balanced), Gemini 3.1 Pro (powerful)
- **API Key**: [Get your OpenRouter API key](https://openrouter.ai/keys)
- **Pricing**: [OpenRouter pricing information](https://openrouter.ai/pricing)
- **Best for**: Flexibility to access multiple models through a single API

## Tech Stack

React 19, TypeScript, Vite 6, Tailwind CSS 3, Radix UI, TanStack Query, Zustand, Vitest.

## Setup and Installation

### Prerequisites

- Node.js 20+ and npm

### Installation

1. Clone this repository:
```bash
git clone https://github.com/sapochat/prompty.git
cd prompty
```

2. Install dependencies:
```bash
npm install
```

3. (Optional, dev-only) Create a `.env` for pre-populating keys during local development:
```bash
cp .env.example .env
```

> **Warning:** Vite inlines `VITE_*` environment variables into the built JavaScript bundle. Do **not** put production API keys in `.env` for a deployed build — anyone who downloads the JS will see them. For everyday use, add keys through the in-app settings UI; those keys live in `localStorage` on your own machine.

### Running the App

Start the development server:

```bash
npm run dev
```

The application will be available at http://localhost:8080.

## Configuration

### Using API Keys

You can:
1. Add API keys through the application's settings menu (gear icon in the header) — recommended.
2. Or, for local development only, pre-populate keys in a `.env` file (see warning above).

Keys added via the UI are stored in your browser's `localStorage` and are only ever sent to the provider you selected.

## Development

### Project Structure

- `/src` - Application source code
  - `/components` - React components (including shadcn-style `/ui` primitives)
  - `/hooks` - Custom React hooks
  - `/lib` - Shared library code (e.g. the TanStack `QueryClient` singleton)
  - `/pages` - Route-level page components
  - `/services` - API services and data handling, incl. `/api` per-provider adapters
  - `/stores` - Zustand stores for client state (prompt config, history, generation)
  - `/types` - TypeScript type definitions
  - `/utils` - Utility functions (crypto, logger, string helpers, prompt data)

### Scripts

```bash
npm run dev            # Dev server on :8080
npm run build          # Production build to ./dist
npm run preview        # Serve the built ./dist locally
npm run lint           # ESLint
npm run test           # Vitest in watch mode
npm run test:run       # Vitest single run
npm run test:coverage  # Vitest with v8 coverage report
```

## Deployment

### Local Deployment

You can build the app and serve it locally:

```bash
npm run build
npm run preview
```

### Web Deployment

You can deploy the built application to any static hosting service like Netlify, Vercel, GitHub Pages, etc.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
