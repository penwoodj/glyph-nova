# n8n RAG Knowledge Graph Workflow

This directory contains a complete n8n workflow for RAG (Retrieval-Augmented Generation) with knowledge graph capabilities.

## Workflow Overview

The workflow includes two main paths:

### Indexing Path
1. **Schedule Trigger** - Triggers periodically to check for new files
2. **List Files** - Recursively lists all supported files in watch folder
3. **Read File** - Reads each file's content
4. **Chunk Text** - Splits text into chunks (500 chars, 50 overlap)
5. **Generate Embeddings** - Creates vector embeddings using Ollama
6. **Extract Embedding** - Extracts embedding vector from response
7. **Store in Vector DB** - Stores chunks with embeddings in Postgres (pgvector)
8. **Extract Entities** - Extracts entities from chunks using LLM
9. **Parse Entities** - Parses entity extraction response
10. **Store Graph Entities** - Stores entities in Neo4j graph database

### Query Path
1. **Webhook Trigger** - Accepts queries from CLI via HTTP
2. **Chat Trigger** - Accepts queries from n8n dashboard
3. **Extract Query** - Extracts query text from trigger
4. **Generate Query Embedding** - Creates embedding for query
5. **Vector Search** - Searches for similar chunks using vector similarity
6. **Combine Results** - Combines search results
7. **Generate Response** - Generates final answer using LLM
8. **Webhook Response** - Returns response to webhook

## Prerequisites

1. **n8n** - Install and run n8n (local or self-hosted)
   - See: https://docs.n8n.io/hosting/

2. **Ollama** - Running on `localhost:11434`
   - Must have `nomic-embed-text` model for embeddings
   - Must have `llama2` model for LLM tasks

3. **Postgres Database** - With pgvector extension
   - Create table:
     ```sql
     CREATE EXTENSION IF NOT EXISTS vector;
     CREATE TABLE chunks (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       text TEXT NOT NULL,
       embedding vector(768),
       metadata JSONB,
       source_file TEXT,
       chunk_index INTEGER,
       UNIQUE(source_file, chunk_index)
     );
     CREATE INDEX ON chunks USING ivfflat (embedding vector_cosine_ops);
     ```

4. **Neo4j Database** (Optional) - For knowledge graph storage
   - Running on `localhost:7474`
   - Or use in-memory graph storage (modify workflow)

## Setup Instructions

### Option 1: Import via n8n Dashboard

1. **Import Workflow**
   - Open n8n dashboard
   - Click "Import from File"
   - Select `workflow.json`
   - Workflow will be imported with all nodes

### Option 2: Import via API Script

1. **Set Environment Variables**
   ```bash
   export N8N_API_URL="http://localhost:5678"
   export N8N_API_KEY="your-api-key"
   ```

2. **Run Import Script**
   ```bash
   cd /home/jon/code/glyph-nova/scripts/rag/n8n
   ./import-workflow.sh
   ```

   The script will:
   - Validate workflow.json exists
   - Import workflow via n8n API
   - Display import status
   - Provide next steps

2. **Configure Credentials**
   - **Postgres**: Add Postgres credentials in n8n
     - Go to Credentials → Add Credential → Postgres
     - Enter database connection details
     - Reference in "Store in Vector DB" node
   - **Neo4j** (if using): Add HTTP Basic Auth credentials
     - Username: `neo4j`
     - Password: Your Neo4j password
     - Base64 encode: `echo -n 'neo4j:password' | base64`
     - Set as `NEO4J_AUTH` environment variable

3. **Configure Environment Variables**
   - Set `WATCH_FOLDER` environment variable in n8n
   - Default: `/home/jon/code/glyph-nova/scripts/rag`
   - Or update in "List Files" node code

4. **Activate Workflow**
   - Click "Active" toggle in n8n
   - Workflow will start watching folder and processing files

## Testing

### Test Workflow Structure

Run the test script to validate workflow structure:

```bash
cd /home/jon/code/glyph-nova/scripts/rag/n8n
node test-workflow.js
```

This will:
- Validate workflow JSON structure
- Test file listing logic
- Test chunking logic
- Test file reading
- Validate node connections
- Check for required nodes

### Test Workflow Execution Logic

Test the workflow execution logic with real files:

