#!/bin/bash

# Import n8n RAG Knowledge Graph Workflow
# This script imports the workflow.json file into n8n via API
#
# Usage:
#   export N8N_API_URL="http://localhost:5678"
#   export N8N_API_KEY="your-api-key"
#   ./import-workflow.sh
#
# See: https://docs.n8n.io/api/api-reference/#post-workflows

set -e

# Check for required environment variables
if [ -z "$N8N_API_URL" ]; then
  echo "Error: N8N_API_URL environment variable not set"
  echo "Example: export N8N_API_URL=http://localhost:5678"
  exit 1
fi

if [ -z "$N8N_API_KEY" ]; then
  echo "Error: N8N_API_KEY environment variable not set"
  echo "Example: export N8N_API_KEY=your-api-key-here"
  exit 1
fi

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKFLOW_FILE="${SCRIPT_DIR}/workflow.json"

# Check if workflow file exists
if [ ! -f "$WORKFLOW_FILE" ]; then
  echo "Error: workflow.json not found at $WORKFLOW_FILE"
  exit 1
fi

echo "Importing n8n RAG Knowledge Graph Workflow..."
echo "API URL: $N8N_API_URL"
echo "Workflow file: $WORKFLOW_FILE"
echo ""

# Import workflow
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${N8N_API_URL}/api/v1/workflows" \
  -H "X-N8N-API-KEY: ${N8N_API_KEY}" \
  -H "Content-Type: application/json" \
  -d @"${WORKFLOW_FILE}")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ] || [ "$HTTP_CODE" -eq 201 ]; then
  echo "✅ Workflow imported successfully!"
  echo ""
  echo "Response:"
  echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
  echo ""
  echo "Next steps:"
  echo "1. Open n8n dashboard: $N8N_API_URL"
  echo "2. Find 'RAG Knowledge Graph Workflow'"
  echo "3. Configure credentials (Postgres, Neo4j)"
  echo "4. Set WATCH_FOLDER environment variable or update in workflow"
  echo "5. Activate the workflow"
else
  echo "❌ Error importing workflow (HTTP $HTTP_CODE)"
  echo ""
  echo "Response:"
  echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
  echo ""
  echo "Troubleshooting:"
  echo "- Check n8n is running: curl $N8N_API_URL/healthz"
  echo "- Verify API key is correct"
  echo "- Check workflow.json is valid JSON"
  exit 1
fi
