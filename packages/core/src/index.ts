// Export all services
export { ChatService } from './chat.js';
export type { ChatResponse } from './chat.js';

export { ChunkingService } from './chunking.js';
export type { Chunk } from './chunking.js';

export { VectorStore } from './vectorStore.js';

export { cosineSimilarity } from './utils/similarity.js';

// Ingestion pipeline
export {
  FileValidator,
  fileValidator,
  ContentExtractor,
  contentExtractor,
  TextSanitizer,
  textSanitizer,
  DocumentDeduplicator,
  documentDeduplicator,
} from './ingestion/index.js';
export type {
  ValidationResult,
  AllowedFileType,
  FileValidatorConfig,
  ExtractionResult,
  DocumentMetadata,
  SanitizeResult,
  SanitizeChange,
  SanitizeOptions,
  DeduplicationResult,
} from './ingestion/index.js';

// Re-export from @onboarding/cache for convenience
export { LRUCache, QueryCache, EmbeddingCache, type CacheStats } from '@onboarding/cache';

// Re-export from @onboarding/events for convenience
export { EventBus, CacheEventBus, cacheEventBus, type CacheEventType } from '@onboarding/events';
