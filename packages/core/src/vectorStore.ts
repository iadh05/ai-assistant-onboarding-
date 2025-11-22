import { promises as fs } from 'fs';
import { EmbeddingProvider } from '@onboarding/llm';
import { Chunk } from './chunking.js';
import { cosineSimilarity } from './utils/similarity.js';

/**
 * Stored chunk with embedding
 */
interface StoredChunk extends Chunk {
  embedding: number[];
}

/**
 * Vector Store - stores chunks with embeddings and searches them
 *
 * Now uses EmbeddingProvider interface for flexibility:
 * - Easy to swap embedding models (Ollama, OpenAI, etc.)
 * - Dependency injection for testability
 */
export class VectorStore {
  private chunks: StoredChunk[] = [];
  private embeddingProvider: EmbeddingProvider;
  private storePath: string;

  constructor(embeddingProvider: EmbeddingProvider, storePath = './vector-store.json') {
    this.embeddingProvider = embeddingProvider;
    this.storePath = storePath;
  }

  /**
   * Add chunks to the store (generates embeddings)
   */
  async addChunks(chunks: Chunk[]): Promise<void> {
    console.log(`Generating embeddings for ${chunks.length} chunks...`);

    // Generate embeddings for all chunks
    for (const chunk of chunks) {
      const embedding = await this.embeddingProvider.generateEmbedding(chunk.text);

      this.chunks.push({
        ...chunk,
        embedding,
      });
    }

    console.log(`Added ${chunks.length} chunks to vector store`);
  }

  /**
   * Search for similar chunks
   */
  async search(query: string, topK = 5): Promise<Chunk[]> {
    if (this.chunks.length === 0) {
      return [];
    }

    // Convert query to embedding
    const queryEmbedding = await this.embeddingProvider.generateEmbedding(query);

    // Calculate similarity for each chunk
    const results = this.chunks.map(chunk => ({
      chunk,
      score: cosineSimilarity(queryEmbedding, chunk.embedding),
    }));

    // Sort by score (highest first)
    results.sort((a, b) => b.score - a.score);

    // Take top K
    const topResults = results.slice(0, topK);

    // Log results
    console.log(`\nTop ${topK} results for: "${query}"`);
    topResults.forEach((r, i) => {
      console.log(`${i + 1}. Score: ${r.score.toFixed(3)} - ${r.chunk.metadata.heading || 'No heading'}`);
    });

    // Return chunks (without embeddings)
    return topResults.map(r => ({
      id: r.chunk.id,
      text: r.chunk.text,
      metadata: r.chunk.metadata,
    }));
  }

  /**
   * Save to JSON file
   */
  async save(): Promise<void> {
    const data = JSON.stringify(this.chunks, null, 2);
    await fs.writeFile(this.storePath, data, 'utf-8');
    console.log(`Saved ${this.chunks.length} chunks to ${this.storePath}`);
  }

  /**
   * Load from JSON file
   */
  async load(): Promise<void> {
    try {
      const data = await fs.readFile(this.storePath, 'utf-8');
      this.chunks = JSON.parse(data);
      console.log(`Loaded ${this.chunks.length} chunks from ${this.storePath}`);
    } catch (error) {
      console.log('No existing vector store found, starting fresh');
    }
  }
}
