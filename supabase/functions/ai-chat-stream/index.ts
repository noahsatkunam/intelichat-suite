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

    const { chatbot_id, message, conversation_id, user_id, use_knowledge_base } = await req.json();

    console.log('[ai-chat-stream] Request received:', { chatbot_id, conversation_id, user_id, use_knowledge_base });

    // Get chatbot configuration or use default
    let chatbot = null;
    if (chatbot_id) {
      const { data, error } = await supabase
        .from('chatbots')
        .select(`
          *,
          primary_provider:primary_ai_provider_id(*),
          fallback_provider:fallback_ai_provider_id(*)
        `)
        .eq('id', chatbot_id)
        .eq('is_active', true)
        .single();

      if (!error && data) {
        chatbot = data;
      }
    }

    // Retrieve knowledge base context if enabled
    let knowledgeContext = '';
    let sources: any[] = [];
    if (use_knowledge_base) {
      try {
        const { data: documents } = await supabase
          .from('documents')
          .select('*')
          .eq('status', 'processed')
          .limit(5);

        if (documents && documents.length > 0) {
          knowledgeContext = '\n\nRelevant context from knowledge base:\n' + 
            documents.map(doc => `[${doc.filename}]: ${doc.content?.substring(0, 500)}`).join('\n');
          
          sources = documents.map(doc => ({
            title: doc.filename,
            url: doc.file_url || '#',
            snippet: doc.content?.substring(0, 200) || '',
            confidence: 'medium' as const,
            type: 'document',
            isKnowledgeBase: true
          }));
        }
      } catch (error) {
        console.error('[ai-chat-stream] Knowledge base retrieval error:', error);
      }
    }

    const systemPrompt = chatbot?.system_prompt || 'You are a helpful AI assistant.';
    const fullPrompt = message + knowledgeContext;

    // Create streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const startTime = Date.now();
        let fullResponse = '';
        let providerUsed = null;
        let modelUsed = '';
        let success = true;
        let errorMessage = '';
        let failoverCount = 0;

        const sendChunk = (data: any) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        };

        const sendError = (error: string) => {
          sendChunk({ type: 'error', content: error });
          errorMessage = error;
          success = false;
        };

        const sendComplete = () => {
          sendChunk({ type: 'done' });
          controller.close();
        };

        try {
          // Send initial metadata
          sendChunk({ 
            type: 'metadata', 
            provider: chatbot?.primary_provider?.name || 'Default',
            model: chatbot?.model_name || 'gpt-4o',
            sources 
          });

          // Try primary provider
          if (chatbot?.primary_provider) {
            try {
              console.log('[ai-chat-stream] Trying primary provider:', chatbot.primary_provider.name);
              const result = await streamFromProvider(
                chatbot.primary_provider,
                fullPrompt,
                systemPrompt,
                chatbot.model_name,
                sendChunk
              );
              fullResponse = result.response;
              providerUsed = chatbot.primary_provider;
              modelUsed = result.model;
            } catch (primaryError) {
              console.error('[ai-chat-stream] Primary provider failed:', primaryError);
              failoverCount++;
              
              // Try fallback provider within 5 seconds
              if (chatbot.fallback_provider && (Date.now() - startTime) < 5000) {
                try {
                  console.log('[ai-chat-stream] Trying fallback provider:', chatbot.fallback_provider.name);
                  sendChunk({ type: 'failover', message: 'Switching to backup provider...' });
                  
                  const result = await streamFromProvider(
                    chatbot.fallback_provider,
                    fullPrompt,
                    systemPrompt,
                    chatbot.model_name,
                    sendChunk
                  );
                  fullResponse = result.response;
                  providerUsed = chatbot.fallback_provider;
                  modelUsed = result.model;
                } catch (fallbackError) {
                  console.error('[ai-chat-stream] Fallback provider failed:', fallbackError);
                  throw fallbackError;
                }
              } else {
                throw primaryError;
              }
            }
          } else {
            // Use default OpenAI
            console.log('[ai-chat-stream] Using default OpenAI');
            const result = await streamFromDefaultOpenAI(fullPrompt, systemPrompt, sendChunk);
            fullResponse = result.response;
            modelUsed = result.model;
          }

          const responseTime = Date.now() - startTime;
          console.log('[ai-chat-stream] Response complete:', { responseTime, length: fullResponse.length });

          // Log usage
          await supabase.from('chatbot_usage').insert({
            chatbot_id: chatbot_id || null,
            user_id,
            ai_provider_id: providerUsed?.id || null,
            model_used: modelUsed,
            response_time_ms: responseTime,
            success,
            error_message: errorMessage || null
          });

          // Save messages to conversation
          if (conversation_id && fullResponse) {
            await supabase.from('messages').insert([
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
                content: fullResponse,
                metadata: {
                  provider: providerUsed?.name || 'OpenAI (Default)',
                  model: modelUsed,
                  response_time_ms: responseTime,
                  failover_count: failoverCount,
                  sources
                }
              }
            ]);
          }

          sendComplete();
        } catch (error) {
          console.error('[ai-chat-stream] Fatal error:', error);
          sendError(error instanceof Error ? error.message : 'Unknown error');
          
          // Save error response
          if (conversation_id) {
            await supabase.from('messages').insert({
              conversation_id,
              user_id,
              role: 'assistant',
              content: 'I apologize, but I encountered an error. Please try again.',
              metadata: { error: errorMessage }
            });
          }
          
          sendComplete();
        }
      }
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('[ai-chat-stream] Setup error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function streamFromProvider(
  provider: any,
  message: string,
  systemPrompt: string,
  modelOverride: string | null,
  sendChunk: (data: any) => void
): Promise<{ response: string; model: string }> {
  const model = modelOverride || provider.config?.model || 'gpt-4o';
  
  switch (provider.type) {
    case 'openai':
      return await streamOpenAI(provider.api_key_encrypted, message, systemPrompt, model, sendChunk);
    case 'anthropic':
      return await streamAnthropic(provider.api_key_encrypted, message, systemPrompt, model, sendChunk);
    default:
      throw new Error(`Streaming not supported for provider type: ${provider.type}`);
  }
}

