import { LLMProvider, PromptBuilder } from '@onboarding/llm';
import { VectorStore } from './vectorStore.js';
import { Chunk } from './chunking.js';
import { QueryCache, type CacheStats } from './cache/index.js';

/**
 * Chat response with sources
 */
export interface ChatResponse {
  answer: string;
  sources: Chunk[];
  cached?: boolean; // Flag to indicate if response was from cache
}

/**
 * Chat Service - Implements RAG pattern with caching
 *
 * RAG = Retrieval Augmented Generation
 * 1. Check cache for existing answer
 * 2. Retrieve relevant docs from vector store
 * 3. Augment user query with retrieved context (XML-formatted)
 * 4. Generate answer using LLM with context
 * 5. Cache the response for future queries
 *
 * Now uses dependency injection:
 * - LLMProvider: Easy to swap LLMs (Ollama, OpenAI, Claude)
 * - PromptBuilder: XML-formatted prompts for clarity
 * - QueryCache: Caches responses for identical questions
 */
export class ChatService {
  private llmProvider: LLMProvider;
  private vectorStore: VectorStore;
  private promptBuilder: PromptBuilder;
  private queryCache: QueryCache;
  private topK = 5; // Number of chunks to retrieve

  constructor(vectorStore: VectorStore, llmProvider: LLMProvider) {
    this.vectorStore = vectorStore;
    this.llmProvider = llmProvider;
    this.promptBuilder = new PromptBuilder();
    this.queryCache = new QueryCache(); // 100 entries, 30 min TTL
  }

  /**
   * Ask a question and get an answer grounded in your documentation
   *
   * This is the core RAG implementation with caching
   */
  async ask(question: string): Promise<ChatResponse> {
    console.log(`\n🔍 Question: "${question}"\n`);

    // Step 0: CHECK CACHE - Return cached response if available
    const cachedResponse = this.queryCache.get(question);
    if (cachedResponse) {
      console.log('⚡ Returning cached response\n');
      return { ...cachedResponse, cached: true };
    }

    // Step 1: RETRIEVAL - Find relevant documentation chunks
    const sources = await this.vectorStore.search(question, this.topK);

    if (sources.length === 0) {
      return {
        answer: "I don't have any documentation to answer that question. Please add some documents first.",
        sources: [],
      };
    }

    // Step 2: AUGMENTATION - Build XML-formatted prompt with context
    const prompt = this.promptBuilder.buildRAGPrompt(question, sources);

    // Step 3: GENERATION - Ask LLM with context
    console.log('🤖 Generating answer...\n');

    const answer = await this.llmProvider.generate(prompt);

    const response: ChatResponse = {
      answer,
      sources,
    };

    // Step 4: CACHE - Store response for future identical queries
    this.queryCache.set(question, response);

    return response;
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): CacheStats {
    return this.queryCache.getStats();
  }

  /**
   * Clear the query cache
   */
  clearCache(): void {
    this.queryCache.clear();
  }
}
