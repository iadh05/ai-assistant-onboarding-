import { LLMProvider } from '../LLMProvider.js';
/**
 * Ollama LLM Provider
 *
 * Uses Ollama for local LLM inference
 * - Free (runs locally)
 * - Private (no data sent to cloud)
 * - Supports multiple models (llama3.2, mistral, etc.)
 */
export declare class OllamaLLMProvider implements LLMProvider {
    private ollama;
    private model;
    constructor(model?: string);
    generate(prompt: string): Promise<string>;
    getModelName(): string;
}
//# sourceMappingURL=OllamaLLMProvider.d.ts.map