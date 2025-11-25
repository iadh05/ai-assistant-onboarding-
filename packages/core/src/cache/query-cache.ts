import { LRUCache, CacheStats } from './lru-cache.js';
import { ChatResponse } from '../chat.js';
import { createHash } from 'crypto';

/**
 * Query Cache - Caches chat responses for identical questions
 *
 * Why cache queries?
 * - LLM calls are expensive (time + cost)
 * - Same questions often asked repeatedly
 * - Reduces load on LLM provider
 *
 * Cache key strategy:
 * - Hash the normalized question for consistent keys
 * - Normalization: lowercase, trim, collapse whitespace
 */

export class QueryCache {
  private cache: LRUCache<ChatResponse>;

  /**
   * Create a query cache
   * @param maxSize Max cached queries (default: 100)
   * @param ttlMs Cache TTL in ms (default: 30 minutes)
   */
  constructor(maxSize = 100, ttlMs = 30 * 60 * 1000) {
    this.cache = new LRUCache<ChatResponse>(maxSize, ttlMs);
  }

  /**
   * Generate a cache key from a question
   * Normalizes the question for better cache hits
   */
  private generateKey(question: string): string {
    // Normalize: lowercase, trim, collapse whitespace
    const normalized = question
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ');

    // Hash for consistent key length
    return createHash('sha256').update(normalized).digest('hex').substring(0, 16);
  }

  /**
   * Get cached response for a question
   */
  get(question: string): ChatResponse | undefined {
    const key = this.generateKey(question);
    const cached = this.cache.get(key);

    if (cached) {
      console.log(`[QueryCache] HIT for: "${question.substring(0, 50)}..."`);
    }

    return cached;
  }

  /**
   * Cache a response for a question
   */
  set(question: string, response: ChatResponse): void {
    const key = this.generateKey(question);
    this.cache.set(key, response);
    console.log(`[QueryCache] Cached: "${question.substring(0, 50)}..."`);
  }

  /**
   * Check if question is cached
   */
  has(question: string): boolean {
    const key = this.generateKey(question);
    return this.cache.has(key);
  }

  /**
   * Clear the cache
   */
  clear(): void {
    this.cache.clear();
    console.log('[QueryCache] Cleared');
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
