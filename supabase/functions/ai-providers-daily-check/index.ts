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

    console.log('Starting daily AI providers health check...');

    // Get all providers that have API keys configured
    const { data: providers, error: providersError } = await supabase
      .from('ai_providers')
      .select('*')
      .not('api_key_encrypted', 'is', null);

    if (providersError) {
      throw new Error(`Failed to fetch providers: ${providersError.message}`);
    }

    console.log(`Found ${providers?.length || 0} providers to check`);

    const results = [];

    for (const provider of providers || []) {
      console.log(`Checking provider: ${provider.name} (${provider.type})`);
      
      try {
        // Call the health check function for each provider
        const { data: healthResult, error: healthError } = await supabase.functions.invoke(
          'ai-provider-health-check',
          {
            body: { provider_id: provider.id }
          }
        );

        if (healthError) {
          console.error(`Health check failed for ${provider.name}:`, healthError);
          results.push({
            provider_id: provider.id,
            provider_name: provider.name,
            success: false,
            error: healthError.message
          });
        } else {
          console.log(`Health check completed for ${provider.name}: ${healthResult.healthy ? 'healthy' : 'unhealthy'}`);
          results.push({
            provider_id: provider.id,
            provider_name: provider.name,
            success: true,
            healthy: healthResult.healthy,
            models_count: healthResult.available_models?.length || 0
          });
        }
      } catch (error) {
        console.error(`Error checking provider ${provider.name}:`, error);
        results.push({
          provider_id: provider.id,
          provider_name: provider.name,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }

      // Add a small delay between checks to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Log the daily check results
    await supabase
      .from('ai_provider_audit_log')
      .insert({
        action: 'daily_health_check',
        details: {
          checked_providers: results.length,
          healthy_providers: results.filter(r => r.success && r.healthy).length,
          failed_checks: results.filter(r => !r.success).length,
          results: results
        },
        user_id: null
      });

    console.log('Daily health check completed successfully');

    return new Response(JSON.stringify({
      success: true,
      message: 'Daily health check completed',
      results: results,
      summary: {
        total_checked: results.length,
        healthy: results.filter(r => r.success && r.healthy).length,
        unhealthy: results.filter(r => r.success && !r.healthy).length,
        failed: results.filter(r => !r.success).length
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Daily health check error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});