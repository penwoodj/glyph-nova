#!/bin/bash
# Test script to verify DuckDuckGo node is working

echo "==================================="
echo "DuckDuckGo Node Test Script"
echo "==================================="
echo ""

# Check n8n is running
if pgrep -f "node.*n8n" > /dev/null; then
    echo "✅ n8n is running (PID: $(pgrep -f 'node.*n8n'))"
else
    echo "❌ n8n is NOT running"
    echo "   Start with: N8N_COMMUNITY_PACKAGES_ALLOW_TOOL_USAGE=true n8n start"
    exit 1
fi

echo ""

# Check node installation
echo "Checking node installation..."
if npm list -g n8n-nodes-duckduckgo-search 2>&1 | grep -q "n8n-nodes-duckduckgo-search"; then
    VERSION=$(npm list -g n8n-nodes-duckduckgo-search 2>&1 | grep "n8n-nodes-duckduckgo-search" | grep -oP '@\K[0-9.]+')
    echo "✅ DuckDuckGo node installed: v$VERSION"
else
    echo "❌ DuckDuckGo node NOT installed"
    exit 1
fi

echo ""

# Check environment variables
echo "Checking environment configuration..."
if [ -f ~/.n8n/.env ]; then
    if grep -q "N8N_COMMUNITY_PACKAGES_ALLOW_TOOL_USAGE=true" ~/.n8n/.env; then
        echo "✅ Community packages enabled in .env"
    else
        echo "⚠️  Community packages not enabled in .env"
    fi
else
    echo "⚠️  No .env file found at ~/.n8n/.env"
fi

echo ""

# Check workflow file
echo "Checking workflow file..."
WORKFLOW_FILE="/home/jon/code/llm-ui/.cursor/docs/My workflow improved.json"
if [ -f "$WORKFLOW_FILE" ]; then
    if grep -q '"type": "n8n-nodes-duckduckgo-search.duckDuckGo"' "$WORKFLOW_FILE"; then
        echo "✅ Workflow uses correct node type: duckDuckGo"
    else
        echo "❌ Workflow has incorrect node type"
        grep '"type": "n8n-nodes-duckduckgo-search' "$WORKFLOW_FILE" || echo "   No DuckDuckGo node found in workflow"
    fi
else
    echo "❌ Workflow file not found"
fi

echo ""
echo "==================================="
echo "Next Steps:"
echo "==================================="
echo "1. Open n8n: http://localhost:5678"
echo "2. Import workflow: $WORKFLOW_FILE"
echo "3. Activate the workflow"
echo "4. Test with a message containing '@web'"
echo ""
echo "If the node still doesn't appear:"
echo "  - Restart n8n: pkill -f 'node.*n8n' && N8N_COMMUNITY_PACKAGES_ALLOW_TOOL_USAGE=true n8n start"
echo "  - Check Settings → Community Nodes in n8n UI"
echo ""

