import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
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

    // Map unsupported models to Lovable AI supported models
    const supportedModels = [
      'openai/gpt-5-mini',
      'openai/gpt-5',
      'openai/gpt-5-nano',
      'google/gemini-2.5-pro',
      'google/gemini-2.5-flash',
      'google/gemini-2.5-flash-lite',
      'google/gemini-2.5-flash-image-preview'
    ];

    let selectedModel = chatbot.model_name || 'google/gemini-2.5-flash';
    
    // If model includes provider prefix and is in supported list, use it
    if (supportedModels.includes(selectedModel)) {
      console.log('Using configured model:', selectedModel);
    } else {
      // Map unsupported models to supported ones
      const modelLower = selectedModel.toLowerCase();
      
      if (modelLower.includes('claude')) {
        selectedModel = 'google/gemini-2.5-flash';
        console.log('Mapped Claude model to:', selectedModel);
      } else if (modelLower.includes('gpt-4o') || modelLower.includes('gpt-4-turbo')) {
        selectedModel = 'openai/gpt-5';
        console.log('Mapped GPT-4 model to:', selectedModel);
      } else if (modelLower.includes('gpt-4')) {
        selectedModel = 'openai/gpt-5-mini';
        console.log('Mapped GPT-4 model to:', selectedModel);
      } else if (modelLower.includes('gpt-3.5')) {
        selectedModel = 'openai/gpt-5-mini';
        console.log('Mapped GPT-3.5 model to:', selectedModel);
      } else if (modelLower.includes('gemini')) {
        selectedModel = 'google/gemini-2.5-flash';
        console.log('Mapped Gemini model to:', selectedModel);
      } else {
        selectedModel = 'google/gemini-2.5-flash';
        console.log('Using default model for unsupported:', chatbot.model_name, '->', selectedModel);
      }
    }

    console.log('Calling Lovable AI with model:', selectedModel);

    // Call Lovable AI Gateway
    const startTime = Date.now();
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: chatbot.max_tokens || 1000,
        temperature: chatbot.temperature || 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a moment.');
      }
      if (response.status === 402) {
        throw new Error('AI credits depleted. Please add credits to your workspace.');
      }
      throw new Error(`AI service error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
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

    // Log usage
    if (userId) {
      await supabase
        .from('chatbot_usage')
        .insert({
          chatbot_id,
          user_id: userId,
          ai_provider_id: null,
          model_used: selectedModel,
          response_time_ms: responseTime,
          success: true,
        });
    }

    return new Response(JSON.stringify({
      response: aiResponse,
      provider_name: 'Lovable AI',
      model: selectedModel,
      response_time_ms: responseTime,
      citations: citations.length > 0 ? citations : undefined
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
