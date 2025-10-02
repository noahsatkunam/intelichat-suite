import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ModelInfo {
  model_name: string;
  display_name: string;
  description?: string;
  max_context_length?: number;
  supports_vision?: boolean;
  supports_function_calling?: boolean;
  cost_per_1k_input_tokens?: number;
  cost_per_1k_output_tokens?: number;
  capability_tier?: 'flagship' | 'standard' | 'fast' | 'lightweight';
  modality?: 'text' | 'vision' | 'multimodal';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting nightly provider model refresh...');

    // Fetch all active providers
    const { data: providers, error: providersError } = await supabase
      .from('ai_providers')
      .select('*')
      .eq('is_active', true);

    if (providersError) throw providersError;

    let totalAdded = 0;
    let totalUpdated = 0;
    let totalDeprecated = 0;
    const results: any[] = [];

    for (const provider of providers || []) {
      try {
        console.log(`Refreshing models for provider: ${provider.name} (${provider.type})`);
        
        const models = await fetchProviderModels(provider);
        const stats = await updateProviderModels(supabase, provider.type, models);
        
        totalAdded += stats.added;
        totalUpdated += stats.updated;
        totalDeprecated += stats.deprecated;

        results.push({
          provider: provider.name,
          type: provider.type,
          ...stats,
          success: true
        });

        console.log(`✓ ${provider.name}: +${stats.added} added, ~${stats.updated} updated, -${stats.deprecated} deprecated`);
      } catch (error) {
        console.error(`✗ Failed to refresh ${provider.name}:`, error);
        results.push({
          provider: provider.name,
          type: provider.type,
          success: false,
          error: error.message
        });
      }
    }

    // Log the refresh results
    await supabase.from('ai_provider_audit_log').insert({
      action: 'model_refresh',
      details: {
        timestamp: new Date().toISOString(),
        total_added: totalAdded,
        total_updated: totalUpdated,
        total_deprecated: totalDeprecated,
        providers_processed: providers?.length || 0,
        results
      }
    });

    console.log(`Model refresh complete: ${totalAdded} added, ${totalUpdated} updated, ${totalDeprecated} deprecated`);

    return new Response(
      JSON.stringify({
        success: true,
        summary: {
          total_added: totalAdded,
          total_updated: totalUpdated,
          total_deprecated: totalDeprecated,
          providers_processed: providers?.length || 0
        },
        results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Model refresh error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function fetchProviderModels(provider: any): Promise<ModelInfo[]> {
  const apiKey = provider.api_key_encrypted;

  switch (provider.type) {
    case 'openai':
      return await fetchOpenAIModels(apiKey);
    case 'anthropic':
      return await fetchAnthropicModels(apiKey);
    case 'google':
      return await fetchGoogleModels(apiKey);
    case 'mistral':
      return await fetchMistralModels(apiKey);
    case 'meta':
      return await fetchMetaModels(apiKey);
    case 'xai':
      return await fetchXaiModels(apiKey);
    case 'ollama':
      return await fetchOllamaModels(provider);
    case 'custom':
      return await fetchCustomModels(provider);
    default:
      throw new Error(`Unsupported provider type: ${provider.type}`);
  }
}

async function fetchOpenAIModels(apiKey: string): Promise<ModelInfo[]> {
  const response = await fetch('https://api.openai.com/v1/models', {
    headers: { 'Authorization': `Bearer ${apiKey}` }
  });

  if (!response.ok) throw new Error(`OpenAI API error: ${response.status}`);

  const data = await response.json();
  return data.data
    .filter((m: any) => m.id.includes('gpt') || m.id.includes('o1') || m.id.includes('o3') || m.id.includes('o4'))
    .map((m: any) => ({
      model_name: m.id,
      display_name: formatModelName(m.id),
      description: `OpenAI ${formatModelName(m.id)}`,
      max_context_length: getOpenAIContextLength(m.id),
      supports_vision: m.id.includes('vision') || m.id.includes('gpt-4o') || m.id.includes('gpt-4-turbo') || m.id.includes('o3') || m.id.includes('o4'),
      supports_function_calling: true,
      cost_per_1k_input_tokens: getOpenAICost(m.id, 'input'),
      cost_per_1k_output_tokens: getOpenAICost(m.id, 'output'),
      capability_tier: getOpenAICapability(m.id),
      modality: (m.id.includes('vision') || m.id.includes('gpt-4o') || m.id.includes('gpt-4-turbo') || m.id.includes('o3') || m.id.includes('o4')) ? 'multimodal' : 'text'
    }));
}

function getOpenAICapability(modelId: string): 'flagship' | 'standard' | 'fast' | 'lightweight' {
  if (modelId.includes('o3') || modelId.includes('o4') || modelId.includes('gpt-5')) return 'flagship';
  if (modelId.includes('gpt-4o') || modelId.includes('gpt-4-turbo') || modelId.includes('o1-preview')) return 'standard';
  if (modelId.includes('gpt-4o-mini') || modelId.includes('o1-mini')) return 'fast';
  if (modelId.includes('gpt-3.5') || modelId.includes('nano')) return 'lightweight';
  return 'standard';
}

async function fetchAnthropicModels(apiKey: string): Promise<ModelInfo[]> {
  // Anthropic doesn't have a models list endpoint, use known models
  return [
    {
      model_name: 'claude-opus-4-1-20250805',
      display_name: 'Claude Opus 4.1',
      description: 'Most capable Claude model with superior reasoning',
      max_context_length: 200000,
      supports_vision: true,
      supports_function_calling: true,
      cost_per_1k_input_tokens: 0.015,
      cost_per_1k_output_tokens: 0.075,
      capability_tier: 'flagship',
      modality: 'multimodal'
    },
    {
      model_name: 'claude-sonnet-4-20250514',
      display_name: 'Claude Sonnet 4',
      description: 'High-performance model with exceptional reasoning',
      max_context_length: 200000,
      supports_vision: true,
      supports_function_calling: true,
      cost_per_1k_input_tokens: 0.003,
      cost_per_1k_output_tokens: 0.015,
      capability_tier: 'flagship',
      modality: 'multimodal'
    },
    {
      model_name: 'claude-3-5-sonnet-20241022',
      display_name: 'Claude 3.5 Sonnet',
      description: 'Most intelligent Claude 3 model',
      max_context_length: 200000,
      supports_vision: true,
      supports_function_calling: true,
      cost_per_1k_input_tokens: 0.003,
      cost_per_1k_output_tokens: 0.015,
      capability_tier: 'standard',
      modality: 'multimodal'
    },
    {
      model_name: 'claude-3-5-haiku-20241022',
      display_name: 'Claude 3.5 Haiku',
      description: 'Fast and efficient Claude',
      max_context_length: 200000,
      supports_vision: true,
      supports_function_calling: true,
      cost_per_1k_input_tokens: 0.001,
      cost_per_1k_output_tokens: 0.005,
      capability_tier: 'fast',
      modality: 'multimodal'
    },
    {
      model_name: 'claude-3-opus-20240229',
      display_name: 'Claude 3 Opus',
      description: 'Most powerful Claude 3 model',
      max_context_length: 200000,
      supports_vision: true,
      supports_function_calling: true,
      cost_per_1k_input_tokens: 0.015,
      cost_per_1k_output_tokens: 0.075,
      capability_tier: 'flagship',
      modality: 'multimodal'
    },
    {
      model_name: 'claude-3-sonnet-20240229',
      display_name: 'Claude 3 Sonnet',
      description: 'Balanced Claude 3 model',
      max_context_length: 200000,
      supports_vision: true,
      supports_function_calling: true,
      cost_per_1k_input_tokens: 0.003,
      cost_per_1k_output_tokens: 0.015,
      capability_tier: 'standard',
      modality: 'multimodal'
    },
    {
      model_name: 'claude-3-haiku-20240307',
      display_name: 'Claude 3 Haiku',
      description: 'Fastest Claude 3 model',
      max_context_length: 200000,
      supports_vision: true,
      supports_function_calling: true,
      cost_per_1k_input_tokens: 0.00025,
      cost_per_1k_output_tokens: 0.00125,
      capability_tier: 'fast',
      modality: 'multimodal'
    }
  ];
}

async function fetchGoogleModels(apiKey: string): Promise<ModelInfo[]> {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
  
  if (!response.ok) throw new Error(`Google API error: ${response.status}`);

  const data = await response.json();
  return data.models
    .filter((m: any) => m.supportedGenerationMethods?.includes('generateContent'))
    .map((m: any) => {
      const modelName = m.name.replace('models/', '');
      const isVision = m.name.includes('vision') || m.name.includes('gemini-1.5') || m.name.includes('gemini-2.0') || m.name.includes('gemini-2.5');
      return {
        model_name: modelName,
        display_name: formatModelName(m.displayName || m.name),
        description: m.description || `Google ${formatModelName(m.displayName || m.name)}`,
        max_context_length: m.inputTokenLimit || 32000,
        supports_vision: isVision,
        supports_function_calling: true,
        cost_per_1k_input_tokens: getGoogleCost(m.name, 'input'),
        cost_per_1k_output_tokens: getGoogleCost(m.name, 'output'),
        capability_tier: getGoogleCapability(modelName),
        modality: isVision ? 'multimodal' : 'text'
      };
    });
}

function getGoogleCapability(modelName: string): 'flagship' | 'standard' | 'fast' | 'lightweight' {
  if (modelName.includes('pro') || modelName.includes('2.5-pro')) return 'flagship';
  if (modelName.includes('flash') && !modelName.includes('lite')) return 'fast';
  if (modelName.includes('lite') || modelName.includes('nano')) return 'lightweight';
  return 'standard';
}

async function fetchMistralModels(apiKey: string): Promise<ModelInfo[]> {
  const response = await fetch('https://api.mistral.ai/v1/models', {
    headers: { 'Authorization': `Bearer ${apiKey}` }
  });

  if (!response.ok) throw new Error(`Mistral API error: ${response.status}`);

  const data = await response.json();
  return data.data.map((m: any) => ({
    model_name: m.id,
    display_name: formatModelName(m.id),
    description: m.description || `Mistral ${formatModelName(m.id)}`,
    max_context_length: m.max_context_length || 32000,
    supports_vision: false,
    supports_function_calling: m.capabilities?.includes('function_calling') || true,
    cost_per_1k_input_tokens: getMistralCost(m.id, 'input'),
    cost_per_1k_output_tokens: getMistralCost(m.id, 'output')
  }));
}

async function fetchMetaModels(apiKey: string): Promise<ModelInfo[]> {
  // Meta models via Together AI
  const response = await fetch('https://api.together.xyz/v1/models', {
    headers: { 'Authorization': `Bearer ${apiKey}` }
  });

  if (!response.ok) throw new Error(`Together AI API error: ${response.status}`);

  const data = await response.json();
  return data
    .filter((m: any) => m.id.includes('llama'))
    .map((m: any) => ({
      model_name: m.id,
      display_name: formatModelName(m.display_name || m.id),
      description: m.description || `Meta ${formatModelName(m.id)}`,
      max_context_length: m.context_length || 128000,
      supports_vision: m.id.includes('vision'),
      supports_function_calling: true,
      cost_per_1k_input_tokens: m.pricing?.input || 0.0002,
      cost_per_1k_output_tokens: m.pricing?.output || 0.0002
    }));
}

async function fetchXaiModels(apiKey: string): Promise<ModelInfo[]> {
  const response = await fetch('https://api.x.ai/v1/models', {
    headers: { 'Authorization': `Bearer ${apiKey}` }
  });

  if (!response.ok) throw new Error(`xAI API error: ${response.status}`);

  const data = await response.json();
  return data.data.map((m: any) => ({
    model_name: m.id,
    display_name: formatModelName(m.id),
    description: `xAI ${formatModelName(m.id)}`,
    max_context_length: m.context_length || 128000,
    supports_vision: m.id.includes('vision'),
    supports_function_calling: true,
    cost_per_1k_input_tokens: 0.005,
    cost_per_1k_output_tokens: 0.015
  }));
}

async function fetchOllamaModels(provider: any): Promise<ModelInfo[]> {
  const baseUrl = provider.base_url || 'http://localhost:11434';
  const response = await fetch(`${baseUrl}/api/tags`);

  if (!response.ok) throw new Error(`Ollama API error: ${response.status}`);

  const data = await response.json();
  return data.models.map((m: any) => ({
    model_name: m.name,
    display_name: formatModelName(m.name),
    description: `Ollama ${formatModelName(m.name)}`,
    max_context_length: 4096,
    supports_vision: m.name.includes('vision') || m.name.includes('llava'),
    supports_function_calling: false,
    cost_per_1k_input_tokens: 0,
    cost_per_1k_output_tokens: 0
  }));
}

async function fetchCustomModels(provider: any): Promise<ModelInfo[]> {
  // For custom providers, return a default model entry
  return [{
    model_name: 'custom-model',
    display_name: 'Custom Model',
    description: 'Custom provider model',
    max_context_length: 4096,
    supports_vision: false,
    supports_function_calling: true
  }];
}

async function updateProviderModels(
  supabase: any,
  providerType: string,
  newModels: ModelInfo[]
): Promise<{ added: number; updated: number; deprecated: number }> {
  // Fetch existing models for this provider
  const { data: existingModels } = await supabase
    .from('provider_models')
    .select('*')
    .eq('provider_type', providerType);

  const existingMap = new Map(
    (existingModels || []).map((m: any) => [m.model_name, m])
  );
  const newModelNames = new Set(newModels.map(m => m.model_name));

  let added = 0;
  let updated = 0;
  let deprecated = 0;

  // Insert or update new models
  for (const model of newModels) {
    const existing = existingMap.get(model.model_name);

    if (!existing) {
      // Insert new model
      await supabase.from('provider_models').insert({
        provider_type: providerType,
        model_name: model.model_name,
        display_name: model.display_name,
        description: model.description,
        max_context_length: model.max_context_length,
        supports_vision: model.supports_vision,
        supports_function_calling: model.supports_function_calling,
        cost_per_1k_input_tokens: model.cost_per_1k_input_tokens,
        cost_per_1k_output_tokens: model.cost_per_1k_output_tokens,
        capability_tier: model.capability_tier || 'standard',
        modality: model.modality || 'text',
        is_deprecated: false
      });
      added++;
    } else if (existing.is_deprecated) {
      // Reactivate previously deprecated model
      await supabase
        .from('provider_models')
        .update({
          ...model,
          is_deprecated: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id);
      updated++;
    } else {
      // Update existing model metadata
      await supabase
        .from('provider_models')
        .update({
          display_name: model.display_name,
          description: model.description,
          max_context_length: model.max_context_length,
          supports_vision: model.supports_vision,
          supports_function_calling: model.supports_function_calling,
          cost_per_1k_input_tokens: model.cost_per_1k_input_tokens,
          cost_per_1k_output_tokens: model.cost_per_1k_output_tokens,
          capability_tier: model.capability_tier || existing.capability_tier || 'standard',
          modality: model.modality || existing.modality || 'text',
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id);
      updated++;
    }
  }

  // Mark removed models as deprecated
  for (const [modelName, existing] of existingMap) {
    if (!newModelNames.has(modelName) && !existing.is_deprecated) {
      await supabase
        .from('provider_models')
        .update({
          is_deprecated: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id);
      deprecated++;
    }
  }

  return { added, updated, deprecated };
}

// Helper functions
function formatModelName(name: string): string {
  return name
    .replace(/[-_]/g, ' ')
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function getOpenAIContextLength(modelId: string): number {
  if (modelId.includes('gpt-4o')) return 128000;
  if (modelId.includes('gpt-4-turbo')) return 128000;
  if (modelId.includes('gpt-4')) return 8192;
  if (modelId.includes('gpt-3.5-turbo')) return 16385;
  if (modelId.includes('o1')) return 200000;
  return 4096;
}

function getOpenAICost(modelId: string, type: 'input' | 'output'): number {
  const costs: Record<string, [number, number]> = {
    'gpt-4o': [0.0025, 0.01],
    'gpt-4o-mini': [0.00015, 0.0006],
    'gpt-4-turbo': [0.01, 0.03],
    'gpt-4': [0.03, 0.06],
    'gpt-3.5-turbo': [0.0005, 0.0015],
    'o1-preview': [0.015, 0.06],
    'o1-mini': [0.003, 0.012]
  };

  for (const [key, [input, output]] of Object.entries(costs)) {
    if (modelId.includes(key)) {
      return type === 'input' ? input : output;
    }
  }
  return 0;
}

function getGoogleCost(modelName: string, type: 'input' | 'output'): number {
  if (modelName.includes('gemini-1.5-pro')) return type === 'input' ? 0.00125 : 0.005;
  if (modelName.includes('gemini-1.5-flash')) return type === 'input' ? 0.000075 : 0.0003;
  if (modelName.includes('gemini-2.0')) return type === 'input' ? 0.001 : 0.004;
  return 0;
}

function getMistralCost(modelId: string, type: 'input' | 'output'): number {
  if (modelId.includes('large')) return type === 'input' ? 0.004 : 0.012;
  if (modelId.includes('medium')) return type === 'input' ? 0.0027 : 0.0081;
  if (modelId.includes('small')) return type === 'input' ? 0.001 : 0.003;
  return 0;
}
