/**
 * @onboarding/events
 *
 * Generic EventBus layer for pub/sub communication.
 * Extend EventBus to create domain-specific event buses.
 *
 * Architecture:
 * ┌─────────────────────────────────────────────┐
 * │            EventBus (abstract)              │
 * │      Generic pub/sub base class             │
 * └─────────────────────────────────────────────┘
 *                     │
 *         ┌──────────┴──────────┐
 *         ▼                     ▼
 *   CacheEventBus        (Future: UserEventBus)
 *   - documents:changed  - user:login
 *   - cache:clear-all    - user:logout
 *   - cache:invalidate   - user:updated
 */

// Base class for creating custom event buses
export { EventBus, timestamp } from './event-bus.js';

// Cache-specific event bus
export {
  CacheEventBus,
  cacheEventBus,
  type CacheEventType,
} from './cache-event-bus.js';
