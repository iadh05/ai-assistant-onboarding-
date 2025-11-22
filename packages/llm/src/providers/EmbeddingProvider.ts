/**
 * Embedding Provider Interface
 *
 * Allows swapping between different embedding models:
 * - Ollama (nomic-embed-text) - local, free
 * - OpenAI (text-embedding-3-small) - cloud, paid
 * - Cohere - specialized for multilingual
 *
 * All embeddings must have same dimensions for a given vector store!
 */
export interface EmbeddingProvider {
  /**
   * Convert text to embedding vector
   *
   * @param text - The text to embed
   * @returns Array of numbers representing the text's meaning
   */
  generateEmbedding(text: string): Promise<number[]>;

  /**
   * Get embedding dimensions
   *
   * Important: All embeddings in a vector store must have same dimensions!
   * - nomic-embed-text: 768 dimensions
   * - text-embedding-3-small: 1536 dimensions
   */
  getDimensions(): number;

  /**
   * Get the model name
   */
  getModelName(): string;
}
