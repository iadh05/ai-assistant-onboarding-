import type { Response } from 'express';
import { grpcToHttpStatus, getGrpcStatusMessage } from './grpc-status';

interface GrpcError {
  code?: number;
  details?: string;
  message?: string;
}

interface ErrorResponse {
  error: string;
  message: string;
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
    return 503;
  }

  if (error.code !== undefined) {
    return grpcToHttpStatus(error.code);
  }

  return 500;
}

export function handleGrpcError(
  res: Response,
  error: unknown,
  context: string
): void {
  const grpcError = error as GrpcError;

  console.error(`[REST Gateway] ${context}:`, grpcError.message || error);

  const status = getHttpStatus(grpcError);
  const response: ErrorResponse = {
    error: context,
    message: getFriendlyMessage(grpcError),
  };

  res.status(status).json(response);
}
