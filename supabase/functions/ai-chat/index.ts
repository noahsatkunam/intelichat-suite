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

    const { chatbot_id, message, conversation_id, user_id } = await req.json();

    // Get chatbot configuration
    const { data: chatbot, error: chatbotError } = await supabase
      .from('chatbots')
      .select('*')
      .eq('id', chatbot_id)
      .eq('is_active', true)
      .single();

    if (chatbotError || !chatbot) {
      throw new Error('Chatbot not found or inactive');
    }

    // Get knowledge base documents for this chatbot
    const { data: knowledgeDocs } = await supabase
      .from('chatbot_knowledge')
      .select(`
        documents:document_id (
          id,
          filename,
          content
        )
      `)
      .eq('chatbot_id', chatbot_id);

    // Build enhanced system prompt with knowledge base
    let enhancedSystemPrompt = chatbot.system_prompt || 'You are a helpful AI assistant.';
    const citations: Array<{ title: string; url?: string }> = [];

    if (knowledgeDocs && knowledgeDocs.length > 0) {
      const knowledgeContext = knowledgeDocs
        .map((item: any) => {
          const doc = item.documents;
          if (doc && doc.content) {
            citations.push({ title: doc.filename });
            return `Document: ${doc.filename}\n${doc.content}`;
          }
          return null;
        })
        .filter(Boolean)
        .join('\n\n');

      if (knowledgeContext) {
        enhancedSystemPrompt += `\n\n## Knowledge Base\nUse the following documents to answer questions when relevant:\n\n${knowledgeContext}`;
      }
    }

    let response = '';
    let model_used = 'google/gemini-2.5-flash';
    let success = true;
    let error_message = '';
    const start_time = Date.now();

    try {
      // Call Lovable AI Gateway
      const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${lovableApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model_used,
          messages: [
            { role: 'system', content: enhancedSystemPrompt },
            { role: 'user', content: message }
          ],
        }),
      });

      if (!aiResponse.ok) {
        const errorText = await aiResponse.text();
        console.error('Lovable AI error:', aiResponse.status, errorText);
        
        if (aiResponse.status === 429) {
          throw new Error('Rate limit exceeded. Please try again in a moment.');
        }
        if (aiResponse.status === 402) {
          throw new Error('AI credits depleted. Please add credits to your workspace.');
        }
        throw new Error(`AI service error: ${aiResponse.status}`);
      }

      const data = await aiResponse.json();
      response = data.choices[0].message.content;

    } catch (error) {
      success = false;
      error_message = error instanceof Error ? error.message : 'Unknown error';
      response = error instanceof Error ? error.message : 'I apologize, but I\'m experiencing technical difficulties. Please try again later.';
      console.error('AI chat error:', error);
    }

    const response_time = Date.now() - start_time;

    // Log usage
    await supabase
      .from('chatbot_usage')
      .insert({
        chatbot_id,
        user_id,
        ai_provider_id: null,
        model_used,
        response_time_ms: response_time,
        success,
        error_message: error_message || null
      });

    return new Response(JSON.stringify({
      response,
      model: model_used,
      response_time_ms: response_time,
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