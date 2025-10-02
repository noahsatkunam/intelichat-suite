import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to adapt messages for different provider formats
function adaptMessagesForProvider(config: {
  providerType: string;
  systemPrompt: string;
  userMessage: string;
  history?: any[];
  attachments?: any[];
}) {
  const { providerType, systemPrompt, userMessage, history = [], attachments = [] } = config;

  switch (providerType) {
    case 'openai':
    case 'mistral':
    case 'meta':
    case 'xai':
    case 'custom':
      // OpenAI-compatible: system message in messages array
      return {
        messages: [
          { role: 'system', content: systemPrompt },
          ...history,
          { role: 'user', content: userMessage }
        ]
      };

    case 'anthropic':
      // Anthropic: system as top-level field, no system messages in array
      return {
        system: systemPrompt,
        messages: [
          ...history.filter((m: any) => m.role !== 'system'),
          { role: 'user', content: userMessage }
        ]
      };

    case 'google':
      // Google Gemini: systemInstruction field + contents array
      const contents = [
        ...history.filter((m: any) => m.role !== 'system').map((m: any) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }]
        })),
        {
          role: 'user',
          parts: [{ text: userMessage }]
        }
      ];

      // Add attachments if present (for multimodal)
      if (attachments.length > 0) {
        contents[contents.length - 1].parts.push(...attachments);
      }

      return {
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents
      };

    default:
      throw new Error(`Unsupported provider type: ${providerType}`);
  }
}

// Helper function to call OpenAI API
async function callOpenAI(apiKey: string, model: string, adaptedPayload: any, params: any) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: adaptedPayload.messages,
      max_tokens: params.max_tokens,
      temperature: params.temperature,
      top_p: params.top_p,
      frequency_penalty: params.frequency_penalty,
      presence_penalty: params.presence_penalty,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return {
    content: data.choices[0].message.content,
    model: data.model,
  };
}

// Helper function to call Anthropic API
async function callAnthropic(apiKey: string, model: string, adaptedPayload: any, params: any) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      system: adaptedPayload.system,
      messages: adaptedPayload.messages,
      max_tokens: params.max_tokens,
      temperature: params.temperature,
      top_p: params.top_p,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Anthropic API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return {
    content: data.content[0].text,
    model: data.model,
  };
}