```bash
cd /home/jon/code/glyph-nova/scripts/rag/n8n
node test-workflow-execution.js
```

This will:
- Test file listing from sub-folders
- Test file reading
- Test chunking logic
- Check Ollama API availability
- Validate workflow JSON structure

### Test Workflow Data Flow

Test the complete data flow through all workflow nodes:

```bash
cd /home/jon/code/glyph-nova/scripts/rag/n8n
node test-workflow-data-flow.js
```

This comprehensive test will:
- Test file listing node output structure
- Test file reading node output structure
- Test chunk text node output structure
- Test embedding extraction logic
- Test entity extraction parsing logic
- Test query path logic
- Validate all workflow connections
- Validate all critical paths

### Test Workflow Edge Cases

Test how the workflow handles edge cases and error conditions:

```bash
cd /home/jon/code/glyph-nova/scripts/rag/n8n
node test-workflow-edge-cases.js
```

This test validates:
- Empty file handling
- Small file handling (smaller than chunk size)
- Special characters and Unicode preservation
- Missing file path fallback
- Invalid entity JSON handling
- Missing embedding handling
- Missing query handling
- Large file chunking (10KB+)
- Whitespace-only file handling
- Test chunking with real files
- Check Ollama availability
- Validate workflow JSON
- Provide test summary

**Test Results (Latest Run):**
- ✅ Found 32 files from test sub-folders
- ✅ Successfully read 5 files (32,780 characters)
- ✅ Created 76 chunks (average 15.2 per file)
- ✅ Workflow JSON is valid (18 nodes, 15 connections)
- ⚠️ Ollama not running (expected - will work when available)

## Usage

### Indexing Files

The workflow automatically indexes files when:
- Schedule trigger fires (default: every minute)
- Files are added/modified in watch folder

### Querying

#### Via Webhook (CLI)
```bash
curl -X POST http://localhost:5678/webhook/rag-query \
  -H "Content-Type: application/json" \
  -d '{"query": "What is RAG?"}'
```

#### Via n8n Dashboard
- Open n8n dashboard
- Find "Chat Trigger" node
- Click "Test" or use chat interface
- Enter your query

## Workflow Structure

```
Indexing:
Schedule Trigger → List Files → Read File → Chunk Text
                                              ├→ Generate Embeddings → Extract Embedding → Store Vector DB
                                              └→ Extract Entities → Parse Entities → Store Graph Entities

Querying:
Webhook/Chat Trigger → Extract Query → Generate Query Embedding → Vector Search → Combine Results → Generate Response → Webhook Response
```

## File Structure

- `workflow.json` - Complete n8n workflow definition (18 nodes)
- `test-workflow.js` - Test script to validate workflow structure
- `test-workflow-execution.js` - Test script to test workflow logic with real files
- `test-workflow-data-flow.js` - Comprehensive test of data flow through all nodes
- `test-workflow-edge-cases.js` - Test edge cases and error handling
- `import-workflow.sh` - Script to import workflow via n8n API
- `config.example.json` - Example configuration file
- `TEST_RESULTS.md` - Detailed test results summary
- `README.md` - This file

## Troubleshooting

1. **Workflow not triggering**
   - Check Schedule Trigger is active
   - Verify n8n workflow is activated
   - Check n8n logs for errors

2. **Embeddings failing**
   - Verify Ollama is running: `curl http://localhost:11434/api/tags`
   - Check `nomic-embed-text` model is installed
   - Verify Ollama API endpoint in workflow

3. **Database errors**
   - Verify Postgres connection credentials
   - Check pgvector extension is installed
   - Verify table schema matches expected structure

4. **Entity extraction failing**
   - Check Ollama `llama2` model is available
   - Verify LLM API endpoint format
   - Check response parsing logic

## Next Steps

- Add relationship extraction between entities
- Implement graph traversal for query enhancement
- Add hybrid retrieval (vector + graph fusion)
- Add reranking for better results
- Implement context expansion

## References

- [n8n Documentation](https://docs.n8n.io/)
- [n8n Advanced AI](https://docs.n8n.io/advanced-ai/)
- [n8n API Reference](https://docs.n8n.io/api/)
- [Ollama API](https://github.com/ollama/ollama/blob/main/docs/api.md)
- [Postgres pgvector](https://github.com/pgvector/pgvector)
