import { CacheStats } from './lru-cache.js';
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
export declare class QueryCache<T = unknown> {
    private cache;
    /**
     * Create a query cache
     * @param maxSize Max cached queries (default: 100)
     * @param ttlMs Cache TTL in ms (default: 30 minutes)
     */
    constructor(maxSize?: number, ttlMs?: number);
    /**
     * Generate a cache key from a question
     * Normalizes the question for better cache hits
     */
    private generateKey;
    /**
     * Get cached response for a question
     */
    get(question: string): T | undefined;
    /**
     * Cache a response for a question
     */
    set(question: string, response: T): void;
    /**
     * Check if question is cached
     */
    has(question: string): boolean;
    /**
     * Clear the cache
     */
    clear(): void;
    /**
     * Get cache statistics
     */
    getStats(): CacheStats;
    /**
     * Get hit rate percentage
     */
    getHitRate(): number;
}
//# sourceMappingURL=query-cache.d.ts.map