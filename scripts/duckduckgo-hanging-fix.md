# DuckDuckGo Search Hanging - Diagnosis and Solutions

## Problem

The DuckDuckGo community node hangs for 3+ minutes with no error when executing searches.

## Likely Causes

1. **Web Scraping Detection**: DuckDuckGo may be detecting and blocking the scraping attempts
2. **Rate Limiting**: Too many parallel requests (5 searches at once)
3. **Network Timeout**: Node timeout settings too aggressive
4. **Circuit Breaker**: Node's circuit breaker may be in "open" state

## Immediate Solutions

### Solution 1: Use DuckDuckGo HTML Lite (Recommended)

Replace the community node with a simple HTTP request to DuckDuckGo's HTML lite version:

```json
{
  "parameters": {
    "method": "GET",
    "url": "=https://lite.duckduckgo.com/lite/?q={{ encodeURIComponent($json.searchQuery) }}",
    "options": {
      "timeout": 10000,
      "redirect": {
        "followRedirects": true,
        "maxRedirects": 3
      }
    },
    "sendHeaders": true,
    "headerParameters": {
      "parameters": [
        {
          "name": "User-Agent",
          "value": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36"
        }
      ]
    }
  },
  "type": "n8n-nodes-base.httpRequest",
  "name": "DuckDuckGo HTML Search"
}
```

Then parse the HTML response with a code node:

```javascript
const cheerio = require('cheerio');
const html = $input.item.json.data || $input.item.binary.data;

// Parse HTML
const $ = cheerio.load(html);
const results = [];

// Extract search results from lite HTML
$('.result').each((i, elem) => {
  if (i >= 10) return false; // Max 10 results

  const title = $(elem).find('.result-title').text().trim();
  const snippet = $(elem).find('.result-snippet').text().trim();
  const url = $(elem).find('.result-link').attr('href');

  if (title && url) {
    results.push({ title, url, description: snippet });
  }
});

return {
  json: {
    query: $json.searchQuery,
    success: results.length > 0,
    count: results.length,
    results: results
  }
};
```

### Solution 2: Reduce Parallel Requests

Instead of 5 parallel searches, do them sequentially or reduce to 2-3:

1. Change the "Parse 5 Queries" node to only return 2-3 queries
2. Add a "Wait" node between searches (500ms delay)

### Solution 3: Use Alternative Search APIs

#### Option A: Brave Search API (Free Tier)
- 2,000 searches/month free
- Fast, reliable
- Sign up: https://brave.com/search/api/

```json
{
  "parameters": {
    "method": "GET",
    "url": "https://api.search.brave.com/res/v1/web/search",
    "authentication": "genericCredentialType",
    "sendQuery": true,
    "queryParameters": {
      "parameters": [
        {
          "name": "q",
          "value": "={{ $json.searchQuery }}"
        },
        {
          "name": "count",
          "value": "10"
        }
      ]
    },
    "sendHeaders": true,
    "headerParameters": {
      "parameters": [
        {
          "name": "X-Subscription-Token",
          "value": "YOUR_API_KEY"
        }
      ]
    }
  },
  "type": "n8n-nodes-base.httpRequest"
}
```

#### Option B: SearXNG (Self-Hosted, Free)
- Install SearXNG locally
- Meta-search engine (queries multiple sources)
- No rate limits

```bash
# Quick install with Docker
docker run -d -p 8080:8080 searxng/searxng
```

Then use HTTP request to http://localhost:8080/search?format=json&q=query

## Quick Fix: Modify Your Workflow

### Step 1: Export Current Workflow
Save a backup of your current workflow from n8n UI.

### Step 2: Add Timeout and Error Handling

Replace the DuckDuckGo Search node with this HTTP Request configuration:

```json
{
  "parameters": {
    "method": "POST",
    "url": "https://duckduckgo.com/",
    "sendBody": true,
    "bodyParameters": {
      "parameters": [
        {
          "name": "q",
          "value": "={{ $json.searchQuery }}"
        },
        {
          "name": "format",
          "value": "json"
        }
      ]
    },
    "options": {
      "timeout": 5000,
      "retry": {
        "maxRetries": 2,
        "retryDelay": 1000
      }
    }
  },
  "type": "n8n-nodes-base.httpRequest",
  "typeVersion": 4.2,
  "position": [1200, 200],
  "id": "duckduckgo-simple-search",
  "name": "DuckDuckGo Simple Search"
}
```

### Step 3: Add Error Handling Node

Add this code node after the search to catch timeouts:

```javascript
const data = $input.item.json;

// Check if we got an error
if ($input.item.error) {
  console.error('Search error:', $input.item.error);

  return {
    json: {
      query: $json.searchQuery || 'unknown',
      success: false,
      count: 0,
      results: [],
      error: 'Search timed out or failed',
      formattedResult: `Query: ${$json.searchQuery}\nNo results found (timeout or error)\n`
    }
  };
}

// Normal processing
const results = data.results || data.RelatedTopics || [];
// ... rest of your formatting code
```

## Testing the Fix

### Test 1: Simple Single Query
1. Temporarily disconnect the "Parse 5 Queries" loop
2. Set a single static query
3. Test if DuckDuckGo responds
4. Check execution time

### Test 2: Check Network Connectivity
```bash
# Test DuckDuckGo is reachable
curl -I "https://duckduckgo.com" --max-time 5

# Test lite version
curl "https://lite.duckduckgo.com/lite/?q=test" --max-time 5
```

### Test 3: Check n8n Execution Logs
In n8n UI:
1. Open the workflow
2. Click on the hanging DuckDuckGo node
3. Check "Executions" tab
4. Look for error messages or timeout indicators

## Alternative: Disable Web Search Temporarily

While debugging, you can disable the web search path:

1. Open workflow
2. Find the "Needs Web Search?" IF node
3. Change the condition to always return FALSE
4. This routes all queries to the normal AI agent
5. At least the workflow will be functional

## Recommended Immediate Action

**Create a simplified test workflow:**

```
Manual Trigger
    ↓
Set (set searchQuery: "Node.js")
    ↓
HTTP Request (DuckDuckGo with 5s timeout)
    ↓
Code (simple result extraction)
    ↓
View Results
```

This will help diagnose if the issue is:
- The community node specifically
- DuckDuckGo blocking requests
- Network connectivity
- n8n configuration

## Long-Term Solution

Consider using a **hybrid search approach**:

1. **Primary**: Brave Search API (fast, reliable, 2k free/month)
2. **Fallback**: SearXNG self-hosted (unlimited, slower)
3. **Cache**: Store results for common queries

This provides better reliability and faster responses.

---

**Next Steps:**
1. Test network connectivity to DuckDuckGo
2. Try the simple HTTP request approach
3. If still hanging, switch to Brave Search API
4. Monitor execution logs for specific errors

