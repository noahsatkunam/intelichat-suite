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
  console.log(`[OpenAI] Requesting model: ${model}`);
  console.log(`[OpenAI] Request params:`, { 
    max_tokens: params.max_tokens, 
    temperature: params.temperature,
    message_count: adaptedPayload.messages.length 
  });

  const requestBody = {
    model,
    messages: adaptedPayload.messages,
    max_tokens: params.max_tokens,
    temperature: params.temperature,
    top_p: params.top_p,
    frequency_penalty: params.frequency_penalty,
    presence_penalty: params.presence_penalty,
  };

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[OpenAI] API error ${response.status}:`, errorText);
    
    // Check for specific error types
    if (response.status === 403) {
      console.error(`[OpenAI] 403 Forbidden - API key may not have access to model: ${model}`);
    } else if (response.status === 429) {
      console.error(`[OpenAI] 429 Rate Limit - Quota exceeded or rate limit hit`);
    } else if (response.status === 404) {
      console.error(`[OpenAI] 404 Not Found - Model may not exist: ${model}`);
    }
    
    throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const returnedModel = data.model;
  
  // Log model mismatch warnings
  if (returnedModel !== model) {
    console.warn(`[OpenAI] ⚠️  MODEL MISMATCH - Requested: ${model}, Received: ${returnedModel}`);
    console.warn(`[OpenAI] This may indicate API key restrictions or automatic downgrade`);
  } else {
    console.log(`[OpenAI] ✓ Model match confirmed: ${returnedModel}`);
  }

  // Log usage information if available
  if (data.usage) {
    console.log(`[OpenAI] Token usage:`, data.usage);
  }

  return {
    content: data.choices[0].message.content,
    model: returnedModel,
  };
}

// Helper function to call Anthropic API
async function callAnthropic(apiKey: string, model: string, adaptedPayload: any, params: any) {
  console.log(`[Anthropic] Requesting model: ${model}`);
  console.log(`[Anthropic] Request params:`, { 
    max_tokens: params.max_tokens, 
    temperature: params.temperature,
    message_count: adaptedPayload.messages.length 
  });

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
    console.error(`[Anthropic] API error ${response.status}:`, errorText);
    
    if (response.status === 403) {
      console.error(`[Anthropic] 403 Forbidden - API key may not have access to model: ${model}`);
    } else if (response.status === 429) {
      console.error(`[Anthropic] 429 Rate Limit - Quota exceeded`);
    }
    
    throw new Error(`Anthropic API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const returnedModel = data.model;
  
  if (returnedModel !== model) {
    console.warn(`[Anthropic] ⚠️  MODEL MISMATCH - Requested: ${model}, Received: ${returnedModel}`);
  } else {
    console.log(`[Anthropic] ✓ Model match confirmed: ${returnedModel}`);
  }

  if (data.usage) {
    console.log(`[Anthropic] Token usage:`, data.usage);
  }

  return {
    content: data.content[0].text,
    model: returnedModel,
  };
}

