# Prompty

A locally-runnable AI prompt generator with secure API key management.

## Features

- Generate AI prompts for various models (OpenAI, Anthropic, HuggingFace, Novita, OpenRouter)
- Local storage of API keys (never sent to any server)
- Customizable prompt categories and parameters
- Prompt history management
- Batch prompt generation
- Works completely offline (except for API calls to model providers)
- No user accounts or authentication needed

## How It Works

1. **Add your API keys** - Enter your API keys for the services you want to use
2. **Choose your model** - Select from various AI models
3. **Configure your prompt** - Set categories, styles, and parameters
4. **Generate** - Create prompts with a single click
5. **View history** - Access all your previously generated prompts

All data is stored locally in your browser - your API keys never leave your computer.

## Supported AI Providers and Models

### OpenAI
- **Models**: GPT-4, GPT-3.5-Turbo
- **API Key**: [Get your OpenAI API key](https://platform.openai.com/api-keys)
- **Pricing**: [OpenAI pricing information](https://openai.com/pricing)
- **Best for**: High-quality, coherent, and reliable prompts

### Anthropic
- **Models**: Claude 3 Opus, Claude 3 Sonnet, Claude 3 Haiku
- **API Key**: [Get your Anthropic API key](https://console.anthropic.com/account/keys)
- **Pricing**: [Anthropic pricing information](https://www.anthropic.com/pricing)
- **Best for**: Detailed, nuanced prompts with creative elements

### HuggingFace
- **Models**: Various open models including Mistral, Llama, Falcon, etc.
- **API Key**: [Get your HuggingFace API key](https://huggingface.co/settings/tokens)
- **Pricing**: [HuggingFace Inference API pricing](https://huggingface.co/pricing)
- **Best for**: Access to a variety of open-source models

### Novita AI
- **Models**: Llama 4 Maverick
- **API Key**: [Get your Novita API key](https://novita.ai/)
- **Pricing**: [Novita pricing information](https://novita.ai/pricing)
- **Best for**: State-of-the-art image generation prompts

### OpenRouter
- **Models**: Access to numerous models across providers
- **API Key**: [Get your OpenRouter API key](https://openrouter.ai/keys)
- **Pricing**: [OpenRouter pricing information](https://openrouter.ai/pricing)
- **Best for**: Flexibility to access multiple models through a single API

## Setup and Installation

### Prerequisites

- Node.js 18+ and npm

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

3. Create a `.env` file (optional - you can add API keys through the UI later):
```bash
cp .env.example .env
```

### Running the App

Start the development server:

```bash
npm run dev
```

The application will be available at http://localhost:8080

## Configuration

### Using API Keys

You can:
1. Add API keys directly in the `.env` file before starting the app
2. Add API keys through the application's settings menu (gear icon in the header)

All keys are stored securely in your browser's localStorage and are never sent to any external server.

## Development

### Project Structure

- `/src` - Application source code
  - `/components` - React components
  - `/hooks` - Custom React hooks
  - `/pages` - Page components
  - `/services` - API services and data handling
  - `/utils` - Utility functions
  - `/types` - TypeScript type definitions

### Building for Production

```bash
npm run build
```

This will create a `dist` directory with the compiled application.

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
