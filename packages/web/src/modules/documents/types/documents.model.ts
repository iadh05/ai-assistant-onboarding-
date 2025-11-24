// Documents-related types
export interface AddDocumentsRequest {
  content: string[];
}

export interface AddDocumentsResponse {
  message: string;
  count: number;
}
