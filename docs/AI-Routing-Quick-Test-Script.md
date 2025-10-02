# Quick AI Routing Test Script

## Quick Health Check (2 minutes)

Run this quick test to verify AI routing is working correctly.

### Step 1: Check Provider Status
```sql
-- Verify all providers are healthy
SELECT 
  name,
  type,
  is_active,
  is_healthy,
  last_health_check
FROM ai_providers
WHERE is_active = true
ORDER BY name;
```

**Expected:** All should show `is_healthy: true` and recent `last_health_check`

### Step 2: Check Recent Usage
```sql
-- Check last 10 requests
SELECT 
  c.name as chatbot,
  ap.name as provider,
  cu.model_used,
  cu.success,
  cu.response_time_ms,
  cu.timestamp
FROM chatbot_usage cu
JOIN chatbots c ON cu.chatbot_id = c.id
JOIN ai_providers ap ON cu.ai_provider_id = ap.id
ORDER BY cu.timestamp DESC
LIMIT 10;
```

**Expected:** Recent successful requests with correct providers

### Step 3: Test Message via UI
1. Go to `/chat`
2. Select any active chatbot
3. Send: "Hello, test message"
4. Wait for response

### Step 4: Check Logs
View edge function logs at:
https://supabase.com/dashboard/project/onvnvlnxmilotkxkfddu/functions/ai-chat/logs

**Look for:**
- ✅ `PRIMARY PROVIDER SUCCESS`
- ✅ Model match confirmed
- ❌ No `MODEL MISMATCH` warnings

### Step 5: Verify Model Match
```sql
-- Check for model mismatches in last hour
SELECT 
  c.name as chatbot,
  c.model_name as requested_model,
  cu.model_used as actual_model,
  cu.timestamp,
  CASE 
    WHEN c.model_name = cu.model_used THEN '✅ Match'
    ELSE '❌ Mismatch'
  END as status
FROM chatbot_usage cu
JOIN chatbots c ON cu.chatbot_id = c.id
WHERE cu.timestamp > NOW() - INTERVAL '1 hour'
ORDER BY cu.timestamp DESC;
```

**Expected:** All rows should show `✅ Match`

---

## Quick Model Mismatch Check (30 seconds)

If you suspect model downgrade issues:

```sql
-- Count mismatches in last 24 hours
SELECT 
  COUNT(*) as total_requests,
  SUM(CASE WHEN c.model_name != cu.model_used THEN 1 ELSE 0 END) as mismatches,
  ROUND(100.0 * SUM(CASE WHEN c.model_name != cu.model_used THEN 1 ELSE 0 END) / COUNT(*), 1) as mismatch_percent
FROM chatbot_usage cu
JOIN chatbots c ON cu.chatbot_id = c.id
WHERE cu.timestamp > NOW() - INTERVAL '24 hours';
```

**Red Flag:** Mismatch percent > 5%

**Action:** See "AI-Routing-Testing-Guide.md" Section 2B for investigation steps

---

## Quick Fallback Test (Development Only)

**⚠️ Only run in staging/development environment!**

```sql
-- 1. Mark primary provider as unhealthy
UPDATE ai_providers 
SET is_healthy = false 
WHERE name = 'OpenAI';

-- 2. Send test message via UI

-- 3. Check logs for fallback activation

-- 4. Restore provider health
UPDATE ai_providers 
SET is_healthy = true 
WHERE name = 'OpenAI';
```

**Expected Log Output:**
```
❌ PRIMARY PROVIDER FAILED
🔄 Attempting FALLBACK provider: Anthropic Claude
✅ FALLBACK PROVIDER SUCCESS
```

---

## Emergency Checks

### All Requests Failing?
```sql
-- Check for widespread failures
SELECT 
  success,
  error_message,
  COUNT(*) as count
FROM chatbot_usage
WHERE timestamp > NOW() - INTERVAL '10 minutes'
GROUP BY success, error_message;
```

### Specific Provider Issues?
```sql
-- Check provider-specific errors
SELECT 
  ap.name as provider,
  cu.error_message,
  COUNT(*) as error_count
FROM chatbot_usage cu
JOIN ai_providers ap ON cu.ai_provider_id = ap.id
WHERE cu.success = false
  AND cu.timestamp > NOW() - INTERVAL '1 hour'
GROUP BY ap.name, cu.error_message
ORDER BY error_count DESC;
```

### Response Time Degradation?
```sql
-- Check average response times
SELECT 
  ap.name as provider,
  AVG(cu.response_time_ms) as avg_response_ms,
  MAX(cu.response_time_ms) as max_response_ms,
  COUNT(*) as request_count
FROM chatbot_usage cu
JOIN ai_providers ap ON cu.ai_provider_id = ap.id
WHERE cu.timestamp > NOW() - INTERVAL '1 hour'
  AND cu.success = true
GROUP BY ap.name;
```

**Red Flag:** Average > 5000ms

---

## Contact Points

- **For API Key Issues:** Platform admin (OpenAI/Anthropic dashboard)
- **For Edge Function Logs:** Supabase dashboard
- **For Database Queries:** Direct Supabase SQL editor
