-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create a function to call the model refresh edge function
CREATE OR REPLACE FUNCTION public.trigger_model_refresh()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  supabase_url text;
  service_key text;
BEGIN
  -- Get Supabase URL from environment (assuming it's stored or hardcoded)
  supabase_url := 'https://onvnvlnxmilotkxkfddu.supabase.co';
  
  -- Call the edge function using pg_net
  PERFORM
    net.http_post(
      url := supabase_url || '/functions/v1/ai-provider-model-refresh',
      headers := '{"Content-Type": "application/json"}'::jsonb,
      body := '{}'::jsonb
    );
    
  -- Log the trigger
  INSERT INTO public.ai_provider_audit_log (action, details)
  VALUES (
    'model_refresh_triggered',
    jsonb_build_object(
      'timestamp', now(),
      'triggered_by', 'pg_cron'
    )
  );
END;
$$;

-- Schedule the job to run every day at 02:00 UTC
-- Note: pg_cron uses UTC time by default
SELECT cron.schedule(
  'nightly-provider-model-refresh',
  '0 2 * * *',  -- Every day at 02:00
  $$SELECT public.trigger_model_refresh();$$
);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;