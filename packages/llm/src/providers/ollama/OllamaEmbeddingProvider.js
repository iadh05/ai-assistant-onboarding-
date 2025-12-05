import { Ollama } from 'ollama';
/**
 * Ollama Embedding Provider
 *
 * Uses Ollama's nomic-embed-text model for local embeddings
 * - Free (runs locally)
 * - Fast
 * - 768 dimensions
 * - Good quality for general use
 */
export class OllamaEmbeddingProvider {
    ollama;
    model = 'nomic-embed-text';
    dimensions = 768;
    constructor() {
        const ollamaHost = process.env.OLLAMA_HOST || 'http://localhost:11434';
        this.ollama = new Ollama({ host: ollamaHost });
    }
    async generateEmbedding(text) {
        const response = await this.ollama.embeddings({
            model: this.model,
            prompt: text,
        });
        return response.embedding;
    }
    getDimensions() {
        return this.dimensions;
    }
    getModelName() {
        return this.model;
    }
}
//# sourceMappingURL=OllamaEmbeddingProvider.js.map