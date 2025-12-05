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
export declare class OllamaEmbeddingProvider implements EmbeddingProvider {
    private ollama;
    private model;
    private dimensions;
    constructor();
    generateEmbedding(text: string): Promise<number[]>;
    getDimensions(): number;
    getModelName(): string;
}
//# sourceMappingURL=OllamaEmbeddingProvider.d.ts.map