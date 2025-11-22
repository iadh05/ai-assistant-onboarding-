import { Ollama } from 'ollama';
import { LLMProvider } from '../LLMProvider.js';

/**
 * Ollama LLM Provider
 *
 * Uses Ollama for local LLM inference
 * - Free (runs locally)
 * - Private (no data sent to cloud)
 * - Supports multiple models (llama3.2, mistral, etc.)
 */
export class OllamaLLMProvider implements LLMProvider {
  private ollama: Ollama;
  private model: string;

  constructor(model = 'llama3.2') {
    const ollamaHost = process.env.OLLAMA_HOST || 'http://localhost:11434';
    this.ollama = new Ollama({ host: ollamaHost });
    this.model = model;
  }

  async generate(prompt: string): Promise<string> {
    const response = await this.ollama.generate({
      model: this.model,
      prompt: prompt,
      stream: false,
    });

    return response.response;
  }

  getModelName(): string {
    return this.model;
  }
}
