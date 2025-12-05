/**
 * @onboarding/cache
 *
 * Caching layer with LRU eviction and TTL expiration.
 *
 * Architecture:
 * ┌─────────────────────────────────────────────┐
 * │            LRUCache<T> (base)               │
 * │   Generic LRU + TTL cache implementation    │
 * └─────────────────────────────────────────────┘
 *                     │
 *         ┌──────────┴──────────┐
 *         ▼                     ▼
 *   QueryCache<T>         EmbeddingCache
 *   - Chat responses      - Embedding vectors
 *   - 30min TTL default   - 24h TTL default
 *   - 100 entries max     - 500 entries max
 *
 * Usage:
 * ```typescript
 * import { QueryCache, EmbeddingCache } from '@onboarding/cache';
 *
 * // For chat responses
 * const queryCache = new QueryCache<ChatResponse>();
 *
 * // For embeddings
 * const embeddingCache = new EmbeddingCache();
 * ```
 */
export { LRUCache } from './lru-cache.js';
export { QueryCache } from './query-cache.js';
export { EmbeddingCache } from './embedding-cache.js';
//# sourceMappingURL=index.js.map