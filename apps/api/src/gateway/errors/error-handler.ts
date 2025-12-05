import type { Response } from 'express';
import { HTTP_STATUS, type ApiError } from '@onboarding/shared';
import { grpcToHttpStatus, getGrpcStatusMessage } from './grpc-status.js';

interface GrpcError {
  code?: number;
  details?: string;
  message?: string;
}

function isConnectionError(error: GrpcError): boolean {
  return error.message?.includes('ECONNREFUSED') ?? false;
}

function getFriendlyMessage(error: GrpcError): string {
  if (isConnectionError(error)) {
    return 'Service is temporarily unavailable. Please try again later.';
  }

  if (error.code !== undefined) {
    return getGrpcStatusMessage(error.code);
  }

  if (error.details) {
    return error.details;
  }

  return error.message || 'An unexpected error occurred.';
}

function getHttpStatus(error: GrpcError): number {
  if (isConnectionError(error)) {
    return HTTP_STATUS.SERVICE_UNAVAILABLE;
  }

  if (error.code !== undefined) {
    return grpcToHttpStatus(error.code);
  }

  return HTTP_STATUS.INTERNAL_SERVER_ERROR;
}

export function handleGrpcError(
  res: Response,
  error: unknown,
  context: string
): void {
  const grpcError = error as GrpcError;

  console.error(`[REST Gateway] ${context}:`, grpcError.message || error);

  const status = getHttpStatus(grpcError);
  const response: ApiError = {
    error: context,
    message: getFriendlyMessage(grpcError),
  };

  res.status(status).json(response);
}
