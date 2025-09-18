export const providerModels = {
  openai: [
    { id: 'gpt-4o', name: 'GPT-4 Omni', description: 'Most capable GPT-4 model' },
    { id: 'gpt-4o-mini', name: 'GPT-4 Omni Mini', description: 'Fast and efficient model' },
    { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', description: 'Latest GPT-4 Turbo model' },
    { id: 'gpt-4', name: 'GPT-4', description: 'Original GPT-4 model' },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Fast and cost-effective' },
    { id: 'o1-preview', name: 'O1 Preview', description: 'Advanced reasoning model' },
    { id: 'o1-mini', name: 'O1 Mini', description: 'Smaller reasoning model' }
  ],
  anthropic: [
    { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', description: 'Most intelligent Claude model' },
    { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', description: 'Fast and efficient Claude' },
    { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', description: 'Most powerful Claude 3 model' },
    { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet', description: 'Balanced Claude 3 model' },
    { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', description: 'Fastest Claude 3 model' }
  ],
  google: [
    { id: 'gemini-1.5-pro-latest', name: 'Gemini 1.5 Pro', description: 'Most capable Gemini model' },
    { id: 'gemini-1.5-flash-latest', name: 'Gemini 1.5 Flash', description: 'Fast multimodal model' },
    { id: 'gemini-1.0-pro', name: 'Gemini 1.0 Pro', description: 'Original Gemini Pro model' },
    { id: 'text-bison-001', name: 'Text Bison', description: 'Text generation model' }
  ],
  mistral: [
    { id: 'mistral-large-latest', name: 'Mistral Large', description: 'Most powerful Mistral model' },
    { id: 'mistral-medium-latest', name: 'Mistral Medium', description: 'Balanced performance model' },
    { id: 'mistral-small-latest', name: 'Mistral Small', description: 'Fast and efficient model' },
    { id: 'mistral-tiny', name: 'Mistral Tiny', description: 'Lightweight model' },
    { id: 'codestral-latest', name: 'Codestral', description: 'Code generation specialist' }
  ],
  ollama: [
    { id: 'llama3.1:8b', name: 'Llama 3.1 8B', description: 'Meta\'s latest 8B model' },
    { id: 'llama3.1:70b', name: 'Llama 3.1 70B', description: 'Meta\'s latest 70B model' },
    { id: 'llama3.1:405b', name: 'Llama 3.1 405B', description: 'Meta\'s largest model' },
    { id: 'mistral:7b', name: 'Mistral 7B', description: 'Open source Mistral model' },
    { id: 'codellama:7b', name: 'Code Llama 7B', description: 'Code generation model' },
    { id: 'phi3:mini', name: 'Phi-3 Mini', description: 'Microsoft\'s compact model' }
  ],
  custom: [
    { id: 'gpt-4o', name: 'GPT-4 Compatible', description: 'OpenAI compatible model' },
    { id: 'claude-3-sonnet', name: 'Claude Compatible', description: 'Anthropic compatible model' },
    { id: 'custom-model', name: 'Custom Model', description: 'Your custom model' }
  ]
};