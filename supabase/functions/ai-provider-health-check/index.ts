import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { provider_id } = await req.json();

    // Get provider details
    const { data: provider, error: providerError } = await supabase
      .from('ai_providers')
      .select('*')
      .eq('id', provider_id)
      .single();

    if (providerError) {
      throw new Error(`Provider not found: ${providerError.message}`);
    }

    if (!provider.api_key_encrypted) {
      throw new Error('Provider has no API key configured');
    }

    let healthy = false;
    let errorMessage = '';
    let availableModels: string[] = [];

    try {
      // Test the provider based on type and get available models
      switch (provider.type) {
        case 'openai':
          const openaiResult = await testOpenAI(provider.api_key_encrypted, provider);
          healthy = openaiResult.healthy;
          availableModels = openaiResult.models;
          break;
        case 'anthropic':
          const anthropicResult = await testAnthropic(provider.api_key_encrypted, provider);
          healthy = anthropicResult.healthy;
          availableModels = anthropicResult.models;
          break;
        case 'google':
          const googleResult = await testGoogle(provider.api_key_encrypted, provider);
          healthy = googleResult.healthy;
          availableModels = googleResult.models;
          break;
        case 'mistral':
          const mistralResult = await testMistral(provider.api_key_encrypted, provider);
          healthy = mistralResult.healthy;
          availableModels = mistralResult.models;
          break;
        case 'meta':
          const metaResult = await testMeta(provider.api_key_encrypted, provider);
          healthy = metaResult.healthy;
          availableModels = metaResult.models;
          break;
        case 'xai':
          const xaiResult = await testXai(provider.api_key_encrypted, provider);
          healthy = xaiResult.healthy;
          availableModels = xaiResult.models;
          break;
        case 'custom':
          const customResult = await testCustom(provider.api_key_encrypted, provider);
          healthy = customResult.healthy;
          availableModels = customResult.models;
          break;
        case 'ollama':
          const ollamaResult = await testOllama(provider);
          healthy = ollamaResult.healthy;
          availableModels = ollamaResult.models;
          break;
        default:
          throw new Error(`Unsupported provider type: ${provider.type}`);
      }
    } catch (error) {
      console.error(`Health check failed for provider ${provider_id}:`, error);
      healthy = false;
      errorMessage = error instanceof Error ? error.message : 'Unknown error';
    }

    // Update provider health status
    const { error: updateError } = await supabase
      .from('ai_providers')
      .update({
        is_healthy: healthy,
        last_health_check: new Date().toISOString()
      })
      .eq('id', provider_id);

    if (updateError) {
      console.error('Failed to update provider health:', updateError);
    }

    // Log the health check
    await supabase
      .from('ai_provider_audit_log')
      .insert({
        provider_id,
        action: 'health_check',
        details: { 
          healthy, 
          error_message: errorMessage,
          models_found: availableModels.length,
          models: availableModels 
        },
        user_id: null
      });

    return new Response(JSON.stringify({ 
      healthy, 
      error_message: errorMessage,
      available_models: availableModels,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Health check error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function testOpenAI(apiKey: string, provider: any): Promise<{healthy: boolean, models: string[]}> {
  const response = await fetch('https://api.openai.com/v1/models', {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    return { healthy: false, models: [] };
  }
  
  const data = await response.json();
  const models = data.data?.map((model: any) => model.id) || [];
  return { healthy: true, models };
}

async function testAnthropic(apiKey: string, provider: any): Promise<{healthy: boolean, models: string[]}> {
  // Anthropic doesn't have a models endpoint, so we test with a simple message
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 1,
      messages: [{ role: 'user', content: 'test' }]
    }),
  });
  
  const healthy = response.status !== 401 && response.status !== 403;
  const models = healthy ? [
    'claude-3-5-sonnet-20241022',
    'claude-3-5-haiku-20241022',
    'claude-3-opus-20240229'
  ] : [];
  
  return { healthy, models };
}

async function testGoogle(apiKey: string, provider: any): Promise<{healthy: boolean, models: string[]}> {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
  
  if (!response.ok) {
    return { healthy: false, models: [] };
  }
  
  const data = await response.json();
  const models = data.models?.map((model: any) => model.name?.replace('models/', '')) || [];
  return { healthy: true, models };
}

async function testMistral(apiKey: string, provider: any): Promise<{healthy: boolean, models: string[]}> {
  const response = await fetch('https://api.mistral.ai/v1/models', {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    return { healthy: false, models: [] };
  }
  
  const data = await response.json();
  const models = data.data?.map((model: any) => model.id) || [];
  return { healthy: true, models };
}

async function testMeta(apiKey: string, provider: any): Promise<{healthy: boolean, models: string[]}> {
  // Meta/Together AI endpoint
  const response = await fetch('https://api.together.xyz/v1/models', {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    return { healthy: false, models: [] };
  }
  
  const data = await response.json();
  const models = data.data?.filter((model: any) => model.id.includes('llama')).map((model: any) => model.id) || [];
  return { healthy: true, models };
}

async function testXai(apiKey: string, provider: any): Promise<{healthy: boolean, models: string[]}> {
  const response = await fetch('https://api.x.ai/v1/models', {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    return { healthy: false, models: [] };
  }
  
  const data = await response.json();
  const models = data.data?.map((model: any) => model.id) || [];
  return { healthy: true, models };
}

async function testCustom(apiKey: string, provider: any): Promise<{healthy: boolean, models: string[]}> {
  if (!provider.base_url) {
    throw new Error('Custom provider requires base_url');
  }
  
  const response = await fetch(`${provider.base_url}/models`, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      ...(provider.custom_headers || {})
    },
  });
  
  if (!response.ok) {
    return { healthy: false, models: [] };
  }
  
  const data = await response.json();
  const models = data.data?.map((model: any) => model.id) || [];
  return { healthy: true, models };
}

async function testOllama(provider: any): Promise<{healthy: boolean, models: string[]}> {
  const endpoint = provider.base_url || 'http://localhost:11434';
  const response = await fetch(`${endpoint}/api/tags`);
  
  if (!response.ok) {
    return { healthy: false, models: [] };
  }
  
  const data = await response.json();
  const models = data.models?.map((model: any) => model.name) || [];
  return { healthy: true, models };
}