import { Ollama } from 'ollama';
import { EmbeddingProvider } from '../EmbeddingProvider.js';

/**
 * Ollama Embedding Provider
 *
 * Uses Ollama's nomic-embed-text model for local embeddings
 * - Free (runs locally)
 * - Fast
 * - 768 dimensions
 * - Good quality for general use
 */
export class OllamaEmbeddingProvider implements EmbeddingProvider {
  private ollama: Ollama;
  private model = 'nomic-embed-text';
  private dimensions = 768;

  constructor() {
    const ollamaHost = process.env.OLLAMA_HOST || 'http://localhost:11434';
    this.ollama = new Ollama({ host: ollamaHost });
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const response = await this.ollama.embeddings({
      model: this.model,
      prompt: text,
    });

    return response.embedding;
  }

  getDimensions(): number {
    return this.dimensions;
  }

  getModelName(): string {
    return this.model;
  }
}
