import { OllamaEmbeddingProvider } from '@onboarding/llm';
import { cosineSimilarity } from '../utils/similarity.js';

async function testEmbeddings() {
  console.log('Testing Embeddings...\n');

  const provider = new OllamaEmbeddingProvider();

  // Test 1: Generate embedding for a simple text
  const text1 = 'Hello world';
  console.log(`Text: "${text1}"`);
  const embedding1 = await provider.generateEmbedding(text1);
  console.log(`Embedding length: ${embedding1.length}`);
  console.log(`First 10 numbers: [${embedding1.slice(0, 10).map(n => n.toFixed(3)).join(', ')}...]\n`);

  // Test 2: Similar texts should have similar embeddings
  const text2 = 'Hi world';
  console.log(`Text: "${text2}"`);
  const embedding2 = await provider.generateEmbedding(text2);
  console.log(`First 10 numbers: [${embedding2.slice(0, 10).map(n => n.toFixed(3)).join(', ')}...]\n`);

  // Test 3: Different text
  const text3 = 'Installing Node.js';
  console.log(`Text: "${text3}"`);
  const embedding3 = await provider.generateEmbedding(text3);
  console.log(`First 10 numbers: [${embedding3.slice(0, 10).map(n => n.toFixed(3)).join(', ')}...]\n`);

  // Test 4: Compare similarities
  console.log('--- Similarity Comparison ---');
  const sim1 = cosineSimilarity(embedding1, embedding2);
  console.log(`"${text1}" vs "${text2}" → ${sim1.toFixed(3)} (should be high - similar meaning)`);

  const sim2 = cosineSimilarity(embedding1, embedding3);
  console.log(`"${text1}" vs "${text3}" → ${sim2.toFixed(3)} (should be low - different meaning)`);

  const sim3 = cosineSimilarity(embedding2, embedding3);
  console.log(`"${text2}" vs "${text3}" → ${sim3.toFixed(3)} (should be low - different meaning)\n`);

  console.log('✅ Embedding test complete!');
}

testEmbeddings().catch(console.error);
