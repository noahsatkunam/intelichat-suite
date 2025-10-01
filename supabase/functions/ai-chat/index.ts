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

    const { chatbot_id, message, conversation_id, user_id } = await req.json();

    // Get chatbot configuration
    const { data: chatbot, error: chatbotError } = await supabase
      .from('chatbots')
      .select(`
        *,
        primary_provider:primary_ai_provider_id(*),
        fallback_provider:fallback_ai_provider_id(*)
      `)
      .eq('id', chatbot_id)
      .eq('is_active', true)
      .single();

    if (chatbotError || !chatbot) {
      throw new Error('Chatbot not found or inactive');
    }

    let response = '';
    let provider_used = null;
    let model_used = '';
    let success = true;
    let error_message = '';
    const start_time = Date.now();

    try {
      // Try primary provider first
      if (chatbot.primary_provider) {
        try {
          const result = await callAIProvider(
            chatbot.primary_provider,
            message,
            chatbot.system_prompt,
            chatbot.model_name
          );
          response = result.response;
          provider_used = chatbot.primary_provider;
          model_used = result.model_used;
        } catch (error) {
          console.error('Primary provider failed:', error);
          
          // Try fallback provider
          if (chatbot.fallback_provider) {
            try {
              const result = await callAIProvider(
                chatbot.fallback_provider,
                message,
                chatbot.system_prompt,
                chatbot.model_name
              );
              response = result.response;
              provider_used = chatbot.fallback_provider;
              model_used = result.model_used;
            } catch (fallbackError) {
              console.error('Fallback provider failed:', fallbackError);
              
              // Try default OpenAI fallback
              const defaultResult = await callDefaultOpenAI(message, chatbot.system_prompt);
              response = defaultResult.response;
              model_used = defaultResult.model_used;
            }
          } else {
            // Try default OpenAI fallback
            const defaultResult = await callDefaultOpenAI(message, chatbot.system_prompt);
            response = defaultResult.response;
            model_used = defaultResult.model_used;
          }
        }
      } else {
        // Use default OpenAI
        const defaultResult = await callDefaultOpenAI(message, chatbot.system_prompt);
        response = defaultResult.response;
        model_used = defaultResult.model_used;
      }
    } catch (error) {
      success = false;
      error_message = error instanceof Error ? error.message : 'Unknown error';
      response = 'I apologize, but I\'m experiencing technical difficulties. Please try again later.';
    }

    const response_time = Date.now() - start_time;

    // Log usage
    await supabase
      .from('chatbot_usage')
      .insert({
        chatbot_id,
        user_id,
        ai_provider_id: provider_used?.id || null,
        model_used,
        response_time_ms: response_time,
        success,
        error_message: error_message || null
      });

    // Save message to conversation
    if (conversation_id) {
      await supabase
        .from('messages')
        .insert([
          {
            conversation_id,
            user_id,
            role: 'user',
            content: message
          },
          {
            conversation_id,
            user_id,
            role: 'assistant',
            content: response,
            metadata: {
              provider: provider_used?.name || 'OpenAI (Default)',
              model: model_used,
              response_time_ms: response_time
            }
          }
        ]);
    }

    return new Response(JSON.stringify({
      response,
      provider: provider_used?.name || 'OpenAI (Default)',
      model: model_used,
      response_time_ms: response_time
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('AI chat error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      response: 'I apologize, but I\'m experiencing technical difficulties. Please try again later.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function callAIProvider(provider: any, message: string, systemPrompt: string | null, modelOverride: string | null) {
  const model = modelOverride || provider.config?.model || 'gpt-4o';
  
  switch (provider.type) {
    case 'openai':
      return await callOpenAI(provider.api_key_encrypted, message, systemPrompt, model, provider.config);
    case 'anthropic':
      return await callAnthropic(provider.api_key_encrypted, message, systemPrompt, model, provider.config);
    case 'google':
      return await callGoogle(provider.api_key_encrypted, message, systemPrompt, model, provider.config);
    case 'mistral':
      return await callMistral(provider.api_key_encrypted, message, systemPrompt, model, provider.config);
    case 'custom':
      return await callCustom(provider.api_key_encrypted, message, systemPrompt, model, provider.config);
    case 'ollama':
      return await callOllama(message, systemPrompt, model, provider.config);
    default:
      throw new Error(`Unsupported provider type: ${provider.type}`);
  }
}

async function callOpenAI(apiKey: string, message: string, systemPrompt: string | null, model: string, config: any) {
  const messages = [];
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }
  messages.push({ role: 'user', content: message });

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      ...(config?.organization_id && { 'OpenAI-Organization': config.organization_id })
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: config?.max_tokens || 1000,
      temperature: config?.temperature || 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return {
    response: data.choices[0].message.content,
    model_used: model
  };
}

async function callAnthropic(apiKey: string, message: string, systemPrompt: string | null, model: string, config: any) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: config?.max_tokens || 1000,
      system: systemPrompt || undefined,
      messages: [{ role: 'user', content: message }]
    }),
  });

  if (!response.ok) {
    throw new Error(`Anthropic API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return {
    response: data.content[0].text,
    model_used: model
  };
}

async function callGoogle(apiKey: string, message: string, systemPrompt: string | null, model: string, config: any) {
  const prompt = systemPrompt ? `${systemPrompt}\n\nUser: ${message}` : message;
  
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }]
    }),
  });

  if (!response.ok) {
    throw new Error(`Google API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return {
    response: data.candidates[0].content.parts[0].text,
    model_used: model
  };
}

async function callMistral(apiKey: string, message: string, systemPrompt: string | null, model: string, config: any) {
  const messages = [];
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }
  messages.push({ role: 'user', content: message });

  const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: config?.max_tokens || 1000,
      temperature: config?.temperature || 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`Mistral API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return {
    response: data.choices[0].message.content,
    model_used: model
  };
}

async function callCustom(apiKey: string, message: string, systemPrompt: string | null, model: string, config: any) {
  const messages = [];
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }
  messages.push({ role: 'user', content: message });

  const response = await fetch(`${config.endpoint_url}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: config?.max_tokens || 1000,
      temperature: config?.temperature || 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`Custom API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return {
    response: data.choices[0].message.content,
    model_used: model
  };
}

async function callOllama(message: string, systemPrompt: string | null, model: string, config: any) {
  const endpoint = config.endpoint_url || 'http://localhost:11434';
  const prompt = systemPrompt ? `${systemPrompt}\n\nUser: ${message}\nAssistant:` : `User: ${message}\nAssistant:`;

  const response = await fetch(`${endpoint}/api/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      prompt,
      stream: false
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return {
    response: data.response,
    model_used: model
  };
}

async function callDefaultOpenAI(message: string, systemPrompt: string | null) {
  const openaiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiKey) {
    throw new Error('No OpenAI API key configured for fallback');
  }

  const messages = [];
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }
  messages.push({ role: 'user', content: message });

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages,
      max_tokens: 1000,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`Default OpenAI API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return {
    response: data.choices[0].message.content,
    model_used: 'gpt-4o'
  };
}