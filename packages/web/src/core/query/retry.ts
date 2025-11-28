import type { AxiosError } from 'axios';

const RETRYABLE_STATUS_CODES = new Set([
  408, // Request Timeout
  429, // Too Many Requests
  500, // Internal Server Error
  502, // Bad Gateway
  503, // Service Unavailable
  504, // Gateway Timeout
  509, // Bandwidth Limit Exceeded
]);

const NON_RETRYABLE_STATUS_CODES = new Set([
  400, // Bad Request
  401, // Unauthorized
  403, // Forbidden
  404, // Not Found
  409, // Conflict
  422, // Unprocessable Entity
]);

const MAX_RETRY_COUNT = 3;

export function shouldRetryRequest(failureCount: number, error: unknown): boolean {
  console.log(`[Retry] Failure count: ${failureCount}`);
  if (failureCount >= MAX_RETRY_COUNT) {
    return false;
  }

  const axiosError = error as AxiosError;
  const status = axiosError?.response?.status;

  if (!status) {
    return true;
  }

  if (NON_RETRYABLE_STATUS_CODES.has(status)) {
    return false;
  }

  if (RETRYABLE_STATUS_CODES.has(status)) {
    return true;
  }

  return status >= 500;
}

export function getRetryDelay(failureCount: number, error: unknown): number {
  const axiosError = error as AxiosError;
  const retryAfter = axiosError?.response?.headers?.['retry-after'];

  if (retryAfter) {
    const seconds = parseInt(retryAfter, 10);
    if (!isNaN(seconds)) {
      return seconds * 1000;
    }
  }

  return Math.min(1000 * Math.pow(2, failureCount), 30000);
}
