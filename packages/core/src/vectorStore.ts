import { promises as fs } from 'fs';
import { EmbeddingProvider } from '@onboarding/llm';
import { EmbeddingCache } from '@onboarding/cache';
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
 *
 * Performance optimization:
 * - Tracks file modification time to avoid unnecessary reloads
 * - Only reloads from disk when the file has actually changed
 */
export class VectorStore {
  private chunks: StoredChunk[] = [];
  private embeddingProvider: EmbeddingProvider;
  private storePath: string;
  private lastModifiedTime: number = 0; // Track file modification time
  private embeddingCache: EmbeddingCache; // Cache for query embeddings

  constructor(embeddingProvider: EmbeddingProvider, storePath = './vector-store.json') {
    this.embeddingProvider = embeddingProvider;
    this.storePath = storePath;
    this.embeddingCache = new EmbeddingCache(); // 500 embeddings, 24h TTL (default)
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

    // Check cache first for query embedding
    let queryEmbedding = this.embeddingCache.get(query);

    if (!queryEmbedding) {
      // Cache miss - generate and store
      queryEmbedding = await this.embeddingProvider.generateEmbedding(query);
      this.embeddingCache.set(query, queryEmbedding);
    }

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

      // Track the file's modification time
      const stats = await fs.stat(this.storePath);
      this.lastModifiedTime = stats.mtimeMs;

      console.log(`Loaded ${this.chunks.length} chunks from ${this.storePath}`);
    } catch (error) {
      console.log('No existing vector store found, starting fresh');
    }
  }

  /**
   * Reload from disk only if the file has changed
   * Returns true if reload was needed, false if skipped
   */
  async reloadIfChanged(): Promise<boolean> {
    try {
      const stats = await fs.stat(this.storePath);

      // Only reload if file was modified since last load
      if (stats.mtimeMs > this.lastModifiedTime) {
        console.log('[VectorStore] File changed, reloading...');
        await this.load();
        return true;
      }

      // File hasn't changed, skip reload
      return false;
    } catch (error) {
      // File doesn't exist - nothing to reload
      return false;
    }
  }

  /**
   * Get the number of chunks currently stored
   */
  getChunkCount(): number {
    return this.chunks.length;
  }

  /**
   * Get embedding cache statistics
   */
  getEmbeddingCacheStats() {
    return this.embeddingCache.getStats();
  }

  /**
   * Get embedding cache hit rate
   */
  getEmbeddingCacheHitRate(): number {
    return this.embeddingCache.getHitRate();
  }

  /**
   * Clear embedding cache
   */
  clearEmbeddingCache(): void {
    this.embeddingCache.clear();
  }
}
