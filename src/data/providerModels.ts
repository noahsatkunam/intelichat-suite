export const providerModels = {
  openai: [
    { id: 'gpt-4o', name: 'GPT-4 Omni', description: 'Most capable GPT-4 model', capability: 'standard', modality: 'multimodal' },
    { id: 'gpt-4o-mini', name: 'GPT-4 Omni Mini', description: 'Fast and efficient model', capability: 'fast', modality: 'multimodal' },
    { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', description: 'Latest GPT-4 Turbo model', capability: 'standard', modality: 'multimodal' },
    { id: 'gpt-4', name: 'GPT-4', description: 'Original GPT-4 model', capability: 'standard', modality: 'text' },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Fast and cost-effective', capability: 'lightweight', modality: 'text' },
    { id: 'o1-preview', name: 'O1 Preview', description: 'Advanced reasoning model', capability: 'flagship', modality: 'text' },
    { id: 'o1-mini', name: 'O1 Mini', description: 'Smaller reasoning model', capability: 'fast', modality: 'text' }
  ],
  anthropic: [
    { id: 'claude-opus-4-1-20250805', name: 'Claude Opus 4.1', description: 'Most capable Claude model', capability: 'flagship', modality: 'multimodal' },
    { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4', description: 'High-performance reasoning', capability: 'flagship', modality: 'multimodal' },
    { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', description: 'Most intelligent Claude model', capability: 'standard', modality: 'multimodal' },
    { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', description: 'Fast and efficient Claude', capability: 'fast', modality: 'multimodal' },
    { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', description: 'Most powerful Claude 3 model', capability: 'flagship', modality: 'multimodal' },
    { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet', description: 'Balanced Claude 3 model', capability: 'standard', modality: 'multimodal' },
    { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', description: 'Fastest Claude 3 model', capability: 'fast', modality: 'multimodal' }
  ],
  google: [
    { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', description: 'Most capable Gemini model', capability: 'flagship', modality: 'multimodal' },
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', description: 'Fast multimodal model', capability: 'fast', modality: 'multimodal' },
    { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash Lite', description: 'Fastest Gemini model', capability: 'lightweight', modality: 'multimodal' },
    { id: 'gemini-1.5-pro-latest', name: 'Gemini 1.5 Pro', description: 'Previous generation flagship', capability: 'flagship', modality: 'multimodal' },
    { id: 'gemini-1.5-flash-latest', name: 'Gemini 1.5 Flash', description: 'Previous generation fast model', capability: 'fast', modality: 'multimodal' },
    { id: 'gemini-1.0-pro', name: 'Gemini 1.0 Pro', description: 'Original Gemini Pro model', capability: 'standard', modality: 'text' },
    { id: 'text-bison-001', name: 'Text Bison', description: 'Text generation model', capability: 'standard', modality: 'text' }
  ],
  mistral: [
    { id: 'mistral-large-latest', name: 'Mistral Large', description: 'Most powerful Mistral model', capability: 'flagship', modality: 'text' },
    { id: 'mistral-medium-latest', name: 'Mistral Medium', description: 'Balanced performance model', capability: 'standard', modality: 'text' },
    { id: 'mistral-small-latest', name: 'Mistral Small', description: 'Fast and efficient model', capability: 'fast', modality: 'text' },
    { id: 'mistral-tiny', name: 'Mistral Tiny', description: 'Lightweight model', capability: 'lightweight', modality: 'text' },
    { id: 'codestral-latest', name: 'Codestral', description: 'Code generation specialist', capability: 'standard', modality: 'text' }
  ],
  meta: [
    { id: 'llama-3.1-405b-instruct', name: 'Llama 3.1 405B', description: 'Meta\'s largest and most capable model', capability: 'flagship', modality: 'text' },
    { id: 'llama-3.1-70b-instruct', name: 'Llama 3.1 70B', description: 'High-performance balanced model', capability: 'standard', modality: 'text' },
    { id: 'llama-3.1-8b-instruct', name: 'Llama 3.1 8B', description: 'Fast and efficient model', capability: 'fast', modality: 'text' },
    { id: 'llama-3.2-90b-vision-instruct', name: 'Llama 3.2 90B Vision', description: 'Vision-capable model', capability: 'flagship', modality: 'multimodal' },
    { id: 'llama-3.2-11b-vision-instruct', name: 'Llama 3.2 11B Vision', description: 'Smaller vision model', capability: 'standard', modality: 'multimodal' }
  ],
  xai: [
    { id: 'grok-beta', name: 'Grok Beta', description: 'xAI\'s flagship conversational AI', capability: 'flagship', modality: 'text' },
    { id: 'grok-vision-beta', name: 'Grok Vision Beta', description: 'Grok with vision capabilities', capability: 'flagship', modality: 'multimodal' }
  ],
  ollama: [
    { id: 'llama3.1:8b', name: 'Llama 3.1 8B', description: 'Meta\'s latest 8B model', capability: 'fast', modality: 'text' },
    { id: 'llama3.1:70b', name: 'Llama 3.1 70B', description: 'Meta\'s latest 70B model', capability: 'standard', modality: 'text' },
    { id: 'llama3.1:405b', name: 'Llama 3.1 405B', description: 'Meta\'s largest model', capability: 'flagship', modality: 'text' },
    { id: 'mistral:7b', name: 'Mistral 7B', description: 'Open source Mistral model', capability: 'fast', modality: 'text' },
    { id: 'codellama:7b', name: 'Code Llama 7B', description: 'Code generation model', capability: 'fast', modality: 'text' },
    { id: 'phi3:mini', name: 'Phi-3 Mini', description: 'Microsoft\'s compact model', capability: 'lightweight', modality: 'text' }
  ],
  custom: [
    { id: 'gpt-4o', name: 'GPT-4 Compatible', description: 'OpenAI compatible model', capability: 'standard', modality: 'multimodal' },
    { id: 'claude-3-sonnet', name: 'Claude Compatible', description: 'Anthropic compatible model', capability: 'standard', modality: 'multimodal' },
    { id: 'custom-model', name: 'Custom Model', description: 'Your custom model', capability: 'standard', modality: 'text' }
  ]
};