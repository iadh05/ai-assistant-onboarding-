import { EventBus } from './event-bus.js';
/**
 * Cache Event Types
 * Using namespaced events (domain:action) for clarity
 */
export type CacheEventType = 'documents:changed' | 'cache:clear-all' | 'cache:invalidate';
/**
 * CacheEventBus - Handles all cache-related events
 *
 * WHY A SEPARATE CLASS?
 * =====================
 * - Events are organized by domain (cache events separate from user events)
 * - Type-safe event names and handlers
 * - Easy to mock in tests
 * - Single responsibility principle
 * - Service identification for observability/debugging
 *
 * USAGE:
 * ======
 * ```typescript
 * // Publisher (e.g., DocumentService)
 * import { cacheEventBus } from '@onboarding/events';
 * cacheEventBus.emitDocumentsChanged('DocumentService');
 *
 * // Subscriber (e.g., ChatService)
 * import { cacheEventBus } from '@onboarding/events';
 * cacheEventBus.onDocumentsChanged('ChatService', () => {
 *   chatService.clearCache();
 * });
 * ```
 *
 * CONSOLE OUTPUT:
 * ===============
 * [14:32:05.123] [CacheEventBus] 👂 ChatService subscribed to documents:changed
 * [14:32:10.456] [CacheEventBus] 📢 DocumentService emitted documents:changed
 */
export declare class CacheEventBus extends EventBus {
    private static instance;
    private constructor();
    /**
     * Get singleton instance
     * Why singleton? All services need to share the same event bus
     */
    static getInstance(): CacheEventBus;
    /**
     * Emit when documents are added, updated, or deleted
     * This should trigger cache invalidation in subscribers
     * @param emitter - Name of the service emitting the event (for logging)
     */
    emitDocumentsChanged(emitter: string): void;
    /**
     * Emit to clear all caches (nuclear option)
     * @param emitter - Name of the service emitting the event (for logging)
     */
    emitClearAll(emitter: string): void;
    /**
     * Emit selective invalidation with optional key pattern
     * @param emitter - Name of the service emitting the event (for logging)
     * @param pattern - Optional key pattern to invalidate
     */
    emitInvalidate(emitter: string, pattern?: string): void;
    /**
     * Subscribe to document changes
     * @param subscriber - Name of the service subscribing (for logging)
     * @param handler - Callback to invoke when event fires
     */
    onDocumentsChanged(subscriber: string, handler: () => void): void;
    /**
     * Subscribe to clear all events
     * @param subscriber - Name of the service subscribing (for logging)
     * @param handler - Callback to invoke when event fires
     */
    onClearAll(subscriber: string, handler: () => void): void;
    /**
     * Subscribe to selective invalidation
     * @param subscriber - Name of the service subscribing (for logging)
     * @param handler - Callback to invoke when event fires
     */
    onInvalidate(subscriber: string, handler: (pattern?: string) => void): void;
    /**
     * Unsubscribe from document changes
     */
    offDocumentsChanged(handler: () => void): void;
    /**
     * Unsubscribe from clear all
     */
    offClearAll(handler: () => void): void;
}
export declare const cacheEventBus: CacheEventBus;
//# sourceMappingURL=cache-event-bus.d.ts.map