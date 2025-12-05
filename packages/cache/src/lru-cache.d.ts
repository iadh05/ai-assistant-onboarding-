/**
 * LRU Cache with TTL (Time To Live)
 *
 * Senior Engineer Pattern: LRU + TTL Cache
 * - LRU: Evicts least recently used items when full
 * - TTL: Items expire after a set time
 * - O(1) get/set operations using Map (maintains insertion order)
 *
 * Why this design?
 * - Memory bounded (maxSize prevents OOM)
 * - Time bounded (TTL ensures freshness)
 * - Fast lookups (Map is O(1))
 *
 * Used by: Redis, Memcached, browser caches, CDNs
 */
export interface CacheStats {
    hits: number;
    misses: number;
    size: number;
    maxSize: number;
}
export declare class LRUCache<T> {
    private cache;
    private maxSize;
    private ttlMs;
    private hits;
    private misses;
    /**
     * Create a new LRU cache
     * @param maxSize Maximum number of entries (default: 100)
     * @param ttlMs Time to live in milliseconds (default: 1 hour)
     */
    constructor(maxSize?: number, ttlMs?: number);
    /**
     * Get a value from cache
     * Returns undefined if not found or expired
     */
    get(key: string): T | undefined;
    /**
     * Set a value in cache
     */
    set(key: string, value: T): void;
    /**
     * Check if key exists and is not expired
     */
    has(key: string): boolean;
    /**
     * Delete a specific key
     */
    delete(key: string): boolean;
    /**
     * Clear all entries
     */
    clear(): void;
    /**
     * Get cache statistics
     */
    getStats(): CacheStats;
    /**
     * Get hit rate as percentage
     */
    getHitRate(): number;
}
//# sourceMappingURL=lru-cache.d.ts.map