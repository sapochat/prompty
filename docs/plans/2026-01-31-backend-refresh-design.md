# Backend Refresh Design

**Date:** 2026-01-31
**Status:** Approved
**Scope:** Update models, fix bugs, add consistency, unit tests

## Overview

Refresh the Prompty backend to use current AI models (January 2026), fix existing bugs and inconsistencies, and add comprehensive unit test coverage for all API services.

## Goals

1. **Update to latest models** - Replace outdated models with current tiered selection
2. **Fix bugs** - OpenAI model hardcoding, missing timeouts, Novita caching
3. **Add consistency** - Standardized error handling, logging, remove partial features
4. **Unit tests** - Mock-based tests for all provider services

## Model Registry Update

Tiered selection (Fast / Balanced / Powerful) per provider:

| Provider | Fast | Balanced | Powerful |
|----------|------|----------|----------|
| **OpenAI** | `gpt-4.1-mini` | `gpt-5.1` | `gpt-5.2` |
| **Anthropic** | `claude-4-5-haiku-latest` | `claude-4-5-sonnet-latest` | `claude-4-5-opus-latest` |
| **OpenRouter** | `google/gemini-2.5-flash` | `google/gemini-3-flash-preview` | `google/gemini-3-pro-preview` |
| **Novita** | `meta-llama/llama-3.2-3b-instruct` | `meta-llama/llama-3.3-70b-instruct` | `meta-llama/llama-4-scout-17b-16e-instruct` |
| **HuggingFace** | `mistralai/Mistral-7B-Instruct-v0.3` | `meta-llama/Meta-Llama-3-8B-Instruct` | `Qwen/Qwen2.5-72B-Instruct` |

**Total: 15 models** (replacing current 9)

## Bug Fixes

### 1. OpenAI Model Selection
- **Problem:** `openaiService.ts` hardcodes `gpt-3.5-turbo`, ignores `config.model`
- **Fix:** Use `config.model` with fallback to `gpt-4.1-mini`

### 2. Request Timeouts
- **Problem:** No timeouts on fetch calls - API hangs freeze UI
- **Fix:** Add `AbortController` with 30-second timeout to all services
- **Pattern:**
```typescript
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 30000);
try {
  const response = await fetch(url, { ...options, signal: controller.signal });
} finally {
  clearTimeout(timeoutId);
}
```

### 3. Novita Caching
- **Problem:** Only provider without response caching
- **Fix:** Port existing cache pattern (1-hour TTL, config-based key)

### 4. Standardized Error Handling
- **Problem:** Inconsistent error formats across providers
- **Fix:** Create shared `handleApiError(error, provider)` utility
- **Format:** `{ id: uuid, prompt: '', error: 'Provider: message' }`

### 5. Remove Prefix Text Feature
- **Problem:** Only 2/5 providers support it (OpenAI, Novita)
- **Fix:** Remove from both - feature parity via removal

### 6. Clean Novita Logging
- **Problem:** 100+ lines of verbose logging per operation
- **Fix:** Reduce to essential: request start, success/failure, cache hit

## Shared Utilities

Create `src/services/api/apiUtils.ts`:

```typescript
// Timeout wrapper
export async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs = 30000
): Promise<Response>

// Standard error handler
export function handleApiError(
  error: unknown,
  provider: string
): ApiResponse

// Cache utilities
export function getCacheKey(config: PromptConfig): string
export function isCacheValid(timestamp: number, ttlMs: number): boolean
```

## Unit Testing

### Test Structure
```
src/services/api/__tests__/
├── openaiService.test.ts
├── anthropicService.test.ts
├── huggingfaceService.test.ts
├── novitaService.test.ts
├── openrouterService.test.ts
└── apiUtils.test.ts
```

### Test Cases Per Service

| Test Case | Description |
|-----------|-------------|
| Successful generation | Mock 200 response, verify prompt returned |
| API error (4xx) | Mock 400/401, verify error message |
| API error (5xx) | Mock 500, verify error message |
| Timeout handling | Mock slow response, verify abort + error |
| Cache hit | Same config twice, verify single fetch |
| Cache miss | Different config, verify new fetch |
| Missing API key | Verify early return with error |

### Mocking Approach
- `vi.stubGlobal('fetch', mockFetch)` for fetch
- `vi.mock('sonner')` for toast notifications
- `vi.stubGlobal('crypto', { randomUUID: () => 'test-uuid' })`

## Implementation Phases

### Phase 1: Shared Infrastructure
- Create `apiUtils.ts` with timeout, error handling, cache utilities
- Write tests for shared utilities

### Phase 2: Model Registry
- Update `modelService.ts` with 15-model tiered registry
- Update descriptions and metadata

### Phase 3: Provider Services (parallelizable)
- Fix each of the 5 provider services
- Apply shared utilities
- Remove prefix text from OpenAI/Novita

### Phase 4: Testing (parallelizable)
- Write unit tests for each service

### Phase 5: Verification
- Run full test suite
- Manual smoke test

## Files Changed

**Modified (7):**
- `src/services/modelService.ts`
- `src/services/api/openaiService.ts`
- `src/services/api/anthropicService.ts`
- `src/services/api/huggingfaceService.ts`
- `src/services/api/novitaService.ts`
- `src/services/api/openrouterService.ts`
- `src/services/promptService.ts` (if needed for prefix removal)

**Created (7):**
- `src/services/api/apiUtils.ts`
- `src/services/api/__tests__/apiUtils.test.ts`
- `src/services/api/__tests__/openaiService.test.ts`
- `src/services/api/__tests__/anthropicService.test.ts`
- `src/services/api/__tests__/huggingfaceService.test.ts`
- `src/services/api/__tests__/novitaService.test.ts`
- `src/services/api/__tests__/openrouterService.test.ts`

## Success Criteria

1. All 15 new models selectable in UI
2. Model selection works correctly for all providers
3. 30-second timeout on all API calls
4. Consistent error messages across providers
5. All services use caching
6. ~100 unit tests passing
7. No regressions in existing functionality
