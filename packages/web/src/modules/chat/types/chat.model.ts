// Chat-related types
export interface Source {
  chunk_id: string;
  text: string;
  source: string;
  heading: string;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: Source[]; // Sources are only present for assistant messages
}

export interface ChatResponse {
  answer: string;
  sources: Source[];
}

export interface ChatRequest {
  question: string;
  top_k?: number;
}
