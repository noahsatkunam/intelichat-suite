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

    let healthy = false;
    let errorMessage = '';

    try {
      // Test the provider based on type
      switch (provider.type) {
        case 'openai':
          healthy = await testOpenAI(provider.api_key_encrypted, provider.config);
          break;
        case 'anthropic':
          healthy = await testAnthropic(provider.api_key_encrypted, provider.config);
          break;
        case 'google':
          healthy = await testGoogle(provider.api_key_encrypted, provider.config);
          break;
        case 'mistral':
          healthy = await testMistral(provider.api_key_encrypted, provider.config);
          break;
        case 'custom':
          healthy = await testCustom(provider.api_key_encrypted, provider.config);
          break;
        case 'ollama':
          healthy = await testOllama(provider.config);
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
        details: { healthy, error_message: errorMessage },
        user_id: null
      });

    return new Response(JSON.stringify({ 
      healthy, 
      error_message: errorMessage,
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

async function testOpenAI(apiKey: string, config: any): Promise<boolean> {
  const response = await fetch('https://api.openai.com/v1/models', {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  });
  return response.ok;
}

async function testAnthropic(apiKey: string, config: any): Promise<boolean> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: config.model || 'claude-3-haiku-20240307',
      max_tokens: 1,
      messages: [{ role: 'user', content: 'test' }]
    }),
  });
  return response.status !== 401 && response.status !== 403;
}

async function testGoogle(apiKey: string, config: any): Promise<boolean> {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
  return response.ok;
}

async function testMistral(apiKey: string, config: any): Promise<boolean> {
  const response = await fetch('https://api.mistral.ai/v1/models', {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  });
  return response.ok;
}

async function testCustom(apiKey: string, config: any): Promise<boolean> {
  if (!config.endpoint_url) {
    throw new Error('Custom provider requires endpoint_url in config');
  }
  
  const response = await fetch(`${config.endpoint_url}/models`, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  });
  return response.ok;
}

async function testOllama(config: any): Promise<boolean> {
  const endpoint = config.endpoint_url || 'http://localhost:11434';
  const response = await fetch(`${endpoint}/api/tags`);
  return response.ok;
}