// Helper function to call Google Gemini API
async function callGoogle(apiKey: string, model: string, adaptedPayload: any, params: any) {
  console.log(`[Google] Requesting model: ${model}`);
  console.log(`[Google] Request params:`, { 
    max_tokens: params.max_tokens, 
    temperature: params.temperature 
  });

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
    console.error(`[Google] API error ${response.status}:`, errorText);
    
    if (response.status === 403) {
      console.error(`[Google] 403 Forbidden - API key may not have access to model: ${model}`);
    } else if (response.status === 429) {
      console.error(`[Google] 429 Rate Limit - Quota exceeded`);
    } else if (response.status === 404) {
      console.error(`[Google] 404 Not Found - Model may not exist: ${model}`);
    }
    
    throw new Error(`Google API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log(`[Google] ✓ Response received for model: ${model}`);
  
  if (data.usageMetadata) {
    console.log(`[Google] Token usage:`, data.usageMetadata);
  }

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

// Helper function to find the closest matching model based on capability and modality
async function findClosestModel(
  supabase: any,
  targetProviderType: string,
  requestedModelName: string,
  sourceProviderType: string
): Promise<string | null> {
  console.log(`🔍 Finding closest model for ${targetProviderType} to match ${requestedModelName} from ${sourceProviderType}`);
  
  // Get the requested model's metadata
  const { data: requestedModel } = await supabase
    .from('provider_models')
    .select('capability_tier, modality, supports_vision, supports_function_calling')
    .eq('provider_type', sourceProviderType)
    .eq('model_name', requestedModelName)
    .maybeSingle();

  if (!requestedModel) {
    console.log(`⚠️  Could not find metadata for requested model: ${requestedModelName}`);
    return null;
  }

  console.log(`📋 Requested model metadata:`, {
    capability_tier: requestedModel.capability_tier,
    modality: requestedModel.modality,
    supports_vision: requestedModel.supports_vision
  });

  // Find the best matching model on the target provider
  // Priority: 1) Exact capability + modality, 2) Same capability, 3) Closest capability
  const { data: candidateModels } = await supabase
    .from('provider_models')
    .select('model_name, capability_tier, modality, supports_vision, supports_function_calling, display_name')
    .eq('provider_type', targetProviderType)
    .eq('is_deprecated', false);

  if (!candidateModels || candidateModels.length === 0) {
    console.log(`❌ No candidate models found for provider: ${targetProviderType}`);
    return null;
  }

  // Score each candidate model
  const scoredModels = candidateModels.map((candidate: any) => {
    let score = 0;
    
    // Capability tier match (highest priority)
    if (candidate.capability_tier === requestedModel.capability_tier) {
      score += 100;
    } else {
      // Partial score for similar tiers
      const tierMap = { flagship: 4, standard: 3, fast: 2, lightweight: 1 };
      const requestedTier = tierMap[requestedModel.capability_tier as keyof typeof tierMap] || 0;
      const candidateTier = tierMap[candidate.capability_tier as keyof typeof tierMap] || 0;
      score += Math.max(0, 50 - Math.abs(requestedTier - candidateTier) * 15);
    }
    
    // Modality match
    if (candidate.modality === requestedModel.modality) {
      score += 50;
    } else if (requestedModel.modality === 'multimodal' && candidate.modality === 'vision') {
      score += 30; // Partial match
    }
    
    // Vision support match
    if (candidate.supports_vision === requestedModel.supports_vision) {
      score += 25;
    }
    
    // Function calling support match
    if (candidate.supports_function_calling === requestedModel.supports_function_calling) {
      score += 10;
    }

    return { ...candidate, score };
  });

  // Sort by score descending
  scoredModels.sort((a, b) => b.score - a.score);

  const bestMatch = scoredModels[0];
  console.log(`✅ Best match found: ${bestMatch.display_name} (${bestMatch.model_name})`);
  console.log(`   Score: ${bestMatch.score}/185`);
  console.log(`   Capability: ${bestMatch.capability_tier}, Modality: ${bestMatch.modality}`);

  return bestMatch.model_name;
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
    let fallbackModel = chatbot.fallback_model_name || model;
    const autoMapFallback = chatbot.auto_map_fallback_model !== false; // Default to true

    // Validate model compatibility with providers
    let compatiblePrimaryProvider = null;
    let compatibleFallbackProvider = null;
    let fallbackModelSubstituted = false;

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
        // Fallback model not supported - try auto-mapping if enabled
        if (autoMapFallback && primaryProvider) {
          console.log(`🔄 Auto-mapping enabled: Finding closest model for fallback provider`);
          const closestModel = await findClosestModel(supabase, fallbackProvider.type, model, primaryProvider.type);
          
          if (closestModel) {
            fallbackModel = closestModel;
            fallbackModelSubstituted = true;
            compatibleFallbackProvider = fallbackProvider;
            console.log(`✅ Fallback model auto-mapped: ${fallbackModel}`);
          } else {
            console.warn(`⚠️  Could not find suitable fallback model for ${fallbackProvider.name}`);
          }
        } else {
          const supportedModels = await getSupportedModels(supabase, fallbackProvider.type);
          console.warn(`✗ Fallback provider ${fallbackProvider.name} does not support model ${fallbackModel}. Auto-mapping disabled. Supported models: ${supportedModels.join(', ')}`);
        }
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

    // Get enabled knowledge base documents for this chatbot
    const { data: knowledgeDocs } = await supabase
      .from('chatbot_knowledge')
      .select(`
        document_id,
        is_enabled,
        documents:document_id (
          id,
          filename,
          content,
          file_url
        )
      `)
      .eq('chatbot_id', chatbot_id)
      .eq('is_enabled', true); // Only get enabled documents

    console.log('Enabled knowledge base docs:', knowledgeDocs?.length || 0);

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

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🤖 CHATBOT REQUEST DETAILS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Chatbot: ${chatbot.name} (${chatbot_id})`);
    console.log(`Requested Primary Model: ${model}`);
    console.log(`Fallback Model: ${fallbackModel}`);
    console.log(`System Prompt Length: ${systemPrompt.length} characters`);
    console.log(`Knowledge Base Documents: ${knowledgeDocs?.length || 0}`);
    console.log(`User Message Length: ${message.length} characters`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Try compatible primary provider first
    if (compatiblePrimaryProvider) {
      try {
        console.log(`🔄 Attempting PRIMARY provider: ${compatiblePrimaryProvider.name} (${compatiblePrimaryProvider.type})`);
        console.log(`   Requesting model: ${model}`);
        
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
        
        console.log(`✅ PRIMARY PROVIDER SUCCESS`);
        console.log(`   Provider: ${providerName}`);
        console.log(`   Requested Model: ${model}`);
        console.log(`   Returned Model: ${usedModel}`);
        if (model !== usedModel) {
          console.error(`   ⚠️  MODEL MISMATCH DETECTED!`);
        }
      } catch (primaryError) {
        console.error(`❌ PRIMARY PROVIDER FAILED`);
        console.error(`   Provider: ${compatiblePrimaryProvider.name}`);
        console.error(`   Error: ${primaryError.message}`);
        
        // Try compatible fallback provider
        if (compatibleFallbackProvider) {
          try {
            console.log(`🔄 Attempting FALLBACK provider: ${compatibleFallbackProvider.name} (${compatibleFallbackProvider.type})`);
            console.log(`   Requesting model: ${fallbackModel}`);
            
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
            
            console.log(`✅ FALLBACK PROVIDER SUCCESS`);
            console.log(`   Provider: ${providerName}`);
            console.log(`   Requested Model: ${fallbackModel}`);
            console.log(`   Returned Model: ${usedModel}`);
            if (fallbackModel !== usedModel) {
              console.error(`   ⚠️  MODEL MISMATCH DETECTED!`);
            }
          } catch (fallbackError) {
            console.error(`❌ FALLBACK PROVIDER FAILED`);
            console.error(`   Provider: ${compatibleFallbackProvider.name}`);
            console.error(`   Error: ${fallbackError.message}`);
            throw new Error(`Both primary and fallback providers failed. Primary: ${primaryError.message}. Fallback: ${fallbackError.message}`);
          }
        } else {
          throw primaryError;
        }
      }
    } else if (compatibleFallbackProvider) {
      // Only fallback provider is compatible, use it directly
      try {
        console.log(`🔄 Using FALLBACK provider (primary incompatible): ${compatibleFallbackProvider.name} (${compatibleFallbackProvider.type})`);
        console.log(`   Requesting model: ${fallbackModel}`);
        
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
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 RESPONSE SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Response Time: ${responseTime}ms`);
    console.log(`Final Provider: ${providerName} (${usedProvider.type})`);
    console.log(`Final Model: ${usedModel}`);
    console.log(`Response Length: ${aiResponse.length} characters`);
    console.log(`Citations: ${citations.length}`);
    if (citations.length > 0) {
      console.log(`Citation Sources:`, citations.map(c => c.title).join(', '));
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

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
      const usageMetadata: any = {
        fallback_used: usedProvider.id !== primaryProvider?.id,
        requested_model: usedProvider.id === primaryProvider?.id ? model : fallbackModel,
        returned_model: usedModel
      };

      // Log model substitution if it occurred
      if (fallbackModelSubstituted) {
        usageMetadata.model_substituted = true;
        usageMetadata.original_fallback_model = chatbot.fallback_model_name || model;
        console.log(`📝 Logging model substitution: ${usageMetadata.original_fallback_model} → ${usedModel}`);
      }

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

      // Also log to audit trail if model was substituted
      if (fallbackModelSubstituted) {
        await supabase
          .from('ai_provider_audit_log')
          .insert({
            action: 'model_auto_mapped',
            provider_id: usedProvider.id,
            user_id: userId,
            details: usageMetadata
          });
      }
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
