import { ChunkingService } from '../chunking.js';
import { VectorStore } from '../vectorStore.js';
import { OllamaEmbeddingProvider } from '@onboarding/llm';

const sampleDoc = `# Getting Started

## Installation

To install Node.js, visit nodejs.org and download the installer.

## Configuration

After installing, configure your environment variables and PATH.

## First Project

Create your first Node.js project with npm init.`;

async function testVectorStore() {
  console.log('Testing Vector Store...\n');

  // Step 1: Create chunks
  const chunker = new ChunkingService();
  const chunks = chunker.chunkDocument(sampleDoc, 'getting-started.md');
  console.log(`Created ${chunks.length} chunks\n`);

  // Step 2: Create embedding provider and vector store
  const embeddingProvider = new OllamaEmbeddingProvider();
  const vectorStore = new VectorStore(embeddingProvider, './test-vector-store.json');
  await vectorStore.addChunks(chunks);

  // Step 3: Search
  console.log('\n--- Testing Search ---');
  await vectorStore.search('How do I install Node?', 3);

  await vectorStore.search('How to create a project?', 3);

  // Step 4: Save
  console.log('\n--- Saving ---');
  await vectorStore.save();

  console.log('\n✅ Vector store test complete!');
}

testVectorStore().catch(console.error);
