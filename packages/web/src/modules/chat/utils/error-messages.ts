import type { AxiosError } from 'axios';

const ERROR_MESSAGES: Record<number | string, string> = {
  400: 'Invalid request. Please check your input and try again.',
  401: 'You need to be logged in to use this feature.',
  403: 'You don\'t have permission to perform this action.',
  404: 'The requested resource was not found.',
  408: 'Request timed out. Please try again.',
  409: 'Conflict with current state. Please refresh and try again.',
  422: 'Unable to process your request. Please check the format.',
  429: 'Too many requests. Please wait a moment and try again.',
  500: 'Something went wrong on our end. Please try again later.',
  502: 'Service temporarily unavailable. Please try again in a few moments.',
  503: 'Service is currently unavailable. Please try again later.',
  504: 'Request timed out. The server is taking too long to respond.',
  TIMEOUT: 'Request timed out. The server took too long to respond.',
  NETWORK: 'Unable to connect. Please check your internet connection.',
  OLLAMA_DOWN: 'AI service is not responding. Please ensure Ollama is running.',
  DEFAULT: 'Something went wrong. Please try again.',
};

export function getErrorMessage(error: unknown): string {
  const axiosError = error as AxiosError<{ message?: string; error?: string }>;

  if (axiosError.code === 'ECONNABORTED' || axiosError.message?.includes('timeout')) {
    return ERROR_MESSAGES.TIMEOUT;
  }

  if (axiosError.message?.includes('Network Error') || axiosError.code === 'ERR_NETWORK') {
    return ERROR_MESSAGES.NETWORK;
  }

  const status = axiosError.response?.status;
  if (status && ERROR_MESSAGES[status]) {
    return ERROR_MESSAGES[status];
  }

  const serverMessage = axiosError.response?.data?.message || axiosError.response?.data?.error;
  if (serverMessage) {
    if (serverMessage.toLowerCase().includes('ollama') || serverMessage.toLowerCase().includes('econnrefused')) {
      return ERROR_MESSAGES.OLLAMA_DOWN;
    }
    return serverMessage;
  }

  return ERROR_MESSAGES.DEFAULT;
}
