#!/usr/bin/env node

/**
 * Test script for n8n RAG workflow
 * Validates workflow structure and tests individual node logic
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load workflow
const workflowPath = path.join(__dirname, 'workflow.json');
const workflow = JSON.parse(fs.readFileSync(workflowPath, 'utf8'));

console.log('=== Testing n8n RAG Workflow ===\n');

// Test 1: Validate workflow structure
console.log('1. Validating workflow structure...');
if (!workflow.nodes || !Array.isArray(workflow.nodes)) {
  console.error('❌ Workflow missing nodes array');
  process.exit(1);
}
if (!workflow.connections || typeof workflow.connections !== 'object') {
  console.error('❌ Workflow missing connections object');
  process.exit(1);
}
console.log(`✅ Workflow has ${workflow.nodes.length} nodes`);
console.log(`✅ Workflow has ${Object.keys(workflow.connections).length} connection groups\n`);

// Test 2: Test file listing logic
console.log('2. Testing file listing logic...');
const watchFolder = process.env.WATCH_FOLDER || '/home/jon/code/glyph-nova/scripts/rag';
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

const files = getAllFiles(watchFolder);
console.log(`✅ Found ${files.length} files to process`);
if (files.length > 0) {
  console.log(`   Sample files: ${files.slice(0, 3).join(', ')}`);
}
console.log('');

// Test 3: Test chunking logic
console.log('3. Testing chunking logic...');
const testText = 'This is a test document. '.repeat(50); // ~1200 chars
const chunkSize = 500;
const overlap = 50;

const chunks = [];
for (let i = 0; i < testText.length; i += chunkSize - overlap) {
  const chunk = testText.slice(i, i + chunkSize);
  chunks.push({
    chunkText: chunk,
    chunkIndex: Math.floor(i / (chunkSize - overlap)),
    startIndex: i,
    endIndex: i + chunk.length
  });
}

console.log(`✅ Created ${chunks.length} chunks from test text`);
console.log(`   Chunk sizes: ${chunks.map(c => c.chunkText.length).join(', ')}`);
console.log('');

// Test 4: Test file reading
console.log('4. Testing file reading...');
if (files.length > 0) {
  const testFile = files[0];
  try {
    const content = fs.readFileSync(testFile, 'utf8');
    console.log(`✅ Successfully read file: ${path.basename(testFile)}`);
    console.log(`   Size: ${content.length} characters`);
  } catch (err) {
    console.error(`❌ Error reading file ${testFile}:`, err.message);
  }
} else {
  console.log('⚠️  No files found to test reading');
}
console.log('');

// Test 5: Validate node connections
console.log('5. Validating node connections...');
const nodeNames = workflow.nodes.map(n => n.name);
const connectionNodes = new Set();
Object.values(workflow.connections).forEach(connGroup => {
  Object.values(connGroup).forEach(conns => {
    conns.forEach(connArray => {
      connArray.forEach(conn => {
        connectionNodes.add(conn.node);
      });
    });
  });
});

let allConnected = true;
workflow.nodes.forEach(node => {
  if (!connectionNodes.has(node.name) && node.name !== 'Schedule Trigger') {
    console.log(`⚠️  Node "${node.name}" may not be connected`);
    allConnected = false;
  }
});

if (allConnected) {
  console.log('✅ All nodes are properly connected');
}
console.log('');

// Test 6: Check for required nodes
console.log('6. Checking for required nodes...');
const requiredNodeTypes = [
  'n8n-nodes-base.scheduleTrigger',
  'n8n-nodes-base.code',
  'n8n-nodes-base.readBinaryFile',
  'n8n-nodes-base.httpRequest'
];

const foundNodeTypes = new Set(workflow.nodes.map(n => n.type));
requiredNodeTypes.forEach(reqType => {
  if (foundNodeTypes.has(reqType)) {
    console.log(`✅ Found ${reqType}`);
  } else {
    console.log(`⚠️  Missing ${reqType}`);
  }
});
console.log('');

console.log('=== Workflow Test Complete ===');
console.log(`\nTo use this workflow:`);
console.log(`1. Import workflow.json into n8n`);
console.log(`2. Configure Postgres credentials for vector storage`);
console.log(`3. Set WATCH_FOLDER environment variable or update in workflow`);
console.log(`4. Ensure Ollama is running on localhost:11434`);
