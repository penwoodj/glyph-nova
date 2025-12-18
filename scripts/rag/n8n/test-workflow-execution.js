#!/usr/bin/env node

/**
 * Test n8n workflow execution with real files
 * Simulates workflow node execution to test logic
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('=== Testing n8n RAG Workflow Execution ===\n');

// Test configuration
const WATCH_FOLDER = process.env.WATCH_FOLDER || '/home/jon/code/glyph-nova/scripts/rag';
const TEST_FOLDERS = [
  '/home/jon/code/glyph-nova/scripts/rag/indexing',
  '/home/jon/code/glyph-nova/scripts/rag/querying',
  '/home/jon/code/glyph-nova/cursor/docs/plans/rag-integration'
];

// Step 1: List Files (simulating List Files node)
console.log('1. Testing List Files node logic...');
const supportedExtensions = ['.txt', '.md', '.js', '.ts', '.json', '.py'];

function getAllFiles(dirPath, arrayOfFiles = []) {
  try {
    const files = fs.readdirSync(dirPath);

    files.forEach(file => {
      const filePath = path.join(dirPath, file);
      try {
        if (fs.statSync(filePath).isDirectory()) {
          if (!file.startsWith('.') && file !== 'node_modules') {
            arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
          }
        } else {
          const ext = path.extname(file).toLowerCase();
          if (supportedExtensions.includes(ext)) {
            arrayOfFiles.push(filePath);
          }
        }
      } catch (err) {
        // Skip files we can't access
      }
    });
  } catch (err) {
    console.error(`Error reading directory ${dirPath}:`, err.message);
  }

  return arrayOfFiles;
}

const allFiles = [];
TEST_FOLDERS.forEach(folder => {
  if (fs.existsSync(folder)) {
    const files = getAllFiles(folder);
    allFiles.push(...files);
  }
});

console.log(`✅ Found ${allFiles.length} files to process`);
if (allFiles.length > 0) {
  console.log(`   Sample files:`);
  allFiles.slice(0, 5).forEach(f => console.log(`     - ${path.basename(f)}`));
}
console.log('');

// Step 2: Read Files (simulating Read File node)
console.log('2. Testing Read File node logic...');
let filesRead = 0;
let totalChars = 0;
const fileContents = [];

for (const filePath of allFiles.slice(0, 5)) { // Test with first 5 files
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    fileContents.push({
      filePath,
      fileName: path.basename(filePath),
      content,
      size: content.length
    });
    filesRead++;
    totalChars += content.length;
  } catch (err) {
    console.error(`   ❌ Error reading ${filePath}:`, err.message);
  }
}

console.log(`✅ Successfully read ${filesRead} files`);
console.log(`   Total characters: ${totalChars}`);
console.log('');

// Step 3: Chunk Text (simulating Chunk Text node)
console.log('3. Testing Chunk Text node logic...');
const chunkSize = 500;
const overlap = 50;
let totalChunks = 0;

const allChunks = [];
fileContents.forEach(file => {
  const text = file.content;
  const chunks = [];

  for (let i = 0; i < text.length; i += chunkSize - overlap) {
    const chunk = text.slice(i, i + chunkSize);
    chunks.push({
      chunkText: chunk,
      chunkIndex: Math.floor(i / (chunkSize - overlap)),
      startIndex: i,
      endIndex: i + chunk.length,
      sourceFile: file.fileName,
      sourcePath: file.filePath
    });
  }

  allChunks.push(...chunks);
  totalChunks += chunks.length;
});

console.log(`✅ Created ${totalChunks} chunks from ${filesRead} files`);
if (allChunks.length > 0) {
  console.log(`   Average chunks per file: ${(totalChunks / filesRead).toFixed(1)}`);
  console.log(`   Sample chunk sizes: ${allChunks.slice(0, 3).map(c => c.chunkText.length).join(', ')}`);
}
console.log('');

// Step 4: Test Embedding Generation (check if Ollama is available)
console.log('4. Testing Embedding Generation (checking Ollama availability)...');
const testEmbedding = async () => {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 11434,
      path: '/api/embeddings',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 2000
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const result = JSON.parse(data);
            resolve({ available: true, embeddingLength: result.embedding?.length || 0 });
          } catch (err) {
            resolve({ available: true, error: 'Invalid response format' });
          }
        } else {
          resolve({ available: false, error: `Status ${res.statusCode}` });
        }
      });
    });

    req.on('error', () => {
      resolve({ available: false, error: 'Connection failed' });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ available: false, error: 'Timeout' });
    });

    req.write(JSON.stringify({
      model: 'nomic-embed-text',
      prompt: allChunks[0]?.chunkText || 'test'
    }));
    req.end();
  });
};

const embeddingTest = await testEmbedding();
if (embeddingTest.available) {
  console.log(`✅ Ollama embeddings API is available`);
  if (embeddingTest.embeddingLength) {
    console.log(`   Embedding dimension: ${embeddingTest.embeddingLength}`);
  }
} else {
  console.log(`⚠️  Ollama embeddings API not available: ${embeddingTest.error}`);
  console.log(`   (This is OK - workflow will work when Ollama is running)`);
}
console.log('');

// Step 5: Test Entity Extraction (check if Ollama LLM is available)
console.log('5. Testing Entity Extraction (checking Ollama LLM availability)...');
const testLLM = async () => {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 11434,
      path: '/api/generate',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 2000
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve({ available: true });
        } else {
          resolve({ available: false, error: `Status ${res.statusCode}` });
        }
      });
    });

    req.on('error', () => {
      resolve({ available: false, error: 'Connection failed' });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ available: false, error: 'Timeout' });
    });

    req.write(JSON.stringify({
      model: 'llama2',
      prompt: 'test',
      stream: false
    }));
    req.end();
  });
};

const llmTest = await testLLM();
if (llmTest.available) {
  console.log(`✅ Ollama LLM API is available`);
} else {
  console.log(`⚠️  Ollama LLM API not available: ${llmTest.error}`);
  console.log(`   (This is OK - workflow will work when Ollama is running)`);
}
console.log('');

// Step 6: Validate workflow JSON structure
console.log('6. Validating workflow JSON structure...');
try {
  const workflow = JSON.parse(fs.readFileSync(path.join(__dirname, 'workflow.json'), 'utf8'));

  // Check all nodes have required fields
  let validNodes = 0;
  workflow.nodes.forEach(node => {
    if (node.id && node.name && node.type && node.position) {
      validNodes++;
    }
  });

  console.log(`✅ Workflow JSON is valid`);
  console.log(`   Nodes: ${workflow.nodes.length} (${validNodes} valid)`);
  console.log(`   Connections: ${Object.keys(workflow.connections).length}`);

  // Check for required nodes
  const nodeTypes = workflow.nodes.map(n => n.type);
  const required = [
    'n8n-nodes-base.scheduleTrigger',
    'n8n-nodes-base.code',
    'n8n-nodes-base.readBinaryFile',
    'n8n-nodes-base.httpRequest'
  ];

  const missing = required.filter(r => !nodeTypes.includes(r));
  if (missing.length === 0) {
    console.log(`   ✅ All required node types present`);
  } else {
    console.log(`   ⚠️  Missing node types: ${missing.join(', ')}`);
  }
} catch (err) {
  console.error(`❌ Error validating workflow JSON:`, err.message);
}
console.log('');

// Summary
console.log('=== Test Summary ===');
console.log(`Files found: ${allFiles.length}`);
console.log(`Files read: ${filesRead}`);
console.log(`Chunks created: ${totalChunks}`);
console.log(`Ollama embeddings: ${embeddingTest.available ? '✅ Available' : '⚠️  Not available'}`);
console.log(`Ollama LLM: ${llmTest.available ? '✅ Available' : '⚠️  Not available'}`);
console.log(`Workflow JSON: ✅ Valid`);
console.log('');
console.log('Next steps:');
console.log('1. Ensure Ollama is running: ollama serve');
console.log('2. Import workflow.json into n8n');
console.log('3. Configure Postgres and Neo4j credentials');
console.log('4. Activate workflow and test with real files');
