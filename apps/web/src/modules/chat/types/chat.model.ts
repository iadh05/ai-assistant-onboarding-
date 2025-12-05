// Re-export from shared package for type consistency
export type {
  Source,
  Message,
  ChatRequest,
  ChatResponse,
} from '@onboarding/shared';

// Re-export schemas if needed for runtime validation
export {
  SourceSchema,
  MessageSchema,
  ChatRequestSchema,
  ChatResponseSchema,
} from '@onboarding/shared';
