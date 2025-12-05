import { EventBus, timestamp } from './event-bus.js';
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
export class CacheEventBus extends EventBus {
    static instance;
    constructor() {
        super();
    }
    /**
     * Get singleton instance
     * Why singleton? All services need to share the same event bus
     */
    static getInstance() {
        if (!CacheEventBus.instance) {
            CacheEventBus.instance = new CacheEventBus();
        }
        return CacheEventBus.instance;
    }
    // ============================================
    // EMITTERS (called by publishers)
    // ============================================
    /**
     * Emit when documents are added, updated, or deleted
     * This should trigger cache invalidation in subscribers
     * @param emitter - Name of the service emitting the event (for logging)
     */
    emitDocumentsChanged(emitter) {
        console.log(`[${timestamp()}] [CacheEventBus] 📢 ${emitter} emitted documents:changed`);
        this.emit('documents:changed');
    }
    /**
     * Emit to clear all caches (nuclear option)
     * @param emitter - Name of the service emitting the event (for logging)
     */
    emitClearAll(emitter) {
        console.log(`[${timestamp()}] [CacheEventBus] 📢 ${emitter} emitted cache:clear-all`);
        this.emit('cache:clear-all');
    }
    /**
     * Emit selective invalidation with optional key pattern
     * @param emitter - Name of the service emitting the event (for logging)
     * @param pattern - Optional key pattern to invalidate
     */
    emitInvalidate(emitter, pattern) {
        console.log(`[${timestamp()}] [CacheEventBus] 📢 ${emitter} emitted cache:invalidate (pattern: ${pattern || '*'})`);
        this.emit('cache:invalidate', pattern);
    }
    // ============================================
    // SUBSCRIBERS (called by listeners)
    // ============================================
    /**
     * Subscribe to document changes
     * @param subscriber - Name of the service subscribing (for logging)
     * @param handler - Callback to invoke when event fires
     */
    onDocumentsChanged(subscriber, handler) {
        this.subscribe('documents:changed', handler);
        console.log(`[${timestamp()}] [CacheEventBus] 👂 ${subscriber} subscribed to documents:changed`);
    }
    /**
     * Subscribe to clear all events
     * @param subscriber - Name of the service subscribing (for logging)
     * @param handler - Callback to invoke when event fires
     */
    onClearAll(subscriber, handler) {
        this.subscribe('cache:clear-all', handler);
        console.log(`[${timestamp()}] [CacheEventBus] 👂 ${subscriber} subscribed to cache:clear-all`);
    }
    /**
     * Subscribe to selective invalidation
     * @param subscriber - Name of the service subscribing (for logging)
     * @param handler - Callback to invoke when event fires
     */
    onInvalidate(subscriber, handler) {
        this.subscribe('cache:invalidate', handler);
        console.log(`[${timestamp()}] [CacheEventBus] 👂 ${subscriber} subscribed to cache:invalidate`);
    }
    // ============================================
    // UNSUBSCRIBE (for cleanup)
    // ============================================
    /**
     * Unsubscribe from document changes
     */
    offDocumentsChanged(handler) {
        this.unsubscribe('documents:changed', handler);
    }
    /**
     * Unsubscribe from clear all
     */
    offClearAll(handler) {
        this.unsubscribe('cache:clear-all', handler);
    }
}
// Export singleton instance for convenience
export const cacheEventBus = CacheEventBus.getInstance();
//# sourceMappingURL=cache-event-bus.js.map