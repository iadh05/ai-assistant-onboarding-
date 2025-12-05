export const MESSAGE_ROLES = {
  USER: 'user',
  ASSISTANT: 'assistant',
} as const;

export type MessageRole = (typeof MESSAGE_ROLES)[keyof typeof MESSAGE_ROLES];

export const TIMING = {
  COPY_FEEDBACK_MS: 2000,
} as const;

export const QUICK_ACTIONS = [
  'Summarize document',
  'Key insights',
  'Explain concepts',
  'Find details',
] as const;

export type QuickAction = (typeof QUICK_ACTIONS)[number];
