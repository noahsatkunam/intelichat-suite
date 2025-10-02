# AI Routing Testing & Observability Guide

## Overview
This guide provides comprehensive instructions for testing and monitoring the AI routing infrastructure, including procedures for reproducing failures, verifying fallback logic, and validating system behavior.

---

## 1. Edge Function Logging

### Enhanced Logging Capabilities

The `ai-chat` edge function now includes comprehensive logging:

#### Request-Level Logging
- Chatbot configuration (name, ID, models)
- System prompt and knowledge base info
- User message details
- Provider selection logic

#### Provider-Level Logging
Each provider (OpenAI, Anthropic, Google, etc.) logs:
- **Requested model** vs **Returned model**
- API error codes (403, 429, 404)
- Token usage statistics
- Response timing
- **Model mismatch warnings** (critical for debugging)

#### Response-Level Logging
- Total response time
- Final provider and model used
- Response length
- Knowledge base citations included

### Viewing Logs

**Via Supabase Dashboard:**
1. Go to https://supabase.com/dashboard/project/onvnvlnxmilotkxkfddu/functions/ai-chat/logs
2. Use the search filter to find specific events:
   - `MODEL MISMATCH` - Model downgrade issues
   - `PRIMARY PROVIDER` - Primary routing attempts
   - `FALLBACK PROVIDER` - Fallback activations
   - `403` or `429` - API key/quota issues

**Via Lovable AI Assistant:**
Use the edge function logs query to search for specific patterns.

---

## 2. Testing Procedures

### A. Normal Operation Test

**Objective:** Verify correct provider routing and model usage

**Steps:**
1. Navigate to `/chat` in the application
2. Select an active chatbot
3. Send test message: "Hello, please introduce yourself in one sentence."
4. Check edge function logs for:
   ```
   🤖 CHATBOT REQUEST DETAILS
   Requested Primary Model: gpt-4
   ✅ PRIMARY PROVIDER SUCCESS
   Returned Model: gpt-4  ← Should match requested!
   ```
5. Verify the response includes:
   - System prompt adherence (custom ending phrase)
   - Knowledge base citations (if documents attached)

**Expected Result:**
- ✅ Requested model = Returned model
- ✅ Primary provider succeeds
- ✅ No fallback activation
- ✅ System prompt reflected in response

**Red Flags:**
- ⚠️ Model mismatch (gpt-4 → gpt-3.5-turbo)
- ⚠️ API errors (403, 429, 404)
- ⚠️ Missing citations when documents are attached

### B. Model Mismatch Investigation

**Objective:** Diagnose why OpenAI downgrades models

**Prerequisite:** Model mismatch detected in logs

**Investigation Steps:**

1. **Check API Key Permissions:**
   ```bash
   # Test OpenAI API key directly
   curl https://api.openai.com/v1/models/gpt-4 \
     -H "Authorization: Bearer YOUR_API_KEY"
   ```
   - If 404: API key doesn't have access to GPT-4
   - If 403: API key is restricted
   - If 200: API key has access (issue is elsewhere)

2. **Check Quota/Usage:**
   - Visit https://platform.openai.com/usage
   - Look for quota warnings
   - Check if GPT-4 has remaining quota

3. **Review Edge Function Logs:**
   Look for specific OpenAI error messages:
   ```
   [OpenAI] 403 Forbidden - API key may not have access to model: gpt-4
   [OpenAI] 429 Rate Limit - Quota exceeded or rate limit hit
   [OpenAI] ⚠️ MODEL MISMATCH - Requested: gpt-4, Received: gpt-3.5-turbo
   ```

4. **Test with Different Model:**
   - Temporarily change chatbot to `gpt-4o-mini`
   - Send test message
   - Check if model matches (validates API key works)

**Resolution:**
- If API key issue: Update to a key with GPT-4 access
- If quota issue: Add credits to OpenAI account
- If rate limit: Implement request throttling

### C. Provider Fallback Test

**Objective:** Verify fallback logic engages when primary provider fails

**⚠️ IMPORTANT:** Only perform in staging/test environment!

**Setup:**
1. Create a test chatbot with:
   - Primary Provider: OpenAI (gpt-4)
   - Fallback Provider: Anthropic (claude-3-opus-20240229)

**Test Procedure:**

**Option 1: Simulate Provider Failure (Staging Only)**
```sql
-- Mark primary provider as unhealthy
UPDATE ai_providers 
SET is_healthy = false 
WHERE name = 'OpenAI' 
  AND tenant_id = 'YOUR_TEST_TENANT_ID';
```

