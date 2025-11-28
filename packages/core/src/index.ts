// Export all services
export { ChatService } from './chat.js';
export type { ChatResponse } from './chat.js';

export { ChunkingService } from './chunking.js';
export type { Chunk } from './chunking.js';

export { VectorStore } from './vectorStore.js';

export { cosineSimilarity } from './utils/similarity.js';

// Re-export from @onboarding/cache for convenience
export { LRUCache, QueryCache, EmbeddingCache, type CacheStats } from '@onboarding/cache';

// Re-export from @onboarding/events for convenience
export { EventBus, CacheEventBus, cacheEventBus, type CacheEventType } from '@onboarding/events';
