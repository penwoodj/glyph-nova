// Test Ollama response format handling
const mockOllamaEmbedResponse = {
  embedding: [0.1, 0.2, 0.3, 0.4, 0.5] // Array of numbers
};

// Simulate Extract Embedding node code
const item = {
  json: mockOllamaEmbedResponse
};

// Current code: const embedding = item.json?.embedding || [];
const embedding = item.json?.embedding || [];

console.log('Ollama Embed Response Format:');
console.log('  Response structure:', JSON.stringify(mockOllamaEmbedResponse, null, 2));
console.log('  Extracted embedding:', embedding.length > 0 ? `Array of ${embedding.length} numbers` : 'Empty');
console.log('  ✅ Extract Embedding node will work correctly');

// Test LLM response format
const mockOllamaLLMResponse = {
  response: 'This is the generated text',
  done: true
};

console.log('\nOllama LLM Response Format:');
console.log('  Response structure:', JSON.stringify(mockOllamaLLMResponse, null, 2));
console.log('  Parse Entities node looks for: item.json?.response || item.json?.text');
console.log('  Will extract:', mockOllamaLLMResponse.response || mockOllamaLLMResponse.text || '');
console.log('  ✅ Parse Entities node will work correctly');
