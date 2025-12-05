import { LRUCache } from './lru-cache.js';
import { createHash } from 'crypto';
/**
 * Query Cache - Generic cache for query responses
 *
 * Why cache queries?
 * - LLM calls are expensive (time + cost)
 * - Same questions often asked repeatedly
 * - Reduces load on LLM provider
 *
 * Cache key strategy:
 * - Hash the normalized question for consistent keys
 * - Normalization: lowercase, trim, collapse whitespace
 *
 * NOTE: This is a generic cache. The response type T is provided by the consumer.
 * Example: QueryCache<ChatResponse> for chat responses
 */
export class QueryCache {
    cache;
    /**
     * Create a query cache
     * @param maxSize Max cached queries (default: 100)
     * @param ttlMs Cache TTL in ms (default: 30 minutes)
     */
    constructor(maxSize = 100, ttlMs = 30 * 60 * 1000) {
        this.cache = new LRUCache(maxSize, ttlMs);
    }
    /**
     * Generate a cache key from a question
     * Normalizes the question for better cache hits
     */
    generateKey(question) {
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
    get(question) {
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
    set(question, response) {
        const key = this.generateKey(question);
        this.cache.set(key, response);
        console.log(`[QueryCache] Cached: "${question.substring(0, 50)}..."`);
    }
    /**
     * Check if question is cached
     */
    has(question) {
        const key = this.generateKey(question);
        return this.cache.has(key);
    }
    /**
     * Clear the cache
     */
    clear() {
        this.cache.clear();
        console.log('[QueryCache] Cleared');
    }
    /**
     * Get cache statistics
     */
    getStats() {
        return this.cache.getStats();
    }
    /**
     * Get hit rate percentage
     */
    getHitRate() {
        return this.cache.getHitRate();
    }
}
//# sourceMappingURL=query-cache.js.map