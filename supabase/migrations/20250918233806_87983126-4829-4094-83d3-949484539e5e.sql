-- Enable pg_cron extension for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule daily health check at 2 AM UTC
SELECT cron.schedule(
  'ai-providers-daily-health-check',
  '0 2 * * *', -- 2 AM every day
  $$
  SELECT
    net.http_post(
        url:='https://onvnvlnxmilotkxkfddu.supabase.co/functions/v1/ai-providers-daily-check',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9udm52bG54bWlsb3RreGtmZGR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMTQ1ODIsImV4cCI6MjA3Mzc5MDU4Mn0.xQZAfj_Y_2VIypEgcV7nuf0BJMMU-1CdwlxDqPByKHI"}'::jsonb,
        body:='{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);