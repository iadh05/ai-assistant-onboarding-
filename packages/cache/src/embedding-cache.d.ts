import { CacheStats } from './lru-cache.js';
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
 *
 * TTL Consideration:
 * - Embeddings are deterministic (same text = same embedding)
 * - TTL can be long (24h+) since embeddings don't change
 * - Only need to invalidate if embedding MODEL changes
 */
export declare class EmbeddingCache {
    private cache;
    /**
     * Create an embedding cache
     * @param maxSize Max cached embeddings (default: 500)
     * @param ttlMs Cache TTL in ms (default: 24 hours - embeddings are stable)
     */
    constructor(maxSize?: number, ttlMs?: number);
    /**
     * Generate a cache key from text
     */
    private generateKey;
    /**
     * Get cached embedding for text
     */
    get(text: string): number[] | undefined;
    /**
     * Cache an embedding for text
     */
    set(text: string, embedding: number[]): void;
    /**
     * Check if text has cached embedding
     */
    has(text: string): boolean;
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
//# sourceMappingURL=embedding-cache.d.ts.map