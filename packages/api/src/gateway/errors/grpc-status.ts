export const GrpcStatus = {
  OK: 0,
  CANCELLED: 1,
  UNKNOWN: 2,
  INVALID_ARGUMENT: 3,
  DEADLINE_EXCEEDED: 4,
  NOT_FOUND: 5,
  ALREADY_EXISTS: 6,
  PERMISSION_DENIED: 7,
  RESOURCE_EXHAUSTED: 8,
  FAILED_PRECONDITION: 9,
  ABORTED: 10,
  OUT_OF_RANGE: 11,
  UNIMPLEMENTED: 12,
  INTERNAL: 13,
  UNAVAILABLE: 14,
  DATA_LOSS: 15,
  UNAUTHENTICATED: 16,
} as const;

export type GrpcStatusCode = (typeof GrpcStatus)[keyof typeof GrpcStatus];

const GRPC_TO_HTTP: Record<GrpcStatusCode, number> = {
  [GrpcStatus.OK]: 200,
  [GrpcStatus.CANCELLED]: 499,
  [GrpcStatus.UNKNOWN]: 500,
  [GrpcStatus.INVALID_ARGUMENT]: 400,
  [GrpcStatus.DEADLINE_EXCEEDED]: 504,
  [GrpcStatus.NOT_FOUND]: 404,
  [GrpcStatus.ALREADY_EXISTS]: 409,
  [GrpcStatus.PERMISSION_DENIED]: 403,
  [GrpcStatus.RESOURCE_EXHAUSTED]: 429,
  [GrpcStatus.FAILED_PRECONDITION]: 400,
  [GrpcStatus.ABORTED]: 409,
  [GrpcStatus.OUT_OF_RANGE]: 400,
  [GrpcStatus.UNIMPLEMENTED]: 501,
  [GrpcStatus.INTERNAL]: 500,
  [GrpcStatus.UNAVAILABLE]: 503,
  [GrpcStatus.DATA_LOSS]: 500,
  [GrpcStatus.UNAUTHENTICATED]: 401,
};

const GRPC_STATUS_MESSAGES: Record<GrpcStatusCode, string> = {
  [GrpcStatus.OK]: 'Success',
  [GrpcStatus.CANCELLED]: 'Request was cancelled.',
  [GrpcStatus.UNKNOWN]: 'An unexpected error occurred.',
  [GrpcStatus.INVALID_ARGUMENT]: 'Invalid request. Please check your input.',
  [GrpcStatus.DEADLINE_EXCEEDED]: 'Request timed out. Please try again.',
  [GrpcStatus.NOT_FOUND]: 'The requested resource was not found.',
  [GrpcStatus.ALREADY_EXISTS]: 'This resource already exists.',
  [GrpcStatus.PERMISSION_DENIED]: 'You don\'t have permission to perform this action.',
  [GrpcStatus.RESOURCE_EXHAUSTED]: 'Too many requests. Please wait and try again.',
  [GrpcStatus.FAILED_PRECONDITION]: 'Operation cannot be performed in current state.',
  [GrpcStatus.ABORTED]: 'Operation was aborted due to a conflict.',
  [GrpcStatus.OUT_OF_RANGE]: 'Value is out of acceptable range.',
  [GrpcStatus.UNIMPLEMENTED]: 'This feature is not yet available.',
  [GrpcStatus.INTERNAL]: 'Something went wrong on our end.',
  [GrpcStatus.UNAVAILABLE]: 'Service is temporarily unavailable.',
  [GrpcStatus.DATA_LOSS]: 'Data integrity error occurred.',
  [GrpcStatus.UNAUTHENTICATED]: 'Authentication required.',
};

export function grpcToHttpStatus(grpcCode: number): number {
  if (grpcCode in GRPC_TO_HTTP) {
    return GRPC_TO_HTTP[grpcCode as GrpcStatusCode];
  }
  return 500;
}

export function getGrpcStatusMessage(grpcCode: number): string {
  if (grpcCode in GRPC_STATUS_MESSAGES) {
    return GRPC_STATUS_MESSAGES[grpcCode as GrpcStatusCode];
  }
  return 'An unexpected error occurred.';
}
