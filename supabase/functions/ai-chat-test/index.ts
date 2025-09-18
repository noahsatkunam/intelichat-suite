import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import "https://deno.land/x/xhr@0.1.0/mod.ts";

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

    const { provider_id, model, messages } = await req.json();

    console.log('Chat test request:', { provider_id, model, messageCount: messages.length });

    // Get provider details including API key
    const { data: provider, error: providerError } = await supabase
      .from('ai_providers')
      .select('*')
      .eq('id', provider_id)
      .single();

    if (providerError) {
      console.error('Provider fetch error:', providerError);
      throw new Error(`Provider not found: ${providerError.message}`);
    }

    if (!provider.api_key_encrypted) {
      throw new Error('No API key configured for this provider');
    }

    console.log('Using provider:', provider.name, 'Type:', provider.type);

    let response;
    let responseText = '';

    switch (provider.type) {
      case 'openai':
        response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${provider.api_key_encrypted}`,
            'Content-Type': 'application/json',
            ...(provider.organization_id && { 'OpenAI-Organization': provider.organization_id })
          },
          body: JSON.stringify({
            model: model,
            messages: messages,
            max_tokens: 1000,
            temperature: 0.7
          })
        });
        
        if (!response.ok) {
          const error = await response.text();
          console.error('OpenAI API error:', error);
          throw new Error(`OpenAI API error: ${response.status} - ${error}`);
        }
        
        const openaiData = await response.json();
        responseText = openaiData.choices[0].message.content;
        break;

      case 'anthropic':
        response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': provider.api_key_encrypted, // Anthropic uses x-api-key, not Authorization
            'Content-Type': 'application/json',
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: model,
            max_tokens: 1000,
            messages: messages.filter((m: any) => m.role !== 'system'),
            system: messages.find((m: any) => m.role === 'system')?.content || 'You are a helpful assistant.'
          })
        });
        
        if (!response.ok) {
          const error = await response.text();
          console.error('Anthropic API error:', error);
          throw new Error(`Anthropic API error: ${response.status} - ${error}`);
        }
        
        const anthropicData = await response.json();
        responseText = anthropicData.content[0].text;
        break;

      case 'meta':
        response = await fetch('https://api.llama-api.com/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${provider.api_key_encrypted}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: model,
            messages: messages,
            max_tokens: 1000,
            temperature: 0.7
          })
        });
        
        if (!response.ok) {
          const error = await response.text();
          console.error('Meta API error:', error);
          throw new Error(`Meta API error: ${response.status} - ${error}`);
        }
        
        const metaData = await response.json();
        responseText = metaData.choices[0].message.content;
        break;

      case 'xai':
        response = await fetch('https://api.x.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${provider.api_key_encrypted}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: model,
            messages: messages,
            max_tokens: 1000,
            temperature: 0.7,
            stream: false
          })
        });
        
        if (!response.ok) {
          const error = await response.text();
          console.error('xAI API error:', error);
          throw new Error(`xAI API error: ${response.status} - ${error}`);
        }
        
        const xaiData = await response.json();
        responseText = xaiData.choices[0].message.content;

      case 'google':
        const apiKey = provider.api_key_encrypted;
        response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: messages.map((m: any) => ({
              role: m.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: m.content }]
            })).filter((m: any) => m.role !== 'system'),
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1000
            }
          })
        });
        
        if (!response.ok) {
          const error = await response.text();
          console.error('Google API error:', error);
          throw new Error(`Google API error: ${response.status} - ${error}`);
        }
        
        const googleData = await response.json();
        responseText = googleData.candidates[0].content.parts[0].text;
        break;

      case 'mistral':
        response = await fetch('https://api.mistral.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${provider.api_key_encrypted}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: model,
            messages: messages,
            max_tokens: 1000,
            temperature: 0.7
          })
        });
        
        if (!response.ok) {
          const error = await response.text();
          console.error('Mistral API error:', error);
          throw new Error(`Mistral API error: ${response.status} - ${error}`);
        }
        
        const mistralData = await response.json();
        responseText = mistralData.choices[0].message.content;
        break;

      case 'ollama':
        const ollamaUrl = provider.base_url || 'http://localhost:11434';
        response = await fetch(`${ollamaUrl}/api/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: model,
            messages: messages,
            stream: false
          })
        });
        
        if (!response.ok) {
          const error = await response.text();
          console.error('Ollama API error:', error);
          throw new Error(`Ollama API error: ${response.status} - ${error}`);
        }
        
        const ollamaData = await response.json();
        responseText = ollamaData.message.content;
        break;

      case 'custom':
        const customUrl = provider.base_url || 'https://api.openai.com/v1';
        const headers: any = {
          'Authorization': `Bearer ${provider.api_key_encrypted}`,
          'Content-Type': 'application/json'
        };
        
        // Add custom headers if provided
        if (provider.custom_headers) {
          Object.assign(headers, provider.custom_headers);
        }
        
        response = await fetch(`${customUrl}/chat/completions`, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify({
            model: model,
            messages: messages,
            max_tokens: 1000,
            temperature: 0.7
          })
        });
        
        if (!response.ok) {
          const error = await response.text();
          console.error('Custom API error:', error);
          throw new Error(`Custom API error: ${response.status} - ${error}`);
        }
        
        const customData = await response.json();
        responseText = customData.choices[0].message.content;
        break;

      default:
        throw new Error(`Unsupported provider type: ${provider.type}`);
    }

    console.log('Response generated successfully, length:', responseText.length);

    // Log the usage for analytics
    await supabase
      .from('chatbot_usage')
      .insert({
        ai_provider_id: provider_id,
        model_used: model,
        success: true,
        response_time_ms: Date.now() % 10000, // Simplified for demo
        tokens_used: Math.ceil(responseText.length / 4) // Rough estimate
      });

    return new Response(JSON.stringify({ 
      response: responseText,
      model: model,
      provider: provider.name
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Chat test error:', error);
    
    // Log the error for analytics
    try {
      const { provider_id } = await req.json();
      if (provider_id) {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        await supabase
          .from('chatbot_usage')
          .insert({
            ai_provider_id: provider_id,
            success: false,
            error_message: error instanceof Error ? error.message : 'Unknown error'
          });
      }
    } catch (logError) {
      console.error('Error logging failed request:', logError);
    }
    
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});