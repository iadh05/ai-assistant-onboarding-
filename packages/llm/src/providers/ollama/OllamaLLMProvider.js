import { Ollama } from 'ollama';
/**
 * Ollama LLM Provider
 *
 * Uses Ollama for local LLM inference
 * - Free (runs locally)
 * - Private (no data sent to cloud)
 * - Supports multiple models (llama3.2, mistral, etc.)
 */
export class OllamaLLMProvider {
    ollama;
    model;
    constructor(model = 'llama3.2') {
        const ollamaHost = process.env.OLLAMA_HOST || 'http://localhost:11434';
        this.ollama = new Ollama({ host: ollamaHost });
        this.model = model;
    }
    async generate(prompt) {
        const response = await this.ollama.generate({
            model: this.model,
            prompt: prompt,
            stream: false,
        });
        return response.response;
    }
    getModelName() {
        return this.model;
    }
}
//# sourceMappingURL=OllamaLLMProvider.js.map