async function streamOpenAI(
  apiKey: string,
  message: string,
  systemPrompt: string,
  model: string,
  sendChunk: (data: any) => void
): Promise<{ response: string; model: string }> {
  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: message }
  ];

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      stream: true,
      max_tokens: 2000,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  let fullResponse = '';

  if (reader) {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.trim() !== '');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices[0]?.delta?.content;
            if (content) {
              fullResponse += content;
              sendChunk({ type: 'content', content });
            }
          } catch (e) {
            console.error('[streamOpenAI] Parse error:', e);
          }
        }
      }
    }
  }

  return { response: fullResponse, model };
}

async function streamAnthropic(
  apiKey: string,
  message: string,
  systemPrompt: string,
  model: string,
  sendChunk: (data: any) => void
): Promise<{ response: string; model: string }> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: 'user', content: message }],
      stream: true
    }),
  });

  if (!response.ok) {
    throw new Error(`Anthropic API error: ${response.status}`);
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  let fullResponse = '';

  if (reader) {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.trim() !== '');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          
          try {
            const parsed = JSON.parse(data);
            if (parsed.type === 'content_block_delta') {
              const content = parsed.delta?.text;
              if (content) {
                fullResponse += content;
                sendChunk({ type: 'content', content });
              }
            }
          } catch (e) {
            console.error('[streamAnthropic] Parse error:', e);
          }
        }
      }
    }
  }

  return { response: fullResponse, model };
}

async function streamFromDefaultOpenAI(
  message: string,
  systemPrompt: string,
  sendChunk: (data: any) => void
): Promise<{ response: string; model: string }> {
  const openaiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiKey) {
    throw new Error('No OpenAI API key configured');
  }

  return await streamOpenAI(openaiKey, message, systemPrompt, 'gpt-4o', sendChunk);
}
