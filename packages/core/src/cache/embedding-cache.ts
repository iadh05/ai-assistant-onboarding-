import { LRUCache, CacheStats } from './lru-cache.js';
import { createHash } from 'crypto';

/**
 * Embedding Cache - Caches embeddings to avoid regenerating them
 *
 * Why cache embeddings?
 * - Embedding generation is relatively slow (API call to Ollama)
 * - Same text always produces same embedding (deterministic)
 * - Queries are often repeated or similar
 *
 * Cache key strategy:
 * - Hash the text content for consistent keys
 * - Different embedding models would need different caches
 */

export class EmbeddingCache {
  private cache: LRUCache<number[]>;

  /**
   * Create an embedding cache
   * @param maxSize Max cached embeddings (default: 500)
   * @param ttlMs Cache TTL in ms (default: 1 hour)
   */
  constructor(maxSize = 500, ttlMs = 60 * 60 * 1000) {
    this.cache = new LRUCache<number[]>(maxSize, ttlMs);
  }

  /**
   * Generate a cache key from text
   */
  private generateKey(text: string): string {
    // Hash for consistent key length and to handle long texts
    return createHash('sha256').update(text).digest('hex').substring(0, 32);
  }

  /**
   * Get cached embedding for text
   */
  get(text: string): number[] | undefined {
    const key = this.generateKey(text);
    const cached = this.cache.get(key);

    if (cached) {
      console.log(`[EmbeddingCache] HIT for text (${text.length} chars)`);
    }

    return cached;
  }

  /**
   * Cache an embedding for text
   */
  set(text: string, embedding: number[]): void {
    const key = this.generateKey(text);
    this.cache.set(key, embedding);
  }

  /**
   * Check if text has cached embedding
   */
  has(text: string): boolean {
    const key = this.generateKey(text);
    return this.cache.has(key);
  }

  /**
   * Clear the cache
   */
  clear(): void {
    this.cache.clear();
    console.log('[EmbeddingCache] Cleared');
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return this.cache.getStats();
  }

  /**
   * Get hit rate percentage
   */
  getHitRate(): number {
    return this.cache.getHitRate();
  }
}
