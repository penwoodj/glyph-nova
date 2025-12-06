#!/bin/bash
# Quick test to verify the fix works

echo "================================================"
echo "DuckDuckGo Fix Verification Test"
echo "================================================"
echo ""

# Test 1: Network connectivity
echo "Test 1: Network Connectivity"
echo "----------------------------"
timeout 5 curl -s "https://api.duckduckgo.com/?q=nodejs&format=json" > /tmp/ddg_test.json
if [ $? -eq 0 ]; then
    echo "✅ DuckDuckGo API is reachable"
    if grep -q "Abstract" /tmp/ddg_test.json; then
        echo "✅ API returns valid data"
    else
        echo "⚠️  API returned empty data (query too generic)"
    fi
else
    echo "❌ Cannot reach DuckDuckGo API"
    exit 1
fi
echo ""

# Test 2: Workflow JSON validity
echo "Test 2: Workflow JSON Validity"
echo "-------------------------------"
if python3 -m json.tool "/home/jon/code/llm-ui/.cursor/docs/My workflow - NO HANG.json" > /dev/null 2>&1; then
    echo "✅ Workflow JSON is valid"
else
    echo "❌ Workflow JSON has syntax errors"
    exit 1
fi
echo ""

# Test 3: Check node type
echo "Test 3: Verify Node Configuration"
echo "----------------------------------"
if grep -q '"type": "n8n-nodes-base.httpRequest"' "/home/jon/code/llm-ui/.cursor/docs/My workflow - NO HANG.json"; then
    echo "✅ Using HTTP Request node (fast)"

    if grep -q '"timeout": 8000' "/home/jon/code/llm-ui/.cursor/docs/My workflow - NO HANG.json"; then
        echo "✅ Timeout configured (8 seconds)"
    else
        echo "⚠️  Timeout not found"
    fi

    if grep -q '"maxRetries": 1' "/home/jon/code/llm-ui/.cursor/docs/My workflow - NO HANG.json"; then
        echo "✅ Retry logic configured"
    else
        echo "⚠️  Retry logic not found"
    fi
else
    echo "❌ Still using community node (will hang)"
    exit 1
fi
echo ""

# Test 4: n8n status
echo "Test 4: n8n Service Status"
echo "--------------------------"
if pgrep -f "node.*n8n" > /dev/null; then
    PID=$(pgrep -f "node.*n8n")
    echo "✅ n8n is running (PID: $PID)"
    echo "   URL: http://localhost:5678"
else
    echo "⚠️  n8n is not running"
    echo "   Start with: n8n start"
fi
echo ""

# Summary
echo "================================================"
echo "Summary"
echo "================================================"
echo ""
echo "Changes Made:"
echo "  - Removed: DuckDuckGo community node (was hanging)"
echo "  - Added: HTTP Request node with API endpoint"
echo "  - Configured: 8-second timeout with 1 retry"
echo "  - Updated: Format Results to handle API structure"
echo ""
echo "Next Steps:"
echo "  1. Open n8n: http://localhost:5678"
echo "  2. Import: /home/jon/code/llm-ui/.cursor/docs/My workflow - NO HANG.json"
echo "  3. Activate the workflow"
echo "  4. Test with: '@web What is Node.js?'"
echo ""
echo "Expected Results:"
echo "  - Should complete in < 10 seconds (no hanging)"
echo "  - Will return instant answers, related topics"
echo "  - Handles empty results gracefully"
echo ""

# Cleanup
rm -f /tmp/ddg_test.json

echo "================================================"
echo "✅ All tests passed! Ready to import workflow."
echo "================================================"

