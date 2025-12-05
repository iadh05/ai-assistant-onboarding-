/**
 * LLM Provider Interface
 *
 * This interface allows swapping between different LLM providers
 * (Ollama, OpenAI, Claude, etc.) without changing business logic.
 *
 * Benefits:
 * - Easy to switch LLMs (just change provider)
 * - Easy to test (use mock provider)
 * - Multi-model support (route based on question type)
 * - Cost optimization (cheap model for simple, expensive for complex)
 */
export interface LLMProvider {
    /**
     * Generate text from a prompt
     *
     * @param prompt - The prompt to send to the LLM
     * @returns The generated response text
     */
    generate(prompt: string): Promise<string>;
    /**
     * Get the model name
     *
     * Useful for logging, debugging, and tracking which model answered
     */
    getModelName(): string;
}
//# sourceMappingURL=LLMProvider.d.ts.map