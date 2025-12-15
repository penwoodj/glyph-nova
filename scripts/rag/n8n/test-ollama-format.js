// Test what Ollama embeddings API format looks like
import http from 'http';

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
      timeout: 3000
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const result = JSON.parse(data);
            console.log('Ollama embeddings response structure:');
            console.log(JSON.stringify(result, null, 2));
            console.log('\nKeys:', Object.keys(result));
            if (result.embedding) {
              console.log('Embedding length:', result.embedding.length);
            }
            resolve({ success: true, data: result });
          } catch (err) {
            resolve({ success: false, error: 'Parse error: ' + err.message, raw: data });
          }
        } else {
          resolve({ success: false, error: `Status ${res.statusCode}`, raw: data });
        }
      });
    });

    req.on('error', (err) => {
      resolve({ success: false, error: 'Connection error: ' + err.message });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ success: false, error: 'Timeout' });
    });

    req.write(JSON.stringify({
      model: 'nomic-embed-text',
      prompt: 'test text'
    }));
    req.end();
  });
};

testEmbedding().then(result => {
  if (!result.success) {
    console.log('⚠️  Ollama not available:', result.error);
    console.log('This is expected if Ollama is not running.');
  }
});