**Option 2: Use Invalid API Key (Staging Only)**
```sql
-- Temporarily corrupt primary provider API key
UPDATE ai_providers 
SET api_key_encrypted = 'invalid_key_for_testing' 
WHERE name = 'OpenAI' 
  AND tenant_id = 'YOUR_TEST_TENANT_ID';
```

**Execute Test:**
1. Send test message to chatbot
2. Monitor edge function logs:
   ```
   🔄 Attempting PRIMARY provider: OpenAI (openai)
   ❌ PRIMARY PROVIDER FAILED
      Error: OpenAI API error: 401 - Invalid API key
   🔄 Attempting FALLBACK provider: Anthropic Claude (anthropic)
   ✅ FALLBACK PROVIDER SUCCESS
      Provider: Anthropic Claude
      Returned Model: claude-3-opus-20240229
   ```
3. Verify response was generated successfully
4. Check `chatbot_usage` table:
   ```sql
   SELECT 
     model_used,
     ai_provider_id,
     success,
     error_message
   FROM chatbot_usage
   ORDER BY timestamp DESC
   LIMIT 1;
   ```
   - Should show fallback provider ID and fallback model

**Cleanup:**
```sql
-- Restore provider health
UPDATE ai_providers 
SET is_healthy = true 
WHERE name = 'OpenAI';

-- Restore correct API key
UPDATE ai_providers 
SET api_key_encrypted = 'YOUR_REAL_API_KEY' 
WHERE name = 'OpenAI';
```

**Expected Result:**
- ✅ Primary provider attempt fails gracefully
- ✅ Fallback provider activates automatically
- ✅ Response generated successfully
- ✅ Fallback provider logged in usage table

**Failure Indicators:**
- ❌ Request fails without trying fallback
- ❌ Error message shows "No compatible providers"
- ❌ Both providers fail

### D. Model Compatibility Validation Test

**Objective:** Ensure chatbots can only use models their providers support

**Test Cases:**

1. **Valid Configuration:**
   - Chatbot: OpenAI provider + gpt-4 model
   - Expected: ✅ Validation passes, request succeeds

2. **Invalid Configuration:**
   - Chatbot: OpenAI provider + claude-3-opus model (Anthropic model)
   - Expected: ❌ Validation fails with error:
     ```
     No compatible providers available. 
     Model "claude-3-opus-20240229" is not supported by the configured providers.
     ```

3. **Mixed Configuration:**
   - Primary: OpenAI + gpt-4
   - Fallback: Anthropic + gpt-4 (invalid)
   - Expected: ✅ Primary succeeds, fallback marked incompatible in logs

**Test in UI:**
1. Navigate to Admin > Chatbot Management
2. Try creating chatbot with mismatched provider/model
3. Submit form
4. Should see toast error: "Invalid Configuration - Model not compatible with provider"

---

## 3. System Prompt & Knowledge Base Testing

### System Prompt Validation

**Test 1: Custom System Prompt**
- **Setup:** Chatbot with system prompt: "You are an accountant. End every response with 'thank you brodawg'"
- **Test Message:** "What is 2+2?"
- **Expected Response:** Should include "thank you brodawg" at the end
- **Logs to Check:**
  ```
  System Prompt Length: 75 characters
  ```

**Test 2: Knowledge Base Citations**
- **Setup:** Chatbot with attached PDF document
- **Test Message:** "What does the document say about [specific topic in PDF]?"
- **Expected Response:** 
  - Should reference document content
  - Should include citation at bottom
- **Logs to Check:**
  ```
  Knowledge Base Documents: 1
  Citations: 1
  Citation Sources: cert.pdf
  ```

**Manual UI Testing Checklist:**
- [ ] System prompt reflected in every response
- [ ] Custom ending phrases appear correctly
- [ ] Knowledge base content referenced in answers
- [ ] Citations include document names
- [ ] Citations include document URLs (if available)
- [ ] Multiple documents cited when relevant

---

## 4. Monitoring & Alerting

### Key Metrics to Monitor

1. **Model Mismatch Rate**
   ```sql
   SELECT 
     chatbot_id,
     COUNT(*) as total_requests,
     SUM(CASE WHEN model_used != model_name THEN 1 ELSE 0 END) as mismatches,
     ROUND(100.0 * SUM(CASE WHEN model_used != model_name THEN 1 ELSE 0 END) / COUNT(*), 2) as mismatch_rate
   FROM chatbot_usage cu
   JOIN chatbots c ON cu.chatbot_id = c.id
   WHERE cu.timestamp > NOW() - INTERVAL '24 hours'
   GROUP BY chatbot_id;
   ```

