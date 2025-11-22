import { ChunkingService } from '../chunking.js';
import { VectorStore } from '../vectorStore.js';
import { ChatService } from '../chat.js';
import { OllamaEmbeddingProvider, OllamaLLMProvider } from '@onboarding/llm';

async function testChat() {
  console.log('=== RAG Chat Test ===\n');

  // Sample documentation
  const docs = `
# Getting Started

Welcome to our platform! This guide will help you get started.

# Installation

To install Node.js:
1. Visit nodejs.org
2. Download the LTS version (recommended)
3. Run the installer
4. Verify by running: node --version

# First Project

Create your first project:
1. Create a new folder: mkdir my-project
2. Navigate into it: cd my-project
3. Initialize npm: npm init -y
4. Install dependencies: npm install express

# Configuration

Configure your environment:
- Create a .env file
- Add your API keys
- Never commit .env to git
- Use .env.example as a template

# Troubleshooting

Common issues:
- If node command not found: Restart your terminal
- If npm install fails: Try clearing cache with npm cache clean --force
- For permission errors on Mac/Linux: Use sudo or fix permissions
`;

  // Step 1: Chunk the documentation
  console.log('📄 Chunking documentation...');
  const chunker = new ChunkingService();
  const chunks = chunker.chunkDocument(docs, 'getting-started.md');
  console.log(`Created ${chunks.length} chunks\n`);

  // Step 2: Create providers
  const embeddingProvider = new OllamaEmbeddingProvider();
  const llmProvider = new OllamaLLMProvider();

  // Step 3: Create vector store and add chunks
  console.log('🔢 Building vector store...');
  const vectorStore = new VectorStore(embeddingProvider, './test-chat-store.json');
  await vectorStore.addChunks(chunks);
  console.log('');

  // Step 4: Create chat service with providers
  const chat = new ChatService(vectorStore, llmProvider);

  // Step 4: Ask questions!
  console.log('='.repeat(60));
  console.log('ASK QUESTIONS');
  console.log('='.repeat(60));

  // Question 1: Direct match
  const response1 = await chat.ask('How do I install Node.js?');
  console.log('📝 ANSWER:\n');
  console.log(response1.answer);
  console.log('\n📚 SOURCES USED:');
  response1.sources.forEach((s, i) => {
    console.log(`  ${i + 1}. ${s.metadata.heading || 'No heading'} (${s.metadata.source})`);
  });

  console.log('\n' + '='.repeat(60) + '\n');

  // Question 2: Requires synthesis from multiple chunks
  const response2 = await chat.ask('What should I do if npm install fails?');
  console.log('📝 ANSWER:\n');
  console.log(response2.answer);
  console.log('\n📚 SOURCES USED:');
  response2.sources.forEach((s, i) => {
    console.log(`  ${i + 1}. ${s.metadata.heading || 'No heading'} (${s.metadata.source})`);
  });

  console.log('\n' + '='.repeat(60) + '\n');

  // Question 3: Not in documentation (should admit it doesn't know)
  const response3 = await chat.ask('How do I deploy to AWS?');
  console.log('📝 ANSWER:\n');
  console.log(response3.answer);
  console.log('\n📚 SOURCES USED:');
  response3.sources.forEach((s, i) => {
    console.log(`  ${i + 1}. ${s.metadata.heading || 'No heading'} (${s.metadata.source})`);
  });

  console.log('\n' + '='.repeat(60));
  console.log('\n✅ RAG Chat test complete!\n');
  console.log('💡 Notice how:');
  console.log('   - The LLM uses retrieved docs to answer');
  console.log('   - It synthesizes info from multiple chunks');
  console.log('   - It admits when info is not in docs');
  console.log('   - You can see which sources it used\n');
}

testChat().catch(console.error);
