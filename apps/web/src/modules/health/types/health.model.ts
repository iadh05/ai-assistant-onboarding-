export interface HealthResponse {
  status: string;
  services: {
    documents: string;
    chat: string;
    system: string;
  };
}
