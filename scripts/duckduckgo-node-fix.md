# DuckDuckGo Search Node Fix

## Problem

The n8n-nodes-duckduckgo-search community node was installed (v31.0.1) but n8n wasn't recognizing it in workflows because of an incorrect node type identifier.

## Root Cause

The workflow JSON was using:
```json
"type": "n8n-nodes-duckduckgo-search.duckduckgoSearch"
```

But the actual registered node name (from `/usr/lib/node_modules/n8n-nodes-duckduckgo-search/dist/nodes/DuckDuckGo/constants.js`) is:
```javascript
NODE_INFO = {
    DISPLAY_NAME: 'DuckDuckGo',
    NAME: 'duckDuckGo',  // ← Note the camelCase
    GROUP: 'transform',
    VERSION: 1
}
```

## Solution

Changed the node type identifier in the workflow to:
```json
"type": "n8n-nodes-duckduckgo-search.duckDuckGo"
```

## Files Changed

**Original:** `/home/jon/code/llm-ui/.cursor/docs/My workflow improved.json`
**Fixed:** `/home/jon/code/llm-ui/.cursor/docs/My workflow improved - FIXED.json`

### Change Made (Line 95)

```diff
-      "type": "n8n-nodes-duckduckgo-search.duckduckgoSearch",
+      "type": "n8n-nodes-duckduckgo-search.duckDuckGo",
```

## Verification

### Installation Check ✅
```bash
$ npm list -g n8n-nodes-duckduckgo-search
/usr/lib
└── n8n-nodes-duckduckgo-search@31.0.1
```

### Environment Variables ✅
```bash
$ cat ~/.n8n/.env
N8N_BASIC_AUTH_ACTIVE=false
N8N_COMMUNITY_PACKAGES_ALLOW_TOOL_USAGE=true
```

### n8n Version ✅
```bash
$ n8n --version
1.122.4
```

### Valid Node Parameters

Based on the node source code, the correct configuration is:

```json
{
  "parameters": {
    "operation": "search",  // Valid values: search, searchImages, searchNews, searchVideos
    "query": "={{ $json.searchQuery }}",
    "webSearchOptions": {
      "maxResults": 10,
      "region": "us-en",  // See REGIONS array in constants.js for all options
      "safeSearch": 1     // 0=Strict, -1=Moderate, -2=Off
    }
  },
  "type": "n8n-nodes-duckduckgo-search.duckDuckGo",  // ← Correct type name
  "typeVersion": 1
}
```

## Next Steps

1. **Restart n8n** (if not already done):
   ```bash
   pkill -f "node.*n8n"
   N8N_COMMUNITY_PACKAGES_ALLOW_TOOL_USAGE=true n8n start
   ```

2. **Import the fixed workflow**:
   - Open n8n at http://localhost:5678
   - Go to Workflows → Import from File
   - Select: `/home/jon/code/llm-ui/.cursor/docs/My workflow improved - FIXED.json`

3. **Verify the node appears**:
   - The DuckDuckGo Search node should now be recognized
   - The node icon should display properly
   - No red error indicators

4. **Test the workflow**:
   - Send a message with `@web` trigger
   - Verify search results are returned
   - Check that results have proper structure (title, url, description)

## Expected Response Structure

Based on the Format Results code node, the DuckDuckGo node returns:

```javascript
{
  success: true,
  query: "search query",
  count: 10,
  results: [
    {
      title: "Result title",
      url: "https://example.com",
      description: "Result snippet or description",
      // May also have: snippet, text, name, link (alternatives)
    }
  ]
}
```

## If It Still Doesn't Work

### Check n8n recognizes the node:
```bash
# In n8n UI:
# Settings → Community Nodes
# Should show: n8n-nodes-duckduckgo-search v31.0.1
```

### Check node is loaded:
```bash
# Look for any errors in n8n logs
tail -f ~/.n8n/logs/n8n.log

# Or if started in foreground, check console output
```

### Reinstall if necessary:
```bash
npm uninstall -g n8n-nodes-duckduckgo-search
npm install -g n8n-nodes-duckduckgo-search
pkill -f "node.*n8n"
N8N_COMMUNITY_PACKAGES_ALLOW_TOOL_USAGE=true n8n start
```

### Alternative: Use n8n UI to install
1. Settings → Community Nodes → Install
2. Enter: `n8n-nodes-duckduckgo-search`
3. Click Install
4. Restart n8n

## Documentation Links

- **Node Repository:** https://github.com/samnodehi/n8n-nodes-duckduckgo
- **n8n Community Nodes:** https://docs.n8n.io/integrations/community-nodes/
- **Installation Guide:** https://docs.n8n.io/integrations/community-nodes/installation/

## Summary

The issue was a simple naming mismatch. The workflow used `duckduckgoSearch` (all lowercase) but the node registers as `duckDuckGo` (camelCase). After fixing this identifier, the node should be recognized and work properly.

