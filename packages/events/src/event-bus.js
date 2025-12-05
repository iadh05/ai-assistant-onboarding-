import { EventEmitter } from 'events';
/**
 * Format timestamp for logging
 * Format: HH:MM:SS.mmm (hours:minutes:seconds.milliseconds)
 *
 * WHY THIS FORMAT?
 * ================
 * - Human readable (not Unix timestamp)
 * - Milliseconds for precise event ordering
 * - Compact enough for console output
 *
 * @example
 * timestamp() // "14:32:05.123"
 */
export function timestamp() {
    const now = new Date();
    return now.toISOString().slice(11, 23); // Extract "HH:MM:SS.mmm" from ISO string
}
/**
 * Generic EventBus - Abstract base class for all event emitters
 *
 * WHY THIS PATTERN?
 * =================
 * This is the Observer Pattern (also called Pub/Sub):
 * - Publishers emit events without knowing who's listening
 * - Subscribers react to events without knowing who published
 * - Loose coupling = easier to test, extend, and maintain
 *
 * SINGLETON PATTERN:
 * ==================
 * Each EventBus subclass should be a singleton (one instance per type).
 * This ensures all parts of the app use the same event bus instance.
 *
 * USED BY:
 * ========
 * - React (useState, useEffect)
 * - Redux (dispatch/subscribe)
 * - Node.js streams
 * - DOM events (addEventListener)
 * - Message queues (RabbitMQ, Kafka)
 *
 * HOW TO EXTEND:
 * ==============
 * ```typescript
 * class MyEventBus extends EventBus {
 *   private static instance: MyEventBus;
 *
 *   static getInstance(): MyEventBus {
 *     if (!MyEventBus.instance) {
 *       MyEventBus.instance = new MyEventBus();
 *     }
 *     return MyEventBus.instance;
 *   }
 *
 *   emitMyEvent(data: MyData): void {
 *     this.emit('my:event', data);
 *   }
 *
 *   onMyEvent(handler: (data: MyData) => void): void {
 *     this.subscribe('my:event', handler);
 *   }
 * }
 * ```
 */
export class EventBus extends EventEmitter {
    constructor() {
        super();
        // Set max listeners to avoid memory leak warnings in large apps
        this.setMaxListeners(20);
    }
    /**
     * Subscribe to an event
     * @param event - Event name (use namespaced names like 'cache:clear')
     * @param handler - Function to call when event fires
     */
    subscribe(event, handler) {
        this.on(event, handler);
    }
    /**
     * Subscribe to an event only once (auto-unsubscribes after first call)
     */
    subscribeOnce(event, handler) {
        this.once(event, handler);
    }
    /**
     * Unsubscribe from an event
     */
    unsubscribe(event, handler) {
        this.off(event, handler);
    }
    /**
     * Remove all listeners for an event (use carefully!)
     */
    unsubscribeAll(event) {
        this.removeAllListeners(event);
    }
    /**
     * Get count of listeners for an event (useful for debugging)
     */
    getListenerCount(event) {
        return this.listenerCount(event);
    }
}
//# sourceMappingURL=event-bus.js.map