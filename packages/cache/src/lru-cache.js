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
export class LRUCache {
    cache;
    maxSize;
    ttlMs;
    hits = 0;
    misses = 0;
    /**
     * Create a new LRU cache
     * @param maxSize Maximum number of entries (default: 100)
     * @param ttlMs Time to live in milliseconds (default: 1 hour)
     */
    constructor(maxSize = 100, ttlMs = 60 * 60 * 1000) {
        this.cache = new Map();
        this.maxSize = maxSize;
        this.ttlMs = ttlMs;
    }
    /**
     * Get a value from cache
     * Returns undefined if not found or expired
     */
    get(key) {
        const entry = this.cache.get(key);
        if (!entry) {
            this.misses++;
            return undefined;
        }
        // Check if expired
        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            this.misses++;
            return undefined;
        }
        // Move to end (most recently used) - Map maintains insertion order
        this.cache.delete(key);
        this.cache.set(key, entry);
        this.hits++;
        return entry.value;
    }
    /**
     * Set a value in cache
     */
    set(key, value) {
        // Delete if exists (to update position)
        if (this.cache.has(key)) {
            this.cache.delete(key);
        }
        // Evict oldest if at capacity
        if (this.cache.size >= this.maxSize) {
            const oldestKey = this.cache.keys().next().value;
            if (oldestKey) {
                this.cache.delete(oldestKey);
            }
        }
        // Add new entry
        this.cache.set(key, {
            value,
            expiresAt: Date.now() + this.ttlMs,
        });
    }
    /**
     * Check if key exists and is not expired
     */
    has(key) {
        const entry = this.cache.get(key);
        if (!entry)
            return false;
        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            return false;
        }
        return true;
    }
    /**
     * Delete a specific key
     */
    delete(key) {
        return this.cache.delete(key);
    }
    /**
     * Clear all entries
     */
    clear() {
        this.cache.clear();
        this.hits = 0;
        this.misses = 0;
    }
    /**
     * Get cache statistics
     */
    getStats() {
        return {
            hits: this.hits,
            misses: this.misses,
            size: this.cache.size,
            maxSize: this.maxSize,
        };
    }
    /**
     * Get hit rate as percentage
     */
    getHitRate() {
        const total = this.hits + this.misses;
        if (total === 0)
            return 0;
        return (this.hits / total) * 100;
    }
}
//# sourceMappingURL=lru-cache.js.map