2. **Provider Failure Rate**
   ```sql
   SELECT 
     ap.name as provider_name,
     COUNT(*) as total_requests,
     SUM(CASE WHEN success = false THEN 1 ELSE 0 END) as failures,
     ROUND(100.0 * SUM(CASE WHEN success = false THEN 1 ELSE 0 END) / COUNT(*), 2) as failure_rate
   FROM chatbot_usage cu
   JOIN ai_providers ap ON cu.ai_provider_id = ap.id
   WHERE cu.timestamp > NOW() - INTERVAL '24 hours'
   GROUP BY ap.name;
   ```

3. **Fallback Activation Rate**
   ```sql
   -- Compare primary vs fallback provider usage
   SELECT 
     c.name as chatbot_name,
     c.primary_ai_provider_id,
     c.fallback_ai_provider_id,
     cu.ai_provider_id as used_provider_id,
     COUNT(*) as request_count,
     CASE 
       WHEN cu.ai_provider_id = c.primary_ai_provider_id THEN 'Primary'
       WHEN cu.ai_provider_id = c.fallback_ai_provider_id THEN 'Fallback'
       ELSE 'Unknown'
     END as provider_type
   FROM chatbot_usage cu
   JOIN chatbots c ON cu.chatbot_id = c.id
   WHERE cu.timestamp > NOW() - INTERVAL '24 hours'
   GROUP BY c.name, c.primary_ai_provider_id, c.fallback_ai_provider_id, cu.ai_provider_id;
   ```

### Alert Conditions

**High Priority:**
- 🔴 Model mismatch rate > 10%
- 🔴 Provider failure rate > 5%
- 🔴 No successful requests in 1 hour

**Medium Priority:**
- 🟡 Fallback activation rate > 20%
- 🟡 Average response time > 5 seconds
- 🟡 API errors (429, 403) detected

**Low Priority:**
- 🟢 Model compatibility warnings
- 🟢 Single request failures

---

## 5. Troubleshooting Guide

### Issue: Model Mismatch (GPT-4 → GPT-3.5-Turbo)

**Symptoms:**
- Logs show `⚠️ MODEL MISMATCH`
- Requested: gpt-4, Received: gpt-3.5-turbo

**Diagnosis:**
1. Check edge function logs for OpenAI errors
2. Verify API key has GPT-4 access
3. Check OpenAI usage dashboard for quota

**Solution:**
- Update to API key with GPT-4 access
- Add credits to OpenAI account
- Change chatbot to use gpt-4o or gpt-4o-mini

### Issue: Provider Repeatedly Failing

**Symptoms:**
- Logs show `❌ PRIMARY PROVIDER FAILED`
- Error: 403, 429, or 500 errors

**Diagnosis:**
1. Check provider health status in database
2. Test API key directly using curl
3. Check provider's status page

**Solution:**
- Update API key if expired/invalid
- Mark provider as unhealthy temporarily
- Switch to fallback provider

### Issue: No Citations in Response

**Symptoms:**
- Knowledge base documents attached
- Response doesn't reference documents
- Citations: 0 in logs

**Diagnosis:**
1. Check document status (must be "ready")
2. Verify document content exists
3. Check if document is attached to chatbot

**Solution:**
- Re-upload document if status is "failed"
- Ensure document has extracted content
- Re-attach document to chatbot

---

## 6. Best Practices

✅ **Do:**
- Check logs after every chatbot configuration change
- Test with simple messages first
- Monitor model mismatch rates daily
- Keep provider API keys rotated and secure
- Document custom system prompts

❌ **Don't:**
- Test provider failures in production
- Modify provider status without backup plan
- Ignore 403/429 errors
- Use production API keys in test environments
- Skip validation when changing models

---

## 7. Support & Resources

**Supabase Resources:**
- Edge Function Logs: https://supabase.com/dashboard/project/onvnvlnxmilotkxkfddu/functions/ai-chat/logs
- Database Editor: https://supabase.com/dashboard/project/onvnvlnxmilotkxkfddu/editor

**Provider Documentation:**
- OpenAI API: https://platform.openai.com/docs/api-reference
- Anthropic API: https://docs.anthropic.com/claude/reference
- Google Gemini API: https://ai.google.dev/docs

**Internal Documentation:**
- AI Routing Audit Report: `docs/AI-Routing-Audit-Report.md`
- Integration Dependency Map: `docs/05-Integration-Dependency-Map.md`