// Helper function to call Google Gemini API
async function callGoogle(apiKey: string, model: string, adaptedPayload: any, params: any) {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      systemInstruction: adaptedPayload.systemInstruction,
      contents: adaptedPayload.contents,
      generationConfig: {
        temperature: params.temperature,
        topP: params.top_p,
        maxOutputTokens: params.max_tokens,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return {
    content: data.candidates[0].content.parts[0].text,
    model,
  };
}

// Helper function to call Mistral API
async function callMistral(apiKey: string, model: string, adaptedPayload: any, params: any) {
  const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: adaptedPayload.messages,
      max_tokens: params.max_tokens,
      temperature: params.temperature,
      top_p: params.top_p,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Mistral API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return {
    content: data.choices[0].message.content,
    model: data.model,
  };
}

// Helper function to call xAI API
async function callXai(apiKey: string, model: string, adaptedPayload: any, params: any) {
  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: adaptedPayload.messages,
      max_tokens: params.max_tokens,
      temperature: params.temperature,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`xAI API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return {
    content: data.choices[0].message.content,
    model: data.model,
  };
}

// Helper function to call custom provider
async function callCustom(provider: any, model: string, adaptedPayload: any, params: any) {
  const headers: any = {
    'Content-Type': 'application/json',
  };

  if (provider.api_key_encrypted) {
    headers['Authorization'] = `Bearer ${provider.api_key_encrypted}`;
  }

  if (provider.custom_headers) {
    Object.assign(headers, provider.custom_headers);
  }

  const response = await fetch(provider.base_url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model,
      messages: adaptedPayload.messages,
      max_tokens: params.max_tokens,
      temperature: params.temperature,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Custom provider error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return {
    content: data.choices[0].message.content,
    model: data.model || model,
  };
}

// Main routing function
async function callProvider(provider: any, model: string, adaptedPayload: any, params: any) {
  console.log(`Routing to provider: ${provider.name} (${provider.type})`);

  switch (provider.type) {
    case 'openai':
      return await callOpenAI(provider.api_key_encrypted, model, adaptedPayload, params);
    case 'anthropic':
      return await callAnthropic(provider.api_key_encrypted, model, adaptedPayload, params);
    case 'google':
      return await callGoogle(provider.api_key_encrypted, model, adaptedPayload, params);
    case 'mistral':
      return await callMistral(provider.api_key_encrypted, model, adaptedPayload, params);
    case 'xai':
      return await callXai(provider.api_key_encrypted, model, adaptedPayload, params);
    case 'custom':
      return await callCustom(provider, model, adaptedPayload, params);
    default:
      throw new Error(`Unsupported provider type: ${provider.type}`);
  }
}

// Helper function to validate model compatibility with provider
async function validateModelForProvider(supabase: any, providerType: string, modelName: string): Promise<boolean> {
  const { data: modelInfo } = await supabase
    .from('provider_models')
    .select('*')
    .eq('provider_type', providerType)
    .eq('model_name', modelName)
    .eq('is_deprecated', false)
    .maybeSingle();
  
  return !!modelInfo;
}

// Helper function to get supported models for a provider type
async function getSupportedModels(supabase: any, providerType: string): Promise<string[]> {
  const { data: models } = await supabase
    .from('provider_models')
    .select('model_name')
    .eq('provider_type', providerType)
    .eq('is_deprecated', false);
  
  return models?.map(m => m.model_name) || [];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { chatbot_id, message, conversation_id, attachments } = await req.json();

    console.log('Processing chat request:', { chatbot_id, conversation_id, has_attachments: !!attachments });

    // Get chatbot configuration
    const { data: chatbot, error: chatbotError } = await supabase
      .from('chatbots')
      .select('*')
      .eq('id', chatbot_id)
      .eq('is_active', true)
      .single();

    if (chatbotError || !chatbot) {
      console.error('Chatbot error:', chatbotError);
      throw new Error('Chatbot not found or inactive');
    }

    // Get provider configurations
    let primaryProvider = null;
    let fallbackProvider = null;

    if (chatbot.primary_ai_provider_id) {
      const { data } = await supabase
        .from('ai_providers')
        .select('*')
        .eq('id', chatbot.primary_ai_provider_id)
        .eq('is_active', true)
        .eq('is_healthy', true)
        .maybeSingle();
      primaryProvider = data;
    }

    if (chatbot.fallback_ai_provider_id) {
      const { data } = await supabase
        .from('ai_providers')
        .select('*')
        .eq('id', chatbot.fallback_ai_provider_id)
        .eq('is_active', true)
        .eq('is_healthy', true)
        .maybeSingle();
      fallbackProvider = data;
    }

    const model = chatbot.model_name || 'gpt-4o-mini';
    const fallbackModel = chatbot.fallback_model_name || model;

    // Validate model compatibility with providers
    let compatiblePrimaryProvider = null;
    let compatibleFallbackProvider = null;

    if (primaryProvider) {
      const isCompatible = await validateModelForProvider(supabase, primaryProvider.type, model);
      if (isCompatible) {
        compatiblePrimaryProvider = primaryProvider;
        console.log(`✓ Primary provider ${primaryProvider.name} supports model ${model}`);
      } else {
        const supportedModels = await getSupportedModels(supabase, primaryProvider.type);
        console.warn(`✗ Primary provider ${primaryProvider.name} does not support model ${model}. Supported models: ${supportedModels.join(', ')}`);
      }
    }

    if (fallbackProvider) {
      const isCompatible = await validateModelForProvider(supabase, fallbackProvider.type, fallbackModel);
      if (isCompatible) {
        compatibleFallbackProvider = fallbackProvider;
        console.log(`✓ Fallback provider ${fallbackProvider.name} supports model ${fallbackModel}`);
      } else {
        const supportedModels = await getSupportedModels(supabase, fallbackProvider.type);
        console.warn(`✗ Fallback provider ${fallbackProvider.name} does not support model ${fallbackModel}. Supported models: ${supportedModels.join(', ')}`);
      }
    }

    // Check if we have any compatible providers
    if (!compatiblePrimaryProvider && !compatibleFallbackProvider) {
      const errorMessage = primaryProvider || fallbackProvider
        ? `No compatible providers available. Model "${model}" is not supported by the configured providers.`
        : 'No active and healthy providers configured for this chatbot.';
      
      console.error(errorMessage);
      throw new Error(errorMessage);
    }

    console.log('Compatible providers:', {
      primary: compatiblePrimaryProvider?.name,
      fallback: compatibleFallbackProvider?.name,
    });

    // Get knowledge base documents for this chatbot
    const { data: knowledgeDocs } = await supabase
      .from('chatbot_knowledge')
      .select(`
        document_id,
        documents:document_id (
          id,
          filename,
          content,
          file_url
        )
      `)
      .eq('chatbot_id', chatbot_id);

    console.log('Knowledge base docs:', knowledgeDocs?.length || 0);

    // Build context from knowledge base
    let knowledgeContext = '';
    const citations: Array<{ title: string; url?: string }> = [];
    
    if (knowledgeDocs && knowledgeDocs.length > 0) {
      knowledgeContext = '\n\nKnowledge Base Context:\n';
      for (const doc of knowledgeDocs) {
        const document = (doc as any).documents;
        if (document && document.content) {
          knowledgeContext += `\nDocument: ${document.filename}\nContent: ${document.content.substring(0, 1000)}\n`;
          citations.push({
            title: document.filename,
            url: document.file_url
          });
        }
      }
    }

    // Prepare system prompt with knowledge base
    const systemPrompt = `${chatbot.system_prompt || 'You are a helpful AI assistant.'}\n${knowledgeContext}`;

    // Prepare parameters
    const params = {
      max_tokens: chatbot.max_tokens || 1000,
      temperature: chatbot.temperature || 0.7,
      top_p: chatbot.top_p || 1.0,
      frequency_penalty: chatbot.frequency_penalty || 0.0,
      presence_penalty: chatbot.presence_penalty || 0.0,
    };

    const startTime = Date.now();
    let aiResponse: string;
    let usedModel: string;
    let usedProvider: any = null;
    let providerName: string;

    // Try compatible primary provider first
    if (compatiblePrimaryProvider) {
      try {
        // Adapt messages for the provider's expected format
        const adaptedPayload = adaptMessagesForProvider({
          providerType: compatiblePrimaryProvider.type,
          systemPrompt,
          userMessage: message,
          history: [], // TODO: Add conversation history support
          attachments: attachments || []
        });

        const result = await callProvider(compatiblePrimaryProvider, model, adaptedPayload, params);
        aiResponse = result.content;
        usedModel = result.model;
        usedProvider = compatiblePrimaryProvider;
        providerName = compatiblePrimaryProvider.name;
        console.log(`✓ Primary provider succeeded: ${providerName}`);
      } catch (primaryError) {
        console.error(`✗ Primary provider failed: ${primaryError.message}`);
        
        // Try compatible fallback provider
        if (compatibleFallbackProvider) {
          try {
            // Adapt messages for fallback provider's expected format
            const adaptedPayload = adaptMessagesForProvider({
              providerType: compatibleFallbackProvider.type,
              systemPrompt,
              userMessage: message,
              history: [],
              attachments: attachments || []
            });

            const result = await callProvider(compatibleFallbackProvider, fallbackModel, adaptedPayload, params);
            aiResponse = result.content;
            usedModel = result.model;
            usedProvider = compatibleFallbackProvider;
            providerName = compatibleFallbackProvider.name;
            console.log(`✓ Fallback provider succeeded: ${providerName}`);
          } catch (fallbackError) {
            console.error(`✗ Fallback provider failed: ${fallbackError.message}`);
            throw new Error(`Both primary and fallback providers failed. Primary: ${primaryError.message}. Fallback: ${fallbackError.message}`);
          }
        } else {
          throw primaryError;
        }
      }
    } else if (compatibleFallbackProvider) {
      // Only fallback provider is compatible, use it directly
      try {
        const adaptedPayload = adaptMessagesForProvider({
          providerType: compatibleFallbackProvider.type,
          systemPrompt,
          userMessage: message,
          history: [],
          attachments: attachments || []
        });

        const result = await callProvider(compatibleFallbackProvider, fallbackModel, adaptedPayload, params);
        aiResponse = result.content;
        usedModel = result.model;
        usedProvider = compatibleFallbackProvider;
        providerName = compatibleFallbackProvider.name;
        console.log(`✓ Fallback provider succeeded (primary incompatible): ${providerName}`);
      } catch (fallbackError) {
        console.error(`✗ Fallback provider failed: ${fallbackError.message}`);
        throw fallbackError;
      }
    } else {
      // This should not happen due to earlier validation, but handle it
      throw new Error('No compatible providers available');
    }

    const responseTime = Date.now() - startTime;
    console.log('AI response received, time:', responseTime, 'ms');

    // Get user from auth header
    const authHeader = req.headers.get('authorization');
    let userId = null;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id;
    }

    // Log usage with actual provider used
    if (userId && usedProvider) {
      await supabase
        .from('chatbot_usage')
        .insert({
          chatbot_id,
          user_id: userId,
          ai_provider_id: usedProvider.id,
          model_used: usedModel,
          response_time_ms: responseTime,
          success: true,
        });
    }

    return new Response(JSON.stringify({
      response: aiResponse,
      provider_name: providerName,
      model: usedModel,
      response_time_ms: responseTime,
      citations: citations.length > 0 ? citations : undefined
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('AI chat error:', error);
    
    // Determine appropriate status code based on error type
    let statusCode = 500;
    let errorMessage = error instanceof Error ? error.message : 'Unknown error';
    let userMessage = 'I apologize, but I\'m experiencing technical difficulties. Please try again later.';
    
    if (errorMessage.includes('not found or inactive')) {
      statusCode = 404;
      userMessage = 'The requested chatbot is not available.';
    } else if (errorMessage.includes('No compatible providers') || errorMessage.includes('does not support model')) {
      statusCode = 422;
      userMessage = 'The chatbot configuration is invalid. Please contact your administrator.';
    } else if (errorMessage.includes('No active provider')) {
      statusCode = 503;
      userMessage = 'AI service is temporarily unavailable. Please try again later.';
    } else if (errorMessage.includes('Rate limit exceeded')) {
      statusCode = 429;
      userMessage = 'Too many requests. Please try again in a moment.';
    } else if (errorMessage.includes('credits depleted')) {
      statusCode = 402;
      userMessage = 'AI service credits depleted. Please contact your administrator.';
    }
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      response: userMessage
    }), {
      status: statusCode,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
