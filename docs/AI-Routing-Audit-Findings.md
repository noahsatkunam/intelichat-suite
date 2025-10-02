# AI Routing Investigation & Findings

## Investigation Summary

**Date:** October 2, 2025  
**Scope:** Model mismatch investigation for OpenAI requests  
**Status:** Enhanced logging deployed, root cause analysis in progress

---

## Critical Finding: OpenAI Model Downgrade

### Evidence
Analysis of `chatbot_usage` table shows consistent model downgrades:

| Timestamp | Configured Model | Actual Model Used | Status |
|-----------|------------------|-------------------|--------|
| 2025-10-01 22:27:12 | `gpt-4` | `gpt-3.5-turbo` | ❌ Mismatch |
| 2025-10-01 22:26:32 | `gpt-4` | `gpt-3.5-turbo` | ❌ Mismatch |
| 2025-10-01 22:26:13 | `gpt-4` | `gpt-3.5-turbo` | ❌ Mismatch |
| 2025-10-01 22:16:23 | `gpt-4` | `gpt-3.5-turbo` | ❌ Mismatch |
| 2025-10-01 22:04:41 | `gpt-4` | `gpt-3.5-turbo` | ❌ Mismatch |
| 2025-10-01 22:01:57 | `gpt-4` | `gpt-3.5-turbo` | ❌ Mismatch |
| 2025-10-01 21:56:08 | `gpt-4` | `gpt-3.5-turbo` | ❌ Mismatch |
| 2025-10-01 21:51:19 | `gpt-4` | `gpt-3.5-turbo` | ❌ Mismatch |
| 2025-10-01 21:28:24 | `gpt-4` | `gpt-4` | ✅ Match |

**Mismatch Rate:** 88.9% (8 out of 9 requests)

### Root Cause Analysis

#### Code Review: ✅ PASSED
```typescript
// Edge function correctly passes model parameter
body: JSON.stringify({
  model,  // ← Correctly passing chatbot.model_name
  messages: adaptedPayload.messages,
  // ... other params
})
```

**Conclusion:** The edge function code is correct. The model parameter is properly passed to OpenAI's API.

#### Potential Causes

1. **API Key Restrictions (Most Likely)**
   - The OpenAI API key may not have access to GPT-4 models
   - Free tier or restricted tier accounts cannot access GPT-4
   - Organization-level restrictions may be in place

2. **OpenAI Auto-Downgrade Behavior**
   - OpenAI API may automatically downgrade requests when:
     - Quota is exceeded
     - Rate limits are hit
     - Account is past due
     - Model is temporarily unavailable

3. **Legacy Model Name**
   - Model name `gpt-4` may be redirecting to a legacy version
   - Consider using specific version: `gpt-4-0613` or newer models like `gpt-4o`

### Recommended Actions

#### Immediate (High Priority)

1. **Verify API Key Access**
   ```bash
   curl https://api.openai.com/v1/models \
     -H "Authorization: Bearer YOUR_API_KEY" | grep "gpt-4"
   ```
   - Check if GPT-4 models appear in the list
   - Verify account tier and permissions

2. **Check OpenAI Dashboard**
   - Visit: https://platform.openai.com/usage
   - Check quota usage and limits
   - Verify billing status
   - Look for any warnings/alerts

3. **Test with Alternative Model**
   ```sql
   -- Temporarily update chatbot to use gpt-4o-mini
   UPDATE chatbots 
   SET model_name = 'gpt-4o-mini' 
   WHERE name = 'Test' 
     AND model_name = 'gpt-4';
   ```
   - Send test message
   - Check if model matches
   - This validates the API key works for other models

#### Short-term (This Week)

4. **Enable Enhanced Logging**
   - ✅ Already deployed with improved edge function
   - Monitor logs for new requests
   - Watch for specific error codes (403, 429)

5. **Update to Latest Models**
   Consider migrating to newer, more cost-effective models:
   - `gpt-4` → `gpt-4o` (better performance, lower cost)
   - `gpt-3.5-turbo` → `gpt-4o-mini` (4o quality, 3.5 price)

6. **Implement Monitoring**
   - Set up daily checks for model mismatches
   - Alert on failure rate > 5%
   - Track response times

---

## Enhanced Observability Improvements

### New Logging Features

#### 1. Detailed Request Logging
```
🤖 CHATBOT REQUEST DETAILS
Chatbot: Test (dec945a8-bdd5-492d-96dc-12e648280f2c)
Requested Primary Model: gpt-4
Fallback Model: claude-3-opus-20240229
System Prompt Length: 123 characters
Knowledge Base Documents: 1
User Message Length: 45 characters
```

