import { QueryClient } from '@tanstack/react-query';
import { shouldRetryRequest, getRetryDelay } from './retry';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: shouldRetryRequest,
      retryDelay: getRetryDelay,
    },
    mutations: {
      retry: shouldRetryRequest,
      retryDelay: getRetryDelay,
    },
  },
});
