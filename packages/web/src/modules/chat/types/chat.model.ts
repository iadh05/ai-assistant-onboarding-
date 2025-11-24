// Chat-related types
export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface Source {
  content: string;
  score: number;
}

export interface ChatResponse {
  answer: string;
  sources: Source[];
}

export interface ChatRequest {
  question: string;
  top_k?: number;
}