#### 2. Provider-Specific Logging
```
[OpenAI] Requesting model: gpt-4
[OpenAI] Request params: { max_tokens: 1000, temperature: 0.7 }
[OpenAI] ⚠️ MODEL MISMATCH - Requested: gpt-4, Received: gpt-3.5-turbo
[OpenAI] Token usage: { prompt_tokens: 150, completion_tokens: 85 }
```

#### 3. Routing Decision Logging
```
✓ Primary provider OpenAI supports model gpt-4
✓ Fallback provider Anthropic Claude supports model claude-3-opus-20240229
🔄 Attempting PRIMARY provider: OpenAI (openai)
✅ PRIMARY PROVIDER SUCCESS
   Provider: OpenAI
   Requested Model: gpt-4
   Returned Model: gpt-4
```

#### 4. Response Summary
```
📊 RESPONSE SUMMARY
Response Time: 1234ms
Final Provider: OpenAI (openai)
Final Model: gpt-4
Response Length: 567 characters
Citations: 1
Citation Sources: cert.pdf
```

### Log Search Queries

**Check for model mismatches:**
```
Search: "MODEL MISMATCH"
```

**Check for fallback activations:**
```
Search: "FALLBACK PROVIDER SUCCESS"
```

**Check for API errors:**
```
Search: "403" OR "429" OR "API error"
```

**Check specific chatbot:**
```
Search: "dec945a8-bdd5-492d-96dc-12e648280f2c"
```

---

## Testing Checklist

### Pre-Deployment Validation

- [ ] Review edge function code for correct model parameter passing
- [ ] Verify all API keys are valid and not expired
- [ ] Confirm all configured models exist in provider_models table
- [ ] Test with simple message: "Hello"
- [ ] Check logs for model match confirmation

### Post-Deployment Monitoring

**First Hour:**
- [ ] Monitor edge function logs for errors
- [ ] Check model mismatch rate (should be < 5%)
- [ ] Verify fallback logic not engaging unexpectedly

**First Day:**
- [ ] Run model mismatch query (see Quick Test Script)
- [ ] Check provider failure rates
- [ ] Verify knowledge base citations appear
- [ ] Test all active chatbots at least once

**First Week:**
- [ ] Review usage patterns across all providers
- [ ] Analyze response times by provider
- [ ] Document any API key or quota issues
- [ ] Optimize model selections based on cost/performance

---

## Known Issues & Workarounds

### Issue #1: GPT-4 Model Downgrade

**Status:** 🔴 Active Investigation  
**Impact:** High - Users not receiving expected model quality  
**Affected:** Chatbot "Test" (dec945a8-bdd5-492d-96dc-12e648280f2c)

**Temporary Workaround:**
1. Update chatbot to use `gpt-4o` instead of `gpt-4`
2. Or switch to `gpt-4o-mini` for cost optimization
3. Test to confirm model match

**Permanent Solution (Pending):**
- Verify OpenAI account has GPT-4 access
- Upgrade API key tier if needed
- Update billing if quota exceeded

### Issue #2: Missing Edge Function Logs

**Status:** 🟡 Under Investigation  
**Impact:** Medium - Reduces debugging capability  
**Note:** Logs may not appear immediately after function invocation

**Workaround:**
- Wait 30-60 seconds after sending message
- Refresh logs page in Supabase dashboard
- Check for function invocation count (even if logs missing)

---

## Next Steps

1. **Immediate:** Test current setup with new logging
   - Send message to chatbot "Test"
   - Check edge function logs
   - Verify model match or capture mismatch error

2. **This Week:** Resolve OpenAI API key access
   - Contact OpenAI support if needed
   - Upgrade account tier if required
   - Test with updated credentials

3. **Ongoing:** Monitor and optimize
   - Daily model mismatch checks
   - Weekly provider performance review
   - Monthly cost optimization analysis

---

## Success Criteria

A successful AI routing implementation should show:

- ✅ Model match rate > 95%
- ✅ Primary provider success rate > 90%
- ✅ Fallback activation rate < 10%
- ✅ Average response time < 3 seconds
- ✅ Zero requests to Lovable AI Gateway
- ✅ Knowledge base citations present when applicable
- ✅ System prompts reflected in all responses

**Current Status:** 🔴 Needs Attention (Model mismatch rate 88.9%)

---

## Document History

- **2025-10-02**: Initial investigation and enhanced logging deployment
- **Next Review**: After 24 hours of log collection with new logging system
